import Link from 'next/link';

export default function CancelPage() {
  return (
    <section className="section-frame mx-auto max-w-4xl p-6 text-center md:p-10">
      <div className="relative z-10 space-y-6">
        <div className="status-orb status-orb-cancel">!</div>
        <div>
          <p className="eyebrow">Pago cancelado</p>
          <h1 className="section-title mt-3 text-4xl md:text-6xl">La reserva no se completo</h1>
          <p className="section-copy mx-auto mt-4 max-w-2xl">
            Esta pagina ya forma parte de la nueva app y sera el destino de cancelacion cuando Stripe tambien quede migrado.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="stat-tile text-left">
            <p className="stat-kicker">Estado</p>
            <p className="stat-value mt-3">Cancelado</p>
          </div>
          <div className="stat-tile text-left">
            <p className="stat-kicker">Recuperacion</p>
            <p className="stat-value mt-3">Reintentar</p>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="cta-primary sm:w-auto">Volver a vuelos</Link>
          <Link href="/my-bookings" className="cta-secondary sm:w-auto">Ver mis reservas</Link>
        </div>
      </div>
    </section>
  );
}
