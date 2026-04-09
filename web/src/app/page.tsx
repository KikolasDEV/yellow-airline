export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-20">
      <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,#101828_0%,#18253a_55%,#22324d_100%)] p-8 text-white shadow-[0_30px_80px_rgba(8,15,30,0.35)] md:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-300/80">Yellow Airline Transition</p>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-6xl">
          Nueva app Next.js en paralelo, legacy intacto.
        </h1>
        <p className="mt-6 max-w-3xl text-base leading-8 text-slate-200 md:text-lg">
          Este workspace unifica frontend y backend en una sola base de codigo con App Router,
          Prisma compartido y modulos backend. El despliegue actual en Railway se mantiene como
          red de seguridad mientras completamos la migracion.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <article className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5 backdrop-blur">
            <p className="text-sm font-semibold text-amber-200">Estado</p>
            <p className="mt-3 text-2xl font-semibold">Foundation</p>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              `web/` ya es la nueva base tecnica para la migracion incremental.
            </p>
          </article>
          <article className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5 backdrop-blur">
            <p className="text-sm font-semibold text-amber-200">Legacy</p>
            <p className="mt-3 text-2xl font-semibold">Sin cambios</p>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              `client/` y `server/` siguen siendo la version estable mientras migramos.
            </p>
          </article>
          <article className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5 backdrop-blur">
            <p className="text-sm font-semibold text-amber-200">Safety Net</p>
            <p className="mt-3 text-2xl font-semibold">Railway activo</p>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              El backend actual no se sustituye hasta que la nueva app quede validada end to end.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
