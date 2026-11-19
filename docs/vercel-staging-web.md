# Staging de web/ en Vercel

La guía vigente, con variables y comandos, es [migration-to-vercel.md](migration-to-vercel.md),
secciones 1–4. No seguir instrucciones antiguas que recomendaban Vercel Postgres nativo,
variables solo en Preview o seeds destructivos.

Resumen:
- Proyecto Vercel independiente, Root `web`, Next.js, Node 22, `npm ci`, `npm run build`, sin Output override.
- PostgreSQL separado mediante Marketplace (por ejemplo Neon).
- APP_ENV=staging, APP_URL estable, DATABASE_URL pooled, DIRECT_URL directa, JWT/CRON secrets nuevos.
- Sandbox Stripe aislado; webhook firmado y accesible pese a Deployment Protection.
- Flags desactivados inicialmente; migración aprobada fuera del build.
- Probar la compra completa antes de tocar producción.
