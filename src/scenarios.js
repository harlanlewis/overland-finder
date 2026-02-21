/**
 * Scenario system for Overland Finder
 *
 * A Scenario combines both filters (hard requirements) and weights (soft ranking)
 * into a single "use case archetype" that users can apply, customize, and save.
 */

const STORAGE_KEY = "overland-scenarios";
const OLD_PRESETS_KEY = "overland-finder-presets";

// Default weights for balanced scoring (all 3 = equal weight)
export const DEFAULT_WEIGHTS = {
  mpg: 3,
  offroad: 3,
  luxury: 3,
  reliability: 3,
  cargo: 3,
  performance: 3,
  towing: 0, // Not shown in UI
};

// Special "Custom" scenario — persistent working state for user's ad-hoc tuning
export const CUSTOM_SCENARIO_ID = "_custom";
export const DEFAULT_CUSTOM_STATE = {
  id: CUSTOM_SCENARIO_ID,
  label: "Custom",
  description: "Your personal filter configuration",
  filters: {},
  weights: { ...DEFAULT_WEIGHTS },
  builtIn: false,
};

// Built-in scenarios - these can be hidden but not deleted
// Philosophy: Differentiate primarily through WEIGHTS (preferences), use filters sparingly for hard requirements
// Ordered by estimated popularity (common use cases first, niche interests later)
export const BUILT_IN_SCENARIOS = [
  {
    id: "daily_adventure",
    label: "Daily Adventure",
    description: "Reliable daily driver with trail capability",
    filters: {},
    weights: {
      mpg: 4,
      offroad: 3,
      luxury: 2,
      reliability: 5,
      cargo: 2,
      performance: 2,
      towing: 0,
    },
    builtIn: true,
  },
  {
    id: "family_adventure",
    label: "Family Overland",
    description: "Spacious, comfortable & reliable for the crew",
    filters: {},
    weights: {
      mpg: 3,
      offroad: 2,
      luxury: 4,
      reliability: 5,
      cargo: 5,
      performance: 1,
      towing: 2,
    },
    builtIn: true,
  },
  {
    id: "road_trip",
    label: "Road Trip",
    description: "Highway comfort for long-distance travel",
    filters: {},
    weights: {
      mpg: 4,
      offroad: 1,
      luxury: 5,
      reliability: 3,
      cargo: 3,
      performance: 2,
      towing: 1,
    },
    builtIn: true,
  },
  {
    id: "eco_explorer",
    label: "Eco Explorer",
    description: "Electrified adventure: hybrids, PHEVs & EVs",
    filters: {
      pt: ["hybrid", "phev", "ev"], // Hard requirement: must be electrified
    },
    weights: {
      mpg: 5,
      offroad: 3,
      luxury: 2,
      reliability: 4,
      cargo: 2,
      performance: 1,
      towing: 0,
    },
    builtIn: true,
  },
  {
    id: "hauler",
    label: "Big Hauler",
    description: "Max cargo & towing for gear and trailers",
    filters: {
      tow: [6000, null], // Hard requirement: need actual towing capacity
    },
    weights: {
      mpg: 1,
      offroad: 2,
      luxury: 1,
      reliability: 3,
      cargo: 5,
      performance: 2,
      towing: 5,
    },
    builtIn: true,
  },
  {
    id: "luxury_adventurer",
    label: "Luxury Adventure",
    description: "Premium comfort meets trail capability",
    filters: {},
    weights: {
      mpg: 1,
      offroad: 4,
      luxury: 5,
      reliability: 3,
      cargo: 2,
      performance: 3,
      towing: 1,
    },
    builtIn: true,
  },
  {
    id: "rock_ready",
    label: "Rock Ready",
    description: "Hardcore trails & technical terrain",
    filters: {
      gc: [9, null], // Hard requirement: need clearance for rocks
    },
    weights: {
      mpg: 1,
      offroad: 5,
      luxury: 1,
      reliability: 3,
      cargo: 2,
      performance: 2,
      towing: 1,
    },
    builtIn: true,
  },
  {
    id: "expedition",
    label: "Expedition",
    description: "Multi-day remote travel, maximum capability",
    filters: {
      gc: [9, null], // Hard requirement: need clearance for remote terrain
    },
    weights: {
      mpg: 2,
      offroad: 5,
      luxury: 1,
      reliability: 5,
      cargo: 5,
      performance: 1,
      towing: 2,
    },
    builtIn: true,
  },
  {
    id: "hot_lap",
    label: "Hot Lap",
    description: "Speed & driving dynamics first",
    filters: {},
    weights: {
      mpg: 1,
      offroad: 2,
      luxury: 3,
      reliability: 2,
      cargo: 1,
      performance: 5,
      towing: 0,
    },
    builtIn: true,
  },
  // Reset state - not shown in scenario list, used by Reset button and as fallback
  {
    id: "_reset",
    label: "Reset",
    description: "No filters, balanced weights",
    filters: {},
    weights: { ...DEFAULT_WEIGHTS },
    builtIn: true,
    isReset: true,
  },
];

/**
 * Load scenario state from localStorage
 */
export function loadScenarioState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to load scenario state:", e);
  }
  return { custom: [], hidden: [], activeId: null, order: null, customState: null };
}

/**
 * Save scenario state to localStorage
 */
export function saveScenarioState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save scenario state:", e);
  }
}

/**
 * Load the persistent Custom scenario state from localStorage
 */
export function loadCustomState() {
  const state = loadScenarioState();
  if (state.customState) {
    return { ...DEFAULT_CUSTOM_STATE, ...state.customState, id: CUSTOM_SCENARIO_ID };
  }
  return { ...DEFAULT_CUSTOM_STATE };
}

/**
 * Save the persistent Custom scenario state to localStorage
 */
export function saveCustomState(customState) {
  const state = loadScenarioState();
  state.customState = {
    weights: customState.weights,
    filters: customState.filters,
  };
  saveScenarioState(state);
}

/**
 * Get all visible scenarios (built-ins that aren't hidden + custom)
 */
export function getVisibleScenarios() {
  const { custom, hidden, order } = loadScenarioState();
  const builtIns = BUILT_IN_SCENARIOS.filter(s => !hidden.includes(s.id));
  const all = [...builtIns, ...custom];

  // Apply custom ordering if set
  if (order && order.length > 0) {
    const orderMap = new Map(order.map((id, idx) => [id, idx]));
    all.sort((a, b) => {
      const aIdx = orderMap.has(a.id) ? orderMap.get(a.id) : 999;
      const bIdx = orderMap.has(b.id) ? orderMap.get(b.id) : 999;
      return aIdx - bIdx;
    });
  }

  return all;
}

/**
 * Get a scenario by ID (including hidden built-ins)
 */
export function getScenarioById(id) {
  const { custom } = loadScenarioState();
  const builtIn = BUILT_IN_SCENARIOS.find(s => s.id === id);
  if (builtIn) return builtIn;
  return custom.find(s => s.id === id) || null;
}

/**
 * Get the active scenario ID
 */
export function getActiveScenarioId() {
  return loadScenarioState().activeId;
}

/**
 * Set the active scenario ID
 */
export function setActiveScenarioId(id) {
  const state = loadScenarioState();
  state.activeId = id;
  saveScenarioState(state);
}

/**
 * Save a custom scenario (create or update)
 */
export function saveCustomScenario(scenario) {
  const state = loadScenarioState();
  const idx = state.custom.findIndex(s => s.id === scenario.id);

  const toSave = {
    ...scenario,
    builtIn: false,
    modifiedAt: Date.now(),
  };

  if (idx >= 0) {
    state.custom[idx] = toSave;
  } else {
    toSave.createdAt = Date.now();
    state.custom.push(toSave);
  }

  saveScenarioState(state);
  return toSave;
}

/**
 * Delete a custom scenario
 */
export function deleteCustomScenario(id) {
  const state = loadScenarioState();
  const scenario = state.custom.find(s => s.id === id);
  if (!scenario) return false;

  state.custom = state.custom.filter(s => s.id !== id);
  if (state.activeId === id) {
    state.activeId = null;
  }
  if (state.order) {
    state.order = state.order.filter(oid => oid !== id);
  }
  saveScenarioState(state);
  return true;
}

/**
 * Hide a built-in scenario
 */
export function hideBuiltIn(id) {
  const isBuiltIn = BUILT_IN_SCENARIOS.some(s => s.id === id);
  if (!isBuiltIn) return false;

  const state = loadScenarioState();
  if (!state.hidden.includes(id)) {
    state.hidden.push(id);
  }
  if (state.activeId === id) {
    state.activeId = null;
  }
  saveScenarioState(state);
  return true;
}

/**
 * Unhide a built-in scenario
 */
export function unhideBuiltIn(id) {
  const state = loadScenarioState();
  state.hidden = state.hidden.filter(h => h !== id);
  saveScenarioState(state);
}

/**
 * Get list of hidden built-in IDs
 */
export function getHiddenBuiltIns() {
  return loadScenarioState().hidden;
}

/**
 * Reset: unhide all built-ins
 */
export function resetBuiltIns() {
  const state = loadScenarioState();
  state.hidden = [];
  saveScenarioState(state);
}

/**
 * Update scenario ordering
 */
export function setScenarioOrder(order) {
  const state = loadScenarioState();
  state.order = order;
  saveScenarioState(state);
}

/**
 * Generate a unique ID for a new scenario
 */
export function generateScenarioId(label) {
  const base = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  const timestamp = Date.now().toString(36);
  return `${base}_${timestamp}`;
}

/**
 * Check if old presets exist and need migration
 */
export function needsMigration() {
  return localStorage.getItem(OLD_PRESETS_KEY) !== null;
}

/**
 * Migrate old user presets to new scenario format
 */
export function migrateOldPresets() {
  const oldRaw = localStorage.getItem(OLD_PRESETS_KEY);
  if (!oldRaw) return false;

  try {
    const oldPresets = JSON.parse(oldRaw);
    const state = loadScenarioState();

    // Convert old presets to scenarios
    const migrated = oldPresets.map(p => {
      // Extract filters that are actually constraining (not full range)
      const filters = {};
      if (p.offroad && p.offroad[0] > 1) filters.offroad = p.offroad;
      if (p.luxury && p.luxury[0] > 1) filters.luxury = p.luxury;
      if (p.reliability && p.reliability[0] > 1) filters.reliability = p.reliability;
      if (p.mpg && p.mpg[0] > 10) filters.mpg = p.mpg;
      if (p.cargo && p.cargo[0] > 10) filters.cargo = p.cargo;
      if (p.performance && p.performance[0] > 1) filters.performance = p.performance;

      return {
        id: p.id || generateScenarioId(p.label),
        label: p.label,
        description: p.description || "",
        filters,
        weights: { ...DEFAULT_WEIGHTS },
        builtIn: false,
        migratedFrom: "v1",
        createdAt: Date.now(),
      };
    });

    // Add migrated presets to custom scenarios
    state.custom = [...state.custom, ...migrated];
    saveScenarioState(state);

    // Remove old key
    localStorage.removeItem(OLD_PRESETS_KEY);

    console.log(`Migrated ${migrated.length} presets to scenarios`);
    return true;
  } catch (e) {
    console.error("Failed to migrate old presets:", e);
    return false;
  }
}

/**
 * Create a modified copy of a scenario for saving
 */
export function createScenarioCopy(baseScenario, modifications = {}) {
  const newLabel = modifications.label || `${baseScenario.label} (Copy)`;
  return {
    id: generateScenarioId(newLabel),
    label: newLabel,
    description: modifications.description || baseScenario.description,
    filters: { ...baseScenario.filters, ...modifications.filters },
    weights: { ...baseScenario.weights, ...modifications.weights },
    builtIn: false,
    basedOn: baseScenario.id,
  };
}

/**
 * Apply filter ranges from a scenario, filling in defaults for unspecified
 */
export function getEffectiveFilters(scenario, dataRanges) {
  const effective = {};
  const filterKeys = ["mpg", "offroad", "luxury", "reliability", "cargo", "performance"];

  for (const key of filterKeys) {
    const scenarioFilter = scenario.filters?.[key];
    const dataRange = dataRanges[key];

    if (scenarioFilter) {
      // Use scenario filter, with null meaning "no limit"
      effective[key] = [
        scenarioFilter[0] ?? dataRange?.min ?? 1,
        scenarioFilter[1] ?? dataRange?.max ?? 10,
      ];
    } else {
      // No filter in scenario = full range
      effective[key] = [dataRange?.min ?? 1, dataRange?.max ?? 10];
    }
  }

  return effective;
}
