export default function SaveScenarioDialog({
  showSaveScenario, setShowSaveScenario,
  saveScenarioTitle, setSaveScenarioTitle,
  saveScenarioDesc, setSaveScenarioDesc,
  handleSaveScenario,
}) {
  if (!showSaveScenario) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={() => setShowSaveScenario(false)}>
      <div style={{
        background: "rgba(11,16,14,0.98)", border: "1px solid rgba(122,158,109,0.3)",
        borderRadius: 12, padding: 24, width: 400, maxWidth: "90vw",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--accent2)", marginBottom: 16 }}>Save Scenario</div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 6, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: 1 }}>Name</div>
          <input
            type="text"
            value={saveScenarioTitle}
            onChange={e => setSaveScenarioTitle(e.target.value)}
            placeholder="My Custom Scenario"
            style={{
              width: "100%", padding: "10px 12px", borderRadius: 6, fontSize: 13,
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff", outline: "none", fontFamily: "var(--font-body)",
            }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 6, fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: 1 }}>Description</div>
          <input
            type="text"
            value={saveScenarioDesc}
            onChange={e => setSaveScenarioDesc(e.target.value)}
            placeholder="Brief description"
            style={{
              width: "100%", padding: "10px 12px", borderRadius: 6, fontSize: 13,
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff", outline: "none", fontFamily: "var(--font-body)",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setShowSaveScenario(false)}
            style={{
              flex: 1, padding: "10px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSaveScenario}
            disabled={!saveScenarioTitle.trim()}
            style={{
              flex: 1, padding: "10px", borderRadius: 6, fontSize: 12, fontWeight: 700,
              cursor: saveScenarioTitle.trim() ? "pointer" : "not-allowed",
              background: saveScenarioTitle.trim() ? "rgba(122,158,109,0.3)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${saveScenarioTitle.trim() ? "rgba(122,158,109,0.5)" : "rgba(255,255,255,0.1)"}`,
              color: saveScenarioTitle.trim() ? "var(--accent2)" : "rgba(255,255,255,0.3)",
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
