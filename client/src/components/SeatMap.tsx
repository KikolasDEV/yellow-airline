import type { SeatOption } from '../types';
import { useTranslation } from 'react-i18next';

interface SeatMapProps {
  seats: SeatOption[];
  selectedSeatIds: string[];
  maxSelectable: number;
  onToggleSeat: (seatId: string) => void;
}

const seatClassNameByKind: Record<SeatOption['kind'], string> = {
  window: 'seat seat-window',
  aisle: 'seat seat-aisle',
  middle: 'seat seat-middle',
  exit: 'seat seat-exit',
};

export const SeatMap = ({ seats, selectedSeatIds, maxSelectable, onToggleSeat }: SeatMapProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">{t('seat_map_eyebrow')}</p>
          <p className="text-sm text-[var(--text-secondary)]">{t('seat_map_copy', { count: maxSelectable })}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold text-[var(--text-secondary)]">
          <span className="legend-chip"><span className="legend-dot legend-dot-window" />{t('seat_map_window')}</span>
          <span className="legend-chip"><span className="legend-dot legend-dot-aisle" />{t('seat_map_aisle')}</span>
          <span className="legend-chip"><span className="legend-dot legend-dot-exit" />{t('seat_map_exit')}</span>
        </div>
      </div>

      <div className="seat-map-shell">
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="booking-chip booking-chip-strong">{t('seat_map_selected', { count: selectedSeatIds.length })}</span>
          <span className="booking-chip">{t('seat_map_capacity', { count: maxSelectable })}</span>
        </div>
        <div className="seat-map-nose" />
        <div className="seat-map-aisle-label">
          <span>A</span>
          <span>B</span>
          <span>C</span>
          <span>D</span>
        </div>
        <div className="seat-map-grid">
          {seats.map((seat) => {
            const isSelected = selectedSeatIds.includes(seat.id);
            const isDisabled = !seat.available || (!isSelected && selectedSeatIds.length >= maxSelectable);

            return (
              <button
                key={seat.id}
                type="button"
                disabled={isDisabled}
                onClick={() => onToggleSeat(seat.id)}
                className={[
                  seatClassNameByKind[seat.kind],
                  isSelected ? 'seat-selected' : '',
                  !seat.available ? 'seat-unavailable' : '',
                ].join(' ').trim()}
              >
                <span>{seat.id}</span>
                {seat.kind === 'exit' && <small>+18</small>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
