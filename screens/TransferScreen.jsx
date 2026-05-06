// ─── Transfer Screen ───
const { useState: useStateTransfer, useEffect: useEffectTransfer, useRef: useRefTransfer } = React;
const S  = window.S;
const IC = window.IC;

window.TransferScreen = function TransferScreen({ exLib, routines, history, onImport, onBack }) {
  const [qrMode, setQrMode]       = useStateTransfer(false);
  const [importMsg, setImportMsg] = useStateTransfer('');
  const [importOk, setImportOk]   = useStateTransfer(false);
  const qrRef  = useRefTransfer(null);
  const qrInst = useRefTransfer(null);
  const fileRef= useRefTransfer(null);

  const allData = { exLib, routines, history, exportedAt: Date.now() };

  function doExport() {
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'emom-backup-' + new Date().toISOString().slice(0,10) + '.json';
    a.click(); URL.revokeObjectURL(url);
  }

  function doImport(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const d = JSON.parse(ev.target.result);
        if (!d.exLib && !d.routines && !d.history) throw new Error('Format invalide');
        onImport(d);
        setImportMsg('Import réussi ! ' + (d.history?.length||0) + ' séances chargées.'); setImportOk(true);
      } catch(err) { setImportMsg('Erreur : fichier invalide.'); setImportOk(false); }
    };
    reader.readAsText(file); e.target.value = '';
  }

  useEffectTransfer(() => {
    if (!qrMode || !qrRef.current) return;
    if (qrInst.current) { qrRef.current.innerHTML = ''; qrInst.current = null; }
    const json = JSON.stringify({ exLib, routines, history });
    if (json.length > 2000) {
      const slim = JSON.stringify({ exLib, routines, history: history.slice(0, 20) });
      if (slim.length > 4000) { qrRef.current.innerHTML = '<div style="color:#EF4444;fontSize:13px;padding:16px;textAlign:center">Données trop volumineuses.<br/>Utilise l\'export JSON.</div>'; return; }
      try { qrInst.current = new QRCode(qrRef.current, { text: slim, width: 240, height: 240, colorDark: '#fff', colorLight: '#161618', correctLevel: QRCode.CorrectLevel.L }); } catch(e) {}
      return;
    }
    try { qrInst.current = new QRCode(qrRef.current, { text: json, width: 240, height: 240, colorDark: '#fff', colorLight: '#161618', correctLevel: QRCode.CorrectLevel.L }); } catch(e) {}
  }, [qrMode]);

  const secTitle = { fontSize:11, color:'#555', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 };

  return (
    <div style={S.app}>
      <div style={S.header}>
        <button style={S.btnG} onClick={onBack}><IC.back/></button>
        <span style={S.hTitle}>Transfert</span>
        <div style={{ width:30 }}/>
      </div>

      <div style={{ padding:'10px 14px' }}>
        <div style={{ ...S.card, marginBottom:10 }}>
          <div style={{ display:'flex', justifyContent:'space-around', textAlign:'center' }}>
            <div><div style={{ fontSize:22, fontWeight:700 }}>{history.length}</div><div style={{ fontSize:11, color:'#555', marginTop:2 }}>séances</div></div>
            <div><div style={{ fontSize:22, fontWeight:700 }}>{exLib.length}</div><div style={{ fontSize:11, color:'#555', marginTop:2 }}>exercices</div></div>
            <div><div style={{ fontSize:22, fontWeight:700 }}>{routines.length}</div><div style={{ fontSize:11, color:'#555', marginTop:2 }}>routines</div></div>
          </div>
        </div>

        <div style={S.card}>
          <div style={secTitle}>Export JSON</div>
          <div style={{ fontSize:13, color:'#666', marginBottom:12 }}>Télécharge toutes tes données. Ouvre le fichier sur PC ou tablette pour importer.</div>
          <button style={S.btn} onClick={doExport}>↓ Exporter mes données</button>
        </div>

        <div style={{ ...S.card, marginTop:10 }}>
          <div style={secTitle}>Import JSON</div>
          <div style={{ fontSize:13, color:'#666', marginBottom:12 }}>Charge un fichier exporté depuis un autre appareil.</div>
          <input ref={fileRef} type="file" accept=".json" style={{ display:'none' }} onChange={doImport}/>
          <button style={S.btnO} onClick={() => fileRef.current.click()}>↑ Importer un fichier</button>
          {importMsg && <div style={{ fontSize:13, marginTop:10, color: importOk?'#22C55E':'#EF4444', fontWeight:600 }}>{importMsg}</div>}
        </div>

        <div style={{ ...S.card, marginTop:10 }}>
          <div style={secTitle}>QR Code</div>
          <div style={{ fontSize:13, color:'#666', marginBottom:12 }}>Scanne depuis ta tablette ou ton PC. Limité aux 20 dernières séances si données trop volumineuses.</div>
          {!qrMode && <button style={S.btnO} onClick={() => setQrMode(true)}>Générer le QR Code</button>}
          {qrMode && (
            <div style={{ textAlign:'center' }}>
              <div ref={qrRef} style={{ display:'inline-block', padding:12, background:'#161618', borderRadius:10, marginBottom:12 }}/>
              <div style={{ fontSize:12, color:'#555', marginBottom:10 }}>Scanne ce code depuis l'autre appareil</div>
              <button style={{ ...S.btnG, color:'#666', width:'100%', justifyContent:'center' }} onClick={() => { setQrMode(false); if(qrRef.current) qrRef.current.innerHTML=''; }}>Fermer</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
