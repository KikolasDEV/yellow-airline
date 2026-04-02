import { Link, useSearchParams } from 'react-router-dom';

export const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <section className="surface-card mx-auto max-w-3xl p-8 text-center">
      <p className="eyebrow">Pago completado</p>
      <h1 className="section-title mt-3">Tu pago fue procesado con exito</h1>
      <p className="section-copy mt-3">Stripe confirmo la transaccion. En segundos tu reserva aparecera en My Bookings.</p>
      {sessionId && <p className="mt-4 text-xs text-[var(--text-muted)]">Session ID: {sessionId}</p>}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to="/my-bookings" className="cta-primary">Ir a mis reservas</Link>
        <Link to="/" className="cta-secondary">Volver al inicio</Link>
      </div>
    </section>
  );
};
