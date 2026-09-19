(function(){
const {
  useState: uSW,
  useEffect: uEW,
  useRef: uRW,
  useCallback: uCW
} = React;
const S = window.S,
  IC = window.IC,
  colH = window.colH,
  tBtn = window.tBtn;
window.WorkoutScreen = function WorkoutScreen({
  wo,
  setWo,
  onFinish,
  onCancel,
  history,
  exLib,
  setExLib
}) {
  const [timerLeft, setTimerLeft] = uSW(0);
  const [timerOn, setTimerOn] = uSW(false);
  const [totalEl, setTotalEl] = uSW(0);
  const [showExStats, setShowExStats] = uSW(null);
  const [showEditEmom, setShowEditEmom] = uSW(false);
  const [showEditRm, setShowEditRm] = uSW(false);
  const [showAddEx, setShowAddEx] = uSW(false);
  const [addExN, setAddExN] = uSW('');
  const [addExSets, setAddExSets] = uSW('4');
  const [addExEmom, setAddExEmom] = uSW('90');
  const [tempV, setTempV] = uSW('');
  const [restOn, setRestOn] = uSW(false);
  const [restLeft, setRestLeft] = uSW(0);
  const [defaultRest, setDefaultRest] = uSW(120);
  const [showEditRest, setShowEditRest] = uSW(false);
  const [showEditPy, setShowEditPy] = uSW(null); // {pyRows,pyCols,pyX,pyY} en cours d'édition
  const [wsGoals, setWsGoals] = uSW(() => window.load(window.SK.goals) || {});
  const [showGoalFormWS, setShowGoalFormWS] = uSW(false);
  const [gKgWS, setGKgWS] = uSW('');
  const [gRepsWS, setGRepsWS] = uSW('');
  const [gDateWS, setGDateWS] = uSW('');
  const iRef = uRW(null),
    tRef = uRW(null),
    avRef = uRW(null),
    restRef = uRW(null);
  const Modal = window.Modal,
    ExHistoryTable = window.ExHistoryTable;
  uEW(() => {
    save(window.SK.draft, wo);
  }, [wo]);
  uEW(() => {
    window.save(window.SK.goals, wsGoals);
  }, [wsGoals]);
  const ex = wo.exercises[wo.currentExIndex];
  const emomS = ex ? ex.emomTime || 90 : 90;
  uEW(() => {
    tRef.current = setInterval(() => setTotalEl(p => p + 1), 1000);
    return () => clearInterval(tRef.current);
  }, []);
  uEW(() => {
    if (restOn && restLeft > 0) {
      restRef.current = setInterval(() => {
        setRestLeft(p => {
          if (p <= 1) {
            clearInterval(restRef.current);
            setRestOn(false);
            return 0;
          }
          return p - 1;
        });
      }, 1000);
      return () => clearInterval(restRef.current);
    }
  }, [restOn, restLeft]);
  avRef.current = () => {
    setWo(prev => {
      const n = window.dcw(prev);
      const ce = n.exercises[n.currentExIndex];
      const cs = n.currentSet;
      if (ce && cs < ce.sets.length) {
        ce.sets[cs].done = true;
        if (cs + 1 < ce.sets.length) {
          n.currentSet = cs + 1;
          setTimeout(() => {
            setTimerLeft(ce.emomTime || 90);
            setTimerOn(true);
          }, 300);
        } else {
          if (n.currentExIndex + 1 < n.exercises.length) {
            const restDur = ce.restTime || defaultRest;
            n.currentExIndex += 1;
            n.currentSet = window.fnu(n.exercises[n.currentExIndex]);
            setDefaultRest(restDur);
            setRestLeft(restDur);
            setRestOn(true);
          }
          setTimerOn(false);
          setTimerLeft(0);
        }
      }
      return n;
    });
  };
  uEW(() => {
    if (timerOn && timerLeft > 0) {
      iRef.current = setInterval(() => {
        setTimerLeft(p => {
          const next = p - 1;
          if (next <= 0) {
            clearInterval(iRef.current);
            avRef.current();
            return 0;
          }
          return next;
        });
      }, 1000);
      return () => clearInterval(iRef.current);
    }
  }, [timerOn, timerLeft]);

  // Libère le wake lock en quittant la séance
  uEW(() => () => {
    window._wantWakeLock = false;
    window.releaseWakeLock && window.releaseWakeLock();
  }, []);
  const start = () => {
    window._wantWakeLock = true;
    window.requestWakeLock && window.requestWakeLock();
    setTimerLeft(emomS);
    setTimerOn(true);
    if (restOn) {
      clearInterval(restRef.current);
      setRestOn(false);
      setRestLeft(0);
    }
  };
  const stopV = () => {
    clearInterval(iRef.current);
    setTimerOn(false);
    setTimerLeft(0);
    avRef.current();
  };
  const skip = () => {
    clearInterval(iRef.current);
    setTimerOn(false);
    avRef.current();
  };
  const adj = d => setTimerLeft(p => Math.max(0, p + d));
  const adjRest = d => setRestLeft(p => Math.max(0, p + d));
  const skipRest = () => {
    clearInterval(restRef.current);
    setRestOn(false);
    setRestLeft(0);
  };
  const upSet = (si, f, v) => {
    setWo(p => {
      const n = window.dcw(p);
      n.exercises[n.currentExIndex].sets[si][f] = v;
      return n;
    });
  };
  const adjKg = (si, delta) => {
    setWo(p => {
      const n = window.dcw(p);
      const cur = parseFloat(n.exercises[n.currentExIndex].sets[si].kg) || 0;
      const nv = Math.max(0, Math.round((cur + delta) * 100) / 100);
      n.exercises[n.currentExIndex].sets[si].kg = nv === 0 ? '' : String(nv);
      return n;
    });
  };
  const togSet = si => {
    setWo(p => {
      const n = window.dcw(p);
      n.exercises[n.currentExIndex].sets[si].done = !n.exercises[n.currentExIndex].sets[si].done;
      return n;
    });
  };
  const validateAll = () => {
    setWo(p => {
      const n = window.dcw(p);
      n.exercises[n.currentExIndex].sets.forEach(s => {
        s.done = true;
      });
      return n;
    });
  };
  const addSet = () => {
    setWo(p => {
      const n = window.dcw(p);
      n.exercises[n.currentExIndex].sets.push({
        kg: '',
        reps: '',
        done: false
      });
      n.exercises[n.currentExIndex].nbSets += 1;
      return n;
    });
  };
  const removeSet = () => {
    setWo(p => {
      const n = window.dcw(p);
      const ce = n.exercises[n.currentExIndex];
      if (ce.sets.length <= 1) return n;
      ce.sets.pop();
      ce.nbSets = ce.sets.length;
      if (n.currentSet >= ce.sets.length) n.currentSet = ce.sets.length - 1;
      return n;
    });
  };
  const goEx = i => {
    clearInterval(iRef.current);
    setTimerOn(false);
    setTimerLeft(0);
    if (restOn) {
      clearInterval(restRef.current);
      setRestOn(false);
      setRestLeft(0);
    }
    setWo(p => ({
      ...p,
      currentExIndex: i,
      currentSet: window.fnu(p.exercises[i])
    }));
  };
  const progress = timerOn ? (emomS - timerLeft) / emomS * 100 : 0;
  const last2 = ex ? window.getExHist(history, ex.name).slice(0, 2) : [];

  // Facteur d'ajustement selon sommeil + nutrition
  const contextFactor = (() => {
    const sleepAdj = [-0.10, -0.05, 0, +0.02]; // <6h, 6-7h, 7-8h, 8h+
    const nutriAdj = [-0.08, 0, +0.02]; // légère, correcte, optimale
    const s = wo.sleep !== null ? sleepAdj[wo.sleep] ?? 0 : 0;
    const n = wo.nutrition !== null ? nutriAdj[wo.nutrition] ?? 0 : 0;
    return 1 + s + n;
  })();
  const exGoal = ex ? wsGoals[ex.name] || null : null;
  const exNextTarget = (() => {
    if (!exGoal || !exGoal.date || !ex) return null;
    const rd = [...history].reverse().flatMap(h => h.exercises.filter(e => e.name === ex.name).map(e => ({
      date: h.date,
      maxKg: Math.max(0, ...e.sets.filter(s => s.done).map(s => parseFloat(s.kg) || 0)),
      sets: e.sets.filter(s => s.done)
    }))).filter(d => d.sets.length > 0);
    if (rd.length === 0) return null;
    const s = rd[rd.length - 1];
    const sd = new Date(s.date);
    const ed = new Date(exGoal.date);
    const msW = 7 * 24 * 3600 * 1000;
    const tw = Math.max(1, Math.round((ed - sd) / msW));
    const kpw = (exGoal.kg - s.maxKg) / tw;
    const now = new Date();
    const pts = [];
    for (let w = 0; w <= tw; w++) {
      const d = new Date(sd.getTime() + w * msW);
      pts.push({
        date: d,
        kg: Math.round((s.maxKg + kpw * w) * 100) / 100
      });
    }
    return pts.find(t => t.date > now) || (pts.length > 0 ? pts[pts.length - 1] : null);
  })();
  const stepStyle = done => ({
    background: done ? 'transparent' : '#2A2A2E',
    border: 'none',
    borderRadius: 6,
    color: done ? S.green : '#aaa',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    width: 28,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontFamily: 'inherit'
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      ...S.app,
      paddingBottom: ex && ex.pyramid ? 40 : 220
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: S.header
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: S.btnG,
    onClick: onCancel
  }, /*#__PURE__*/React.createElement(IC.back, null)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600
    }
  }, "Entra\xEEnement"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: S.blue
    }
  }, window.fmt(totalEl)))), /*#__PURE__*/React.createElement("button", {
    style: {
      background: S.blue,
      color: '#fff',
      border: 'none',
      borderRadius: 8,
      padding: '8px 16px',
      fontSize: 14,
      fontWeight: 700,
      cursor: 'pointer',
      fontFamily: 'inherit'
    },
    onClick: () => onFinish(wo)
  }, "Terminer")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      padding: '12px 14px',
      overflowX: 'auto'
    }
  }, wo.exercises.map((e, i) => {
    const done = e.pyramid ? !!e.pyDone : e.sets.every(s => s.done);
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      onClick: () => goEx(i),
      style: {
        background: i === wo.currentExIndex ? '#1E1E22' : 'transparent',
        border: i === wo.currentExIndex ? '1px solid #333' : '1px solid transparent',
        borderRadius: 8,
        padding: '6px 14px',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'inherit',
        color: done ? S.green : i === wo.currentExIndex ? '#fff' : '#666',
        whiteSpace: 'nowrap',
        flexShrink: 0
      }
    }, e.name || 'Exo ' + (i + 1));
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setAddExN('');
      setAddExSets('4');
      setAddExEmom('90');
      setShowAddEx(true);
    },
    style: {
      background: 'transparent',
      border: '1px solid #2A2A2E',
      borderRadius: 8,
      padding: '6px 12px',
      fontSize: 13,
      cursor: 'pointer',
      fontFamily: 'inherit',
      color: S.blue,
      whiteSpace: 'nowrap',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(IC.plus, null))), ex && /*#__PURE__*/React.createElement("div", {
    style: S.card
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 38,
      borderRadius: '50%',
      background: '#1E1E22',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(IC.dumbbell, null)), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowExStats(ex.name),
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'inherit',
      textAlign: 'left',
      padding: 0,
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 700,
      color: '#E8E8EA',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, ex.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: S.blue,
      marginTop: 1,
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(IC.chartBar, null), " Voir stats & historique")), ex.pyramid ? /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowEditPy({
      pyRows: String(ex.pyRows || 3),
      pyCols: String(ex.pyCols || 5),
      pyX: String(ex.pyX || 60),
      pyY: String(ex.pyY || 120)
    }),
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: 0,
      flexShrink: 0,
      fontFamily: 'inherit'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 3,
      color: S.orange,
      fontSize: 12,
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement(IC.clock, null), " ", Math.floor((ex.pyX || 60) / 60), "m", (ex.pyX || 60) % 60 > 0 ? (ex.pyX || 60) % 60 + 's' : '', " ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#555'
    }
  }, /*#__PURE__*/React.createElement(IC.edit, null))), /*#__PURE__*/React.createElement("span", {
    style: {
      background: '#F59E0B22',
      borderRadius: 6,
      padding: '2px 10px',
      fontSize: 13,
      fontWeight: 700,
      border: '1px solid #F59E0B44',
      color: S.orange
    }
  }, ex.pyRows, "\xD7", ex.pyCols)) : /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setTempV(String(ex.emomTime));
      setShowEditEmom(true);
    },
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: 0,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 3,
      color: S.blue,
      fontSize: 12,
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement(IC.clock, null), " ", Math.floor(ex.emomTime / 60), "m", ex.emomTime % 60 > 0 ? ex.emomTime % 60 + 's' : '', " ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#555'
    }
  }, /*#__PURE__*/React.createElement(IC.edit, null))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: '#555'
    }
  }, "\xD7"), /*#__PURE__*/React.createElement("span", {
    style: {
      background: '#1E1E22',
      borderRadius: 6,
      padding: '2px 10px',
      fontSize: 13,
      fontWeight: 700,
      border: '1px solid #333',
      color: '#fff'
    }
  }, ex.sets.length))), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setTempV(String(ex.rm || ''));
      setShowEditRm(true);
    },
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 10,
      flexWrap: 'wrap',
      padding: 0,
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      background: '#1A1A2E',
      border: '1px solid #2A2A3E',
      borderRadius: 6,
      padding: '5px 10px',
      fontSize: 13,
      fontWeight: 600,
      color: '#ccc',
      display: 'flex',
      alignItems: 'center',
      gap: 5
    }
  }, "1RM ", ex.rm || '—', "kg ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#555'
    }
  }, /*#__PURE__*/React.createElement(IC.edit, null))), ex.rm && window.calcP(Number(ex.rm)).map((v, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: '#8B8BFF'
    }
  }, v, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: '#6060cc',
      fontWeight: 500
    }
  }, "\xD7", window.repsAt[i])))), !ex.pyramid && last2.length > 0 && (() => {
    const liveEx2 = wo.exercises.find(e => e.name === ex.name);
    const liveDone2 = liveEx2 ? liveEx2.sets.filter(s => s.done) : [];
    const liveMaxKg2 = liveDone2.length > 0 ? Math.max(0, ...liveDone2.map(s => parseFloat(s.kg) || 0)) : 0;
    const liveVol2 = liveDone2.reduce((a, s) => a + (parseFloat(s.kg) || 0) * (parseFloat(s.reps) || 0), 0);
    const lp2 = liveMaxKg2 > 0 ? {
      maxKg: liveMaxKg2,
      vol: liveVol2,
      date: wo.startedAt
    } : null;
    const allHist = window.getExHist(history, ex.name);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        marginBottom: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        background: '#111113',
        borderRadius: 8,
        padding: '5px 8px',
        border: '1px solid #1A1A1E'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: '#444',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: 4
      }
    }, "Derni\xE8res s\xE9ances"), last2.map((entry, li) => {
      const prevE = last2[li + 1];
      const done = entry.sets.filter(s => s.done);
      const prevDone = prevE ? prevE.sets.filter(s => s.done) : [];
      const sp = prevE ? window.getSessionPerf(done, prevDone) : 'neutral';
      return /*#__PURE__*/React.createElement("div", {
        key: li,
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: li < last2.length - 1 ? 3 : 0
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 10,
          color: '#555',
          minWidth: 36,
          flexShrink: 0
        }
      }, window.dateFr(entry.date)), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          gap: 3,
          flexWrap: 'wrap',
          alignItems: 'center'
        }
      }, done.map((s, j) => /*#__PURE__*/React.createElement("span", {
        key: j,
        style: {
          fontSize: 11,
          color: '#bbb',
          fontWeight: 600
        }
      }, s.kg ? s.kg + '×' : '', s.reps)), sp !== 'neutral' && /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 10,
          color: window.perfC[sp],
          fontWeight: 800
        }
      }, window.perfI[sp])));
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        background: '#111113',
        borderRadius: 8,
        padding: '6px 8px',
        border: '1px solid #1A1A1E'
      }
    }, /*#__PURE__*/React.createElement(window.ExComboChart, {
      exName: ex.name,
      hist: history,
      goal: wsGoals[ex.name] || null,
      height: 90,
      livePoint: lp2,
      compact: true,
      maxPoints: 5,
      targetKg: exNextTarget ? Math.round(exNextTarget.kg * contextFactor) : null
    })));
  })(), ex && ex.pyramid ? /*#__PURE__*/React.createElement(window.PyramidGrid, {
    ex: ex,
    onChange: g => setWo(p => {
      const n = window.dcw(p);
      n.exercises[n.currentExIndex].pyGrid = g;
      return n;
    }),
    onDone: v => setWo(p => {
      const n = window.dcw(p);
      n.exercises[n.currentExIndex].pyDone = v;
      return n;
    })
  }) : (() => {
    const isBW = ex.bodyweight;
    const cols = isBW ? '28px 1fr 58px 62px 34px' : '28px 1fr 58px 120px 62px 34px';
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: cols,
        gap: 4,
        padding: '6px 0',
        borderBottom: '1px solid #222',
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: colH
    }, "S\xE9r."), /*#__PURE__*/React.createElement("span", {
      style: colH
    }, "Pr\xE9c."), /*#__PURE__*/React.createElement("span", {
      style: {
        ...colH,
        textAlign: 'center',
        color: S.blue
      }
    }, "Cible"), !isBW && /*#__PURE__*/React.createElement("span", {
      style: {
        ...colH,
        textAlign: 'center'
      }
    }, "KG"), /*#__PURE__*/React.createElement("span", {
      style: {
        ...colH,
        textAlign: 'center'
      }
    }, "R\xE9ps"), /*#__PURE__*/React.createElement("span", {
      style: {
        ...colH,
        textAlign: 'center'
      }
    }, "\u2713")), ex.sets.map((set, si) => {
      const prev = window.getLastPerf(history, ex.name, si);
      const isCur = si === wo.currentSet && !set.done;
      const prevSet = last2[0] ? last2[0].sets.filter(s => s.done)[si] : undefined;
      const p = set.done && prevSet ? window.perf(set, prevSet) : 'neutral';
      return /*#__PURE__*/React.createElement("div", {
        key: si,
        style: {
          display: 'grid',
          gridTemplateColumns: cols,
          gap: 4,
          alignItems: 'center',
          padding: '6px 0',
          borderRadius: 8,
          background: set.done ? S.greenBg : isCur ? '#1a1a2e' : 'transparent',
          transition: 'background 0.3s'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 14,
          fontWeight: 700,
          color: set.done ? S.green : '#aaa',
          paddingLeft: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }
      }, si + 1, set.done && p !== 'neutral' && /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 9,
          color: window.perfC[p]
        }
      }, window.perfI[p])), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 12,
          color: '#555'
        }
      }, prev ? (prev.kg ? prev.kg + '×' : '') + prev.reps : '—'), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11,
          fontWeight: 600,
          color: S.blue,
          textAlign: 'center'
        }
      }, exNextTarget ? Math.round(exNextTarget.kg * contextFactor) + '×' + exGoal.reps : '—'), !isBW && /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }
      }, /*#__PURE__*/React.createElement("button", {
        style: stepStyle(set.done),
        onClick: () => adjKg(si, -1.25)
      }, "\u2212"), /*#__PURE__*/React.createElement("input", {
        style: {
          ...S.inpS,
          flex: 1,
          minWidth: 0,
          background: set.done ? 'transparent' : '#1E1E22',
          color: set.done ? S.green : '#fff',
          border: set.done ? '1px solid #22C55E44' : '1px solid #2A2A2E',
          fontSize: 14,
          padding: '6px 2px'
        },
        type: "number",
        placeholder: "kg",
        value: set.kg,
        onChange: e => upSet(si, 'kg', e.target.value)
      }), /*#__PURE__*/React.createElement("button", {
        style: stepStyle(set.done),
        onClick: () => adjKg(si, 1.25)
      }, "+")), /*#__PURE__*/React.createElement("input", {
        style: {
          ...S.inpS,
          background: set.done ? 'transparent' : '#1E1E22',
          color: set.done ? S.green : '#fff',
          border: set.done ? '1px solid #22C55E44' : '1px solid #2A2A2E',
          fontSize: 14,
          padding: '6px 4px'
        },
        type: "number",
        placeholder: "r\xE9ps",
        value: set.reps,
        onChange: e => upSet(si, 'reps', e.target.value)
      }), /*#__PURE__*/React.createElement("button", {
        style: {
          ...S.btnG,
          justifyContent: 'center'
        },
        onClick: () => togSet(si)
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: 26,
          height: 26,
          borderRadius: '50%',
          background: set.done ? S.green : '#222',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
          color: set.done ? '#fff' : '#444'
        }
      }, /*#__PURE__*/React.createElement(IC.check, null))));
    }));
  })(), !(ex && ex.pyramid) && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: addSet,
    style: {
      ...S.btnO,
      flex: 1,
      padding: '8px',
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement(IC.plus, null), " S\xE9rie"), ex.sets.length > 1 && /*#__PURE__*/React.createElement("button", {
    onClick: removeSet,
    style: {
      ...S.btnO,
      flex: 1,
      padding: '8px',
      fontSize: 13,
      color: S.red,
      borderColor: '#991B1B'
    }
  }, /*#__PURE__*/React.createElement(IC.minus, null), " S\xE9rie")), !ex.sets.every(s => s.done) && /*#__PURE__*/React.createElement("button", {
    onClick: validateAll,
    style: {
      ...S.btn,
      marginTop: 8,
      background: S.green,
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(IC.checkAll, null), " Tout valider"))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 480,
      background: '#131315',
      borderTop: '1px solid #222',
      zIndex: 30,
      display: ex && ex.pyramid ? 'none' : 'block'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 3,
      background: '#1A1A1E',
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      background: timerOn ? S.blue : restOn ? S.orange : S.blue,
      width: (timerOn ? progress : restOn ? (defaultRest - restLeft) / defaultRest * 100 : 0) + '%',
      transition: 'width 1s linear'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 18px calc(14px + env(safe-area-inset-bottom, 0px))'
    }
  }, restOn && !timerOn ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      color: S.orange,
      fontSize: 13,
      fontWeight: 600,
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement(IC.coffee, null), " Repos entre exercices ", /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setTempV(String(defaultRest));
      setShowEditRest(true);
    },
    style: {
      background: 'none',
      border: 'none',
      color: '#555',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      marginLeft: 4
    }
  }, /*#__PURE__*/React.createElement(IC.edit, null))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 48,
      fontWeight: 800,
      fontVariantNumeric: 'tabular-nums',
      color: restLeft <= 5 ? S.red : '#fff',
      transition: 'color 0.3s'
    }
  }, window.fmt(restLeft))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => adjRest(-15),
    style: tBtn
  }, "-15"), /*#__PURE__*/React.createElement("button", {
    onClick: () => adjRest(15),
    style: tBtn
  }, "+15"), /*#__PURE__*/React.createElement("button", {
    onClick: skipRest,
    style: {
      background: S.blue,
      color: '#fff',
      border: 'none',
      borderRadius: 10,
      padding: '10px',
      fontSize: 15,
      fontWeight: 700,
      cursor: 'pointer',
      fontFamily: 'inherit'
    }
  }, "Passer"))) : !timerOn && timerLeft === 0 ? /*#__PURE__*/React.createElement("button", {
    style: {
      ...S.btn,
      fontSize: 18,
      padding: '16px 20px'
    },
    onClick: start
  }, /*#__PURE__*/React.createElement(IC.play, null), " EMOM \u2014 ", Math.floor(emomS / 60), ":", (emomS % 60).toString().padStart(2, '0')) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      fontSize: 48,
      fontWeight: 800,
      fontVariantNumeric: 'tabular-nums',
      letterSpacing: '-0.03em',
      color: timerLeft <= 5 ? S.red : timerLeft <= 10 ? S.orange : '#fff',
      marginBottom: 12,
      transition: 'color 0.3s'
    }
  }, window.fmt(timerLeft)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr 1fr',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => adj(-15),
    style: tBtn
  }, "-15"), /*#__PURE__*/React.createElement("button", {
    onClick: () => adj(15),
    style: tBtn
  }, "+15"), /*#__PURE__*/React.createElement("button", {
    onClick: stopV,
    style: {
      ...tBtn,
      background: '#7F1D1D',
      color: '#FCA5A5',
      border: '1px solid #991B1B'
    }
  }, /*#__PURE__*/React.createElement(IC.stop, null), " Stop"), /*#__PURE__*/React.createElement("button", {
    onClick: skip,
    style: {
      background: S.blue,
      color: '#fff',
      border: 'none',
      borderRadius: 10,
      padding: '10px',
      fontSize: 15,
      fontWeight: 700,
      cursor: 'pointer',
      fontFamily: 'inherit'
    }
  }, "Passer"))))), showExStats && (() => {
    const isPy = (wo.exercises.find(e => e.name === showExStats) || {}).pyramid || history.some(h => h.exercises.some(e => e.name === showExStats && e.pyramid));
    if (!isPy) return null;
    return /*#__PURE__*/React.createElement(Modal, {
      onClose: () => setShowExStats(null)
    }, /*#__PURE__*/React.createElement(ExHistoryTable, {
      exName: showExStats,
      history: history,
      onClose: () => setShowExStats(null)
    }));
  })(), showExStats && (() => {
    const isPy = (wo.exercises.find(e => e.name === showExStats) || {}).pyramid || history.some(h => h.exercises.some(e => e.name === showExStats && e.pyramid));
    if (isPy) return null;
    const rd = [...history].reverse().flatMap(h => h.exercises.filter(e => e.name === showExStats).map(e => ({
      date: h.date,
      sets: e.sets.filter(s => s.done),
      maxKg: Math.max(0, ...e.sets.filter(s => s.done).map(s => parseFloat(s.kg) || 0)),
      vol: e.sets.filter(s => s.done).reduce((a, s) => a + (parseFloat(s.kg) || 0) * (parseFloat(s.reps) || 0), 0)
    }))).filter(d => d.sets.length > 0);
    const globalMaxKg = rd.length ? Math.max(...rd.map(d => d.maxKg)) : 0;
    const maxSets = rd.reduce((m, d) => Math.max(m, d.sets.length), 0);
    const goal = wsGoals[showExStats] || null;
    const startKg = rd.length > 0 ? rd[0].maxKg : 0;
    const goalReached = goal ? globalMaxKg >= goal.kg : false;
    const pctGoal = goal && goal.kg > startKg ? Math.min(100, Math.round((globalMaxKg - startKg) / (goal.kg - startKg) * 100)) : goalReached ? 100 : 0;
    const deadlineLabel = goal && goal.date ? new Date(goal.date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }) : '';
    const targetCurve = (() => {
      if (!goal || !goal.date || rd.length === 0) return [];
      const s = rd[rd.length - 1];
      const sd = new Date(s.date);
      const ed = new Date(goal.date);
      const msW = 7 * 24 * 3600 * 1000;
      const tw = Math.max(1, Math.round((ed - sd) / msW));
      const kpw = (goal.kg - s.maxKg) / tw;
      const pts = [];
      for (let w = 0; w <= tw; w++) {
        const d = new Date(sd.getTime() + w * msW);
        pts.push({
          date: d,
          kg: Math.round((s.maxKg + kpw * w) * 100) / 100
        });
      }
      return pts;
    })();
    const now = new Date();
    let curTarget = targetCurve.length > 0 ? targetCurve[0] : null;
    for (const t of targetCurve) {
      if (t.date <= now) curTarget = t;else break;
    }
    const nextTarget = targetCurve.find(t => t.date > now) || (targetCurve.length > 0 ? targetCurve[targetCurve.length - 1] : null);
    const curveDiff = curTarget ? Math.round((globalMaxKg - curTarget.kg) * 100) / 100 : null;
    const onTrack = curveDiff !== null && curveDiff >= 0;
    return /*#__PURE__*/React.createElement(Modal, {
      onClose: () => setShowExStats(null)
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 17,
        fontWeight: 700
      }
    }, showExStats), /*#__PURE__*/React.createElement("button", {
      style: S.btnG,
      onClick: () => setShowExStats(null)
    }, /*#__PURE__*/React.createElement(IC.close, null))), rd.length === 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        color: '#555',
        textAlign: 'center',
        padding: 30,
        fontSize: 14
      }
    }, "Aucun historique"), rd.length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, rd.length >= 2 && (() => {
      const liveEx = wo.exercises.find(e => e.name === showExStats);
      const liveDone = liveEx ? liveEx.sets.filter(s => s.done) : [];
      const liveMaxKg = liveDone.length > 0 ? Math.max(0, ...liveDone.map(s => parseFloat(s.kg) || 0)) : 0;
      const liveVol = liveDone.reduce((a, s) => a + (parseFloat(s.kg) || 0) * (parseFloat(s.reps) || 0), 0);
      const lp = liveMaxKg > 0 ? {
        maxKg: liveMaxKg,
        vol: liveVol,
        date: wo.startedAt
      } : null;
      return /*#__PURE__*/React.createElement("div", {
        style: {
          marginBottom: 12
        }
      }, /*#__PURE__*/React.createElement(window.ExComboChart, {
        exName: showExStats,
        hist: history,
        goal: goal,
        height: 160,
        livePoint: lp
      }));
    })(), /*#__PURE__*/React.createElement("div", {
      style: {
        borderTop: '1px solid #222',
        paddingTop: 12,
        marginBottom: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        fontWeight: 700,
        color: '#aaa',
        textTransform: 'uppercase',
        letterSpacing: '0.06em'
      }
    }, "Objectif"), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        if (goal) {
          setGKgWS(String(goal.kg));
          setGRepsWS(String(goal.reps));
          setGDateWS(goal.date);
        } else {
          setGKgWS('');
          setGRepsWS('');
          const d = new Date();
          d.setDate(d.getDate() + 56);
          setGDateWS(d.toISOString().slice(0, 10));
        }
        setShowGoalFormWS(true);
      },
      style: {
        background: '#1E1E22',
        border: '1px solid #2A2A2E',
        borderRadius: 8,
        padding: '4px 12px',
        fontSize: 12,
        color: '#aaa',
        cursor: 'pointer',
        fontFamily: 'inherit'
      }
    }, "\u270E ", goal ? 'Modifier' : 'Définir')), !goal && !showGoalFormWS && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        color: '#444',
        textAlign: 'center',
        padding: '10px 0'
      }
    }, "Aucun objectif d\xE9fini"), goal && !showGoalFormWS && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        background: '#1A1A2E',
        border: '1px solid #2A2A3E',
        borderRadius: 8,
        padding: '8px 10px'
      }
    }, nextTarget && !goalReached && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 7
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 9,
        color: '#555',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginBottom: 2
      }
    }, "Prochaine cible"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        color: '#E8E8EA'
      }
    }, nextTarget.kg.toFixed(1), " kg \xD7 ", goal.reps, " reps")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: '#555',
        textAlign: 'right'
      }
    }, nextTarget.date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: '#222',
        borderRadius: 4,
        height: 5,
        marginBottom: 4,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: '100%',
        borderRadius: 4,
        width: Math.max(0, pctGoal) + '%',
        background: pctGoal >= 100 ? S.green : S.blue,
        transition: 'width .5s'
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 11
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: '#666'
      }
    }, globalMaxKg, " kg"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 700,
        color: '#aaa'
      }
    }, Math.max(0, pctGoal), "%"), /*#__PURE__*/React.createElement("span", {
      style: {
        color: S.green,
        fontWeight: 600
      }
    }, goal.kg, " kg")))), showGoalFormWS && /*#__PURE__*/React.createElement("div", {
      style: {
        background: '#111113',
        borderRadius: 10,
        padding: '14px',
        border: '1px solid #222'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 8,
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: '#555',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginBottom: 4
      }
    }, "Charge (kg)"), /*#__PURE__*/React.createElement("input", {
      style: S.inpS,
      type: "number",
      value: gKgWS,
      onChange: e => setGKgWS(e.target.value),
      placeholder: "40"
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: '#555',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginBottom: 4
      }
    }, "Reps cibles"), /*#__PURE__*/React.createElement("input", {
      style: S.inpS,
      type: "number",
      value: gRepsWS,
      onChange: e => setGRepsWS(e.target.value),
      placeholder: "8"
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10,
        color: '#555',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginBottom: 4
      }
    }, "Date limite"), /*#__PURE__*/React.createElement("input", {
      style: {
        ...S.inpS,
        fontSize: 11
      },
      type: "date",
      value: gDateWS,
      onChange: e => setGDateWS(e.target.value)
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("button", {
      style: {
        ...S.btn,
        flex: 1
      },
      onClick: () => {
        const kg = parseFloat(gKgWS);
        const reps = parseInt(gRepsWS);
        if (!kg || !reps || !gDateWS) return;
        setWsGoals(p => ({
          ...p,
          [showExStats]: {
            kg,
            reps,
            date: gDateWS
          }
        }));
        setShowGoalFormWS(false);
      }
    }, "Enregistrer"), /*#__PURE__*/React.createElement("button", {
      style: {
        ...S.btnO,
        flex: 1,
        color: '#888',
        borderColor: '#333'
      },
      onClick: () => setShowGoalFormWS(false)
    }, "Annuler"), goal && /*#__PURE__*/React.createElement("button", {
      style: {
        ...S.btnG,
        color: S.red,
        border: '1px solid #991B1B',
        borderRadius: 10,
        padding: '8px 12px'
      },
      onClick: () => {
        setWsGoals(p => {
          const n = {
            ...p
          };
          delete n[showExStats];
          return n;
        });
        setShowGoalFormWS(false);
      }
    }, "Suppr.")))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: '#555',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginBottom: 8
      }
    }, "Historique des s\xE9ances"), /*#__PURE__*/React.createElement("div", {
      style: {
        overflowX: 'auto'
      }
    }, /*#__PURE__*/React.createElement("table", {
      style: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: 13
      }
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
      style: {
        borderBottom: '2px solid #2A2A2E'
      }
    }, /*#__PURE__*/React.createElement("th", {
      style: {
        ...window.thS,
        textAlign: 'left',
        minWidth: 58
      }
    }, "Date"), Array.from({
      length: maxSets
    }, (_, i) => /*#__PURE__*/React.createElement("th", {
      key: i,
      style: {
        ...window.thS,
        textAlign: 'center',
        minWidth: 66
      }
    }, "S", i + 1)), /*#__PURE__*/React.createElement("th", {
      style: {
        ...window.thS,
        textAlign: 'center',
        minWidth: 48
      }
    }, "Vol."))), /*#__PURE__*/React.createElement("tbody", null, [...rd].reverse().map((d, i, arr) => {
      const pr2 = arr[i + 1];
      const vd = pr2 && pr2.vol > 0 ? Math.round((d.vol - pr2.vol) / pr2.vol * 100) : null;
      const vc = vd === null ? '#555' : vd > 0 ? S.green : vd < 0 ? S.red : S.orange;
      return /*#__PURE__*/React.createElement("tr", {
        key: i,
        style: {
          borderBottom: '1px solid #1E1E22'
        }
      }, /*#__PURE__*/React.createElement("td", {
        style: {
          padding: '8px 4px 8px 0',
          color: '#aaa',
          fontSize: 12,
          whiteSpace: 'nowrap'
        }
      }, window.dateFr(d.date)), Array.from({
        length: maxSets
      }, (_, si) => {
        const s = d.sets[si];
        return /*#__PURE__*/React.createElement("td", {
          key: si,
          style: {
            padding: '8px 4px',
            textAlign: 'center',
            fontWeight: 600,
            color: s ? '#E8E8EA' : '#333'
          }
        }, s ? (s.kg ? s.kg + '×' : '') + s.reps : '—');
      }), /*#__PURE__*/React.createElement("td", {
        style: {
          padding: '8px 4px',
          textAlign: 'center',
          color: vc,
          fontSize: 12,
          fontWeight: 700
        }
      }, vd === null ? d.vol : (vd > 0 ? '▲ +' : vd < 0 ? '▼ ' : '= ') + vd + '%'));
    })))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 14,
        marginTop: 12,
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: S.green
      }
    }, "\u25B2 Progression"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: S.orange
      }
    }, "= Stable"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: S.red
      }
    }, "\u25BC R\xE9gression"))));
  })(), showEditPy && /*#__PURE__*/React.createElement(Modal, {
    onClose: () => setShowEditPy(null)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 700,
      marginBottom: 16
    }
  }, "Modifier la pyramide"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: S.lbl
  }, "Lignes"), /*#__PURE__*/React.createElement("input", {
    style: S.inpS,
    type: "number",
    value: showEditPy.pyRows,
    onChange: e => setShowEditPy(p => ({
      ...p,
      pyRows: e.target.value
    }))
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: S.lbl
  }, "Colonnes"), /*#__PURE__*/React.createElement("input", {
    style: S.inpS,
    type: "number",
    value: showEditPy.pyCols,
    onChange: e => setShowEditPy(p => ({
      ...p,
      pyCols: e.target.value
    }))
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: S.lbl
  }, "X \u2014 entre s\xE9ries (sec)"), /*#__PURE__*/React.createElement("input", {
    style: S.inpS,
    type: "number",
    value: showEditPy.pyX,
    onChange: e => setShowEditPy(p => ({
      ...p,
      pyX: e.target.value
    }))
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: S.lbl
  }, "Y \u2014 repos (sec)"), /*#__PURE__*/React.createElement("input", {
    style: S.inpS,
    type: "number",
    value: showEditPy.pyY,
    onChange: e => setShowEditPy(p => ({
      ...p,
      pyY: e.target.value
    }))
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: '#666',
      marginBottom: 16
    }
  }, "Les reps d\xE9j\xE0 saisies sont conserv\xE9es."), /*#__PURE__*/React.createElement("button", {
    style: S.btn,
    onClick: () => {
      const rows = Math.max(1, parseInt(showEditPy.pyRows) || 1);
      const cols = Math.max(1, parseInt(showEditPy.pyCols) || 1);
      const X = Math.max(5, parseInt(showEditPy.pyX) || 60);
      const Y = Math.max(0, parseInt(showEditPy.pyY) || 0);
      setWo(p => {
        const n = window.dcw(p);
        const e = n.exercises[n.currentExIndex];
        const old = e.pyGrid || [];
        // Redimensionne en gardant les cases communes
        e.pyGrid = Array.from({
          length: rows
        }, (_, r) => Array.from({
          length: cols
        }, (_, c) => old[r] && old[r][c] != null ? old[r][c] : ''));
        e.pyRows = rows;
        e.pyCols = cols;
        e.pyX = X;
        e.pyY = Y;
        return n;
      });
      setShowEditPy(null);
    }
  }, "Enregistrer")), showEditEmom && /*#__PURE__*/React.createElement(Modal, {
    onClose: () => setShowEditEmom(false)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 700,
      marginBottom: 16
    }
  }, "Modifier EMOM"), /*#__PURE__*/React.createElement("label", {
    style: S.lbl
  }, "Secondes"), /*#__PURE__*/React.createElement("input", {
    style: S.inp,
    type: "number",
    value: tempV,
    onChange: e => setTempV(e.target.value),
    autoFocus: true
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: '#666',
      margin: '8px 0 16px'
    }
  }, "= ", Math.floor((parseInt(tempV) || 0) / 60), "m ", (parseInt(tempV) || 0) % 60, "s"), /*#__PURE__*/React.createElement("button", {
    style: S.btn,
    onClick: () => {
      const v = parseInt(tempV) || 90;
      setWo(p => {
        const n = window.dcw(p);
        n.exercises[n.currentExIndex].emomTime = v;
        return n;
      });
      setShowEditEmom(false);
    }
  }, "Enregistrer")), showEditRm && /*#__PURE__*/React.createElement(Modal, {
    onClose: () => setShowEditRm(false)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 700,
      marginBottom: 16
    }
  }, "Modifier 1RM"), /*#__PURE__*/React.createElement("label", {
    style: S.lbl
  }, "kg"), /*#__PURE__*/React.createElement("input", {
    style: S.inp,
    type: "number",
    value: tempV,
    onChange: e => setTempV(e.target.value),
    autoFocus: true
  }), tempV && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      margin: '12px 0 16px',
      flexWrap: 'wrap'
    }
  }, window.calcP(Number(tempV)).map((v, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      background: '#1A1A2E',
      border: '1px solid #2A2A3E',
      borderRadius: 6,
      padding: '4px 10px',
      fontSize: 13,
      color: '#8B8BFF'
    }
  }, window.pcts[i], "%", /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#555',
      margin: '0 3px'
    }
  }, "\xB7"), v, " kg", /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#6060cc',
      marginLeft: 4
    }
  }, "\xD7 ", window.repsAt[i])))), /*#__PURE__*/React.createElement("button", {
    style: S.btn,
    onClick: () => {
      setWo(p => {
        const n = window.dcw(p);
        n.exercises[n.currentExIndex].rm = tempV;
        return n;
      });
      setShowEditRm(false);
    }
  }, "Enregistrer")), showEditRest && /*#__PURE__*/React.createElement(Modal, {
    onClose: () => setShowEditRest(false)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 700,
      marginBottom: 16
    }
  }, "Repos entre exercices"), /*#__PURE__*/React.createElement("label", {
    style: S.lbl
  }, "Secondes"), /*#__PURE__*/React.createElement("input", {
    style: S.inp,
    type: "number",
    value: tempV,
    onChange: e => setTempV(e.target.value),
    autoFocus: true
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: '#666',
      margin: '8px 0 16px'
    }
  }, "= ", Math.floor((parseInt(tempV) || 0) / 60), "m ", (parseInt(tempV) || 0) % 60, "s"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginBottom: 16,
      flexWrap: 'wrap'
    }
  }, [60, 90, 120, 180, 240].map(v => /*#__PURE__*/React.createElement("button", {
    key: v,
    onClick: () => setTempV(String(v)),
    style: {
      background: parseInt(tempV) === v ? S.blue : '#1E1E22',
      color: '#fff',
      border: 'none',
      borderRadius: 8,
      padding: '6px 12px',
      fontSize: 13,
      cursor: 'pointer',
      fontFamily: 'inherit'
    }
  }, v / 60 < 1 ? v + 's' : v / 60 + 'min'))), /*#__PURE__*/React.createElement("button", {
    style: S.btn,
    onClick: () => {
      const v = parseInt(tempV) || 120;
      setDefaultRest(v);
      setRestLeft(v);
      setShowEditRest(false);
    }
  }, "Appliquer")), showAddEx && /*#__PURE__*/React.createElement(Modal, {
    onClose: () => setShowAddEx(false)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 700,
      marginBottom: 16
    }
  }, "Ajouter un exercice"), exLib.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: '#666',
      marginBottom: 8,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.06em'
    }
  }, "Depuis ma biblioth\xE8que"), exLib.filter(e => !wo.exercises.find(w => w.exId === e.id)).map(e => /*#__PURE__*/React.createElement("button", {
    key: e.id,
    onClick: () => {
      const base = {
        exId: e.id,
        name: e.name,
        rm: e.rm,
        bodyweight: e.bodyweight,
        nbSets: parseInt(addExSets) || 4,
        emomTime: parseInt(addExEmom) || 90,
        sets: Array.from({
          length: parseInt(addExSets) || 4
        }, (_, i) => {
          const p = window.getLastPerf(history, e.name, i);
          return {
            kg: p ? p.kg : '',
            reps: p ? p.reps : '',
            done: false
          };
        })
      };
      const py = window.pyramidInit(e, history, e.name);
      const newEx = py ? {
        ...base,
        ...py
      } : base;
      setWo(p => {
        const n = window.dcw(p);
        n.exercises.push(newEx);
        return n;
      });
      setShowAddEx(false);
    },
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      background: '#1E1E22',
      border: '1px solid #2A2A2E',
      borderRadius: 10,
      padding: '10px 14px',
      marginBottom: 6,
      cursor: 'pointer',
      fontFamily: 'inherit',
      color: '#E8E8EA'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600
    }
  }, e.name, e.rm && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: '#666',
      marginLeft: 8
    }
  }, "1RM: ", e.rm, "kg")), /*#__PURE__*/React.createElement("span", {
    style: {
      color: S.blue
    }
  }, /*#__PURE__*/React.createElement(IC.plus, null))))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid #222',
      paddingTop: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: '#666',
      marginBottom: 10,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.06em'
    }
  }, "Cr\xE9er nouveau"), /*#__PURE__*/React.createElement("input", {
    style: {
      ...S.inp,
      marginBottom: 10
    },
    placeholder: "Ex: Curl inclin\xE9",
    value: addExN,
    onChange: e => setAddExN(e.target.value),
    autoFocus: true
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: S.lbl
  }, "S\xE9ries"), /*#__PURE__*/React.createElement("input", {
    style: S.inpS,
    type: "number",
    value: addExSets,
    onChange: e => setAddExSets(e.target.value)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: S.lbl
  }, "EMOM (sec)"), /*#__PURE__*/React.createElement("input", {
    style: S.inpS,
    type: "number",
    value: addExEmom,
    onChange: e => setAddExEmom(e.target.value)
  }))), /*#__PURE__*/React.createElement("button", {
    style: S.btn,
    onClick: () => {
      if (!addExN.trim()) return;
      const newLibEx = {
        id: window.uid(),
        name: addExN.trim(),
        rm: ''
      };
      setExLib(p => [...p, newLibEx]);
      const newEx = {
        exId: newLibEx.id,
        name: newLibEx.name,
        rm: '',
        nbSets: parseInt(addExSets) || 4,
        emomTime: parseInt(addExEmom) || 90,
        sets: Array.from({
          length: parseInt(addExSets) || 4
        }, () => ({
          kg: '',
          reps: '',
          done: false
        }))
      };
      setWo(p => {
        const n = window.dcw(p);
        n.exercises.push(newEx);
        return n;
      });
      setShowAddEx(false);
    }
  }, "Cr\xE9er et ajouter"))));
};
})();
