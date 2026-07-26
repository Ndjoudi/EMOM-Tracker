// ─── Circuit Screen ───
const { useState: uSCS, useEffect: uECS, useRef: uRCS } = React;
const S  = window.S;
const IC = window.IC;

window.CircuitScreen = function CircuitScreen({ circuit, circuitHistory, onFinish, onCancel }) {
  const exos      = circuit.exos;   // [{id, name}]
  const nbExos    = exos.length;
  const DURATION  = 60;             // 1 min par exo

  // ── État grille : pré-rempli depuis la dernière séance si dispo ──
  const [series, setSeries] = uSCS(() => {
    const last = circuitHistory && circuitHistory.length > 0 ? circuitHistory[0] : null;
    if (last && last.series && last.series.length > 0) {
      // Reprend le même nombre de séries et les mêmes reps
      return last.series.map(row => Array(nbExos).fill('').map((_, ei) => String(row[ei] ?? '')));
    }
    return [Array(nbExos).fill('')];
  });
  const [totalEl,  setTotalEl]  = uSCS(0);

  // ── Timer ──
  const [timerLeft, setTimerLeft] = uSCS(DURATION);
  const [timerOn,   setTimerOn]   = uSCS(false);
  const [curSerie,  setCurSerie]  = uSCS(0);
  const [curExo,    setCurExo]    = uSCS(0);
  const [resting,   setResting]   = uSCS(false);
  const [restLeft,  setRestLeft]  = uSCS(circuit.restSec || 90);
  const [allDone,   setAllDone]   = uSCS(false);

  const iRef    = uRCS(null);
  const restRef = uRCS(null);
  const elRef   = uRCS(null);

  // ── Status d'une cellule ──
  // 'done' | 'active' | 'idle'
  const cellStatus = (si, ei) => {
    if (allDone) return 'done';
    if (!timerOn && !resting) return 'idle';
    if (si < curSerie) return 'done';
    if (si === curSerie) {
      if (resting) return 'upcoming';   // série suivante pendant le repos → bleu
      if (ei < curExo) return 'done';
      if (ei === curExo) return 'active';
      return 'idle';
    }
    return 'idle';
  };

  const cellBg = (si, ei) => {
    const st = cellStatus(si, ei);
    if (st === 'active')   return '#F59E0B22';
    if (st === 'done')     return '#22C55E11';
    if (st === 'upcoming') return '#0D7A8A11';
    return 'transparent';
  };
  const cellBorder = (si, ei) => {
    const st = cellStatus(si, ei);
    if (st === 'active')   return '2px solid #F59E0B';
    if (st === 'done')     return '1px solid #22C55E44';
    if (st === 'upcoming') return '1px solid #0D7A8A55';
    return '1px solid #2A2A2E';
  };
  const cellColor = (si, ei) => {
    const st = cellStatus(si, ei);
    if (st === 'active')   return '#F59E0B';
    if (st === 'done')     return '#22C55E';
    if (st === 'upcoming') return '#0D7A8A';
    return '#E8E8EA';
  };

  // ── Avancer au prochain exo / série ──
  const advance = uRCS(null);
  advance.current = () => {
    const nextExo = curExo + 1;
    if (nextExo < nbExos) {
      setCurExo(nextExo);
      setTimerLeft(DURATION);
      window.sndGo && window.sndGo();
    } else {
      // Fin de la série → repos
      setTimerOn(false);
      setTimerLeft(DURATION);
      window.sndGo && window.sndGo();
      const nextSerie = curSerie + 1;
      if (nextSerie < series.length) {
        setResting(true);
        setRestLeft(circuit.restSec || 90);
        setCurSerie(nextSerie);
        setCurExo(0);
      } else {
        // Toutes les séries terminées
        setTimerOn(false);
        setAllDone(true);
      }
    }
  };

  // ── Timer exo ──
  // Basé sur l'horloge murale : si iOS ralentit l'interval en arrière-plan,
  // le temps restant reste juste au lieu de dériver.
  const deadRef = uRCS(null);
  const firedRef = uRCS({});
  uECS(() => {
    if (!timerOn) return;
    deadRef.current = Date.now() + timerLeft * 1000;
    firedRef.current = {};
    iRef.current = setInterval(() => {
      const next = Math.max(0, Math.round((deadRef.current - Date.now()) / 1000));
      if (next <= 10 && next > 0 && !firedRef.current[next]) {
        firedRef.current[next] = true;
        if (next === 10) window.snd10 && window.snd10();
        if (next === 3 || next === 2 || next === 1) window.sndCountdown && window.sndCountdown();
      }
      if (next <= 0) {
        clearInterval(iRef.current);
        // Alerte forte : audible écran verrouillé + notification si en arrière-plan
        const nextName = curExo + 1 < nbExos ? exos[curExo + 1]?.name : 'Repos';
        window.timerAlert && window.timerAlert('Minute terminée', `Au suivant : ${nextName}`);
        setTimerLeft(DURATION);
        advance.current();
        return;
      }
      setTimerLeft(next);
    }, 250);
    return () => clearInterval(iRef.current);
  }, [timerOn, curExo, curSerie]);

  // ── Timer repos ── (horloge murale, comme le timer exo)
  const restDeadRef = uRCS(null);
  const restFiredRef = uRCS({});
  uECS(() => {
    if (!resting) return;
    restDeadRef.current = Date.now() + restLeft * 1000;
    restFiredRef.current = {};
    restRef.current = setInterval(() => {
      const next = Math.max(0, Math.round((restDeadRef.current - Date.now()) / 1000));
      if (next <= 4 && next > 0 && !restFiredRef.current[next]) {
        restFiredRef.current[next] = true;
        window.sndCountdown && window.sndCountdown();
      }
      if (next <= 0) {
        clearInterval(restRef.current);
        // Fin du repos = le moment clé : téléphone posé, écran verrouillé
        window.timerAlert && window.timerAlert(
          `Série ${curSerie + 1} — c'est parti`,
          `Premier exo : ${exos[0]?.name || ''}`
        );
        setRestLeft(circuit.restSec || 90);
        setResting(false);
        setTimerOn(true);
        return;
      }
      setRestLeft(next);
    }, 250);
    return () => clearInterval(restRef.current);
  }, [resting]);

  // ── Timer total ──
  uECS(() => {
    elRef.current = setInterval(() => setTotalEl(p => p + 1), 1000);
    return () => clearInterval(elRef.current);
  }, []);

  // ── Texte affiché sur l'écran verrouillé ──
  uECS(() => {
    if (!timerOn && !resting) return;
    const title = resting
      ? `Repos — ${circuit.restSec || 90}s`
      : (exos[curExo]?.name || circuit.name);
    const sub = `${circuit.name} — Série ${curSerie + 1}/${series.length}`;
    window.updateLockScreen && window.updateLockScreen(title, sub);
  }, [curExo, curSerie, resting, timerOn]);

  // ── Libère le wake lock en quittant l'écran ──
  uECS(() => () => {
    window._wantWakeLock = false;
    window.releaseWakeLock && window.releaseWakeLock();
    window.stopLockScreenSession && window.stopLockScreenSession();
  }, []);

  const startTimer = () => {
    window.unlockAudio && window.unlockAudio();
    // Écran verrouillé : empêche la veille + affiche la carte "Now Playing"
    window._wantWakeLock = true;
    window.requestWakeLock && window.requestWakeLock();
    window.startLockScreenSession && window.startLockScreenSession(
      exos[0]?.name || circuit.name,
      `${circuit.name} — Série 1/${series.length}`
    );
    window.setLockScreenHandlers && window.setLockScreenHandlers({ onNext: () => skipExo() });
    window.requestNotifPermission && window.requestNotifPermission();
    setCurSerie(0); setCurExo(0);
    setTimerLeft(DURATION); setTimerOn(true);
  };
  const skipExo = () => {
    clearInterval(iRef.current);
    advance.current();
  };
  const skipRest = () => {
    clearInterval(restRef.current);
    setResting(false);
    setTimerOn(true);
    window.sndGo && window.sndGo();
  };

  // ── Modifier une cellule ──
  const setReps = (si, ei, val) => {
    setSeries(p => {
      const n = p.map(r => [...r]);
      n[si][ei] = val;
      return n;
    });
  };

  // ── Ajouter / supprimer série ──
  const addSerie    = () => setSeries(p => [...p, Array(nbExos).fill('')]);
  const removeSerie = si  => setSeries(p => p.length <= 1 ? p : p.filter((_,i) => i !== si));

  // ── Historique : n-1 et n-2 ──
  const lastSession = circuitHistory && circuitHistory.length > 0 ? circuitHistory[0] : null;  // n-1
  const prevSession = circuitHistory && circuitHistory.length > 1 ? circuitHistory[1] : null;  // n-2
  const lastReps    = (si, ei) => lastSession && lastSession.series[si] ? lastSession.series[si][ei] || '' : '';
  const prevReps    = (si, ei) => prevSession && prevSession.series[si] ? prevSession.series[si][ei] || '' : '';

  // ── Comparaison n vs n-1 (grand chiffre) ──
  const compColor = (si, ei) => {
    const cur  = parseInt(series[si]?.[ei]) || 0;
    const prev = parseInt(lastReps(si, ei))  || 0;
    if (!cur)  return null;           // pas encore saisi
    if (!prev) return '#E8E8EA';      // pas d'historique
    if (cur > prev)  return '#22C55E';
    if (cur === prev) return '#F59E0B';
    return '#EF4444';
  };

  // ── Comparaison n-1 vs n-2 (petit chiffre référence) ──
  const histCompColor = (si, ei) => {
    const cur  = parseInt(lastReps(si, ei)) || 0;   // n-1
    const prev = parseInt(prevReps(si, ei)) || 0;   // n-2
    if (!cur || !prev) return null;  // pas de données suffisantes
    if (cur > prev)  return '#22C55E';
    if (cur === prev) return '#F59E0B';
    return '#EF4444';
  };
  const compBorder = (si, ei) => {
    const c = compColor(si, ei);
    if (!c) return '1px solid #2A2A2E';
    return `1px solid ${c}44`;
  };

  // ── Finish ──
  const finish = () => {
    clearInterval(iRef.current);
    clearInterval(restRef.current);
    clearInterval(elRef.current);
    onFinish({
      circuitId: circuit.id,
      circuitName: circuit.name,
      date: Date.now(),
      duration: totalEl * 1000,
      series,
      exos,
    });
  };

  const [showHist, setShowHist] = uSCS(false);

  // ── Format ──
  const fmt = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
  const fmtEl = s => `${Math.floor(s/60)}m${String(s%60).padStart(2,'0')}s`;

  // ── Taille colonne (responsive) ──
  const colW = Math.max(52, Math.min(72, Math.floor((window.innerWidth - 60 - 28) / nbExos)));

  return (
    <div style={S.app}>
      {/* Header */}
      <div style={S.header}>
        <button style={S.btnG} onClick={onCancel}><IC.back/></button>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:15,fontWeight:700}}>{circuit.name}</div>
          <div style={{fontSize:12,color:'#555'}}>{fmtEl(totalEl)}</div>
        </div>
        <div style={{display:'flex',gap:6}}>
          <button style={{...S.btnG,color:'#aaa'}} onClick={()=>setShowHist(true)}><IC.hist/></button>
          <button style={{...S.btn,padding:'6px 14px',fontSize:13}} onClick={finish}>Terminer</button>
        </div>
      </div>

      {/* Timer / Repos */}
      <div style={{padding:'10px 14px 4px'}}>
        {resting ? (
          <div style={{background:'#1A1A2E',border:'1px solid #2A2A3E',borderRadius:14,padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div>
              <div style={{fontSize:12,color:'#666',marginBottom:2}}>Repos avant série {curSerie+1}</div>
              <div style={{fontSize:28,fontWeight:800,color:'#0D7A8A',fontVariantNumeric:'tabular-nums'}}>{fmt(restLeft)}</div>
            </div>
            <button style={{...S.btn,padding:'8px 16px',fontSize:13}} onClick={skipRest}>Passer</button>
          </div>
        ) : timerOn ? (
          <div style={{background:'#F59E0B11',border:'1px solid #F59E0B44',borderRadius:14,padding:'10px 16px',display:'flex',alignItems:'center'}}>
            <div style={{flex:1}}>
              <div style={{fontSize:11,color:'#F59E0B88'}}>Série {curSerie+1}</div>
              <div style={{fontSize:13,fontWeight:700,color:'#F59E0B'}}>{exos[curExo]?.name}</div>
            </div>
            <div style={{fontSize:56,fontWeight:800,color:'#F59E0B',fontVariantNumeric:'tabular-nums',lineHeight:1,textAlign:'center',flex:'0 0 auto',padding:'0 16px'}}>{fmt(timerLeft)}</div>
            <div style={{flex:1,display:'flex',justifyContent:'flex-end'}}>
              <button style={{background:'transparent',border:'1px solid #F59E0B44',borderRadius:8,padding:'6px 12px',fontSize:11,fontWeight:600,color:'#F59E0B88',cursor:'pointer',fontFamily:'inherit'}} onClick={skipExo}>Suivant</button>
            </div>
          </div>
        ) : (
          <button style={{...S.btn,width:'100%',padding:'14px',fontSize:15}} onClick={startTimer}>
            <IC.play/> Lancer le circuit
          </button>
        )}
      </div>

      {/* Grille */}
      <div style={{overflowX:'auto',padding:'8px 14px 100px'}}>
        {series.length>1&&(
          <button
            onClick={()=>setSeries(p=>{const ref=p[0];return p.map((row,si)=>si===0?row:[...ref]);})}
            style={{background:'#1E1E22',border:'1px solid #2A2A2E',borderRadius:8,padding:'6px 14px',fontSize:12,fontWeight:600,color:'#aaa',cursor:'pointer',fontFamily:'inherit',marginBottom:8,display:'flex',alignItems:'center',gap:6}}
          >↓ Copier série 1 sur toutes</button>
        )}
        <table style={{borderCollapse:'separate',borderSpacing:'4px',minWidth:'100%'}}>
          <thead>
            <tr>
              <th style={{width:28,padding:'4px 0',fontSize:11,color:'#555',fontWeight:700,textTransform:'uppercase',textAlign:'left',verticalAlign:'bottom'}}>Sér.</th>
              {exos.map((ex,ei) => (
                <th key={ex.id} style={{width:colW,padding:'0 2px 4px',fontSize:11,color:'#aaa',fontWeight:700,textAlign:'center',verticalAlign:'bottom',maxWidth:colW}}>
                  <div style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:10}}>{ex.name}</div>
                </th>
              ))}
              <th style={{width:24}}/>
            </tr>
          </thead>
          <tbody>
            {series.map((serie, si) => (
              <tr key={si}>
                {/* Numéro série */}
                <td style={{padding:'3px 4px 3px 0',verticalAlign:'top',paddingTop:8}}>
                  <span style={{fontSize:13,fontWeight:700,color:'#555'}}>{si+1}</span>
                </td>

                {/* Cellules exos */}
                {exos.map((ex, ei) => {
                  const status = cellStatus(si, ei);
                  const hist   = lastReps(si, ei);
                  const textColor = compColor(si, ei) || cellColor(si, ei);
                  return (
                    <td key={ex.id} style={{padding:'2px',verticalAlign:'top'}}>
                      <div style={{borderRadius:8,border:cellBorder(si,ei),background:cellBg(si,ei),transition:'all 0.2s',overflow:'hidden'}}>
                        <input
                          type="number"
                          value={serie[ei]}
                          onChange={e => setReps(si, ei, e.target.value)}
                          placeholder="—"
                          style={{
                            width:'100%', background:'transparent', border:'none', outline:'none',
                            textAlign:'center', fontSize:15, fontWeight:700,
                            color: textColor,
                            padding:'8px 4px 4px', fontFamily:'inherit',
                            WebkitAppearance:'none', MozAppearance:'textfield',
                          }}
                        />
                        {/* Historique : n-1 coloré selon sa comparaison avec n-2 */}
                        {(()=>{
                          const hcc = histCompColor(si,ei);
                          const histColor = !hcc ? '#555' : hcc==='#22C55E' ? '#22C55E99' : hcc==='#F59E0B' ? '#F59E0B99' : '#EF444499';
                          return <div style={{textAlign:'center',fontSize:10,color:histColor,paddingBottom:5,minHeight:16}}>{hist||''}</div>;
                        })()}
                      </div>
                    </td>
                  );
                })}

                {/* Supprimer série */}
                <td style={{padding:'2px',verticalAlign:'middle'}}>
                  {series.length > 1 && (
                    <button onClick={() => removeSerie(si)} style={{background:'none',border:'none',cursor:'pointer',color:'#EF444466',fontSize:14,padding:'4px',fontFamily:'inherit'}}>✕</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Ajouter série */}
        <button onClick={addSerie} style={{...S.btnO,width:'100%',marginTop:8,padding:'10px',fontSize:13}}>
          <IC.plus/> Ajouter une série
        </button>
      </div>

      {/* Modal historique */}
      {showHist && (
        <div style={S.overlay} onClick={e=>{ if(e.target===e.currentTarget) setShowHist(false); }}>
          <div style={{...S.modal, maxHeight:'85vh', display:'flex', flexDirection:'column'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14,flexShrink:0}}>
              <div style={{fontSize:16,fontWeight:700}}>Historique — {circuit.name}</div>
              <button style={S.btnG} onClick={()=>setShowHist(false)}><IC.close/></button>
            </div>
            <div style={{overflowY:'auto',flex:1}}>
              {circuitHistory.length === 0 && <div style={{textAlign:'center',padding:40,color:'#555',fontSize:14}}>Aucune séance précédente</div>}
              {circuitHistory.map((entry, idx) => (
                <div key={idx} style={{marginBottom:16}}>
                  <div style={{fontSize:12,color:'#555',marginBottom:8,fontWeight:600}}>
                    {new Date(entry.date).toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'long'})}
                    <span style={{marginLeft:8,color:'#444'}}>{entry.series.length} séries</span>
                  </div>
                  <div style={{overflowX:'auto'}}>
                    <table style={{borderCollapse:'separate',borderSpacing:'3px'}}>
                      <thead>
                        <tr>
                          <th style={{fontSize:10,color:'#555',fontWeight:700,textAlign:'left',padding:'0 4px 4px',textTransform:'uppercase'}}>Sér.</th>
                          {entry.exos.map((ex,ei)=>(
                            <th key={ei} style={{fontSize:10,color:'#aaa',fontWeight:700,textAlign:'center',padding:'0 2px 4px',minWidth:40}}>
                              <div style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:56}}>{ex.name}</div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(()=>{
                          // circuitHistory déjà filtré par circuitId → idx+1 = séance précédente du même circuit
                          const prevEntry = circuitHistory[idx+1] || null;
                          return entry.series.map((row,si)=>{
                          return(
                            <tr key={si}>
                              <td style={{fontSize:11,fontWeight:700,color:'#555',padding:'2px 4px 2px 0'}}>{si+1}</td>
                              {row.map((val,ei)=>{
                                const cur  = parseInt(val)||0;
                                const prev = prevEntry&&prevEntry.series[si] ? parseInt(prevEntry.series[si][ei])||0 : null;
                                const color = !cur?'#555':prev===null?'#E8E8EA':cur>prev?'#22C55E':cur===prev?'#F59E0B':'#EF4444';
                                const bg    = !cur?'transparent':prev===null?'#1E1E22':cur>prev?'#22C55E11':cur===prev?'#F59E0B11':'#EF444411';
                                const bdr   = !cur?'1px solid #222':prev===null?'1px solid #2A2A2E':cur>prev?'1px solid #22C55E33':cur===prev?'1px solid #F59E0B33':'1px solid #EF444433';
                                return(
                                  <td key={ei} style={{padding:'2px'}}>
                                    <div style={{background:bg,border:bdr,borderRadius:6,padding:'5px 4px',textAlign:'center',fontSize:12,fontWeight:700,color,minWidth:38}}>{val||'—'}</div>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
