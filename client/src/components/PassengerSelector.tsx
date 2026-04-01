import { useTranslation } from 'react-i18next';

interface PassengerProps {
  count: { adults: number; children: number; infants: number };
  setCount: React.Dispatch<React.SetStateAction<{ adults: number; children: number; infants: number }>>;
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
    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3 mb-4">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t('Passengers')}</p>
      
      {[
        { id: 'adults' as const, label: t('Adultos'), sub: t('years_12_plus') },
        { id: 'children' as const, label: t('Children'), sub: t('years_2_11') },
        { id: 'infants' as const, label: t('Infants'), sub: t('under_2_years') }
      ].map((p) => (
        <div key={p.id} className="flex justify-between items-center">
          <div>
            <p className="text-sm font-bold leading-none">{p.label}</p>
            <p className="text-[10px] text-gray-400">{p.sub}</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => update(p.id, -1)}
              className="w-6 h-6 flex items-center justify-center bg-white border rounded-full hover:bg-gray-100"
            >-</button>
            <span className="text-sm font-bold w-4 text-center">{count[p.id]}</span>
            <button 
              onClick={() => update(p.id, 1)}
              className="w-6 h-6 flex items-center justify-center bg-black text-white rounded-full hover:bg-gray-800"
            >+</button>
          </div>
        </div>
      ))}
    </div>
  );
};
