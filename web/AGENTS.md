<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Application-specific rules

Read the root `AGENTS.md` and `docs/migration-to-vercel.md`.
This app is the Vercel target; it does not proxy requests to Railway.
Use Node.js runtime for Prisma, bcrypt, JWT and Stripe. `src/middleware/auth.ts` is an ordinary
helper, not a Next.js request interception file; authorization happens in each handler.

The original four migrations are shared with the legacy backend. New migrations live only here.
Never change already applied migration files. `CheckoutOrder`, `FlightSeat`, and `RateLimitBucket`
are additive. Do not remove old Booking fields while rollback remains necessary.

`APP_ENV` must be explicit. Preview deployments are not automatically staging and a staging project's
primary deployment uses Vercel's Production variable scope. Mutation origin checking intentionally
rejects noncanonical Preview hosts unless APP_URL is configured for that isolated deployment.

Tests:
- `npm run test:unit`: pure logic/security checks.
- `TEST_DATABASE_URL=... npm run test:integration`: real local PostgreSQL, Stripe SDK mocked.
- `npm run build`, then `npm run test:e2e`: production server, API responses mocked.

The daily protected reconciliation cron is a safety net, not a replacement for webhook delivery or
operator alerts. Unknown Stripe sessions must not free seats automatically.
