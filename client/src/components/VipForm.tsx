import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { apiUrl } from '../lib/api';

const createVipSchema = (t: (key: string) => string) => z.object({
  name: z.string().min(2, t('validation_name_short')),
  email: z.string().email(t('validation_email_invalid')),
  passport: z.string().min(5, t('validation_passport_required')),
  password: z.string().min(6, t('validation_password_short')),
});

type VipFormData = z.infer<ReturnType<typeof createVipSchema>>;

export const VipForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const vipSchema = createVipSchema(t);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<VipFormData>({
    resolver: zodResolver(vipSchema),
  });

  const onSubmit = async (data: VipFormData) => {
    try {
      const response = await fetch(apiUrl('/users/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      await response.json();

      if (response.ok) {
        toast.success(t('vip_register_success'));
        reset();
        navigate('/login');
      } else {
        toast.error(t('vip_register_error'));
      }
    } catch (error) {
      console.error('Fallo de red en Yellow Airline:', error);
      toast.error(t('vip_register_connection_error'));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-[1.35rem] border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--surface-elevated)_84%,transparent_16%)] p-4">
          <p className="micro-label">{t('vip_profile_note')}</p>
          <p className="body-copy-muted mt-2">{t('vip_profile_note_copy')}</p>
        </div>
        <div className="rounded-[1.35rem] border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--surface-elevated)_84%,transparent_16%)] p-4">
          <p className="micro-label">{t('vip_secure_note')}</p>
          <p className="body-copy-muted mt-2">{t('vip_secure_note_copy')}</p>
        </div>
      </div>

      <label className="block space-y-2">
        <span className="micro-label">{t('full_name')}</span>
        <input {...register('name')} className="input-shell" />
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </label>

      <label className="block space-y-2">
        <span className="micro-label">{t('corporate_email')}</span>
        <input {...register('email')} className="input-shell" />
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="micro-label">{t('passport')}</span>
          <input {...register('passport')} className="input-shell" />
          {errors.passport && <p className="text-xs text-red-500">{errors.passport.message}</p>}
        </label>

        <label className="block space-y-2">
          <span className="micro-label">{t('password')}</span>
          <input type="password" {...register('password')} className="input-shell" />
          {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
        </label>
      </div>

      <button type="submit" className="cta-primary w-full justify-center sm:w-auto sm:min-w-[240px]">{t('vip_submit')}</button>
    </form>
  );
};
