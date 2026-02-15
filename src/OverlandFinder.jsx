import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import vehiclesData from "./vehicles.json";
import edmundsLogo from "./edmunds-logo.svg";

const V = vehiclesData;

// Load user presets from localStorage
const loadUserPresets = () => {
  try {
    const saved = localStorage.getItem("overland-finder-presets");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

// Save user presets to localStorage
const saveUserPresets = (presets) => {
  localStorage.setItem("overland-finder-presets", JSON.stringify(presets));
};

// Extract unique manufacturers
const MAKES = [...new Set(V.map(v => v.make))].sort();

const ptLabels = { hybrid: "Hybrid", ice: "ICE", phev: "PHEV", ev: "EV" };
const ptColors = { hybrid: "#2ecc71", ice: "#e67e22", phev: "#3498db", ev: "#9b59b6" };
const sizeLabels = { mid: "Midsize", full: "Full-size" };

// Default priorities - balanced starting point, user adjusts for their use case
const DEFAULT_PRIORITIES = { offroad: 3, luxury: 3, reliability: 3, performance: 2, mpg: 2, value: 2, cargo: 2, towing: 1 };

// Compute min price from data
const DATA_PRICE_MIN = Math.min(...V.map(v => v.price));
const DATA_PRICE_MAX = Math.max(...V.map(v => v.price));

// Range filters: [min, max] for each attribute
const PRESETS = [
  {
    id: "your_brief", label: "Your Brief",
    description: "Family of 4 + dog · real off-road · luxury · 20+ mpg · reliable · ≤$100K",
    price: [DATA_PRICE_MIN, 100], mpg: [20, 50], offroad: [7, 10], luxury: [6.5, 10], reliability: [6, 10], cargo: [34, 70],
    performance: [3, 10], towing: [0, 15000], size: ["mid", "full"], sortBy: "score",
  },
  {
    id: "trail_hardcore", label: "Trail First",
    description: "Maximum off-road · lockers & clearance · comfort secondary",
    price: [DATA_PRICE_MIN, 125], mpg: [14, 50], offroad: [8, 10], luxury: [3, 10], reliability: [3, 10], cargo: [30, 70],
    performance: [3, 10], towing: [0, 15000], size: ["mid", "full"], sortBy: "offroad",
  },
  {
    id: "highway_lux", label: "Highway Luxury",
    description: "Comfort & refinement first · moderate trails only · premium interior",
    price: [DATA_PRICE_MIN, 125], mpg: [20, 50], offroad: [3, 7], luxury: [8, 10], reliability: [3, 10], cargo: [30, 70],
    performance: [3, 10], towing: [0, 15000], size: ["mid", "full"], sortBy: "luxury",
  },
  {
    id: "efficiency", label: "Eco Overlander",
    description: "Best MPG · EV/PHEV/hybrid · still trail-capable",
    price: [DATA_PRICE_MIN, 125], mpg: [21, 50], offroad: [5, 10], luxury: [3, 10], reliability: [3, 10], cargo: [30, 70],
    performance: [3, 10], towing: [0, 15000], size: ["mid", "full"], sortBy: "mpg",
  },
  {
    id: "budget_overlander", label: "Budget Build",
    description: "Under $30K · proven platforms · DIY-friendly · best value",
    price: [DATA_PRICE_MIN, 30], mpg: [12, 50], offroad: [6, 10], luxury: [3, 10], reliability: [6, 10], cargo: [19, 70],
    performance: [3, 10], towing: [0, 15000], size: ["mid", "full"], sortBy: "score",
  },
  {
    id: "open", label: "Wide Open",
    description: "No filters · show everything · I want to explore",
    price: [DATA_PRICE_MIN, DATA_PRICE_MAX], mpg: [12, 50], offroad: [3, 10], luxury: [3, 10], reliability: [3, 10], cargo: [13, 70],
    performance: [3, 10], towing: [0, 15000], size: ["mid", "full"], sortBy: "score",
  },
];

const DEFAULT_PRESET = PRESETS[0];

export default function OverlandFinder() {
  const [priceRange, setPriceRange] = useState(DEFAULT_PRESET.price);
  const [mpgRange, setMpgRange] = useState(DEFAULT_PRESET.mpg);
  const [offroadRange, setOffroadRange] = useState(DEFAULT_PRESET.offroad);
  const [luxuryRange, setLuxuryRange] = useState(DEFAULT_PRESET.luxury);
  const [reliabilityRange, setReliabilityRange] = useState(DEFAULT_PRESET.reliability);
  const [performanceRange, setPerformanceRange] = useState(DEFAULT_PRESET.performance);
  const [cargoRange, setCargoRange] = useState(DEFAULT_PRESET.cargo);
  const [towingRange, setTowingRange] = useState(DEFAULT_PRESET.towing);
  const [ptFilter, setPtFilter] = useState(["hybrid", "ice", "phev", "ev"]);
  const [sizeFilter, setSizeFilter] = useState(DEFAULT_PRESET.size);
  const [makeFilter, setMakeFilter] = useState([]);
  const [showMakeDropdown, setShowMakeDropdown] = useState(false);
  const makeDropdownRef = useRef(null);
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

  // Persist user presets to localStorage
  useEffect(() => {
    saveUserPresets(userPresets);
  }, [userPresets]);

  // All presets combined (built-in + user)
  const allPresets = useMemo(() => [...PRESETS, ...userPresets], [userPresets]);

  const applyPreset = useCallback((preset) => {
    setPriceRange([...preset.price]);
    setMpgRange([...preset.mpg]);
    setOffroadRange([...preset.offroad]);
    setLuxuryRange([...preset.luxury]);
    setReliabilityRange([...preset.reliability]);
    setPerformanceRange([...preset.performance]);
    setCargoRange([...preset.cargo]);
    setTowingRange([...preset.towing]);
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
      setMpgRange([...openPreset.mpg]);
      setOffroadRange([...openPreset.offroad]);
      setLuxuryRange([...openPreset.luxury]);
      setReliabilityRange([...openPreset.reliability]);
      setPerformanceRange([...openPreset.performance]);
      setCargoRange([...openPreset.cargo]);
      setTowingRange([...openPreset.towing]);
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
  const getCurrentFiltersAsPreset = useCallback(() => ({
    price: [...priceRange],
    mpg: [...mpgRange],
    offroad: [...offroadRange],
    luxury: [...luxuryRange],
    reliability: [...reliabilityRange],
    performance: [...performanceRange],
    cargo: [...cargoRange],
    towing: [...towingRange],
    size: [...sizeFilter],
    sortBy,
  }), [priceRange, mpgRange, offroadRange, luxuryRange, reliabilityRange, performanceRange, cargoRange, towingRange, sizeFilter, sortBy]);

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
    const currentFilters = {
      price: priceRange,
      mpg: mpgRange,
      offroad: offroadRange,
      luxury: luxuryRange,
      reliability: reliabilityRange,
      performance: performanceRange,
      cargo: cargoRange,
      towing: towingRange,
      size: sizeFilter,
    };

    const arraysEqual = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

    return allPresets.some(p =>
      arraysEqual(p.price, currentFilters.price) &&
      arraysEqual(p.mpg, currentFilters.mpg) &&
      arraysEqual(p.offroad, currentFilters.offroad) &&
      arraysEqual(p.luxury, currentFilters.luxury) &&
      arraysEqual(p.reliability, currentFilters.reliability) &&
      arraysEqual(p.performance, currentFilters.performance) &&
      arraysEqual(p.cargo, currentFilters.cargo) &&
      arraysEqual(p.towing, currentFilters.towing) &&
      arraysEqual([...p.size].sort(), [...currentFilters.size].sort())
    );
  }, [priceRange, mpgRange, offroadRange, luxuryRange, reliabilityRange, performanceRange, cargoRange, towingRange, sizeFilter, allPresets]);

  // Data ranges for proper normalization - ALL attributes normalized to actual data range
  const dataRanges = useMemo(() => {
    return {
      priceMin: Math.min(...V.map(v => v.price)),
      priceMax: Math.max(...V.map(v => v.price)),
      mpgMin: Math.min(...V.map(v => v.mpg)),
      mpgMax: Math.max(...V.map(v => v.mpg)),
      cargoMin: Math.min(...V.map(v => v.cargo)),
      cargoMax: Math.max(...V.map(v => v.cargo)),
      offroadMin: Math.min(...V.map(v => v.offroad)),
      offroadMax: Math.max(...V.map(v => v.offroad)),
      luxuryMin: Math.min(...V.map(v => v.luxury)),
      luxuryMax: Math.max(...V.map(v => v.luxury)),
      reliabilityMin: Math.min(...V.map(v => v.reliability)),
      reliabilityMax: Math.max(...V.map(v => v.reliability)),
      performanceMin: Math.min(...V.map(v => v.performance)),
      performanceMax: Math.max(...V.map(v => v.performance)),
      towMin: Math.min(...V.map(v => v.tow)),
      towMax: Math.max(...V.map(v => v.tow)),
    };
  }, []);

  const scored = useMemo(() => {
    const totalWeight = Object.values(priorities).reduce((a, b) => a + b, 0) || 1;
    const {
      priceMin, priceMax, mpgMin, mpgMax, cargoMin, cargoMax,
      offroadMin, offroadMax, luxuryMin, luxuryMax, reliabilityMin, reliabilityMax,
      performanceMin, performanceMax, towMin, towMax
    } = dataRanges;

    return V.map(v => {
      const passesFilters = v.price >= priceRange[0] && v.price <= priceRange[1] &&
        v.mpg >= mpgRange[0] && v.mpg <= mpgRange[1] &&
        v.offroad >= offroadRange[0] && v.offroad <= offroadRange[1] &&
        v.luxury >= luxuryRange[0] && v.luxury <= luxuryRange[1] &&
        v.reliability >= reliabilityRange[0] && v.reliability <= reliabilityRange[1] &&
        v.performance >= performanceRange[0] && v.performance <= performanceRange[1] &&
        v.cargo >= cargoRange[0] && v.cargo <= cargoRange[1] &&
        v.tow >= towingRange[0] && v.tow <= towingRange[1] &&
        ptFilter.includes(v.pt) && sizeFilter.includes(v.size) && (makeFilter.length === 0 || makeFilter.includes(v.make));

      // ALL scores normalized to 0-1 range based on actual data spread
      // This ensures weights work as expected - a weight of 4 is truly 2x a weight of 2
      const offroadScore = ((v.offroad - offroadMin) / (offroadMax - offroadMin)) * priorities.offroad;
      const luxuryScore = ((v.luxury - luxuryMin) / (luxuryMax - luxuryMin)) * priorities.luxury;
      const reliabilityScore = ((v.reliability - reliabilityMin) / (reliabilityMax - reliabilityMin)) * priorities.reliability;
      const mpgScore = ((v.mpg - mpgMin) / (mpgMax - mpgMin)) * priorities.mpg;
      const valueScore = ((priceMax - v.price) / (priceMax - priceMin)) * priorities.value;
      const cargoScore = ((v.cargo - cargoMin) / (cargoMax - cargoMin)) * priorities.cargo;
      const performanceScore = ((v.performance - performanceMin) / (performanceMax - performanceMin)) * priorities.performance;
      const towScore = ((v.tow - towMin) / (towMax - towMin)) * priorities.towing;

      const score = ((offroadScore + luxuryScore + reliabilityScore + mpgScore + valueScore + cargoScore + performanceScore + towScore) / totalWeight) * 100;
      return { ...v, pass: passesFilters, score: Math.round(score) };
    });
  }, [priceRange, mpgRange, offroadRange, luxuryRange, reliabilityRange, performanceRange, cargoRange, towingRange, ptFilter, sizeFilter, makeFilter, priorities, dataRanges]);

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
          <div style={{ position: "sticky", top: 16 }}>
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

              <RangeSliderControl label="MPG" range={mpgRange} setRange={setMpgRange} min={14} max={50} step={1} unit=""
                description="Filter by fuel efficiency range" />

              <RangeSliderControl label="Off-Road" range={offroadRange} setRange={setOffroadRange} min={3} max={10} step={0.5} unit=""
                description="3 = gravel roads · 6 = moderate trails · 8+ = serious" />

              <RangeSliderControl label="Luxury" range={luxuryRange} setRange={setLuxuryRange} min={3} max={10} step={0.5} unit=""
                description="Interior quality & comfort level" />

              <RangeSliderControl label="Reliability" range={reliabilityRange} setRange={setReliabilityRange} min={3} max={10} step={0.5} unit=""
                description="Expected dependability & repair costs" />

              <RangeSliderControl label="Performance" range={performanceRange} setRange={setPerformanceRange} min={3} max={10} step={0.5} unit=""
                description="Acceleration, power & driving dynamics" />

              <RangeSliderControl label="Cargo (cu ft)" range={cargoRange} setRange={setCargoRange} min={19} max={70} step={1} unit=""
                description="Cargo capacity behind 2nd row" />

              <RangeSliderControl label="Towing (lbs)" range={towingRange} setRange={setTowingRange} min={0} max={15000} step={500} unit=""
                description="Maximum towing capacity" />

              <ToggleGroup label="Size" active={sizeFilter} toggle={toggleSize}
                options={[
                  { value: "mid", label: "Midsize" },
                  { value: "full", label: "Full-size" },
                ]} />
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
                    return (
                      <div
                        key={v.id}
                        onMouseEnter={() => setHoveredVehicle(v.id)}
                        onMouseLeave={() => setHoveredVehicle(null)}
                        onClick={() => setExpanded(expanded === v.id ? null : v.id)}
                        style={{
                          position: "absolute",
                          left: `calc(${Math.max(2, Math.min(98, x))}% - 6px)`,
                          top: `calc(${Math.max(2, Math.min(98, y))}% - 6px)`,
                          width: isHovered ? 14 : 12,
                          height: isHovered ? 14 : 12,
                          borderRadius: "50%",
                          background: ptColor,
                          border: `2px solid ${isHovered ? "#fff" : ptColor}`,
                          opacity: isFiltered ? 0.15 : (isHovered ? 1 : 0.8),
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          zIndex: isHovered ? 100 : (isFiltered ? 1 : 10),
                          transform: isHovered ? "scale(1.3)" : "scale(1)",
                        }}
                        title={`${v.name}\nScore: ${v.score} · $${v.price}K`}
                      />
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
                        <div style={{ fontWeight: 700, marginBottom: 2 }}>{v.name}</div>
                        <div style={{ color: "rgba(255,255,255,0.6)" }}>Score: <span style={{ color: "var(--accent)" }}>{v.score}</span> · ${v.price}K</div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Filter bar - Makes and Powertrain */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
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

              {/* Powertrain filter - also serves as chart legend */}
              <div style={{ display: "flex", gap: 4 }}>
                {(["hybrid", "phev", "ice", "ev"]).map(pt => {
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
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        transition: "all 0.15s ease",
                      }}
                    >
                      <span style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: isActive ? color : "rgba(255,255,255,0.15)",
                        flexShrink: 0,
                      }} />
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
                    <PriorityControl label="Off-Road" value={priorities.offroad} pKey="offroad" />
                    <PriorityControl label="Luxury" value={priorities.luxury} pKey="luxury" />
                    <PriorityControl label="Reliability" value={priorities.reliability} pKey="reliability" />
                    <PriorityControl label="Performance" value={priorities.performance} pKey="performance" />
                    <PriorityControl label="Fuel Econ" value={priorities.mpg} pKey="mpg" />
                    <PriorityControl label="Value" value={priorities.value} pKey="value" />
                    <PriorityControl label="Cargo" value={priorities.cargo} pKey="cargo" />
                    <PriorityControl label="Towing" value={priorities.towing} pKey="towing" />
                  </div>
                )}
              </div>
              {[
                { key: "price", label: "Price" },
                { key: "mpg", label: "MPG" },
                { key: "offroad", label: "Off-Road" },
                { key: "luxury", label: "Luxury" },
                { key: "reliability", label: "Reliability" },
                { key: "performance", label: "Perf" },
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
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 3, lineHeight: 1.2, display: "flex", alignItems: "center", gap: 8 }}>
                            {v.name}
                            {v.url && (
                              <a
                                href={v.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                title="View on Edmunds"
                                style={{
                                  display: "inline-block", verticalAlign: "top",
                                  marginLeft: 6, marginTop: 2,
                                  opacity: 0.3, textDecoration: "none",
                                  transition: "opacity 0.15s ease", flexShrink: 0,
                                }}
                                onMouseEnter={e => { e.currentTarget.style.opacity = "0.7"; }}
                                onMouseLeave={e => { e.currentTarget.style.opacity = "0.3"; }}
                              >
                                <img src={edmundsLogo} alt="Edmunds" style={{ height: 8 }} />
                              </a>
                            )}
                          </div>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                            <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 3, background: ptColor + "20", color: ptColor, border: `1px solid ${ptColor}44`, fontFamily: "var(--font-mono)", fontWeight: 600 }}>{ptLabels[v.pt]}</span>
                            <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 3, background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.06)", fontFamily: "var(--font-mono)" }}>{sizeLabels[v.size]}</span>
                            <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 3, background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.06)", fontFamily: "var(--font-mono)" }}>{v.make}</span>
                          </div>
                        </div>
                        {/* Key stats */}
                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                          {[
                            { key: "score", label: "Score", val: v.score },
                            { key: "price", label: "Price", val: `$${v.price}K` },
                            { key: "mpg", label: "MPG", val: v.mpg },
                            { key: "offroad", label: "Off-Rd", val: v.offroad },
                            { key: "luxury", label: "Lux", val: v.luxury },
                            { key: "reliability", label: "Rel", val: v.reliability },
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
                            {[
                              { label: "Off-Road", val: v.offroad, max: 10 },
                              { label: "Luxury", val: v.luxury, max: 10 },
                              { label: "Reliability", val: v.reliability, max: 10 },
                              { label: "Performance", val: v.performance, max: 10 },
                              { label: "Cargo", val: v.cargo, max: 70, unit: " cu ft" },
                              { label: "Towing", val: v.tow.toLocaleString(), raw: v.tow, max: 12000, unit: " lbs" },
                              { label: "Ground Clear.", val: v.gc, max: 12, unit: "\"" },
                              { label: "MPG", val: v.mpg, max: 50 },
                            ].map((s, i) => (
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
                    return (
                      <div key={v.id}
                        onMouseEnter={() => setHoveredVehicle(v.id)}
                        onMouseLeave={() => setHoveredVehicle(null)}
                        style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, background: isHovered ? "rgba(122,158,109,0.1)" : "rgba(255,255,255,0.02)", border: `1px solid ${isHovered ? "rgba(122,158,109,0.3)" : "rgba(255,255,255,0.04)"}`, color: isHovered ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.25)", fontFamily: "var(--font-body)", cursor: "default", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 6 }}>
                        <span>{v.name}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: v.score >= 60 ? "rgba(122,158,109,0.6)" : "rgba(255,255,255,0.25)", fontFamily: "var(--font-mono)" }}>{v.score}</span>
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
