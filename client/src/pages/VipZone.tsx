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
    <div className="mx-auto grid max-w-6xl gap-6 py-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="hero-shell p-8 md:p-10">
        <div className="relative z-10 space-y-6 text-white">
          <p className="eyebrow">Yellow Gold</p>
          <div className="space-y-3">
            <h1 className="text-5xl font-black tracking-[-0.08em]">{t('vip_title')}</h1>
            <p className="max-w-lg text-sm leading-7 text-white/72">{t('vip_description')}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4 text-sm text-white/76">
              Priority offers triggered by your real search behavior.
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4 text-sm text-white/76">
              Rich booking flow with tactile passengers and interactive seat choices.
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="surface-card p-8 md:p-10">
        <div className="mb-6 space-y-2">
          <p className="eyebrow">Membership Request</p>
          <h2 className="section-title text-3xl">Join the premium cabin circle</h2>
        </div>
        <VipForm />
      </motion.section>
    </div>
  );
};
