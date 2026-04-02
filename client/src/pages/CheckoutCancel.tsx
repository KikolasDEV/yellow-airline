import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const CheckoutCancel = () => {
  const { t } = useTranslation();

  return (
    <section className="section-frame mx-auto max-w-4xl p-6 text-center md:p-10">
      <div className="relative z-10 space-y-6">
        <div className="status-orb status-orb-cancel">!</div>
        <div>
          <p className="eyebrow">{t('cancel_eyebrow')}</p>
          <h1 className="section-title mt-3 text-4xl md:text-6xl">{t('cancel_title')}</h1>
          <p className="section-copy mx-auto mt-4 max-w-2xl">{t('cancel_copy')}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="stat-tile text-left">
            <p className="stat-kicker">{t('pdf_status')}</p>
            <p className="stat-value mt-3">{t('cancel_status')}</p>
          </div>
          <div className="stat-tile text-left">
            <p className="stat-kicker">{t('cancel_recovery_label')}</p>
            <p className="stat-value mt-3">{t('cancel_recovery')}</p>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/" className="cta-primary sm:w-auto">{t('cancel_back_flights')}</Link>
          <Link to="/my-bookings" className="cta-secondary sm:w-auto">{t('cancel_view_bookings')}</Link>
        </div>
      </div>
    </section>
  );
};
