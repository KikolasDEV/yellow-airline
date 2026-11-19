'use client';

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';
import { BookingDialog } from './BookingDialog';
import type { Flight } from '@/types/flight';

const subscribe = (notify: () => void) => {
  window.addEventListener('storage', notify);
  window.addEventListener('destination-changed', notify);
  return () => { window.removeEventListener('storage', notify); window.removeEventListener('destination-changed', notify); };
};
const readDestination = () => { try { return localStorage.getItem('yellow-airline-destination') ?? ''; } catch { return ''; } };

export const FlightInventory = () => {
  const { t, i18n } = useTranslation();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [selected, setSelected] = useState<Flight | null>(null);
  const recommendation = useSyncExternalStore(subscribe, readDestination, () => '');
  const locale = i18n.language.startsWith('en') ? 'en-GB' : 'es-ES';

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/flights', { cache: 'no-store', signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error(); return response.json(); })
      .then((data) => setFlights(Array.isArray(data) ? data : []))
      .catch((failure) => { if (failure.name !== 'AbortError') setError(true); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const matches = flights.filter((flight) =>
    normalize(flight.origin).includes(normalize(origin)) && normalize(flight.destination).includes(normalize(destination))
    && (!date || flight.departureTime.slice(0, 10) === date));
  const destinations = useMemo(() => {
    const cities = [...new Set(flights.map((flight) => flight.destination))];
    return cities.sort((left, right) => Number(right === recommendation) - Number(left === recommendation)).slice(0, 4);
  }, [flights, recommendation]);
  const days = [...new Set(flights.filter((flight) =>
    normalize(flight.origin).includes(normalize(origin)) && normalize(flight.destination).includes(normalize(destination)))
    .map((flight) => flight.departureTime.slice(0, 10)))];

  const choose = (flight: Flight) => {
    setSelected(flight);
    try {
      localStorage.setItem('yellow-airline-destination', flight.destination);
      window.dispatchEvent(new Event('destination-changed'));
    } catch { /* Optional preference. */ }
  };

  return <div className="space-y-10 pb-8">
    <section className="hero-shell p-6 md:p-10">
      <p className="eyebrow text-yellow-300">Yellow Airline / Gold</p>
      <h1 className="display-title mt-5 max-w-3xl text-5xl text-white md:text-7xl">{t('travel_title')}</h1>
      <p className="mt-5 max-w-xl leading-8 text-white/75">{t('travel_copy')}</p>
      <div className="mt-8 grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto]">
        <label className="space-y-2"><span className="micro-label text-white/75">{t('search_origin')}</span>
          <input className="input-shell" list="origins" value={origin} onChange={(event) => setOrigin(event.target.value)} placeholder={t('any_city')} />
        </label>
        <label className="space-y-2"><span className="micro-label text-white/75">{t('search_destination')}</span>
          <input className="input-shell" list="destinations" value={destination} onChange={(event) => setDestination(event.target.value)} placeholder={t('any_city')} />
        </label>
        <label className="space-y-2"><span className="micro-label text-white/75">{t('search_date')}</span>
          <input className="input-shell" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
        <button className="cta-secondary self-end" onClick={() => { setOrigin(''); setDestination(''); setDate(''); }}>{t('clear_filters')}</button>
      </div>
      <datalist id="origins">{[...new Set(flights.map((flight) => flight.origin))].map((city) => <option key={city}>{city}</option>)}</datalist>
      <datalist id="destinations">{[...new Set(flights.map((flight) => flight.destination))].map((city) => <option key={city}>{city}</option>)}</datalist>
      <p className="mt-5 text-sm text-white/60">{t('one_way_note')}</p>
      <div className="mt-4 flex flex-wrap gap-2" aria-label={t('available_dates')}>
        {days.map((day) => <button key={day} className="booking-chip" aria-pressed={date === day} onClick={() => setDate(day)}>
          {new Date(`${day}T12:00:00Z`).toLocaleDateString(locale, { day: 'numeric', month: 'short', timeZone: 'UTC' })}
        </button>)}
      </div>
    </section>
    <section id="offers-section" className="space-y-4">
      <p className="eyebrow">{t('discover')}</p>
      <h2 className="section-title text-3xl">{t('discover_title')}</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {destinations.map((city) => <button key={city} className="surface-card p-6 text-left" onClick={() => { setDestination(city); setDate(''); }}>
          <span className="micro-label">{t('destination')}</span><span className="display-title mt-3 block text-3xl">{city} ↗</span>
          <span className="mt-4 block text-sm text-[var(--text-secondary)]">{t('from_price', { price: Math.min(...flights.filter((flight) => flight.destination === city).map((flight) => flight.finalPrice)).toFixed(2) })}</span>
        </button>)}
      </div>
    </section>
    <section id="inventory-section" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3"><h2 className="section-title text-3xl">{t('available_flights')}</h2><p aria-live="polite">{t('results_count', { count: matches.length })}</p></div>
      {loading && <p role="status">{t('loading')}</p>}
      {error && <p role="alert">{t('flights_error')}</p>}
      {!loading && !error && !matches.length && <p className="surface-card p-8">{t('no_flights')}</p>}
      <div className="grid gap-5 lg:grid-cols-2">{matches.map((flight) => <article key={flight.id} className="surface-card p-6">
        <div className="flex items-start justify-between gap-4"><div><p className="micro-label">{flight.origin} →</p><h3 className="display-title mt-3 text-4xl">{flight.destination}</h3></div><span className="promo-badge">{flight.finalPrice.toFixed(2)} €</span></div>
        <p className="mt-5 text-[var(--text-secondary)]">{new Date(flight.departureTime).toLocaleString(locale, { timeZone: 'UTC' })} UTC</p>
        <p className="mt-3 text-sm">{t('seats_left', { count: flight.availableSeats })} · {t('per_person')}</p>
        <button className="cta-primary mt-6 w-full justify-center" disabled={flight.availableSeats < 1} onClick={() => choose(flight)}>{t('book_flight')}</button>
      </article>)}</div>
    </section>
    {selected && <BookingDialog flight={selected} onClose={() => setSelected(null)} />}
  </div>;
};
