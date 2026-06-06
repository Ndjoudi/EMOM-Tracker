// ─── Coach Screen (Groq AI) ───
const { useState: useStateCoach } = React;
const S  = window.S;
const IC = window.IC;

window.CoachScreen = function CoachScreen({ history, profile, routines, exLib, onBack }) {
  const [loading, setLoading]   = useStateCoach(false);
  const [response, setResponse] = useStateCoach('');
  const [error, setError]       = useStateCoach('');
  const [deepMode, setDeepMode] = useStateCoach(false);

  const hasKey = !!(profile.groqKey && profile.groqKey.trim().startsWith('gsk_'));
  const routineNames = [...new Set(history.map(h => h.routineName))];
  const [selRoutine, setSelRoutine] = useStateCoach(() => history[0]?.routineName || routineNames[0] || '');

  const lastSession    = history.find(h => h.routineName === selRoutine) || null;
  const routineHistory = history.filter(h => h.routineName === selRoutine);

  function buildContext(deep) {
    const exNames = [...new Set(routineHistory.flatMap(h => h.exercises.map(e => e.name)))];
    const progressions = exNames.map(name => {
      const entries = routineHistory.flatMap(h => h.exercises.filter(e => e.name === name).map(e => ({
        date: new Date(h.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
        maxKg: Math.max(0, ...e.sets.filter(s=>s.done).map(s=>parseFloat(s.kg)||0)),
        vol: e.sets.filter(s=>s.done).reduce((a,s)=>a+(parseFloat(s.kg)||0)*(parseFloat(s.reps)||0),0),
        done: e.sets.filter(s=>s.done).length, total: e.sets.length,
      }))).slice(0, deep ? 10 : 5);
      return `${name}: ${entries.map(e=>`${e.date} max${e.maxKg}kg (${e.done}/${e.total}s)`).join(' → ')}`;
    }).join('\n');
    const routineDef    = routines.find(r => r.name === selRoutine);
    const routineDetail = routineDef ? routineDef.exerciseRefs.map(ref => { const ex = exLib.find(e => e.id === ref.exId); return ex ? `${ex.name} ${ref.nbSets}×${ref.emomTime}s` : '?'; }).join(', ') : 'Non définie';
    const lastDetail    = lastSession ? lastSession.exercises.map(ex => { const done = ex.sets.filter(s=>s.done); return `  ${ex.name}: ${done.map(s=>(s.kg?s.kg+'×':'')+s.reps).join('/')} ${done.length===ex.sets.length?'✓':'⚠'}`; }).join('\n') : 'Aucune séance';
    return `PROFIL: ${profile.name||'Athlète'}, ${profile.weight||'?'}kg\nROUTINE: ${selRoutine}\nStructure: ${routineDetail}\nSéances: ${routineHistory.length}\nDernière:\n${lastDetail}\nProgressions:\n${progressions}`;
  }

  async function ask(deep) {
    setDeepMode(deep); setLoading(true); setResponse(''); setError('');
    const ctx = buildContext(deep);
    const sys = `Tu es un coach muscu. Réponds en français. Sans intro, sans conclusion, sans politesse, sans markdown. Télégraphique.`;
    const prompt = deep
      ? `${ctx}\n\n✅ PROGRESSE BIEN : ...\n⚠️ STAGNE : ...\n🎯 PLAN 2 SEMAINES : (Exo → charge×séries×reps)`
      : `${ctx}\n\nProchaine séance format strict :\nNom → Xkg × Yséries × Zreps`;
    try {
      const res  = await fetch('https://api.groq.com/openai/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${profile.groqKey.trim()}` }, body: JSON.stringify({ model: 'llama-3.3-70b-versatile', max_tokens: 350, messages: [{ role: 'system', content: sys }, { role: 'user', content: prompt }] }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      setResponse(data.choices?.[0]?.message?.content || 'Pas de réponse.');
    } catch(e) { setError('Erreur: ' + e.message); }
    setLoading(false);
  }

  function renderResponse(text) {
    return text.split('\n').filter(l => l.trim()).map((line, i) => {
      const clean = line.replace(/\*\*(.*?)\*\*/g, '$1').replace(/^#+\s*/, '').trim();
      const isSection = /^[✅⚠️🎯📊]/.test(clean);
      return (<div key={i} style={{ padding: isSection ? '10px 0 4px' : '3px 0', borderTop: isSection && i > 0 ? '1px solid #222' : 'none', marginTop: isSection && i > 0 ? 8 : 0 }}>
        <span style={{ fontSize: isSection ? 13 : 14, fontWeight: isSection ? 700 : 400, color: isSection ? S.blue : clean.includes('→') ? '#E8E8EA' : '#aaa', fontFamily: clean.includes('→') ? 'monospace' : 'inherit' }}>{clean}</span>
      </div>);
    });
  }

  return (
    <div style={S.app}>
      <div style={S.header}>
        <button style={S.btnG} onClick={onBack}><IC.back/></button>
        <span style={S.hTitle}>Coach IA</span>
        <div style={{ width: 30 }}/>
      </div>

      {!hasKey ? (
        <div style={{ ...S.card, margin: '14px', background: '#1A1A2E', border: '1px solid #2A2A3E' }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Clé Groq requise</div>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 14 }}>Va sur <span style={{ color: S.blue }}>console.groq.com/keys</span> pour créer une clé gratuite.</div>
          <button style={S.btn} onClick={onBack}>← Configurer dans le profil</button>
        </div>
      ) : routineNames.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#555', fontSize: 14 }}>Fais au moins une séance pour activer le coach.</div>
      ) : (
        <div style={{ padding: '14px' }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto' }}>
            {routineNames.map(n => (<button key={n} onClick={() => { setSelRoutine(n); setResponse(''); setError(''); }} style={{ background: selRoutine===n ? S.blue+'33' : '#1E1E22', border: `1px solid ${selRoutine===n ? S.blue : '#2A2A2E'}`, borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: selRoutine===n ? S.blue : '#888', whiteSpace: 'nowrap', flexShrink: 0 }}>{n}</button>))}
          </div>

          {lastSession && (
            <div style={{ ...S.card, marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Dernière séance — {selRoutine}</div>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>{new Date(lastSession.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} · {routineHistory.length} séance{routineHistory.length > 1 ? 's' : ''}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {lastSession.exercises.map((ex, i) => { const done = ex.sets.filter(s=>s.done); const allDone = done.length === ex.sets.length; return <span key={i} style={{ background: allDone ? '#22C55E22' : '#F59E0B22', color: allDone ? '#22C55E' : '#F59E0B', borderRadius: 6, padding: '3px 9px', fontSize: 12, fontWeight: 600 }}>{ex.name} {allDone ? '✓' : '⚠'}</span>; })}
              </div>
            </div>
          )}

          {!lastSession && <div style={{ textAlign: 'center', padding: 30, color: '#555', fontSize: 13 }}>Aucune séance pour cette routine.</div>}
          {lastSession && !response && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button style={{ ...S.btn, padding: '16px', fontSize: 16 }} onClick={() => ask(false)}>🎯 Que faire à la prochaine {selRoutine} ?</button>
              <button style={{ ...S.btnO, padding: '12px' }} onClick={() => ask(true)}>📊 Bilan complet — {selRoutine}</button>
            </div>
          )}
          {loading && <div style={{ textAlign: 'center', padding: '40px 0' }}><div style={{ fontSize: 32, marginBottom: 12 }}>🧠</div><div style={{ fontSize: 14, color: '#666' }}>{deepMode ? 'Bilan en cours...' : 'Analyse de ta séance...'}</div></div>}
          {error && <div style={{ background: '#7F1D1D22', border: '1px solid #991B1B', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#FCA5A5', marginTop: 10 }}>{error}</div>}
          {response && (
            <div>
              <div style={{ background: '#111113', border: '1px solid #222', borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ fontSize: 11, color: S.blue, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{deepMode ? `📊 Bilan — ${selRoutine}` : `🎯 Prochaine ${selRoutine}`}</div>
                {renderResponse(response)}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button style={{ ...S.btnO, flex: 1 }} onClick={() => { setResponse(''); setError(''); }}>Nouvelle analyse</button>
                <button style={{ ...S.btnO, flex: 1 }} onClick={() => ask(!deepMode)}>{deepMode ? '🎯 Prochaine séance' : '📊 Bilan complet'}</button>
              </div>
            </div>
          )}
          <div style={{ height: 40 }}/>
        </div>
      )}
    </div>
  );
};
