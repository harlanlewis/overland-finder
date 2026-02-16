/**
 * Scoring Algorithm Tests
 * Tests the scoring and filtering logic with real vehicle data
 */
import { describe, it, expect } from 'vitest';
import vehicles from '../vehicles.json';
import {
  computeDataRanges,
  calculateScore,
  fuzzyMatch,
  getSearchableText,
  getDisplayName,
  vehiclePassesFilters,
} from '../scoring.js';

// Attribute configs matching the app
const PRIORITY_ATTRS = [
  { id: 'mpg', priorityKey: 'mpg' },
  { id: 'offroad', priorityKey: 'offroad' },
  { id: 'luxury', priorityKey: 'luxury' },
  { id: 'reliability', priorityKey: 'reliability' },
  { id: 'cargo', priorityKey: 'cargo' },
  { id: 'performance', priorityKey: 'performance' },
  { id: 'tow', priorityKey: 'towing' },
];

const FILTER_ATTRS = [
  { id: 'mpg' },
  { id: 'offroad' },
  { id: 'luxury' },
  { id: 'reliability' },
  { id: 'cargo' },
  { id: 'performance' },
  { id: 'tow', presetKey: 'towing' },
];

describe('computeDataRanges', () => {
  it('should compute min/max for all attributes', () => {
    const ranges = computeDataRanges(vehicles, PRIORITY_ATTRS);

    expect(ranges.mpg).toBeDefined();
    expect(ranges.mpg.min).toBeLessThan(ranges.mpg.max);

    expect(ranges.offroad).toBeDefined();
    expect(ranges.offroad.min).toBeGreaterThanOrEqual(1);
    expect(ranges.offroad.max).toBeLessThanOrEqual(10);

    expect(ranges.luxury).toBeDefined();
    expect(ranges.reliability).toBeDefined();
    expect(ranges.cargo).toBeDefined();
    expect(ranges.performance).toBeDefined();
    expect(ranges.tow).toBeDefined();
  });

  it('should handle real data ranges correctly', () => {
    const ranges = computeDataRanges(vehicles, PRIORITY_ATTRS);

    // MPG should be in realistic range (10-100+ for EVs)
    expect(ranges.mpg.min).toBeGreaterThanOrEqual(10);
    expect(ranges.mpg.max).toBeLessThan(150);

    // Towing should be 0 to ~15000 lbs
    expect(ranges.tow.min).toBeGreaterThanOrEqual(0);
    expect(ranges.tow.max).toBeLessThan(20000);
  });
});

describe('calculateScore', () => {
  const dataRanges = computeDataRanges(vehicles, PRIORITY_ATTRS);

  it('should return score between 0 and 100', () => {
    const priorities = { mpg: 3, offroad: 3, luxury: 3, reliability: 3, cargo: 3, performance: 3, towing: 1 };

    vehicles.forEach(v => {
      const score = calculateScore(v, priorities, dataRanges, PRIORITY_ATTRS);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  it('should weight attributes correctly', () => {
    // Use vehicles with contrasting traits:
    // Bronco: offroad=10, luxury=1.9 (high offroad, low luxury)
    // Mercedes GLS: offroad=3.5, luxury=10 (low offroad, high luxury)
    const bronco = vehicles.find(v => v.id === 'bronco');
    const gls = vehicles.find(v => v.id === 'gls');

    expect(bronco).toBeDefined();
    expect(gls).toBeDefined();

    // With offroad priority high, Bronco should score better
    const offroadPriorities = { mpg: 1, offroad: 5, luxury: 1, reliability: 1, cargo: 1, performance: 1, towing: 1 };
    const broncoOffroadScore = calculateScore(bronco, offroadPriorities, dataRanges, PRIORITY_ATTRS);
    const glsOffroadScore = calculateScore(gls, offroadPriorities, dataRanges, PRIORITY_ATTRS);

    expect(broncoOffroadScore).toBeGreaterThan(glsOffroadScore);

    // With luxury priority high, GLS should score better
    const luxuryPriorities = { mpg: 1, offroad: 1, luxury: 5, reliability: 1, cargo: 1, performance: 1, towing: 1 };
    const glsLuxuryScore = calculateScore(gls, luxuryPriorities, dataRanges, PRIORITY_ATTRS);
    const broncoLuxuryScore = calculateScore(bronco, luxuryPriorities, dataRanges, PRIORITY_ATTRS);

    expect(glsLuxuryScore).toBeGreaterThan(broncoLuxuryScore);
  });

  it('should handle zero weights', () => {
    const zeroPriorities = { mpg: 0, offroad: 0, luxury: 0, reliability: 0, cargo: 0, performance: 0, towing: 0 };
    const score = calculateScore(vehicles[0], zeroPriorities, dataRanges, PRIORITY_ATTRS);
    // With all weights zero, score should be 0
    expect(score).toBe(0);
  });

  it('should produce different scores for different vehicles', () => {
    const priorities = { mpg: 3, offroad: 3, luxury: 3, reliability: 3, cargo: 3, performance: 3, towing: 1 };
    const scores = vehicles.map(v => calculateScore(v, priorities, dataRanges, PRIORITY_ATTRS));
    const uniqueScores = new Set(scores);

    // Should have variety in scores (not all the same)
    expect(uniqueScores.size).toBeGreaterThan(10);
  });

  it('should rank specific vehicles as expected', () => {
    const priorities = { mpg: 3, offroad: 3, luxury: 3, reliability: 3, cargo: 3, performance: 3, towing: 1 };

    // Test some known vehicles
    const toyota4runner = vehicles.find(v => v.make === 'Toyota' && v.model === '4Runner' && v.yearEnd === null);
    const gwagen = vehicles.find(v => v.make === 'Mercedes' && v.model.includes('G'));

    if (toyota4runner && gwagen) {
      // G-Wagen should score higher on luxury, 4Runner on reliability
      // But both should have reasonable scores
      const score4runner = calculateScore(toyota4runner, priorities, dataRanges, PRIORITY_ATTRS);
      const scoreGwagen = calculateScore(gwagen, priorities, dataRanges, PRIORITY_ATTRS);

      expect(score4runner).toBeGreaterThan(30);
      expect(scoreGwagen).toBeGreaterThan(30);
    }
  });
});

describe('fuzzyMatch', () => {
  it('should match empty query to anything', () => {
    expect(fuzzyMatch('', 'Toyota 4Runner')).toBe(true);
    expect(fuzzyMatch(null, 'Toyota 4Runner')).toBe(true);
    expect(fuzzyMatch(undefined, 'Toyota 4Runner')).toBe(true);
  });

  it('should match single word queries', () => {
    expect(fuzzyMatch('toyota', 'Toyota 4Runner TRD Pro')).toBe(true);
    expect(fuzzyMatch('4runner', 'Toyota 4Runner TRD Pro')).toBe(true);
    expect(fuzzyMatch('trd', 'Toyota 4Runner TRD Pro')).toBe(true);
    expect(fuzzyMatch('pro', 'Toyota 4Runner TRD Pro')).toBe(true);
  });

  it('should match multi-word queries', () => {
    expect(fuzzyMatch('toyota trd', 'Toyota 4Runner TRD Pro')).toBe(true);
    expect(fuzzyMatch('4runner pro', 'Toyota 4Runner TRD Pro')).toBe(true);
    expect(fuzzyMatch('trd pro', 'Toyota 4Runner TRD Pro')).toBe(true);
  });

  it('should be case insensitive', () => {
    expect(fuzzyMatch('TOYOTA', 'Toyota 4Runner')).toBe(true);
    expect(fuzzyMatch('toyota', 'TOYOTA 4RUNNER')).toBe(true);
  });

  it('should not match missing words', () => {
    expect(fuzzyMatch('honda', 'Toyota 4Runner')).toBe(false);
    expect(fuzzyMatch('toyota honda', 'Toyota 4Runner')).toBe(false);
  });

  it('should handle partial word matches', () => {
    expect(fuzzyMatch('4run', 'Toyota 4Runner')).toBe(true);
    expect(fuzzyMatch('toyo', 'Toyota 4Runner')).toBe(true);
  });
});

describe('getSearchableText', () => {
  it('should include make, model, trim, and generation', () => {
    const vehicle = {
      make: 'Toyota',
      model: '4Runner',
      trim: 'TRD Pro',
      generation: '6th Gen',
    };

    const text = getSearchableText(vehicle);
    expect(text).toContain('Toyota');
    expect(text).toContain('4Runner');
    expect(text).toContain('TRD Pro');
    expect(text).toContain('6th Gen');
  });

  it('should handle null trim', () => {
    const vehicle = {
      make: 'Toyota',
      model: 'Sequoia',
      trim: null,
      generation: '3rd Gen',
    };

    const text = getSearchableText(vehicle);
    expect(text).toContain('Toyota');
    expect(text).toContain('Sequoia');
    expect(text).not.toContain('null');
  });

  it('should work with real vehicle data', () => {
    vehicles.forEach(v => {
      const text = getSearchableText(v);
      expect(text).toContain(v.make);
      expect(text).toContain(v.model);
    });
  });
});

describe('getDisplayName', () => {
  it('should format name correctly with trim', () => {
    const name = getDisplayName({ make: 'Toyota', model: '4Runner', trim: 'TRD Pro' });
    expect(name).toBe('Toyota 4Runner TRD Pro');
  });

  it('should format name correctly without trim', () => {
    const name = getDisplayName({ make: 'Toyota', model: 'Sequoia', trim: null });
    expect(name).toBe('Toyota Sequoia');
  });

  it('should work with all real vehicles', () => {
    vehicles.forEach(v => {
      const name = getDisplayName(v);
      expect(name).toContain(v.make);
      expect(name).toContain(v.model);
      if (v.trim) expect(name).toContain(v.trim);
    });
  });
});

describe('vehiclePassesFilters', () => {
  const defaultFilters = {
    priceRange: [0, 300],
    ranges: {
      mpg: [0, 150],
      offroad: [0, 10],
      luxury: [0, 10],
      reliability: [0, 10],
      cargo: [0, 150],
      performance: [0, 10],
      tow: [0, 20000],
    },
    ptFilter: ['gas', 'diesel', 'hybrid', 'phev', 'ev'],
    sizeFilter: ['compact', 'mid', 'full'],
    makeFilter: [],
    searchQuery: '',
    filterAttrs: FILTER_ATTRS,
  };

  it('should pass all vehicles with wide open filters', () => {
    let passCount = 0;
    vehicles.forEach(v => {
      if (vehiclePassesFilters(v, defaultFilters)) passCount++;
    });
    expect(passCount).toBe(vehicles.length);
  });

  it('should filter by price range', () => {
    const filters = { ...defaultFilters, priceRange: [0, 50] };
    const passed = vehicles.filter(v => vehiclePassesFilters(v, filters));

    expect(passed.length).toBeLessThan(vehicles.length);
    passed.forEach(v => {
      expect(v.price).toBeLessThanOrEqual(50);
    });
  });

  it('should filter by powertrain', () => {
    const filters = { ...defaultFilters, ptFilter: ['hybrid', 'ev'] };
    const passed = vehicles.filter(v => vehiclePassesFilters(v, filters));

    expect(passed.length).toBeLessThan(vehicles.length);
    passed.forEach(v => {
      expect(['hybrid', 'ev']).toContain(v.pt);
    });
  });

  it('should filter by size', () => {
    const filters = { ...defaultFilters, sizeFilter: ['full'] };
    const passed = vehicles.filter(v => vehiclePassesFilters(v, filters));

    expect(passed.length).toBeLessThan(vehicles.length);
    passed.forEach(v => {
      expect(v.size).toBe('full');
    });
  });

  it('should filter by make', () => {
    const filters = { ...defaultFilters, makeFilter: ['Toyota', 'Lexus'] };
    const passed = vehicles.filter(v => vehiclePassesFilters(v, filters));

    expect(passed.length).toBeLessThan(vehicles.length);
    passed.forEach(v => {
      expect(['Toyota', 'Lexus']).toContain(v.make);
    });
  });

  it('should filter by search query', () => {
    const filters = { ...defaultFilters, searchQuery: 'toyota' };
    const passed = vehicles.filter(v => vehiclePassesFilters(v, filters));

    expect(passed.length).toBeLessThan(vehicles.length);
    passed.forEach(v => {
      expect(v.make.toLowerCase()).toBe('toyota');
    });
  });

  it('should filter by offroad rating', () => {
    const filters = {
      ...defaultFilters,
      ranges: { ...defaultFilters.ranges, offroad: [8, 10] },
    };
    const passed = vehicles.filter(v => vehiclePassesFilters(v, filters));

    expect(passed.length).toBeLessThan(vehicles.length);
    expect(passed.length).toBeGreaterThan(0);
    passed.forEach(v => {
      expect(v.offroad).toBeGreaterThanOrEqual(8);
    });
  });

  it('should filter by luxury rating', () => {
    const filters = {
      ...defaultFilters,
      ranges: { ...defaultFilters.ranges, luxury: [8, 10] },
    };
    const passed = vehicles.filter(v => vehiclePassesFilters(v, filters));

    expect(passed.length).toBeLessThan(vehicles.length);
    expect(passed.length).toBeGreaterThan(0);
    passed.forEach(v => {
      expect(v.luxury).toBeGreaterThanOrEqual(8);
    });
  });

  it('should combine multiple filters correctly', () => {
    const filters = {
      ...defaultFilters,
      priceRange: [0, 80],
      ptFilter: ['hybrid', 'ev', 'phev'],
      ranges: { ...defaultFilters.ranges, offroad: [6, 10] },
    };
    const passed = vehicles.filter(v => vehiclePassesFilters(v, filters));

    passed.forEach(v => {
      expect(v.price).toBeLessThanOrEqual(80);
      expect(['hybrid', 'ev', 'phev']).toContain(v.pt);
      expect(v.offroad).toBeGreaterThanOrEqual(6);
    });
  });

  it('should handle the "Your Brief" preset filters', () => {
    // Simulating the "Your Brief" preset: family + offroad + luxury + reliable + ≤$100K
    const filters = {
      ...defaultFilters,
      priceRange: [0, 100],
      ranges: {
        ...defaultFilters.ranges,
        mpg: [16, 100],
        offroad: [7, 10],
        luxury: [6.5, 10],
        reliability: [6, 10],
        cargo: [34, 100],
      },
    };
    const passed = vehicles.filter(v => vehiclePassesFilters(v, filters));

    // Should find some matches
    expect(passed.length).toBeGreaterThan(0);

    // All matches should meet criteria
    passed.forEach(v => {
      expect(v.price).toBeLessThanOrEqual(100);
      expect(v.mpg).toBeGreaterThanOrEqual(16);
      expect(v.offroad).toBeGreaterThanOrEqual(7);
      expect(v.luxury).toBeGreaterThanOrEqual(6.5);
      expect(v.reliability).toBeGreaterThanOrEqual(6);
      expect(v.cargo).toBeGreaterThanOrEqual(34);
    });
  });
});
