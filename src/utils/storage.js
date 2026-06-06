// ─── Storage ───
window.SK = {
  exercises: "emom-exlib",
  routines: "emom-routines2",
  history: "emom-history2",
  draft: "emom-draft",
  goals: "emom-goals",
  profile: "emom-profile"
};

window.load = function(k) {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; }
};

window.save = function(k, v) {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) { console.error(e); }
};
