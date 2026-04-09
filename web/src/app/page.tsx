import { FlightInventory } from '@/components/flights/FlightInventory';

export default function Home() {
  return (
    <div className="space-y-8 pb-6 md:space-y-10 lg:space-y-12">
      <section className="hero-shell p-5 md:p-7 lg:p-8">
        <div className="relative z-10 max-w-4xl space-y-5">
          <p className="eyebrow text-white/72">Yellow Airline Transition</p>
          <h1 className="display-title text-[2.7rem] text-white md:text-[4.4rem]">
            Next.js despega en paralelo mientras Railway sigue protegiendo produccion.
          </h1>
          <p className="max-w-3xl text-base leading-8 text-white/74 md:text-lg">
            Esta nueva app en `web/` ya integra App Router, Prisma compartido, modulos backend,
            cookies de sesion y rutas iniciales para reemplazar gradualmente al stack legacy.
          </p>
          <div className="flex flex-wrap gap-3 pt-3">
            <a href="#offers-section" className="cta-primary">Ver progreso</a>
            <a href="#inventory-section" className="cta-secondary">Ver API migrada</a>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3" id="offers-section">
        <article className="stat-tile">
          <p className="stat-kicker">Estado</p>
          <p className="stat-value mt-3">Foundation</p>
          <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
            `web/` ya es una base valida para seguir migrando paginas, auth y reservas.
          </p>
        </article>
        <article className="stat-tile">
          <p className="stat-kicker">Legacy</p>
          <p className="stat-value mt-3">Intacto</p>
          <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
            `client/` y `server/` siguen funcionando sin cambios como referencia estable.
          </p>
        </article>
        <article className="stat-tile">
          <p className="stat-kicker">Safety Net</p>
          <p className="stat-value mt-3">Railway</p>
          <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
            No se apagará hasta que Next cubra auth, bookings y Stripe de punta a punta.
          </p>
        </article>
      </section>

      <section className="section-frame p-5 md:p-7" id="inventory-section">
        <div className="relative z-10 grid gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="eyebrow">API migrada</p>
            <h2 className="section-title mt-3 text-[2rem] md:text-[3rem]">`/api/flights` ya responde desde Next.</h2>
            <p className="section-copy mt-4 max-w-2xl">
              La nueva app ya sirve route handlers propios en App Router. Auth inicial con cookie,
              flights migrado y modulos preparados para bookings y payments.
            </p>
          </div>
          <div className="surface-card p-6">
            <p className="micro-label">Siguientes bloques</p>
            <div className="mt-4 grid gap-3 text-sm text-[var(--text-secondary)]">
              <p>1. Migrar shell visual y providers</p>
              <p>2. Mover login y registro VIP</p>
              <p>3. Conectar bookings y Stripe</p>
              <p>4. Validar Vercel preview antes del cutover</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Inventario</p>
            <h2 className="section-title">Vuelos disponibles desde la nueva API</h2>
          </div>
          <p className="section-copy max-w-xl">
            Este bloque ya consulta `web/src/app/api/flights/route.ts` y muestra datos reales servidos desde Next.
          </p>
        </div>

        <FlightInventory />
      </section>
    </div>
  );
}
