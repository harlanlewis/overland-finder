import { SORTABLE_ATTRS } from "../constants";

export default function SortBar({ sortBy, setSortBy, sortAsc, setSortAsc }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: 1 }}>Sort:</span>
      <div style={{ position: "relative" }}>
        <button onClick={() => {
          if (sortBy === "score") { setSortAsc(!sortAsc); }
          else { setSortBy("score"); setSortAsc(false); }
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
        </button>
      </div>
      {[
        { key: "price", label: "Price" },
        ...SORTABLE_ATTRS.map(a => ({ key: a.id, label: a.shortLabel })),
      ].map(s => {
        const isActive = sortBy === s.key;
        return (
          <button key={s.key} onClick={() => {
            if (sortBy === s.key) { setSortAsc(!sortAsc); }
            else { setSortBy(s.key); setSortAsc(s.key === "price"); }
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
  );
}
