import { describe, expect, it } from 'vitest';
import { calculateBookingTotal, calculateSeatUpgradeTotal } from './pricing';

describe('pricing', () => {
  it('never returns a negative booking total when base fare is negative', () => {
    expect(calculateBookingTotal({
      basePrice: -45,
      adults: 1,
      children: 0,
      extraTotal: 0,
    })).toBe(0);
  });

  it('never returns a negative booking total when extras are negative', () => {
    expect(calculateBookingTotal({
      basePrice: 80,
      adults: 1,
      children: 0,
      extraTotal: -25,
    })).toBe(80);
  });

  it('sums seat upgrades without letting the total go below zero', () => {
    expect(calculateSeatUpgradeTotal(
      ['1A', '2B', '3C'],
      [
        { id: '1A', row: 1, column: 'A', kind: 'window', available: true, priceModifier: 18 },
        { id: '2B', row: 2, column: 'B', kind: 'aisle', available: true, priceModifier: 12 },
        { id: '3C', row: 3, column: 'C', kind: 'exit', available: true, priceModifier: -50 },
      ],
    )).toBe(30);
  });

  it('keeps the regular total for adult and child passengers', () => {
    expect(calculateBookingTotal({
      basePrice: 45.99,
      adults: 2,
      children: 1,
      extraTotal: 18,
    })).toBe(155.97);
  });
});
