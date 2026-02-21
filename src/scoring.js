/**
 * Vehicle Scoring & Filtering Utilities
 * Extracted for testability
 */

/**
 * Compute data-derived ranges for a set of vehicles
 * @param {Array} vehicles - Array of vehicle objects
 * @param {Array} attributes - Array of attribute configs with id field
 * @returns {Object} Map of attribute id to {min, max}
 */
export function computeDataRanges(vehicles, attributes) {
  const ranges = {};
  attributes.forEach(a => {
    const values = vehicles.map(v => v[a.id]).filter(v => typeof v === 'number');
    ranges[a.id] = {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  });
  return ranges;
}

/**
 * Calculate weighted score for a vehicle using weighted geometric mean.
 *
 * Geometric mean penalizes weak spots more than arithmetic mean:
 * - A vehicle excellent at one thing but poor at another scores lower
 * - A vehicle balanced across priorities scores higher
 * - This prevents "jack of all trades" vehicles from dominating
 *
 * @param {Object} vehicle - Vehicle object
 * @param {Object} priorities - Map of attribute id to weight (0-5)
 * @param {Object} dataRanges - Map of attribute id to {min, max}
 * @param {Array} priorityAttrs - Array of attribute configs with id and priorityKey
 * @returns {number} Score from 0-100
 */
export function calculateScore(vehicle, priorities, dataRanges, priorityAttrs) {
  const EPSILON = 0.05; // Floor to prevent log(0) and extreme penalties

  let weightedLogSum = 0;
  let totalWeight = 0;

  for (const a of priorityAttrs) {
    const pKey = a.priorityKey || a.id;
    const weight = priorities[pKey] || 0;
    if (weight > 0) {
      const dr = dataRanges[a.id];
      if (dr && dr.max !== dr.min) {
        const normalized = (vehicle[a.id] - dr.min) / (dr.max - dr.min);
        // Clamp to [EPSILON, 1] to avoid log(0) and extreme outlier penalties
        const safeNormalized = Math.max(normalized, EPSILON);
        weightedLogSum += weight * Math.log(safeNormalized);
        totalWeight += weight;
      }
    }
  }

  if (totalWeight === 0) return 0;

  // Weighted geometric mean: exp(sum(w*log(x)) / sum(w))
  const geometricMean = Math.exp(weightedLogSum / totalWeight);
  return Math.round(geometricMean * 100);
}

/**
 * Simple fuzzy match: checks if all query words appear somewhere in the target string
 * @param {string} query - Search query
 * @param {string} target - String to search in
 * @returns {boolean}
 */
export function fuzzyMatch(query, target) {
  if (!query) return true;
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase();
  const words = q.split(/\s+/).filter(Boolean);
  return words.every(word => t.includes(word));
}

/**
 * Get searchable text for a vehicle
 * @param {Object} vehicle - Vehicle object
 * @returns {string}
 */
export function getSearchableText(vehicle) {
  return [vehicle.make, vehicle.model, vehicle.trim, vehicle.generation].filter(Boolean).join(' ');
}

/**
 * Get display name for a vehicle
 * @param {Object} vehicle - Vehicle object
 * @returns {string}
 */
export function getDisplayName(vehicle) {
  let name = `${vehicle.make} ${vehicle.model}`;
  if (vehicle.trim) name += ` ${vehicle.trim}`;
  return name;
}

/**
 * Check if a vehicle passes all filters
 * @param {Object} vehicle - Vehicle object
 * @param {Object} filters - Filter configuration
 * @returns {boolean}
 */
export function vehiclePassesFilters(vehicle, filters) {
  const {
    priceRange,
    ranges,
    ptFilter,
    sizeFilter,
    makeFilter,
    searchQuery,
    filterAttrs,
  } = filters;

  // Price filter
  if (vehicle.price < priceRange[0] || vehicle.price > priceRange[1]) {
    return false;
  }

  // Enum filters
  if (!ptFilter.includes(vehicle.pt)) return false;
  if (!sizeFilter.includes(vehicle.size)) return false;
  if (makeFilter.length > 0 && !makeFilter.includes(vehicle.make)) return false;

  // Search filter
  if (!fuzzyMatch(searchQuery, getSearchableText(vehicle))) return false;

  // Range filters for all attributes
  for (const a of filterAttrs) {
    const range = ranges[a.id];
    if (range && (vehicle[a.id] < range[0] || vehicle[a.id] > range[1])) {
      return false;
    }
  }

  return true;
}
