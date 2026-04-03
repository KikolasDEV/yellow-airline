import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { BookingCustomizationSheet } from '../components/BookingCustomizationSheet';
import { FlightCard } from '../components/FlightCard';
import { FlightSearchPanel } from '../components/FlightSearchPanel';
import { FlightSkeleton } from '../components/FlightSkeleton';
import { PersonalizedOffersCarousel } from '../components/PersonalizedOffersCarousel';
import { recordSearchInsight, useSearchInsights } from '../hooks/useSearchInsights';
import { apiUrl } from '../lib/api';
import { matchesPlaceQuery } from '../lib/places';
import type { Flight, PassengerCount } from '../types';

type TripMode = 'oneWay' | 'roundTrip';

export const Home = () => {
  const { t } = useTranslation();
  const { recommendedOffers, topDestination } = useSearchInsights();
  const [allFlights, setAllFlights] = useState<Flight[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [tripMode, setTripMode] = useState<TripMode>('roundTrip');
  const [passengers, setPassengers] = useState<PassengerCount>({ adults: 1, children: 0, infants: 0 });
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [hasError, setHasError] = useState(false);

  const deferredOrigin = useDeferredValue(origin);
  const deferredDestination = useDeferredValue(destination);

  useEffect(() => {
    const fetchFlights = async () => {
      setIsInitialLoading(true);
      setHasError(false);

      try {
        const response = await fetch(apiUrl('/flights'));
        if (!response.ok) {
          throw new Error('Flights request failed');
        }

        const data = await response.json();
        setAllFlights(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error al obtener vuelos:', error);
        setAllFlights([]);
        setHasError(true);
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchFlights();
  }, []);

  useEffect(() => {
    const trackingTimeout = window.setTimeout(() => {
      if (origin.trim().length >= 2 || destination.trim().length >= 2) {
        recordSearchInsight(origin, destination);
      }
    }, 550);

    return () => window.clearTimeout(trackingTimeout);
  }, [origin, destination]);

  const flights = useMemo(
    () => allFlights.filter((flight) => {
      const originMatches = deferredOrigin.trim() ? matchesPlaceQuery(flight.origin, deferredOrigin) : true;
      const destinationMatches = deferredDestination.trim() ? matchesPlaceQuery(flight.destination, deferredDestination) : true;

      if (!originMatches || !destinationMatches) {
        return false;
      }

      if (!departureDate) {
        return true;
      }

      return flight.departureTime.slice(0, 10) === departureDate;
    }),
    [allFlights, deferredDestination, deferredOrigin, departureDate],
  );

  const quickResults = flights.slice(0, 3);

  const handleApplyOffer = (offer: { originPreset?: string; destinationPreset?: string; city?: string; country: string }) => {
    setOrigin(offer.originPreset ?? 'Madrid');
    setDestination(offer.destinationPreset ?? offer.city ?? offer.country);
  };

  const handleQuickReserve = (flight: Flight) => {
    setSelectedFlight(flight);
  };

  const handleConfirmBooking = async ({ passengers: selectedPassengers }: { passengers: PassengerCount; selectedSeats: string[]; extraTotal: number }) => {
    if (!selectedFlight) {
      return false;
    }

    const token = localStorage.getItem('token');

    if (!token) {
      toast.error(t('members_only_booking'));
      return false;
    }

    try {
      const response = await fetch(apiUrl('/bookings/checkout-session'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          flightId: selectedFlight.id,
          ...selectedPassengers,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.checkoutUrl) {
          window.location.assign(data.checkoutUrl);
          return true;
        }

        toast.error(t('booking_checkout_unavailable'));
        return false;
      }

      toast.error(t('booking_failed'));
      return false;
    } catch {
      toast.error(t('booking_connection_error'));
      return false;
    }
  };

  return (
    <div className="space-y-8 pb-6 md:space-y-10 lg:space-y-12">
      <section className="hero-shell p-4 md:p-6 lg:p-7">
        <div className="relative z-10 space-y-5">
          <p className="eyebrow text-white/68">{t('home_eyebrow')}</p>

          <FlightSearchPanel
            flights={allFlights}
            isLoading={isInitialLoading}
            hasError={hasError}
            origin={origin}
            destination={destination}
            onOriginChange={setOrigin}
            onDestinationChange={setDestination}
            departureDate={departureDate}
            returnDate={returnDate}
            onDepartureDateChange={setDepartureDate}
            onReturnDateChange={setReturnDate}
            tripMode={tripMode}
            onTripModeChange={setTripMode}
            passengers={passengers}
            onPassengersChange={setPassengers}
            quickResults={quickResults}
            onReserveFlight={handleQuickReserve}
          />
        </div>
      </section>

      <section id="offers-section">
        <PersonalizedOffersCarousel offers={recommendedOffers} topDestination={topDestination} onApplyOffer={handleApplyOffer} />
      </section>

      <section className="space-y-4" id="inventory-section">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">{t('inventory_eyebrow')}</p>
            <h2 className="section-title">{t('inventory_title')}</h2>
          </div>
          <p className="section-copy max-w-xl">{t('inventory_copy')}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {isInitialLoading ? (
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

      {selectedFlight && (
        <BookingCustomizationSheet
          flight={selectedFlight}
          isOpen={Boolean(selectedFlight)}
          onClose={() => setSelectedFlight(null)}
          onConfirm={handleConfirmBooking}
        />
      )}
    </div>
  );
};
