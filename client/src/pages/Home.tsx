import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FlightCard } from '../components/FlightCard';
import { FlightSkeleton } from '../components/FlightSkeleton';
import { PersonalizedOffersCarousel } from '../components/PersonalizedOffersCarousel';
import { AnimatedRoute } from '../components/AnimatedRoute';
import { recordSearchInsight, useSearchInsights } from '../hooks/useSearchInsights';
import { apiUrl } from '../lib/api';
import { translatePlaceLabel } from '../lib/places';
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
        const params = new URLSearchParams({ origin, destination });
        const url = `${apiUrl('/flights')}?${params.toString()}`;
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
      return translatePlaceLabel(destination, t);
    }

    if (topDestination) {
      return translatePlaceLabel(topDestination, t);
    }

    return t('city_paris');
  }, [destination, topDestination, t]);

  const handleApplyOffer = (offer: OfferCard) => {
    setOrigin(offer.originPreset ?? 'Madrid');
    setDestination(offer.destinationPreset ?? offer.city ?? offer.country);
  };

  const summaryCopy = loading
    ? t('searching')
    : hasError
      ? t('load_flights_error')
      : `${flights.length} ${t('flights_found')}`;

  const experienceMetrics = [
    { label: t('home_metric_inventory'), value: loading ? '...' : String(flights.length).padStart(2, '0') },
    { label: t('home_metric_signal'), value: topDestination ? translatePlaceLabel(topDestination, t) : t('city_paris') },
    { label: t('home_metric_mood'), value: t('home_metric_mood_value') },
  ];

  const heroMotion = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.55,
        ease: 'easeOut' as const,
        staggerChildren: 0.08,
      },
    },
  };

  const heroItemMotion = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
  };

  return (
    <div className="space-y-8 pb-6 md:space-y-10 lg:space-y-12">
      <section className="hero-shell p-5 md:p-8 lg:p-10">
        <motion.div variants={heroMotion} initial="hidden" animate="visible" className="relative z-10 grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_380px] xl:items-end">
          <div className="space-y-6 lg:space-y-8">
            <motion.div variants={heroItemMotion} className="flex flex-wrap items-center gap-2 text-xs text-white/70">
              <span className="promo-badge">{t('home_badge_responsive')}</span>
              <span className="promo-badge">{t('home_badge_luxury')}</span>
            </motion.div>

            <motion.div variants={heroItemMotion} className="space-y-4">
              <p className="eyebrow text-white/60">{t('home_eyebrow')}</p>
              <h1 className="display-title max-w-5xl text-[3.3rem] text-white md:text-7xl xl:text-[5.9rem]">{t('welcome')}</h1>
              <p className="max-w-2xl text-sm leading-7 text-white/74 md:text-[1.02rem] md:leading-8">
                {t('home_intro_copy')}
              </p>
            </motion.div>

            <motion.div variants={heroItemMotion} className="rounded-[1.75rem] border border-white/10 bg-white/8 p-4 shadow-[0_18px_60px_rgba(5,10,20,0.16)] backdrop-blur-xl md:p-5">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_220px]">
                <label className="rounded-[1.35rem] border border-white/10 bg-black/10 p-3 transition-transform duration-200 hover:-translate-y-[1px]">
                  <span className="eyebrow text-white/54">{t('search_origin')}</span>
                  <input
                    type="text"
                    value={origin}
                    placeholder={t('search_origin_placeholder')}
                    className="input-shell mt-2"
                    onChange={(event) => setOrigin(event.target.value)}
                  />
                </label>

                <label className="rounded-[1.35rem] border border-white/10 bg-black/10 p-3 transition-transform duration-200 hover:-translate-y-[1px]">
                  <span className="eyebrow text-white/54">{t('search_dest')}</span>
                  <input
                    type="text"
                    value={destination}
                    placeholder={t('search_dest_placeholder')}
                    className="input-shell mt-2"
                    onChange={(event) => setDestination(event.target.value)}
                  />
                </label>

                <div className="flex flex-col justify-between rounded-[1.35rem] border border-white/10 bg-black/10 p-4">
                  <div>
                    <p className="eyebrow text-white/54">{t('home_live_status')}</p>
                    <p className="mt-3 text-2xl font-black text-white">{summaryCopy}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/70">
                    <span className="promo-badge">{t('home_badge_adaptive')}</span>
                    <span className="promo-badge">{t('home_badge_seat_first')}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={heroItemMotion}>
              <AnimatedRoute origin={origin || 'Madrid'} destination={heroDestination} />
            </motion.div>

            <motion.div variants={heroItemMotion} className="grid gap-3 sm:grid-cols-3">
              {experienceMetrics.map((metric) => (
                <motion.div key={metric.label} whileHover={{ y: -2 }} className="rounded-[1.5rem] border border-white/10 bg-white/8 p-4 backdrop-blur-xl">
                  <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-white/48">{metric.label}</p>
                  <p className="display-title mt-3 text-3xl text-white md:text-4xl">{metric.value}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          <motion.aside initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-[1.9rem] border border-white/12 bg-white/8 p-5 backdrop-blur-xl md:p-6">
            <div className="space-y-5">
              <div>
                <p className="eyebrow">{t('home_snapshot_eyebrow')}</p>
                <h2 className="display-title text-4xl text-white md:text-5xl">{t('home_snapshot_title')}</h2>
              </div>
              <p className="text-sm leading-7 text-white/74">{t('home_snapshot_copy')}</p>
              <div className="space-y-3 text-sm text-white/78">
                <div className="booking-chip">{t('home_snapshot_top_destination')}: <strong>{topDestination ?? t('home_snapshot_none')}</strong></div>
                <div className="booking-chip">{t('home_snapshot_recommended_stack')}: <strong>{recommendedOffers[0] ? t(recommendedOffers[0].titleKey) : t('home_snapshot_fallback')}</strong></div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-[1.5rem] border border-white/12 bg-white/6 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-white/48">{t('home_snapshot_motion_label')}</p>
                  <p className="mt-2 text-sm text-white/76">{t('home_snapshot_motion_copy')}</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/12 bg-white/6 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-white/48">{t('home_snapshot_responsive_label')}</p>
                  <p className="mt-2 text-sm text-white/76">{t('home_snapshot_responsive_copy')}</p>
                </div>
              </div>
            </div>
          </motion.aside>
        </motion.div>
      </section>

      <PersonalizedOffersCarousel offers={recommendedOffers} topDestination={topDestination} onApplyOffer={handleApplyOffer} />

      <section className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">{t('inventory_eyebrow')}</p>
            <h2 className="section-title">{t('inventory_title')}</h2>
          </div>
          <p className="section-copy max-w-xl">{t('inventory_copy')}</p>
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

      <section className="section-frame p-5 md:p-6 lg:p-8">
        <div className="relative z-10 grid gap-4 md:grid-cols-3">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.45 }} className="stat-tile">
            <p className="stat-kicker">{t('benefit_booking_title')}</p>
            <p className="stat-value mt-3">{t('benefit_booking_value')}</p>
            <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">{t('benefit_booking_copy')}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.5, delay: 0.05 }} className="stat-tile">
            <p className="stat-kicker">{t('benefit_visual_title')}</p>
            <p className="stat-value mt-3">{t('benefit_visual_value')}</p>
            <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">{t('benefit_visual_copy')}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.55, delay: 0.1 }} className="stat-tile">
            <p className="stat-kicker">{t('benefit_responsive_title')}</p>
            <p className="stat-value mt-3">{t('benefit_responsive_value')}</p>
            <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">{t('benefit_responsive_copy')}</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
