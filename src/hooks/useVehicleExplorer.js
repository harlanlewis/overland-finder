import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  BUILT_IN_SCENARIOS,
  DEFAULT_WEIGHTS,
  CUSTOM_SCENARIO_ID,
  DEFAULT_CUSTOM_STATE,
  loadScenarioState,
  saveScenarioState,
  getVisibleScenarios,
  saveCustomScenario,
  deleteCustomScenario,
  hideBuiltIn,
  getHiddenBuiltIns,
  unhideBuiltIn,
  generateScenarioId,
  loadCustomState,
  saveCustomState,
} from "../scenarios";
import {
  V,
  DATA_PRICE_MAX,
  PT_IDS,
  SIZE_IDS,
  BODY_IDS,
  PRIORITY_ATTRS,
  FILTER_ATTRS,
  DATA_RANGES,
  DEFAULT_SCENARIO,
  getEffectiveRange,
  fuzzyMatch,
  getSearchableText,
  ptLabels,
  sizeLabels,
  bodyLabels,
} from "../constants";

const SAVED_STORAGE_KEY = "overland-saved-vehicles";

function loadSavedVehicles() {
  try {
    const raw = localStorage.getItem(SAVED_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export default function useVehicleExplorer() {
  // Scenario state
  const [scenarios, setScenarios] = useState(getVisibleScenarios);
  const [activeScenarioId, setActiveScenarioId] = useState(() => {
    const state = loadScenarioState();
    return state.activeId || DEFAULT_SCENARIO.id;
  });
  const [scenarioModified, setScenarioModified] = useState(false);
  const [showSaveScenario, setShowSaveScenario] = useState(false);
  const [saveScenarioTitle, setSaveScenarioTitle] = useState("");
  const [saveScenarioDesc, setSaveScenarioDesc] = useState("");
  const [showManageScenarios, setShowManageScenarios] = useState(false);

  const activeScenario = useMemo(() => {
    return scenarios.find(s => s.id === activeScenarioId) || DEFAULT_SCENARIO;
  }, [scenarios, activeScenarioId]);

  // Weights & filter ranges
  const [weights, setWeights] = useState(() => ({ ...DEFAULT_SCENARIO.weights }));
  const [ranges, setRanges] = useState(() => {
    const initial = {};
    FILTER_ATTRS.forEach(a => {
      initial[a.id] = getEffectiveRange(DEFAULT_SCENARIO, a.id);
    });
    return initial;
  });
  const setRange = useCallback((id, val) => {
    setRanges(prev => ({ ...prev, [id]: val }));
    setScenarioModified(true);
  }, []);

  // Refine filters
  const [priceRange, setPriceRange] = useState(() => {
    const state = loadScenarioState();
    return state.priceRange || [20, 100];
  });
  const [ptFilter, setPtFilter] = useState([...PT_IDS]);
  const [sizeFilter, setSizeFilter] = useState([...SIZE_IDS]);
  const [bodyFilter, setBodyFilter] = useState([...BODY_IDS]);
  const [makeFilter, setMakeFilter] = useState([]);
  const [showMakeDropdown, setShowMakeDropdown] = useState(false);
  const makeDropdownRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchExpanded, setSearchExpanded] = useState(false);
  const searchInputRef = useRef(null);
  const [sortBy, setSortBy] = useState("score");
  const [sortAsc, setSortAsc] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [hoveredVehicle, setHoveredVehicle] = useState(null);
  const vehicleRefs = useRef({});
  const chartAreaRef = useRef(null);
  const [draggingPriceLine, setDraggingPriceLine] = useState(null);

  // Persistent custom scenario state
  const [customScenarioState, setCustomScenarioState] = useState(loadCustomState);

  // Responsive layout
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 900);
  const [showTuneModal, setShowTuneModal] = useState(false);

  // Saved/shortlist vehicles
  const [savedVehicles, setSavedVehicles] = useState(loadSavedVehicles);
  const [savedOnly, setSavedOnly] = useState(false);

  const toggleSaved = useCallback((id, e) => {
    if (e) e.stopPropagation();
    setSavedVehicles(prev => {
      const next = prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id];
      localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // Scroll to and expand a vehicle
  const scrollToVehicle = useCallback((vehicleId) => {
    setExpanded(vehicleId);
    setTimeout(() => {
      const el = vehicleRefs.current[vehicleId];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 50);
  }, []);

  // Global mouse events for price line dragging
  useEffect(() => {
    if (!draggingPriceLine) return;
    const handleMouseMove = (e) => {
      if (!chartAreaRef.current) return;
      const rect = chartAreaRef.current.getBoundingClientRect();
      const xFraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      setPriceRange(prev => {
        const span = prev[1] - prev[0];
        const buffer = Math.max(5, Math.min(20, Math.round(span * 0.1)));
        const chartMin = Math.max(0, prev[0] - buffer);
        const chartMax = prev[1] + buffer;
        const price = Math.round(chartMin + xFraction * (chartMax - chartMin));
        if (draggingPriceLine === 'min') {
          const newMin = Math.max(0, Math.min(price, prev[1] - 5));
          return [newMin, prev[1]];
        } else {
          const newMax = Math.max(price, prev[0] + 5);
          return [prev[0], newMax];
        }
      });
    };
    const handleMouseUp = () => setDraggingPriceLine(null);
    const handleMouseLeave = () => setDraggingPriceLine(null);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [draggingPriceLine]);

  // Toast notifications
  const [toast, setToast] = useState(null);
  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }, []);

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

  // Responsive breakpoint listener
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 899px)");
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Persist active scenario to localStorage
  useEffect(() => {
    const state = loadScenarioState();
    state.activeId = activeScenarioId;
    saveScenarioState(state);
  }, [activeScenarioId]);

  // Persist price range to localStorage
  useEffect(() => {
    const state = loadScenarioState();
    state.priceRange = priceRange;
    saveScenarioState(state);
  }, [priceRange]);

  // Apply a scenario
  const applyScenario = useCallback((scenario) => {
    const effective = scenario.id === CUSTOM_SCENARIO_ID ? customScenarioState : scenario;
    const newRanges = {};
    FILTER_ATTRS.forEach(a => {
      newRanges[a.id] = getEffectiveRange(effective, a.id);
    });
    setRanges(newRanges);
    setWeights({ ...effective.weights });
    if (effective.filters?.pt && effective.filters.pt.length > 0) {
      setPtFilter([...effective.filters.pt]);
    } else {
      setPtFilter([...PT_IDS]);
    }
    if (scenario.isReset) {
      setPriceRange([5, 120]);
      setSizeFilter([...SIZE_IDS]);
      setBodyFilter([...BODY_IDS]);
      setMakeFilter([]);
    }
    setActiveScenarioId(scenario.id);
    setScenarioModified(false);
    setSortBy("score");
    setExpanded(null);
    showToast(`Applied ${scenario.label}`);
  }, [showToast, customScenarioState]);

  // Toggle filters
  const togglePt = useCallback((pt) => {
    setPtFilter(prev => prev.includes(pt) ? prev.filter(p => p !== pt) : [...prev, pt]);
  }, []);
  const toggleSize = useCallback((size) => {
    setSizeFilter(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  }, []);
  const toggleBody = useCallback((body) => {
    setBodyFilter(prev => prev.includes(body) ? prev.filter(b => b !== body) : [...prev, body]);
  }, []);

  // Adjust weight
  const adjWeight = useCallback((key, delta) => {
    setWeights(prev => ({ ...prev, [key]: Math.max(0, Math.min(5, prev[key] + delta)) }));
    setScenarioModified(true);
  }, []);

  // Open save scenario dialog
  const openSaveScenario = useCallback(() => {
    const baseName = activeScenario?.label || "Custom";
    setSaveScenarioTitle(scenarioModified ? `${baseName} (Modified)` : "");
    setSaveScenarioDesc(activeScenario?.description || "");
    setShowSaveScenario(true);
  }, [activeScenario, scenarioModified]);

  // Build current filters object for saving
  const buildCurrentFilters = useCallback(() => {
    const filters = {};
    FILTER_ATTRS.forEach(a => {
      const range = ranges[a.id];
      const dataRange = DATA_RANGES[a.id];
      if (range[0] > dataRange.min || range[1] < dataRange.max) {
        filters[a.id] = [
          range[0] > dataRange.min ? range[0] : null,
          range[1] < dataRange.max ? range[1] : null,
        ];
      }
    });
    if (ptFilter.length > 0 && ptFilter.length < PT_IDS.length) {
      filters.pt = [...ptFilter];
    }
    return filters;
  }, [ranges, ptFilter]);

  // Auto-save custom state when in Custom mode
  useEffect(() => {
    if (activeScenarioId !== CUSTOM_SCENARIO_ID) return;
    const currentFilters = buildCurrentFilters();
    const newCustomState = {
      ...DEFAULT_CUSTOM_STATE,
      weights: { ...weights },
      filters: currentFilters,
    };
    setCustomScenarioState(newCustomState);
    saveCustomState(newCustomState);
    setScenarioModified(false);
  }, [activeScenarioId, weights, ranges, ptFilter, buildCurrentFilters]);

  // Update existing custom scenario in place
  const handleUpdateScenario = useCallback(() => {
    if (!activeScenario || activeScenario.builtIn) return;
    const updatedScenario = {
      ...activeScenario,
      filters: buildCurrentFilters(),
      weights: { ...weights },
    };
    saveCustomScenario(updatedScenario);
    setScenarios(getVisibleScenarios());
    setScenarioModified(false);
    showToast(`Updated ${activeScenario.label}`);
  }, [activeScenario, buildCurrentFilters, weights, showToast]);

  // Handle saving as new scenario
  const handleSaveScenario = useCallback(() => {
    const newScenario = {
      id: generateScenarioId(saveScenarioTitle),
      label: saveScenarioTitle || "Custom Scenario",
      description: saveScenarioDesc || "",
      filters: buildCurrentFilters(),
      weights: { ...weights },
      basedOn: activeScenario?.id,
    };
    saveCustomScenario(newScenario);
    setScenarios(getVisibleScenarios());
    setActiveScenarioId(newScenario.id);
    setScenarioModified(false);
    setShowSaveScenario(false);
    showToast(`Created ${newScenario.label}`);
  }, [buildCurrentFilters, weights, saveScenarioTitle, saveScenarioDesc, activeScenario, showToast]);

  // Delete a custom scenario
  const handleDeleteScenario = useCallback((scenarioId) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    deleteCustomScenario(scenarioId);
    setScenarios(getVisibleScenarios());
    if (activeScenarioId === scenarioId) {
      const reset = BUILT_IN_SCENARIOS.find(s => s.id === "_reset");
      if (reset) applyScenario(reset);
    }
    showToast(`Deleted ${scenario?.label || "scenario"}`);
  }, [activeScenarioId, applyScenario, scenarios, showToast]);

  // Hide a built-in scenario
  const handleHideScenario = useCallback((scenarioId) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    hideBuiltIn(scenarioId);
    setScenarios(getVisibleScenarios());
    if (activeScenarioId === scenarioId) {
      const reset = BUILT_IN_SCENARIOS.find(s => s.id === "_reset");
      if (reset) applyScenario(reset);
    }
    showToast(`Hidden ${scenario?.label || "scenario"}`);
  }, [activeScenarioId, applyScenario, scenarios, showToast]);

  // Unhide a built-in scenario
  const handleUnhideScenario = useCallback((scenarioId) => {
    const scenario = BUILT_IN_SCENARIOS.find(s => s.id === scenarioId);
    unhideBuiltIn(scenarioId);
    setScenarios(getVisibleScenarios());
    showToast(`Restored ${scenario?.label || "scenario"}`);
  }, [showToast]);

  // Update custom scenario metadata
  const handleUpdateScenarioMeta = useCallback((scenarioId, field, value) => {
    const state = loadScenarioState();
    const idx = state.custom.findIndex(s => s.id === scenarioId);
    if (idx < 0) return;
    state.custom[idx] = { ...state.custom[idx], [field]: value, modifiedAt: Date.now() };
    saveScenarioState(state);
    setScenarios(getVisibleScenarios());
  }, []);

  // Data ranges for normalization
  const dataRanges = useMemo(() => {
    const dr = {};
    PRIORITY_ATTRS.forEach(a => {
      dr[a.id] = {
        min: Math.min(...V.map(v => v[a.id])),
        max: Math.max(...V.map(v => v[a.id])),
      };
    });
    return dr;
  }, []);

  // Score and filter vehicles
  const scored = useMemo(() => {
    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0) || 1;
    return V.map(v => {
      let passesFilters = v.price >= priceRange[0] && v.price <= priceRange[1] &&
        ptFilter.includes(v.pt) &&
        sizeFilter.includes(v.size) &&
        bodyFilter.includes(v.body) &&
        (makeFilter.length === 0 || makeFilter.includes(v.make)) &&
        fuzzyMatch(searchQuery, getSearchableText(v));

      if (passesFilters) {
        for (const a of FILTER_ATTRS) {
          const range = ranges[a.id];
          if (v[a.id] < range[0] || v[a.id] > range[1]) {
            passesFilters = false;
            break;
          }
        }
      }

      if (passesFilters && activeScenario?.filters?.tow) {
        const [towMin, towMax] = activeScenario.filters.tow;
        if ((towMin !== null && v.tow < towMin) || (towMax !== null && v.tow > towMax)) {
          passesFilters = false;
        }
      }
      if (passesFilters && activeScenario?.filters?.gc) {
        const [gcMin, gcMax] = activeScenario.filters.gc;
        if ((gcMin !== null && v.gc < gcMin) || (gcMax !== null && v.gc > gcMax)) {
          passesFilters = false;
        }
      }

      let totalScore = 0;
      for (const a of PRIORITY_ATTRS) {
        const wKey = a.priorityKey || a.id;
        const weight = weights[wKey];
        if (weight > 0) {
          const dr = dataRanges[a.id];
          const normalized = (v[a.id] - dr.min) / (dr.max - dr.min);
          totalScore += normalized * weight;
        }
      }

      const score = (totalScore / totalWeight) * 100;
      return { ...v, pass: passesFilters, score: Math.round(score) };
    });
  }, [priceRange, ranges, ptFilter, sizeFilter, bodyFilter, makeFilter, searchQuery, weights, dataRanges, activeScenario]);

  const filtered = useMemo(() => {
    let f = scored.filter(v => v.pass);
    if (savedOnly) f = f.filter(v => savedVehicles.includes(v.id));
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
  }, [scored, sortBy, sortAsc, savedOnly, savedVehicles]);

  const eliminated = scored.filter(v => !v.pass).sort((a, b) => b.score - a.score);
  const savedEliminated = eliminated.filter(v => savedVehicles.includes(v.id));
  const unsavedEliminated = eliminated.filter(v => !savedVehicles.includes(v.id));

  // Filter reasons for a vehicle
  const getFilterReasons = useCallback((v) => {
    const reasons = [];
    if (v.price < priceRange[0]) {
      reasons.push({ label: "Price", type: "price", detail: `$${v.price}K < $${priceRange[0]}K` });
    } else if (v.price > priceRange[1]) {
      reasons.push({ label: "Price", type: "price", detail: `$${v.price}K > $${priceRange[1]}K` });
    }
    if (!ptFilter.includes(v.pt)) {
      reasons.push({ label: ptLabels[v.pt], type: "pt", detail: "excluded" });
    }
    if (!sizeFilter.includes(v.size)) {
      reasons.push({ label: sizeLabels[v.size], type: "size", detail: "excluded" });
    }
    if (!bodyFilter.includes(v.body)) {
      reasons.push({ label: bodyLabels[v.body], type: "body", detail: "excluded" });
    }
    if (makeFilter.length > 0 && !makeFilter.includes(v.make)) {
      reasons.push({ label: v.make, type: "make", detail: "not selected" });
    }
    if (searchQuery && !fuzzyMatch(searchQuery, getSearchableText(v))) {
      reasons.push({ label: "Search", type: "search", detail: "no match" });
    }
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
    if (activeScenario?.filters?.tow) {
      const [towMin, towMax] = activeScenario.filters.tow;
      if (towMin !== null && v.tow < towMin) {
        reasons.push({ label: "Towing", type: "range", detail: `${v.tow.toLocaleString()} lbs < ${towMin.toLocaleString()} lbs` });
      } else if (towMax !== null && v.tow > towMax) {
        reasons.push({ label: "Towing", type: "range", detail: `${v.tow.toLocaleString()} lbs > ${towMax.toLocaleString()} lbs` });
      }
    }
    if (activeScenario?.filters?.gc) {
      const [gcMin, gcMax] = activeScenario.filters.gc;
      if (gcMin !== null && v.gc < gcMin) {
        reasons.push({ label: "Ground Cl.", type: "range", detail: `${v.gc}" < ${gcMin}"` });
      } else if (gcMax !== null && v.gc > gcMax) {
        reasons.push({ label: "Ground Cl.", type: "range", detail: `${v.gc}" > ${gcMax}"` });
      }
    }
    return reasons;
  }, [priceRange, ptFilter, sizeFilter, bodyFilter, makeFilter, searchQuery, ranges, activeScenario]);

  // Relax filters to include a vehicle
  const includeVehicle = useCallback((v) => {
    let newPriceRange = [...priceRange];
    if (v.price < priceRange[0]) newPriceRange[0] = v.price;
    if (v.price > priceRange[1]) newPriceRange[1] = v.price;
    if (newPriceRange[0] !== priceRange[0] || newPriceRange[1] !== priceRange[1]) {
      setPriceRange(newPriceRange);
    }
    if (!ptFilter.includes(v.pt)) {
      setPtFilter(prev => [...prev, v.pt]);
    }
    if (!sizeFilter.includes(v.size)) {
      setSizeFilter(prev => [...prev, v.size]);
    }
    if (!bodyFilter.includes(v.body)) {
      setBodyFilter(prev => [...prev, v.body]);
    }
    if (makeFilter.length > 0 && !makeFilter.includes(v.make)) {
      setMakeFilter(prev => [...prev, v.make]);
    }
    if (searchQuery && !fuzzyMatch(searchQuery, getSearchableText(v))) {
      setSearchQuery("");
    }
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
      setScenarioModified(true);
    }
  }, [priceRange, ptFilter, sizeFilter, bodyFilter, makeFilter, searchQuery, ranges]);

  // Chart dimensions
  const chartPadding = { left: 35, right: 10, top: 10, bottom: 25 };
  const sliderMax = DATA_PRICE_MAX + 50;
  const scoredPrices = scored.map(v => v.price);
  const dataMinPrice = scoredPrices.length ? Math.min(...scoredPrices) : 0;
  const dataMaxPrice = scoredPrices.length ? Math.max(...scoredPrices) : DATA_PRICE_MAX;
  const effectivePriceMin = priceRange[0] === 0 ? dataMinPrice : priceRange[0];
  const effectivePriceMax = priceRange[1] >= sliderMax ? dataMaxPrice : priceRange[1];
  const priceRangeSpan = effectivePriceMax - effectivePriceMin;
  const priceBuffer = Math.max(5, Math.min(20, Math.round(priceRangeSpan * 0.1)));
  const chartPriceMin = Math.max(0, effectivePriceMin - priceBuffer);
  const chartPriceMax = effectivePriceMax + priceBuffer;
  const visibleScores = scored
    .filter(v => v.price >= chartPriceMin && v.price <= chartPriceMax)
    .map(v => v.score);
  const minScoreInData = visibleScores.length ? Math.min(...visibleScores) : 0;
  const maxScoreInData = Math.max(...visibleScores, 50);
  const scoreMin = Math.max(0, Math.floor((minScoreInData - 3) / 5) * 5);
  const scoreMax = Math.min(100, Math.ceil((maxScoreInData + 3) / 5) * 5);
  const minPriceLineX = ((priceRange[0] - chartPriceMin) / (chartPriceMax - chartPriceMin)) * 100;
  const maxPriceLineX = ((priceRange[1] - chartPriceMin) / (chartPriceMax - chartPriceMin)) * 100;

  return {
    // Scenario state
    scenarios,
    activeScenarioId,
    activeScenario,
    scenarioModified,
    showSaveScenario, setShowSaveScenario,
    saveScenarioTitle, setSaveScenarioTitle,
    saveScenarioDesc, setSaveScenarioDesc,
    showManageScenarios, setShowManageScenarios,
    customScenarioState, setCustomScenarioState,

    // Scenario actions
    applyScenario,
    openSaveScenario,
    handleSaveScenario,
    handleUpdateScenario,
    handleDeleteScenario,
    handleHideScenario,
    handleUnhideScenario,
    handleUpdateScenarioMeta,

    // Weights & filters
    weights, setWeights,
    ranges, setRange,
    priceRange, setPriceRange,
    ptFilter, togglePt,
    sizeFilter, toggleSize,
    bodyFilter, toggleBody,
    makeFilter, setMakeFilter,
    showMakeDropdown, setShowMakeDropdown,
    makeDropdownRef,
    searchQuery, setSearchQuery,
    searchExpanded, setSearchExpanded,
    searchInputRef,
    adjWeight,
    setScenarioModified,

    // Sort & selection
    sortBy, setSortBy,
    sortAsc, setSortAsc,
    expanded, setExpanded,
    hoveredVehicle, setHoveredVehicle,
    vehicleRefs,

    // Saved vehicles
    savedVehicles, toggleSaved,
    savedOnly, setSavedOnly,

    // Computed data
    scored, filtered,
    eliminated, savedEliminated, unsavedEliminated,
    getFilterReasons,
    includeVehicle,
    scrollToVehicle,

    // Chart data
    chartAreaRef,
    chartPadding,
    chartPriceMin, chartPriceMax,
    scoreMin, scoreMax,
    minPriceLineX, maxPriceLineX,
    draggingPriceLine, setDraggingPriceLine,

    // Layout
    isMobile,
    showTuneModal, setShowTuneModal,
    toast,
    showToast,
  };
}
