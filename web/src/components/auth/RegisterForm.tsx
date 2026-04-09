'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export const RegisterForm = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    passport: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      await response.json();

      if (response.ok) {
        toast.success(t('vip_register_success'));
        router.push('/login');
      } else {
        toast.error(t('vip_register_error'));
      }
    } catch {
      toast.error(t('vip_register_connection_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="surface-card space-y-4 p-6 md:p-8 lg:p-10 text-left">
      <div className="space-y-3">
        <p className="eyebrow">VIP</p>
        <h2 className="section-title text-[2rem] md:text-[2.6rem]">{t('vip_title')}</h2>
        <p className="section-copy max-w-2xl">{t('vip_description')}</p>
      </div>

      <label className="block space-y-2">
        <span className="micro-label">{t('full_name')}</span>
        <input value={formData.name} onChange={(event) => updateField('name', event.target.value)} className="input-shell" required />
      </label>

      <label className="block space-y-2">
        <span className="micro-label">{t('corporate_email')}</span>
        <input type="email" value={formData.email} onChange={(event) => updateField('email', event.target.value)} className="input-shell" required />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="micro-label">{t('passport')}</span>
          <input value={formData.passport} onChange={(event) => updateField('passport', event.target.value)} className="input-shell" required />
        </label>

        <label className="block space-y-2">
          <span className="micro-label">{t('password')}</span>
          <input type="password" value={formData.password} onChange={(event) => updateField('password', event.target.value)} className="input-shell" required />
        </label>
      </div>

      <button type="submit" disabled={isSubmitting} className="cta-primary w-full justify-center sm:w-auto sm:min-w-[240px]">
        {isSubmitting ? '...' : t('vip_submit')}
      </button>
    </form>
  );
};
