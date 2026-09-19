// ─── Home Screen ───
const { useState } = React;
const S  = window.S;
const IC = window.IC;

const ROUTINE_COLORS = ['#0D7A8A','#22C55E','#F59E0B','#EF4444','#8B5CF6','#EC4899','#14B8A6','#F97316'];

window.HomeScreen = function HomeScreen({ routines, history, exLib, resumeDraft, onStartWorkout, onEditRoutine, onNewRoutine, onNavigate, onResumeDraft, onClearDraft, circuits, onStartCircuit, onEditCircuit, onNewCircuit }) {
  const [preWo, setPreWo] = useState(null); // routine en attente
  const [preSleep, setPreSleep] = useState(null);
  const [preNutrition, setPreNutrition] = useState(null);
  const routineNameColorMap = {};
  routines.forEach((r, i) => { routineNameColorMap[r.name] = ROUTINE_COLORS[i % ROUTINE_COLORS.length]; });

  const today = new Date(); today.setHours(0,0,0,0);
  const dayMap = {};
  history.forEach(h => {
    const d = new Date(h.date); d.setHours(0,0,0,0);
    const diff = Math.floor((today - d) / 86400000);
    if (diff >= 0 && diff < 90) { const key = d.toISOString().slice(0,10); dayMap[key] = routineNameColorMap[h.routineName] || '#0D7A8A'; }
  });
  const days90 = Array.from({ length: 90 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() - (89 - i));
    const key = d.toISOString().slice(0,10);
    return { key, color: dayMap[key] || null, isToday: i === 89 };
  });

  // Streak
  const trainedDays = new Set(history.map(h => { const d = new Date(h.date); d.setHours(0,0,0,0); return d.toISOString().slice(0,10); }));
  let currentStreak = 0, longestStreak = 0;
  const thisWeekMon = (() => { const d = new Date(today); const day = d.getDay()||7; d.setDate(d.getDate()-day+1); return d; })();
  let w = 0;
  while (w <= 52) {
    const monD = new Date(thisWeekMon); monD.setDate(thisWeekMon.getDate() - w*7);
    let found = false;
    for (let i=0; i<=6; i++) { const dd = new Date(monD); dd.setDate(monD.getDate()+i); if (trainedDays.has(dd.toISOString().slice(0,10))) { found=true; break; } }
    if (!found && w > 0) break;
    if (found) currentStreak++; else break;
    w++;
  }
  const allWeeks = [...new Set([...trainedDays].map(k => { const d = new Date(k); const day=d.getDay()||7; d.setDate(d.getDate()-day+1); return d.toISOString().slice(0,10); }))].sort();
  let ls=0, prev2=null;
  allWeeks.forEach(wk => {
    if (!prev2) ls=1; else { const diff=(new Date(wk)-new Date(prev2))/(7*86400000); ls=diff<=1?ls+1:1; }
    if (ls>longestStreak) longestStreak=ls; prev2=wk;
  });

  return (
    <div style={S.app}>
      <div style={S.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}><IC.dumbbell/><span style={S.hTitle}>EMOM Tracker</span></div>
        <div style={{ display: "flex", gap: 4 }}>
          <button style={{ ...S.btnG, color: "#aaa" }} onClick={() => onNavigate("transfer")}><IC.transfer/></button>
          <button style={{ ...S.btnG, color: S.blue }} onClick={() => onNavigate("coach")}><IC.brain/></button>
          <button style={{ ...S.btnG, color: "#aaa" }} onClick={() => onNavigate("stats")}><IC.chartBar/></button>
          <button style={{ ...S.btnG, color: "#aaa" }} onClick={() => onNavigate("exLib")}><IC.lib/></button>
          <button style={{ ...S.btnG, color: "#aaa" }} onClick={() => onNavigate("history")}><IC.hist/></button>
          <button style={{ ...S.btnG, color: "#aaa" }} onClick={() => onNavigate("profile")}><IC.user/></button>
        </div>
      </div>

      {history.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, padding: '12px 14px 4px' }}>
          <div style={{ background: '#161618', borderRadius: 10, padding: '10px 8px', textAlign: 'center', border: currentStreak >= 3 ? '1px solid #22C55E44' : '1px solid #222' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: currentStreak >= 3 ? '#22C55E' : '#E8E8EA' }}>{currentStreak} 🔥</div>
            <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>Sem. consécutives</div>
          </div>
          <div style={{ background: '#161618', borderRadius: 10, padding: '10px 8px', textAlign: 'center', border: '1px solid #222' }}>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{longestStreak}</div>
            <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>Record streak</div>
          </div>
          <div style={{ background: '#161618', borderRadius: 10, padding: '10px 8px', textAlign: 'center', border: '1px solid #222' }}>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{history.length}</div>
            <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>Séances totales</div>
          </div>
        </div>
      )}

      <div style={{ margin: "8px 14px 4px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em" }}>Calendrier</span>
          <span style={{ fontSize: 11, color: "#444" }}>{Object.keys(dayMap).length} séances / 90j</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(18, 1fr)", gap: 3 }}>
          {days90.map((d, i) => <div key={i} style={{ aspectRatio: "1", borderRadius: 4, background: d.color || "#1E1E22", border: d.isToday ? "1.5px solid #fff" : "none", opacity: d.color ? 1 : 0.6 }}/>)}
        </div>
        {routines.length > 0 && (
          <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
            {routines.map((r, i) => <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: ROUTINE_COLORS[i % ROUTINE_COLORS.length], flexShrink: 0 }}/><span style={{ fontSize: 11, color: "#555" }}>{r.name || "Sans nom"}</span></div>)}
          </div>
        )}
      </div>

      {resumeDraft && (
        <div style={{ background: "#1A1A2E", border: "1px solid #2A2A3E", borderRadius: 14, margin: "10px 14px", padding: "14px 16px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Séance non terminée</div>
          <div style={{ fontSize: 13, color: "#666", marginBottom: 12 }}>{resumeDraft.routineName}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ ...S.btn, flex: 1 }} onClick={onResumeDraft}>Reprendre</button>
            <button style={{ ...S.btnO, flex: 1, color: "#888", borderColor: "#333" }} onClick={onClearDraft}>Supprimer</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, padding: "14px 14px 4px" }}>
        <button onClick={() => onNavigate("exLib")} style={{ background: "#1E1E22", border: "1px solid #2A2A2E", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, color: "#aaa", cursor: "pointer", fontFamily: "inherit" }}>Mes Exercices ({exLib.length})</button>
      </div>

      <div style={{ padding: "12px 14px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: "#aaa" }}>Mes Routines</span>
        <button style={{ ...S.btnG, color: S.blue }} onClick={onNewRoutine}><IC.plus/></button>
      </div>

      {routines.length === 0 && <div style={{ ...S.card, textAlign: "center", padding: 40, color: "#555" }}><div style={{ marginBottom: 12, opacity: 0.5 }}><IC.dumbbell/></div><div style={{ fontSize: 14 }}>Aucune routine</div></div>}

      {routines.map((r) => (
        <div key={r.id} style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div><div style={{ fontSize: 16, fontWeight: 700 }}>{r.name || "Sans nom"}</div><div style={{ fontSize: 13, color: "#666", marginTop: 2 }}>{r.exerciseRefs.length} exercice{r.exerciseRefs.length > 1 ? "s" : ""}</div></div>
            <button style={S.btnG} onClick={() => onEditRoutine(r)}><IC.edit/></button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
            {r.exerciseRefs.map((ref, i) => { const ex = exLib.find((e) => e.id === ref.exId); return <span key={i} style={{ background: "#1E1E22", borderRadius: 6, padding: "4px 10px", fontSize: 12, color: "#999" }}>{ex ? ex.name : "?"}</span>; })}
          </div>
          <button style={S.btn} onClick={() => { setPreWo(r); setPreSleep(null); setPreNutrition(null); }}><IC.play/> Lancer</button>
        </div>
      ))}

      <div style={{ padding: "12px 14px" }}>
        <button style={S.btnO} onClick={onNewRoutine}><IC.plus/> Nouvelle routine</button>
      </div>

      {/* ── Circuits ── */}
      <div style={{ padding: "12px 14px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: "#aaa" }}>Mes Circuits</span>
        <div style={{display:'flex',gap:6}}>
          <button style={{...S.btnG,color:'#aaa',fontSize:12,padding:'6px 10px'}} onClick={()=>onNavigate('circuitHistory')}><IC.hist/></button>
          <button style={{ ...S.btnG, color: '#F59E0B' }} onClick={onNewCircuit}><IC.plus/></button>
        </div>
      </div>

      {(!circuits || circuits.length === 0) && (
        <div style={{ ...S.card, textAlign: "center", padding: 32, color: "#555" }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>⚡</div>
          <div style={{ fontSize: 14 }}>Aucun circuit</div>
          <div style={{ fontSize: 12, color: '#444', marginTop: 4 }}>Un circuit enchaîne plusieurs exos sur 1 min chacun</div>
        </div>
      )}

      {(circuits||[]).map(c => (
        <div key={c.id} style={{ ...S.card, borderColor: '#F59E0B22' }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:13, background:'#F59E0B22', color:'#F59E0B', borderRadius:6, padding:'2px 8px', fontWeight:700 }}>⚡ Circuit</span>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{c.name}</div>
              </div>
              <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>{c.exos.length} exo{c.exos.length>1?'s':''} · {c.exos.length} min/série · repos {Math.floor((c.restSec||90)/60)}m{(c.restSec||90)%60>0?((c.restSec||90)%60)+'s':''}</div>
            </div>
            <button style={S.btnG} onClick={() => onEditCircuit(c)}><IC.edit/></button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
            {c.exos.map((ex,i) => <span key={i} style={{ background: "#1E1E22", borderRadius: 6, padding: "4px 10px", fontSize: 12, color: "#999" }}>{ex.name}</span>)}
          </div>
          <button style={{ ...S.btn, background: '#F59E0B', borderColor: '#F59E0B' }} onClick={() => onStartCircuit(c)}>
            <IC.play/> Lancer
          </button>
        </div>
      ))}

      <div style={{ padding: "12px 14px 32px" }}>
        <button style={{ ...S.btnO, borderColor:'#F59E0B44', color:'#F59E0B' }} onClick={onNewCircuit}><IC.plus/> Nouveau circuit</button>
      </div>

      {preWo && (
        <div style={S.overlay} onClick={e=>{ if(e.target===e.currentTarget){ setPreWo(null); } }}>
          <div style={S.modal}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
              <div>
                <div style={{ fontSize:17, fontWeight:700 }}>Avant de commencer</div>
                <div style={{ fontSize:12, color:'#555', marginTop:2 }}>{preWo.name}</div>
              </div>
              <button style={S.btnG} onClick={()=>setPreWo(null)}><IC.close/></button>
            </div>

            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:12, color:'#555', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Sommeil cette nuit</div>
              <div style={{ display:'flex', gap:6 }}>
                {[['😴','< 6h'],['😐','6-7h'],['😊','7-8h'],['💪','8h+']].map(([emoji,label],i)=>(
                  <button key={i} onClick={()=>setPreSleep(i)} style={{ flex:1, background:preSleep===i?'#0D7A8A33':'#111113', border:`1px solid ${preSleep===i?'#0D7A8A':'#222'}`, borderRadius:8, padding:'10px 4px', cursor:'pointer', fontFamily:'inherit', display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                    <span style={{ fontSize:20 }}>{emoji}</span>
                    <span style={{ fontSize:10, color:preSleep===i?'#0D7A8A':'#555', fontWeight:600 }}>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom:22 }}>
              <div style={{ fontSize:12, color:'#555', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Nutrition aujourd'hui</div>
              <div style={{ display:'flex', gap:6 }}>
                {[['😕','Légère'],['😐','Correcte'],['💪','Optimale']].map(([emoji,label],i)=>(
                  <button key={i} onClick={()=>setPreNutrition(i)} style={{ flex:1, background:preNutrition===i?'#0D7A8A33':'#111113', border:`1px solid ${preNutrition===i?'#0D7A8A':'#222'}`, borderRadius:8, padding:'10px 4px', cursor:'pointer', fontFamily:'inherit', display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                    <span style={{ fontSize:20 }}>{emoji}</span>
                    <span style={{ fontSize:10, color:preNutrition===i?'#0D7A8A':'#555', fontWeight:600 }}>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {preSleep!==null&&preNutrition!==null ? (
              <button style={S.btn} onClick={()=>{ onStartWorkout(preWo,{sleep:preSleep,nutrition:preNutrition}); setPreWo(null); }}><IC.play/> C'est parti !</button>
            ) : (
              <button style={{ ...S.btn, opacity:0.4 }} disabled><IC.play/> Renseigne les 2 champs</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
