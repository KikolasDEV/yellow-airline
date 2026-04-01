import type { SeatOption } from '../types';

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
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Seat Map</p>
          <p className="text-sm text-[var(--text-secondary)]">Choose up to {maxSelectable} seat{maxSelectable === 1 ? '' : 's'} before confirming.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold text-[var(--text-secondary)]">
          <span className="legend-chip"><span className="legend-dot legend-dot-window" />Window</span>
          <span className="legend-chip"><span className="legend-dot legend-dot-aisle" />Aisle</span>
          <span className="legend-chip"><span className="legend-dot legend-dot-exit" />Exit +18€</span>
        </div>
      </div>

      <div className="seat-map-shell">
        <div className="seat-map-nose" />
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
