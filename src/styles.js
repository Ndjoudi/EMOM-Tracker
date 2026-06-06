// ─── Design System / Styles ───
window.S = {
  app:    { background: "#0D0D0F", color: "#E8E8EA", minHeight: "100vh", maxWidth: 480, margin: "0 auto", position: "relative", paddingBottom: 80 },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", paddingTop: "calc(14px + env(safe-area-inset-top, 0px))", borderBottom: "1px solid #1A1A1E", position: "sticky", top: 0, background: "#0D0D0Fdd", backdropFilter: "blur(12px)", zIndex: 20 },
  hTitle: { fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" },
  card:   { background: "#161618", borderRadius: 14, margin: "10px 14px", padding: "16px", border: "1px solid #222226" },
  btn:    { background: "#0D7A8A", color: "#fff", border: "none", borderRadius: 10, padding: "12px 20px", fontSize: 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, justifyContent: "center", fontFamily: "inherit", width: "100%" },
  btnO:   { background: "transparent", color: "#0D7A8A", border: "1px solid #0D7A8A", borderRadius: 10, padding: "10px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, justifyContent: "center", fontFamily: "inherit", width: "100%" },
  btnD:   { background: "#DC2626", color: "#fff", border: "none", borderRadius: 10, padding: "10px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  btnG:   { background: "none", border: "none", color: "#888", cursor: "pointer", padding: 6, display: "flex", alignItems: "center" },
  inp:    { background: "#1E1E22", border: "1px solid #2A2A2E", borderRadius: 8, padding: "10px 12px", color: "#E8E8EA", fontSize: 16, fontFamily: "inherit", width: "100%", boxSizing: "border-box", outline: "none" },
  inpS:   { background: "#1E1E22", border: "1px solid #2A2A2E", borderRadius: 6, padding: "7px 6px", color: "#E8E8EA", fontSize: 16, fontFamily: "inherit", width: "100%", boxSizing: "border-box", outline: "none", textAlign: "center" },
  lbl:    { fontSize: 12, color: "#777", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6, display: "block" },
  green: "#22C55E", greenBg: "#22C55E22", blue: "#0D7A8A", red: "#EF4444", orange: "#F59E0B",
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center" },
  modal:   { background: "#161618", borderRadius: "18px 18px 0 0", width: "100%", maxWidth: 480, maxHeight: "85vh", overflow: "auto", padding: "20px 16px calc(28px + env(safe-area-inset-bottom, 0px))", border: "1px solid #222226", borderBottom: "none" },
};

window.colH = { fontSize: 11, color: "#555", fontWeight: 700, textTransform: "uppercase" };
window.tBtn = { background: "#1E1E22", color: "#aaa", border: "1px solid #2A2A2E", borderRadius: 10, padding: "10px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 };
window.thS  = { padding: "8px 4px", color: "#666", fontWeight: 700, fontSize: 11, textTransform: "uppercase" };
