import VehicleCard from "./VehicleCard";
import EliminatedVehicle from "./EliminatedVehicle";

export default function VehicleList({
  filtered, eliminated, savedEliminated, unsavedEliminated,
  expanded, setExpanded, hoveredVehicle, setHoveredVehicle,
  savedVehicles, toggleSaved, sortBy, vehicleRefs,
  getFilterReasons, includeVehicle,
}) {
  return (
    <>
      {/* Results */}
      {filtered.length === 0 ? (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--accent2)", marginBottom: 6 }}>No vehicles match</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Try loosening your requirements — they may be too restrictive.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((v, idx) => (
            <VehicleCard
              key={v.id}
              vehicle={v}
              idx={idx}
              isExpanded={expanded === v.id}
              isTop={idx === 0 && sortBy === "score"}
              isHovered={hoveredVehicle === v.id}
              sortBy={sortBy}
              savedVehicles={savedVehicles}
              toggleSaved={toggleSaved}
              setExpanded={setExpanded}
              setHoveredVehicle={setHoveredVehicle}
              vehicleRef={el => { vehicleRefs.current[v.id] = el; }}
            />
          ))}
        </div>
      )}

      {/* Eliminated */}
      {eliminated.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: "rgba(255,255,255,0.2)", marginBottom: 10, fontFamily: "var(--font-mono)" }}>
            Filtered out ({eliminated.length})
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {[
              ...(savedEliminated.length > 0 ? [{ _groupHeader: "saved", count: savedEliminated.length }] : []),
              ...savedEliminated,
              ...(savedEliminated.length > 0 && unsavedEliminated.length > 0 ? [{ _groupHeader: "other", count: unsavedEliminated.length }] : []),
              ...unsavedEliminated,
            ].map(v => {
              if (v._groupHeader) {
                return v._groupHeader === "saved" ? (
                  <div key="__saved_header" style={{ width: "100%", fontSize: 9, textTransform: "uppercase", letterSpacing: 1.5, color: "rgba(234,179,8,0.45)", marginBottom: 2, fontFamily: "var(--font-mono)" }}>
                    ★ Starred ({v.count})
                  </div>
                ) : (
                  <div key="__other_header" style={{ width: "100%", fontSize: 9, textTransform: "uppercase", letterSpacing: 1.5, color: "rgba(255,255,255,0.15)", marginTop: 10, marginBottom: 2, fontFamily: "var(--font-mono)" }}>
                    Other ({v.count})
                  </div>
                );
              }
              return (
                <EliminatedVehicle
                  key={v.id}
                  vehicle={v}
                  isExpanded={expanded === v.id}
                  isHovered={hoveredVehicle === v.id}
                  isSaved={savedVehicles.includes(v.id)}
                  reasons={getFilterReasons(v)}
                  sortBy={sortBy}
                  savedVehicles={savedVehicles}
                  toggleSaved={toggleSaved}
                  setExpanded={setExpanded}
                  setHoveredVehicle={setHoveredVehicle}
                  includeVehicle={includeVehicle}
                />
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
