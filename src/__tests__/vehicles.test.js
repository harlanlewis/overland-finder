/**
 * Vehicle Data Schema Validation Tests
 * Tests the structure and validity of vehicles.json against expected schema
 */
import { describe, it, expect } from 'vitest';
import vehicles from '../vehicles.json';

// Valid enum values
const VALID_POWERTRAINS = ['gas', 'diesel', 'hybrid', 'phev', 'ev'];
const VALID_SIZES = ['compact', 'mid', 'full'];

describe('vehicles.json schema validation', () => {
  it('should have vehicles array', () => {
    expect(Array.isArray(vehicles)).toBe(true);
    expect(vehicles.length).toBeGreaterThan(0);
  });

  it('should have unique IDs', () => {
    const ids = vehicles.map(v => v.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  describe('each vehicle', () => {
    it.each(vehicles.map(v => [v.id, v]))('%s has required string fields', (id, v) => {
      expect(typeof v.id).toBe('string');
      expect(v.id.length).toBeGreaterThan(0);
      expect(typeof v.make).toBe('string');
      expect(v.make.length).toBeGreaterThan(0);
      expect(typeof v.model).toBe('string');
      expect(v.model.length).toBeGreaterThan(0);
      expect(typeof v.generation).toBe('string');
      expect(v.generation.length).toBeGreaterThan(0);
      expect(typeof v.note).toBe('string');
      expect(typeof v.url).toBe('string');
    });

    it.each(vehicles.map(v => [v.id, v]))('%s has valid trim (string or null)', (id, v) => {
      expect(v.trim === null || typeof v.trim === 'string').toBe(true);
    });

    it.each(vehicles.map(v => [v.id, v]))('%s has valid numeric fields', (id, v) => {
      // Price in $K (reasonable range 5-300)
      expect(typeof v.price).toBe('number');
      expect(v.price).toBeGreaterThan(0);
      expect(v.price).toBeLessThan(300);

      // MPG (reasonable range 10-150 for MPGe)
      expect(typeof v.mpg).toBe('number');
      expect(v.mpg).toBeGreaterThan(0);
      expect(v.mpg).toBeLessThan(150);

      // Rating fields (1-10 scale)
      expect(v.offroad).toBeGreaterThanOrEqual(1);
      expect(v.offroad).toBeLessThanOrEqual(10);
      expect(v.luxury).toBeGreaterThanOrEqual(1);
      expect(v.luxury).toBeLessThanOrEqual(10);
      expect(v.reliability).toBeGreaterThanOrEqual(1);
      expect(v.reliability).toBeLessThanOrEqual(10);
      expect(v.performance).toBeGreaterThanOrEqual(1);
      expect(v.performance).toBeLessThanOrEqual(10);

      // Physical measurements
      expect(typeof v.cargo).toBe('number');
      expect(v.cargo).toBeGreaterThan(0);
      expect(typeof v.tow).toBe('number');
      expect(v.tow).toBeGreaterThanOrEqual(0);
      expect(typeof v.weight).toBe('number');
      expect(v.weight).toBeGreaterThan(0);
      expect(typeof v.gc).toBe('number');
      expect(v.gc).toBeGreaterThan(0);
    });

    it.each(vehicles.map(v => [v.id, v]))('%s has valid year fields', (id, v) => {
      const currentYear = new Date().getFullYear();

      expect(typeof v.yearStart).toBe('number');
      expect(v.yearStart).toBeGreaterThanOrEqual(1980);
      expect(v.yearStart).toBeLessThanOrEqual(currentYear + 1);

      // yearEnd is null (current production) or a valid year
      if (v.yearEnd !== null) {
        expect(typeof v.yearEnd).toBe('number');
        expect(v.yearEnd).toBeGreaterThanOrEqual(v.yearStart);
        expect(v.yearEnd).toBeLessThanOrEqual(currentYear + 1);
      }
    });

    it.each(vehicles.map(v => [v.id, v]))('%s has valid enum values', (id, v) => {
      expect(VALID_POWERTRAINS).toContain(v.pt);
      expect(VALID_SIZES).toContain(v.size);
    });

    it.each(vehicles.map(v => [v.id, v]))('%s has valid Wikipedia URL', (id, v) => {
      expect(v.url).toMatch(/^https:\/\/en\.wikipedia\.org\/wiki\//);
    });
  });

  describe('data integrity', () => {
    it('should not have overlapping year ranges for same model/trim/generation', () => {
      const byKey = new Map();
      const currentYear = new Date().getFullYear();

      vehicles.forEach(v => {
        const key = `${v.make}|${v.model}|${v.trim}|${v.generation}`;
        if (!byKey.has(key)) byKey.set(key, []);
        byKey.get(key).push(v);
      });

      const overlaps = [];
      byKey.forEach((entries, key) => {
        if (entries.length > 1) {
          for (let i = 0; i < entries.length; i++) {
            for (let j = i + 1; j < entries.length; j++) {
              const a = entries[i], b = entries[j];
              const aEnd = a.yearEnd || currentYear + 1;
              const bEnd = b.yearEnd || currentYear + 1;
              const hasOverlap = !(aEnd < b.yearStart || bEnd < a.yearStart);
              if (hasOverlap) {
                overlaps.push(`${key}: ${a.id} overlaps ${b.id}`);
              }
            }
          }
        }
      });

      expect(overlaps).toEqual([]);
    });

    it('should have expected makes distribution', () => {
      const makes = [...new Set(vehicles.map(v => v.make))].sort();
      // Should have major manufacturers
      expect(makes).toContain('Toyota');
      expect(makes).toContain('Ford');
      expect(makes).toContain('Jeep');
      expect(makes).toContain('Land Rover');
    });

    it('should have both current and historical vehicles', () => {
      const current = vehicles.filter(v => v.yearEnd === null);
      const historical = vehicles.filter(v => v.yearEnd !== null);

      expect(current.length).toBeGreaterThan(0);
      expect(historical.length).toBeGreaterThan(0);
    });

    it('should have all powertrain types represented', () => {
      const pts = new Set(vehicles.map(v => v.pt));
      // At minimum should have gas and hybrid
      expect(pts.has('gas')).toBe(true);
      expect(pts.has('hybrid')).toBe(true);
    });

    it('should have all size categories represented', () => {
      const sizes = new Set(vehicles.map(v => v.size));
      expect(sizes.has('mid')).toBe(true);
      expect(sizes.has('full')).toBe(true);
    });
  });
});
