import { describe, it, expect } from 'vitest';

// constants.js runs the preset migration at import time, which reads localStorage.
const store = new Map();
globalThis.localStorage ??= {
  getItem: k => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: k => store.delete(k),
};
const { BUILT_IN_SCENARIOS, DEFAULT_WEIGHTS, normalizeWeights } = await import('../scenarios.js');
const { WEIGHT_ATTRS } = await import('../constants.js');

describe('scenario weights', () => {
  it('DEFAULT_WEIGHTS covers every weightable attribute', () => {
    for (const a of WEIGHT_ATTRS) {
      expect(DEFAULT_WEIGHTS).toHaveProperty(a.priorityKey || a.id);
    }
  });

  it.each(BUILT_IN_SCENARIOS.map(s => [s.id, s]))('%s sets a weight for every key', (id, s) => {
    expect(Object.keys(s.weights).sort()).toEqual(Object.keys(DEFAULT_WEIGHTS).sort());
  });

  it('normalizeWeights fills weights a saved scenario predates with 0', () => {
    const saved = { mpg: 4, offroad: 5, luxury: 1, reliability: 3, cargo: 2, performance: 2, towing: 0 };
    const w = normalizeWeights(saved);
    expect(w.passion).toBe(0);
    expect(w.offroad).toBe(5);
    expect(Object.keys(w).sort()).toEqual(Object.keys(DEFAULT_WEIGHTS).sort());
  });

  it('normalizeWeights keeps an explicit passion weight', () => {
    expect(normalizeWeights({ ...DEFAULT_WEIGHTS, passion: 4 }).passion).toBe(4);
  });
});
