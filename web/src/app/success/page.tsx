import Link from 'next/link';

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;

  return (
    <section className="section-frame mx-auto max-w-4xl p-6 text-center md:p-10">
      <div className="relative z-10 space-y-6">
        <div className="status-orb status-orb-success">✓</div>
        <div>
          <p className="eyebrow">Pago completado</p>
          <h1 className="section-title mt-3 text-4xl md:text-6xl">Tu pago se ha procesado correctamente</h1>
          <p className="section-copy mx-auto mt-4 max-w-2xl">
            Stripe ha confirmado la transaccion y esta ruta ya existe dentro de la nueva app unificada.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="stat-tile text-left">
            <p className="stat-kicker">Estado</p>
            <p className="stat-value mt-3">Pagado</p>
          </div>
          <div className="stat-tile text-left">
            <p className="stat-kicker">Siguiente paso</p>
            <p className="stat-value mt-3">Reservas</p>
          </div>
        </div>

        {sessionId && <p className="text-xs text-[var(--text-muted)]">Session ID: {sessionId}</p>}

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/my-bookings" className="cta-primary sm:w-auto">Ir a mis reservas</Link>
          <Link href="/" className="cta-secondary sm:w-auto">Volver al inicio</Link>
        </div>
      </div>
    </section>
  );
}
