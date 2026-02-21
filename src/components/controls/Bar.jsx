export default function Bar({ val, max, color, width }) {
  return (
    <div style={{ width: width || 80, height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
      <div style={{ width: `${(val / max) * 100}%`, height: "100%", background: color || "#7a9e6d", borderRadius: 3, transition: "width 0.4s ease" }} />
    </div>
  );
}
