import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const CheckoutSuccess = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <section className="section-frame mx-auto max-w-4xl p-6 text-center md:p-10">
      <div className="relative z-10 space-y-6">
        <div className="status-orb status-orb-success">✓</div>
        <div>
          <p className="eyebrow">{t('success_eyebrow')}</p>
          <h1 className="section-title mt-3 text-4xl md:text-6xl">{t('success_title')}</h1>
          <p className="section-copy mx-auto mt-4 max-w-2xl">{t('success_copy')}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="stat-tile text-left">
            <p className="stat-kicker">{t('pdf_status')}</p>
            <p className="stat-value mt-3">{t('success_status')}</p>
          </div>
          <div className="stat-tile text-left">
            <p className="stat-kicker">{t('success_next_stop_label')}</p>
            <p className="stat-value mt-3">{t('success_next_stop')}</p>
          </div>
        </div>

        {sessionId && <p className="text-xs text-[var(--text-muted)]">{t('session_id_label')}: {sessionId}</p>}

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/my-bookings" className="cta-primary sm:w-auto">{t('success_go_bookings')}</Link>
          <Link to="/" className="cta-secondary sm:w-auto">{t('success_back_home')}</Link>
        </div>
      </div>
    </section>
  );
};
