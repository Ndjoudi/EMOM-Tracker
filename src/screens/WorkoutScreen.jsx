const {useState:uSW,useEffect:uEW,useRef:uRW,useCallback:uCW}=React;
const S=window.S,IC=window.IC,colH=window.colH,tBtn=window.tBtn;

window.WorkoutScreen=function WorkoutScreen({wo,setWo,onFinish,onCancel,history,exLib,setExLib}){
  const[timerLeft,setTimerLeft]=uSW(0);
  const[timerOn,setTimerOn]=uSW(false);
  const[totalEl,setTotalEl]=uSW(0);
  const[showExStats,setShowExStats]=uSW(null);
  const[showEditEmom,setShowEditEmom]=uSW(false);
  const[showEditRm,setShowEditRm]=uSW(false);
  const[showAddEx,setShowAddEx]=uSW(false);
  const[addExN,setAddExN]=uSW('');const[addExSets,setAddExSets]=uSW('4');const[addExEmom,setAddExEmom]=uSW('90');
  const[tempV,setTempV]=uSW('');
  const[restOn,setRestOn]=uSW(false);
  const[restLeft,setRestLeft]=uSW(0);
  const[defaultRest,setDefaultRest]=uSW(120);
  const[showEditRest,setShowEditRest]=uSW(false);
  const[wsGoals,setWsGoals]=uSW(()=>window.load(window.SK.goals)||{});
  const[showGoalFormWS,setShowGoalFormWS]=uSW(false);
  const[gKgWS,setGKgWS]=uSW('');const[gRepsWS,setGRepsWS]=uSW('');const[gDateWS,setGDateWS]=uSW('');
  const iRef=uRW(null),tRef=uRW(null),avRef=uRW(null),restRef=uRW(null),soundRef=uRW({});
  const Modal=window.Modal,ExHistoryTable=window.ExHistoryTable;

  uEW(()=>{save(window.SK.draft,wo);},[wo]);
  uEW(()=>{window.save(window.SK.goals,wsGoals);},[wsGoals]);
  const ex=wo.exercises[wo.currentExIndex];
  const emomS=ex?(ex.emomTime||90):90;
  const halfTime=Math.floor(emomS/2);
  uEW(()=>{tRef.current=setInterval(()=>setTotalEl(p=>p+1),1000);return()=>clearInterval(tRef.current);},[]);

  uEW(()=>{
    if(restOn&&restLeft>0){
      restRef.current=setInterval(()=>{setRestLeft(p=>{if(p<=1){clearInterval(restRef.current);setRestOn(false);window.sndGo();return 0;}if(p===4||p===3||p===2)window.sndCountdown();return p-1;});},1000);
      return()=>clearInterval(restRef.current);}
  },[restOn,restLeft]);

  avRef.current=()=>{setWo(prev=>{const n=window.dcw(prev);const ce=n.exercises[n.currentExIndex];const cs=n.currentSet;if(ce&&cs<ce.sets.length){ce.sets[cs].done=true;if(cs+1<ce.sets.length){n.currentSet=cs+1;soundRef.current={};setTimeout(()=>{setTimerLeft(ce.emomTime||90);setTimerOn(true);},300);}else{if(n.currentExIndex+1<n.exercises.length){const restDur=ce.restTime||defaultRest;n.currentExIndex+=1;n.currentSet=window.fnu(n.exercises[n.currentExIndex]);setDefaultRest(restDur);setRestLeft(restDur);setRestOn(true);}setTimerOn(false);setTimerLeft(0);soundRef.current={};}}return n;});};

  uEW(()=>{
    if(timerOn&&timerLeft>0){
      iRef.current=setInterval(()=>{setTimerLeft(p=>{const next=p-1;
        if(next===halfTime&&!soundRef.current[halfTime]){window.sndMiddle();soundRef.current[halfTime]=true;}
        if(next===10&&!soundRef.current[10]){window.snd10();soundRef.current[10]=true;}
        if((next===3||next===2||next===1)&&!soundRef.current[next]){window.sndCountdown();soundRef.current[next]=true;}
        if(next<=0){clearInterval(iRef.current);window.sndGo();window.timerAlert&&window.timerAlert('Série terminée',`${ex?.name||''} — série suivante`);avRef.current();return 0;}
        return next;});},1000);
      return()=>clearInterval(iRef.current);}
  },[timerOn,timerLeft,halfTime]);

  // Texte de l'écran verrouillé
  uEW(()=>{
    if(!timerOn&&!restOn)return;
    const title=restOn?'Repos':(ex?.name||wo.routineName);
    window.updateLockScreen&&window.updateLockScreen(title,`${wo.routineName} — Série ${wo.currentSet+1}`);
  },[wo.currentExIndex,wo.currentSet,restOn,timerOn]);

  // Libère le wake lock en quittant la séance
  uEW(()=>()=>{
    window._wantWakeLock=false;
    window.releaseWakeLock&&window.releaseWakeLock();
    window.stopLockScreenSession&&window.stopLockScreenSession();
  },[]);

  const start=()=>{window.unlockAudio();window._wantWakeLock=true;window.requestWakeLock&&window.requestWakeLock();window.startLockScreenSession&&window.startLockScreenSession(ex?.name||wo.routineName,`${wo.routineName} — Série ${wo.currentSet+1}`);window.setLockScreenHandlers&&window.setLockScreenHandlers({onNext:()=>skip()});window.requestNotifPermission&&window.requestNotifPermission();soundRef.current={};setTimerLeft(emomS);setTimerOn(true);if(restOn){clearInterval(restRef.current);setRestOn(false);setRestLeft(0);}};
  const stopV=()=>{clearInterval(iRef.current);setTimerOn(false);setTimerLeft(0);soundRef.current={};avRef.current();};
  const skip=()=>{clearInterval(iRef.current);setTimerOn(false);soundRef.current={};avRef.current();};
  const adj=d=>setTimerLeft(p=>Math.max(0,p+d));
  const adjRest=d=>setRestLeft(p=>Math.max(0,p+d));
  const skipRest=()=>{clearInterval(restRef.current);setRestOn(false);setRestLeft(0);};
  const upSet=(si,f,v)=>{setWo(p=>{const n=window.dcw(p);n.exercises[n.currentExIndex].sets[si][f]=v;return n;});};
  const adjKg=(si,delta)=>{setWo(p=>{const n=window.dcw(p);const cur=parseFloat(n.exercises[n.currentExIndex].sets[si].kg)||0;const nv=Math.max(0,Math.round((cur+delta)*100)/100);n.exercises[n.currentExIndex].sets[si].kg=nv===0?'':String(nv);return n;});};
  const togSet=si=>{setWo(p=>{const n=window.dcw(p);n.exercises[n.currentExIndex].sets[si].done=!n.exercises[n.currentExIndex].sets[si].done;return n;});};
  const validateAll=()=>{setWo(p=>{const n=window.dcw(p);n.exercises[n.currentExIndex].sets.forEach(s=>{s.done=true;});return n;});};
  const addSet=()=>{setWo(p=>{const n=window.dcw(p);n.exercises[n.currentExIndex].sets.push({kg:'',reps:'',done:false});n.exercises[n.currentExIndex].nbSets+=1;return n;});};
  const removeSet=()=>{setWo(p=>{const n=window.dcw(p);const ce=n.exercises[n.currentExIndex];if(ce.sets.length<=1)return n;ce.sets.pop();ce.nbSets=ce.sets.length;if(n.currentSet>=ce.sets.length)n.currentSet=ce.sets.length-1;return n;});};
  const goEx=i=>{clearInterval(iRef.current);setTimerOn(false);setTimerLeft(0);soundRef.current={};if(restOn){clearInterval(restRef.current);setRestOn(false);setRestLeft(0);}setWo(p=>({...p,currentExIndex:i,currentSet:window.fnu(p.exercises[i])}));};

  const progress=timerOn?((emomS-timerLeft)/emomS)*100:0;
  const last2=ex?window.getExHist(history,ex.name).slice(0,2):[];

  // Facteur d'ajustement selon sommeil + nutrition
  const contextFactor=(()=>{
    const sleepAdj=[-0.10,-0.05,0,+0.02]; // <6h, 6-7h, 7-8h, 8h+
    const nutriAdj=[-0.08,0,+0.02];        // légère, correcte, optimale
    const s=wo.sleep!==null?sleepAdj[wo.sleep]??0:0;
    const n=wo.nutrition!==null?nutriAdj[wo.nutrition]??0:0;
    return 1+s+n;
  })();

  const exGoal=ex?(wsGoals[ex.name]||null):null;
  const exNextTarget=(()=>{
    if(!exGoal||!exGoal.date||!ex)return null;
    const rd=[...history].reverse().flatMap(h=>h.exercises.filter(e=>e.name===ex.name).map(e=>({date:h.date,maxKg:Math.max(0,...e.sets.filter(s=>s.done).map(s=>parseFloat(s.kg)||0)),sets:e.sets.filter(s=>s.done)}))).filter(d=>d.sets.length>0);
    if(rd.length===0)return null;
    const s=rd[rd.length-1];const sd=new Date(s.date);const ed=new Date(exGoal.date);
    const msW=7*24*3600*1000;const tw=Math.max(1,Math.round((ed-sd)/msW));const kpw=(exGoal.kg-s.maxKg)/tw;
    const now=new Date();const pts=[];
    for(let w=0;w<=tw;w++){const d=new Date(sd.getTime()+w*msW);pts.push({date:d,kg:Math.round((s.maxKg+kpw*w)*100)/100});}
    return pts.find(t=>t.date>now)||(pts.length>0?pts[pts.length-1]:null);
  })();

  const stepStyle=(done)=>({background:done?'transparent':'#2A2A2E',border:'none',borderRadius:6,color:done?S.green:'#aaa',fontSize:16,fontWeight:700,cursor:'pointer',width:28,height:32,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontFamily:'inherit'});

  return(
    <div style={{...S.app,paddingBottom:220}}>
      <div style={S.header}>
        <div style={{display:'flex',alignItems:'center',gap:8}}><button style={S.btnG} onClick={onCancel}><IC.back/></button><div><div style={{fontSize:14,fontWeight:600}}>Entraînement</div><div style={{fontSize:12,color:S.blue}}>{window.fmt(totalEl)}</div></div></div>
        <button style={{background:S.blue,color:'#fff',border:'none',borderRadius:8,padding:'8px 16px',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}} onClick={()=>onFinish(wo)}>Terminer</button>
      </div>

      <div style={{display:'flex',gap:6,padding:'12px 14px',overflowX:'auto'}}>
        {wo.exercises.map((e,i)=>{const done=e.sets.every(s=>s.done);return<button key={i} onClick={()=>goEx(i)} style={{background:i===wo.currentExIndex?'#1E1E22':'transparent',border:i===wo.currentExIndex?'1px solid #333':'1px solid transparent',borderRadius:8,padding:'6px 14px',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit',color:done?S.green:i===wo.currentExIndex?'#fff':'#666',whiteSpace:'nowrap',flexShrink:0}}>{e.name||'Exo '+(i+1)}</button>;})}
        <button onClick={()=>{setAddExN('');setAddExSets('4');setAddExEmom('90');setShowAddEx(true);}} style={{background:'transparent',border:'1px solid #2A2A2E',borderRadius:8,padding:'6px 12px',fontSize:13,cursor:'pointer',fontFamily:'inherit',color:S.blue,whiteSpace:'nowrap',flexShrink:0,display:'flex',alignItems:'center',gap:4}}><IC.plus/></button>
      </div>

      {ex&&(
        <div style={S.card}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
            <div style={{width:38,height:38,borderRadius:'50%',background:'#1E1E22',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><IC.dumbbell/></div>
            <button onClick={()=>setShowExStats(ex.name)} style={{background:'none',border:'none',cursor:'pointer',fontFamily:'inherit',textAlign:'left',padding:0,flex:1,minWidth:0}}>
              <div style={{fontSize:17,fontWeight:700,color:'#E8E8EA',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{ex.name}</div>
              <div style={{fontSize:11,color:S.blue,marginTop:1,display:'flex',alignItems:'center',gap:4}}><IC.chartBar/> Voir stats & historique</div>
            </button>
            <button onClick={()=>{setTempV(String(ex.emomTime));setShowEditEmom(true);}} style={{background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:6,padding:0,flexShrink:0}}>
              <span style={{display:'flex',alignItems:'center',gap:3,color:S.blue,fontSize:12,fontWeight:600}}><IC.clock/> {Math.floor(ex.emomTime/60)}m{ex.emomTime%60>0?(ex.emomTime%60)+'s':''} <span style={{color:'#555'}}><IC.edit/></span></span>
              <span style={{fontSize:12,color:'#555'}}>×</span>
              <span style={{background:'#1E1E22',borderRadius:6,padding:'2px 10px',fontSize:13,fontWeight:700,border:'1px solid #333',color:'#fff'}}>{ex.sets.length}</span>
            </button>
          </div>
          <button onClick={()=>{setTempV(String(ex.rm||''));setShowEditRm(true);}} style={{background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:8,marginBottom:10,flexWrap:'wrap',padding:0,width:'100%'}}>
            <span style={{background:'#1A1A2E',border:'1px solid #2A2A3E',borderRadius:6,padding:'5px 10px',fontSize:13,fontWeight:600,color:'#ccc',display:'flex',alignItems:'center',gap:5}}>1RM {ex.rm||'—'}kg <span style={{color:'#555'}}><IC.edit/></span></span>
            {ex.rm&&window.calcP(Number(ex.rm)).map((v,i)=><span key={i} style={{fontSize:13,fontWeight:600,color:'#8B8BFF'}}>{v}<span style={{fontSize:11,color:'#6060cc',fontWeight:500}}>×{window.repsAt[i]}</span></span>)}
          </button>

          {last2.length>0&&(()=>{
            const liveEx2=wo.exercises.find(e=>e.name===ex.name);
            const liveDone2=liveEx2?liveEx2.sets.filter(s=>s.done):[];
            const liveMaxKg2=liveDone2.length>0?Math.max(0,...liveDone2.map(s=>parseFloat(s.kg)||0)):0;
            const liveVol2=liveDone2.reduce((a,s)=>a+(parseFloat(s.kg)||0)*(parseFloat(s.reps)||0),0);
            const lp2=liveMaxKg2>0?{maxKg:liveMaxKg2,vol:liveVol2,date:wo.startedAt}:null;
            const allHist=window.getExHist(history,ex.name);
            return(
              <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:12}}>
                <div style={{background:'#111113',borderRadius:8,padding:'5px 8px',border:'1px solid #1A1A1E'}}>
                  <div style={{fontSize:10,color:'#444',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:4}}>Dernières séances</div>
                  {last2.map((entry,li)=>{const prevE=last2[li+1];const done=entry.sets.filter(s=>s.done);const prevDone=prevE?prevE.sets.filter(s=>s.done):[];const sp=prevE?window.getSessionPerf(done,prevDone):'neutral';return(<div key={li} style={{display:'flex',alignItems:'center',gap:6,marginBottom:li<last2.length-1?3:0}}>
                    <span style={{fontSize:10,color:'#555',minWidth:36,flexShrink:0}}>{window.dateFr(entry.date)}</span>
                    <div style={{display:'flex',gap:3,flexWrap:'wrap',alignItems:'center'}}>
                      {done.map((s,j)=><span key={j} style={{fontSize:11,color:'#bbb',fontWeight:600}}>{s.kg?s.kg+'×':''}{s.reps}</span>)}
                      {sp!=='neutral'&&<span style={{fontSize:10,color:window.perfC[sp],fontWeight:800}}>{window.perfI[sp]}</span>}
                    </div>
                  </div>);})}
                </div>
                <div style={{background:'#111113',borderRadius:8,padding:'6px 8px',border:'1px solid #1A1A1E'}}>
                  <window.ExComboChart exName={ex.name} hist={history} goal={wsGoals[ex.name]||null} height={90} livePoint={lp2} compact={true} maxPoints={5} targetKg={exNextTarget?Math.round(exNextTarget.kg*contextFactor):null}/>
                </div>
              </div>
            );
          })()}

          {(()=>{
            const isBW=ex.bodyweight;
            const cols=isBW?'28px 1fr 58px 62px 34px':'28px 1fr 58px 120px 62px 34px';
            return(<>
              <div style={{display:'grid',gridTemplateColumns:cols,gap:4,padding:'6px 0',borderBottom:'1px solid #222',marginBottom:4}}>
                <span style={colH}>Sér.</span><span style={colH}>Préc.</span><span style={{...colH,textAlign:'center',color:S.blue}}>Cible</span>
                {!isBW&&<span style={{...colH,textAlign:'center'}}>KG</span>}
                <span style={{...colH,textAlign:'center'}}>Réps</span><span style={{...colH,textAlign:'center'}}>✓</span>
              </div>
              {ex.sets.map((set,si)=>{
                const prev=window.getLastPerf(history,ex.name,si);
                const isCur=si===wo.currentSet&&!set.done;
                const prevSet=last2[0]?last2[0].sets.filter(s=>s.done)[si]:undefined;
                const p=set.done&&prevSet?window.perf(set,prevSet):'neutral';
                return(<div key={si} style={{display:'grid',gridTemplateColumns:cols,gap:4,alignItems:'center',padding:'6px 0',borderRadius:8,background:set.done?S.greenBg:isCur?'#1a1a2e':'transparent',transition:'background 0.3s'}}>
                  <span style={{fontSize:14,fontWeight:700,color:set.done?S.green:'#aaa',paddingLeft:2,display:'flex',alignItems:'center',gap:2}}>{si+1}{set.done&&p!=='neutral'&&<span style={{fontSize:9,color:window.perfC[p]}}>{window.perfI[p]}</span>}</span>
                  <span style={{fontSize:12,color:'#555'}}>{prev?(prev.kg?prev.kg+'×':'')+prev.reps:'—'}</span>
                  <span style={{fontSize:11,fontWeight:600,color:S.blue,textAlign:'center'}}>{exNextTarget?Math.round(exNextTarget.kg*contextFactor)+'×'+exGoal.reps:'—'}</span>
                  {!isBW&&<div style={{display:'flex',alignItems:'center',gap:2}}>
                    <button style={stepStyle(set.done)} onClick={()=>adjKg(si,-1.25)}>−</button>
                    <input style={{...S.inpS,flex:1,minWidth:0,background:set.done?'transparent':'#1E1E22',color:set.done?S.green:'#fff',border:set.done?'1px solid #22C55E44':'1px solid #2A2A2E',fontSize:14,padding:'6px 2px'}} type="number" placeholder="kg" value={set.kg} onChange={e=>upSet(si,'kg',e.target.value)}/>
                    <button style={stepStyle(set.done)} onClick={()=>adjKg(si,1.25)}>+</button>
                  </div>}
                  <input style={{...S.inpS,background:set.done?'transparent':'#1E1E22',color:set.done?S.green:'#fff',border:set.done?'1px solid #22C55E44':'1px solid #2A2A2E',fontSize:14,padding:'6px 4px'}} type="number" placeholder="réps" value={set.reps} onChange={e=>upSet(si,'reps',e.target.value)}/>
                  <button style={{...S.btnG,justifyContent:'center'}} onClick={()=>togSet(si)}>
                    <div style={{width:26,height:26,borderRadius:'50%',background:set.done?S.green:'#222',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.2s',color:set.done?'#fff':'#444'}}><IC.check/></div>
                  </button>
                </div>);
              })}
            </>);
          })()}

          <div style={{display:'flex',gap:8,marginTop:10}}>
            <button onClick={addSet} style={{...S.btnO,flex:1,padding:'8px',fontSize:13}}><IC.plus/> Série</button>
            {ex.sets.length>1&&<button onClick={removeSet} style={{...S.btnO,flex:1,padding:'8px',fontSize:13,color:S.red,borderColor:'#991B1B'}}><IC.minus/> Série</button>}
          </div>
          {!ex.sets.every(s=>s.done)&&<button onClick={validateAll} style={{...S.btn,marginTop:8,background:S.green,gap:6}}><IC.checkAll/> Tout valider</button>}
        </div>
      )}

      <div style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:480,background:'#131315',borderTop:'1px solid #222',zIndex:30}}>
        <div style={{height:3,background:'#1A1A1E',width:'100%'}}><div style={{height:'100%',background:timerOn?S.blue:restOn?S.orange:S.blue,width:(timerOn?progress:restOn?((defaultRest-restLeft)/defaultRest)*100:0)+'%',transition:'width 1s linear'}}/></div>
        <div style={{padding:'14px 18px calc(14px + env(safe-area-inset-bottom, 0px))'}}>
          {restOn&&!timerOn?(
            <>
              <div style={{textAlign:'center',marginBottom:6}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,color:S.orange,fontSize:13,fontWeight:600,marginBottom:4}}><IC.coffee/> Repos entre exercices <button onClick={()=>{setTempV(String(defaultRest));setShowEditRest(true);}} style={{background:'none',border:'none',color:'#555',cursor:'pointer',display:'flex',alignItems:'center',marginLeft:4}}><IC.edit/></button></div>
                <div style={{fontSize:48,fontWeight:800,fontVariantNumeric:'tabular-nums',color:restLeft<=5?S.red:'#fff',transition:'color 0.3s'}}>{window.fmt(restLeft)}</div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
                <button onClick={()=>adjRest(-15)} style={tBtn}>-15</button>
                <button onClick={()=>adjRest(15)} style={tBtn}>+15</button>
                <button onClick={skipRest} style={{background:S.blue,color:'#fff',border:'none',borderRadius:10,padding:'10px',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Passer</button>
              </div>
            </>
          ):!timerOn&&timerLeft===0?(
            <button style={{...S.btn,fontSize:18,padding:'16px 20px'}} onClick={start}><IC.play/> EMOM — {Math.floor(emomS/60)}:{(emomS%60).toString().padStart(2,'0')}</button>
          ):(
            <>
              <div style={{textAlign:'center',fontSize:48,fontWeight:800,fontVariantNumeric:'tabular-nums',letterSpacing:'-0.03em',color:timerLeft<=5?S.red:timerLeft<=10?S.orange:'#fff',marginBottom:12,transition:'color 0.3s'}}>{window.fmt(timerLeft)}</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:8}}>
                <button onClick={()=>adj(-15)} style={tBtn}>-15</button>
                <button onClick={()=>adj(15)} style={tBtn}>+15</button>
                <button onClick={stopV} style={{...tBtn,background:'#7F1D1D',color:'#FCA5A5',border:'1px solid #991B1B'}}><IC.stop/> Stop</button>
                <button onClick={skip} style={{background:S.blue,color:'#fff',border:'none',borderRadius:10,padding:'10px',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Passer</button>
              </div>
            </>
          )}
        </div>
      </div>

      {showExStats&&(()=>{
        const rd=[...history].reverse().flatMap(h=>h.exercises.filter(e=>e.name===showExStats).map(e=>({date:h.date,sets:e.sets.filter(s=>s.done),maxKg:Math.max(0,...e.sets.filter(s=>s.done).map(s=>parseFloat(s.kg)||0)),vol:e.sets.filter(s=>s.done).reduce((a,s)=>a+(parseFloat(s.kg)||0)*(parseFloat(s.reps)||0),0)}))).filter(d=>d.sets.length>0);
        const globalMaxKg=rd.length?Math.max(...rd.map(d=>d.maxKg)):0;
        const maxSets=rd.reduce((m,d)=>Math.max(m,d.sets.length),0);
        const goal=wsGoals[showExStats]||null;
        const startKg=rd.length>0?rd[0].maxKg:0;
        const goalReached=goal?globalMaxKg>=goal.kg:false;
        const pctGoal=goal&&goal.kg>startKg?Math.min(100,Math.round((globalMaxKg-startKg)/(goal.kg-startKg)*100)):goalReached?100:0;
        const deadlineLabel=goal&&goal.date?new Date(goal.date).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'}):'';
        const targetCurve=(()=>{
          if(!goal||!goal.date||rd.length===0)return[];
          const s=rd[rd.length-1];const sd=new Date(s.date);const ed=new Date(goal.date);
          const msW=7*24*3600*1000;const tw=Math.max(1,Math.round((ed-sd)/msW));
          const kpw=(goal.kg-s.maxKg)/tw;const pts=[];
          for(let w=0;w<=tw;w++){const d=new Date(sd.getTime()+w*msW);pts.push({date:d,kg:Math.round((s.maxKg+kpw*w)*100)/100});}
          return pts;
        })();
        const now=new Date();
        let curTarget=targetCurve.length>0?targetCurve[0]:null;
        for(const t of targetCurve){if(t.date<=now)curTarget=t;else break;}
        const nextTarget=targetCurve.find(t=>t.date>now)||(targetCurve.length>0?targetCurve[targetCurve.length-1]:null);
        const curveDiff=curTarget?Math.round((globalMaxKg-curTarget.kg)*100)/100:null;
        const onTrack=curveDiff!==null&&curveDiff>=0;
        return(
          <Modal onClose={()=>setShowExStats(null)}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
              <div style={{fontSize:17,fontWeight:700}}>{showExStats}</div>
              <button style={S.btnG} onClick={()=>setShowExStats(null)}><IC.close/></button>
            </div>
            {rd.length===0&&<div style={{color:'#555',textAlign:'center',padding:30,fontSize:14}}>Aucun historique</div>}
            {rd.length>0&&<>
              {rd.length>=2&&(()=>{const liveEx=wo.exercises.find(e=>e.name===showExStats);const liveDone=liveEx?liveEx.sets.filter(s=>s.done):[];const liveMaxKg=liveDone.length>0?Math.max(0,...liveDone.map(s=>parseFloat(s.kg)||0)):0;const liveVol=liveDone.reduce((a,s)=>a+(parseFloat(s.kg)||0)*(parseFloat(s.reps)||0),0);const lp=liveMaxKg>0?{maxKg:liveMaxKg,vol:liveVol,date:wo.startedAt}:null;return<div style={{marginBottom:12}}><window.ExComboChart exName={showExStats} hist={history} goal={goal} height={160} livePoint={lp}/></div>;})()}
              <div style={{borderTop:'1px solid #222',paddingTop:12,marginBottom:12}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                  <span style={{fontSize:12,fontWeight:700,color:'#aaa',textTransform:'uppercase',letterSpacing:'0.06em'}}>Objectif</span>
                  <button onClick={()=>{if(goal){setGKgWS(String(goal.kg));setGRepsWS(String(goal.reps));setGDateWS(goal.date);}else{setGKgWS('');setGRepsWS('');const d=new Date();d.setDate(d.getDate()+56);setGDateWS(d.toISOString().slice(0,10));}setShowGoalFormWS(true);}} style={{background:'#1E1E22',border:'1px solid #2A2A2E',borderRadius:8,padding:'4px 12px',fontSize:12,color:'#aaa',cursor:'pointer',fontFamily:'inherit'}}>✎ {goal?'Modifier':'Définir'}</button>
                </div>
                {!goal&&!showGoalFormWS&&<div style={{fontSize:13,color:'#444',textAlign:'center',padding:'10px 0'}}>Aucun objectif défini</div>}
                {goal&&!showGoalFormWS&&<>
                  <div style={{background:'#1A1A2E',border:'1px solid #2A2A3E',borderRadius:8,padding:'8px 10px'}}>
                    {nextTarget&&!goalReached&&<div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:7}}>
                      <div>
                        <div style={{fontSize:9,color:'#555',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:2}}>Prochaine cible</div>
                        <div style={{fontSize:13,fontWeight:700,color:'#E8E8EA'}}>{nextTarget.kg.toFixed(1)} kg × {goal.reps} reps</div>
                      </div>
                      <div style={{fontSize:11,color:'#555',textAlign:'right'}}>{nextTarget.date.toLocaleDateString('fr-FR',{day:'numeric',month:'short'})}</div>
                    </div>}
                    <div style={{background:'#222',borderRadius:4,height:5,marginBottom:4,overflow:'hidden'}}><div style={{height:'100%',borderRadius:4,width:Math.max(0,pctGoal)+'%',background:pctGoal>=100?S.green:S.blue,transition:'width .5s'}}/></div>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:11}}>
                      <span style={{color:'#666'}}>{globalMaxKg} kg</span>
                      <span style={{fontWeight:700,color:'#aaa'}}>{Math.max(0,pctGoal)}%</span>
                      <span style={{color:S.green,fontWeight:600}}>{goal.kg} kg</span>
                    </div>
                  </div>
                </>}
                {showGoalFormWS&&<div style={{background:'#111113',borderRadius:10,padding:'14px',border:'1px solid #222'}}>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:10}}>
                    <div><div style={{fontSize:10,color:'#555',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:4}}>Charge (kg)</div><input style={S.inpS} type="number" value={gKgWS} onChange={e=>setGKgWS(e.target.value)} placeholder="40"/></div>
                    <div><div style={{fontSize:10,color:'#555',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:4}}>Reps cibles</div><input style={S.inpS} type="number" value={gRepsWS} onChange={e=>setGRepsWS(e.target.value)} placeholder="8"/></div>
                    <div><div style={{fontSize:10,color:'#555',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:4}}>Date limite</div><input style={{...S.inpS,fontSize:11}} type="date" value={gDateWS} onChange={e=>setGDateWS(e.target.value)}/></div>
                  </div>
                  <div style={{display:'flex',gap:8}}>
                    <button style={{...S.btn,flex:1}} onClick={()=>{const kg=parseFloat(gKgWS);const reps=parseInt(gRepsWS);if(!kg||!reps||!gDateWS)return;setWsGoals(p=>({...p,[showExStats]:{kg,reps,date:gDateWS}}));setShowGoalFormWS(false);}}>Enregistrer</button>
                    <button style={{...S.btnO,flex:1,color:'#888',borderColor:'#333'}} onClick={()=>setShowGoalFormWS(false)}>Annuler</button>
                    {goal&&<button style={{...S.btnG,color:S.red,border:'1px solid #991B1B',borderRadius:10,padding:'8px 12px'}} onClick={()=>{setWsGoals(p=>{const n={...p};delete n[showExStats];return n;});setShowGoalFormWS(false);}}>Suppr.</button>}
                  </div>
                </div>}
              </div>
              <div style={{fontSize:11,color:'#555',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:8}}>Historique des séances</div>
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                  <thead><tr style={{borderBottom:'2px solid #2A2A2E'}}>
                    <th style={{...window.thS,textAlign:'left',minWidth:58}}>Date</th>
                    {Array.from({length:maxSets},(_,i)=><th key={i} style={{...window.thS,textAlign:'center',minWidth:66}}>S{i+1}</th>)}
                    <th style={{...window.thS,textAlign:'center',minWidth:48}}>Vol.</th>
                  </tr></thead>
                  <tbody>
                    {[...rd].reverse().map((d,i,arr)=>{
                      const pr2=arr[i+1];
                      const vd=pr2&&pr2.vol>0?Math.round((d.vol-pr2.vol)/pr2.vol*100):null;
                      const vc=vd===null?'#555':vd>0?S.green:vd<0?S.red:S.orange;
                      return(<tr key={i} style={{borderBottom:'1px solid #1E1E22'}}>
                        <td style={{padding:'8px 4px 8px 0',color:'#aaa',fontSize:12,whiteSpace:'nowrap'}}>{window.dateFr(d.date)}</td>
                        {Array.from({length:maxSets},(_,si)=>{const s=d.sets[si];return<td key={si} style={{padding:'8px 4px',textAlign:'center',fontWeight:600,color:s?'#E8E8EA':'#333'}}>{s?(s.kg?s.kg+'×':'')+s.reps:'—'}</td>;})}
                        <td style={{padding:'8px 4px',textAlign:'center',color:vc,fontSize:12,fontWeight:700}}>{vd===null?d.vol:(vd>0?'▲ +':vd<0?'▼ ':'= ')+vd+'%'}</td>
                      </tr>);
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{display:'flex',gap:14,marginTop:12,justifyContent:'center'}}>
                <span style={{fontSize:11,color:S.green}}>▲ Progression</span>
                <span style={{fontSize:11,color:S.orange}}>= Stable</span>
                <span style={{fontSize:11,color:S.red}}>▼ Régression</span>
              </div>
            </>}
          </Modal>
        );
      })()}
      {showEditEmom&&<Modal onClose={()=>setShowEditEmom(false)}><div style={{fontSize:17,fontWeight:700,marginBottom:16}}>Modifier EMOM</div><label style={S.lbl}>Secondes</label><input style={S.inp} type="number" value={tempV} onChange={e=>setTempV(e.target.value)} autoFocus/><div style={{fontSize:13,color:'#666',margin:'8px 0 16px'}}>= {Math.floor((parseInt(tempV)||0)/60)}m {(parseInt(tempV)||0)%60}s</div><button style={S.btn} onClick={()=>{const v=parseInt(tempV)||90;setWo(p=>{const n=window.dcw(p);n.exercises[n.currentExIndex].emomTime=v;return n;});setShowEditEmom(false);}}>Enregistrer</button></Modal>}
      {showEditRm&&<Modal onClose={()=>setShowEditRm(false)}><div style={{fontSize:17,fontWeight:700,marginBottom:16}}>Modifier 1RM</div><label style={S.lbl}>kg</label><input style={S.inp} type="number" value={tempV} onChange={e=>setTempV(e.target.value)} autoFocus/>{tempV&&<div style={{display:'flex',gap:8,margin:'12px 0 16px',flexWrap:'wrap'}}>{window.calcP(Number(tempV)).map((v,i)=><span key={i} style={{background:'#1A1A2E',border:'1px solid #2A2A3E',borderRadius:6,padding:'4px 10px',fontSize:13,color:'#8B8BFF'}}>{window.pcts[i]}%<span style={{color:'#555',margin:'0 3px'}}>·</span>{v} kg<span style={{color:'#6060cc',marginLeft:4}}>× {window.repsAt[i]}</span></span>)}</div>}<button style={S.btn} onClick={()=>{setWo(p=>{const n=window.dcw(p);n.exercises[n.currentExIndex].rm=tempV;return n;});setShowEditRm(false);}}>Enregistrer</button></Modal>}
      {showEditRest&&<Modal onClose={()=>setShowEditRest(false)}><div style={{fontSize:17,fontWeight:700,marginBottom:16}}>Repos entre exercices</div><label style={S.lbl}>Secondes</label><input style={S.inp} type="number" value={tempV} onChange={e=>setTempV(e.target.value)} autoFocus/><div style={{fontSize:13,color:'#666',margin:'8px 0 16px'}}>= {Math.floor((parseInt(tempV)||0)/60)}m {(parseInt(tempV)||0)%60}s</div><div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>{[60,90,120,180,240].map(v=><button key={v} onClick={()=>setTempV(String(v))} style={{background:parseInt(tempV)===v?S.blue:'#1E1E22',color:'#fff',border:'none',borderRadius:8,padding:'6px 12px',fontSize:13,cursor:'pointer',fontFamily:'inherit'}}>{v/60<1?v+'s':v/60+'min'}</button>)}</div><button style={S.btn} onClick={()=>{const v=parseInt(tempV)||120;setDefaultRest(v);setRestLeft(v);setShowEditRest(false);}}>Appliquer</button></Modal>}
      {showAddEx&&<Modal onClose={()=>setShowAddEx(false)}>
        <div style={{fontSize:17,fontWeight:700,marginBottom:16}}>Ajouter un exercice</div>
        {exLib.length>0&&<div style={{marginBottom:16}}><div style={{fontSize:12,color:'#666',marginBottom:8,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em'}}>Depuis ma bibliothèque</div>{exLib.filter(e=>!wo.exercises.find(w=>w.exId===e.id)).map(e=>(<button key={e.id} onClick={()=>{const newEx={exId:e.id,name:e.name,rm:e.rm,nbSets:parseInt(addExSets)||4,emomTime:parseInt(addExEmom)||90,sets:Array.from({length:parseInt(addExSets)||4},(_,i)=>{const p=window.getLastPerf(history,e.name,i);return{kg:p?p.kg:'',reps:p?p.reps:'',done:false};})};setWo(p=>{const n=window.dcw(p);n.exercises.push(newEx);return n;});setShowAddEx(false);}} style={{display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%',background:'#1E1E22',border:'1px solid #2A2A2E',borderRadius:10,padding:'10px 14px',marginBottom:6,cursor:'pointer',fontFamily:'inherit',color:'#E8E8EA'}}><div style={{fontSize:14,fontWeight:600}}>{e.name}{e.rm&&<span style={{fontSize:12,color:'#666',marginLeft:8}}>1RM: {e.rm}kg</span>}</div><span style={{color:S.blue}}><IC.plus/></span></button>))}</div>}
        <div style={{borderTop:'1px solid #222',paddingTop:14}}>
          <div style={{fontSize:12,color:'#666',marginBottom:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em'}}>Créer nouveau</div>
          <input style={{...S.inp,marginBottom:10}} placeholder="Ex: Curl incliné" value={addExN} onChange={e=>setAddExN(e.target.value)} autoFocus/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
            <div><label style={S.lbl}>Séries</label><input style={S.inpS} type="number" value={addExSets} onChange={e=>setAddExSets(e.target.value)}/></div>
            <div><label style={S.lbl}>EMOM (sec)</label><input style={S.inpS} type="number" value={addExEmom} onChange={e=>setAddExEmom(e.target.value)}/></div>
          </div>
          <button style={S.btn} onClick={()=>{if(!addExN.trim())return;const newLibEx={id:window.uid(),name:addExN.trim(),rm:''};setExLib(p=>[...p,newLibEx]);const newEx={exId:newLibEx.id,name:newLibEx.name,rm:'',nbSets:parseInt(addExSets)||4,emomTime:parseInt(addExEmom)||90,sets:Array.from({length:parseInt(addExSets)||4},()=>({kg:'',reps:'',done:false}))};setWo(p=>{const n=window.dcw(p);n.exercises.push(newEx);return n;});setShowAddEx(false);}}>Créer et ajouter</button>
        </div>
      </Modal>}
    </div>
  );
};
