// ─── Stats Screen ───
const { useState: useStateSt, useEffect: useEffectSt, useRef: useRefSt } = React;
const S   = window.S;
const IC  = window.IC;
const thS = window.thS;

window.StatsScreen = function StatsScreen({ history, onBack }) {
  const [period, setPeriod]       = useStateSt('seances');
  const [metric, setMetric]       = useStateSt('charge');
  const chartRef  = useRefSt(null);
  const chartInst = useRefSt(null);
  const [goals, setGoals]         = useStateSt(() => window.load(window.SK.goals) || {});
  const [showGoalForm, setShowGoalForm] = useStateSt(false);
  const [gKg, setGKg]             = useStateSt('');
  const [gReps, setGReps]         = useStateSt('');
  const [gDate, setGDate]         = useStateSt('');

  const exNames = [...new Set(history.flatMap(h => h.exercises.map(e => e.name)))];
  const [selEx, setSelEx]         = useStateSt(exNames[0] || '');

  useEffectSt(() => { window.save(window.SK.goals, goals); }, [goals]);

  const goal = goals[selEx] || null;

  const rawData = [...history].reverse().flatMap(h =>
    h.exercises.filter(e => e.name === selEx).map(e => ({
      date: h.date,
      sets: e.sets.filter(s => s.done),
      maxKg: Math.max(0, ...e.sets.filter(s=>s.done).map(s => parseFloat(s.kg)||0)),
      vol: e.sets.filter(s=>s.done).reduce((a,s) => a+(parseFloat(s.kg)||0)*(parseFloat(s.reps)||0), 0),
    }))
  ).filter(d => d.sets.length > 0);

  function getGrouped() {
    if (period === 'seances') return rawData.map(d => ({ label: window.dateFr(d.date), maxKg: d.maxKg, vol: d.vol, sets: d.sets, date: new Date(d.date) }));
    const map = {};
    rawData.forEach(d => {
      const k = period === 'semaines' ? window.getWeekKey(d.date) : window.getMonthKey(d.date);
      if (!map[k]) map[k] = { k, entries: [] };
      map[k].entries.push(d);
    });
    return Object.values(map).map(g => ({
      label: period === 'semaines' ? new Date(g.k).toLocaleDateString('fr-FR', { day:'numeric', month:'short' }) : window.getMonthLabel(g.k),
      maxKg: Math.max(...g.entries.map(e => e.maxKg)),
      vol: g.entries.reduce((a,e) => a+e.vol, 0),
      sets: g.entries[g.entries.length-1].sets,
      count: g.entries.length,
      date: new Date(g.k),
    }));
  }

  function buildTargetCurve(grouped) {
    if (!goal || !goal.date || grouped.length === 0) return [];
    const startKg = grouped[grouped.length-1].maxKg;
    const startDate = grouped[grouped.length-1].date;
    const endDate = new Date(goal.date);
    const msPerWeek = 7*24*3600*1000;
    const totalWeeks = Math.max(1, Math.round((endDate - startDate) / msPerWeek));
    const kgPerWeek = (goal.kg - startKg) / totalWeeks;
    const pts = [];
    for (let w = 0; w <= totalWeeks; w++) {
      const d = new Date(startDate.getTime() + w * msPerWeek);
      pts.push({ date: d, kg: Math.round((startKg + kgPerWeek * w) * 100) / 100, label: d.toLocaleDateString('fr-FR', { day:'numeric', month:'short' }) });
    }
    return pts;
  }

  const grouped   = getGrouped();
  const last      = grouped[grouped.length-1];
  const prev      = grouped[grouped.length-2];
  const first     = grouped[0];
  const chargeDiff = last && prev ? last.maxKg - prev.maxKg : null;
  const volDiff    = last && prev ? Math.round((last.vol - prev.vol)/prev.vol*100) : null;
  const totalProg  = first && last && first.vol ? Math.round((last.vol - first.vol)/first.vol*100) : 0;
  const globalMaxKg = rawData.length ? Math.max(...rawData.map(d=>d.maxKg)) : 0;
  const isPR       = last && last.maxKg === globalMaxKg && globalMaxKg > 0;
  const uniqueWeeks = new Set(rawData.map(d=>window.getWeekKey(d.date))).size;
  const freqLabel  = uniqueWeeks > 0 ? (rawData.length/uniqueWeeks).toFixed(1)+'/sem' : '—';
  const maxSets    = rawData.reduce((m,d) => Math.max(m, d.sets.length), 0);
  const targetCurve = buildTargetCurve(grouped);
  const now = new Date();
  let curTarget = targetCurve.length > 0 ? targetCurve[0] : null;
  for (const t of targetCurve) { if (t.date <= now) curTarget = t; else break; }
  const nextTarget = targetCurve.find(t => t.date > now) || targetCurve[targetCurve.length-1];
  const curKg      = last ? last.maxKg : 0;
  const diff       = curTarget ? Math.round((curKg - curTarget.kg) * 100) / 100 : null;
  const ahead      = diff !== null && diff >= 0;
  const pctGoal    = goal && first ? Math.min(100, Math.round((curKg - (rawData[0]?.maxKg||0)) / (goal.kg - (rawData[0]?.maxKg||0)) * 100)) : 0;
  const deadlineLabel = goal && goal.date ? new Date(goal.date).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' }) : '';

  useEffectSt(() => {
    if (!chartRef.current || grouped.length === 0) return;
    if (chartInst.current) { chartInst.current.destroy(); chartInst.current = null; }
    const color = metric === 'charge' ? '#0D7A8A' : '#22C55E';
    const datasets = [{ data: grouped.map(d => metric==='charge' ? d.maxKg : d.vol), borderColor: color, backgroundColor: color+'22', fill: true, tension: 0.35, pointRadius: 5, pointBackgroundColor: grouped.map((d,i) => (metric==='charge' && i===grouped.length-1 && isPR) ? '#22C55E' : color), borderWidth: 2, label: 'Réel' }];
    let labels = grouped.map(d => d.label);
    if (metric === 'charge' && targetCurve.length > 0) {
      const allMap = new Map();
      grouped.forEach(d => allMap.set(d.label, { real: d.maxKg, target: null, date: d.date }));
      targetCurve.forEach(t => { if (!allMap.has(t.label)) allMap.set(t.label, { real: null, target: t.kg, date: t.date }); else allMap.get(t.label).target = t.kg; });
      const sorted = [...allMap.entries()].sort((a,b) => a[1].date - b[1].date);
      labels = sorted.map(e => e[0]); datasets[0].data = sorted.map(e => e[1].real);
      datasets.push({ data: sorted.map(e => e[1].target), borderColor: '#22C55E', borderWidth: 2, borderDash: [6,4], pointRadius: sorted.map(e => e[1].target !== null ? 3 : 0), pointBackgroundColor: '#22C55E', fill: false, tension: 0.2, label: 'Cible', spanGaps: false });
    }
    const minY = Math.min(...(grouped.map(d=>d.maxKg).filter(Boolean))) - 3;
    const maxY = goal ? Math.max(goal.kg + 5, ...grouped.map(d=>d.maxKg)) : undefined;
    chartInst.current = new Chart(chartRef.current, { type: 'line', data: { labels, datasets }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => { if (ctx.parsed.y === null) return null; return ctx.dataset.label === 'Cible' ? 'Cible: '+ctx.parsed.y+' kg' : metric==='charge' ? ctx.parsed.y+' kg' : 'Vol. '+ctx.parsed.y; }}}}, scales: { x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#666', font: { size: 10 }, maxRotation: 45 } }, y: { min: metric==='charge' ? minY : undefined, max: metric==='charge' && maxY ? maxY : undefined, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#666', font: { size: 11 }, callback: v => metric==='charge' ? v+' kg' : v } } } } });
    return () => { if (chartInst.current) { chartInst.current.destroy(); chartInst.current = null; } };
  }, [JSON.stringify(grouped), metric, JSON.stringify(goal)]);

  function saveGoal() {
    const kg = parseFloat(gKg); const reps = parseInt(gReps);
    if (!kg || !reps || !gDate) return;
    setGoals(p => ({ ...p, [selEx]: { kg, reps, date: gDate } })); setShowGoalForm(false);
  }
  function openGoalForm() {
    if (goal) { setGKg(String(goal.kg)); setGReps(String(goal.reps)); setGDate(goal.date); }
    else { setGKg(''); setGReps(''); const d=new Date(); d.setDate(d.getDate()+56); setGDate(d.toISOString().slice(0,10)); }
    setShowGoalForm(true);
  }

  const btnP = (p, lbl) => <button onClick={() => setPeriod(p)} style={{ background: period===p?'#1E1E22':'transparent', border: period===p?'1px solid #333':'1px solid transparent', borderRadius:8, padding:'5px 12px', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', color:period===p?'#fff':'#555' }}>{lbl}</button>;
  const btnM = (m, lbl, c) => <button onClick={() => setMetric(m)} style={{ background: metric===m?c+'22':'transparent', border: metric===m?'1px solid '+c:'1px solid #222', borderRadius:8, padding:'5px 12px', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', color:metric===m?c:'#555' }}>{lbl}</button>;
  const diffStyle = v => ({ fontSize:11, marginTop:2, color: v>0?'#22C55E':v<0?'#EF4444':'#F59E0B' });
  const diffText  = (v, unit) => v===null?'':(v>0?'▲ +':v<0?'▼ ':'= ')+v+unit+' vs préc.';

  return (
    <div style={S.app}>
      <div style={S.header}><button style={S.btnG} onClick={onBack}><IC.back/></button><span style={S.hTitle}>Stats</span><div style={{ width:30 }}/></div>

      {exNames.length > 0 && <div style={{ display:'flex', gap:6, padding:'12px 14px 4px', overflowX:'auto' }}>{exNames.map(n => <button key={n} onClick={() => setSelEx(n)} style={{ background:selEx===n?'#1E1E22':'transparent', border:selEx===n?'1px solid #333':'1px solid transparent', borderRadius:8, padding:'6px 14px', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', color:selEx===n?'#fff':'#555', whiteSpace:'nowrap', flexShrink:0 }}>{n}</button>)}</div>}
      {exNames.length === 0 && <div style={{ textAlign:'center', padding:60, color:'#555', fontSize:14 }}>Pas encore d'historique</div>}
      {selEx && grouped.length === 0 && <div style={{ textAlign:'center', padding:40, color:'#555', fontSize:14 }}>Pas de données pour cet exercice</div>}

      {selEx && grouped.length > 0 && (
        <div style={S.card}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, flexWrap:'wrap', gap:8 }}>
            <div style={{ display:'flex', gap:4 }}>{btnP('seances','Séances')}{btnP('semaines','Semaines')}{btnP('mois','Mois')}</div>
            <div style={{ display:'flex', gap:6 }}>{btnM('charge','Charge','#0D7A8A')}{btnM('volume','Volume','#22C55E')}</div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
            <div style={{ background:'#111113', borderRadius:10, padding:'10px 12px' }}><div style={{ fontSize:11, color:'#555', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Charge max</div><div style={{ fontSize:20, fontWeight:700 }}>{last.maxKg} kg{isPR && <span style={{ background:'#22C55E22', color:'#22C55E', fontSize:10, fontWeight:700, padding:'1px 6px', borderRadius:6, marginLeft:6 }}>PR</span>}</div>{chargeDiff !== null && <div style={diffStyle(chargeDiff)}>{diffText(chargeDiff,' kg')}</div>}</div>
            <div style={{ background:'#111113', borderRadius:10, padding:'10px 12px' }}><div style={{ fontSize:11, color:'#555', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Volume dernier</div><div style={{ fontSize:20, fontWeight:700 }}>{last.vol}</div>{volDiff !== null && <div style={diffStyle(volDiff)}>{diffText(volDiff,'%')}</div>}</div>
            <div style={{ background:'#111113', borderRadius:10, padding:'10px 12px' }}><div style={{ fontSize:11, color:'#555', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Séances / sem.</div><div style={{ fontSize:20, fontWeight:700 }}>{freqLabel}</div></div>
            <div style={{ background:'#111113', borderRadius:10, padding:'10px 12px' }}><div style={{ fontSize:11, color:'#555', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Progression vol.</div><div style={{ fontSize:20, fontWeight:700, color:totalProg>=0?'#22C55E':'#EF4444' }}>{totalProg>=0?'+':''}{totalProg}%</div><div style={{ fontSize:11, color:'#555', marginTop:2 }}>sur la période</div></div>
          </div>

          {goal && metric==='charge' && (<div style={{ display:'flex', gap:16, marginBottom:8, flexWrap:'wrap' }}><div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#888' }}><div style={{ width:20, height:2, background:'#0D7A8A', borderRadius:2 }}/> Réel</div><div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#888' }}><div style={{ width:20, borderTop:'2px dashed #22C55E' }}/> Cible</div></div>)}

          <div style={{ position:'relative', height:180, marginBottom:14 }}><canvas ref={chartRef}/></div>

          <div style={{ borderTop:'1px solid #222', paddingTop:14, marginTop:4 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <span style={{ fontSize:13, fontWeight:700, color:'#aaa', textTransform:'uppercase', letterSpacing:'0.06em' }}>Objectif</span>
              <button onClick={openGoalForm} style={{ background:'#1E1E22', border:'1px solid #2A2A2E', borderRadius:8, padding:'4px 12px', fontSize:12, color:'#aaa', cursor:'pointer', fontFamily:'inherit' }}>✎ {goal ? 'Modifier' : 'Définir'}</button>
            </div>
            {!goal && <div style={{ fontSize:13, color:'#444', textAlign:'center', padding:'16px 0' }}>Aucun objectif défini</div>}
            {goal && diff !== null && (
              <>
                <div style={{ background: ahead?'#22C55E11':'#EF444411', border:`1px solid ${ahead?'#22C55E33':'#EF444433'}`, borderRadius:10, padding:'10px 14px', marginBottom:10, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div><div style={{ fontSize:14, fontWeight:700 }}>{ahead ? 'En avance' : 'En retard'}</div><div style={{ fontSize:12, marginTop:2, color: ahead?'#22C55E':'#EF4444' }}>{diff>0?'+':''}{diff} kg vs la courbe cible</div></div>
                  <div style={{ fontSize:20, color: ahead?'#22C55E':'#EF4444' }}>{ahead?'↑':'↓'}</div>
                </div>
                {nextTarget && <div style={{ background:'#1A1A2E', border:'1px solid #2A2A3E', borderRadius:10, padding:'10px 14px', marginBottom:10 }}><div style={{ fontSize:11, color:'#555', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Prochaine séance cible</div><div style={{ fontSize:15, fontWeight:700 }}>{nextTarget.kg.toFixed(2)} kg × 4×{goal.reps} reps</div><div style={{ fontSize:12, color:'#666', marginTop:2 }}>{nextTarget.date.toLocaleDateString('fr-FR',{day:'numeric',month:'long'})} · Deadline : {deadlineLabel}</div></div>}
                <div style={{ background:'#111113', borderRadius:10, padding:'10px 14px' }}>
                  <div style={{ fontSize:11, color:'#555', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Progression vers l'objectif</div>
                  <div style={{ background:'#222', borderRadius:6, height:8, marginBottom:8, overflow:'hidden' }}><div style={{ height:'100%', borderRadius:6, width:Math.max(0,pctGoal)+'%', background: pctGoal>=100?'#22C55E':'#0D7A8A', transition:'width .5s' }}/></div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}><span style={{ color:'#aaa' }}>{curKg} kg</span><span style={{ fontWeight:700 }}>{Math.max(0,pctGoal)}%</span><span style={{ color:'#22C55E', fontWeight:600 }}>{goal.kg} kg</span></div>
                </div>
              </>
            )}
            {showGoalForm && (
              <div style={{ background:'#111113', borderRadius:10, padding:'14px', marginTop:12, border:'1px solid #222' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:10 }}>
                  <div><div style={{ fontSize:11, color:'#555', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Charge (kg)</div><input style={S.inpS} type="number" value={gKg} onChange={e=>setGKg(e.target.value)} placeholder="40"/></div>
                  <div><div style={{ fontSize:11, color:'#555', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Reps cibles</div><input style={S.inpS} type="number" value={gReps} onChange={e=>setGReps(e.target.value)} placeholder="8"/></div>
                  <div><div style={{ fontSize:11, color:'#555', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Date limite</div><input style={{ ...S.inpS, fontSize:11 }} type="date" value={gDate} onChange={e=>setGDate(e.target.value)}/></div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button style={{ ...S.btn, flex:1 }} onClick={saveGoal}>Enregistrer</button>
                  <button style={{ ...S.btnO, flex:1, color:'#888', borderColor:'#333' }} onClick={()=>setShowGoalForm(false)}>Annuler</button>
                  {goal && <button style={{ ...S.btnG, color:'#EF4444', border:'1px solid #991B1B', borderRadius:10, padding:'8px 12px' }} onClick={()=>{ setGoals(p=>{const n={...p};delete n[selEx];return n;}); setShowGoalForm(false); }}>Suppr.</button>}
                </div>
              </div>
            )}
          </div>

          <div style={{ overflowX:'auto', marginTop:14 }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <thead><tr style={{ borderBottom:'1px solid #222' }}>
                <th style={{ ...thS, textAlign:'left', minWidth:56 }}>Date</th>
                {Array.from({ length:maxSets }, (_,i) => <th key={i} style={{ ...thS, textAlign:'center', minWidth:60 }}>S{i+1}</th>)}
                <th style={{ ...thS, textAlign:'center', minWidth:44 }}>Vol.</th>
                <th style={{ ...thS, textAlign:'center', minWidth:54 }}>vs préc.</th>
              </tr></thead>
              <tbody>
                {[...rawData].reverse().map((d,i,arr) => {
                  const prevD = arr[i+1];
                  const vd = prevD ? Math.round((d.vol-prevD.vol)/prevD.vol*100) : null;
                  const vc = vd===null?'#555':vd>0?'#22C55E':vd<0?'#EF4444':'#F59E0B';
                  const vt = vd===null?'—':(vd>0?'▲ +':vd<0?'▼ ':'= ')+vd+'%';
                  return (<tr key={i} style={{ borderBottom:'1px solid #1A1A1E' }}>
                    <td style={{ padding:'9px 4px 9px 0', color:'#aaa', fontSize:12, whiteSpace:'nowrap' }}>{window.dateFr(d.date)}</td>
                    {Array.from({ length:maxSets }, (_,si) => { const s = d.sets[si]; return <td key={si} style={{ padding:'9px 4px', textAlign:'center', fontWeight:600, color:s?'#E8E8EA':'#333' }}>{s?(s.kg?s.kg+'×':'')+s.reps:'—'}</td>; })}
                    <td style={{ padding:'9px 4px', textAlign:'center', color:'#666', fontSize:12 }}>{d.vol}</td>
                    <td style={{ padding:'9px 4px', textAlign:'center', color:vc, fontSize:12, fontWeight:700 }}>{vt}</td>
                  </tr>);
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
