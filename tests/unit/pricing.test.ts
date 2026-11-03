import { describe, it, expect } from 'vitest';
import { PricingService } from '../../server/src/services/pricingService';

describe('Pricing Intelligence Engine', () => {
  it('calculates unit contribution correctly: Selling Price - Cost', () => {
    // Hyderabadi Chicken Biryani: Selling 280, Cost 95 -> Contribution: 185
    const contribution = PricingService.calculateContribution(280, 95);
    expect(contribution).toBe(185);
  });

  it('calculates candidate price correctly: Cost / (1 - Target Margin)', () => {
    // Cost 105, Target margin 65% (0.65)
    // Candidate = 105 / 0.35 = 300
    const candidatePrice = PricingService.calculateCandidatePrice(105, 0.65);
    expect(candidatePrice).toBe(300);
  });

  it('rounds candidate price cleanly to nearest 5 or 10 rupees for restaurant menu', () => {
    // Cost 95, Target margin 65% (0.65)
    // 95 / 0.35 = 271.428 -> rounded up to nearest 5 is 275
    const candidatePrice = PricingService.calculateCandidatePrice(95, 0.65);
    expect(candidatePrice).toBe(275);
  });

  it('throws an error if target contribution margin is invalid (< 0 or >= 1)', () => {
    expect(() => PricingService.calculateCandidatePrice(100, -0.1)).toThrow('Target margin must be greater than or equal to 0');
    expect(() => PricingService.calculateCandidatePrice(100, 1.0)).toThrow('strictly less than 1');
    expect(() => PricingService.calculateCandidatePrice(100, 1.2)).toThrow('strictly less than 1');
  });
});
