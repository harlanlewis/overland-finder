export default function ToggleGroup({ label, options, active, toggle }) {
  return (
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
}
