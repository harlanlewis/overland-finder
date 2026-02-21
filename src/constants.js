import vehiclesData from "./vehicles.json";
import {
  BUILT_IN_SCENARIOS,
  needsMigration,
  migrateOldPresets,
} from "./scenarios";

export const V = vehiclesData;

// Run migration from old presets to scenarios on first load
if (needsMigration()) {
  migrateOldPresets();
}

// Compute data-derived bounds for dynamic ranges
export const DATA_PRICE_MAX = Math.max(...V.map(v => v.price));
export const DATA_MPG_MIN = Math.min(...V.map(v => v.mpg));
export const DATA_MPG_MAX = Math.max(...V.map(v => v.mpg));
export const DATA_CARGO_MIN = Math.min(...V.map(v => v.cargo));
export const DATA_CARGO_MAX = Math.max(...V.map(v => v.cargo));
export const DATA_TOW_MIN = Math.min(...V.map(v => v.tow));
export const DATA_TOW_MAX = Math.max(...V.map(v => v.tow));
export const DATA_GC_MIN = Math.min(...V.map(v => v.gc));
export const DATA_GC_MAX = Math.max(...V.map(v => v.gc));

// Extract unique manufacturers
export const MAKES = [...new Set(V.map(v => v.make))].sort();

// Single source of truth for powertrain types (order matters for UI)
export const POWERTRAINS = [
  { id: "hybrid", label: "Hybrid", color: "#2ecc71" },
  { id: "phev", label: "PHEV", color: "#3498db" },
  { id: "ev", label: "EV", color: "#9b59b6" },
  { id: "gas", label: "Gas", color: "#e67e22" },
  { id: "diesel", label: "Diesel", color: "#95a5a6" },
];
export const PT_IDS = POWERTRAINS.map(p => p.id);
export const ptLabels = Object.fromEntries(POWERTRAINS.map(p => [p.id, p.label]));
export const ptColors = Object.fromEntries(POWERTRAINS.map(p => [p.id, p.color]));

// Single source of truth for sizes
export const SIZES = [
  { id: "compact", label: "Compact" },
  { id: "mid", label: "Midsize" },
  { id: "full", label: "Full-size" },
];
export const SIZE_IDS = SIZES.map(s => s.id);
export const sizeLabels = Object.fromEntries(SIZES.map(s => [s.id, s.label]));

// Single source of truth for body types
export const BODIES = [
  { id: "suv", label: "SUV" },
  { id: "cuv", label: "CUV" },
  { id: "wagon", label: "Wagon" },
  { id: "truck", label: "Truck" },
];
export const BODY_IDS = BODIES.map(b => b.id);
export const bodyLabels = Object.fromEntries(BODIES.map(b => [b.id, b.label]));

// Compose display name from vehicle fields
export const getDisplayName = (v) => {
  let name = `${v.make} ${v.model}`;
  if (v.trim) name += ` ${v.trim}`;
  return name;
};

// Simple fuzzy match: checks if all query words appear somewhere in the target string
export const fuzzyMatch = (query, target) => {
  if (!query) return true;
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase();
  const words = q.split(/\s+/).filter(Boolean);
  return words.every(word => t.includes(word));
};

// Get searchable text for a vehicle
export const getSearchableText = (v) => {
  return [v.make, v.model, v.trim, v.generation].filter(Boolean).join(" ");
};

// Single source of truth for vehicle attributes
export const ATTRIBUTES = [
  { id: "mpg", label: "MPG", shortLabel: "MPG", priorityLabel: "Fuel Econ", min: DATA_MPG_MIN, max: DATA_MPG_MAX, step: 1, description: "Filter by fuel efficiency range", priority: 2, sortable: true, summaryField: true },
  { id: "reliability", label: "Reliability", shortLabel: "Rel", priorityLabel: "Reliability", min: 1, max: 10, step: 0.5, description: "Expected dependability & repair costs", priority: 3, sortable: true, summaryField: true },
  { id: "luxury", label: "Luxury", shortLabel: "Lux", priorityLabel: "Luxury", min: 1, max: 10, step: 0.5, description: "Interior quality & comfort level", priority: 3, sortable: true, summaryField: true },
  { id: "cargo", label: "Cargo", shortLabel: "Cargo", priorityLabel: "Cargo", min: DATA_CARGO_MIN, max: DATA_CARGO_MAX, step: 1, unit: " cu ft", description: "Cargo capacity behind 2nd row", priority: 3, detailOnly: true },
  { id: "offroad", label: "Off-Road", shortLabel: "Off-Rd", priorityLabel: "Off-Road", min: 1, max: 10, step: 0.5, description: "3 = gravel roads · 6 = moderate trails · 8+ = serious", priority: 3, sortable: true, summaryField: true },
  { id: "performance", label: "Performance", shortLabel: "Perf", priorityLabel: "Performance", min: 1, max: 10, step: 0.5, description: "Acceleration, power & driving dynamics", priority: 2, sortable: true, summaryField: true },
  { id: "tow", label: "Towing", shortLabel: "Tow", priorityLabel: "Towing", priorityKey: "towing", presetKey: "towing", min: 0, max: 15000, step: 500, unit: " lbs", description: "Maximum towing capacity", priority: 0, detailOnly: true, noFilter: true, noWeight: true, formatVal: v => v.toLocaleString() },
  { id: "gc", label: "Ground Clear.", shortLabel: "GC", min: 6, max: 12, step: 0.5, unit: "\"", detailOnly: true, noFilter: true },
];
export const ATTR_BY_ID = Object.fromEntries(ATTRIBUTES.map(a => [a.id, a]));
export const SORTABLE_ATTRS = ATTRIBUTES.filter(a => a.sortable);
export const SUMMARY_ATTRS = ATTRIBUTES.filter(a => a.summaryField);
export const DETAIL_ATTRS = ATTRIBUTES.filter(a => !a.noFilter);
export const PRIORITY_ATTRS = ATTRIBUTES.filter(a => a.priority !== undefined);
export const WEIGHT_ATTRS = ATTRIBUTES.filter(a => a.priority !== undefined && !a.noWeight);
export const FILTER_ATTRS = ATTRIBUTES.filter(a => !a.noFilter);

// Default scenario - reset state with balanced weights
export const DEFAULT_SCENARIO = BUILT_IN_SCENARIOS.find(s => s.id === "_reset") || BUILT_IN_SCENARIOS[0];

// Data ranges for filters (used to fill in nulls from scenario filters)
export const DATA_RANGES = {
  mpg: { min: DATA_MPG_MIN, max: DATA_MPG_MAX },
  offroad: { min: 1, max: 10 },
  luxury: { min: 1, max: 10 },
  reliability: { min: 1, max: 10 },
  cargo: { min: DATA_CARGO_MIN, max: DATA_CARGO_MAX },
  performance: { min: 1, max: 10 },
  price: { min: 0, max: DATA_PRICE_MAX },
  tow: { min: DATA_TOW_MIN, max: DATA_TOW_MAX },
  gc: { min: DATA_GC_MIN, max: DATA_GC_MAX },
};

// Get effective filter range from scenario (filling in nulls with data bounds)
export const getEffectiveRange = (scenario, key) => {
  const filter = scenario?.filters?.[key];
  const range = DATA_RANGES[key] || { min: 1, max: 10 };
  if (!filter) return [range.min, range.max];
  return [filter[0] ?? range.min, filter[1] ?? range.max];
};
