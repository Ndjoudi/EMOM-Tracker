// ─── Exercise Library Screen ───
const { useState: useStateExLib } = React;
const S   = window.S;
const IC  = window.IC;

window.ExLibScreen = function ExLibScreen({ exLib, setExLib, history, onBack }) {
  const [showAdd, setShowAdd]   = useStateExLib(false);
  const [editEx, setEditEx]     = useStateExLib(null);
  const [name, setName]         = useStateExLib("");
  const [rm, setRm]             = useStateExLib("");
  const [showHist, setShowHist] = useStateExLib(null);

  const Modal          = window.Modal;
  const ExHistoryTable = window.ExHistoryTable;

  return (
    <div style={S.app}>
      <div style={S.header}>
        <button style={S.btnG} onClick={onBack}><IC.back/></button>
        <span style={S.hTitle}>Mes Exercices</span>
        <button style={{ ...S.btnG, color: S.blue }} onClick={() => { setName(""); setRm(""); setShowAdd(true); }}><IC.plus/></button>
      </div>

      {exLib.length === 0 && <div style={{ textAlign: "center", padding: 50, color: "#555", fontSize: 14 }}>Aucun exercice. Appuie sur +</div>}

      {exLib.map((ex) => (
        <div key={ex.id} style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{ex.name}</div>
                {ex.bodyweight && <span style={{ background: '#0D7A8A22', color: '#0D7A8A', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5 }}>PdC</span>}
              </div>
              {ex.rm && <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}><span style={{ fontSize: 12, color: "#888" }}>1RM: {ex.rm}kg</span>{window.calcP(Number(ex.rm)).map((v, i) => <span key={i} style={{ fontSize: 11, color: "#8B8BFF" }}>{window.pcts[i]}%:{v}</span>)}</div>}
            </div>
            <div style={{ display: "flex", gap: 2 }}>
              <button style={S.btnG} onClick={() => setShowHist(ex.name)}><IC.hist/></button>
              <button style={S.btnG} onClick={() => setEditEx({ ...ex })}><IC.edit/></button>
              <button style={{ ...S.btnG, color: S.red }} onClick={() => setExLib((p) => p.filter((e) => e.id !== ex.id))}><IC.trash/></button>
            </div>
          </div>
        </div>
      ))}

      {showAdd && <Modal onClose={() => setShowAdd(false)}>
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Nouvel exercice</div>
        <label style={S.lbl}>Nom</label>
        <input style={S.inp} placeholder="Ex: Élévation latérale" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        <div style={{ height: 12 }}/>
        <label style={S.lbl}>1RM (kg) — optionnel</label>
        <input style={S.inp} type="number" placeholder="85" value={rm} onChange={(e) => setRm(e.target.value)}/>
        <div style={{ height: 12 }}/>
        <button onClick={() => setShowAdd(p => ({ ...p, bw: !p.bw }))} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: '100%' }}>
          <div style={{ width: 36, height: 20, borderRadius: 10, background: showAdd.bw ? S.blue : '#333', transition: 'background .2s', position: 'relative', flexShrink: 0 }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: showAdd.bw ? 18 : 2, transition: 'left .2s' }}/>
          </div>
          <span style={{ fontSize: 14, color: '#aaa' }}>Poids de corps (dips, tractions…)</span>
        </button>
        <div style={{ height: 16 }}/>
        <button style={S.btn} onClick={() => { if (!name.trim()) return; setExLib((p) => [...p, { id: window.uid(), name: name.trim(), rm, bodyweight: !!showAdd.bw }]); setShowAdd(false); }}>Ajouter</button>
      </Modal>}

      {editEx && <Modal onClose={() => setEditEx(null)}>
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Modifier</div>
        <label style={S.lbl}>Nom</label>
        <input style={S.inp} value={editEx.name} onChange={(e) => setEditEx({ ...editEx, name: e.target.value })}/>
        <div style={{ height: 12 }}/>
        <label style={S.lbl}>1RM (kg)</label>
        <input style={S.inp} type="number" value={editEx.rm} onChange={(e) => setEditEx({ ...editEx, rm: e.target.value })}/>
        <div style={{ height: 12 }}/>
        <button onClick={() => setEditEx(p => ({ ...p, bodyweight: !p.bodyweight }))} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: '100%', marginBottom: 16 }}>
          <div style={{ width: 36, height: 20, borderRadius: 10, background: editEx.bodyweight ? S.blue : '#333', transition: 'background .2s', position: 'relative', flexShrink: 0 }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: editEx.bodyweight ? 18 : 2, transition: 'left .2s' }}/>
          </div>
          <span style={{ fontSize: 14, color: '#aaa' }}>Poids de corps</span>
        </button>
        <button style={S.btn} onClick={() => { setExLib((p) => p.map((e) => e.id === editEx.id ? editEx : e)); setEditEx(null); }}>Sauver</button>
      </Modal>}

      {showHist && <Modal onClose={() => setShowHist(null)}><ExHistoryTable exName={showHist} history={history} onClose={() => setShowHist(null)}/></Modal>}
    </div>
  );
};
