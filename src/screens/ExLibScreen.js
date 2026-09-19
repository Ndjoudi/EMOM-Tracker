(function(){
// ─── Exercise Library Screen ───
const {
  useState: useStateExLib
} = React;
const S = window.S;
const IC = window.IC;
window.ExLibScreen = function ExLibScreen({
  exLib,
  setExLib,
  history,
  onBack
}) {
  const [showAdd, setShowAdd] = useStateExLib(false);
  const [editEx, setEditEx] = useStateExLib(null);
  const [name, setName] = useStateExLib("");
  const [rm, setRm] = useStateExLib("");
  const [showHist, setShowHist] = useStateExLib(null);
  const Modal = window.Modal;
  const ExHistoryTable = window.ExHistoryTable;
  return /*#__PURE__*/React.createElement("div", {
    style: S.app
  }, /*#__PURE__*/React.createElement("div", {
    style: S.header
  }, /*#__PURE__*/React.createElement("button", {
    style: S.btnG,
    onClick: onBack
  }, /*#__PURE__*/React.createElement(IC.back, null)), /*#__PURE__*/React.createElement("span", {
    style: S.hTitle
  }, "Mes Exercices"), /*#__PURE__*/React.createElement("button", {
    style: {
      ...S.btnG,
      color: S.blue
    },
    onClick: () => {
      setName("");
      setRm("");
      setShowAdd(true);
    }
  }, /*#__PURE__*/React.createElement(IC.plus, null))), exLib.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: 50,
      color: "#555",
      fontSize: 14
    }
  }, "Aucun exercice. Appuie sur +"), exLib.map(ex => /*#__PURE__*/React.createElement("div", {
    key: ex.id,
    style: S.card
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700
    }
  }, ex.name), ex.bodyweight && /*#__PURE__*/React.createElement("span", {
    style: {
      background: '#0D7A8A22',
      color: '#0D7A8A',
      fontSize: 10,
      fontWeight: 700,
      padding: '2px 7px',
      borderRadius: 5
    }
  }, "PdC")), ex.rm && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 6,
      marginTop: 6,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "#888"
    }
  }, "1RM: ", ex.rm, "kg"), window.calcP(Number(ex.rm)).map((v, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      fontSize: 11,
      color: "#8B8BFF"
    }
  }, window.pcts[i], "%:", v)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: S.btnG,
    onClick: () => setShowHist(ex.name)
  }, /*#__PURE__*/React.createElement(IC.hist, null)), /*#__PURE__*/React.createElement("button", {
    style: S.btnG,
    onClick: () => setEditEx({
      ...ex
    })
  }, /*#__PURE__*/React.createElement(IC.edit, null)), /*#__PURE__*/React.createElement("button", {
    style: {
      ...S.btnG,
      color: S.red
    },
    onClick: () => setExLib(p => p.filter(e => e.id !== ex.id))
  }, /*#__PURE__*/React.createElement(IC.trash, null)))))), showAdd && /*#__PURE__*/React.createElement(Modal, {
    onClose: () => setShowAdd(false)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 700,
      marginBottom: 16
    }
  }, "Nouvel exercice"), /*#__PURE__*/React.createElement("label", {
    style: S.lbl
  }, "Nom"), /*#__PURE__*/React.createElement("input", {
    style: S.inp,
    placeholder: "Ex: \xC9l\xE9vation lat\xE9rale",
    value: name,
    onChange: e => setName(e.target.value),
    autoFocus: true
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 12
    }
  }), /*#__PURE__*/React.createElement("label", {
    style: S.lbl
  }, "1RM (kg) \u2014 optionnel"), /*#__PURE__*/React.createElement("input", {
    style: S.inp,
    type: "number",
    placeholder: "85",
    value: rm,
    onChange: e => setRm(e.target.value)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 12
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowAdd(p => ({
      ...p,
      bw: !p.bw
    })),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: 0,
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 20,
      borderRadius: 10,
      background: showAdd.bw ? S.blue : '#333',
      transition: 'background .2s',
      position: 'relative',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 16,
      height: 16,
      borderRadius: '50%',
      background: '#fff',
      position: 'absolute',
      top: 2,
      left: showAdd.bw ? 18 : 2,
      transition: 'left .2s'
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: '#aaa'
    }
  }, "Poids de corps (dips, tractions\u2026)")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 12
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowAdd(p => ({
      ...p,
      py: !p.py
    })),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: 0,
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 20,
      borderRadius: 10,
      background: showAdd.py ? S.orange : '#333',
      transition: 'background .2s',
      position: 'relative',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 16,
      height: 16,
      borderRadius: '50%',
      background: '#fff',
      position: 'absolute',
      top: 2,
      left: showAdd.py ? 18 : 2,
      transition: 'left .2s'
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: showAdd.py ? S.orange : '#aaa'
    }
  }, "Mode pyramide par d\xE9faut")), showAdd.py && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr 1fr',
      gap: 8,
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: S.lbl
  }, "Lignes"), /*#__PURE__*/React.createElement("input", {
    style: S.inpS,
    type: "number",
    value: showAdd.pyRows ?? 3,
    onChange: e => setShowAdd(p => ({
      ...p,
      pyRows: Math.max(1, parseInt(e.target.value) || 1)
    }))
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: S.lbl
  }, "Colonnes"), /*#__PURE__*/React.createElement("input", {
    style: S.inpS,
    type: "number",
    value: showAdd.pyCols ?? 5,
    onChange: e => setShowAdd(p => ({
      ...p,
      pyCols: Math.max(1, parseInt(e.target.value) || 1)
    }))
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: S.lbl
  }, "X (sec)"), /*#__PURE__*/React.createElement("input", {
    style: S.inpS,
    type: "number",
    value: showAdd.pyX ?? 60,
    onChange: e => setShowAdd(p => ({
      ...p,
      pyX: Math.max(5, parseInt(e.target.value) || 60)
    }))
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: S.lbl
  }, "Y (sec)"), /*#__PURE__*/React.createElement("input", {
    style: S.inpS,
    type: "number",
    value: showAdd.pyY ?? 120,
    onChange: e => setShowAdd(p => ({
      ...p,
      pyY: Math.max(0, parseInt(e.target.value) || 120)
    }))
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 16
    }
  }), /*#__PURE__*/React.createElement("button", {
    style: S.btn,
    onClick: () => {
      if (!name.trim()) return;
      setExLib(p => [...p, {
        id: window.uid(),
        name: name.trim(),
        rm,
        bodyweight: !!showAdd.bw,
        pyramid: !!showAdd.py,
        pyRows: showAdd.pyRows ?? 3,
        pyCols: showAdd.pyCols ?? 5,
        pyX: showAdd.pyX ?? 60,
        pyY: showAdd.pyY ?? 120
      }]);
      setShowAdd(false);
    }
  }, "Ajouter")), editEx && /*#__PURE__*/React.createElement(Modal, {
    onClose: () => setEditEx(null)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 700,
      marginBottom: 16
    }
  }, "Modifier"), /*#__PURE__*/React.createElement("label", {
    style: S.lbl
  }, "Nom"), /*#__PURE__*/React.createElement("input", {
    style: S.inp,
    value: editEx.name,
    onChange: e => setEditEx({
      ...editEx,
      name: e.target.value
    })
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 12
    }
  }), /*#__PURE__*/React.createElement("label", {
    style: S.lbl
  }, "1RM (kg)"), /*#__PURE__*/React.createElement("input", {
    style: S.inp,
    type: "number",
    value: editEx.rm,
    onChange: e => setEditEx({
      ...editEx,
      rm: e.target.value
    })
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 12
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => setEditEx(p => ({
      ...p,
      bodyweight: !p.bodyweight
    })),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: 0,
      width: '100%',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 20,
      borderRadius: 10,
      background: editEx.bodyweight ? S.blue : '#333',
      transition: 'background .2s',
      position: 'relative',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 16,
      height: 16,
      borderRadius: '50%',
      background: '#fff',
      position: 'absolute',
      top: 2,
      left: editEx.bodyweight ? 18 : 2,
      transition: 'left .2s'
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: '#aaa'
    }
  }, "Poids de corps")), /*#__PURE__*/React.createElement("button", {
    onClick: () => setEditEx(p => ({
      ...p,
      pyramid: !p.pyramid
    })),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: 0,
      width: '100%',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 20,
      borderRadius: 10,
      background: editEx.pyramid ? S.orange : '#333',
      transition: 'background .2s',
      position: 'relative',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 16,
      height: 16,
      borderRadius: '50%',
      background: '#fff',
      position: 'absolute',
      top: 2,
      left: editEx.pyramid ? 18 : 2,
      transition: 'left .2s'
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: editEx.pyramid ? S.orange : '#aaa'
    }
  }, "Mode pyramide par d\xE9faut")), editEx.pyramid && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr 1fr',
      gap: 8,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: S.lbl
  }, "Lignes"), /*#__PURE__*/React.createElement("input", {
    style: S.inpS,
    type: "number",
    value: editEx.pyRows ?? 3,
    onChange: e => setEditEx(p => ({
      ...p,
      pyRows: Math.max(1, parseInt(e.target.value) || 1)
    }))
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: S.lbl
  }, "Colonnes"), /*#__PURE__*/React.createElement("input", {
    style: S.inpS,
    type: "number",
    value: editEx.pyCols ?? 5,
    onChange: e => setEditEx(p => ({
      ...p,
      pyCols: Math.max(1, parseInt(e.target.value) || 1)
    }))
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: S.lbl
  }, "X (sec)"), /*#__PURE__*/React.createElement("input", {
    style: S.inpS,
    type: "number",
    value: editEx.pyX ?? 60,
    onChange: e => setEditEx(p => ({
      ...p,
      pyX: Math.max(5, parseInt(e.target.value) || 60)
    }))
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: S.lbl
  }, "Y (sec)"), /*#__PURE__*/React.createElement("input", {
    style: S.inpS,
    type: "number",
    value: editEx.pyY ?? 120,
    onChange: e => setEditEx(p => ({
      ...p,
      pyY: Math.max(0, parseInt(e.target.value) || 120)
    }))
  }))), /*#__PURE__*/React.createElement("button", {
    style: S.btn,
    onClick: () => {
      setExLib(p => p.map(e => e.id === editEx.id ? editEx : e));
      setEditEx(null);
    }
  }, "Sauver")), showHist && /*#__PURE__*/React.createElement(Modal, {
    onClose: () => setShowHist(null)
  }, /*#__PURE__*/React.createElement(ExHistoryTable, {
    exName: showHist,
    history: history,
    onClose: () => setShowHist(null)
  })));
};
})();
