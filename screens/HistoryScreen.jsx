// ─── History Screen ───
const { useState: useStateHist } = React;
const S  = window.S;
const IC = window.IC;

window.HistoryScreen = function HistoryScreen({ history, routines, onBack, onUpdate, onDelete }) {
  const Modal = window.Modal;
  const [editId, setEditId]           = useStateHist(null);
  const [editD, setEditD]             = useStateHist(null);
  const [delId, setDelId]             = useStateHist(null);
  const [filterRoutine, setFilterRoutine] = useStateHist('all');
  const [filterPeriod, setFilterPeriod]   = useStateHist('all');

  const startE = (h) => { setEditD(JSON.parse(JSON.stringify(h))); setEditId(h.id); };
  const saveE  = () => { if (editD) onUpdate(editD.id, editD); setEditId(null); setEditD(null); };
  const upES   = (ei, si, f, v) => { setEditD((p) => { const n = JSON.parse(JSON.stringify(p)); n.exercises[ei].sets[si][f] = v; return n; }); };

  const routineNames = [...new Set(history.map(h => h.routineName))];
  const now = new Date(); now.setHours(0,0,0,0);

  const filtered = history.filter(h => {
    if (filterRoutine !== 'all' && h.routineName !== filterRoutine) return false;
    if (filterPeriod === '7j')  { const d = new Date(h.date); d.setHours(0,0,0,0); return (now - d) <= 7*86400000; }
    if (filterPeriod === '30j') { const d = new Date(h.date); d.setHours(0,0,0,0); return (now - d) <= 30*86400000; }
    if (filterPeriod === '90j') { const d = new Date(h.date); d.setHours(0,0,0,0); return (now - d) <= 90*86400000; }
    return true;
  });

  const fBtnStyle = (active) => ({ background: active ? '#1E1E22' : 'transparent', border: active ? '1px solid #333' : '1px solid transparent', borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: active ? '#fff' : '#555', whiteSpace: 'nowrap' });

  return (
    <div style={S.app}>
      <div style={S.header}>
        <button style={S.btnG} onClick={onBack}><IC.back/></button>
        <span style={S.hTitle}>Historique</span>
        <span style={{ fontSize: 12, color: '#555' }}>{filtered.length} séance{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      <div style={{ padding: '10px 14px 4px' }}>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 8 }}>
          {['all','7j','30j','90j'].map(p => <button key={p} style={fBtnStyle(filterPeriod === p)} onClick={() => setFilterPeriod(p)}>{p === 'all' ? 'Tout' : p}</button>)}
        </div>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
          <button style={fBtnStyle(filterRoutine === 'all')} onClick={() => setFilterRoutine('all')}>Toutes</button>
          {routineNames.map(n => <button key={n} style={fBtnStyle(filterRoutine === n)} onClick={() => setFilterRoutine(n)}>{n}</button>)}
        </div>
      </div>

      {filtered.length === 0 && <div style={{ textAlign: "center", padding: 60, color: "#555" }}><div style={{ marginBottom: 8 }}><IC.hist/></div><div style={{ fontSize: 14 }}>Aucune séance trouvée</div></div>}

      {filtered.map((h) => { const editing = editId === h.id; const d = editing ? editD : h; return (
        <div key={h.id} style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div><div style={{ fontSize: 15, fontWeight: 700 }}>{d.routineName}</div><div style={{ fontSize: 12, color: S.blue }}>{window.fmt(Math.floor(d.duration / 1000))}</div></div>
            <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
              <span style={{ fontSize: 12, color: "#666", marginRight: 4 }}>{window.dateFrY(d.date)}</span>
              {!editing && <button style={S.btnG} onClick={() => startE(h)}><IC.edit/></button>}
              {!editing && <button style={{ ...S.btnG, color: S.red }} onClick={() => setDelId(h.id)}><IC.trash/></button>}
            </div>
          </div>
          {d.exercises.map((ex, ei) => (
            <div key={ei} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#aaa", marginBottom: 4 }}>{ex.name}</div>
              {editing
                ? <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{ex.sets.map((s, si) => <div key={si} style={{ display: "flex", gap: 8, alignItems: "center" }}><span style={{ fontSize: 12, color: "#555", width: 18 }}>{si + 1}</span><input style={{ ...S.inpS, width: 64 }} type="number" value={s.kg} onChange={(e) => upES(ei, si, "kg", e.target.value)}/><span style={{ color: "#444", fontSize: 12 }}>×</span><input style={{ ...S.inpS, width: 64 }} type="number" value={s.reps} onChange={(e) => upES(ei, si, "reps", e.target.value)}/></div>)}</div>
                : <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{ex.sets.filter((s) => s.done).map((s, j) => <span key={j} style={{ background: "#1E1E22", borderRadius: 6, padding: "3px 10px", fontSize: 13, color: "#ccc" }}>{s.kg ? s.kg + "×" : ""}{s.reps}</span>)}{ex.sets.filter((s) => s.done).length === 0 && <span style={{ fontSize: 12, color: "#444" }}>—</span>}</div>}
            </div>
          ))}
          {editing && <div style={{ display: "flex", gap: 8, marginTop: 10 }}><button style={{ ...S.btn, flex: 1 }} onClick={saveE}>Sauver</button><button style={{ ...S.btnO, flex: 1, color: "#888", borderColor: "#333" }} onClick={() => { setEditId(null); setEditD(null); }}>Annuler</button></div>}
        </div>
      ); })}

      {delId && <Modal onClose={() => setDelId(null)}>
        <div style={{ textAlign: "center", padding: "10px 0" }}>
          <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 12 }}>Supprimer ?</div>
          <div style={{ fontSize: 14, color: "#888", marginBottom: 20 }}>Action irréversible.</div>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={{ ...S.btnO, flex: 1, color: "#888", borderColor: "#333" }} onClick={() => setDelId(null)}>Annuler</button>
            <button style={{ ...S.btnD, flex: 1 }} onClick={() => { onDelete(delId); setDelId(null); }}>Supprimer</button>
          </div>
        </div>
      </Modal>}
    </div>
  );
};
