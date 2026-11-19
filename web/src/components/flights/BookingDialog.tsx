'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useSession } from '@/components/providers/SessionProvider';
import type { Flight } from '@/types/flight';

interface Seat { number: string; supplement: number; available: boolean }

export function BookingDialog({ flight, onClose }: { flight: Flight; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const { t } = useTranslation();
  const { user } = useSession();
  const router = useRouter();
  const [passengers, setPassengers] = useState({ adults: 1, children: 0, infants: 0 });
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    dialog.current?.showModal();
    const controller = new AbortController();
    fetch(`/api/flights/seats?flightId=${flight.id}`, { cache: 'no-store', signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error(); return response.json(); })
      .then(setSeats).catch((error) => { if (error.name !== 'AbortError') setFailed(true); });
    return () => controller.abort();
  }, [flight.id]);
  const count = passengers.adults + passengers.children;
  const extras = seats.filter((seat) => selected.includes(seat.number)).reduce((sum, seat) => sum + seat.supplement, 0);
  const total = Math.round(flight.finalPrice * 100) * count + extras;
  const valid = selected.length === count && passengers.infants <= passengers.adults
    && count + passengers.infants <= 9;
  const pay = async () => {
    if (!user) { onClose(); router.push('/login'); return; }
    setBusy(true);
    try {
      const response = await fetch('/api/payments/checkout-session', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flightId: flight.id, ...passengers, selectedSeats: selected }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? t('checkout_error'));
      window.location.assign(data.checkoutUrl);
    } catch (error) { toast.error(error instanceof Error ? error.message : t('checkout_error')); setBusy(false); }
  };
  return <dialog ref={dialog} className="booking-dialog" onClose={onClose} aria-labelledby="booking-title">
    <div className="flex items-start justify-between gap-4"><div><p className="eyebrow">{t('customize')}</p><h2 id="booking-title" className="section-title mt-3 text-3xl">{flight.origin} → {flight.destination}</h2></div><button className="icon-button" aria-label={t('close')} onClick={() => dialog.current?.close()}>×</button></div>
    <div className="my-6 grid gap-4 sm:grid-cols-3">{(['adults', 'children', 'infants'] as const).map((kind) =>
      <label key={kind} className="space-y-2"><span className="micro-label">{t(kind)}</span><input className="input-shell" type="number" min={kind === 'adults' ? 1 : 0} max={9} value={passengers[kind]} onChange={(event) => {
        const value = Math.max(kind === 'adults' ? 1 : 0, Math.min(9, Number(event.target.value)));
        const next = { ...passengers, [kind]: value };
        setPassengers(next);
        setSelected((current) => current.slice(0, next.adults + next.children));
      }} /></label>)}</div>
    <p className="section-copy">{t('seat_note')}</p>
    {failed && <p role="alert">{t('flights_error')}</p>}
    <div className="my-5 grid max-h-72 grid-cols-6 gap-2 overflow-y-auto p-1" aria-label={t('seat_map')}>
      {seats.map((seat) => <button key={seat.number} type="button" className={`seat-choice ${selected.includes(seat.number) ? 'seat-selected' : ''}`}
        disabled={!seat.available} aria-pressed={selected.includes(seat.number)}
        aria-label={`${seat.number} · ${(seat.supplement / 100).toFixed(2)} EUR`}
        onClick={() => setSelected((current) => current.includes(seat.number) ? current.filter((number) => number !== seat.number) : current.length < count ? [...current, seat.number] : current)}>
        {seat.number}<small className="block">{seat.supplement ? '+18€' : '—'}</small>
      </button>)}
    </div>
    <div className="surface-card space-y-3 p-5">
      <p>{t('selected_seats')}: {selected.join(', ') || '—'} ({selected.length}/{count})</p>
      <p>{t('seat_supplement')}: {(extras / 100).toFixed(2)} €</p>
      <p className="text-2xl font-bold">{t('estimated_total')}: {(total / 100).toFixed(2)} €</p>
      <p className="section-copy text-sm">{t('price_note')}</p>
      <button className="cta-primary w-full justify-center" disabled={!valid || busy} onClick={() => void pay()}>{busy ? t('loading') : user ? t('continue_payment') : t('login')}</button>
    </div>
  </dialog>;
}
