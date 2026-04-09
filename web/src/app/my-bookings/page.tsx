import { MyBookingsPanel } from '@/components/bookings/MyBookingsPanel';

export default function MyBookingsPage() {
  return (
    <div className="space-y-6 py-4">
      <section className="section-frame p-6 md:p-10">
        <div className="relative z-10 space-y-5">
          <p className="eyebrow">Bookings migration</p>
          <h1 className="section-title text-[2.3rem] md:text-[3.4rem]">La lectura de reservas ya sale desde Next.</h1>
          <p className="section-copy max-w-3xl">
            Esta pantalla ya consume `GET /api/bookings/my-bookings` con sesion por cookie.
            El flujo de checkout y Stripe sigue pendiente antes de reemplazar definitivamente al backend legacy.
          </p>
        </div>
      </section>

      <MyBookingsPanel />
    </div>
  );
}
