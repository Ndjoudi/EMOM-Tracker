// ─── Exercise History Table ───
const S    = window.S;
const IC   = window.IC;
const thS  = window.thS;

window.ExHistoryTable = function ExHistoryTable({ exName, history, onClose }) {
  const entries = window.getExHist(history, exName);
  const maxSets = entries.reduce((m, e) => Math.max(m, e.sets.filter((s) => s.done).length), 0);
  // Un exo pyramide ne remplit pas `sets` : son historique vit dans les grilles
  const pyEntries = entries.filter((e) => e.pyramid && e.pyGrid && e.pyGrid.length);
  const isPyramid = pyEntries.length > 0;

  if (isPyramid) {
    const totalOf = (g) => g.flat().reduce((a, v) => a + (parseInt(v) || 0), 0);
    return (
      <>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 17, fontWeight: 700 }}>{exName}</div>
            <span style={{ fontSize: 10, background: "#F59E0B22", color: S.orange, borderRadius: 4, padding: "1px 6px", fontWeight: 700 }}>PYRAMIDE</span>
          </div>
          <button style={S.btnG} onClick={onClose}><IC.close/></button>
        </div>
        <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
          {pyEntries.map((entry, ei) => {
            const prev  = pyEntries[ei + 1];
            const total = totalOf(entry.pyGrid);
            const pTot  = prev ? totalOf(prev.pyGrid) : null;
            const delta = pTot ? Math.round((total - pTot) / pTot * 100) : null;
            return (
              <div key={ei} style={{ marginBottom: 16, paddingBottom: 12, borderBottom: ei < pyEntries.length - 1 ? "1px solid #1E1E22" : "none" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "#aaa", fontWeight: 600 }}>{window.dateFr(entry.date)}</span>
                  <span style={{ fontSize: 11, color: "#555" }}>{entry.pyGrid.length}×{entry.pyGrid[0] ? entry.pyGrid[0].length : 0} · {total} reps</span>
                  {delta !== null && <span style={{ fontSize: 11, fontWeight: 700, color: delta > 0 ? "#22C55E" : delta < 0 ? "#EF4444" : "#F59E0B" }}>{delta > 0 ? "▲" : delta < 0 ? "▼" : "="}{Math.abs(delta)}%</span>}
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ borderCollapse: "separate", borderSpacing: "3px" }}>
                    <tbody>
                      {entry.pyGrid.map((row, r) => (
                        <tr key={r}>
                          <td style={{ fontSize: 11, fontWeight: 700, color: "#555", paddingRight: 4 }}>{r + 1}</td>
                          {row.map((v, c) => {
                            const cur = parseInt(v) || 0;
                            const p   = prev && prev.pyGrid[r] ? parseInt(prev.pyGrid[r][c]) || 0 : null;
                            const col = !cur ? "#444" : p === null || p === 0 ? "#E8E8EA" : cur > p ? "#22C55E" : cur === p ? "#F59E0B" : "#EF4444";
                            return (
                              <td key={c} style={{ padding: 0 }}>
                                <div style={{ background: cur ? "#1E1E22" : "transparent", border: "1px solid " + (cur ? "#2A2A2E" : "#1A1A1E"), borderRadius: 6, padding: "5px 4px", textAlign: "center", fontSize: 13, fontWeight: 700, color: col, minWidth: 36 }}>{v || "—"}</div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 4, justifyContent: "center" }}>
          <span style={{ fontSize: 11, color: window.perfC.up }}>▲ Progression</span>
          <span style={{ fontSize: 11, color: window.perfC.same }}>= Stable</span>
          <span style={{ fontSize: 11, color: window.perfC.down }}>▼ Régression</span>
        </div>
      </>
    );
  }

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
