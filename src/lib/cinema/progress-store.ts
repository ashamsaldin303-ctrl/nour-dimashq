/**
 * M2 cinema layer — the ONE progress store (§4 file map):
 * chapter index + landed progress + the shared shift feed (scroll velocity +
 * pointer parallax) every engine reads from the single ticker.
 * Deliberately dependency-free (~30 lines): the cinema chunk budget is law.
 */

export interface CinemaFrameState {
  chapter: number;
  progress: number; // raw chapter progress 0..1 (landing happens in engines)
  velocity: number; // signed scroll velocity (px/frame, from Lenis)
  pointer: readonly [number, number]; // pointer parallax feed, -0.5..0.5
}

type Listener = (s: CinemaFrameState) => void;

export class ProgressStore {
  #state: CinemaFrameState = { chapter: 0, progress: 0, velocity: 0, pointer: [0, 0] };
  #listeners = new Set<Listener>();

  get state(): CinemaFrameState {
    return this.#state;
  }

  subscribe(fn: Listener): () => void {
    this.#listeners.add(fn);
    return () => this.#listeners.delete(fn);
  }

  setChapter(chapter: number, progress: number): void {
    if (this.#state.chapter === chapter && this.#state.progress === progress) return;
    this.#state = { ...this.#state, chapter, progress };
    this.#emit();
  }

  setKinetics(velocity: number, pointer: readonly [number, number]): void {
    this.#state = { ...this.#state, velocity, pointer };
    // Kinetics feed the engines on tick — no React re-render storm, no emit.
  }

  #emit(): void {
    for (const fn of this.#listeners) fn(this.#state);
  }
}

/**
 * The shift vector fed to engines: velocity term + pointer parallax, clamped
 * by the velGain law (|x| + |y| <= 0.02, §5/§8.2).
 */
export function computeShift(
  velocity: number,
  pointer: readonly [number, number],
): [number, number] {
  const velX = Math.max(-1, Math.min(1, velocity / 60)) * 0.012; // velocity term
  const px = pointer[0] * 0.008; // pointer term
  const py = pointer[1] * 0.008;
  return [velX + px, py];
}
