import { BUILT_IN_SCENARIOS, getHiddenBuiltIns } from "../scenarios";

export default function ManageScenariosModal({
  showManageScenarios, setShowManageScenarios,
  scenarios, handleDeleteScenario, handleHideScenario,
  handleUnhideScenario, handleUpdateScenarioMeta,
}) {
  if (!showManageScenarios) return null;

  const hiddenIds = getHiddenBuiltIns();

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={() => setShowManageScenarios(false)}>
      <div style={{
        background: "rgba(11,16,14,0.98)", border: "1px solid rgba(122,158,109,0.3)",
        borderRadius: 12, padding: 24, width: 450, maxWidth: "90vw", maxHeight: "80vh", overflowY: "auto",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--accent2)" }}>Manage Scenarios</div>
          <button onClick={() => setShowManageScenarios(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 18 }}>×</button>
        </div>

        {/* Custom scenarios */}
        {scenarios.filter(s => !s.builtIn).length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5, color: "rgba(255,255,255,0.3)", marginBottom: 8, fontFamily: "var(--font-mono)" }}>
              Custom Scenarios
            </div>
            {scenarios.filter(s => !s.builtIn).map(scenario => (
              <div key={scenario.id} style={{ padding: "10px 12px", background: "rgba(255,255,255,0.02)", borderRadius: 6, marginBottom: 6, border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <input
                      type="text"
                      defaultValue={scenario.label}
                      onBlur={e => {
                        if (e.target.value && e.target.value !== scenario.label) {
                          handleUpdateScenarioMeta(scenario.id, "label", e.target.value);
                        }
                      }}
                      onKeyDown={e => { if (e.key === "Enter") e.target.blur(); }}
                      style={{
                        width: "100%", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)",
                        background: "transparent", border: "none", borderBottom: "1px solid transparent",
                        padding: "2px 0", marginBottom: 4, outline: "none",
                      }}
                      onFocus={e => { e.target.style.borderBottomColor = "rgba(122,158,109,0.4)"; }}
                      onBlurCapture={e => { e.target.style.borderBottomColor = "transparent"; }}
                    />
                    <input
                      type="text"
                      defaultValue={scenario.description}
                      placeholder="Add description..."
                      onBlur={e => {
                        if (e.target.value !== scenario.description) {
                          handleUpdateScenarioMeta(scenario.id, "description", e.target.value);
                        }
                      }}
                      onKeyDown={e => { if (e.key === "Enter") e.target.blur(); }}
                      style={{
                        width: "100%", fontSize: 10, color: "rgba(255,255,255,0.35)",
                        background: "transparent", border: "none", borderBottom: "1px solid transparent",
                        padding: "2px 0", outline: "none",
                      }}
                      onFocus={e => { e.target.style.borderBottomColor = "rgba(122,158,109,0.4)"; }}
                      onBlurCapture={e => { e.target.style.borderBottomColor = "transparent"; }}
                    />
                  </div>
                  <button
                    onClick={() => handleDeleteScenario(scenario.id)}
                    style={{
                      fontSize: 10, padding: "4px 8px", borderRadius: 4, cursor: "pointer",
                      background: "rgba(231,76,60,0.1)", border: "1px solid rgba(231,76,60,0.3)",
                      color: "#e74c3c", flexShrink: 0,
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Built-in scenarios */}
        {scenarios.filter(s => s.builtIn && !s.isReset).length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5, color: "rgba(255,255,255,0.3)", marginBottom: 8, fontFamily: "var(--font-mono)" }}>
              Built-in Scenarios
            </div>
            {scenarios.filter(s => s.builtIn && !s.isReset).map(scenario => (
              <div key={scenario.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "rgba(255,255,255,0.02)", borderRadius: 6, marginBottom: 6, border: "1px solid rgba(255,255,255,0.05)" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>{scenario.label}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{scenario.description}</div>
                </div>
                <button
                  onClick={() => handleHideScenario(scenario.id)}
                  style={{
                    fontSize: 10, padding: "4px 8px", borderRadius: 4, cursor: "pointer",
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  Hide
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Hidden built-ins */}
        {hiddenIds.length > 0 && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5, color: "rgba(255,255,255,0.3)", marginBottom: 8, fontFamily: "var(--font-mono)" }}>
              Hidden
            </div>
            {hiddenIds.map(id => {
              const scenario = BUILT_IN_SCENARIOS.find(s => s.id === id);
              if (!scenario || scenario.isReset) return null;
              return (
                <div key={id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "rgba(255,255,255,0.02)", borderRadius: 6, marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{scenario.label}</span>
                  <button
                    onClick={() => handleUnhideScenario(id)}
                    style={{
                      fontSize: 10, padding: "4px 8px", borderRadius: 4, cursor: "pointer",
                      background: "rgba(122,158,109,0.1)", border: "1px solid rgba(122,158,109,0.3)",
                      color: "var(--accent)",
                    }}
                  >
                    Unhide
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
