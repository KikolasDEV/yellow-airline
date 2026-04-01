# AGENTS.md
## Scope
This repo has two separate TypeScript apps:
- `client/`: React 19 + Vite frontend
- `server/`: Express 5 + Prisma backend
There is no root workspace runner. Run commands inside `client/` or `server/`.

## Repo Rules
- No previous `AGENTS.md` was present.
- No `.cursor/rules/` directory is present.
- No `.cursorrules` file is present.
- No `.github/copilot-instructions.md` file is present.
- If those files are added later, treat them as higher-priority repo instructions and update this file.

## Install
Use `npm` separately in each app:
```bash
cd client && npm install
cd server && npm install
```
Both apps already use `package-lock.json`.

## Main Commands
Frontend:
```bash
cd client && npm run dev
cd client && npm run build
cd client && npm run lint
cd client && npm run preview
```
Backend:
```bash
cd server && npm run dev
cd server && npm run build
cd server && npx prisma db seed
```
Local URLs used by the codebase:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Verified Commands
These commands were run successfully while creating this file:
- `cd client && npm run lint`
- `cd client && npm run build`
- `cd server && npm run build`
The backend `test` script is only a placeholder and exits with failure.

## Test Status
There is no real automated test runner configured right now.
- Frontend: no `test` script, no Vitest/Jest config, no test files found
- Backend: `npm test` prints `Error: no test specified` and exits non-zero
Because of that, there is currently no supported single-test command.

## Single-Test Guidance
If asked to run a single test:
- say clearly that no test harness exists
- do not invent Vitest/Jest commands
- do not claim `npm test -- foo` is supported
- use build/lint as the available validation instead
Practical replacement checks:
```bash
cd client && npm run lint
cd client && npm run build
cd server && npm run build
```

## Stack
- Frontend: React, React Router, React Hook Form, Zod, i18next, Tailwind, Vite
- Backend: Express, Prisma, PostgreSQL, bcrypt, JWT
- Module system: ESM in both apps
- Language: TypeScript everywhere

## Important Paths
Frontend:
- `client/src/components/`
- `client/src/pages/`
- `client/src/services/`
- `client/src/types/`
Backend:
- `server/src/routes/`
- `server/src/middleware/`
- `server/src/lib/`
- `server/prisma/`

## Style Guidelines
Match the surrounding file. Prefer the smallest correct change.

### Formatting
- Use TypeScript for application code.
- Preserve the file's existing semicolon style.
- Prefer single quotes in TS/TSX unless the file already uses something else.
- Keep JSX and object literals readable.
- Use ESM imports/exports only.

### Imports
- Put external imports before local imports.
- Use `import type` for type-only imports when practical.
- Prefer relative imports; do not introduce path aliases without a repo-wide reason.
- Backend local imports should keep the `.js` extension.
- Frontend local import style should follow the file you are editing.

### Types
- Prefer explicit interfaces and type aliases for shared shapes.
- Reuse types from `client/src/types/` when possible.
- Keep component props, state, and async results typed.
- Avoid new `any` usage, especially on the backend.
- Existing backend `(req as any)` usage is technical debt; do not spread it unless necessary.
- Respect strict TypeScript settings in both apps.

### Naming
- Components, pages, exported UI pieces: PascalCase
- Functions, variables, hooks: camelCase
- Constants: `UPPER_SNAKE_CASE` for true constants only
- Keep route file names descriptive, matching current `*Routes.ts` usage
- Use domain names already present: `flight`, `booking`, `user`, `vip`, `departureTime`

### React Patterns
- Use functional components.
- Keep page-specific fetching near the page unless reuse is clear.
- Use `react-hook-form` + Zod for new complex forms.
- Avoid unnecessary abstractions for small UI pieces.
- Preserve the current Tailwind-heavy styling approach.

### Server Patterns
- Define HTTP endpoints in `server/src/routes/`.
- Use the shared Prisma client from `server/src/lib/prisma.ts`.
- Return JSON from API endpoints, including errors.
- Keep route handlers straightforward and readable.
- Normalize request data before database writes when needed.

### Error Handling
- Wrap async network and database work in `try/catch`.
- Return appropriate HTTP status codes.
- Keep user-facing messages concise.
- Log unexpected failures only when the log is useful for debugging.
- Do not swallow errors silently.

### Data and Validation
- Frontend form validation should follow the existing Zod pattern.
- Convert request input to the expected runtime type before persistence.
- Keep Prisma schema, migrations, seeds, and route logic aligned.

### Environment and Secrets
- Backend expects values like `DATABASE_URL`, `JWT_SECRET`, and optionally `PORT`.
- Never commit secrets or `.env` contents.
- Do not replace environment-based config with hardcoded secrets.

## Tooling Notes
Frontend linting is configured in `client/eslint.config.js` with:
- ESLint recommended rules
- `typescript-eslint` recommended rules
- React Hooks rules
- React Refresh Vite rules
Frontend TypeScript is stricter than the backend config and includes `noUnusedLocals` and `noUnusedParameters`.

## Agent Workflow
- Decide first whether the change belongs in `client/`, `server/`, or both.
- Run the narrowest useful validation for the files you changed.
- For frontend-only changes, usually run `npm run lint` and `npm run build` in `client/`.
- For backend-only changes, usually run `npm run build` in `server/`.
- For API contract changes, validate both apps.
- If asked for tests, explicitly state that no working test harness exists yet.

## Do Not Assume
- Do not assume root `npm run build`, `npm run lint`, or `npm test` commands exist.
- Do not assume a single-test command exists.
- Do not assume path aliases or a monorepo orchestrator exist.
- Do not assume English-only product copy; the app currently mixes Spanish and English.
