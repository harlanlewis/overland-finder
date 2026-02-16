import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import vehiclesData from "./vehicles.json";

const V = vehiclesData;

// Compute data-derived bounds for dynamic ranges
const DATA_PRICE_MIN = Math.min(...V.map(v => v.price));
const DATA_PRICE_MAX = Math.max(...V.map(v => v.price));
const DATA_MPG_MIN = Math.min(...V.map(v => v.mpg));
const DATA_MPG_MAX = Math.max(...V.map(v => v.mpg));
const DATA_CARGO_MIN = Math.min(...V.map(v => v.cargo));
const DATA_CARGO_MAX = Math.max(...V.map(v => v.cargo));

// Migrate legacy localStorage data (ice -> gas, add compact to size filters)
const migratePreset = (preset) => {
  const migrated = { ...preset };
  // Migrate size: add "compact" if missing (legacy presets only had mid/full)
  if (migrated.size && !migrated.size.includes("compact")) {
    migrated.size = ["compact", ...migrated.size];
  }
  return migrated;
};

// Load user presets from localStorage
const loadUserPresets = () => {
  try {
    const saved = localStorage.getItem("overland-finder-presets");
    if (!saved) return [];
    const presets = JSON.parse(saved);
    return presets.map(migratePreset);
  } catch {
    return [];
  }
};

// Migrate legacy ptFilter from localStorage (ice -> gas)
const migratePtFilter = (ptFilter) => {
  if (!ptFilter) return null;
  return ptFilter.map(pt => pt === "ice" ? "gas" : pt);
};

// Save user presets to localStorage
const saveUserPresets = (presets) => {
  localStorage.setItem("overland-finder-presets", JSON.stringify(presets));
};

// Extract unique manufacturers
const MAKES = [...new Set(V.map(v => v.make))].sort();

// Single source of truth for powertrain types (order matters for UI)
const POWERTRAINS = [
  { id: "hybrid", label: "Hybrid", color: "#2ecc71" },
  { id: "phev", label: "PHEV", color: "#3498db" },
  { id: "ev", label: "EV", color: "#9b59b6" },
  { id: "gas", label: "Gas", color: "#e67e22" },
  { id: "diesel", label: "Diesel", color: "#95a5a6" },
];
const PT_IDS = POWERTRAINS.map(p => p.id);
const ptLabels = Object.fromEntries(POWERTRAINS.map(p => [p.id, p.label]));
const ptColors = Object.fromEntries(POWERTRAINS.map(p => [p.id, p.color]));
// Single source of truth for sizes
const SIZES = [
  { id: "compact", label: "Compact" },
  { id: "mid", label: "Midsize" },
  { id: "full", label: "Full-size" },
];

// Compose display name from vehicle fields: Make Model Trim (Generation)
const getDisplayName = (v) => {
  let name = `${v.make} ${v.model}`;
  if (v.trim) name += ` ${v.trim}`;
  return name;
};

// Simple fuzzy match: checks if all query words appear somewhere in the target string
const fuzzyMatch = (query, target) => {
  if (!query) return true;
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase();
  // Split query into words and check if all appear in target
  const words = q.split(/\s+/).filter(Boolean);
  return words.every(word => t.includes(word));
};

// Get searchable text for a vehicle
const getSearchableText = (v) => {
  return [v.make, v.model, v.trim, v.generation].filter(Boolean).join(" ");
};
const SIZE_IDS = SIZES.map(s => s.id);
const sizeLabels = Object.fromEntries(SIZES.map(s => [s.id, s.label]));

// Single source of truth for vehicle attributes
// Each attribute has: id (matches Vehicle property), labels for different contexts, range/scoring config
// Rating scales (offroad, luxury, etc.) use 1-10; physical measurements (mpg, cargo) derive from data
const ATTRIBUTES = [
  { id: "mpg", label: "MPG", shortLabel: "MPG", priorityLabel: "Fuel Econ", min: DATA_MPG_MIN, max: DATA_MPG_MAX, step: 1, description: "Filter by fuel efficiency range", priority: 2, sortable: true, summaryField: true },
  { id: "offroad", label: "Off-Road", shortLabel: "Off-Rd", priorityLabel: "Off-Road", min: 1, max: 10, step: 0.5, description: "3 = gravel roads · 6 = moderate trails · 8+ = serious", priority: 3, sortable: true, summaryField: true },
  { id: "luxury", label: "Luxury", shortLabel: "Lux", priorityLabel: "Luxury", min: 1, max: 10, step: 0.5, description: "Interior quality & comfort level", priority: 3, sortable: true, summaryField: true },
  { id: "reliability", label: "Reliability", shortLabel: "Rel", priorityLabel: "Reliability", min: 1, max: 10, step: 0.5, description: "Expected dependability & repair costs", priority: 3, sortable: true, summaryField: true },
  { id: "cargo", label: "Cargo", shortLabel: "Cargo", priorityLabel: "Cargo", min: DATA_CARGO_MIN, max: DATA_CARGO_MAX, step: 1, unit: " cu ft", description: "Cargo capacity behind 2nd row", priority: 3, detailOnly: true },
  { id: "performance", label: "Performance", shortLabel: "Perf", priorityLabel: "Performance", min: 1, max: 10, step: 0.5, description: "Acceleration, power & driving dynamics", priority: 2, sortable: true, detailOnly: true },
  { id: "tow", label: "Towing", shortLabel: "Tow", priorityLabel: "Towing", priorityKey: "towing", presetKey: "towing", min: 0, max: 15000, step: 500, unit: " lbs", description: "Maximum towing capacity", priority: 0, detailOnly: true, noFilter: true, formatVal: v => v.toLocaleString() },
  { id: "gc", label: "Ground Clear.", shortLabel: "GC", min: 6, max: 12, step: 0.5, unit: "\"", detailOnly: true, noFilter: true },
];
const ATTR_BY_ID = Object.fromEntries(ATTRIBUTES.map(a => [a.id, a]));
const SORTABLE_ATTRS = ATTRIBUTES.filter(a => a.sortable);
const SUMMARY_ATTRS = ATTRIBUTES.filter(a => a.summaryField);
const DETAIL_ATTRS = ATTRIBUTES.filter(a => !a.noFilter);
const PRIORITY_ATTRS = ATTRIBUTES.filter(a => a.priority !== undefined);

// Default priorities - balanced starting point, user adjusts for their use case
const DEFAULT_PRIORITIES = Object.fromEntries(PRIORITY_ATTRS.map(a => [a.priorityKey || a.id, a.priority]));

// Range filters: [min, max] for each attribute
// Rating scales use 1-10; mpg/cargo use data-derived bounds
const PRESETS = [
  {
    id: "your_brief", label: "Your Brief",
    description: "Family of 4 + dog · real off-road · luxury · 16+ mpg · reliable · ≤$100K",
    price: [DATA_PRICE_MIN, 100], mpg: [16, DATA_MPG_MAX], offroad: [7, 10], luxury: [6.5, 10], reliability: [6, 10], cargo: [34, DATA_CARGO_MAX],
    performance: [1, 10], towing: [0, 15000], size: ["compact", "mid", "full"], sortBy: "score",
  },
  {
    id: "trail_hardcore", label: "Trail First",
    description: "Maximum off-road · lockers & clearance · comfort secondary",
    price: [DATA_PRICE_MIN, 125], mpg: [16, DATA_MPG_MAX], offroad: [8, 10], luxury: [1, 10], reliability: [1, 10], cargo: [30, DATA_CARGO_MAX],
    performance: [1, 10], towing: [0, 15000], size: ["compact", "mid", "full"], sortBy: "offroad",
  },
  {
    id: "highway_lux", label: "Highway Luxury",
    description: "Comfort & refinement first · moderate trails only · premium interior",
    price: [DATA_PRICE_MIN, 125], mpg: [20, DATA_MPG_MAX], offroad: [1, 7], luxury: [8, 10], reliability: [1, 10], cargo: [30, DATA_CARGO_MAX],
    performance: [1, 10], towing: [0, 15000], size: ["compact", "mid", "full"], sortBy: "luxury",
  },
  {
    id: "efficiency", label: "Eco Overlander",
    description: "Best MPG · EV/PHEV/hybrid · still trail-capable",
    price: [DATA_PRICE_MIN, 125], mpg: [21, DATA_MPG_MAX], offroad: [5, 10], luxury: [1, 10], reliability: [1, 10], cargo: [30, DATA_CARGO_MAX],
    performance: [1, 10], towing: [0, 15000], size: ["compact", "mid", "full"], sortBy: "mpg",
  },
  {
    id: "budget_overlander", label: "Budget Build",
    description: "Under $30K · proven platforms · DIY-friendly · best value",
    price: [DATA_PRICE_MIN, 30], mpg: [16, DATA_MPG_MAX], offroad: [6, 10], luxury: [1, 10], reliability: [6, 10], cargo: [DATA_CARGO_MIN, DATA_CARGO_MAX],
    performance: [1, 10], towing: [0, 15000], size: ["compact", "mid", "full"], sortBy: "score",
  },
  {
    id: "open", label: "Wide Open",
    description: "No filters · show everything · I want to explore",
    price: [DATA_PRICE_MIN, DATA_PRICE_MAX], mpg: [DATA_MPG_MIN, DATA_MPG_MAX], offroad: [1, 10], luxury: [1, 10], reliability: [1, 10], cargo: [DATA_CARGO_MIN, DATA_CARGO_MAX],
    performance: [1, 10], towing: [0, 15000], size: ["compact", "mid", "full"], sortBy: "score",
  },
];

const DEFAULT_PRESET = PRESETS[0];

// Attributes that have range filters (exclude gc which has noFilter)
const FILTER_ATTRS = ATTRIBUTES.filter(a => !a.noFilter);

export default function OverlandFinder() {
  const [priceRange, setPriceRange] = useState(DEFAULT_PRESET.price);
  // Consolidated range state for all filterable attributes
  const [ranges, setRanges] = useState(() => {
    const initial = {};
    FILTER_ATTRS.forEach(a => {
      const presetKey = a.presetKey || a.id;
      initial[a.id] = DEFAULT_PRESET[presetKey] || [a.min, a.max];
    });
    return initial;
  });
  const setRange = (id, val) => setRanges(prev => ({ ...prev, [id]: val }));
  const [ptFilter, setPtFilter] = useState([...PT_IDS]);
  const [sizeFilter, setSizeFilter] = useState(DEFAULT_PRESET.size);
  const [makeFilter, setMakeFilter] = useState([]);
  const [showMakeDropdown, setShowMakeDropdown] = useState(false);
  const makeDropdownRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchExpanded, setSearchExpanded] = useState(false);
  const searchInputRef = useRef(null);
  const [sortBy, setSortBy] = useState(DEFAULT_PRESET.sortBy);
  const [sortAsc, setSortAsc] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [priorities, setPriorities] = useState(DEFAULT_PRIORITIES);
  const [activePreset, setActivePreset] = useState(DEFAULT_PRESET.id);
  const [hoveredVehicle, setHoveredVehicle] = useState(null);
  const [showWeightsPopover, setShowWeightsPopover] = useState(false);
  const [userPresets, setUserPresets] = useState(loadUserPresets);
  const [showSavePreset, setShowSavePreset] = useState(false);
  const [savePresetMode, setSavePresetMode] = useState("update"); // "update" or "new"
  const [savePresetTarget, setSavePresetTarget] = useState(null); // id of preset to update
  const [savePresetTitle, setSavePresetTitle] = useState("");
  const [savePresetDesc, setSavePresetDesc] = useState("");
  const weightsPopoverRef = useRef(null);

  // Close weights popover when clicking outside
  useEffect(() => {
    if (!showWeightsPopover) return;
    const handleClickOutside = (e) => {
      if (weightsPopoverRef.current && !weightsPopoverRef.current.contains(e.target)) {
        setShowWeightsPopover(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showWeightsPopover]);

  // Close make dropdown when clicking outside
  useEffect(() => {
    if (!showMakeDropdown) return;
    const handleClickOutside = (e) => {
      if (makeDropdownRef.current && !makeDropdownRef.current.contains(e.target)) {
        setShowMakeDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMakeDropdown]);

  // Auto-focus search input when expanded
  useEffect(() => {
    if (searchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchExpanded]);

  // Persist user presets to localStorage
  useEffect(() => {
    saveUserPresets(userPresets);
  }, [userPresets]);

  // All presets combined (built-in + user)
  const allPresets = useMemo(() => [...PRESETS, ...userPresets], [userPresets]);

  const applyPreset = useCallback((preset) => {
    setPriceRange([...preset.price]);
    const newRanges = {};
    FILTER_ATTRS.forEach(a => {
      const presetKey = a.presetKey || a.id;
      newRanges[a.id] = [...preset[presetKey]];
    });
    setRanges(newRanges);
    setSizeFilter([...preset.size]);
    setSortBy(preset.sortBy);
    setActivePreset(preset.id);
    setExpanded(null);
  }, []);

  const clearPreset = useCallback(() => setActivePreset(null), []);

  const resetAllFilters = useCallback(() => {
    const openPreset = PRESETS.find(p => p.id === "open");
    if (openPreset) {
      setPriceRange([...openPreset.price]);
      const newRanges = {};
      FILTER_ATTRS.forEach(a => {
        const presetKey = a.presetKey || a.id;
        newRanges[a.id] = [...openPreset[presetKey]];
      });
      setRanges(newRanges);
      setSizeFilter([...openPreset.size]);
      setSortBy(openPreset.sortBy);
    }
    setActivePreset("open");
    setExpanded(null);
  }, []);

  const togglePt = useCallback((pt) => {
    setPtFilter(prev => prev.includes(pt) ? prev.filter(p => p !== pt) : [...prev, pt]);
    clearPreset();
  }, [clearPreset]);

  const toggleSize = useCallback((s) => {
    setSizeFilter(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
    clearPreset();
  }, [clearPreset]);

  const adjPriority = useCallback((key, delta) => {
    setPriorities(prev => ({ ...prev, [key]: Math.max(0, Math.min(5, prev[key] + delta)) }));
  }, []);

  // Get current filter state as a preset object (excludes makes & powertrain)
  const getCurrentFiltersAsPreset = useCallback(() => {
    const preset = { price: [...priceRange], size: [...sizeFilter], sortBy };
    FILTER_ATTRS.forEach(a => {
      const presetKey = a.presetKey || a.id;
      preset[presetKey] = [...ranges[a.id]];
    });
    return preset;
  }, [priceRange, ranges, sizeFilter, sortBy]);

  // Open save preset popover
  const openSavePreset = useCallback(() => {
    // Default to update mode if there are user presets, otherwise new
    if (userPresets.length > 0) {
      setSavePresetMode("update");
      setSavePresetTarget(userPresets[0].id);
      setSavePresetTitle(userPresets[0].label);
      setSavePresetDesc(userPresets[0].description);
    } else {
      setSavePresetMode("new");
      setSavePresetTarget(null);
      setSavePresetTitle("");
      setSavePresetDesc("");
    }
    setShowSavePreset(true);
  }, [userPresets]);

  // Handle saving preset
  const handleSavePreset = useCallback(() => {
    const filters = getCurrentFiltersAsPreset();

    if (savePresetMode === "update" && savePresetTarget) {
      // Update existing user preset
      setUserPresets(prev => prev.map(p =>
        p.id === savePresetTarget
          ? { ...p, ...filters, label: savePresetTitle, description: savePresetDesc }
          : p
      ));
      setActivePreset(savePresetTarget);
    } else {
      // Create new preset
      const newPreset = {
        id: `user_${Date.now()}`,
        label: savePresetTitle || "Custom Preset",
        description: savePresetDesc || "Custom filter configuration",
        ...filters,
        isUser: true,
      };
      setUserPresets(prev => [...prev, newPreset]);
      setActivePreset(newPreset.id);
    }

    setShowSavePreset(false);
  }, [savePresetMode, savePresetTarget, savePresetTitle, savePresetDesc, getCurrentFiltersAsPreset]);

  // Delete a user preset
  const deleteUserPreset = useCallback((presetId) => {
    setUserPresets(prev => prev.filter(p => p.id !== presetId));
    if (activePreset === presetId) {
      setActivePreset(null);
    }
  }, [activePreset]);

  // Check if current filters match any preset (excludes makes & powertrain)
  const filtersMatchPreset = useMemo(() => {
    const arraysEqual = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

    return allPresets.some(p => {
      if (!arraysEqual(p.price, priceRange)) return false;
      if (!arraysEqual([...p.size].sort(), [...sizeFilter].sort())) return false;
      for (const a of FILTER_ATTRS) {
        const presetKey = a.presetKey || a.id;
        if (!arraysEqual(p[presetKey], ranges[a.id])) return false;
      }
      return true;
    });
  }, [priceRange, ranges, sizeFilter, allPresets]);

  // Data ranges for proper normalization - ALL attributes normalized to actual data range
  const dataRanges = useMemo(() => {
    const ranges = {};
    PRIORITY_ATTRS.forEach(a => {
      ranges[a.id] = {
        min: Math.min(...V.map(v => v[a.id])),
        max: Math.max(...V.map(v => v[a.id])),
      };
    });
    return ranges;
  }, []);

  const scored = useMemo(() => {
    const totalWeight = Object.values(priorities).reduce((a, b) => a + b, 0) || 1;

    return V.map(v => {
      // Check price filter and enum filters
      let passesFilters = v.price >= priceRange[0] && v.price <= priceRange[1] &&
        ptFilter.includes(v.pt) && sizeFilter.includes(v.size) &&
        (makeFilter.length === 0 || makeFilter.includes(v.make)) &&
        fuzzyMatch(searchQuery, getSearchableText(v));

      // Check all attribute range filters
      if (passesFilters) {
        for (const a of FILTER_ATTRS) {
          const range = ranges[a.id];
          if (v[a.id] < range[0] || v[a.id] > range[1]) {
            passesFilters = false;
            break;
          }
        }
      }

      // Calculate score from all priority attributes
      let totalScore = 0;
      for (const a of PRIORITY_ATTRS) {
        const pKey = a.priorityKey || a.id;
        const weight = priorities[pKey];
        if (weight > 0) {
          const dr = dataRanges[a.id];
          const normalized = (v[a.id] - dr.min) / (dr.max - dr.min);
          totalScore += normalized * weight;
        }
      }

      const score = (totalScore / totalWeight) * 100;
      return { ...v, pass: passesFilters, score: Math.round(score) };
    });
  }, [priceRange, ranges, ptFilter, sizeFilter, makeFilter, searchQuery, priorities, dataRanges]);

  const filtered = useMemo(() => {
    const f = scored.filter(v => v.pass);
    const dir = sortAsc ? 1 : -1;
    const sortFn = sortBy === "score" ? (a, b) => dir * (a.score - b.score)
      : sortBy === "price" ? (a, b) => dir * (a.price - b.price)
      : sortBy === "mpg" ? (a, b) => dir * (a.mpg - b.mpg)
      : sortBy === "offroad" ? (a, b) => dir * (a.offroad - b.offroad)
      : sortBy === "luxury" ? (a, b) => dir * (a.luxury - b.luxury)
      : sortBy === "reliability" ? (a, b) => dir * (a.reliability - b.reliability)
      : sortBy === "performance" ? (a, b) => dir * (a.performance - b.performance)
      : (a, b) => dir * (a.score - b.score);
    return f.sort(sortFn);
  }, [scored, sortBy, sortAsc]);

  const eliminated = scored.filter(v => !v.pass).sort((a, b) => b.score - a.score);

  // Compute filter reasons for a vehicle - returns array of {label, type, current, required}
  const getFilterReasons = useCallback((v) => {
    const reasons = [];

    // Price
    if (v.price < priceRange[0]) {
      reasons.push({ label: "Price", type: "price", detail: `$${v.price}K < $${priceRange[0]}K` });
    } else if (v.price > priceRange[1]) {
      reasons.push({ label: "Price", type: "price", detail: `$${v.price}K > $${priceRange[1]}K` });
    }

    // Powertrain
    if (!ptFilter.includes(v.pt)) {
      reasons.push({ label: ptLabels[v.pt], type: "pt", detail: "excluded" });
    }

    // Size
    if (!sizeFilter.includes(v.size)) {
      reasons.push({ label: sizeLabels[v.size], type: "size", detail: "excluded" });
    }

    // Make
    if (makeFilter.length > 0 && !makeFilter.includes(v.make)) {
      reasons.push({ label: v.make, type: "make", detail: "not selected" });
    }

    // Search
    if (searchQuery && !fuzzyMatch(searchQuery, getSearchableText(v))) {
      reasons.push({ label: "Search", type: "search", detail: "no match" });
    }

    // Attribute range filters
    for (const a of FILTER_ATTRS) {
      const range = ranges[a.id];
      const val = v[a.id];
      const unit = a.unit || "";
      if (val < range[0]) {
        reasons.push({ label: a.shortLabel, type: "range", attr: a.id, detail: `${val}${unit} < ${range[0]}${unit}` });
      } else if (val > range[1]) {
        reasons.push({ label: a.shortLabel, type: "range", attr: a.id, detail: `${val}${unit} > ${range[1]}${unit}` });
      }
    }

    return reasons;
  }, [priceRange, ptFilter, sizeFilter, makeFilter, searchQuery, ranges]);

  // Relax filters to include a specific vehicle
  const includeVehicle = useCallback((v) => {
    // Relax price if needed
    let newPriceRange = [...priceRange];
    if (v.price < priceRange[0]) newPriceRange[0] = v.price;
    if (v.price > priceRange[1]) newPriceRange[1] = v.price;
    if (newPriceRange[0] !== priceRange[0] || newPriceRange[1] !== priceRange[1]) {
      setPriceRange(newPriceRange);
    }

    // Add powertrain if missing
    if (!ptFilter.includes(v.pt)) {
      setPtFilter(prev => [...prev, v.pt]);
    }

    // Add size if missing
    if (!sizeFilter.includes(v.size)) {
      setSizeFilter(prev => [...prev, v.size]);
    }

    // Add make if make filter is active and this make is missing
    if (makeFilter.length > 0 && !makeFilter.includes(v.make)) {
      setMakeFilter(prev => [...prev, v.make]);
    }

    // Clear search if it's blocking
    if (searchQuery && !fuzzyMatch(searchQuery, getSearchableText(v))) {
      setSearchQuery("");
    }

    // Relax attribute ranges
    const newRanges = { ...ranges };
    let rangesChanged = false;
    for (const a of FILTER_ATTRS) {
      const range = newRanges[a.id];
      const val = v[a.id];
      if (val < range[0]) {
        newRanges[a.id] = [val, range[1]];
        rangesChanged = true;
      } else if (val > range[1]) {
        newRanges[a.id] = [range[0], val];
        rangesChanged = true;
      }
    }
    if (rangesChanged) {
      setRanges(newRanges);
    }

    clearPreset();
  }, [priceRange, ptFilter, sizeFilter, makeFilter, searchQuery, ranges, clearPreset]);

  const SliderControl = ({ label, value, setValue, min, max, step, unit, stops, description }) => (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "var(--font-mono)" }}>{label}</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#c8d6c3", fontFamily: "var(--font-mono)" }}>{value}{unit}</span>
      </div>
      {description && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 6, lineHeight: 1.4 }}>{description}</div>}
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => { setValue(Number(e.target.value)); clearPreset(); }}
        style={{ width: "100%" }} />
      {stops && (
        <div style={{ position: "relative", marginTop: 3, height: 24 }}>
          {stops.map((s, i) => {
            const pct = ((s.value - min) / (max - min)) * 100;
            return (
              <button key={i} onClick={() => { setValue(s.value); clearPreset(); }}
                style={{
                  position: "absolute",
                  left: `${pct}%`,
                  transform: "translateX(-50%)",
                  background: value === s.value ? "rgba(122,158,109,0.3)" : "transparent",
                  border: value === s.value ? "1px solid rgba(122,158,109,0.5)" : "1px solid rgba(255,255,255,0.06)",
                  color: value === s.value ? "#c8d6c3" : "rgba(255,255,255,0.25)",
                  fontSize: 10, padding: "2px 8px", borderRadius: 4, cursor: "pointer", fontFamily: "var(--font-mono)",
                  whiteSpace: "nowrap",
                }}>
                {s.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  const RangeSliderControl = ({ label, range, setRange, min, max, step, unit, description }) => {
    const [localMin, localMax] = range;
    const pctMin = ((localMin - min) / (max - min)) * 100;
    const pctMax = ((localMax - min) / (max - min)) * 100;
    return (
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "var(--font-mono)" }}>{label}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#c8d6c3", fontFamily: "var(--font-mono)" }}>
            {localMin === min && localMax === max ? "Any" : `${localMin}${unit} – ${localMax}${unit}`}
          </span>
        </div>
        {description && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 6, lineHeight: 1.4 }}>{description}</div>}
        <div style={{ position: "relative", height: 20, marginTop: 4 }}>
          {/* Track background - clickable */}
          <div
            style={{ position: "absolute", top: 3, left: 0, right: 0, height: 14, background: "transparent", cursor: "pointer", zIndex: 1 }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickPct = (e.clientX - rect.left) / rect.width;
              const clickVal = Math.round((min + clickPct * (max - min)) / step) * step;
              // Move whichever thumb is closer
              const distToMin = Math.abs(clickVal - localMin);
              const distToMax = Math.abs(clickVal - localMax);
              if (distToMin <= distToMax) {
                setRange([Math.min(clickVal, localMax), localMax]);
              } else {
                setRange([localMin, Math.max(clickVal, localMin)]);
              }
              clearPreset();
            }}
          />
          <div style={{ position: "absolute", top: 7, left: 0, right: 0, height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, pointerEvents: "none" }} />
          {/* Active range highlight */}
          <div style={{ position: "absolute", top: 7, left: `${pctMin}%`, width: `${pctMax - pctMin}%`, height: 6, background: "rgba(122,158,109,0.5)", borderRadius: 3, pointerEvents: "none" }} />
          {/* Min thumb */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: `calc(${pctMin}% - 9px)`,
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: "#7a9e6d",
              border: "2px solid #c8d6c3",
              cursor: "grab",
              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
              zIndex: localMin === localMax ? 4 : 3,
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              const startX = e.clientX;
              const startVal = localMin;
              const track = e.currentTarget.parentElement;
              const trackRect = track.getBoundingClientRect();
              const handleMove = (moveEvent) => {
                const deltaX = moveEvent.clientX - startX;
                const deltaPct = (deltaX / trackRect.width) * (max - min);
                let newVal = Math.round((startVal + deltaPct) / step) * step;
                newVal = Math.max(min, Math.min(localMax, newVal));
                setRange([newVal, localMax]);
                clearPreset();
              };
              const handleUp = () => {
                document.removeEventListener("mousemove", handleMove);
                document.removeEventListener("mouseup", handleUp);
              };
              document.addEventListener("mousemove", handleMove);
              document.addEventListener("mouseup", handleUp);
            }}
          />
          {/* Max thumb */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: `calc(${pctMax}% - 9px)`,
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: "#7a9e6d",
              border: "2px solid #c8d6c3",
              cursor: "grab",
              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
              zIndex: 3,
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              const startX = e.clientX;
              const startVal = localMax;
              const track = e.currentTarget.parentElement;
              const trackRect = track.getBoundingClientRect();
              const handleMove = (moveEvent) => {
                const deltaX = moveEvent.clientX - startX;
                const deltaPct = (deltaX / trackRect.width) * (max - min);
                let newVal = Math.round((startVal + deltaPct) / step) * step;
                newVal = Math.max(localMin, Math.min(max, newVal));
                setRange([localMin, newVal]);
                clearPreset();
              };
              const handleUp = () => {
                document.removeEventListener("mousemove", handleMove);
                document.removeEventListener("mouseup", handleUp);
              };
              document.addEventListener("mousemove", handleMove);
              document.addEventListener("mouseup", handleUp);
            }}
          />
        </div>
      </div>
    );
  };

  const ToggleGroup = ({ label, options, active, toggle }) => (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8, fontFamily: "var(--font-mono)" }}>{label}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {options.map(opt => {
          const isActive = active.includes(opt.value);
          return (
            <button key={opt.value} onClick={() => toggle(opt.value)}
              style={{
                padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
                background: isActive ? (opt.color || "rgba(122,158,109,0.2)") : "rgba(255,255,255,0.03)",
                border: `1px solid ${isActive ? (opt.borderColor || "rgba(122,158,109,0.4)") : "rgba(255,255,255,0.08)"}`,
                color: isActive ? "#fff" : "rgba(255,255,255,0.3)",
                fontFamily: "var(--font-body)",
                transition: "all 0.2s ease",
              }}>
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  const Bar = ({ val, max, color, width }) => (
    <div style={{ width: width || 80, height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
      <div style={{ width: `${(val / max) * 100}%`, height: "100%", background: color || "#7a9e6d", borderRadius: 3, transition: "width 0.4s ease" }} />
    </div>
  );

  const PriorityControl = ({ label, value, pKey }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
      <span style={{ width: 80, fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-body)" }}>{label}</span>
      <button onClick={() => adjPriority(pKey, -1)} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.4)", width: 24, height: 24, borderRadius: 4, cursor: "pointer", fontSize: 14 }}>−</button>
      <div style={{ display: "flex", gap: 3 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ width: 16, height: 16, borderRadius: 3, background: i <= value ? "#7a9e6d" : "rgba(255,255,255,0.06)", border: `1px solid ${i <= value ? "rgba(122,158,109,0.5)" : "rgba(255,255,255,0.08)"}`, transition: "all 0.2s", cursor: "pointer" }} onClick={() => setPriorities(prev => ({ ...prev, [pKey]: i }))} />
        ))}
      </div>
      <button onClick={() => adjPriority(pKey, 1)} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.4)", width: 24, height: 24, borderRadius: 4, cursor: "pointer", fontSize: 14 }}>+</button>
      {value === 0 && <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-mono)" }}>off</span>}
    </div>
  );

  // Chart dimensions - X axis: price (scales to price range), Y axis: score
  const chartPadding = { left: 35, right: 10, top: 10, bottom: 25 };
  const chartPriceMin = Math.max(0, DATA_PRICE_MIN - 5);
  const chartPriceMax = Math.max(priceRange[1] + 20, DATA_PRICE_MAX);
  const scoreMin = 30;
  // Y-axis ceiling: find max score in list, round up to nearest 5, add small buffer
  const maxScoreInData = Math.max(...scored.map(v => v.score), 50);
  const scoreMax = Math.min(100, Math.ceil((maxScoreInData + 3) / 5) * 5);

  // Price line positions on chart - show lines when filter is narrower than data range
  const minPriceLineX = priceRange[0] > DATA_PRICE_MIN ? ((priceRange[0] - chartPriceMin) / (chartPriceMax - chartPriceMin)) * 100 : null;
  const maxPriceLineX = priceRange[1] < DATA_PRICE_MAX ? ((priceRange[1] - chartPriceMin) / (chartPriceMax - chartPriceMin)) * 100 : null;

  return (
    <div style={{
      "--font-body": "'Barlow', sans-serif",
      "--font-mono": "'IBM Plex Mono', monospace",
      "--bg": "#0b100e",
      "--card": "rgba(255,255,255,0.025)",
      "--border": "rgba(255,255,255,0.07)",
      "--accent": "#7a9e6d",
      "--accent2": "#c8d6c3",
      minHeight: "100vh",
      background: "var(--bg)",
      color: "#e8ebe6",
      fontFamily: "var(--font-body)",
    }}>
      <style>{`
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: rgba(255,255,255,0.1);
          border-radius: 3px;
          height: 6px;
          cursor: pointer;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #7a9e6d;
          cursor: grab;
          border: 2px solid #c8d6c3;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          transition: transform 0.1s ease;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }
        input[type="range"]::-webkit-slider-thumb:active {
          cursor: grabbing;
          transform: scale(1.1);
        }
        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #7a9e6d;
          cursor: grab;
          border: 2px solid #c8d6c3;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        input[type="range"]::-moz-range-track {
          background: rgba(255,255,255,0.1);
          border-radius: 3px;
          height: 6px;
        }
      `}</style>
      {/* Topo texture overlay */}
      <div style={{ position: "fixed", inset: 0, opacity: 0.03, pointerEvents: "none",
        backgroundImage: `repeating-conic-gradient(rgba(122,158,109,0.3) 0% 25%, transparent 0% 50%)`,
        backgroundSize: "60px 60px",
      }} />

      <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto", padding: "20px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 320px) 1fr", gap: 24, alignItems: "start" }}>
          {/* Left panel - controls */}
          <div style={{ position: "sticky", top: 16, maxHeight: "calc(100vh - 32px)", overflowY: "auto" }}>
            {/* Presets */}
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "var(--accent)", marginBottom: 12, fontFamily: "var(--font-mono)" }}>
                Quick Presets
              </div>

              {/* Presets in 2-column grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
                {PRESETS.filter(p => p.id !== "open").map(preset => {
                  const isActive = activePreset === preset.id;
                  return (
                    <button key={preset.id} onClick={() => applyPreset(preset)}
                      style={{
                        padding: "10px 10px 8px", borderRadius: 8, cursor: "pointer", textAlign: "left",
                        background: isActive ? "rgba(122,158,109,0.12)" : "rgba(255,255,255,0.02)",
                        border: `1.5px solid ${isActive ? "rgba(122,158,109,0.45)" : "rgba(255,255,255,0.06)"}`,
                        transition: "all 0.2s ease",
                        display: "flex", flexDirection: "column", gap: 2,
                      }}
                      onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}}
                      onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}}
                    >
                      <span style={{ fontSize: 12, fontWeight: 700, color: isActive ? "var(--accent2)" : "rgba(255,255,255,0.6)", fontFamily: "var(--font-body)" }}>{preset.label}</span>
                      <span style={{ fontSize: 9.5, color: isActive ? "rgba(200,214,195,0.5)" : "rgba(255,255,255,0.22)", lineHeight: 1.3, fontFamily: "var(--font-body)" }}>{preset.description}</span>
                    </button>
                  );
                })}
              </div>

              {/* User presets */}
              {userPresets.length > 0 && (
                <>
                  <div style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5, color: "rgba(255,255,255,0.25)", marginBottom: 8, marginTop: 4, fontFamily: "var(--font-mono)" }}>
                    Your Presets
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
                    {userPresets.map(preset => {
                      const isActive = activePreset === preset.id;
                      return (
                        <div key={preset.id} style={{ position: "relative" }}>
                          <button onClick={() => applyPreset(preset)}
                            style={{
                              width: "100%", padding: "10px 36px 10px 12px", borderRadius: 8, cursor: "pointer", textAlign: "left",
                              background: isActive ? "rgba(52,152,219,0.12)" : "rgba(255,255,255,0.02)",
                              border: `1.5px solid ${isActive ? "rgba(52,152,219,0.45)" : "rgba(255,255,255,0.06)"}`,
                              transition: "all 0.2s ease",
                              display: "flex", flexDirection: "column", gap: 2,
                            }}
                            onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}}
                            onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}}
                          >
                            <span style={{ fontSize: 12, fontWeight: 700, color: isActive ? "#7cb3d9" : "rgba(255,255,255,0.6)", fontFamily: "var(--font-body)" }}>{preset.label}</span>
                            <span style={{ fontSize: 9.5, color: isActive ? "rgba(124,179,217,0.5)" : "rgba(255,255,255,0.22)", lineHeight: 1.3, fontFamily: "var(--font-body)" }}>{preset.description}</span>
                          </button>
                          {/* Delete button */}
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteUserPreset(preset.id); }}
                            style={{
                              position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                              borderRadius: 4, width: 22, height: 22, cursor: "pointer",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: "rgba(255,255,255,0.3)", fontSize: 12, lineHeight: 1,
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(231,76,60,0.2)"; e.currentTarget.style.borderColor = "rgba(231,76,60,0.4)"; e.currentTarget.style.color = "#e74c3c"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}
                            title="Delete preset"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Reset - full width at bottom */}
              <button onClick={resetAllFilters}
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: 8, cursor: "pointer", textAlign: "center",
                  background: activePreset === "open" ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${activePreset === "open" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)"}`,
                  transition: "all 0.2s ease",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = activePreset === "open" ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = activePreset === "open" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)"; }}
              >
                <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-body)" }}>Reset All Filters</span>
              </button>
            </div>

            {/* Price Range */}
            <div style={{ background: "linear-gradient(135deg, rgba(122,158,109,0.08) 0%, rgba(122,158,109,0.02) 100%)", border: "1px solid rgba(122,158,109,0.2)", borderRadius: 12, padding: "14px 16px", marginBottom: 12 }}>
              <RangeSliderControl label="Price Range" range={priceRange} setRange={setPriceRange} min={DATA_PRICE_MIN} max={DATA_PRICE_MAX} step={5} unit="K"
                description="Filter by vehicle price" />
            </div>

            {/* Requirements filters */}
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "var(--accent)", marginBottom: 16, fontFamily: "var(--font-mono)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>Requirements</span>
                {!filtersMatchPreset && (
                  <button
                    onClick={openSavePreset}
                    style={{
                      fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 5,
                      background: "rgba(122,158,109,0.1)", border: "1px solid rgba(122,158,109,0.3)",
                      color: "var(--accent)", cursor: "pointer", fontFamily: "var(--font-mono)",
                      textTransform: "none", letterSpacing: 0,
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(122,158,109,0.2)"; e.currentTarget.style.borderColor = "rgba(122,158,109,0.5)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(122,158,109,0.1)"; e.currentTarget.style.borderColor = "rgba(122,158,109,0.3)"; }}
                  >
                    Save Preset
                  </button>
                )}
              </div>

              {/* Save Preset Popover */}
              {showSavePreset && (
                <div style={{
                  background: "rgba(11,16,14,0.98)", border: "1px solid rgba(122,158,109,0.3)",
                  borderRadius: 10, padding: 16, marginBottom: 16,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent2)" }}>Save Current Filters</span>
                    <button onClick={() => setShowSavePreset(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 16, lineHeight: 1 }}>×</button>
                  </div>

                  {/* Mode toggle - only show if there are user presets */}
                  {userPresets.length > 0 && (
                    <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                      <button
                        onClick={() => {
                          setSavePresetMode("update");
                          if (userPresets.length > 0) {
                            setSavePresetTarget(userPresets[0].id);
                            setSavePresetTitle(userPresets[0].label);
                            setSavePresetDesc(userPresets[0].description);
                          }
                        }}
                        style={{
                          flex: 1, padding: "8px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer",
                          background: savePresetMode === "update" ? "rgba(122,158,109,0.2)" : "rgba(255,255,255,0.03)",
                          border: `1px solid ${savePresetMode === "update" ? "rgba(122,158,109,0.4)" : "rgba(255,255,255,0.08)"}`,
                          color: savePresetMode === "update" ? "var(--accent2)" : "rgba(255,255,255,0.4)",
                        }}
                      >
                        Update Existing
                      </button>
                      <button
                        onClick={() => {
                          setSavePresetMode("new");
                          setSavePresetTarget(null);
                          setSavePresetTitle("");
                          setSavePresetDesc("");
                        }}
                        style={{
                          flex: 1, padding: "8px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer",
                          background: savePresetMode === "new" ? "rgba(122,158,109,0.2)" : "rgba(255,255,255,0.03)",
                          border: `1px solid ${savePresetMode === "new" ? "rgba(122,158,109,0.4)" : "rgba(255,255,255,0.08)"}`,
                          color: savePresetMode === "new" ? "var(--accent2)" : "rgba(255,255,255,0.4)",
                        }}
                      >
                        Create New
                      </button>
                    </div>
                  )}

                  {/* Preset selector for update mode */}
                  {savePresetMode === "update" && userPresets.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 6, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: 1 }}>Select preset to update</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {userPresets.map(p => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setSavePresetTarget(p.id);
                              setSavePresetTitle(p.label);
                              setSavePresetDesc(p.description);
                            }}
                            style={{
                              padding: "8px 10px", borderRadius: 6, textAlign: "left", cursor: "pointer",
                              background: savePresetTarget === p.id ? "rgba(122,158,109,0.15)" : "rgba(255,255,255,0.02)",
                              border: `1px solid ${savePresetTarget === p.id ? "rgba(122,158,109,0.4)" : "rgba(255,255,255,0.06)"}`,
                            }}
                          >
                            <div style={{ fontSize: 12, fontWeight: 600, color: savePresetTarget === p.id ? "var(--accent2)" : "rgba(255,255,255,0.6)" }}>{p.label}</div>
                            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{p.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Title input */}
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 6, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: 1 }}>Title</div>
                    <input
                      type="text"
                      value={savePresetTitle}
                      onChange={e => setSavePresetTitle(e.target.value)}
                      placeholder="My Custom Preset"
                      style={{
                        width: "100%", padding: "8px 10px", borderRadius: 6, fontSize: 12,
                        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                        color: "#fff", outline: "none", fontFamily: "var(--font-body)",
                      }}
                    />
                  </div>

                  {/* Description input */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 6, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: 1 }}>Description</div>
                    <input
                      type="text"
                      value={savePresetDesc}
                      onChange={e => setSavePresetDesc(e.target.value)}
                      placeholder="Brief description of this configuration"
                      style={{
                        width: "100%", padding: "8px 10px", borderRadius: 6, fontSize: 12,
                        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                        color: "#fff", outline: "none", fontFamily: "var(--font-body)",
                      }}
                    />
                  </div>

                  {/* Save button */}
                  <button
                    onClick={handleSavePreset}
                    disabled={!savePresetTitle.trim()}
                    style={{
                      width: "100%", padding: "10px", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: savePresetTitle.trim() ? "pointer" : "not-allowed",
                      background: savePresetTitle.trim() ? "rgba(122,158,109,0.3)" : "rgba(255,255,255,0.05)",
                      border: `1px solid ${savePresetTitle.trim() ? "rgba(122,158,109,0.5)" : "rgba(255,255,255,0.1)"}`,
                      color: savePresetTitle.trim() ? "var(--accent2)" : "rgba(255,255,255,0.3)",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {savePresetMode === "update" ? "Update Preset" : "Create Preset"}
                  </button>
                </div>
              )}

              {FILTER_ATTRS.map(a => (
                <RangeSliderControl
                  key={a.id}
                  label={a.unit ? `${a.label} (${a.unit.trim()})` : a.label}
                  range={ranges[a.id]}
                  setRange={val => setRange(a.id, val)}
                  min={a.min}
                  max={a.max}
                  step={a.step}
                  unit=""
                  description={a.description}
                />
              ))}
            </div>

          </div>

          {/* Right panel - results */}
          <div>
            {/* Scatter plot */}
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: "rgba(255,255,255,0.3)", marginBottom: 12, fontFamily: "var(--font-mono)", display: "flex", justifyContent: "space-between" }}>
                <span>Price vs Score</span>
                <span><span style={{ color: "var(--accent)", fontWeight: 700, fontSize: 14 }}>{filtered.length}</span><span style={{ color: "rgba(255,255,255,0.35)" }}> / {V.length} vehicles</span></span>
              </div>
              <div style={{ position: "relative", height: 220, paddingLeft: chartPadding.left, paddingBottom: chartPadding.bottom, paddingRight: chartPadding.right, paddingTop: chartPadding.top }}>
                {/* Y axis labels (Score) - dynamic based on score range */}
                {(() => {
                  const range = scoreMax - scoreMin;
                  const step = range <= 30 ? 5 : range <= 50 ? 10 : 15;
                  const labels = [];
                  for (let s = Math.ceil(scoreMin / step) * step; s <= scoreMax; s += step) {
                    labels.push(s);
                  }
                  return labels;
                })().map(score => {
                  const yPercent = ((scoreMax - score) / (scoreMax - scoreMin)) * 100;
                  const chartAreaHeight = 220 - chartPadding.top - chartPadding.bottom;
                  const topPx = chartPadding.top + (yPercent / 100) * chartAreaHeight;
                  return (
                    <div key={score} style={{
                      position: "absolute",
                      left: 0,
                      top: topPx,
                      transform: "translateY(-50%)",
                      fontSize: 9,
                      color: "rgba(255,255,255,0.25)",
                      fontFamily: "var(--font-mono)",
                      width: chartPadding.left - 5,
                      textAlign: "right",
                    }}>
                      {score}
                    </div>
                  );
                })}
                {/* X axis labels (Price) - dynamic based on price range */}
                {(() => {
                  const range = chartPriceMax - chartPriceMin;
                  const step = range <= 60 ? 10 : range <= 100 ? 20 : 40;
                  const labels = [];
                  for (let p = Math.ceil(chartPriceMin / step) * step; p <= chartPriceMax; p += step) {
                    labels.push(p);
                  }
                  return labels.map(price => {
                    const xFraction = (price - chartPriceMin) / (chartPriceMax - chartPriceMin);
                    return (
                      <div key={price} style={{
                        position: "absolute",
                        left: `calc(${chartPadding.left}px + ${xFraction} * (100% - ${chartPadding.left + chartPadding.right}px))`,
                        bottom: 0,
                        transform: "translateX(-50%)",
                        fontSize: 9,
                        color: "rgba(255,255,255,0.25)",
                        fontFamily: "var(--font-mono)",
                      }}>
                        ${price}K
                      </div>
                    );
                  });
                })()}
                {/* Chart area */}
                <div style={{ position: "absolute", left: chartPadding.left, right: chartPadding.right, top: chartPadding.top, bottom: chartPadding.bottom, background: "rgba(0,0,0,0.15)", borderRadius: 4, border: "1px solid rgba(255,255,255,0.04)" }}>
                  {/* Grid lines */}
                  <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                    {[20, 40, 60, 80].map(pct => (
                      <line key={`h${pct}`} x1="0%" y1={`${pct}%`} x2="100%" y2={`${pct}%`} stroke="rgba(255,255,255,0.04)" strokeDasharray="2,4" />
                    ))}
                    {[20, 40, 60, 80].map(pct => (
                      <line key={`v${pct}`} x1={`${pct}%`} y1="0%" x2={`${pct}%`} y2="100%" stroke="rgba(255,255,255,0.04)" strokeDasharray="2,4" />
                    ))}
                  </svg>
                  {/* Min price line */}
                  {minPriceLineX !== null && minPriceLineX >= 0 && (
                    <>
                      <div style={{
                        position: "absolute",
                        left: `${minPriceLineX}%`,
                        top: 0,
                        bottom: 0,
                        width: 2,
                        background: "rgba(122,158,109,0.6)",
                        zIndex: 5,
                      }} />
                      <div style={{
                        position: "absolute",
                        left: `${minPriceLineX}%`,
                        bottom: 4,
                        transform: "translateX(-50%)",
                        fontSize: 9,
                        fontWeight: 600,
                        color: "var(--accent)",
                        fontFamily: "var(--font-mono)",
                        background: "rgba(11,16,14,0.9)",
                        padding: "2px 6px",
                        borderRadius: 3,
                        zIndex: 6,
                        whiteSpace: "nowrap",
                      }}>
                        ${priceRange[0]}K min
                      </div>
                    </>
                  )}
                  {/* Max price line */}
                  {maxPriceLineX !== null && maxPriceLineX <= 100 && (
                    <>
                      <div style={{
                        position: "absolute",
                        left: `${maxPriceLineX}%`,
                        top: 0,
                        bottom: 0,
                        width: 2,
                        background: "rgba(122,158,109,0.6)",
                        zIndex: 5,
                      }} />
                      <div style={{
                        position: "absolute",
                        left: `${maxPriceLineX}%`,
                        top: 4,
                        transform: "translateX(-50%)",
                        fontSize: 9,
                        fontWeight: 600,
                        color: "var(--accent)",
                        fontFamily: "var(--font-mono)",
                        background: "rgba(11,16,14,0.9)",
                        padding: "2px 6px",
                        borderRadius: 3,
                        zIndex: 6,
                        whiteSpace: "nowrap",
                      }}>
                        ${priceRange[1]}K max
                      </div>
                    </>
                  )}
                  {/* Plot all vehicles */}
                  {scored.map(v => {
                    const x = ((v.price - chartPriceMin) / (chartPriceMax - chartPriceMin)) * 100;
                    const y = ((scoreMax - v.score) / (scoreMax - scoreMin)) * 100;
                    const isFiltered = !v.pass;
                    const isHovered = hoveredVehicle === v.id;
                    const ptColor = ptColors[v.pt] || "#888";
                    const isHistorical = v.yearEnd !== null;
                    const size = isHovered ? 14 : 12;
                    return (
                      <div
                        key={v.id}
                        onMouseEnter={() => setHoveredVehicle(v.id)}
                        onMouseLeave={() => setHoveredVehicle(null)}
                        onClick={() => setExpanded(expanded === v.id ? null : v.id)}
                        style={{
                          position: "absolute",
                          left: `calc(${Math.max(2, Math.min(98, x))}% - ${size / 2}px)`,
                          top: `calc(${Math.max(2, Math.min(98, y))}% - ${size / 2}px)`,
                          width: size,
                          height: size,
                          opacity: isFiltered ? 0.15 : (isHovered ? 1 : 0.8),
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          zIndex: isHovered ? 100 : (isFiltered ? 10 : 1),
                          transform: isHovered ? "scale(1.3)" : "scale(1)",
                        }}
                        title={`${getDisplayName(v)}\nScore: ${v.score} · $${v.price}K`}
                      >
                        {isHistorical ? (
                          <svg width={size} height={size} viewBox="0 0 12 12" style={{ display: "block" }}>
                            <polygon
                              points="6,0 12,12 0,12"
                              fill={ptColor}
                              stroke={isHovered ? "#fff" : ptColor}
                              strokeWidth="2"
                            />
                          </svg>
                        ) : (
                          <div style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "50%",
                            background: ptColor,
                            border: `2px solid ${isHovered ? "#fff" : ptColor}`,
                          }} />
                        )}
                      </div>
                    );
                  })}
                  {/* Hover tooltip */}
                  {hoveredVehicle && (() => {
                    const v = scored.find(x => x.id === hoveredVehicle);
                    if (!v) return null;
                    const x = ((v.price - chartPriceMin) / (chartPriceMax - chartPriceMin)) * 100;
                    const y = ((scoreMax - v.score) / (scoreMax - scoreMin)) * 100;
                    return (
                      <div style={{
                        position: "absolute",
                        left: `${x}%`,
                        top: `${y}%`,
                        transform: x > 50 ? "translate(-100%, -120%)" : "translate(10%, -120%)",
                        background: "rgba(0,0,0,0.95)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: 6,
                        padding: "6px 10px",
                        fontSize: 11,
                        color: "#fff",
                        whiteSpace: "nowrap",
                        zIndex: 200,
                        pointerEvents: "none",
                      }}>
                        <div style={{ fontWeight: 700, marginBottom: 2 }}>{getDisplayName(v)}</div>
                        {v.generation && (
                          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, marginBottom: 2 }}>
                            {v.generation} · {v.yearStart}{v.yearEnd ? `–${v.yearEnd}` : '–'}
                          </div>
                        )}
                        <div style={{ color: "rgba(255,255,255,0.6)" }}>Score: <span style={{ color: "var(--accent)" }}>{v.score}</span> · ${v.price}K</div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Filter bar - Makes and Powertrain */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
              {/* Search */}
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                {searchExpanded ? (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(122,158,109,0.4)",
                    borderRadius: 5,
                    padding: "0 8px",
                    gap: 6,
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Escape") {
                          setSearchQuery("");
                          setSearchExpanded(false);
                        }
                      }}
                      onBlur={() => {
                        if (!searchQuery) setSearchExpanded(false);
                      }}
                      placeholder="Search vehicles..."
                      style={{
                        width: 140,
                        padding: "5px 0",
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        color: "#fff",
                        fontSize: 11,
                        fontFamily: "var(--font-body)",
                      }}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          searchInputRef.current?.focus();
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "rgba(255,255,255,0.4)",
                          cursor: "pointer",
                          padding: 0,
                          fontSize: 14,
                          lineHeight: 1,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setSearchExpanded(true)}
                    style={{
                      padding: "4px 8px",
                      borderRadius: 5,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      color: "rgba(255,255,255,0.5)",
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                    }}
                    title="Search vehicles"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Make multi-select dropdown */}
              <div style={{ position: "relative" }} ref={makeDropdownRef}>
                <button
                  onClick={() => setShowMakeDropdown(!showMakeDropdown)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 5,
                    fontSize: 11,
                    background: makeFilter.length > 0 ? "rgba(122,158,109,0.15)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${makeFilter.length > 0 ? "rgba(122,158,109,0.4)" : "rgba(255,255,255,0.1)"}`,
                    color: makeFilter.length > 0 ? "var(--accent2)" : "#c8d6c3",
                    fontFamily: "var(--font-mono)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {makeFilter.length === 0 ? "All Makes" : makeFilter.length === 1 ? makeFilter[0] : `${makeFilter.length} Makes`}
                  <span style={{ fontSize: 8, opacity: 0.6 }}>▼</span>
                </button>
                {showMakeDropdown && (
                  <div style={{
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    left: 0,
                    zIndex: 1000,
                    background: "rgba(11,16,14,0.98)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 8,
                    padding: 8,
                    minWidth: 180,
                    maxHeight: 300,
                    overflowY: "auto",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                  }}>
                    <button
                      onClick={() => { setMakeFilter([]); clearPreset(); }}
                      style={{
                        width: "100%",
                        padding: "6px 10px",
                        borderRadius: 4,
                        fontSize: 11,
                        textAlign: "left",
                        background: makeFilter.length === 0 ? "rgba(122,158,109,0.2)" : "transparent",
                        border: "none",
                        color: makeFilter.length === 0 ? "var(--accent2)" : "rgba(255,255,255,0.6)",
                        cursor: "pointer",
                        fontFamily: "var(--font-mono)",
                        fontWeight: makeFilter.length === 0 ? 600 : 400,
                        marginBottom: 4,
                      }}
                    >
                      {makeFilter.length === 0 && <span style={{ marginRight: 6 }}>✓</span>}
                      All Makes
                    </button>
                    <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "4px 0" }} />
                    {MAKES.map(make => {
                      const isSelected = makeFilter.includes(make);
                      return (
                        <button
                          key={make}
                          onClick={() => {
                            setMakeFilter(prev =>
                              prev.includes(make)
                                ? prev.filter(m => m !== make)
                                : [...prev, make]
                            );
                            clearPreset();
                          }}
                          style={{
                            width: "100%",
                            padding: "6px 10px",
                            borderRadius: 4,
                            fontSize: 11,
                            textAlign: "left",
                            background: isSelected ? "rgba(122,158,109,0.15)" : "transparent",
                            border: "none",
                            color: isSelected ? "var(--accent2)" : "rgba(255,255,255,0.6)",
                            cursor: "pointer",
                            fontFamily: "var(--font-body)",
                            display: "flex",
                            alignItems: "center",
                          }}
                          onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                          onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                        >
                          <span style={{ width: 18, flexShrink: 0 }}>{isSelected ? "✓" : ""}</span>
                          {make}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Powertrain filter */}
              <div style={{ display: "flex", gap: 4 }}>
                {PT_IDS.map(pt => {
                  const isActive = ptFilter.includes(pt);
                  const color = ptColors[pt];
                  return (
                    <button
                      key={pt}
                      onClick={() => togglePt(pt)}
                      style={{
                        padding: "4px 10px",
                        borderRadius: 5,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                        background: isActive ? `${color}25` : "rgba(255,255,255,0.03)",
                        border: `1px solid ${isActive ? `${color}60` : "rgba(255,255,255,0.08)"}`,
                        color: isActive ? color : "rgba(255,255,255,0.3)",
                        fontFamily: "var(--font-mono)",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {ptLabels[pt]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sort bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
              {/* Score with weights popover */}
              <div style={{ position: "relative" }}>
                <button onClick={() => {
                  if (sortBy === "score") {
                    setSortAsc(!sortAsc);
                  } else {
                    setSortBy("score");
                    setSortAsc(false);
                  }
                }}
                  style={{
                    padding: "4px 12px", borderRadius: 5, fontSize: 11, cursor: "pointer",
                    background: sortBy === "score" ? "rgba(122,158,109,0.2)" : "transparent",
                    border: `1px solid ${sortBy === "score" ? "rgba(122,158,109,0.4)" : "rgba(255,255,255,0.06)"}`,
                    color: sortBy === "score" ? "var(--accent2)" : "rgba(255,255,255,0.35)",
                    fontFamily: "var(--font-mono)", fontWeight: 500,
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                  Score{sortBy === "score" ? (sortAsc ? " ↑" : " ↓") : ""}
                  <span onClick={(e) => { e.stopPropagation(); setShowWeightsPopover(!showWeightsPopover); }}
                    style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 16, height: 16, borderRadius: 3, background: showWeightsPopover ? "rgba(122,158,109,0.3)" : "rgba(255,255,255,0.1)", fontSize: 10, marginLeft: 2 }}>
                    ⚙
                  </span>
                </button>
                {showWeightsPopover && (
                  <div ref={weightsPopoverRef} style={{
                    position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 1000,
                    background: "rgba(11,16,14,0.98)", border: "1px solid rgba(122,158,109,0.3)",
                    borderRadius: 10, padding: 16, minWidth: 280,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "var(--accent)", fontFamily: "var(--font-mono)" }}>Score Weights</span>
                      <button onClick={() => setShowWeightsPopover(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 14 }}>×</button>
                    </div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 12, lineHeight: 1.4 }}>
                      Adjust how much each attribute affects the Score.
                    </div>
                    {PRIORITY_ATTRS.map(a => {
                      const pKey = a.priorityKey || a.id;
                      return <PriorityControl key={pKey} label={a.priorityLabel} value={priorities[pKey]} pKey={pKey} />;
                    })}
                  </div>
                )}
              </div>
              {[
                { key: "price", label: "Price" },
                ...SORTABLE_ATTRS.map(a => ({ key: a.id, label: a.shortLabel })),
              ].map(s => {
                const isActive = sortBy === s.key;
                return (
                  <button key={s.key} onClick={() => {
                    if (sortBy === s.key) {
                      setSortAsc(!sortAsc);
                    } else {
                      setSortBy(s.key);
                      setSortAsc(s.key === "price");
                    }
                    setShowWeightsPopover(false);
                  }}
                    style={{
                      padding: "4px 12px", borderRadius: 5, fontSize: 11, cursor: "pointer",
                      background: isActive ? "rgba(122,158,109,0.2)" : "transparent",
                      border: `1px solid ${isActive ? "rgba(122,158,109,0.4)" : "rgba(255,255,255,0.06)"}`,
                      color: isActive ? "var(--accent2)" : "rgba(255,255,255,0.35)",
                      fontFamily: "var(--font-mono)", fontWeight: 500,
                    }}>
                    {s.label}{isActive ? (sortAsc ? " ↑" : " ↓") : ""}
                  </button>
                );
              })}
            </div>

            {/* Results */}
            {filtered.length === 0 ? (
              <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 40, textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--accent2)", marginBottom: 6 }}>No vehicles match</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Try loosening your filters — your requirements may be too restrictive.</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {filtered.map((v, idx) => {
                  const isExpanded = expanded === v.id;
                  const ptColor = ptColors[v.pt] || "#888";
                  const isTop = idx === 0 && sortBy === "score";
                  const isHovered = hoveredVehicle === v.id;
                  return (
                    <div key={v.id}
                      onClick={() => setExpanded(isExpanded ? null : v.id)}
                      onMouseEnter={() => setHoveredVehicle(v.id)}
                      onMouseLeave={() => setHoveredVehicle(null)}
                      style={{
                        background: isHovered ? "rgba(122,158,109,0.1)" : (isTop ? "rgba(122,158,109,0.05)" : "var(--card)"),
                        border: `1px solid ${isHovered ? "rgba(122,158,109,0.4)" : (isTop ? "rgba(122,158,109,0.2)" : "var(--border)")}`,
                        borderRadius: 10, padding: "14px 16px", cursor: "pointer",
                        transition: "all 0.15s ease",
                        transform: isHovered ? "translateX(4px)" : "none",
                      }}>
                      {/* Main row */}
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                        {/* Rank */}
                        <div style={{ width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", background: isTop ? "rgba(122,158,109,0.2)" : "rgba(255,255,255,0.04)", fontSize: 12, fontWeight: 700, fontFamily: "var(--font-mono)", color: isTop ? "var(--accent)" : "rgba(255,255,255,0.3)", flexShrink: 0 }}>
                          {idx + 1}
                        </div>
                        {/* Name + tags */}
                        <div style={{ flex: 1, minWidth: 180 }}>
                          <div style={{ fontSize: 14, color: "#fff", marginBottom: 3, lineHeight: 1.2, display: "flex", alignItems: "center", gap: 8 }}>
                            <span>
                              <span style={{ fontWeight: 700 }}>{getDisplayName(v)}</span>
                              {v.yearStart && (
                                <span style={{ fontWeight: 400, color: "rgba(255,255,255,0.5)" }}> ({v.yearStart}{v.yearEnd ? `–${v.yearEnd}` : '–'})</span>
                              )}
                            </span>
                            {v.url && (
                              <a
                                href={v.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                title="View on Wikipedia"
                                style={{
                                  display: "inline-block", verticalAlign: "top",
                                  marginLeft: 6,
                                  opacity: 0.35, textDecoration: "none",
                                  transition: "opacity 0.15s ease", flexShrink: 0,
                                  fontSize: 9, fontFamily: "var(--font-mono)",
                                  color: "rgba(255,255,255,0.6)",
                                }}
                                onMouseEnter={e => { e.currentTarget.style.opacity = "0.7"; }}
                                onMouseLeave={e => { e.currentTarget.style.opacity = "0.35"; }}
                              >
                                ↗ wiki
                              </a>
                            )}
                          </div>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                            <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 3, background: ptColor + "20", color: ptColor, border: `1px solid ${ptColor}44`, fontFamily: "var(--font-mono)", fontWeight: 600 }}>{ptLabels[v.pt]}</span>
                            <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 3, background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.06)", fontFamily: "var(--font-mono)" }}>{sizeLabels[v.size]}</span>
                            {v.generation && (
                              <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 3, background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.05)", fontFamily: "var(--font-mono)" }}>
                                {v.generation}
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Key stats */}
                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                          {[
                            { key: "score", label: "Score", val: v.score },
                            { key: "price", label: "Price", val: `$${v.price}K` },
                            ...SUMMARY_ATTRS.map(a => ({ key: a.id, label: a.shortLabel, val: v[a.id] })),
                          ].map((s, i) => {
                            const isSortedCol = sortBy === s.key;
                            const defaultColor = s.key === "score"
                              ? (v.score >= 70 ? "var(--accent)" : v.score >= 50 ? "#c8d6c3" : "rgba(255,255,255,0.4)")
                              : "rgba(255,255,255,0.7)";
                            return (
                              <div key={i} style={{ textAlign: "center", minWidth: 36 }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: isSortedCol ? "var(--accent)" : defaultColor, fontFamily: "var(--font-mono)" }}>{s.val}</div>
                                <div style={{ fontSize: 9, color: isSortedCol ? "rgba(122,158,109,0.6)" : "rgba(255,255,255,0.25)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>{s.label}</div>
                              </div>
                            );
                          })}
                        </div>
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0)", flexShrink: 0 }}>▼</span>
                      </div>
                      {/* Expanded detail */}
                      {isExpanded && (
                        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}
                          onClick={e => e.stopPropagation()}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                            {DETAIL_ATTRS.map(a => ({
                              label: a.label,
                              val: a.formatVal ? a.formatVal(v[a.id]) : v[a.id],
                              raw: v[a.id],
                              max: a.max,
                              unit: a.unit || "",
                            })).map((s, i) => (
                              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ width: 85, fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-mono)", flexShrink: 0 }}>{s.label}</span>
                                <Bar val={s.raw || (typeof s.val === "number" ? s.val : 0)} max={s.max} width={80} />
                                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{s.val}{s.unit || ""}</span>
                              </div>
                            ))}
                          </div>
                          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, background: "rgba(255,255,255,0.02)", padding: "10px 12px", borderRadius: 6 }}>
                            {v.note}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Eliminated */}
            {eliminated.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: "rgba(255,255,255,0.2)", marginBottom: 10, fontFamily: "var(--font-mono)" }}>
                  Filtered out ({eliminated.length})
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {eliminated.map(v => {
                    const isHovered = hoveredVehicle === v.id;
                    const isExpanded = expanded === v.id;
                    const reasons = getFilterReasons(v);
                    const ptColor = ptColors[v.pt] || "#888";
                    return (
                      <div key={v.id} style={{ width: isExpanded ? "100%" : "auto" }}>
                        <div
                          onClick={() => setExpanded(isExpanded ? null : v.id)}
                          onMouseEnter={() => setHoveredVehicle(v.id)}
                          onMouseLeave={() => setHoveredVehicle(null)}
                          style={{
                            fontSize: 11, padding: "6px 10px", borderRadius: isExpanded ? "6px 6px 0 0" : 6,
                            background: isExpanded ? "rgba(255,255,255,0.04)" : (isHovered ? "rgba(122,158,109,0.1)" : "rgba(255,255,255,0.02)"),
                            border: `1px solid ${isExpanded ? "rgba(255,255,255,0.08)" : (isHovered ? "rgba(122,158,109,0.3)" : "rgba(255,255,255,0.04)")}`,
                            borderBottom: isExpanded ? "none" : undefined,
                            color: isHovered || isExpanded ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.25)",
                            fontFamily: "var(--font-body)", cursor: "pointer", transition: "all 0.15s",
                            display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
                          }}>
                          <span>
                            <span style={{ fontWeight: 600, color: "rgba(255,255,255,0.75)" }}>{getDisplayName(v)}</span>
                            {v.yearStart && (
                              <span style={{ fontWeight: 400, color: "rgba(255,255,255,0.25)" }}> ({v.yearStart}{v.yearEnd ? `–${v.yearEnd}` : '–'})</span>
                            )}
                          </span>
                          <span style={{ fontSize: 10, fontWeight: 600, color: v.score >= 60 ? "rgba(122,158,109,0.6)" : "rgba(255,255,255,0.25)", fontFamily: "var(--font-mono)" }}>{v.score}</span>
                          {/* Filter reasons */}
                          <span style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {reasons.map((r, i) => (
                              <span key={i} style={{
                                fontSize: 9, padding: "1px 5px", borderRadius: 3,
                                background: "rgba(180,100,90,0.08)", color: "rgba(180,100,90,0.5)",
                                border: "1px solid rgba(180,100,90,0.12)", fontFamily: "var(--font-mono)",
                              }}>
                                {r.label}
                              </span>
                            ))}
                          </span>
                          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.15)", marginLeft: "auto", transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
                        </div>
                        {/* Expanded detail for filtered vehicle */}
                        {isExpanded && (
                          <div style={{
                            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)",
                            borderTop: "none", borderRadius: "0 0 6px 6px", padding: "12px 14px",
                          }} onClick={e => e.stopPropagation()}>
                            {/* Main info row */}
                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
                              {/* Name + tags */}
                              <div style={{ flex: 1, minWidth: 180 }}>
                                <div style={{ fontSize: 14, color: "#fff", marginBottom: 3, lineHeight: 1.2, display: "flex", alignItems: "center", gap: 8 }}>
                                  <span>
                                    <span style={{ fontWeight: 700 }}>{getDisplayName(v)}</span>
                                    {v.yearStart && (
                                      <span style={{ fontWeight: 400, color: "rgba(255,255,255,0.5)" }}> ({v.yearStart}{v.yearEnd ? `–${v.yearEnd}` : '–'})</span>
                                    )}
                                  </span>
                                  {v.url && (
                                    <a
                                      href={v.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={e => e.stopPropagation()}
                                      title="View on Wikipedia"
                                      style={{
                                        display: "inline-block", verticalAlign: "top",
                                        marginLeft: 6,
                                        opacity: 0.35, textDecoration: "none",
                                        transition: "opacity 0.15s ease", flexShrink: 0,
                                        fontSize: 9, fontFamily: "var(--font-mono)",
                                        color: "rgba(255,255,255,0.6)",
                                      }}
                                      onMouseEnter={e => { e.currentTarget.style.opacity = "0.7"; }}
                                      onMouseLeave={e => { e.currentTarget.style.opacity = "0.35"; }}
                                    >
                                      ↗ wiki
                                    </a>
                                  )}
                                </div>
                                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                                  <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 3, background: ptColor + "20", color: ptColor, border: `1px solid ${ptColor}44`, fontFamily: "var(--font-mono)", fontWeight: 600 }}>{ptLabels[v.pt]}</span>
                                  <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 3, background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.06)", fontFamily: "var(--font-mono)" }}>{sizeLabels[v.size]}</span>
                                  {v.generation && (
                                    <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 3, background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.05)", fontFamily: "var(--font-mono)" }}>
                                      {v.generation}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {/* Key stats */}
                              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                                {[
                                  { key: "score", label: "Score", val: v.score },
                                  { key: "price", label: "Price", val: `$${v.price}K` },
                                  ...SUMMARY_ATTRS.map(a => ({ key: a.id, label: a.shortLabel, val: v[a.id] })),
                                ].map((s, i) => {
                                  const defaultColor = s.key === "score"
                                    ? (v.score >= 70 ? "var(--accent)" : v.score >= 50 ? "#c8d6c3" : "rgba(255,255,255,0.4)")
                                    : "rgba(255,255,255,0.7)";
                                  return (
                                    <div key={i} style={{ textAlign: "center", minWidth: 36 }}>
                                      <div style={{ fontSize: 14, fontWeight: 700, color: defaultColor, fontFamily: "var(--font-mono)" }}>{s.val}</div>
                                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>{s.label}</div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            {/* Attribute bars */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                              {DETAIL_ATTRS.map(a => ({
                                label: a.label,
                                val: a.formatVal ? a.formatVal(v[a.id]) : v[a.id],
                                raw: v[a.id],
                                max: a.max,
                                unit: a.unit || "",
                              })).map((s, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <span style={{ width: 85, fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-mono)", flexShrink: 0 }}>{s.label}</span>
                                  <Bar val={s.raw || (typeof s.val === "number" ? s.val : 0)} max={s.max} width={80} />
                                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{s.val}{s.unit || ""}</span>
                                </div>
                              ))}
                            </div>
                            {/* Note */}
                            {v.note && (
                              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, background: "rgba(255,255,255,0.02)", padding: "10px 12px", borderRadius: 6, marginBottom: 12 }}>
                                {v.note}
                              </div>
                            )}
                            {/* Filter reasons detail + Include button */}
                            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                              <div style={{ flex: 1, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: 1 }}>Excluded by:</span>
                                {reasons.map((r, i) => (
                                  <span key={i} title={r.detail} style={{
                                    fontSize: 10, padding: "2px 8px", borderRadius: 4,
                                    background: "rgba(231,76,60,0.1)", color: "rgba(231,76,60,0.8)",
                                    border: "1px solid rgba(231,76,60,0.2)", fontFamily: "var(--font-mono)",
                                    cursor: "help",
                                  }}>
                                    {r.label}: {r.detail}
                                  </span>
                                ))}
                              </div>
                              <button
                                onClick={() => includeVehicle(v)}
                                style={{
                                  padding: "6px 14px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer",
                                  background: "rgba(122,158,109,0.15)", border: "1px solid rgba(122,158,109,0.35)",
                                  color: "#7a9e6d", fontFamily: "var(--font-mono)", textTransform: "uppercase",
                                  letterSpacing: 0.5, transition: "all 0.15s ease",
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = "rgba(122,158,109,0.25)"; e.currentTarget.style.borderColor = "rgba(122,158,109,0.5)"; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "rgba(122,158,109,0.15)"; e.currentTarget.style.borderColor = "rgba(122,158,109,0.35)"; }}
                              >
                                Include
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
