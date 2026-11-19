# AGENTS.md

## Architecture and migration status

This repository contains **three independent TypeScript applications**, not a root npm workspace:
- `web/`: Next.js App Router, the unified Vercel deployment target.
- `client/`: legacy React/Vite frontend; keep available until production cutover is verified.
- `server/`: legacy Express API; Railway must not be removed before data/payment reconciliation.

The current hosting configuration must be verified in the provider dashboards. A successful local
build does not prove that production has migrated. The authoritative manual runbook is
`docs/migration-to-vercel.md`.

Read `web/AGENTS.md` and the installed Next.js documentation before changing Next.js APIs.
Do not spawn agents unless explicitly authorized by the user or other applicable instructions.

## Commands

Use Node.js 22 and npm separately inside each application. Each directory has its own lockfile.
The checked-in `.npmrc` files use `legacy-peer-deps=true` for reproducible installs; npm 11's peer
resolver failed on this dependency tree. Do not remove this setting without regenerating and
verifying the lockfiles with `npm ci`. No global npm upgrade is necessary.

### web/
```text
npm ci
npm run dev
npm run lint
npm run build
npm run start
npm run test:unit
npm run test:integration
npm run test:e2e
npm run check:env
npm run check:staging-env
npm run db:generate
npm run db:migrate:deploy
npm run db:verify
npm run payments:reconcile
```

Integration tests require an explicit `TEST_DATABASE_URL` to a loopback PostgreSQL database whose
name ends in `_test`. They never infer the target from `DATABASE_URL`. They create and remove only
their own fixtures. See `docs/testing.md`.
E2E tests start a production Next.js server on port 3100 after a build. They mock API responses;
they are not evidence of a real Stripe settlement.

### client/
`npm run dev`, `npm run lint`, `npm run build`, `npm run test:unit`, `npm run test:e2e`.

### server/
`npm run dev`, `npm run lint`, `npm run build`, `npm run test:unit`.
`server/dist/` contains tracked generated artifacts. For a review-only build use
`npm run build -- --outDir <dedicated-temporary-directory>` rather than accidentally changing
tracked output. Production still runs a fresh build through its deployment commands.

There ARE working Vitest and Playwright tests. Earlier instructions claiming otherwise were stale.
Single tests can be selected with `npm run test:unit -- <file>` or
`npm run test:e2e -- <file>` inside the appropriate app. Web integration tests use their separate config.

## Non-negotiable safety rules

- Never read, print, commit or hardcode real secrets or `.env` contents.
- Never run remote migrations, seed, restore, reset or provider changes without explicit target approval.
- `web/` owns new migrations. Preserve historical migrations and their checksums.
- New schema changes must remain additive while legacy rollback is required.
- Do not run migrations or seeds in Vercel install/build hooks.
- `db:migrate:deploy` requires `MIGRATION_APPROVED=true`. Production also requires
  `MIGRATION_BACKUP_CONFIRMED=true`; these are acknowledgements, not proof a backup exists.
- Demo seeds are non-destructive and blocked unless explicitly enabled in a non-production environment.
- Staging and Preview must never use production data, credentials or Stripe resources.
- `APP_ENV` identifies the business environment, independently of Vercel's Production/Preview scope.
- `APP_URL` is a trusted canonical origin. Never construct payment redirects from arbitrary Host headers.
- Enable `WRITES_ENABLED`, `PAYMENTS_ENABLED`, `SETTLEMENTS_ENABLED` deliberately.
  Purchase maintenance should normally leave settlements enabled. A final database snapshot requires
  all writers, including webhooks and reconciliation jobs, to be paused.
- Do not allow legacy and Next.js checkout creation simultaneously against the production database.
- Legacy webhook must ignore tagged Next.js events. Next.js ignores untagged legacy events.
  All legacy checkouts must be drained and reconciled before the production cutover.
- Rollback must preserve post-cutover purchases. A previous deployment does not restore a database,
  environment variables, webhook routing or provider settings.

## Booking invariants

- All capacity and seat mutations in Next.js acquire a PostgreSQL row lock on the Flight.
- Checkout orders persist immutable prices (integer cents), party counts, seats and environment.
- Stripe creation uses the order ID as its idempotency key.
- Never release capacity using a local timestamp alone. Require confirmed Stripe expiration.
- Unknown sessions and inconsistent paid orders fail closed and require operator reconciliation.
- Paid session amount, currency, mode, environment and identity must match the stored order.
- `Booking.finalPrice` is the historical **unit** price. `totalAmount` is the new total in cents;
  legacy totals are derived from unit price times adults + children.
- Infants have no seat; require an adult; at most nine travellers per purchase.
- Only the authenticated owner can inspect a purchase. A success URL is not proof of payment.

## Code conventions

Preserve local TypeScript style, explicit types, ESM, and readable code. Avoid new `any`.
Backend imports use `.js`; Next.js uses its existing `@/` alias. Keep server-only modules out of client
components. Use validated runtime inputs, bounded bodies, JSON errors and meaningful status codes.
Never silently swallow unexpected database/payment failures; log identifiers, not personal information.
Maintain Spanish and English product copy, keyboard accessibility, and reduced-motion support.

## Validation

- Web changes: lint, build, unit tests; integration tests for database/payment changes.
- Frontend flows: Playwright after build; real Stripe sandbox validation is additionally manual.
- Legacy changes: lint/build/unit tests in the affected app, plus legacy E2E where applicable.
- Run `npm audit --omit=dev` for runtime dependencies. There is a documented build-time Prisma 6
  advisory in `docs/migration-to-vercel.md`; do not apply a blind major upgrade or unsafe override.
- Do not claim remote deployment, webhook delivery, backups or migration success without evidence.
