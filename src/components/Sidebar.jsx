import { BODIES, SIZES, WEIGHT_ATTRS, FILTER_ATTRS, DATA_PRICE_MAX } from "../constants";
import RangeSliderControl from "./controls/RangeSliderControl";
import WeightControl from "./controls/WeightControl";

export default function Sidebar({
  priceRange, setPriceRange, bodyFilter, toggleBody, sizeFilter, toggleSize,
  weights, setWeights, adjWeight, ranges, setRange, setScenarioModified,
}) {
  return (
    <div style={{ position: "sticky", top: 16, maxHeight: "calc(100vh - 32px)", overflowY: "auto" }}>
      {/* Price Range */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <RangeSliderControl label="Price Range" range={priceRange} setRange={setPriceRange} min={0} max={DATA_PRICE_MAX + 50} step={5} unit="K" description="" />

        {/* Body type filter */}
        <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", gap: 6 }}>
            {BODIES.map(b => {
              const isActive = bodyFilter.includes(b.id);
              return (
                <button
                  key={b.id}
                  onClick={() => toggleBody(b.id)}
                  style={{
                    flex: 1, padding: "12px 4px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer",
                    background: isActive ? "rgba(122,158,109,0.15)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${isActive ? "rgba(122,158,109,0.4)" : "rgba(255,255,255,0.08)"}`,
                    color: isActive ? "var(--accent2)" : "rgba(255,255,255,0.3)",
                    fontFamily: "var(--font-mono)", transition: "all 0.15s ease",
                  }}
                >
                  {b.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Size filter */}
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", gap: 6 }}>
            {SIZES.map(s => {
              const isActive = sizeFilter.includes(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => toggleSize(s.id)}
                  style={{
                    flex: 1, padding: "8px 4px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer",
                    background: isActive ? "rgba(122,158,109,0.15)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${isActive ? "rgba(122,158,109,0.4)" : "rgba(255,255,255,0.08)"}`,
                    color: isActive ? "var(--accent2)" : "rgba(255,255,255,0.3)",
                    fontFamily: "var(--font-mono)", transition: "all 0.15s ease",
                  }}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Preferences & Filters */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginBottom: 12, fontFamily: "var(--font-mono)" }}>
          What matters most to you
        </div>
        {WEIGHT_ATTRS.map(a => {
          const wKey = a.priorityKey || a.id;
          return <WeightControl key={wKey} label={a.priorityLabel} value={weights[wKey]} wKey={wKey} adjWeight={adjWeight} setWeights={setWeights} setScenarioModified={setScenarioModified} />;
        })}
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
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
      </div>
    </div>
  );
}
