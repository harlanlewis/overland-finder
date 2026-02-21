import { V, DATA_PRICE_MAX, ptColors, getDisplayName } from "../constants";

export default function ScatterPlot({
  scored, filtered, savedVehicles, savedOnly,
  hoveredVehicle, setHoveredVehicle, scrollToVehicle,
  priceRange, chartAreaRef, chartPadding,
  chartPriceMin, chartPriceMax, scoreMin, scoreMax,
  minPriceLineX, maxPriceLineX,
  draggingPriceLine, setDraggingPriceLine,
}) {
  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5, color: "rgba(255,255,255,0.6)", marginBottom: 12, fontFamily: "var(--font-mono)", display: "flex", justifyContent: "space-between" }}>
        <span>Price vs Score</span>
        <span><span style={{ color: "var(--accent)", fontWeight: 700, fontSize: 14 }}>{filtered.length}</span><span style={{ color: "rgba(255,255,255,0.35)" }}> / {V.length} vehicles</span></span>
      </div>
      <div style={{ position: "relative", height: 220, paddingLeft: chartPadding.left, paddingBottom: chartPadding.bottom, paddingRight: chartPadding.right, paddingTop: chartPadding.top }}>
        {/* Y axis labels */}
        {(() => {
          const range = scoreMax - scoreMin;
          const step = range <= 30 ? 5 : range <= 50 ? 10 : 15;
          const labels = [];
          for (let s = Math.ceil(scoreMin / step) * step; s <= scoreMax; s += step) {
            labels.push(s);
          }
          return labels;
        })().map(score => {
          const yPercent = ((scoreMax - score) / (scoreMax - scoreMin)) * 100;
          const chartAreaHeight = 220 - chartPadding.top - chartPadding.bottom;
          const topPx = chartPadding.top + (yPercent / 100) * chartAreaHeight;
          return (
            <div key={score} style={{
              position: "absolute", left: 0, top: topPx, transform: "translateY(-50%)",
              fontSize: 9, color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-mono)",
              width: chartPadding.left - 5, textAlign: "right",
            }}>
              {score}
            </div>
          );
        })}
        {/* X axis labels */}
        {(() => {
          const range = chartPriceMax - chartPriceMin;
          const step = range <= 60 ? 10 : range <= 100 ? 20 : 40;
          const labels = [];
          for (let p = Math.ceil(chartPriceMin / step) * step; p <= chartPriceMax; p += step) {
            labels.push(p);
          }
          return labels.map(price => {
            const xFraction = (price - chartPriceMin) / (chartPriceMax - chartPriceMin);
            return (
              <div key={price} style={{
                position: "absolute",
                left: `calc(${chartPadding.left}px + ${xFraction} * (100% - ${chartPadding.left + chartPadding.right}px))`,
                bottom: 0, transform: "translateX(-50%)",
                fontSize: 9, color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-mono)",
              }}>
                ${price}K
              </div>
            );
          });
        })()}
        {/* Chart area */}
        <div ref={chartAreaRef} style={{ position: "absolute", left: chartPadding.left, right: chartPadding.right, top: chartPadding.top, bottom: chartPadding.bottom, background: "rgba(0,0,0,0.15)", borderRadius: 4, border: "1px solid rgba(255,255,255,0.04)" }}>
          {/* Grid lines */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            {[20, 40, 60, 80].map(pct => (
              <line key={`h${pct}`} x1="0%" y1={`${pct}%`} x2="100%" y2={`${pct}%`} stroke="rgba(255,255,255,0.04)" strokeDasharray="2,4" />
            ))}
            {[20, 40, 60, 80].map(pct => (
              <line key={`v${pct}`} x1={`${pct}%`} y1="0%" x2={`${pct}%`} y2="100%" stroke="rgba(255,255,255,0.04)" strokeDasharray="2,4" />
            ))}
          </svg>
          {/* Min price line */}
          {priceRange[0] > 0 && minPriceLineX >= 0 && (
            <>
              <div
                onMouseDown={(e) => { e.preventDefault(); setDraggingPriceLine('min'); }}
                style={{
                  position: "absolute", left: `calc(${minPriceLineX}% - 6px)`, top: 0, bottom: 0,
                  width: 12, cursor: "ew-resize", zIndex: 10,
                }}
              >
                <div style={{
                  position: "absolute", left: 5, top: 0, bottom: 0, width: 2,
                  background: draggingPriceLine === 'min' ? "var(--accent2)" : "rgba(122,158,109,0.6)",
                  transition: draggingPriceLine ? "none" : "background 0.15s",
                }} />
              </div>
              <div style={{
                position: "absolute", left: `${minPriceLineX}%`, bottom: 4, transform: "translateX(-50%)",
                fontSize: 9, fontWeight: 600, color: "var(--accent)", fontFamily: "var(--font-mono)",
                background: "rgba(11,16,14,0.9)", padding: "2px 6px", borderRadius: 3,
                zIndex: 6, whiteSpace: "nowrap", pointerEvents: "none",
              }}>
                ${priceRange[0]}K min
              </div>
            </>
          )}
          {/* Max price line */}
          {priceRange[1] < DATA_PRICE_MAX + 50 && maxPriceLineX <= 100 && (
            <>
              <div
                onMouseDown={(e) => { e.preventDefault(); setDraggingPriceLine('max'); }}
                style={{
                  position: "absolute", left: `calc(${maxPriceLineX}% - 6px)`, top: 0, bottom: 0,
                  width: 12, cursor: "ew-resize", zIndex: 10,
                }}
              >
                <div style={{
                  position: "absolute", left: 5, top: 0, bottom: 0, width: 2,
                  background: draggingPriceLine === 'max' ? "var(--accent2)" : "rgba(122,158,109,0.6)",
                  transition: draggingPriceLine ? "none" : "background 0.15s",
                }} />
              </div>
              <div style={{
                position: "absolute", left: `${maxPriceLineX}%`, top: 4, transform: "translateX(-50%)",
                fontSize: 9, fontWeight: 600, color: "var(--accent)", fontFamily: "var(--font-mono)",
                background: "rgba(11,16,14,0.9)", padding: "2px 6px", borderRadius: 3,
                zIndex: 6, whiteSpace: "nowrap", pointerEvents: "none",
              }}>
                ${priceRange[1]}K max
              </div>
            </>
          )}
          {/* Plot vehicles */}
          {scored.map(v => {
            const x = ((v.price - chartPriceMin) / (chartPriceMax - chartPriceMin)) * 100;
            const y = ((scoreMax - v.score) / (scoreMax - scoreMin)) * 100;
            if (x < 0 || x > 100) return null;
            const isFiltered = !v.pass || (savedOnly && !savedVehicles.includes(v.id));
            const isHovered = hoveredVehicle === v.id;
            const isSaved = savedVehicles.includes(v.id);
            const ptColor = ptColors[v.pt] || "#888";
            const size = isHovered ? 14 : 12;
            const outerSize = size + 10;
            return (
              <div
                key={v.id}
                onMouseEnter={() => setHoveredVehicle(v.id)}
                onMouseLeave={() => setHoveredVehicle(null)}
                onClick={() => scrollToVehicle(v.id)}
                style={{
                  position: "absolute",
                  left: `calc(${x}% - ${outerSize / 2}px)`,
                  top: `calc(${Math.max(2, Math.min(98, y))}% - ${outerSize / 2}px)`,
                  width: outerSize, height: outerSize,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: isFiltered ? 0.15 : (isHovered ? 1 : 0.8),
                  cursor: "pointer", transition: "all 0.15s ease",
                  zIndex: isHovered ? 100 : (isSaved ? 50 : (isFiltered ? 10 : 1)),
                  transform: isHovered ? "scale(1.3)" : "scale(1)",
                }}
                title={`${getDisplayName(v)}\nScore: ${v.score} · $${v.price}K`}
              >
                {isSaved && (
                  <div style={{
                    position: "absolute", width: outerSize, height: outerSize, borderRadius: "50%",
                    border: "2px solid #eab308", background: "rgba(234,179,8,0.15)",
                    animation: "pulse 2s ease-in-out infinite",
                  }} />
                )}
                <div style={{
                  width: size, height: size, borderRadius: "50%", background: ptColor,
                  border: `2px solid ${isHovered ? "#fff" : ptColor}`, position: "relative",
                }} />
              </div>
            );
          })}
          {/* Hover tooltip */}
          {hoveredVehicle && (() => {
            const v = scored.find(x => x.id === hoveredVehicle);
            if (!v) return null;
            const x = ((v.price - chartPriceMin) / (chartPriceMax - chartPriceMin)) * 100;
            const y = ((scoreMax - v.score) / (scoreMax - scoreMin)) * 100;
            return (
              <div style={{
                position: "absolute", left: `${x}%`, top: `${y}%`,
                transform: x > 50 ? "translate(-100%, -120%)" : "translate(10%, -120%)",
                background: "rgba(0,0,0,0.95)", border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 6, padding: "6px 10px", fontSize: 11, color: "#fff",
                whiteSpace: "nowrap", zIndex: 200, pointerEvents: "none",
              }}>
                <div style={{ fontWeight: 700, marginBottom: 2 }}>{getDisplayName(v)}</div>
                {v.generation && (
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, marginBottom: 2 }}>
                    {v.generation} · {v.yearStart}{v.yearEnd ? `–${v.yearEnd}` : '–'}
                  </div>
                )}
                <div style={{ color: "rgba(255,255,255,0.6)" }}>Score: <span style={{ color: "var(--accent)" }}>{v.score}</span> · ${v.price}K</div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
