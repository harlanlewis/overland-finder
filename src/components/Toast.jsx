export default function Toast({ message }) {
  if (!message) return null;

  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      background: "rgba(11,16,14,0.95)", border: "1px solid rgba(122,158,109,0.4)",
      borderRadius: 8, padding: "12px 20px", boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
      color: "var(--accent2)", fontSize: 13, fontWeight: 500, zIndex: 2000,
    }}>
      {message}
    </div>
  );
}
