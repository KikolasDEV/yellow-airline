import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userName', data.user.name);
        navigate('/');
        toast.success(`${t('login_success_prefix')} ${data.user.name}!`);
      } else {
        toast.error(t('login_failed'));
      }
    } catch {
      toast.error(t('login_connection_error'));
    }
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-6 py-4 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="hero-shell p-6 md:p-8 lg:p-10">
        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="promo-badge">{t('login_badge_member')}</span>
            <span className="promo-badge">{t('login_badge_responsive')}</span>
          </div>
          <p className="eyebrow">{t('login_eyebrow')}</p>
          <div className="space-y-3">
            <h1 className="display-title text-5xl text-white md:text-6xl">{t('welcome_back')}</h1>
            <p className="max-w-lg text-sm leading-7 text-white/72 md:text-base md:leading-8">{t('vip_access_copy')}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4 text-white/78">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-white/48">{t('login_fast_lane')}</p>
              <p className="mt-2 text-sm">{t('login_fast_lane_copy')}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4 text-white/78">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-white/48">{t('login_dark_mode')}</p>
              <p className="mt-2 text-sm">{t('login_dark_mode_copy')}</p>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.form initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleLogin} className="surface-card space-y-5 p-6 md:p-8 lg:p-10">
        <div>
          <p className="eyebrow">{t('login_sign_in')}</p>
          <h2 className="section-title mt-2 text-3xl md:text-5xl">{t('login_board_account')}</h2>
          <p className="section-copy mt-3 max-w-xl">{t('login_form_copy')}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[1.35rem] border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--surface-elevated)_84%,transparent_16%)] p-4 sm:col-span-2">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--text-muted)]">{t('login_cabin_note')}</p>
            <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">{t('login_cabin_note_copy')}</p>
          </div>

          <label className="block space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.24em] text-[var(--text-muted)]">{t('email')}</span>
            <input
              type="email"
              required
              className="input-shell"
              placeholder="ejemplo@yellow.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.24em] text-[var(--text-muted)]">{t('password')}</span>
            <input
              type="password"
              required
              className="input-shell"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
        </div>

        <button className="cta-primary w-full justify-center sm:w-auto sm:min-w-[220px]">{t('login_cta')}</button>

        <p className="text-sm text-[var(--text-secondary)]">
          {t('join_vip_prompt')}{' '}
          <Link to="/vip" className="font-bold text-[var(--accent-strong)] underline underline-offset-4">
            {t('join_vip_cta')}
          </Link>
        </p>
      </motion.form>
    </div>
  );
};
