import type { SceneEngine, TickingEngine } from "./scene-engine";

/**
 * M2 cinema layer — Tier A keyframe engine.
 * Raw WebGL2, `#version 300 es`, GLSL ES 3.00 (integration brief §8.2 VERBATIM
 * shaders — never libraries, never WebGL1, never three.js). One oversized
 * triangle, four textures, depth-displacement parallax with a lerp-landed
 * progress discipline: the shader NEVER sees raw scroll.
 *
 * Aspect law: the canvas keeps a 16:9 backing store and is mounted with CSS
 * `object-fit: cover` — undistorted on every viewport without touching the
 * verbatim shader (which has no aspect uniform by design).
 */

// vert.glsl — §8.2 verbatim
const VERT_SRC = `#version 300 es
layout(location = 0) in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;          // (-1..3) maps to (0..2); edges clamp off-screen
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

// frag.glsl — §8.2 verbatim
const FRAG_SRC = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uColA, uColB;     // RGBA8: start / end keyframe
uniform sampler2D uDepA, uDepB;     // R8: 512w depth maps (1 = near)
uniform float uP;                   // landed local progress 0..1 (lerped in JS)
uniform vec2  uShift;               // signed velocity + pointer parallax, |x|+|y| <= 0.02
uniform float uDisp;                // displacement strength (motion.config: 0.035)
uniform float uZoomMax;             // push-in ceiling (motion.config: 1.12)
uniform float uFade;                // crossfade half-width (motion.config: 0.08 -> +-8%)

vec2 mirrored(vec2 uv) {            // wrap sampler without texture() mirror setup
  vec2 m = mod(uv, 2.0);
  return min(m, 2.0 - m);
}
vec3 layer(sampler2D col, sampler2D dep, vec2 uv, float zoom) {
  vec2 z = (uv - 0.5) / zoom + 0.5;             // push-in (zoom>1 = wider view)
  float d = texture(dep, z).r;
  vec2 su = mirrored(z + uShift * (d - 0.5) * uDisp); // near shifts more -> parallax
  return texture(col, su).rgb;
}
void main() {
  float q    = smoothstep(0.5 - uFade, 0.5 + uFade, uP); // A->B blend
  float zoom = mix(1.0, uZoomMax, uP);                    // slow dolly all chapter
  vec3 a = layer(uColA, uDepA, vUv, zoom);
  vec3 b = layer(uColB, uDepB, vUv, zoom);
  vec3 c = mix(a, b, q);
  c *= 1.0 - 0.18 * distance(vUv, vec2(0.5));             // vignette (matches LUT grade)
  outColor = vec4(c, 1.0);
}
`;

/** Motion rulings (integration brief §5 — hardcode nothing outside these). */
export const CINEMA_MOTION = {
  uDisp: 0.035, // displacement strength
  uZoomMax: 1.12, // per-chapter push-in ceiling
  uFade: 0.08, // A->B crossfade half-width (blend spans uP in [0.42, 0.58])
  TAU: 0.09, // exponential landing time-constant, seconds (90 ms)
  EPSILON: 0.001, // redraw only if landed progress moved > epsilon
  SHIFT_CLAMP: 0.02, // |x|+|y| <= 0.02 velocity + pointer feed
} as const;

/** Canvas backing store — 16:9, CSS cover-fit at mount time. */
const CANVAS_W = 1280;
const CANVAS_H = 720;

export interface KeyframeEngineOptions {
  host: HTMLElement;
  colorAUrl: string;
  colorBUrl: string;
  depthAUrl?: string;
  depthBUrl?: string;
  onContextLost?: () => void;
}

function compile(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader {
  const sh = gl.createShader(type);
  if (!sh) throw new Error("cinema gl: createShader failed");
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error(`cinema gl: shader compile failed — ${log ?? "unknown"}`);
  }
  return sh;
}

async function loadBitmap(url: string): Promise<ImageBitmap> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`cinema tex: HTTP ${res.status} for ${url}`);
  return createImageBitmap(await res.blob());
}

export class KeyframeEngine implements TickingEngine {
  readonly kind = "keyframe" as const;
  #opts: KeyframeEngineOptions;
  #gl: WebGL2RenderingContext | null = null;
  #canvas: HTMLCanvasElement | null = null;
  #prog: WebGLProgram | null = null;
  #textures: WebGLTexture[] = [];
  #uniforms: Record<string, WebGLUniformLocation | null> = {};
  #uPTarget = 0;
  #uPLanded = 0;
  #uDrawn = -1;
  #shift: readonly [number, number] = [0, 0];
  #suspended = true;
  #warmed = false;
  #released = false;
  #firstDrawFired = false;
  #drawRequested = false;
  #lost = false;
  #onFirstDraw?: () => void;

  constructor(
    opts: KeyframeEngineOptions & { onFirstDraw?: () => void },
  ) {
    this.#opts = { onFirstDraw: opts.onFirstDraw, ...opts };
  }

  /** WebGL2 canvas + the oversized triangle + the verbatim program. */
  async warmUp(): Promise<void> {
    if (this.#warmed || this.#lost) return;
    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    canvas.className = "cinema-canvas";
    canvas.setAttribute("aria-hidden", "true");
    // contextlost ladder rung (NEVER #14): preventDefault keeps the context
    // recoverable and hands the film over to the CSS rung.
    canvas.addEventListener(
      "webglcontextlost",
      (e) => {
        if (this.#released) return; // intentional release — NOT a runtime loss
        e.preventDefault();
        this.#lost = true;
        this.#opts.onContextLost?.();
      },
      { once: true },
    );
    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
      preserveDrawingBuffer: false,
    });
    if (!gl) throw new Error("cinema gl: WebGL2 unavailable");
    this.#canvas = canvas;
    this.#gl = gl;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT_SRC);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
    const prog = gl.createProgram();
    if (!prog) throw new Error("cinema gl: createProgram failed");
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw new Error(`cinema gl: link failed — ${gl.getProgramInfoLog(prog) ?? "?"}`);
    }
    this.#prog = prog;
    for (const u of ["uColA", "uColB", "uDepA", "uDepB", "uP", "uShift", "uDisp", "uZoomMax", "uFade"]) {
      this.#uniforms[u] = gl.getUniformLocation(prog, u);
    }

    // One oversized triangle: (-1,-1) (3,-1) (-1,3) — no index buffer.
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    // Textures: color pair always; depth pair or the flat-white 1x1 rung
    // (parallax degrades to pure crossfade + push-in — still cinematic).
    const colA = await loadBitmap(this.#opts.colorAUrl);
    const colB = await loadBitmap(this.#opts.colorBUrl);
    this.#upload(gl, 0, colA);
    this.#upload(gl, 1, colB);
    if (this.#opts.depthAUrl && this.#opts.depthBUrl) {
      this.#upload(gl, 2, await loadBitmap(this.#opts.depthAUrl));
      this.#upload(gl, 3, await loadBitmap(this.#opts.depthBUrl));
    } else {
      const white = new Uint8Array([255, 255, 255, 255]);
      for (const unit of [2, 3]) {
        const t = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, white);
        this.#setTexParams(gl);
        this.#textures[unit] = t!;
      }
    }

    // Static rulings once, then draw one priming frame.
    gl.useProgram(prog);
    for (const [unit, name] of [
      [0, "uColA"],
      [1, "uColB"],
      [2, "uDepA"],
      [3, "uDepB"],
    ] as const) {
      if (this.#uniforms[name]) gl.uniform1i(this.#uniforms[name]!, unit);
    }
    gl.uniform1f(this.#uniforms.uDisp!, CINEMA_MOTION.uDisp);
    gl.uniform1f(this.#uniforms.uZoomMax!, CINEMA_MOTION.uZoomMax);
    gl.uniform1f(this.#uniforms.uFade!, CINEMA_MOTION.uFade);
    this.#opts.host.appendChild(canvas);
    this.#warmed = true;
    this.#suspended = false;
    this.#drawRequested = true; // prime one frame at p=0
  }

  #upload(gl: WebGL2RenderingContext, unit: number, bmp: ImageBitmap): void {
    const t = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bmp);
    this.#setTexParams(gl);
    this.#textures[unit] = t!;
  }

  #setTexParams(gl: WebGL2RenderingContext): void {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  }

  setProgress(p: number): void {
    this.#uPTarget = Math.min(1, Math.max(0, p));
  }

  /**
   * Lerp-landed progress discipline (§8.2 verbatim) — runs inside the ONE
   * gsap.ticker clock; idle scroll = zero draws (epsilon gate).
   */
  tick(_nowMs: number, dtSeconds: number, shift: readonly [number, number]): void {
    if (!this.#warmed || this.#suspended || this.#lost) return;
    const dt = Math.min(Math.max(dtSeconds, 0.0001), 0.25);
    this.#uPLanded += (this.#uPTarget - this.#uPLanded) * (1 - Math.exp(-dt / CINEMA_MOTION.TAU));
    this.#shift = shift;
    if (this.#drawRequested || Math.abs(this.#uPLanded - this.#uDrawn) > CINEMA_MOTION.EPSILON) {
      this.draw();
      this.#uDrawn = this.#uPLanded;
      this.#drawRequested = false;
    }
  }

  draw(): void {
    const gl = this.#gl;
    if (!gl || !this.#prog || this.#lost) return;
    gl.viewport(0, 0, CANVAS_W, CANVAS_H);
    gl.useProgram(this.#prog);
    gl.uniform1f(this.#uniforms.uP!, this.#uPLanded);
    const [sx, sy] = this.#shift;
    // velGain clamp law: |x| + |y| <= 0.02
    const mag = Math.abs(sx) + Math.abs(sy);
    const k = mag > CINEMA_MOTION.SHIFT_CLAMP ? CINEMA_MOTION.SHIFT_CLAMP / mag : 1;
    gl.uniform2f(this.#uniforms.uShift!, sx * k, sy * k);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!this.#firstDrawFired) {
      this.#firstDrawFired = true;
      this.#onFirstDraw?.();
    }
  }

  suspend(): void {
    this.#suspended = true;
    if (this.#canvas) this.#canvas.style.visibility = "hidden";
  }

  resume(): void {
    if (!this.#warmed || this.#lost) return;
    this.#suspended = false;
    this.#drawRequested = true;
    if (this.#canvas) this.#canvas.style.visibility = "visible";
  }

  get isSuspended(): boolean {
    return this.#suspended;
  }

  /** 2+ chapters away: free VRAM (textures/program/buffer) and unmount. */
  release(): void {
    this.#released = true; // arm the guard BEFORE killing the context
    this.#suspended = true;
    const gl = this.#gl;
    if (gl) {
      for (const t of this.#textures) if (t) gl.deleteTexture(t);
      this.#textures = [];
      if (this.#prog) gl.deleteProgram(this.#prog);
      this.#prog = null;
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    }
    this.#canvas?.remove();
    this.#canvas = null;
    this.#gl = null;
    this.#warmed = false;
    this.#suspended = true;
  }
}
