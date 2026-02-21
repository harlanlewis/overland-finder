import { MAKES, PT_IDS, ptLabels, ptColors } from "../constants";

export default function FilterBar({
  searchExpanded, setSearchExpanded, searchQuery, setSearchQuery, searchInputRef,
  makeFilter, setMakeFilter, showMakeDropdown, setShowMakeDropdown, makeDropdownRef,
  ptFilter, togglePt,
  savedOnly, setSavedOnly, savedVehicles,
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
      {/* Search */}
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        {searchExpanded ? (
          <div style={{
            display: "flex", alignItems: "center",
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(122,158,109,0.4)",
            borderRadius: 5, padding: "0 8px", gap: 6,
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
              onBlur={() => { if (!searchQuery) setSearchExpanded(false); }}
              placeholder="Search vehicles..."
              style={{
                width: 140, padding: "5px 0", background: "transparent", border: "none",
                outline: "none", color: "#fff", fontSize: 11, fontFamily: "var(--font-body)",
              }}
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); searchInputRef.current?.focus(); }}
                style={{
                  background: "none", border: "none", color: "rgba(255,255,255,0.4)",
                  cursor: "pointer", padding: 0, fontSize: 14, lineHeight: 1,
                  display: "flex", alignItems: "center",
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
              padding: "4px 8px", borderRadius: 5, background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 4,
              color: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: "var(--font-mono)",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
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
            padding: "4px 10px", borderRadius: 5, fontSize: 11,
            background: makeFilter.length > 0 ? "rgba(122,158,109,0.15)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${makeFilter.length > 0 ? "rgba(122,158,109,0.4)" : "rgba(255,255,255,0.1)"}`,
            color: makeFilter.length > 0 ? "var(--accent2)" : "#c8d6c3",
            fontFamily: "var(--font-mono)", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}
        >
          {makeFilter.length === 0 ? "All Makes" : makeFilter.length === 1 ? makeFilter[0] : `${makeFilter.length} Makes`}
          <span style={{ fontSize: 8, opacity: 0.6 }}>▼</span>
        </button>
        {showMakeDropdown && (
          <div style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 1000,
            background: "rgba(11,16,14,0.98)", border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 8, padding: 8, minWidth: 180, maxHeight: 300, overflowY: "auto",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}>
            <button
              onClick={() => setMakeFilter([])}
              style={{
                width: "100%", padding: "6px 10px", borderRadius: 4, fontSize: 11, textAlign: "left",
                background: makeFilter.length === 0 ? "rgba(122,158,109,0.2)" : "transparent",
                border: "none", color: makeFilter.length === 0 ? "var(--accent2)" : "rgba(255,255,255,0.6)",
                cursor: "pointer", fontFamily: "var(--font-mono)",
                fontWeight: makeFilter.length === 0 ? 600 : 400, marginBottom: 4,
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
                      prev.includes(make) ? prev.filter(m => m !== make) : [...prev, make]
                    );
                  }}
                  style={{
                    width: "100%", padding: "6px 10px", borderRadius: 4, fontSize: 11, textAlign: "left",
                    background: isSelected ? "rgba(122,158,109,0.15)" : "transparent",
                    border: "none", color: isSelected ? "var(--accent2)" : "rgba(255,255,255,0.6)",
                    cursor: "pointer", fontFamily: "var(--font-body)",
                    display: "flex", alignItems: "center",
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
                padding: "4px 10px", borderRadius: 5, fontSize: 11, fontWeight: 600, cursor: "pointer",
                background: isActive ? `${color}25` : "rgba(255,255,255,0.03)",
                border: `1px solid ${isActive ? `${color}60` : "rgba(255,255,255,0.08)"}`,
                color: isActive ? color : "rgba(255,255,255,0.3)",
                fontFamily: "var(--font-mono)", transition: "all 0.15s ease",
              }}
            >
              {ptLabels[pt]}
            </button>
          );
        })}
      </div>

      {/* Starred vehicles filter */}
      <button
        onClick={() => setSavedOnly(!savedOnly)}
        style={{
          marginLeft: "auto", padding: "4px 10px", borderRadius: 5, fontSize: 11, fontWeight: 600, cursor: "pointer",
          background: savedOnly ? "rgba(234,179,8,0.2)" : "rgba(255,255,255,0.03)",
          border: `1px solid ${savedOnly ? "rgba(234,179,8,0.5)" : "rgba(255,255,255,0.08)"}`,
          color: savedOnly ? "#eab308" : "rgba(255,255,255,0.3)",
          fontFamily: "var(--font-mono)", transition: "all 0.15s ease",
          display: "flex", alignItems: "center", gap: 5,
        }}
      >
        <span style={{ fontSize: 12 }}>★</span>
        Starred Vehicles{savedVehicles.length > 0 ? ` (${savedVehicles.length})` : ""}
      </button>
    </div>
  );
}
