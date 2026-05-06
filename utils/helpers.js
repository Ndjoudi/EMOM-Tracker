// ─── Utils généraux ───
window.uid    = () => Math.random().toString(36).slice(2, 10);
window.fmt    = (s) => { const m = Math.floor(s / 60); const sec = s % 60; return `${m.toString().padStart(2,"0")}:${sec.toString().padStart(2,"0")}`; };
window.pcts   = [60, 65, 70, 75];
window.calcP  = (rm) => window.pcts.map((p) => Math.round((rm * p) / 100));
window.dateFr = (ts) => new Date(ts).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
window.dateFrY= (ts) => new Date(ts).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

// ─── Comparaison de performance ───
window.perf = function(cur, prev) {
  if (!prev || !cur) return "neutral";
  const ck = parseFloat(cur.kg) || 0, cr = parseFloat(cur.reps) || 0;
  const pk = parseFloat(prev.kg) || 0, pr = parseFloat(prev.reps) || 0;
  if (ck === 0 && pk === 0) { if (cr > pr) return "up"; if (cr < pr) return "down"; return "same"; }
  if (ck === pk) { if (cr > pr) return "up"; if (cr < pr) return "down"; return "same"; }
  const cv = ck * cr, pv = pk * pr;
  if (cv > pv) return "up"; if (cv < pv) return "down"; return "same";
};
window.perfI = { up: "▲", down: "▼", same: "=", neutral: "" };
window.perfC = { up: "#22C55E", down: "#EF4444", same: "#F59E0B", neutral: "#555" };

// ─── Helpers workout ───
window.dcw = function(w) { return { ...w, exercises: w.exercises.map((e) => ({ ...e, sets: e.sets.map((s) => ({ ...s })) })) }; };
window.fnu = function(ex) { if (!ex) return 0; const i = ex.sets.findIndex((s) => !s.done); return i >= 0 ? i : 0; };
window.getLastPerf = function(h, n, si) {
  for (const x of h) for (const e of x.exercises) if (e.name === n && e.sets[si] && e.sets[si].done) return e.sets[si];
  return null;
};
window.getExHist = function(h, n) {
  const r = [];
  for (const x of h) for (const e of x.exercises) if (e.name === n) r.push({ date: x.date, routineName: x.routineName, sets: e.sets, rm: e.rm });
  return r;
};
window.getSessionPerf = function(curSets, prevSets) {
  if (!prevSets || prevSets.length === 0) return "neutral";
  let better = 0, worse = 0;
  const len = Math.max(curSets.length, prevSets.length);
  for (let i = 0; i < len; i++) {
    const p = window.perf(curSets[i], prevSets[i]);
    if (p === "up") better++; if (p === "down") worse++;
  }
  if (better > worse) return "up"; if (worse > better) return "down";
  if (better === 0 && worse === 0) return "same"; return "same";
};

// ─── Helpers stats ───
window.getWeekKey = function(ts) {
  const d = new Date(ts); const day = d.getDay() || 7;
  const mon = new Date(d); mon.setDate(d.getDate() - day + 1);
  return mon.toISOString().slice(0, 10);
};
window.getMonthKey = function(ts) {
  const d = new Date(ts);
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0');
};
window.getMonthLabel = function(key) {
  const [y, m] = key.split('-');
  return new Date(y, m-1).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
};
