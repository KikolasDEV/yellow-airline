'use client';

import { useTranslation } from 'react-i18next';

export function AuthIntro({ register = false }: { register?: boolean }) {
  const { t } = useTranslation();
  return <section className="hero-shell p-8 text-white md:p-10">
    <p className="eyebrow text-yellow-300">Yellow Gold</p>
    <h1 className="display-title mt-6 text-5xl text-white">{t(register ? 'vip_headline' : 'login_headline')}</h1>
    <p className="mt-6 max-w-lg leading-8 text-white/75">{t(register ? 'vip_copy' : 'login_copy')}</p>
  </section>;
}
