(function(){
// ─── Edit Routine Screen ───
const {
  useState: useStateER
} = React;
const S = window.S;
const IC = window.IC;
window.EditRoutineScreen = function EditRoutineScreen({
  routine,
  exLib,
  setExLib,
  onSave,
  onDelete,
  onBack
}) {
  const Modal = window.Modal;
  const [name, setName] = useStateER(routine ? routine.name : "");
  const [refs, setRefs] = useStateER(routine ? routine.exerciseRefs : []);
  const [showPicker, setShowPicker] = useStateER(false);
  const [newN, setNewN] = useStateER("");
  const [newR, setNewR] = useStateER("");

  // Reprend les réglages pyramide définis sur l'exercice en bibliothèque ;
  // ils restent modifiables ici, routine par routine.
  const addRef = exId => {
    const lib = exLib.find(e => e.id === exId) || {};
    setRefs([...refs, {
      exId,
      nbSets: 4,
      emomTime: 90,
      restTime: 120,
      pyramid: !!lib.pyramid,
      pyRows: lib.pyRows ?? 3,
      pyCols: lib.pyCols ?? 5,
      pyX: lib.pyX ?? 60,
      pyY: lib.pyY ?? 120
    }]);
    setShowPicker(false);
  };
  const upRef = (i, f, v) => {
    const n = [...refs];
    n[i] = {
      ...n[i],
      [f]: v
    };
    setRefs(n);
  };
  const moveUp = i => {
    if (i === 0) return;
    const n = [...refs];
    [n[i - 1], n[i]] = [n[i], n[i - 1]];
    setRefs(n);
  };
  const moveDown = i => {
    if (i === refs.length - 1) return;
    const n = [...refs];
    [n[i], n[i + 1]] = [n[i + 1], n[i]];
    setRefs(n);
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
  }, routine && routine.name ? "Modifier" : "Nouvelle", " Routine"), /*#__PURE__*/React.createElement("button", {
    style: {
      ...S.btnG,
      color: S.blue,
      fontSize: 15,
      fontWeight: 600
    },
    onClick: () => onSave({
      ...routine,
      name,
      exerciseRefs: refs
    })
  }, "Sauver")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px 14px"
    }
  }, /*#__PURE__*/React.createElement("label", {
    style: S.lbl
  }, "Nom de la routine"), /*#__PURE__*/React.createElement("input", {
    style: S.inp,
    placeholder: "Ex: Push Day",
    value: name,
    onChange: e => setName(e.target.value)
  })), refs.map((ref, i) => {
    const ex = exLib.find(e => e.id === ref.exId);
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: S.card
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 15,
        fontWeight: 700
      }
    }, ex ? ex.name : "?"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 2
      }
    }, /*#__PURE__*/React.createElement("button", {
      style: {
        ...S.btnG,
        opacity: i === 0 ? 0.25 : 1
      },
      onClick: () => moveUp(i)
    }, /*#__PURE__*/React.createElement(IC.arrowUp, null)), /*#__PURE__*/React.createElement("button", {
      style: {
        ...S.btnG,
        opacity: i === refs.length - 1 ? 0.25 : 1
      },
      onClick: () => moveDown(i)
    }, /*#__PURE__*/React.createElement(IC.arrowDown, null)), /*#__PURE__*/React.createElement("button", {
      style: {
        ...S.btnG,
        color: S.red
      },
      onClick: () => setRefs(refs.filter((_, j) => j !== i))
    }, /*#__PURE__*/React.createElement(IC.trash, null)))), /*#__PURE__*/React.createElement("button", {
      onClick: () => upRef(i, "pyramid", !ref.pyramid),
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
        width: "100%",
        marginBottom: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 36,
        height: 20,
        borderRadius: 10,
        background: ref.pyramid ? S.orange : "#333",
        transition: "background .2s",
        position: "relative",
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 16,
        height: 16,
        borderRadius: "50%",
        background: "#fff",
        position: "absolute",
        top: 2,
        left: ref.pyramid ? 18 : 2,
        transition: "left .2s"
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: ref.pyramid ? S.orange : "#666"
      }
    }, "Mode pyramide")), ref.pyramid ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 1fr",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: S.lbl
    }, "Lignes"), /*#__PURE__*/React.createElement("input", {
      style: S.inpS,
      type: "number",
      value: ref.pyRows || 3,
      onChange: e => upRef(i, "pyRows", Math.max(1, parseInt(e.target.value) || 1))
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: S.lbl
    }, "Colonnes"), /*#__PURE__*/React.createElement("input", {
      style: S.inpS,
      type: "number",
      value: ref.pyCols || 5,
      onChange: e => upRef(i, "pyCols", Math.max(1, parseInt(e.target.value) || 1))
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: S.lbl
    }, "X (sec)"), /*#__PURE__*/React.createElement("input", {
      style: S.inpS,
      type: "number",
      value: ref.pyX || 60,
      onChange: e => upRef(i, "pyX", Math.max(5, parseInt(e.target.value) || 60))
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: S.lbl
    }, "Y (sec)"), /*#__PURE__*/React.createElement("input", {
      style: S.inpS,
      type: "number",
      value: ref.pyY || 120,
      onChange: e => upRef(i, "pyY", Math.max(0, parseInt(e.target.value) || 120))
    }))) : /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: S.lbl
    }, "S\xE9ries"), /*#__PURE__*/React.createElement("input", {
      style: S.inpS,
      type: "number",
      value: ref.nbSets,
      onChange: e => upRef(i, "nbSets", parseInt(e.target.value) || 0)
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: S.lbl
    }, "EMOM (sec)"), /*#__PURE__*/React.createElement("input", {
      style: S.inpS,
      type: "number",
      value: ref.emomTime,
      onChange: e => upRef(i, "emomTime", parseInt(e.target.value) || 0)
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
      style: S.lbl
    }, "Repos (sec)"), /*#__PURE__*/React.createElement("input", {
      style: S.inpS,
      type: "number",
      value: ref.restTime || 120,
      onChange: e => upRef(i, "restTime", parseInt(e.target.value) || 120)
    }))));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "8px 14px"
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: S.btnO,
    onClick: () => {
      setNewN("");
      setNewR("");
      setShowPicker(true);
    }
  }, /*#__PURE__*/React.createElement(IC.plus, null), " Ajouter un exercice")), onDelete && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "24px 14px"
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      ...S.btnD,
      width: "100%"
    },
    onClick: onDelete
  }, "Supprimer la routine")), showPicker && /*#__PURE__*/React.createElement(Modal, {
    onClose: () => setShowPicker(false)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 17,
      fontWeight: 700
    }
  }, "Choisir un exercice"), /*#__PURE__*/React.createElement("button", {
    style: S.btnG,
    onClick: () => setShowPicker(false)
  }, /*#__PURE__*/React.createElement(IC.close, null))), exLib.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, exLib.map(ex => /*#__PURE__*/React.createElement("button", {
    key: ex.id,
    onClick: () => addRef(ex.id),
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      background: "#1E1E22",
      border: "1px solid #2A2A2E",
      borderRadius: 10,
      padding: "12px 14px",
      marginBottom: 6,
      cursor: "pointer",
      fontFamily: "inherit",
      color: "#E8E8EA"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "left"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600
    }
  }, ex.name), ex.rm && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "#666"
    }
  }, "1RM: ", ex.rm, "kg")), /*#__PURE__*/React.createElement("span", {
    style: {
      color: S.blue
    }
  }, /*#__PURE__*/React.createElement(IC.plus, null))))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid #222",
      paddingTop: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: "#aaa",
      marginBottom: 10
    }
  }, "Ou cr\xE9er un nouveau"), /*#__PURE__*/React.createElement("input", {
    style: {
      ...S.inp,
      marginBottom: 8
    },
    placeholder: "Nom de l'exercice",
    value: newN,
    onChange: e => setNewN(e.target.value)
  }), /*#__PURE__*/React.createElement("input", {
    style: {
      ...S.inp,
      marginBottom: 12
    },
    type: "number",
    placeholder: "1RM (optionnel)",
    value: newR,
    onChange: e => setNewR(e.target.value)
  }), /*#__PURE__*/React.createElement("button", {
    style: S.btn,
    onClick: () => {
      if (!newN.trim()) return;
      const ex = {
        id: window.uid(),
        name: newN.trim(),
        rm: newR
      };
      setExLib(p => [...p, ex]);
      addRef(ex.id);
    }
  }, "Cr\xE9er et ajouter"))));
};
})();
