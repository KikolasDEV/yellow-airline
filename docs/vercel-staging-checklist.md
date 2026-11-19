# Checklist de staging

Procedimiento completo: [migration-to-vercel.md](migration-to-vercel.md).

- [ ] Proyecto Vercel separado, raíz web/, Next.js y Node 22.
- [ ] Base/branch PostgreSQL independiente, URL directa y pooled verificadas.
- [ ] APP_ENV=staging aunque Vercel use el scope Production del proyecto staging.
- [ ] APP_URL HTTPS estable y exactamente igual al origen usado por el navegador.
- [ ] JWT_SECRET y CRON_SECRET nuevos; ningún secreto productivo en Preview.
- [ ] Sandbox Stripe aislado, signing secret correcto.
- [ ] Flags false hasta inicializar y validar.
- [ ] `npm run check:staging-env` y migración aprobada, sin seed productivo.
- [ ] Webhook accesible, firma validada; completed/expired/async_payment_succeeded.
- [ ] Health 200; login, búsqueda, asientos y compra test correctos.
- [ ] Total/asientos/PDF correctos; reenvío del evento no duplica reservas.
- [ ] Cancelación libera asientos solo tras expirar Stripe.
- [ ] Cron y alertas configurados; conciliación ensayada.
- [ ] Dump/restore y rollback ensayados sin datos personales expuestos.
- [ ] Producción, Railway y su dominio siguen intactos.
