# Repository Guidelines

## Project Structure & Module Organization

- `frontend/`: Next.js (App Router) with TypeScript and Tailwind. Key dirs: `app/` (routes, layouts, API routes), `components/` (UI + providers), `lib/` (Supabase clients, utils), `public/` (assets). Build output: `.next/`.
- `backend/`: Currently using Supabase as backend service - handles authentication, database operations, and API endpoints.
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

## Authentication & Session Management

- **Current Implementation**: Client-side authentication using Supabase Auth with SSR support
- **AuthProvider**: Global context provider managing session state, user data, and admin permissions
- **Session Refresh**: Implemented `refreshSession()` mechanism to handle auth state synchronization
- **Logout Flow**: Multi-step process clearing session, storage, and forcing auth state refresh
- **Admin Protection**: Routes like `/add-word` are protected and redirect non-admin users

## API Routes & Database Operations

- **Pattern**: API routes in `app/api/` handle server-side operations
- **Authentication**: Client-side auth validation with user data passed to API routes
- **Database**: Supabase with `dictionary` table for word storage and `profiles` table for user management
- **Error Handling**: Comprehensive error responses with appropriate HTTP status codes

## Testing Guidelines

- No formal test setup yet. When adding tests, prefer colocated files (`*.test.ts(x)`) or `frontend/__tests__/` with Jest/Vitest + Testing Library.
- Aim for component tests over snapshots; mock Supabase where needed. Keep tests fast and deterministic.
- **Current Focus**: Manual testing of authentication flows and word management features.

## Commit & Pull Request Guidelines

- Conventional Commits: `feat(scope): ...`, `fix(scope): ...`, `docs(scope): ...` (seen in history: `feat(auth)`, `docs(memory-bank)`, `fix(logout)`).
- Commits: small, focused; present tense; imperative mood.
- PRs: include a clear summary, linked issues, screenshots for UI, and note any env changes. Ensure `npm run lint` and `npm run build` pass.

## Security & Configuration Tips

- Environment: set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `frontend/.env.local`. Secrets are ignored by Git (`.env*`).
- Do not expose non-public keys in client code. Use server helpers (`server-only`) and the server Supabase client for privileged operations.
- **Row Level Security**: Database operations protected by Supabase RLS policies.
- **Admin Management**: Admin status controlled via `profiles.is_admin` column with database triggers.

## Recent Architecture Decisions

- **Client-Side Auth**: Moved from mixed server/client auth to pure client-side for consistency
- **Session Management**: Implemented session refresh mechanism to prevent auth state corruption
- **API Design**: Simplified API routes by removing server-side auth checks and relying on client validation
- **Error Recovery**: Multiple fallback mechanisms for logout and auth state management
