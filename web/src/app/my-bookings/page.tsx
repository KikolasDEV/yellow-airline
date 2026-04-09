export default function MyBookingsPage() {
  return (
    <section className="section-frame mx-auto max-w-5xl p-6 md:p-10">
      <div className="relative z-10 space-y-5">
        <p className="eyebrow">Bookings migration</p>
        <h1 className="section-title text-[2.3rem] md:text-[3.4rem]">La pagina de reservas es el siguiente bloque grande.</h1>
        <p className="section-copy max-w-3xl">
          La ruta ya existe en la nueva app y servira para conectar autenticacion por cookie,
          reservas reales y descarga del boarding pass. Mientras tanto, Railway sigue cubriendo la version legacy.
        </p>
      </div>
    </section>
  );
}
