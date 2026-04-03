import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { matchesPlaceQuery, translatePlaceLabel } from '../lib/places';
import type { Flight, PassengerCount } from '../types';

type SearchTab = 'flights' | 'hotels' | 'cars';
type TripMode = 'oneWay' | 'roundTrip';

interface FlightSearchPanelProps {
  flights: Flight[];
  isLoading: boolean;
  hasError: boolean;
  origin: string;
  destination: string;
  onOriginChange: (value: string) => void;
  onDestinationChange: (value: string) => void;
  departureDate: string;
  returnDate: string;
  onDepartureDateChange: (value: string) => void;
  onReturnDateChange: (value: string) => void;
  tripMode: TripMode;
  onTripModeChange: (value: TripMode) => void;
  passengers: PassengerCount;
  onPassengersChange: (value: PassengerCount) => void;
  quickResults: Flight[];
  onReserveFlight: (flight: Flight) => void;
}

const weekdayShort = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const formatMonthLabel = (date: Date, locale: string) =>
  new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(date);

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateLabel = (value: string, locale: string) => {
  if (!value) {
    return '--/--/----';
  }

  const parsed = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(parsed);
};

const getMonthCells = (monthDate: Date) => {
  const firstDayOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const firstWeekday = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
  const cells: Array<Date | null> = [];

  for (let index = 0; index < firstWeekday; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
};

const getDefaultVisibleMonth = (departureDate: string, fallbackDate: Date) => {
  if (departureDate) {
    const parsed = new Date(`${departureDate}T00:00:00`);
    return new Date(parsed.getFullYear(), parsed.getMonth(), 1);
  }

  return new Date(fallbackDate.getFullYear(), fallbackDate.getMonth(), 1);
};

export const FlightSearchPanel = ({
  flights,
  isLoading,
  hasError,
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
  departureDate,
  returnDate,
  onDepartureDateChange,
  onReturnDateChange,
  tripMode,
  onTripModeChange,
  passengers,
  onPassengersChange,
  quickResults,
  onReserveFlight,
}: FlightSearchPanelProps) => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<SearchTab>('flights');
  const [isCalendarOpen, setIsCalendarOpen] = useState(true);
  const [isPassengerOpen, setIsPassengerOpen] = useState(false);
  const [pickingField, setPickingField] = useState<'departure' | 'return'>('departure');
  const [extraSeat, setExtraSeat] = useState(0);
  const locale = i18n.resolvedLanguage?.startsWith('es') ? 'es-ES' : 'en-US';
  const passengerPopoverRef = useRef<HTMLDivElement | null>(null);

  const availableCities = useMemo(() => {
    const cities = new Set<string>();
    flights.forEach((flight) => {
      cities.add(flight.origin);
      cities.add(flight.destination);
    });

    return Array.from(cities).sort((left, right) => left.localeCompare(right));
  }, [flights]);

  const calendarFlights = useMemo(() => {
    return flights.filter((flight) => {
      const originMatch = origin.trim() ? matchesPlaceQuery(flight.origin, origin) : true;
      const destinationMatch = destination.trim() ? matchesPlaceQuery(flight.destination, destination) : true;
      return originMatch && destinationMatch;
    });
  }, [destination, flights, origin]);

  const datePriceMap = useMemo(() => {
    const map = new Map<string, number>();

    calendarFlights.forEach((flight) => {
      const key = flight.departureTime.slice(0, 10);
      const current = map.get(key);
      if (current === undefined || flight.finalPrice < current) {
        map.set(key, flight.finalPrice);
      }
    });

    return map;
  }, [calendarFlights]);

  const bestPriceDate = useMemo(() => {
    const entries = Array.from(datePriceMap.entries());
    if (!entries.length) {
      return null;
    }

    return entries.reduce((bestEntry, currentEntry) => (currentEntry[1] < bestEntry[1] ? currentEntry : bestEntry))[0];
  }, [datePriceMap]);

  const baseDate = useMemo(() => {
    const firstFlightDate = calendarFlights
      .map((flight) => new Date(flight.departureTime))
      .sort((left, right) => left.getTime() - right.getTime())[0];

    if (departureDate) {
      return new Date(`${departureDate}T00:00:00`);
    }

    return firstFlightDate ?? new Date();
  }, [calendarFlights, departureDate]);

  const [visibleMonth, setVisibleMonth] = useState<Date>(() => getDefaultVisibleMonth(departureDate, new Date()));

  useEffect(() => {
    if (!isPassengerOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!passengerPopoverRef.current?.contains(event.target as Node)) {
        setIsPassengerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPassengerOpen]);

  const firstMonth = departureDate ? getDefaultVisibleMonth(departureDate, baseDate) : visibleMonth;
  const secondMonth = new Date(firstMonth.getFullYear(), firstMonth.getMonth() + 1, 1);

  const passengerSummary = useMemo(() => {
    const total = passengers.adults + passengers.children + passengers.infants;
    return `${total} ${total === 1 ? t('search_passenger_selected_singular') : t('search_passenger_selected_plural')}`;
  }, [passengers, t]);

  const passengerBreakdown = useMemo(
    () => `${passengers.adults} ${passengers.adults === 1 ? t('search_passenger_adult_singular') : t('search_passenger_adult_plural')}, ${passengers.children} ${passengers.children === 1 ? t('search_passenger_child_singular') : t('search_passenger_child_plural')}, ${passengers.infants} ${passengers.infants === 1 ? t('search_passenger_infant_singular') : t('search_passenger_infant_plural')}`,
    [passengers, t],
  );

  const updatePassengerCount = (field: keyof PassengerCount, operation: 'increase' | 'decrease') => {
    const currentValue = passengers[field];
    const minimum = field === 'adults' ? 1 : 0;
    const nextValue = operation === 'increase' ? currentValue + 1 : Math.max(minimum, currentValue - 1);
    const nextPassengers = { ...passengers, [field]: nextValue };
    const totalPassengers = nextPassengers.adults + nextPassengers.children + nextPassengers.infants;

    if (totalPassengers > 9) {
      return;
    }

    onPassengersChange(nextPassengers);
  };

  const updateExtraSeat = (operation: 'increase' | 'decrease') => {
    setExtraSeat((currentValue) => (operation === 'increase' ? Math.min(currentValue + 1, 6) : Math.max(currentValue - 1, 0)));
  };

  const clearDates = (mode: 'departure' | 'return' | 'all') => {
    if (mode === 'departure' || mode === 'all') {
      onDepartureDateChange('');
    }

    if (mode === 'return' || mode === 'all') {
      onReturnDateChange('');
    }

    setPickingField('departure');
  };

  const shiftVisibleMonth = (direction: -1 | 1) => {
    setVisibleMonth((currentValue) => new Date(currentValue.getFullYear(), currentValue.getMonth() + direction, 1));
  };

  const handleSelectDate = (date: Date) => {
    const key = toDateKey(date);

    if (pickingField === 'return' && tripMode === 'roundTrip') {
      if (departureDate && key < departureDate) {
        return;
      }

      onReturnDateChange(key);
      return;
    }

    onDepartureDateChange(key);
    if (tripMode === 'roundTrip') {
      setPickingField('return');
      if (returnDate && returnDate < key) {
        onReturnDateChange('');
      }
    }
  };

  const renderMonth = (monthDate: Date) => {
    const monthCells = getMonthCells(monthDate);

    return (
      <div className="search-calendar-month" key={monthDate.toISOString()}>
        <h4 className="search-calendar-title">{formatMonthLabel(monthDate, locale)}</h4>
        <div className="search-calendar-weekdays">
          {weekdayShort.map((weekday) => (
            <span key={weekday}>{weekday}</span>
          ))}
        </div>
        <div className="search-calendar-grid">
          {monthCells.map((cellDate, cellIndex) => {
            if (!cellDate) {
              return <span key={`empty-${monthDate.getMonth()}-${cellIndex}`} className="search-calendar-empty" />;
            }

            const key = toDateKey(cellDate);
            const fare = datePriceMap.get(key);
            const isBestPrice = bestPriceDate === key;
            const isSelectedDeparture = departureDate === key;
            const isSelectedReturn = returnDate === key;
            const isDisabledReturn = pickingField === 'return' && Boolean(departureDate) && key < departureDate;

            return (
              <button
                key={key}
                type="button"
                className={`search-calendar-day${isBestPrice ? ' search-calendar-day-best' : ''}${isSelectedDeparture || isSelectedReturn ? ' search-calendar-day-selected' : ''}`}
                onClick={() => handleSelectDate(cellDate)}
                disabled={isDisabledReturn}
              >
                <span>{cellDate.getDate()}</span>
                <small>{fare !== undefined ? `${Math.round(fare)} EUR` : ''}</small>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <section className="search-shell">
      <div className="search-tabs" role="tablist" aria-label={t('search_tabs_label')}>
        <button type="button" className={`search-tab ${activeTab === 'flights' ? 'search-tab-active' : ''}`} onClick={() => setActiveTab('flights')}>
          {t('search_tab_flights')}
        </button>
        <button type="button" className={`search-tab ${activeTab === 'hotels' ? 'search-tab-active' : ''}`} onClick={() => setActiveTab('hotels')}>
          {t('search_tab_hotels')} <span className="search-pill">{t('search_coming_soon')}</span>
        </button>
        <button type="button" className={`search-tab ${activeTab === 'cars' ? 'search-tab-active' : ''}`} onClick={() => setActiveTab('cars')}>
          {t('search_tab_cars')} <span className="search-pill">{t('search_coming_soon')}</span>
        </button>
      </div>

      {activeTab !== 'flights' ? (
        <div className="search-coming-card">
          <p className="eyebrow">{t('search_coming_soon')}</p>
          <h3 className="section-title">{t('search_coming_soon_copy')}</h3>
        </div>
      ) : (
        <>
          <div className="search-bar">
            <label className="search-field search-field-city">
              <span>{t('search_origin')}</span>
              <input value={origin} onChange={(event) => onOriginChange(event.target.value)} placeholder={t('search_origin_placeholder')} list="cities" />
            </label>

            <label className="search-field search-field-city">
              <span>{t('search_dest')}</span>
              <input value={destination} onChange={(event) => onDestinationChange(event.target.value)} placeholder={t('search_dest_placeholder')} list="cities" />
            </label>

            <button
              type="button"
              className="search-field search-field-date"
              onClick={() => {
                setPickingField('departure');
                setIsCalendarOpen(true);
              }}
            >
              <span>{t('search_departure')}</span>
              <strong>{formatDateLabel(departureDate, locale)}</strong>
            </button>

            <button
              type="button"
              className="search-field search-field-date"
              onClick={() => {
                setPickingField('return');
                setIsCalendarOpen(true);
              }}
            >
              <span>{t('search_return')}</span>
              <strong>{formatDateLabel(returnDate, locale)}</strong>
            </button>

            <div className="search-field search-field-passengers" ref={passengerPopoverRef}>
              <button type="button" onClick={() => setIsPassengerOpen((value) => !value)}>
                <span>{passengerBreakdown}</span>
                <strong>{passengerSummary}</strong>
              </button>

              {isPassengerOpen && (
                <div className="search-passenger-popover">
                  <h4 className="search-passenger-title">{t('search_passengers')}</h4>
                  <div className="search-passenger-row">
                    <div>
                      <p>{t('search_passenger_adults')}</p>
                      <small>{t('search_passenger_adults_hint')}</small>
                    </div>
                    <div className="search-stepper">
                      <button type="button" onClick={() => updatePassengerCount('adults', 'decrease')} disabled={passengers.adults <= 1}>-</button>
                      <strong>{passengers.adults}</strong>
                      <button type="button" onClick={() => updatePassengerCount('adults', 'increase')}>+</button>
                    </div>
                  </div>

                  <div className="search-passenger-row">
                    <div>
                      <p>{t('search_passenger_children')}</p>
                      <small>{t('search_passenger_children_hint')}</small>
                      <a href="#" onClick={(event) => event.preventDefault()}>{t('search_passenger_children_info')}</a>
                    </div>
                    <div className="search-stepper">
                      <button type="button" onClick={() => updatePassengerCount('children', 'decrease')} disabled={passengers.children <= 0}>-</button>
                      <strong>{passengers.children}</strong>
                      <button type="button" onClick={() => updatePassengerCount('children', 'increase')}>+</button>
                    </div>
                  </div>

                  <div className="search-passenger-row">
                    <div>
                      <p>{t('search_passenger_infants')}</p>
                      <small>{t('search_passenger_infants_hint')}</small>
                      <a href="#" onClick={(event) => event.preventDefault()}>{t('search_passenger_infants_info')}</a>
                    </div>
                    <div className="search-stepper">
                      <button type="button" onClick={() => updatePassengerCount('infants', 'decrease')} disabled={passengers.infants <= 0}>-</button>
                      <strong>{passengers.infants}</strong>
                      <button type="button" onClick={() => updatePassengerCount('infants', 'increase')}>+</button>
                    </div>
                  </div>

                  <div className="search-passenger-row">
                    <div>
                      <p>{t('search_passenger_extra_seat')}</p>
                      <a href="#" onClick={(event) => event.preventDefault()}>{t('search_passenger_extra_seat_info')}</a>
                    </div>
                    <div className="search-stepper">
                      <button type="button" onClick={() => updateExtraSeat('decrease')} disabled={extraSeat <= 0}>-</button>
                      <strong>{extraSeat}</strong>
                      <button type="button" onClick={() => updateExtraSeat('increase')}>+</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button type="button" className="search-submit" onClick={() => setIsCalendarOpen((value) => !value)} aria-label={t('search_toggle_calendar')}>
              <span>⌕</span>
            </button>
          </div>

          <datalist id="cities">
            {availableCities.map((city) => (
              <option key={city} value={city} />
            ))}
          </datalist>

          <div className="search-calendar-toggle">
            <div>
              <p className="eyebrow">{t('search_calendar_prompt')}</p>
            </div>
            <div className="search-toggle-pills">
              <button
                type="button"
                className={tripMode === 'oneWay' ? 'search-mode-active' : ''}
                onClick={() => {
                  onTripModeChange('oneWay');
                  onReturnDateChange('');
                  setPickingField('departure');
                }}
              >
                {t('search_one_way')}
              </button>
              <button
                type="button"
                className={tripMode === 'roundTrip' ? 'search-mode-active' : ''}
                onClick={() => onTripModeChange('roundTrip')}
              >
                {t('search_round_trip')}
              </button>
              <span className="search-best-fare">{t('search_best_price_hint')}</span>
            </div>
          </div>

          {isCalendarOpen && (
            <div className="search-calendar-panel">
              <div className="search-calendar-controls">
                <button type="button" onClick={() => shiftVisibleMonth(-1)}>{t('search_prev_month')}</button>
                <div className="search-calendar-reset">
                  <button type="button" onClick={() => clearDates('departure')}>{t('search_reset_departure')}</button>
                  <button type="button" onClick={() => clearDates('return')}>{t('search_reset_return')}</button>
                  <button type="button" onClick={() => clearDates('all')}>{t('search_reset_all')}</button>
                </div>
                <button type="button" onClick={() => shiftVisibleMonth(1)}>{t('search_next_month')}</button>
              </div>
              {renderMonth(firstMonth)}
              {renderMonth(secondMonth)}
            </div>
          )}

          <div className="search-results-inline">
            <div className="search-results-header">
              <p className="eyebrow">{t('search_results_live')}</p>
              <p className="section-copy">
                {isLoading ? t('searching') : hasError ? t('load_flights_error') : t('search_results_count', { count: quickResults.length })}
              </p>
            </div>

            {!isLoading && !hasError && quickResults.length > 0 ? (
              <div className="search-results-grid">
                {quickResults.map((flight) => {
                  const localizedOrigin = translatePlaceLabel(flight.origin, t);
                  const localizedDestination = translatePlaceLabel(flight.destination, t);
                  return (
                    <article key={flight.id} className="search-result-item">
                      <button type="button" className="cta-primary search-result-cta" onClick={() => onReserveFlight(flight)}>
                        {t('book_now')}
                      </button>
                      <div className="search-result-meta">
                        <p className="search-result-route">{localizedOrigin} - {localizedDestination}</p>
                        <p className="search-result-time">{new Date(flight.departureTime).toLocaleString(locale)}</p>
                      </div>
                      <div className="search-result-price">
                        <strong>{flight.finalPrice.toFixed(2)} EUR</strong>
                        <small>{t('availability_seats_left', { count: flight.availableSeats })}</small>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : null}

            {!isLoading && !hasError && quickResults.length === 0 ? (
              <p className="search-results-empty">{t('no_routes')}</p>
            ) : null}
          </div>
        </>
      )}
    </section>
  );
};
