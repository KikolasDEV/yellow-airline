import { Link } from 'react-router-dom';

export const CheckoutCancel = () => {
  return (
    <section className="surface-card mx-auto max-w-3xl p-8 text-center">
      <p className="eyebrow">Pago cancelado</p>
      <h1 className="section-title mt-3">No se completo la reserva</h1>
      <p className="section-copy mt-3">Puedes volver al listado de vuelos e intentarlo otra vez cuando quieras.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to="/" className="cta-primary">Volver a vuelos</Link>
        <Link to="/my-bookings" className="cta-secondary">Ver mis reservas</Link>
      </div>
    </section>
  );
};
