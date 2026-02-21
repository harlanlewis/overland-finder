import { BUILT_IN_SCENARIOS, CUSTOM_SCENARIO_ID } from "../scenarios";

export default function ScenarioBar({
  scenarios, activeScenarioId, scenarioModified, customScenarioState,
  isMobile, applyScenario, handleUpdateScenario, openSaveScenario,
  setShowManageScenarios, setShowTuneModal, activeScenario,
}) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
      {isMobile && (
        <span style={{
          fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.35)",
          fontFamily: "var(--font-mono)", whiteSpace: "nowrap", flexShrink: 0,
          textTransform: "uppercase", letterSpacing: 1.5,
        }}>
          Find My Car
        </span>
      )}

      <div style={{
        flex: 1, minWidth: 0, display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4,
        scrollbarWidth: "thin", scrollbarColor: "rgba(122,158,109,0.3) transparent",
      }}>
        {/* Custom button */}
        {(() => {
          const isActive = activeScenarioId === CUSTOM_SCENARIO_ID;
          return (
            <button
              onClick={() => {
                if (activeScenarioId !== CUSTOM_SCENARIO_ID) {
                  applyScenario(customScenarioState);
                }
                if (isMobile) setShowTuneModal(true);
              }}
              title="Your custom filters"
              style={{
                padding: "8px 14px", borderRadius: 6, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                background: isActive ? "rgba(122,158,109,0.15)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${isActive ? "rgba(122,158,109,0.4)" : "rgba(255,255,255,0.06)"}`,
                transition: "all 0.15s ease", display: "flex", alignItems: "center", gap: 6,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
                <circle cx="8" cy="6" r="2" fill="currentColor" /><circle cx="16" cy="12" r="2" fill="currentColor" /><circle cx="10" cy="18" r="2" fill="currentColor" />
              </svg>
              <span style={{ fontSize: 11, fontWeight: 600, color: isActive ? "var(--accent2)" : "rgba(255,255,255,0.6)" }}>
                Custom
              </span>
            </button>
          );
        })()}

        {scenarios.filter(s => !s.isReset).map(scenario => {
          const isActive = activeScenarioId === scenario.id;
          const isCustom = !scenario.builtIn;
          return (
            <button
              key={scenario.id}
              onClick={() => applyScenario(scenario)}
              title={scenario.description}
              style={{
                padding: "8px 14px", borderRadius: 6, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                background: isActive ? "rgba(122,158,109,0.15)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${isActive ? "rgba(122,158,109,0.4)" : "rgba(255,255,255,0.06)"}`,
                transition: "all 0.15s ease", display: "flex", alignItems: "center", gap: 6,
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 600, color: isActive ? "var(--accent2)" : "rgba(255,255,255,0.6)" }}>
                {scenario.label}
              </span>
              {isActive && scenarioModified && <span style={{ fontSize: 10, color: "var(--accent)" }}>*</span>}
              {isCustom && <span style={{ fontSize: 8, padding: "1px 4px", borderRadius: 3, background: "rgba(52,152,219,0.2)", color: "#7cb3d9" }}>custom</span>}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 4, flexShrink: 0, alignItems: "center" }}>
        {!isMobile && (
          <>
            <button
              onClick={() => {
                const wideOpen = BUILT_IN_SCENARIOS.find(s => s.isReset);
                if (wideOpen) applyScenario(wideOpen);
              }}
              title="Reset to default"
              style={{
                fontSize: 10, fontWeight: 600, padding: "6px 10px", borderRadius: 5,
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.5)", cursor: "pointer", fontFamily: "var(--font-mono)",
              }}
            >
              Reset
            </button>
            {scenarioModified && activeScenario && !activeScenario.builtIn && activeScenarioId !== CUSTOM_SCENARIO_ID && (
              <button
                onClick={handleUpdateScenario}
                title="Save changes to this scenario"
                style={{
                  fontSize: 10, fontWeight: 600, padding: "6px 10px", borderRadius: 5,
                  background: "rgba(122,158,109,0.2)", border: "1px solid rgba(122,158,109,0.4)",
                  color: "var(--accent2)", cursor: "pointer", fontFamily: "var(--font-mono)",
                }}
              >
                Save
              </button>
            )}
            <button
              onClick={openSaveScenario}
              disabled={!scenarioModified && activeScenarioId !== CUSTOM_SCENARIO_ID}
              title="Save as new scenario"
              style={{
                fontSize: 10, fontWeight: 600, padding: "6px 10px", borderRadius: 5,
                background: (scenarioModified || activeScenarioId === CUSTOM_SCENARIO_ID) ? "rgba(122,158,109,0.25)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${(scenarioModified || activeScenarioId === CUSTOM_SCENARIO_ID) ? "rgba(122,158,109,0.5)" : "rgba(255,255,255,0.06)"}`,
                color: (scenarioModified || activeScenarioId === CUSTOM_SCENARIO_ID) ? "var(--accent2)" : "rgba(255,255,255,0.25)",
                cursor: (scenarioModified || activeScenarioId === CUSTOM_SCENARIO_ID) ? "pointer" : "default", fontFamily: "var(--font-mono)",
                transition: "all 0.2s ease",
              }}
            >
              +
            </button>
          </>
        )}
        <button
          onClick={() => setShowManageScenarios(true)}
          title="Manage scenarios"
          style={{
            fontSize: 10, padding: "6px 10px", borderRadius: 5, cursor: "pointer",
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-mono)",
          }}
        >
          ...
        </button>
      </div>
    </div>
  );
}
