import useVehicleExplorer from "./hooks/useVehicleExplorer";
import { BODIES, SIZES, DATA_PRICE_MAX } from "./constants";
import ScenarioBar from "./components/ScenarioBar";
import Sidebar from "./components/Sidebar";
import TuneModal from "./components/TuneModal";
import ScatterPlot from "./components/ScatterPlot";
import FilterBar from "./components/FilterBar";
import SortBar from "./components/SortBar";
import VehicleList from "./components/VehicleList";
import SaveScenarioDialog from "./components/SaveScenarioDialog";
import ManageScenariosModal from "./components/ManageScenariosModal";
import Toast from "./components/Toast";
import RangeSliderControl from "./components/controls/RangeSliderControl";

export default function App() {
  const state = useVehicleExplorer();

  return (
    <div style={{
      "--font-body": "'Barlow', sans-serif",
      "--font-mono": "'IBM Plex Mono', monospace",
      "--bg": "#0b100e",
      "--card": "rgba(255,255,255,0.025)",
      "--border": "rgba(255,255,255,0.07)",
      "--accent": "#7a9e6d",
      "--accent2": "#c8d6c3",
      minHeight: "100vh",
      background: "var(--bg)",
      color: "#e8ebe6",
      fontFamily: "var(--font-body)",
    }}>
      <style>{`
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: rgba(255,255,255,0.1);
          border-radius: 3px;
          height: 6px;
          cursor: pointer;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #7a9e6d;
          cursor: grab;
          border: 2px solid #c8d6c3;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          transition: transform 0.1s ease;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }
        input[type="range"]::-webkit-slider-thumb:active {
          cursor: grabbing;
          transform: scale(1.1);
        }
        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #7a9e6d;
          cursor: grab;
          border: 2px solid #c8d6c3;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        input[type="range"]::-moz-range-track {
          background: rgba(255,255,255,0.1);
          border-radius: 3px;
          height: 6px;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
      `}</style>
      {/* Topo texture overlay */}
      <div style={{ position: "fixed", inset: 0, opacity: 0.03, pointerEvents: "none",
        backgroundImage: `repeating-conic-gradient(rgba(122,158,109,0.3) 0% 25%, transparent 0% 50%)`,
        backgroundSize: "60px 60px",
      }} />

      <div style={{ position: "relative", maxWidth: 1200, margin: "0 auto", padding: "20px 16px" }}>
        <ScenarioBar
          scenarios={state.scenarios}
          activeScenarioId={state.activeScenarioId}
          activeScenario={state.activeScenario}
          scenarioModified={state.scenarioModified}
          customScenarioState={state.customScenarioState}
          isMobile={state.isMobile}
          applyScenario={state.applyScenario}
          handleUpdateScenario={state.handleUpdateScenario}
          openSaveScenario={state.openSaveScenario}
          setShowManageScenarios={state.setShowManageScenarios}
          setShowTuneModal={state.setShowTuneModal}
        />

        {/* Mobile: price range + compact chip row for body/size */}
        {state.isMobile && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ marginBottom: 8 }}>
              <RangeSliderControl label="Price Range" range={state.priceRange} setRange={state.setPriceRange} min={0} max={DATA_PRICE_MAX + 50} step={5} unit="K" description="" />
            </div>
            <div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap" }}>
              {BODIES.map(b => {
                const isActive = state.bodyFilter.includes(b.id);
                return (
                  <button
                    key={b.id}
                    onClick={() => state.toggleBody(b.id)}
                    style={{
                      padding: "5px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: "pointer",
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
              <span style={{ color: "rgba(255,255,255,0.12)", fontSize: 11 }}>·</span>
              {SIZES.map(s => {
                const isActive = state.sizeFilter.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => state.toggleSize(s.id)}
                    style={{
                      padding: "5px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: "pointer",
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
        )}

        <TuneModal
          showTuneModal={state.showTuneModal}
          setShowTuneModal={state.setShowTuneModal}
          weights={state.weights}
          setWeights={state.setWeights}
          adjWeight={state.adjWeight}
          ranges={state.ranges}
          setRange={state.setRange}
          setScenarioModified={state.setScenarioModified}
          applyScenario={state.applyScenario}
          openSaveScenario={state.openSaveScenario}
          setCustomScenarioState={state.setCustomScenarioState}
        />

        {/* Two-column layout (desktop) / Single column (mobile) */}
        <div style={{ display: "grid", gridTemplateColumns: state.isMobile ? "1fr" : "320px 1fr", gap: state.isMobile ? 0 : 24, alignItems: "start" }}>
          {/* Sidebar - desktop only */}
          {!state.isMobile && (
            <Sidebar
              priceRange={state.priceRange}
              setPriceRange={state.setPriceRange}
              bodyFilter={state.bodyFilter}
              toggleBody={state.toggleBody}
              sizeFilter={state.sizeFilter}
              toggleSize={state.toggleSize}
              weights={state.weights}
              setWeights={state.setWeights}
              adjWeight={state.adjWeight}
              ranges={state.ranges}
              setRange={state.setRange}
              setScenarioModified={state.setScenarioModified}
            />
          )}

          {/* Main content */}
          <div style={{ minWidth: 0, overflow: "hidden" }}>
            <SaveScenarioDialog
              showSaveScenario={state.showSaveScenario}
              setShowSaveScenario={state.setShowSaveScenario}
              saveScenarioTitle={state.saveScenarioTitle}
              setSaveScenarioTitle={state.setSaveScenarioTitle}
              saveScenarioDesc={state.saveScenarioDesc}
              setSaveScenarioDesc={state.setSaveScenarioDesc}
              handleSaveScenario={state.handleSaveScenario}
            />

            <ManageScenariosModal
              showManageScenarios={state.showManageScenarios}
              setShowManageScenarios={state.setShowManageScenarios}
              scenarios={state.scenarios}
              handleDeleteScenario={state.handleDeleteScenario}
              handleHideScenario={state.handleHideScenario}
              handleUnhideScenario={state.handleUnhideScenario}
              handleUpdateScenarioMeta={state.handleUpdateScenarioMeta}
            />

            <ScatterPlot
              scored={state.scored}
              filtered={state.filtered}
              savedVehicles={state.savedVehicles}
              savedOnly={state.savedOnly}
              hoveredVehicle={state.hoveredVehicle}
              setHoveredVehicle={state.setHoveredVehicle}
              scrollToVehicle={state.scrollToVehicle}
              priceRange={state.priceRange}
              chartAreaRef={state.chartAreaRef}
              chartPadding={state.chartPadding}
              chartPriceMin={state.chartPriceMin}
              chartPriceMax={state.chartPriceMax}
              scoreMin={state.scoreMin}
              scoreMax={state.scoreMax}
              minPriceLineX={state.minPriceLineX}
              maxPriceLineX={state.maxPriceLineX}
              draggingPriceLine={state.draggingPriceLine}
              setDraggingPriceLine={state.setDraggingPriceLine}
            />

            <FilterBar
              searchExpanded={state.searchExpanded}
              setSearchExpanded={state.setSearchExpanded}
              searchQuery={state.searchQuery}
              setSearchQuery={state.setSearchQuery}
              searchInputRef={state.searchInputRef}
              makeFilter={state.makeFilter}
              setMakeFilter={state.setMakeFilter}
              showMakeDropdown={state.showMakeDropdown}
              setShowMakeDropdown={state.setShowMakeDropdown}
              makeDropdownRef={state.makeDropdownRef}
              ptFilter={state.ptFilter}
              togglePt={state.togglePt}
              savedOnly={state.savedOnly}
              setSavedOnly={state.setSavedOnly}
              savedVehicles={state.savedVehicles}
            />

            <SortBar
              sortBy={state.sortBy}
              setSortBy={state.setSortBy}
              sortAsc={state.sortAsc}
              setSortAsc={state.setSortAsc}
            />

            <VehicleList
              filtered={state.filtered}
              eliminated={state.eliminated}
              savedEliminated={state.savedEliminated}
              unsavedEliminated={state.unsavedEliminated}
              expanded={state.expanded}
              setExpanded={state.setExpanded}
              hoveredVehicle={state.hoveredVehicle}
              setHoveredVehicle={state.setHoveredVehicle}
              savedVehicles={state.savedVehicles}
              toggleSaved={state.toggleSaved}
              sortBy={state.sortBy}
              vehicleRefs={state.vehicleRefs}
              getFilterReasons={state.getFilterReasons}
              includeVehicle={state.includeVehicle}
            />
          </div>
        </div>

        <Toast message={state.toast} />
      </div>
    </div>
  );
}
