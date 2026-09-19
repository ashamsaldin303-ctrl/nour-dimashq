# Project Worklog

---
Task ID: 0
Agent: Z.ai Code (main orchestrator)
Task: Read and adopt `upload/full-stack-agent-playground.md` v1.0.0 as the operating manual for all build work in this project.

Work Log:
- Read the full manual (558 lines, 13 sections + 2 appendices).
- Verified stack pin against repo `package.json`: Next.js 16.1.1 / React 19 / TS 5 strict / Tailwind 4 / shadcn-ui (new-york) / Prisma 6 — all match.
- Logged environment divergence: manual pins Prisma (PostgreSQL); this sandbox provides SQLite only (`db/custom.db`, `db:push`). Recorded as an environment constraint, not a free choice.
- Noted sandbox divergences from manual defaults: single user-visible route `/` (sandbox rule), API routes instead of Server Actions where needed (sandbox rule), evidence gates adapted to available tooling (`tsc --noEmit`, `eslint .`, dev-server log, agent-browser verification at 375/768/1440).
- Created this worklog file.

Stage Summary:
- Operating constitution adopted: Contract-first, never invent, evidence over claims, tokens before components, ship the boring parts right.
- Awaiting build brief (contract files) before writing any code — per §2.2 no box may be assumed; a brief is required.
- All future Task IDs will be logged here with evidence.
