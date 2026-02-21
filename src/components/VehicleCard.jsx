import { SUMMARY_ATTRS, ptColors, ptLabels, bodyLabels, sizeLabels, getDisplayName } from "../constants";
import VehicleDetail from "./VehicleDetail";

export default function VehicleCard({
  vehicle: v, idx, isExpanded, isTop, isHovered, sortBy,
  savedVehicles, toggleSaved, setExpanded, setHoveredVehicle, vehicleRef,
}) {
  const ptColor = ptColors[v.pt] || "#888";
  const isSaved = savedVehicles.includes(v.id);

  return (
    <div
      ref={vehicleRef}
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
                  display: "inline-block", verticalAlign: "top", marginLeft: 6,
                  opacity: 0.35, textDecoration: "none", transition: "opacity 0.15s ease",
                  flexShrink: 0, fontSize: 9, fontFamily: "var(--font-mono)", color: "rgba(255,255,255,0.6)",
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
            <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 3, background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.06)", fontFamily: "var(--font-mono)" }}>{bodyLabels[v.body]}</span>
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
        {/* Save button */}
        <button
          onClick={(e) => toggleSaved(v.id, e)}
          title={isSaved ? "Unstar vehicle" : "Star vehicle"}
          style={{
            background: "none", border: "none", cursor: "pointer", fontSize: 16,
            color: isSaved ? "#eab308" : "rgba(255,255,255,0.15)",
            padding: "4px 6px", borderRadius: 4, transition: "all 0.15s ease", flexShrink: 0,
          }}
          onMouseEnter={e => { if (!isSaved) e.currentTarget.style.color = "rgba(234,179,8,0.5)"; }}
          onMouseLeave={e => { if (!isSaved) e.currentTarget.style.color = "rgba(255,255,255,0.15)"; }}
        >
          {isSaved ? "★" : "☆"}
        </button>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0)", flexShrink: 0 }}>▼</span>
      </div>
      {/* Expanded detail */}
      {isExpanded && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}
          onClick={e => e.stopPropagation()}>
          <VehicleDetail vehicle={v} sortBy={sortBy} />
        </div>
      )}
    </div>
  );
}
