'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export const LoginForm = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`${t('login_success_prefix')} ${data.user.name}!`);
        router.push('/');
        router.refresh();
      } else {
        toast.error(t('login_failed'));
      }
    } catch {
      toast.error(t('login_connection_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="surface-card space-y-5 p-6 md:p-8 lg:p-10">
      <div>
        <p className="eyebrow">{t('login_eyebrow')}</p>
        <h2 className="section-title mt-2 text-[2rem] md:text-[2.6rem]">{t('welcome_back')}</h2>
        <p className="section-copy mt-3 max-w-xl">{t('vip_access_copy')}</p>
      </div>

      <div className="grid gap-4">
        <label className="block space-y-2">
          <span className="micro-label">{t('email')}</span>
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
          <span className="micro-label">{t('password')}</span>
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

      <button disabled={isSubmitting} className="cta-primary w-full justify-center sm:w-auto sm:min-w-[220px]">
        {isSubmitting ? '...' : t('login_cta')}
      </button>

      <p className="text-sm text-[var(--text-secondary)]">
        {t('join_vip_prompt')}{' '}
        <Link href="/vip" className="font-bold text-[var(--accent-strong)] underline underline-offset-4">
          {t('join_vip_cta')}
        </Link>
      </p>
    </form>
  );
};
