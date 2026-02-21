import { BUILT_IN_SCENARIOS, DEFAULT_CUSTOM_STATE, saveCustomState } from "../scenarios";
import { WEIGHT_ATTRS, FILTER_ATTRS } from "../constants";
import RangeSliderControl from "./controls/RangeSliderControl";
import WeightControl from "./controls/WeightControl";

export default function TuneModal({
  showTuneModal, setShowTuneModal,
  weights, setWeights, adjWeight, ranges, setRange, setScenarioModified,
  applyScenario, openSaveScenario, setCustomScenarioState,
}) {
  if (!showTuneModal) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={() => setShowTuneModal(false)}>
      <div style={{
        background: "rgba(11,16,14,0.98)", border: "1px solid rgba(122,158,109,0.3)",
        borderRadius: 16, padding: 20, width: "100%", maxWidth: 420, maxHeight: "85vh", overflowY: "auto",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)", margin: 16,
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent2)" }}>Custom</div>
          <button onClick={() => setShowTuneModal(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 20 }}>×</button>
        </div>
        {/* Weights */}
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginBottom: 10, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: 1.5 }}>
          What matters most to you
        </div>
        {WEIGHT_ATTRS.map(a => {
          const wKey = a.priorityKey || a.id;
          return <WeightControl key={wKey} label={a.priorityLabel} value={weights[wKey]} wKey={wKey} adjWeight={adjWeight} setWeights={setWeights} setScenarioModified={setScenarioModified} />;
        })}
        {/* Filters */}
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginBottom: 10, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: 1.5 }}>
            Attribute Ranges
          </div>
          {FILTER_ATTRS.map(a => (
            <RangeSliderControl
              key={a.id}
              label={a.label}
              range={ranges[a.id]}
              setRange={val => setRange(a.id, val)}
              min={a.min}
              max={a.max}
              step={a.step}
              unit={a.unit || ""}
              description=""
            />
          ))}
        </div>
        {/* Actions */}
        <div style={{ display: "flex", gap: 8, marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button
            onClick={() => {
              const wideOpen = BUILT_IN_SCENARIOS.find(s => s.isReset);
              if (wideOpen) applyScenario(wideOpen);
              saveCustomState(DEFAULT_CUSTOM_STATE);
              setCustomScenarioState({ ...DEFAULT_CUSTOM_STATE });
              setShowTuneModal(false);
            }}
            style={{
              flex: 1, padding: "10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer",
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-mono)",
            }}
          >
            Reset
          </button>
          <button
            onClick={() => { openSaveScenario(); setShowTuneModal(false); }}
            style={{
              flex: 1, padding: "10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer",
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-mono)", transition: "all 0.2s ease",
            }}
          >
            Save As New
          </button>
          <button
            onClick={() => setShowTuneModal(false)}
            style={{
              flex: 1, padding: "10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer",
              background: "rgba(122,158,109,0.25)", border: "1px solid rgba(122,158,109,0.5)",
              color: "var(--accent2)", fontFamily: "var(--font-mono)", transition: "all 0.2s ease",
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
