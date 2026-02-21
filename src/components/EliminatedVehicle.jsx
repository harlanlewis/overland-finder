import { ptColors, getDisplayName } from "../constants";
import VehicleDetail from "./VehicleDetail";

export default function EliminatedVehicle({
  vehicle: v, isExpanded, isHovered, isSaved, reasons, sortBy,
  savedVehicles, toggleSaved, setExpanded, setHoveredVehicle,
  includeVehicle,
}) {
  const ptColor = ptColors[v.pt] || "#888";

  return (
    <div style={{ width: isExpanded ? "100%" : "auto" }}>
      <div
        onClick={() => setExpanded(isExpanded ? null : v.id)}
        onMouseEnter={() => setHoveredVehicle(v.id)}
        onMouseLeave={() => setHoveredVehicle(null)}
        style={{
          fontSize: 11, padding: "6px 10px", borderRadius: isExpanded ? "6px 6px 0 0" : 6,
          background: isExpanded ? (isSaved ? "rgba(234,179,8,0.06)" : "rgba(255,255,255,0.04)") : (isHovered ? (isSaved ? "rgba(234,179,8,0.08)" : "rgba(122,158,109,0.1)") : (isSaved ? "rgba(234,179,8,0.03)" : "rgba(255,255,255,0.02)")),
          border: `1px solid ${isExpanded ? (isSaved ? "rgba(234,179,8,0.15)" : "rgba(255,255,255,0.08)") : (isHovered ? (isSaved ? "rgba(234,179,8,0.2)" : "rgba(122,158,109,0.3)") : (isSaved ? "rgba(234,179,8,0.08)" : "rgba(255,255,255,0.04)"))}`,
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
        {/* Save button */}
        <button
          onClick={(e) => toggleSaved(v.id, e)}
          title={isSaved ? "Unstar vehicle" : "Star vehicle"}
          style={{
            background: "none", border: "none", cursor: "pointer", fontSize: 12,
            color: isSaved ? "#eab308" : "rgba(255,255,255,0.15)",
            padding: "2px 4px", marginLeft: "auto", transition: "color 0.15s ease",
          }}
        >
          {isSaved ? "★" : "☆"}
        </button>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.15)", transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
      </div>
      {/* Expanded detail */}
      {isExpanded && (
        <div style={{
          background: "rgba(255,255,255,0.02)", border: `1px solid ${isSaved ? "rgba(234,179,8,0.15)" : "rgba(255,255,255,0.08)"}`,
          borderTop: "none", borderRadius: "0 0 6px 6px", padding: "12px 14px",
        }} onClick={e => e.stopPropagation()}>
          <VehicleDetail vehicle={v} sortBy={sortBy} />
          {/* Filter reasons detail + Include button */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 12 }}>
            <div style={{ flex: 1, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: 1 }}>Excluded by:</span>
              {reasons.map((r, i) => (
                <span key={i} title={r.detail} style={{
                  fontSize: 10, padding: "2px 8px", borderRadius: 4,
                  background: "rgba(231,76,60,0.1)", color: "rgba(231,76,60,0.8)",
                  border: "1px solid rgba(231,76,60,0.2)", fontFamily: "var(--font-mono)", cursor: "help",
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
}
