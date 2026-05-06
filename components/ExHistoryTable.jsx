// ─── Exercise History Table ───
const S    = window.S;
const IC   = window.IC;
const thS  = window.thS;

window.ExHistoryTable = function ExHistoryTable({ exName, history, onClose }) {
  const entries = window.getExHist(history, exName);
  const maxSets = entries.reduce((m, e) => Math.max(m, e.sets.filter((s) => s.done).length), 0);
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 17, fontWeight: 700 }}>{exName}</div>
        <button style={S.btnG} onClick={onClose}><IC.close/></button>
      </div>
      {entries.length === 0 && <div style={{ color: "#555", textAlign: "center", padding: 30, fontSize: 14 }}>Aucun historique</div>}
      {entries.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr style={{ borderBottom: "2px solid #2A2A2E" }}>
              <th style={{ ...thS, textAlign: "left", minWidth: 60 }}>Date</th>
              {Array.from({ length: maxSets }, (_, i) => <th key={i} style={{ ...thS, textAlign: "center", minWidth: 70 }}>S{i + 1}</th>)}
              <th style={{ ...thS, textAlign: "center", minWidth: 36 }}></th>
            </tr></thead>
            <tbody>
              {entries.map((entry, ei) => {
                const prev = entries[ei + 1];
                const done = entry.sets.filter((s) => s.done);
                const prevDone = prev ? prev.sets.filter((s) => s.done) : [];
                const sessionPerf = prev ? window.getSessionPerf(done, prevDone) : "neutral";
                return (
                  <tr key={ei} style={{ borderBottom: "1px solid #1E1E22" }}>
                    <td style={{ padding: "10px 4px 10px 0", color: "#aaa", fontSize: 12, whiteSpace: "nowrap" }}>{window.dateFr(entry.date)}</td>
                    {Array.from({ length: maxSets }, (_, si) => {
                      const s = done[si]; const ps = prevDone[si];
                      const p = s ? window.perf(s, ps) : "neutral";
                      return (<td key={si} style={{ padding: "10px 4px", textAlign: "center" }}>
                        {s ? (<div><div style={{ color: "#E8E8EA", fontWeight: 600 }}>{s.kg ? s.kg + "×" : ""}{s.reps}</div>{ps && <div style={{ color: window.perfC[p], fontSize: 11, fontWeight: 700, marginTop: 2 }}>{window.perfI[p]}</div>}</div>) : <span style={{ color: "#333" }}>—</span>}
                      </td>);
                    })}
                    <td style={{ padding: "10px 0", textAlign: "center" }}><span style={{ fontSize: 13, color: window.perfC[sessionPerf], fontWeight: 800 }}>{window.perfI[sessionPerf]}</span></td>
                  </tr>);
              })}
            </tbody>
          </table>
        </div>
      )}
      {entries.length > 0 && (<div style={{ display: "flex", gap: 14, marginTop: 14, justifyContent: "center" }}>
        <span style={{ fontSize: 11, color: window.perfC.up }}>▲ Progression</span>
        <span style={{ fontSize: 11, color: window.perfC.same }}>= Stable</span>
        <span style={{ fontSize: 11, color: window.perfC.down }}>▼ Régression</span>
      </div>)}
    </>
  );
};
