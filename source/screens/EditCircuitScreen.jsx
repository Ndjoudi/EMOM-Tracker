// ─── Edit Circuit Screen ───
const { useState: uSEC, useRef: uREC } = React;
const S  = window.S;
const IC = window.IC;

window.EditCircuitScreen = function EditCircuitScreen({ circuit, onSave, onDelete, onBack }) {
  const [name,    setName]    = uSEC(circuit.name    || '');
  const [restSec, setRestSec] = uSEC(circuit.restSec || 90);
  const [exos,    setExos]    = uSEC(circuit.exos    || []); // [{id, name}]
  const [newExo,  setNewExo]  = uSEC('');
  const inputRef = uREC(null);

  const addExo = () => {
    const n = newExo.trim();
    if (!n) return;
    setExos(p => [...p, { id: window.uid(), name: n }]);
    setNewExo('');
    setTimeout(() => inputRef.current && inputRef.current.focus(), 50);
  };

  const removeExo = id => setExos(p => p.filter(e => e.id !== id));

  const moveExo = (i, dir) => {
    setExos(p => {
      const n = [...p];
      const j = i + dir;
      if (j < 0 || j >= n.length) return n;
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });
  };

  const save = () => {
    if (!name.trim() || exos.length === 0) return;
    onSave({ ...circuit, name: name.trim(), restSec, exos });
  };

  const restLabel = s => `${Math.floor(s/60)}m${s%60>0?(s%60)+'s':''}`;

  return (
    <div style={S.app}>
      <div style={S.header}>
        <button style={S.btnG} onClick={onBack}><IC.back/></button>
        <span style={S.hTitle}>{circuit.id ? 'Modifier circuit' : 'Nouveau circuit'}</span>
        <div style={{width:30}}/>
      </div>

      <div style={S.card}>
        <label style={S.lbl}>Nom du circuit</label>
        <input style={S.inp} placeholder="Ex: Circuit Push" value={name} onChange={e=>setName(e.target.value)}/>
      </div>

      <div style={S.card}>
        <label style={S.lbl}>Repos entre séries</label>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:6}}>
          {[60,90,120,150,180].map(s=>(
            <button key={s} onClick={()=>setRestSec(s)} style={{background:restSec===s?'#0D7A8A33':'#1E1E22',border:`1px solid ${restSec===s?'#0D7A8A':'#2A2A2E'}`,borderRadius:8,padding:'7px 14px',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit',color:restSec===s?'#0D7A8A':'#888'}}>
              {restLabel(s)}
            </button>
          ))}
        </div>
        <div style={{fontSize:12,color:'#555',marginTop:8}}>Sélectionné : {restLabel(restSec)}</div>
      </div>

      <div style={S.card}>
        <div style={{fontSize:13,fontWeight:700,color:'#aaa',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:12}}>
          Exercices du circuit <span style={{color:'#555',fontWeight:400}}>({exos.length} exo{exos.length>1?'s':''} · {exos.length} min/série)</span>
        </div>

        {exos.length===0 && <div style={{fontSize:13,color:'#444',textAlign:'center',padding:'16px 0'}}>Aucun exercice — ajoutes-en ci-dessous</div>}

        {exos.map((ex,i)=>(
          <div key={ex.id} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 0',borderBottom:'1px solid #1A1A1E'}}>
            <div style={{display:'flex',flexDirection:'column',gap:2}}>
              <button onClick={()=>moveExo(i,-1)} disabled={i===0} style={{background:'none',border:'none',cursor:i===0?'default':'pointer',color:i===0?'#333':'#666',padding:'0 4px',fontSize:11,fontFamily:'inherit'}}>▲</button>
              <button onClick={()=>moveExo(i,1)}  disabled={i===exos.length-1} style={{background:'none',border:'none',cursor:i===exos.length-1?'default':'pointer',color:i===exos.length-1?'#333':'#666',padding:'0 4px',fontSize:11,fontFamily:'inherit'}}>▼</button>
            </div>
            <div style={{width:24,height:24,borderRadius:'50%',background:'#1E1E22',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#0D7A8A',flexShrink:0}}>{i+1}</div>
            <span style={{flex:1,fontSize:14,fontWeight:600}}>{ex.name}</span>
            <button onClick={()=>removeExo(ex.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#EF4444',padding:'4px',fontFamily:'inherit',fontSize:16}}>✕</button>
          </div>
        ))}

        <div style={{display:'flex',gap:8,marginTop:12,alignItems:'center'}}>
          <input
            ref={inputRef}
            style={{...S.inp,flex:1,margin:0,fontSize:14}}
            placeholder="Nom de l'exercice..."
            value={newExo}
            onChange={e=>setNewExo(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&addExo()}
          />
          <button onClick={addExo} style={{background:S.blue,border:'none',borderRadius:10,padding:'10px 14px',cursor:'pointer',fontFamily:'inherit',color:'#fff',fontSize:13,fontWeight:700,flexShrink:0,whiteSpace:'nowrap'}}>
            Ajouter
          </button>
        </div>
      </div>

      <div style={{padding:'0 14px 16px',display:'flex',flexDirection:'column',gap:8}}>
        <button
          style={{...S.btn,opacity:(name.trim()&&exos.length>0)?1:0.4}}
          disabled={!name.trim()||exos.length===0}
          onClick={save}
        >Enregistrer le circuit</button>
        {circuit.id && (
          <button style={{...S.btnO,color:'#EF4444',borderColor:'#991B1B'}} onClick={onDelete}>Supprimer ce circuit</button>
        )}
      </div>
    </div>
  );
};
