const {useState:uSW,useEffect:uEW,useRef:uRW,useCallback:uCW}=React;
const S=window.S,IC=window.IC,colH=window.colH,tBtn=window.tBtn;

window.WorkoutScreen=function WorkoutScreen({wo,setWo,onFinish,onCancel,history,exLib,setExLib}){
  const[timerLeft,setTimerLeft]=uSW(0);
  const[timerOn,setTimerOn]=uSW(false);
  const[totalEl,setTotalEl]=uSW(0);
  const[showExHist,setShowExHist]=uSW(null);
  const[showEditEmom,setShowEditEmom]=uSW(false);
  const[showEditRm,setShowEditRm]=uSW(false);
  const[showAddEx,setShowAddEx]=uSW(false);
  const[addExN,setAddExN]=uSW('');const[addExSets,setAddExSets]=uSW('4');const[addExEmom,setAddExEmom]=uSW('90');
  const[tempV,setTempV]=uSW('');
  const[restOn,setRestOn]=uSW(false);
  const[restLeft,setRestLeft]=uSW(0);
  const[defaultRest,setDefaultRest]=uSW(120);
  const[showEditRest,setShowEditRest]=uSW(false);
  const iRef=uRW(null),tRef=uRW(null),avRef=uRW(null),restRef=uRW(null),soundRef=uRW({});
  const Modal=window.Modal,ExHistoryTable=window.ExHistoryTable;

  uEW(()=>{save(window.SK.draft,wo);},[wo]);
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
        if(next<=0){clearInterval(iRef.current);window.sndGo();avRef.current();return 0;}
        return next;});},1000);
      return()=>clearInterval(iRef.current);}
  },[timerOn,timerLeft,halfTime]);

  const start=()=>{window.unlockAudio();soundRef.current={};setTimerLeft(emomS);setTimerOn(true);if(restOn){clearInterval(restRef.current);setRestOn(false);setRestLeft(0);}};
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
            <button onClick={()=>setShowExHist(ex.name)} style={{background:'none',border:'none',cursor:'pointer',fontFamily:'inherit',textAlign:'left',padding:0}}>
              <div style={{fontSize:17,fontWeight:700,color:'#E8E8EA'}}>{ex.name}</div>
              <div style={{fontSize:11,color:'#555',marginTop:1,display:'flex',alignItems:'center',gap:4}}><IC.hist/> Voir historique</div>
            </button>
          </div>
          <button onClick={()=>{setTempV(String(ex.rm||''));setShowEditRm(true);}} style={{background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:8,marginBottom:8,flexWrap:'wrap',padding:0,width:'100%'}}>
            <span style={{background:'#1A1A2E',border:'1px solid #2A2A3E',borderRadius:6,padding:'5px 10px',fontSize:13,fontWeight:600,color:'#ccc',display:'flex',alignItems:'center',gap:5}}>1RM {ex.rm||'—'}kg <span style={{color:'#555'}}><IC.edit/></span></span>
            {ex.rm&&window.calcP(Number(ex.rm)).map((v,i)=><span key={i} style={{fontSize:13,fontWeight:600,color:'#8B8BFF'}}>{v}</span>)}
          </button>
          <button onClick={()=>{setTempV(String(ex.emomTime));setShowEditEmom(true);}} style={{background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',gap:8,marginBottom:10,padding:0}}>
            <span style={{display:'flex',alignItems:'center',gap:4,color:S.blue,fontSize:13,fontWeight:600}}><IC.clock/> Emom: {Math.floor(ex.emomTime/60)}m{ex.emomTime%60>0?(ex.emomTime%60)+'s':''} <span style={{color:'#555'}}><IC.edit/></span></span>
            <span style={{fontSize:13,color:'#666'}}>pendant</span>
            <span style={{background:'#1E1E22',borderRadius:6,padding:'2px 10px',fontSize:14,fontWeight:700,border:'1px solid #333',color:'#fff'}}>{ex.sets.length}</span>
          </button>
          <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:10,fontSize:11,color:'#444'}}><IC.sound/> Sons: milieu · 10s · 3s · 2s · 1s · GO</div>

          {last2.length>0&&(
            <div style={{background:'#111113',borderRadius:8,padding:'8px 10px',marginBottom:12,border:'1px solid #1A1A1E'}}>
              <div style={{fontSize:11,color:'#555',fontWeight:700,textTransform:'uppercase',marginBottom:6}}>Dernières séances</div>
              {last2.map((entry,li)=>{const prevE=last2[li+1];const done=entry.sets.filter(s=>s.done);const prevDone=prevE?prevE.sets.filter(s=>s.done):[];const sp=prevE?window.getSessionPerf(done,prevDone):'neutral';return(<div key={li} style={{display:'flex',gap:6,alignItems:'center',marginBottom:4,flexWrap:'wrap'}}>
                <span style={{fontSize:11,color:'#666',minWidth:50}}>{window.dateFr(entry.date)}</span>
                {done.map((s,j)=><span key={j} style={{fontSize:12,color:'#bbb',fontWeight:600}}>{s.kg?s.kg+'×':''}{s.reps}</span>)}
                {sp!=='neutral'&&<span style={{fontSize:12,color:window.perfC[sp],fontWeight:800}}>{window.perfI[sp]}</span>}
              </div>);})}
            </div>
          )}

          <div style={{display:'grid',gridTemplateColumns:'28px 1fr 120px 62px 34px',gap:4,padding:'6px 0',borderBottom:'1px solid #222',marginBottom:4}}>
            <span style={colH}>Sér.</span><span style={colH}>Préc.</span><span style={{...colH,textAlign:'center'}}>{ex.bodyweight?'LEST +':'KG'}</span><span style={{...colH,textAlign:'center'}}>Réps</span><span style={{...colH,textAlign:'center'}}>✓</span>
          </div>

          {ex.sets.map((set,si)=>{
            const prev=window.getLastPerf(history,ex.name,si);
            const isCur=si===wo.currentSet&&!set.done;
            const prevSet=last2[0]?last2[0].sets.filter(s=>s.done)[si]:undefined;
            const p=set.done&&prevSet?window.perf(set,prevSet):'neutral';
            return(<div key={si} style={{display:'grid',gridTemplateColumns:'28px 1fr 120px 62px 34px',gap:4,alignItems:'center',padding:'6px 0',borderRadius:8,background:set.done?S.greenBg:isCur?'#1a1a2e':'transparent',transition:'background 0.3s'}}>
              <span style={{fontSize:14,fontWeight:700,color:set.done?S.green:'#aaa',paddingLeft:2,display:'flex',alignItems:'center',gap:2}}>{si+1}{set.done&&p!=='neutral'&&<span style={{fontSize:9,color:window.perfC[p]}}>{window.perfI[p]}</span>}</span>
              <span style={{fontSize:12,color:'#555'}}>{prev?(prev.kg?prev.kg+'×':'')+prev.reps:'—'}</span>
              <div style={{display:'flex',alignItems:'center',gap:2}}>
                <button style={stepStyle(set.done)} onClick={()=>adjKg(si,-1.25)}>−</button>
                <input style={{...S.inpS,flex:1,minWidth:0,background:set.done?'transparent':'#1E1E22',color:set.done?S.green:'#fff',border:set.done?'1px solid #22C55E44':'1px solid #2A2A2E',fontSize:14,padding:'6px 2px'}} type="number" placeholder="kg" value={set.kg} onChange={e=>upSet(si,'kg',e.target.value)}/>
                <button style={stepStyle(set.done)} onClick={()=>adjKg(si,1.25)}>+</button>
              </div>
              <input style={{...S.inpS,background:set.done?'transparent':'#1E1E22',color:set.done?S.green:'#fff',border:set.done?'1px solid #22C55E44':'1px solid #2A2A2E',fontSize:14,padding:'6px 4px'}} type="number" placeholder="réps" value={set.reps} onChange={e=>upSet(si,'reps',e.target.value)}/>
              <button style={{...S.btnG,justifyContent:'center'}} onClick={()=>togSet(si)}>
                <div style={{width:26,height:26,borderRadius:'50%',background:set.done?S.green:'#222',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.2s',color:set.done?'#fff':'#444'}}><IC.check/></div>
              </button>
            </div>);
          })}

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

      {showExHist&&<Modal onClose={()=>setShowExHist(null)}><ExHistoryTable exName={showExHist} history={history} onClose={()=>setShowExHist(null)}/></Modal>}
      {showEditEmom&&<Modal onClose={()=>setShowEditEmom(false)}><div style={{fontSize:17,fontWeight:700,marginBottom:16}}>Modifier EMOM</div><label style={S.lbl}>Secondes</label><input style={S.inp} type="number" value={tempV} onChange={e=>setTempV(e.target.value)} autoFocus/><div style={{fontSize:13,color:'#666',margin:'8px 0 16px'}}>= {Math.floor((parseInt(tempV)||0)/60)}m {(parseInt(tempV)||0)%60}s</div><button style={S.btn} onClick={()=>{const v=parseInt(tempV)||90;setWo(p=>{const n=window.dcw(p);n.exercises[n.currentExIndex].emomTime=v;return n;});setShowEditEmom(false);}}>Enregistrer</button></Modal>}
      {showEditRm&&<Modal onClose={()=>setShowEditRm(false)}><div style={{fontSize:17,fontWeight:700,marginBottom:16}}>Modifier 1RM</div><label style={S.lbl}>kg</label><input style={S.inp} type="number" value={tempV} onChange={e=>setTempV(e.target.value)} autoFocus/>{tempV&&<div style={{display:'flex',gap:8,margin:'12px 0 16px',flexWrap:'wrap'}}>{window.calcP(Number(tempV)).map((v,i)=><span key={i} style={{background:'#1A1A2E',border:'1px solid #2A2A3E',borderRadius:6,padding:'4px 10px',fontSize:13,color:'#8B8BFF'}}>{window.pcts[i]}%: {v}kg</span>)}</div>}<button style={S.btn} onClick={()=>{setWo(p=>{const n=window.dcw(p);n.exercises[n.currentExIndex].rm=tempV;return n;});setShowEditRm(false);}}>Enregistrer</button></Modal>}
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
