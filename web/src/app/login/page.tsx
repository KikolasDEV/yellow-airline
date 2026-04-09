import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="mx-auto grid max-w-7xl gap-6 py-4 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
      <section className="hero-shell p-6 md:p-8 lg:p-10">
        <div className="relative z-10 space-y-6 text-white">
          <p className="eyebrow text-white/70">Yellow Gold</p>
          <h1 className="display-title text-[2.65rem] text-white md:text-[3.2rem]">Cabina premium, mismo viaje.</h1>
          <p className="max-w-lg text-[0.98rem] leading-7 text-white/72">
            Esta ruta ya usa la nueva app Next como punto de entrada para autenticacion con cookie segura.
          </p>
        </div>
      </section>
      <LoginForm />
    </div>
  );
}
