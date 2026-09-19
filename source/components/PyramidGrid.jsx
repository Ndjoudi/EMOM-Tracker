// ─── Grille pyramide ───
// Un seul exercice, en grille : colonnes = séries enchaînées toutes les X secondes,
// lignes = tours, séparés par Y secondes de repos.
// Le composant gère son propre timer ; WorkoutScreen masque sa barre EMOM pour cet exo.
const { useState: uSPY, useEffect: uEPY, useRef: uRPY } = React;
const S  = window.S;
const IC = window.IC;

window.PyramidGrid = function PyramidGrid({ ex, onChange, onDone }) {
  const rows = Math.max(1, ex.pyRows || 3);
  const cols = Math.max(1, ex.pyCols || 5);
  const X    = Math.max(5, ex.pyX || 60);
  const Y    = Math.max(0, ex.pyY || 120);
  const prev = ex.pyPrev || null;

  const [curRow,   setCurRow]   = uSPY(0);
  const [curCol,   setCurCol]   = uSPY(0);
  const [timerOn,  setTimerOn]  = uSPY(false);
  const [timeLeft, setTimeLeft] = uSPY(X);
  const [resting,  setResting]  = uSPY(false);
  const [restLeft, setRestLeft] = uSPY(Y);
  // Initialisé depuis la séance : survit au changement d'onglet d'exercice
  const [allDone,  setAllDone]  = uSPY(!!ex.pyDone);

  const iRef = uRPY(null), rRef = uRPY(null);
  const deadRef = uRPY(null), restDeadRef = uRPY(null);

  // ── État d'une case (pilote bordure + fond) ──
  const status = (r, c) => {
    if (allDone) return 'done';
    if (!timerOn && !resting) return 'idle';
    if (r < curRow) return 'done';
    if (r === curRow) {
      if (resting) return 'upcoming';   // ligne suivante pendant le repos
      if (c < curCol) return 'done';
      if (c === curCol) return 'active';
    }
    return 'idle';
  };
  const cellBg = (r, c) => ({ active:'#F59E0B22', done:'#22C55E11', upcoming:'#0D7A8A11' }[status(r,c)] || 'transparent');
  const cellBd = (r, c) => ({ active:'2px solid #F59E0B', done:'1px solid #22C55E44', upcoming:'1px solid #0D7A8A55' }[status(r,c)] || '1px solid #2A2A2E');

  // ── Comparaison avec la séance précédente (pilote la couleur du chiffre) ──
  const compColor = (r, c) => {
    const cur = parseInt(ex.pyGrid?.[r]?.[c]) || 0;
    const p   = prev && prev[r] ? parseInt(prev[r][c]) || 0 : 0;
    if (!cur) return null;
    if (!p)   return '#E8E8EA';
    if (cur > p)  return '#22C55E';
    if (cur === p) return '#F59E0B';
    return '#EF4444';
  };

  // ── Avancer d'une case ──
  const advance = uRPY(null);
  advance.current = () => {
    const nc = curCol + 1;
    if (nc < cols) {
      setCurCol(nc);
      setTimeLeft(X);
    } else if (curRow + 1 < rows) {
      setTimerOn(false);
      setTimeLeft(X);
      setCurRow(curRow + 1);
      setCurCol(0);
      setResting(true);
      setRestLeft(Y);
    } else {
      setTimerOn(false);
      setAllDone(true);
      onDone && onDone(true);   // persiste l'état terminé dans la séance
    }
  };

  // ── Timer série (horloge murale : résiste au ralentissement en arrière-plan) ──
  uEPY(() => {
    if (!timerOn) return;
    deadRef.current = Date.now() + timeLeft * 1000;
    iRef.current = setInterval(() => {
      const n = Math.max(0, Math.round((deadRef.current - Date.now()) / 1000));
      if (n <= 0) {
        clearInterval(iRef.current);
        advance.current();
        return;
      }
      setTimeLeft(n);
    }, 250);
    return () => clearInterval(iRef.current);
  }, [timerOn, curCol, curRow]);

  // ── Timer repos ──
  uEPY(() => {
    if (!resting) return;
    restDeadRef.current = Date.now() + restLeft * 1000;
    rRef.current = setInterval(() => {
      const n = Math.max(0, Math.round((restDeadRef.current - Date.now()) / 1000));
      if (n <= 0) {
        clearInterval(rRef.current);
        setRestLeft(Y);
        setResting(false);
        setTimerOn(true);
        return;
      }
      setRestLeft(n);
    }, 250);
    return () => clearInterval(rRef.current);
  }, [resting]);

  // ── Grille redimensionnée en cours de séance : ramène la position dans les bornes ──
  uEPY(() => {
    if (curCol > cols - 1) setCurCol(Math.max(0, cols - 1));
    if (curRow > rows - 1) setCurRow(Math.max(0, rows - 1));
  }, [rows, cols]);

  // ── Libère le maintien d'écran allumé en quittant ──
  uEPY(() => () => {
    window._wantWakeLock = false;
    window.releaseWakeLock && window.releaseWakeLock();
  }, []);

  const start = () => {
    window._wantWakeLock = true;
    window.requestWakeLock && window.requestWakeLock();
    setCurRow(0); setCurCol(0); setAllDone(false);
    onDone && onDone(false);
    setTimeLeft(X); setTimerOn(true);
  };
  const skip = () => { clearInterval(iRef.current); advance.current(); };
  const skipRest = () => { clearInterval(rRef.current); setResting(false); setTimerOn(true); };

  const setCell = (r, c, v) => {
    const g = (ex.pyGrid || []).map(row => [...row]);
    while (g.length < rows) g.push(Array(cols).fill(''));
    g[r][c] = v;
    onChange(g);
  };
  const copyRow1 = () => {
    const g = (ex.pyGrid || []).map(row => [...row]);
    onChange(g.map((row, r) => r === 0 ? row : [...g[0]]));
  };

  const fmt = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
  const colW = Math.max(46, Math.min(64, Math.floor((window.innerWidth - 90) / cols)));

  return (
    <div style={{ marginBottom: 12 }}>
      {/* Barre timer */}
      <div style={{ marginBottom: 10 }}>
        {resting ? (
          <div style={{ background:'#1A1A2E', border:'1px solid #2A2A3E', borderRadius:12, padding:'10px 14px', display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:11, color:'#666', whiteSpace:'nowrap' }}>Repos — ligne {curRow + 1}</div>
              <div style={{ fontSize:26, fontWeight:800, color:'#0D7A8A', fontVariantNumeric:'tabular-nums' }}>{fmt(restLeft)}</div>
            </div>
            <button style={{ ...S.btn, width:'auto', padding:'8px 18px', fontSize:13, flexShrink:0 }} onClick={skipRest}>Passer</button>
          </div>
        ) : timerOn ? (
          <div style={{ background:'#F59E0B11', border:'1px solid #F59E0B44', borderRadius:12, padding:'8px 14px', display:'flex', alignItems:'center' }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:10, color:'#F59E0B88' }}>Ligne {curRow + 1}/{rows}</div>
              <div style={{ fontSize:12, fontWeight:700, color:S.orange }}>Série {curCol + 1}/{cols}</div>
            </div>
            <div style={{ fontSize:40, fontWeight:800, color:S.orange, fontVariantNumeric:'tabular-nums', lineHeight:1, padding:'0 14px' }}>{fmt(timeLeft)}</div>
            <div style={{ flex:1, display:'flex', justifyContent:'flex-end' }}>
              <button onClick={skip} style={{ background:'transparent', border:'1px solid #F59E0B44', borderRadius:8, padding:'6px 12px', fontSize:11, fontWeight:600, color:'#F59E0B88', cursor:'pointer', fontFamily:'inherit' }}>Suivant</button>
            </div>
          </div>
        ) : allDone ? (
          <div style={{ background:'#22C55E11', border:'1px solid #22C55E44', borderRadius:12, padding:'12px', textAlign:'center', fontSize:14, fontWeight:700, color:'#22C55E' }}>
            Pyramide terminée
          </div>
        ) : (
          <button style={{ ...S.btn, width:'100%', padding:'12px', fontSize:15, background:S.orange }} onClick={start}>
            <IC.play/> Pyramide — {cols} × {fmt(X)}
          </button>
        )}
      </div>

      {rows > 1 && (
        <button onClick={copyRow1} style={{ background:'#1E1E22', border:'1px solid #2A2A2E', borderRadius:8, padding:'5px 12px', fontSize:11, fontWeight:600, color:'#aaa', cursor:'pointer', fontFamily:'inherit', marginBottom:8 }}>
          ↓ Copier ligne 1 sur toutes
        </button>
      )}

      {/* Grille */}
      <div style={{ overflowX:'auto' }}>
        <table style={{ borderCollapse:'separate', borderSpacing:'4px' }}>
          <thead>
            <tr>
              <th style={{ width:26, fontSize:10, color:'#555', fontWeight:700, textAlign:'left', textTransform:'uppercase' }}>L.</th>
              {Array.from({ length: cols }, (_, c) => (
                <th key={c} style={{ width:colW, fontSize:10, color:'#aaa', fontWeight:700, textAlign:'center', paddingBottom:2 }}>S{c + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }, (_, r) => (
              <tr key={r}>
                <td style={{ fontSize:12, fontWeight:700, color:'#555', paddingRight:4, verticalAlign:'top', paddingTop:8 }}>{r + 1}</td>
                {Array.from({ length: cols }, (_, c) => {
                  const val = ex.pyGrid?.[r]?.[c] ?? '';
                  const cc  = compColor(r, c);
                  const pv  = prev && prev[r] ? prev[r][c] : '';
                  const histColor = !cc ? '#555' : cc === '#22C55E' ? '#22C55E99' : cc === '#F59E0B' ? '#F59E0B99' : '#EF444499';
                  return (
                    <td key={c} style={{ padding:0, verticalAlign:'top' }}>
                      <div style={{ borderRadius:8, border:cellBd(r,c), background:cellBg(r,c), transition:'all .2s', overflow:'hidden' }}>
                        <input
                          type="number"
                          value={val}
                          onChange={e => setCell(r, c, e.target.value)}
                          placeholder="—"
                          style={{ width:'100%', background:'transparent', border:'none', outline:'none', textAlign:'center',
                                   fontSize:15, fontWeight:700, color: cc || '#E8E8EA', padding:'8px 2px 3px',
                                   fontFamily:'inherit', WebkitAppearance:'none', MozAppearance:'textfield' }}
                        />
                        <div style={{ textAlign:'center', fontSize:9, color:histColor, paddingBottom:4, minHeight:13 }}>{pv || ''}</div>
                      </div>
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
};
