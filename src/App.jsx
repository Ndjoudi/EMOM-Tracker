const {useState,useEffect}=React;
const S=window.S,IC=window.IC;

function App(){
  const[screen,setScreen]=useState('home');
  const[exLib,setExLib]=useState(()=>window.load(window.SK.exercises)||[]);
  const[routines,setRoutines]=useState(()=>window.load(window.SK.routines)||[]);
  const[history,setHistory]=useState(()=>window.load(window.SK.history)||[]);
  const[editRoutine,setEditRoutine]=useState(null);
  const[activeWo,setActiveWo]=useState(null);
  const[resumeDraft,setResumeDraft]=useState(()=>window.load(window.SK.draft));
  const[profile,setProfile]=useState(()=>window.load(window.SK.profile)||{groqKey:'',weight:'',armCm:'',chestCm:'',waistCm:'',name:''});
  const[recapWo,setRecapWo]=useState(null);

  useEffect(()=>{window.save(window.SK.exercises,exLib);},[exLib]);
  useEffect(()=>{window.save(window.SK.routines,routines);},[routines]);
  useEffect(()=>{window.save(window.SK.history,history);},[history]);
  useEffect(()=>{window.save(window.SK.profile,profile);},[profile]);

  const saveRoutine=r=>{setRoutines(p=>{const i=p.findIndex(x=>x.id===r.id);if(i>=0){const n=[...p];n[i]=r;return n;}return[...p,r];});setEditRoutine(null);setScreen('home');};
  const deleteRoutine=id=>{setRoutines(p=>p.filter(r=>r.id!==id));setScreen('home');};

  const startWorkout=routine=>{
    window.unlockAudio();
    const wo={id:window.uid(),routineId:routine.id,routineName:routine.name,startedAt:Date.now(),
      exercises:routine.exerciseRefs.map(ref=>{const libEx=exLib.find(e=>e.id===ref.exId);if(!libEx)return null;return{exId:libEx.id,name:libEx.name,rm:libEx.rm,nbSets:ref.nbSets,emomTime:ref.emomTime,sets:Array.from({length:ref.nbSets},(_,i)=>{const p=window.getLastPerf(history,libEx.name,i);return{kg:p?p.kg:'',reps:p?p.reps:'',done:false};})};}).filter(Boolean),
      currentExIndex:0,currentSet:0};
    setActiveWo(wo);setScreen('workout');
  };

  const finishWorkout=wo=>{
    const entry={id:wo.id,routineName:wo.routineName,date:wo.startedAt,duration:Date.now()-wo.startedAt,exercises:wo.exercises.map(ex=>({name:ex.name,exId:ex.exId,rm:ex.rm,sets:ex.sets}))};
    wo.exercises.forEach(ex=>{setExLib(p=>p.map(e=>e.id===ex.exId?{...e,rm:ex.rm}:e));});
    setHistory(p=>[entry,...p]);setActiveWo(null);
    window.save(window.SK.draft,null);setResumeDraft(null);
    setRecapWo({wo,entry});setScreen('recap');
  };

  const HomeScreen=window.HomeScreen,WorkoutScreen=window.WorkoutScreen,RecapScreen=window.RecapScreen;
  const EditRoutineScreen=window.EditRoutineScreen,ExLibScreen=window.ExLibScreen;
  const HistoryScreen=window.HistoryScreen,StatsScreen=window.StatsScreen;
  const TransferScreen=window.TransferScreen,CoachScreen=window.CoachScreen,ProfileScreen=window.ProfileScreen;

  if(screen==='workout'&&activeWo) return<WorkoutScreen wo={activeWo} setWo={setActiveWo} onFinish={finishWorkout} onCancel={()=>{setActiveWo(null);setScreen('home');}} history={history} exLib={exLib} setExLib={setExLib}/>;
  if(screen==='recap'&&recapWo) return<RecapScreen data={recapWo} history={history} profile={profile} onHome={()=>{setRecapWo(null);setScreen('home');}} onSaveProfile={p=>setProfile(prev=>({...prev,...p}))}/>;
  if(screen==='editRoutine') return<EditRoutineScreen routine={editRoutine} exLib={exLib} setExLib={setExLib} onSave={saveRoutine} onDelete={()=>deleteRoutine(editRoutine.id)} onBack={()=>setScreen('home')}/>;
  if(screen==='exLib') return<ExLibScreen exLib={exLib} setExLib={setExLib} history={history} onBack={()=>setScreen('home')}/>;
  if(screen==='history') return<HistoryScreen history={history} routines={routines} onBack={()=>setScreen('home')} onUpdate={(id,u)=>setHistory(p=>p.map(h=>h.id===id?u:h))} onDelete={id=>setHistory(p=>p.filter(h=>h.id!==id))}/>;
  if(screen==='stats') return<StatsScreen history={history} onBack={()=>setScreen('home')}/>;
  if(screen==='transfer') return<TransferScreen exLib={exLib} routines={routines} history={history} onImport={d=>{if(d.exLib)setExLib(d.exLib);if(d.routines)setRoutines(d.routines);if(d.history)setHistory(d.history);}} onBack={()=>setScreen('home')}/>;
  if(screen==='coach') return<CoachScreen history={history} profile={profile} routines={routines} exLib={exLib} onBack={()=>setScreen('home')} onSaveProfile={p=>setProfile(prev=>({...prev,...p}))}/>;
  if(screen==='profile') return<ProfileScreen profile={profile} onSave={p=>{setProfile(p);setScreen('home');}} onBack={()=>setScreen('home')}/>;

  return<HomeScreen
    routines={routines} history={history} exLib={exLib} resumeDraft={resumeDraft}
    onStartWorkout={startWorkout}
    onEditRoutine={r=>{setEditRoutine({...r,exerciseRefs:r.exerciseRefs.map(e=>({...e}))});setScreen('editRoutine');}}
    onNewRoutine={()=>{setEditRoutine({id:window.uid(),name:'',exerciseRefs:[]});setScreen('editRoutine');}}
    onNavigate={setScreen}
    onResumeDraft={()=>{setActiveWo(resumeDraft);setScreen('workout');}}
    onClearDraft={()=>{window.save(window.SK.draft,null);setResumeDraft(null);}}
  />;
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
