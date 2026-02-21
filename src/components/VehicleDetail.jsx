import { DETAIL_ATTRS, SUMMARY_ATTRS, ptColors, ptLabels, bodyLabels, sizeLabels, getDisplayName } from "../constants";
import Bar from "./controls/Bar";

export default function VehicleDetail({ vehicle: v, sortBy }) {
  const ptColor = ptColors[v.pt] || "#888";

  return (
    <>
      {/* Main info row */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
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
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, background: "rgba(255,255,255,0.02)", padding: "10px 12px", borderRadius: 6 }}>
          {v.note}
        </div>
      )}
    </>
  );
}
