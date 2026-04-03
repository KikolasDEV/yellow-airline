import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { VipForm } from '../components/VipForm';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export const VipZone = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      toast(t('vip_exists'), { icon: '⭐' });
      navigate('/');
    }
  }, [navigate, t]);

  return (
    <div className="mx-auto grid max-w-7xl gap-6 py-4 lg:grid-cols-[0.98fr_1.02fr] lg:items-stretch">
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="hero-shell p-6 md:p-8 lg:p-10">
        <div className="relative z-10 flex h-full flex-col justify-between gap-8 text-white">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="promo-badge">{t('vip_badge_priority')}</span>
              <span className="promo-badge">{t('vip_badge_concierge')}</span>
            </div>
            <p className="eyebrow">Yellow Gold</p>
            <div className="space-y-3">
              <h1 className="display-title text-[2.65rem] md:text-[3.2rem]">{t('vip_title')}</h1>
              <p className="max-w-lg text-[0.98rem] leading-7 text-white/72">{t('vip_description')}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4 text-sm text-white/76">
              <p className="micro-label text-white/52">{t('vip_adaptive_perks')}</p>
              <p className="mt-2 text-[0.92rem] leading-7">{t('vip_adaptive_perks_copy')}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4 text-sm text-white/76">
              <p className="micro-label text-white/52">{t('vip_booking_depth')}</p>
              <p className="mt-2 text-[0.92rem] leading-7">{t('vip_booking_depth_copy')}</p>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-black/10 p-4 backdrop-blur-xl">
            <p className="micro-label text-white/52">{t('vip_why_join')}</p>
            <p className="mt-3 max-w-xl text-[0.92rem] leading-7 text-white/74">{t('vip_why_join_copy')}</p>
          </div>
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="surface-card p-6 md:p-8 lg:p-10">
        <div className="mb-6 space-y-3">
          <p className="eyebrow">{t('vip_membership_request')}</p>
          <h2 className="section-title text-[2rem] md:text-[2.6rem]">{t('vip_join_circle')}</h2>
          <p className="section-copy max-w-2xl">{t('vip_form_copy')}</p>
        </div>
        <VipForm />
      </motion.section>
    </div>
  );
};
