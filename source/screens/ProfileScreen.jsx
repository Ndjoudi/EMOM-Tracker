// ─── Profile Screen ───
const { useState: useStateProfile } = React;
const S  = window.S;
const IC = window.IC;

window.ProfileScreen = function ProfileScreen({ profile, onSave, onBack }) {
  const [p, setP] = useStateProfile({ ...profile });
  const f = (k, v) => setP(prev => ({ ...prev, [k]: v }));

  return (
    <div style={S.app}>
      <div style={S.header}>
        <button style={S.btnG} onClick={onBack}><IC.back/></button>
        <span style={S.hTitle}>Mon profil</span>
        <button style={{ ...S.btnG, color: S.blue, fontSize: 15, fontWeight: 600 }} onClick={() => onSave(p)}>Sauver</button>
      </div>

      <div style={{ padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={S.card}>
          <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Identité</div>
          <label style={S.lbl}>Prénom</label>
          <input style={{ ...S.inp, marginBottom: 10 }} placeholder="Ex: Neelcafree" value={p.name||''} onChange={e => f('name', e.target.value)}/>
          <label style={S.lbl}>Poids de corps (kg)</label>
          <input style={S.inp} type="number" placeholder="78" value={p.weight||''} onChange={e => f('weight', e.target.value)}/>
        </div>

        <div style={S.card}>
          <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Mensurations (cm) — optionnel</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div><label style={S.lbl}>Bras</label><input style={S.inpS} type="number" placeholder="38" value={p.armCm||''} onChange={e => f('armCm', e.target.value)}/></div>
            <div><label style={S.lbl}>Poitrine</label><input style={S.inpS} type="number" placeholder="102" value={p.chestCm||''} onChange={e => f('chestCm', e.target.value)}/></div>
            <div><label style={S.lbl}>Taille</label><input style={S.inpS} type="number" placeholder="82" value={p.waistCm||''} onChange={e => f('waistCm', e.target.value)}/></div>
          </div>
        </div>

        <div style={S.card}>
          <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Clé API Groq</div>
          <div style={{ fontSize: 12, color: '#555', marginBottom: 10 }}>Récupère ta clé sur <span style={{ color: S.blue }}>console.groq.com/keys</span> — stockée uniquement sur cet appareil.</div>
          <input style={{ ...S.inp, fontFamily: 'monospace', fontSize: 13 }} placeholder="gsk_..." value={p.groqKey||''} onChange={e => f('groqKey', e.target.value)} autoComplete="off" autoCorrect="off" spellCheck={false}/>
          {p.groqKey && <div style={{ fontSize: 12, color: '#22C55E', marginTop: 8 }}>✓ Clé configurée — Coach IA activé</div>}
        </div>
      </div>
    </div>
  );
};
