import { RegisterForm } from '@/components/auth/RegisterForm';

export default function VipPage() {
  return (
    <div className="mx-auto grid max-w-7xl gap-6 py-4 lg:grid-cols-[0.98fr_1.02fr] lg:items-stretch">
      <section className="hero-shell p-6 text-white md:p-8 lg:p-10">
        <div className="relative z-10 flex h-full flex-col justify-between gap-8">
          <div className="space-y-6">
            <p className="eyebrow text-white/70">Yellow Gold</p>
            <h1 className="display-title text-[2.65rem] text-white md:text-[3.2rem]">Acceso VIP ya servido desde Next.</h1>
            <p className="max-w-lg text-[0.98rem] leading-7 text-white/72">
              El registro nuevo ya golpea la API unificada de `web/` mientras Railway sigue como respaldo del backend legacy.
            </p>
          </div>
        </div>
      </section>
      <RegisterForm />
    </div>
  );
}
