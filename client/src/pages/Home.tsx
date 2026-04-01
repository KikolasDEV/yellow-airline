import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FlightCard } from '../components/FlightCard';
import { FlightSkeleton } from '../components/FlightSkeleton';
import { PersonalizedOffersCarousel } from '../components/PersonalizedOffersCarousel';
import { AnimatedRoute } from '../components/AnimatedRoute';
import { recordSearchInsight, useSearchInsights } from '../hooks/useSearchInsights';
import type { Flight, OfferCard } from '../types';

export const Home = () => {
  const { t } = useTranslation();
  const { recommendedOffers, topDestination } = useSearchInsights();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let timeoutId: number | undefined;

    const fetchFlights = async () => {
      setLoading(true);
      setHasError(false);

      try {
        const url = `http://localhost:5000/api/flights?origin=${origin}&destination=${destination}`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Flights request failed');
        }

        const data = await response.json();
        setFlights(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error al obtener vuelos:', error);
        setFlights([]);
        setHasError(true);
      } finally {
        timeoutId = window.setTimeout(() => setLoading(false), 450);
      }
    };

    fetchFlights();

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [origin, destination]);

  useEffect(() => {
    const trackingTimeout = window.setTimeout(() => {
      if (origin.trim().length >= 2 || destination.trim().length >= 2) {
        recordSearchInsight(origin, destination);
      }
    }, 550);

    return () => window.clearTimeout(trackingTimeout);
  }, [origin, destination]);

  const heroDestination = useMemo(() => {
    if (destination.trim()) {
      return destination;
    }

    if (topDestination) {
      return topDestination;
    }

    return 'Paris';
  }, [destination, topDestination]);

  const handleApplyOffer = (offer: OfferCard) => {
    setOrigin(offer.originPreset ?? 'Madrid');
    setDestination(offer.destinationPreset ?? offer.city ?? offer.country);
  };

  const summaryCopy = loading
    ? t('searching')
    : hasError
      ? t('load_flights_error')
      : `${flights.length} ${t('flights_found')}`;

  return (
    <div className="space-y-8 pb-6 md:space-y-10">
      <section className="hero-shell p-6 md:p-8 lg:p-10">
        <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_420px] lg:items-end">
          <div className="space-y-6">
            <p className="eyebrow">Intelligent Cargo Lounge</p>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-black tracking-[-0.08em] text-white md:text-6xl">{t('welcome')}</h1>
              <p className="max-w-2xl text-sm leading-7 text-white/72 md:text-base">
                Search behavior shapes the offers you see, cabin motion feels tactile, and every route now opens into a richer booking ritual.
              </p>
            </div>

            <AnimatedRoute origin={origin || 'Madrid'} destination={heroDestination} />

            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_220px]">
              <label className="rounded-[1.5rem] border border-white/12 bg-white/8 p-3 backdrop-blur-xl">
                <span className="eyebrow text-white/54">Origin</span>
                <input
                  type="text"
                  value={origin}
                  placeholder={t('search_origin_placeholder')}
                  className="input-shell mt-2"
                  onChange={(event) => setOrigin(event.target.value)}
                />
              </label>

              <label className="rounded-[1.5rem] border border-white/12 bg-white/8 p-3 backdrop-blur-xl">
                <span className="eyebrow text-white/54">Destination</span>
                <input
                  type="text"
                  value={destination}
                  placeholder={t('search_dest_placeholder')}
                  className="input-shell mt-2"
                  onChange={(event) => setDestination(event.target.value)}
                />
              </label>

              <div className="flex flex-col justify-between rounded-[1.5rem] border border-white/12 bg-white/8 p-4 backdrop-blur-xl">
                <div>
                  <p className="eyebrow text-white/54">Live Status</p>
                  <p className="mt-2 text-2xl font-black text-white">{summaryCopy}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/70">
                  <span className="promo-badge">Dark mode ready</span>
                  <span className="promo-badge">Seat-first booking</span>
                </div>
              </div>
            </div>
          </div>

          <motion.aside
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[1.75rem] border border-white/12 bg-white/8 p-5 backdrop-blur-xl"
          >
            <div className="space-y-5">
              <div>
                <p className="eyebrow">Behavior Snapshot</p>
                <h2 className="section-title text-white md:text-4xl">Routes now adapt to intent</h2>
              </div>
              <div className="space-y-3 text-sm text-white/76">
                <div className="booking-chip">Top destination signal: <strong>{topDestination ?? 'none yet'}</strong></div>
                <div className="booking-chip">Recommended stack: <strong>{recommendedOffers[0]?.title ?? 'editorial fallback'}</strong></div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-white/12 bg-white/6 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-white/48">Motion</p>
                  <p className="mt-2 text-sm text-white/76">Flight cards, route rails and passenger counters now respond with softer motion.</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/12 bg-white/6 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-white/48">Customization</p>
                  <p className="mt-2 text-sm text-white/76">Choose seats visually before confirming your booking.</p>
                </div>
              </div>
            </div>
          </motion.aside>
        </div>
      </section>

      <PersonalizedOffersCarousel offers={recommendedOffers} topDestination={topDestination} onApplyOffer={handleApplyOffer} />

      <section className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Flight Inventory</p>
            <h2 className="section-title">Interactive routes with tactile booking layers</h2>
          </div>
          <p className="section-copy max-w-xl">Cards now expand visually, seat selection happens before checkout, and route motion keeps the entire board feeling alive.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {loading ? (
            Array(4).fill(0).map((_, index) => <FlightSkeleton key={index} />)
          ) : hasError ? (
            <div className="surface-card col-span-full px-6 py-10 text-center">
              <p className="text-xl font-bold text-red-500">{t('load_flights_error')}</p>
            </div>
          ) : flights.length > 0 ? (
            flights.map((flight) => <FlightCard key={flight.id} flight={flight} />)
          ) : (
            <div className="surface-card col-span-full px-6 py-16 text-center">
              <p className="text-2xl font-semibold text-[var(--text-secondary)]">{t('no_routes')}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
