// ─── Recap Screen ───
const { useState: useStateRecap } = React;
const S  = window.S;
const IC = window.IC;

window.RecapScreen = function RecapScreen({ data, history, profile, onHome, onSaveProfile }) {
  const { wo, entry } = data;
  const [fatigue, setFatigue]           = useStateRecap(null);
  const [showAnalysis, setShowAnalysis] = useStateRecap(false);
  const [sleep, setSleep]               = useStateRecap(null);
  const [nutrition, setNutrition]       = useStateRecap(null);
  const fmt2 = (ms) => { const s = Math.floor(ms/1000); const m = Math.floor(s/60); const sec = s%60; return m+'m'+sec.toString().padStart(2,'0')+'s'; };

  const fatigueLabels = ['Frais', 'Normal', 'Fatigué', 'Très fatigué', 'Épuisé'];
  const fatigueColors = ['#22C55E', '#0D7A8A', '#F59E0B', '#F97316', '#EF4444'];
  const fatigueEmojis = ['💪', '😐', '😓', '😮‍💨', '💀'];

  const exStats = entry.exercises.map(ex => {
    const doneSets     = ex.sets.filter(s => s.done);
    const allCompleted = doneSets.length === ex.sets.length && doneSets.length > 0;
    const isBW  = ex.bodyweight || doneSets.every(s => !s.kg || parseFloat(s.kg) === 0);
    const maxKg = isBW ? 0 : Math.max(0, ...doneSets.map(s => parseFloat(s.kg)||0));
    const totalReps = doneSets.reduce((a,s) => a+(parseInt(s.reps)||0), 0);
    const vol = isBW ? totalReps : doneSets.reduce((a,s) => a+(parseFloat(s.kg)||0)*(parseFloat(s.reps)||0), 0);
    const prevEntries = history.filter(h => h.id !== entry.id);
    const prevEx      = prevEntries.flatMap(h => h.exercises).find(e => e.name === ex.name);
    const prevDone    = prevEx ? prevEx.sets.filter(s=>s.done) : [];
    const prevMaxKg   = prevEx && !isBW ? Math.max(0, ...prevDone.map(s=>parseFloat(s.kg)||0)) : null;
    const prevVol     = prevEx ? (isBW ? prevDone.reduce((a,s)=>a+(parseInt(s.reps)||0),0) : prevDone.reduce((a,s)=>a+(parseFloat(s.kg)||0)*(parseFloat(s.reps)||0),0)) : null;
    const volDelta    = prevVol && prevVol > 0 ? Math.round((vol - prevVol) / prevVol * 100) : null;
    const isPR        = !isBW && prevMaxKg !== null && maxKg > prevMaxKg;
    const isFirstSession = prevMaxKg === null && !isBW && maxKg > 0;
    let suggestion = null, suggestionColor = '#22C55E';
    if (isBW) { suggestion = allCompleted ? '+1 rep ou ajoute du lest' : 'Même configuration'; suggestionColor = allCompleted ? '#22C55E' : '#F59E0B'; }
    else if (maxKg > 0) { suggestion = allCompleted ? (Math.round((maxKg+1.25)*100)/100)+' kg' : maxKg+' kg (même charge)'; suggestionColor = allCompleted ? '#22C55E' : '#F59E0B'; }
    return { ...ex, doneSets, allCompleted, isBW, maxKg, vol, volDelta, isPR, isFirstSession, suggestion, suggestionColor, totalReps };
  });

  const totalVol  = exStats.reduce((a,e) => a + (e.isBW ? 0 : e.vol), 0);
  const totalSets = exStats.reduce((a,e) => a+e.doneSets.length, 0);
  const prs       = exStats.filter(e => e.isPR);

  function generateAnalysis(f) {
    const lines = [];
    const perfOk = exStats.every(e => e.allCompleted);
    const hasPR  = prs.length > 0;
    const avgVolDelta = (() => { const ds = exStats.map(e=>e.volDelta).filter(v=>v!==null); return ds.length ? Math.round(ds.reduce((a,v)=>a+v,0)/ds.length) : null; })();
    const volDown = avgVolDelta !== null && avgVolDelta < -5;
    if (f <= 1 && perfOk && hasPR) lines.push({ icon: '🏆', text: 'Séance optimale — tu as battu tes records. Continue sur cette lancée.', color: '#22C55E' });
    else if (f <= 1 && perfOk) lines.push({ icon: '✅', text: 'Tu étais frais et tout est complété. Prochaine séance idéale pour augmenter la charge.', color: '#22C55E' });
    else if (f <= 1) lines.push({ icon: '⚠️', text: 'Tu étais frais mais séries incomplètes. Vérifie la charge ou la technique.', color: '#F59E0B' });
    else if (f === 2 && perfOk) { lines.push({ icon: '💪', text: 'Malgré la fatigue, tu as complété — bon signal d\'adaptation.', color: '#0D7A8A' }); if (hasPR) lines.push({ icon: '🔥', text: 'PR battu en état de fatigue : ta progression est réelle.', color: '#22C55E' }); }
    else if (f === 2) { lines.push({ icon: '⚠️', text: 'Fatigué et séries incomplètes — la fatigue a impacté tes perfs.', color: '#F59E0B' }); if (volDown) lines.push({ icon: '📉', text: `Volume en baisse. Maintiens la même charge la prochaine fois.`, color: '#F59E0B' }); lines.push({ icon: '💡', text: 'Si ça se répète, envisage une semaine de décharge (−30%).', color: '#aaa' }); }
    else if (f === 3 && perfOk) { lines.push({ icon: '🧠', text: 'Très fatigué mais tu as tenu. Le risque de blessure augmente dans cet état.', color: '#F97316' }); lines.push({ icon: '💡', text: 'Dors suffisamment avant la prochaine séance.', color: '#aaa' }); }
    else if (f === 3) { lines.push({ icon: '🚨', text: 'Très fatigué et performances en baisse — récupère.', color: '#EF4444' }); lines.push({ icon: '💡', text: 'Prochaine séance : réduis la charge de 20-30% ou prends un jour de repos.', color: '#aaa' }); }
    else if (f === 4) { lines.push({ icon: '🚨', text: 'Séance en état d\'épuisement — risqué.', color: '#EF4444' }); lines.push({ icon: '🛑', text: 'Arrête si tu ressens des douleurs articulaires. 2 jours de repos minimum.', color: '#EF4444' }); }
    return lines.length > 0 ? lines : [{ icon: '📊', text: 'Continue à noter ta fatigue — les tendances révèlent beaucoup sur ta récupération.', color: '#aaa' }];
  }

  return (
    <div style={S.app}>
      <div style={S.header}><div style={{ width: 30 }}/><span style={S.hTitle}>Séance terminée 🎉</span><div style={{ width: 30 }}/></div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, padding: '14px 14px 0' }}>
        {[[ fmt2(entry.duration), 'Durée'], [totalSets, 'Séries'], [totalVol > 0 ? (totalVol >= 1000 ? (totalVol/1000).toFixed(1)+'t' : totalVol+'kg') : '—', 'Volume']].map(([v, lbl]) => (
          <div key={lbl} style={{ background: '#161618', borderRadius: 12, padding: '12px 10px', textAlign: 'center', border: '1px solid #222' }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{v}</div>
            <div style={{ fontSize: 11, color: '#555', marginTop: 3 }}>{lbl}</div>
          </div>
        ))}
      </div>

      {prs.length > 0 && (
        <div style={{ margin: '10px 14px 0', background: '#22C55E11', border: '1px solid #22C55E33', borderRadius: 12, padding: '10px 14px' }}>
          <div style={{ fontSize: 12, color: '#22C55E', fontWeight: 700, marginBottom: 6 }}>🏆 NOUVEAU RECORD{prs.length > 1 ? 'S' : ''}</div>
          {prs.map((e, i) => <div key={i} style={{ fontSize: 13, color: '#E8E8EA', marginBottom: 2 }}>{e.name} — {e.maxKg} kg</div>)}
        </div>
      )}

      <div style={{ ...S.card, marginTop: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Comment tu te sens ?</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, marginBottom: 14 }}>
          {fatigueLabels.map((lbl, i) => (
            <button key={i} onClick={() => { setFatigue(i); setShowAnalysis(false); }} style={{ background: fatigue === i ? fatigueColors[i]+'33' : '#111113', border: `1px solid ${fatigue === i ? fatigueColors[i] : '#222'}`, borderRadius: 10, padding: '10px 4px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 18 }}>{fatigueEmojis[i]}</span>
              <span style={{ fontSize: 10, color: fatigue === i ? fatigueColors[i] : '#555', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>{lbl}</span>
            </button>
          ))}
        </div>
        {fatigue !== null && !showAnalysis && <button style={{ ...S.btn, background: fatigueColors[fatigue] }} onClick={() => setShowAnalysis(true)}>Analyser ma séance</button>}
        {fatigue !== null && showAnalysis && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {generateAnalysis(fatigue).map((line, i) => (
              <div key={i} style={{ background: '#111113', borderRadius: 10, padding: '10px 12px', borderLeft: `3px solid ${line.color}` }}>
                <div style={{ fontSize: 13, color: '#E8E8EA', lineHeight: 1.5 }}>{line.icon} {line.text}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {exStats.map((ex, i) => (
        <div key={i} style={{ ...S.card, marginTop: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{ex.name}</div>
                {ex.isBW && <span style={{ background: '#0D7A8A22', color: '#0D7A8A', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 5 }}>PdC</span>}
              </div>
              <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>
                {ex.doneSets.length} série{ex.doneSets.length > 1 ? 's' : ''} · {ex.isBW ? ex.totalReps+' reps' : ex.vol > 0 ? ex.vol+'kg vol.' : '—'}
                {ex.volDelta !== null && <span style={{ marginLeft: 6, color: ex.volDelta > 0 ? '#22C55E' : ex.volDelta < -5 ? '#EF4444' : '#F59E0B' }}>{ex.volDelta > 0 ? '▲' : '▼'}{Math.abs(ex.volDelta)}%</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {ex.isPR && <span style={{ background: '#22C55E22', color: '#22C55E', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>PR</span>}
              {ex.isFirstSession && <span style={{ background: '#0D7A8A22', color: '#0D7A8A', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6 }}>1ère</span>}
              <span style={{ fontSize: 12, color: ex.allCompleted ? '#22C55E' : '#F59E0B', fontWeight: 700 }}>{ex.allCompleted ? '✓' : '⚠'}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {ex.doneSets.map((s, j) => <span key={j} style={{ background: '#1E1E22', borderRadius: 6, padding: '3px 10px', fontSize: 13, color: '#ccc', fontWeight: 600 }}>{s.kg && parseFloat(s.kg) > 0 ? s.kg+'×' : ''}{s.reps}</span>)}
          </div>
          {ex.suggestion && (
            <div style={{ background: '#111113', borderRadius: 8, padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#555' }}>Prochaine séance</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: ex.suggestionColor }}>{ex.suggestion}</span>
            </div>
          )}
        </div>
      ))}

      <div style={{ ...S.card, marginTop: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Contexte de la séance</div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: '#555', marginBottom: 8 }}>Sommeil cette nuit</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[['😴','<6h'],['😐','6-7h'],['😊','7-8h'],['💪','8h+']].map(([emoji, label], i) => (
              <button key={i} onClick={() => setSleep(i)} style={{ flex: 1, background: sleep===i ? '#0D7A8A33' : '#111113', border: `1px solid ${sleep===i ? '#0D7A8A' : '#222'}`, borderRadius: 8, padding: '8px 4px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <span style={{ fontSize: 16 }}>{emoji}</span><span style={{ fontSize: 10, color: sleep===i ? '#0D7A8A' : '#555' }}>{label}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#555', marginBottom: 8 }}>Nutrition du jour</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[['😕','Insuffisante'],['😐','Correcte'],['💪','Optimale']].map(([emoji, label], i) => (
              <button key={i} onClick={() => setNutrition(i)} style={{ flex: 1, background: nutrition===i ? '#0D7A8A33' : '#111113', border: `1px solid ${nutrition===i ? '#0D7A8A' : '#222'}`, borderRadius: 8, padding: '8px 4px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <span style={{ fontSize: 16 }}>{emoji}</span><span style={{ fontSize: 10, color: nutrition===i ? '#0D7A8A' : '#555', textAlign: 'center', lineHeight: 1.2 }}>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 14px 32px' }}>
        <button style={S.btn} onClick={onHome}>Retour à l'accueil</button>
      </div>
    </div>
  );
};
