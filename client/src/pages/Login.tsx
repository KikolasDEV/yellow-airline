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
        toast.error(data.error || 'Login failed');
      }
    } catch {
      toast.error(t('login_connection_error'));
    }
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-6 py-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="hero-shell p-8 md:p-10">
        <div className="relative z-10 space-y-6">
          <p className="eyebrow">VIP Access</p>
          <div className="space-y-3">
            <h1 className="text-5xl font-black tracking-[-0.08em] text-white">{t('welcome_back')}</h1>
            <p className="max-w-lg text-sm leading-7 text-white/72">{t('vip_access_copy')}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4 text-white/78">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-white/48">Fast lane</p>
              <p className="mt-2 text-sm">Jump back into the new interactive booking flow with seat selection and tailored deals.</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4 text-white/78">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-white/48">Dark mode</p>
              <p className="mt-2 text-sm">The experience keeps the same premium tone in bright or low-light environments.</p>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.form initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleLogin} className="surface-card space-y-5 p-8 md:p-10">
        <div>
          <p className="eyebrow">Sign In</p>
          <h2 className="section-title mt-2 text-3xl">Board your account</h2>
        </div>

        <div className="space-y-4">
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

        <button className="cta-primary w-full justify-center">{t('login_cta')}</button>

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
