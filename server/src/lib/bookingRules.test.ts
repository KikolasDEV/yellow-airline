import { describe, expect, it } from 'vitest';
import {
  calculateCurrentSeats,
  calculateRequestedSeats,
  hasDuplicateBooking,
  hasEnoughCapacity,
} from './bookingRules.js';

describe('bookingRules', () => {
  it('calculates requested seats using only adults and children', () => {
    expect(calculateRequestedSeats(2, 1)).toBe(3);
  });

  it('clamps negative requested seats to zero', () => {
    expect(calculateRequestedSeats(-2, 1)).toBe(1);
  });

  it('detects duplicate bookings when an entry already exists', () => {
    expect(hasDuplicateBooking({ id: 7 })).toBe(true);
    expect(hasDuplicateBooking(null)).toBe(false);
  });

  it('returns true when capacity can hold requested seats', () => {
    expect(hasEnoughCapacity({
      currentSeats: 120,
      requestedSeats: 3,
      capacity: 130,
    })).toBe(true);
  });

  it('returns false when requested seats exceed remaining capacity', () => {
    expect(hasEnoughCapacity({
      currentSeats: 179,
      requestedSeats: 2,
      capacity: 180,
    })).toBe(false);
  });

  it('calculates current occupied seats from adults and children sums', () => {
    expect(calculateCurrentSeats(30, 8)).toBe(38);
  });
});
