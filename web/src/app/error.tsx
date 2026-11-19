'use client';

import { useTranslation } from 'react-i18next';

export default function ErrorPage({ reset }: { reset: () => void }) {
  const { t } = useTranslation();
  return <section className="surface-card space-y-5 p-8"><h1 className="section-title text-3xl">{t('flights_error')}</h1><button className="cta-primary" onClick={reset}>{t('refresh_payment')}</button></section>;
}
