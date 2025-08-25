# Repository Guidelines

## Project Structure & Module Organization
- `frontend/`: Next.js (App Router) with TypeScript and Tailwind. Key dirs: `app/` (routes, layouts), `components/` (UI + providers), `lib/` (Supabase clients, utils), `public/` (assets). Build output: `.next/`.
- `backend/`: Placeholder for future API/service code.
- `memory-bank/`: Internal docs (context, brief, progress). Not shipped.
- `.trae/`: Local automation/rules. Safe to ignore for app runtime.

## Build, Test, and Development Commands
- Setup: `cd frontend && npm install` (Node 18+ recommended).
- Dev server: `npm run dev` — starts Next.js at `http://localhost:3000`.
- Production build: `npm run build` — compiles the app.
- Start prod: `npm run start` — serves the built app.
- Lint: `npm run lint` — ESLint with `next/core-web-vitals`.

## Coding Style & Naming Conventions
- Language: TypeScript with `strict` enabled; no emits from TS.
- Linting: ESLint flat config extending Next.js rules. Fix issues before committing.
- Indentation/formatting: 2 spaces; keep imports sorted logically; prefer named exports.
- React: App Router defaults to Server Components; add `"use client"` only when needed.
- Naming: Components `PascalCase` in `components/`; hooks/utilities `camelCase` in `lib/`; routes as `app/<route>/page.tsx`. Use path alias `@/*` for imports (e.g., `@/lib/utils`).

## Testing Guidelines
- No formal test setup yet. When adding tests, prefer colocated files (`*.test.ts(x)`) or `frontend/__tests__/` with Jest/Vitest + Testing Library.
- Aim for component tests over snapshots; mock Supabase where needed. Keep tests fast and deterministic.

## Commit & Pull Request Guidelines
- Conventional Commits: `feat(scope): ...`, `fix(scope): ...`, `docs(scope): ...` (seen in history: `feat(auth)`, `docs(memory-bank)`).
- Commits: small, focused; present tense; imperative mood.
- PRs: include a clear summary, linked issues, screenshots for UI, and note any env changes. Ensure `npm run lint` and `npm run build` pass.

## Security & Configuration Tips
- Environment: set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `frontend/.env.local`. Secrets are ignored by Git (`.env*`).
- Do not expose non-public keys in client code. Use server helpers (`server-only`) and the server Supabase client for privileged operations.

