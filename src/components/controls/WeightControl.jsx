export default function WeightControl({ label, value, wKey, adjWeight, setWeights, setScenarioModified }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
      <span style={{ flex: 1, fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-body)" }}>{label}</span>
      <button onClick={() => adjWeight(wKey, -1)} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.4)", width: 24, height: 24, borderRadius: 4, cursor: "pointer", fontSize: 14, flexShrink: 0 }}>−</button>
      <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ width: 16, height: 16, borderRadius: 3, background: i <= value ? "#7a9e6d" : "rgba(255,255,255,0.06)", border: `1px solid ${i <= value ? "rgba(122,158,109,0.5)" : "rgba(255,255,255,0.08)"}`, transition: "all 0.2s", cursor: "pointer" }} onClick={() => { setWeights(prev => ({ ...prev, [wKey]: i })); setScenarioModified(true); }} />
        ))}
      </div>
      <button onClick={() => adjWeight(wKey, 1)} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.4)", width: 24, height: 24, borderRadius: 4, cursor: "pointer", fontSize: 14, flexShrink: 0 }}>+</button>
    </div>
  );
}
