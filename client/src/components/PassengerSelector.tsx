import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import type { PassengerCount } from '../types';

interface PassengerProps {
  count: PassengerCount;
  setCount: React.Dispatch<React.SetStateAction<PassengerCount>>;
}

export const PassengerSelector = ({ count, setCount }: PassengerProps) => {
  const { t } = useTranslation();

  const update = (type: keyof typeof count, delta: number) => {
    setCount(prev => {
      const newVal = prev[type] + delta;
      // Regla de negocio: mínimo 1 adulto, máximo 9 total, no negativos
      if (type === 'adults' && newVal < 1) return prev;
      const nextCount = { ...prev, [type]: newVal };
      const totalPassengers = nextCount.adults + nextCount.children + nextCount.infants;

      if (newVal < 0 || newVal > 9 || totalPassengers > 9) return prev;
      return { ...prev, [type]: newVal };
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="eyebrow">{t('passenger_selector_eyebrow')}</p>
          <p className="text-sm text-[var(--text-secondary)]">{t('passenger_selector_copy')}</p>
        </div>
        <div className="booking-chip booking-chip-strong">{t('passenger_total', { count: count.adults + count.children + count.infants })}</div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="stat-tile">
          <p className="stat-kicker">{t('Adultos')}</p>
          <p className="stat-value mt-3">{count.adults}</p>
        </div>
        <div className="stat-tile">
          <p className="stat-kicker">{t('Children')}</p>
          <p className="stat-value mt-3">{count.children}</p>
        </div>
        <div className="stat-tile">
          <p className="stat-kicker">{t('Infants')}</p>
          <p className="stat-value mt-3">{count.infants}</p>
        </div>
      </div>
      
      {[
        { id: 'adults' as const, label: t('Adultos'), sub: t('years_12_plus') },
        { id: 'children' as const, label: t('Children'), sub: t('years_2_11') },
        { id: 'infants' as const, label: t('Infants'), sub: t('under_2_years') }
      ].map((p) => (
        <motion.div
          key={p.id}
          layout
          className="flex items-center justify-between rounded-[1.4rem] border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--surface-elevated)_92%,transparent_8%)] p-4"
        >
          <div>
            <p className="text-sm font-bold leading-none text-[var(--text-primary)]">{p.label}</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">{p.sub}</p>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-[var(--border-soft)] px-2 py-1">
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => update(p.id, -1)}
              className="icon-button h-8 w-8"
            >-</motion.button>
            <motion.span key={`${p.id}-${count[p.id]}`} initial={{ scale: 0.85, opacity: 0.6 }} animate={{ scale: 1, opacity: 1 }} className="w-6 text-center text-base font-black text-[var(--text-primary)]">{count[p.id]}</motion.span>
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => update(p.id, 1)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--text-primary)] text-sm text-[var(--text-inverse)] shadow-[0_12px_24px_rgba(15,23,42,0.18)]"
            >+</motion.button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
