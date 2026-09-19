(function(){
// ─── Transfer Screen ───
const {
  useState: useStateTransfer,
  useEffect: useEffectTransfer,
  useRef: useRefTransfer
} = React;
const S = window.S;
const IC = window.IC;
window.TransferScreen = function TransferScreen({
  exLib,
  routines,
  history,
  circuits,
  circuitHistory,
  onImport,
  onBack
}) {
  const [qrMode, setQrMode] = useStateTransfer(false);
  const [importMsg, setImportMsg] = useStateTransfer('');
  const [importOk, setImportOk] = useStateTransfer(false);
  const qrRef = useRefTransfer(null);
  const qrInst = useRefTransfer(null);
  const fileRef = useRefTransfer(null);
  const allData = {
    exLib,
    routines,
    history,
    circuits,
    circuitHistory,
    exportedAt: Date.now()
  };
  function doExport() {
    const blob = new Blob([JSON.stringify(allData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'emom-backup-' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    URL.revokeObjectURL(url);
  }
  function doImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const d = JSON.parse(ev.target.result);
        if (!d.exLib && !d.routines && !d.history && !d.circuits && !d.circuitHistory) throw new Error('Format invalide');
        onImport(d);
        const parts = [];
        if (d.history?.length) parts.push(d.history.length + ' séances');
        if (d.circuitHistory?.length) parts.push(d.circuitHistory.length + ' séances circuit');
        if (d.circuits?.length) parts.push(d.circuits.length + ' circuits');
        setImportMsg('Import réussi ! ' + (parts.join(' · ') || 'données chargées'));
        setImportOk(true);
      } catch (err) {
        setImportMsg('Erreur : fichier invalide.');
        setImportOk(false);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }
  useEffectTransfer(() => {
    if (!qrMode || !qrRef.current) return;
    if (qrInst.current) {
      qrRef.current.innerHTML = '';
      qrInst.current = null;
    }
    const json = JSON.stringify({
      exLib,
      routines,
      history,
      circuits,
      circuitHistory
    });
    if (json.length > 2000) {
      // Version allégée : on garde les définitions (petites) et on tronque les historiques
      const slim = JSON.stringify({
        exLib,
        routines,
        circuits,
        history: history.slice(0, 20),
        circuitHistory: (circuitHistory || []).slice(0, 20)
      });
      if (slim.length > 4000) {
        qrRef.current.innerHTML = '<div style="color:#EF4444;fontSize:13px;padding:16px;textAlign:center">Données trop volumineuses.<br/>Utilise l\'export JSON.</div>';
        return;
      }
      try {
        qrInst.current = new QRCode(qrRef.current, {
          text: slim,
          width: 240,
          height: 240,
          colorDark: '#fff',
          colorLight: '#161618',
          correctLevel: QRCode.CorrectLevel.L
        });
      } catch (e) {}
      return;
    }
    try {
      qrInst.current = new QRCode(qrRef.current, {
        text: json,
        width: 240,
        height: 240,
        colorDark: '#fff',
        colorLight: '#161618',
        correctLevel: QRCode.CorrectLevel.L
      });
    } catch (e) {}
  }, [qrMode]);
  const secTitle = {
    fontSize: 11,
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: 10
  };
  return /*#__PURE__*/React.createElement("div", {
    style: S.app
  }, /*#__PURE__*/React.createElement("div", {
    style: S.header
  }, /*#__PURE__*/React.createElement("button", {
    style: S.btnG,
    onClick: onBack
  }, /*#__PURE__*/React.createElement(IC.back, null)), /*#__PURE__*/React.createElement("span", {
    style: S.hTitle
  }, "Transfert"), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 30
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      ...S.card,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-around',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 700
    }
  }, history.length), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: '#555',
      marginTop: 2
    }
  }, "s\xE9ances")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 700
    }
  }, exLib.length), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: '#555',
      marginTop: 2
    }
  }, "exercices")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 700
    }
  }, routines.length), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: '#555',
      marginTop: 2
    }
  }, "routines")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 700,
      color: S.orange
    }
  }, (circuitHistory || []).length), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: '#555',
      marginTop: 2
    }
  }, "circuits"))), (() => {
    const py = history.reduce((a, h) => a + h.exercises.filter(e => e.pyramid).length, 0);
    return py > 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: '#555',
        textAlign: 'center',
        marginTop: 10,
        paddingTop: 10,
        borderTop: '1px solid #1E1E22'
      }
    }, "dont ", /*#__PURE__*/React.createElement("span", {
      style: {
        color: S.orange,
        fontWeight: 700
      }
    }, py), " exercice", py > 1 ? 's' : '', " pyramide") : null;
  })()), /*#__PURE__*/React.createElement("div", {
    style: S.card
  }, /*#__PURE__*/React.createElement("div", {
    style: secTitle
  }, "Export JSON"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: '#666',
      marginBottom: 12
    }
  }, "T\xE9l\xE9charge toutes tes donn\xE9es. Ouvre le fichier sur PC ou tablette pour importer."), /*#__PURE__*/React.createElement("button", {
    style: S.btn,
    onClick: doExport
  }, "\u2193 Exporter mes donn\xE9es")), /*#__PURE__*/React.createElement("div", {
    style: {
      ...S.card,
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: secTitle
  }, "Import JSON"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: '#666',
      marginBottom: 12
    }
  }, "Charge un fichier export\xE9 depuis un autre appareil."), /*#__PURE__*/React.createElement("input", {
    ref: fileRef,
    type: "file",
    accept: ".json",
    style: {
      display: 'none'
    },
    onChange: doImport
  }), /*#__PURE__*/React.createElement("button", {
    style: S.btnO,
    onClick: () => fileRef.current.click()
  }, "\u2191 Importer un fichier"), importMsg && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      marginTop: 10,
      color: importOk ? '#22C55E' : '#EF4444',
      fontWeight: 600
    }
  }, importMsg)), /*#__PURE__*/React.createElement("div", {
    style: {
      ...S.card,
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: secTitle
  }, "QR Code"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: '#666',
      marginBottom: 12
    }
  }, "Scanne depuis ta tablette ou ton PC. Limit\xE9 aux 20 derni\xE8res s\xE9ances si donn\xE9es trop volumineuses."), !qrMode && /*#__PURE__*/React.createElement("button", {
    style: S.btnO,
    onClick: () => setQrMode(true)
  }, "G\xE9n\xE9rer le QR Code"), qrMode && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: qrRef,
    style: {
      display: 'inline-block',
      padding: 12,
      background: '#161618',
      borderRadius: 10,
      marginBottom: 12
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: '#555',
      marginBottom: 10
    }
  }, "Scanne ce code depuis l'autre appareil"), /*#__PURE__*/React.createElement("button", {
    style: {
      ...S.btnG,
      color: '#666',
      width: '100%',
      justifyContent: 'center'
    },
    onClick: () => {
      setQrMode(false);
      if (qrRef.current) qrRef.current.innerHTML = '';
    }
  }, "Fermer")))));
};
})();
