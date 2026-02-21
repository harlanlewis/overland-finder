export default function RangeSliderControl({ label, range, setRange, min, max, step, unit, description }) {
  const [localMin, localMax] = range;
  const pctMin = ((localMin - min) / (max - min)) * 100;
  const pctMax = ((localMax - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "var(--font-mono)" }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#c8d6c3", fontFamily: "var(--font-mono)" }}>
          {localMin === min && localMax === max ? "Any" : `${localMin}${unit} – ${localMax}${unit}`}
        </span>
      </div>
      {description && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 6, lineHeight: 1.4 }}>{description}</div>}
      <div style={{ position: "relative", height: 20, marginTop: 4 }}>
        {/* Track background - clickable */}
        <div
          style={{ position: "absolute", top: 3, left: 0, right: 0, height: 14, background: "transparent", cursor: "pointer", zIndex: 1 }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickPct = (e.clientX - rect.left) / rect.width;
            const clickVal = Math.round((min + clickPct * (max - min)) / step) * step;
            const distToMin = Math.abs(clickVal - localMin);
            const distToMax = Math.abs(clickVal - localMax);
            if (distToMin <= distToMax) {
              setRange([Math.min(clickVal, localMax), localMax]);
            } else {
              setRange([localMin, Math.max(clickVal, localMin)]);
            }
          }}
        />
        <div style={{ position: "absolute", top: 7, left: 0, right: 0, height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, pointerEvents: "none" }} />
        {/* Active range highlight */}
        <div style={{ position: "absolute", top: 7, left: `${pctMin}%`, width: `${pctMax - pctMin}%`, height: 6, background: "rgba(122,158,109,0.5)", borderRadius: 3, pointerEvents: "none" }} />
        {/* Min thumb */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: `calc(${pctMin}% - 9px)`,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#7a9e6d",
            border: "2px solid #c8d6c3",
            cursor: "grab",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            zIndex: localMin === localMax ? 4 : 3,
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            const startX = e.clientX;
            const startVal = localMin;
            const track = e.currentTarget.parentElement;
            const trackRect = track.getBoundingClientRect();
            const handleMove = (moveEvent) => {
              const deltaX = moveEvent.clientX - startX;
              const deltaPct = (deltaX / trackRect.width) * (max - min);
              let newVal = Math.round((startVal + deltaPct) / step) * step;
              newVal = Math.max(min, Math.min(localMax, newVal));
              setRange([newVal, localMax]);
            };
            const handleUp = () => {
              document.removeEventListener("mousemove", handleMove);
              document.removeEventListener("mouseup", handleUp);
            };
            document.addEventListener("mousemove", handleMove);
            document.addEventListener("mouseup", handleUp);
          }}
        />
        {/* Max thumb */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: `calc(${pctMax}% - 9px)`,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#7a9e6d",
            border: "2px solid #c8d6c3",
            cursor: "grab",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            zIndex: 3,
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            const startX = e.clientX;
            const startVal = localMax;
            const track = e.currentTarget.parentElement;
            const trackRect = track.getBoundingClientRect();
            const handleMove = (moveEvent) => {
              const deltaX = moveEvent.clientX - startX;
              const deltaPct = (deltaX / trackRect.width) * (max - min);
              let newVal = Math.round((startVal + deltaPct) / step) * step;
              newVal = Math.max(localMin, Math.min(max, newVal));
              setRange([localMin, newVal]);
            };
            const handleUp = () => {
              document.removeEventListener("mousemove", handleMove);
              document.removeEventListener("mouseup", handleUp);
            };
            document.addEventListener("mousemove", handleMove);
            document.addEventListener("mouseup", handleUp);
          }}
        />
      </div>
    </div>
  );
}
