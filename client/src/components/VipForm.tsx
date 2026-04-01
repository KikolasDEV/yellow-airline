import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const vipSchema = z.object({
  name: z.string().min(2, 'El nombre es muy corto'),
  email: z.string().email('Email inválido'),
  passport: z.string().min(5, 'Pasaporte requerido para estatus VIP'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type VipFormData = z.infer<typeof vipSchema>;

export const VipForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<VipFormData>({
    resolver: zodResolver(vipSchema),
  });

  const onSubmit = async (data: VipFormData) => {
    try {
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(t('vip_register_success'));
        reset();
        navigate('/login');
      } else {
        toast.error(result.error || t('vip_register_error'));
      }
    } catch (error) {
      console.error('Fallo de red en Yellow Airline:', error);
      toast.error(t('vip_register_connection_error'));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
      <label className="block space-y-2">
        <span className="text-xs font-black uppercase tracking-[0.24em] text-[var(--text-muted)]">{t('full_name')}</span>
        <input {...register('name')} className="input-shell" />
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </label>

      <label className="block space-y-2">
        <span className="text-xs font-black uppercase tracking-[0.24em] text-[var(--text-muted)]">{t('corporate_email')}</span>
        <input {...register('email')} className="input-shell" />
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-xs font-black uppercase tracking-[0.24em] text-[var(--text-muted)]">{t('passport')}</span>
          <input {...register('passport')} className="input-shell" />
          {errors.passport && <p className="text-xs text-red-500">{errors.passport.message}</p>}
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-black uppercase tracking-[0.24em] text-[var(--text-muted)]">{t('password')}</span>
          <input type="password" {...register('password')} className="input-shell" />
          {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
        </label>
      </div>

      <button type="submit" className="cta-primary w-full justify-center">{t('vip_submit')}</button>
    </form>
  );
};
