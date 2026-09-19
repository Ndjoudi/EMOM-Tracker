(function(){
// ─── History Screen ───
const {
  useState: useStateHist
} = React;
const S = window.S;
const IC = window.IC;
window.HistoryScreen = function HistoryScreen({
  history,
  routines,
  onBack,
  onUpdate,
  onDelete
}) {
  const Modal = window.Modal;
  const [editId, setEditId] = useStateHist(null);
  const [editD, setEditD] = useStateHist(null);
  const [delId, setDelId] = useStateHist(null);
  const [filterRoutine, setFilterRoutine] = useStateHist('all');
  const [filterPeriod, setFilterPeriod] = useStateHist('all');
  const startE = h => {
    setEditD(JSON.parse(JSON.stringify(h)));
    setEditId(h.id);
  };
  const saveE = () => {
    if (editD) onUpdate(editD.id, editD);
    setEditId(null);
    setEditD(null);
  };
  const upES = (ei, si, f, v) => {
    setEditD(p => {
      const n = JSON.parse(JSON.stringify(p));
      n.exercises[ei].sets[si][f] = v;
      return n;
    });
  };
  const routineNames = [...new Set(history.map(h => h.routineName))];
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const filtered = history.filter(h => {
    if (filterRoutine !== 'all' && h.routineName !== filterRoutine) return false;
    if (filterPeriod === '7j') {
      const d = new Date(h.date);
      d.setHours(0, 0, 0, 0);
      return now - d <= 7 * 86400000;
    }
    if (filterPeriod === '30j') {
      const d = new Date(h.date);
      d.setHours(0, 0, 0, 0);
      return now - d <= 30 * 86400000;
    }
    if (filterPeriod === '90j') {
      const d = new Date(h.date);
      d.setHours(0, 0, 0, 0);
      return now - d <= 90 * 86400000;
    }
    return true;
  });
  const fBtnStyle = active => ({
    background: active ? '#1E1E22' : 'transparent',
    border: active ? '1px solid #333' : '1px solid transparent',
    borderRadius: 8,
    padding: '5px 12px',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    color: active ? '#fff' : '#555',
    whiteSpace: 'nowrap'
  });
  return /*#__PURE__*/React.createElement("div", {
    style: S.app
  }, /*#__PURE__*/React.createElement("div", {
    style: S.header
  }, /*#__PURE__*/React.createElement("button", {
    style: S.btnG,
    onClick: onBack
  }, /*#__PURE__*/React.createElement(IC.back, null)), /*#__PURE__*/React.createElement("span", {
    style: S.hTitle
  }, "Historique"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: '#555'
    }
  }, filtered.length, " s\xE9ance", filtered.length !== 1 ? 's' : '')), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 14px 4px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      overflowX: 'auto',
      marginBottom: 8
    }
  }, ['all', '7j', '30j', '90j'].map(p => /*#__PURE__*/React.createElement("button", {
    key: p,
    style: fBtnStyle(filterPeriod === p),
    onClick: () => setFilterPeriod(p)
  }, p === 'all' ? 'Tout' : p))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      overflowX: 'auto'
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: fBtnStyle(filterRoutine === 'all'),
    onClick: () => setFilterRoutine('all')
  }, "Toutes"), routineNames.map(n => /*#__PURE__*/React.createElement("button", {
    key: n,
    style: fBtnStyle(filterRoutine === n),
    onClick: () => setFilterRoutine(n)
  }, n)))), filtered.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: 60,
      color: "#555"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement(IC.hist, null)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14
    }
  }, "Aucune s\xE9ance trouv\xE9e")), filtered.map(h => {
    const editing = editId === h.id;
    const d = editing ? editD : h;
    return /*#__PURE__*/React.createElement("div", {
      key: h.id,
      style: S.card
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 15,
        fontWeight: 700
      }
    }, d.routineName), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: S.blue
      }
    }, window.fmt(Math.floor(d.duration / 1000)))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 2
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: "#666",
        marginRight: 4
      }
    }, window.dateFrY(d.date)), !editing && /*#__PURE__*/React.createElement("button", {
      style: S.btnG,
      onClick: () => startE(h)
    }, /*#__PURE__*/React.createElement(IC.edit, null)), !editing && /*#__PURE__*/React.createElement("button", {
      style: {
        ...S.btnG,
        color: S.red
      },
      onClick: () => setDelId(h.id)
    }, /*#__PURE__*/React.createElement(IC.trash, null)))), d.exercises.map((ex, ei) => /*#__PURE__*/React.createElement("div", {
      key: ei,
      style: {
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        color: "#aaa",
        marginBottom: 4,
        display: "flex",
        alignItems: "center",
        gap: 6
      }
    }, ex.name, ex.pyramid && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        background: "#F59E0B22",
        color: S.orange,
        borderRadius: 4,
        padding: "1px 6px",
        fontWeight: 700
      }
    }, "PYRAMIDE")), ex.pyramid && ex.pyGrid ? /*#__PURE__*/React.createElement("div", {
      style: {
        overflowX: "auto"
      }
    }, /*#__PURE__*/React.createElement("table", {
      style: {
        borderCollapse: "separate",
        borderSpacing: "3px"
      }
    }, /*#__PURE__*/React.createElement("tbody", null, ex.pyGrid.map((row, r) => /*#__PURE__*/React.createElement("tr", {
      key: r
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        fontSize: 11,
        fontWeight: 700,
        color: "#555",
        paddingRight: 4
      }
    }, r + 1), row.map((v, c) => /*#__PURE__*/React.createElement("td", {
      key: c,
      style: {
        padding: 0
      }
    }, editing ? /*#__PURE__*/React.createElement("input", {
      style: {
        ...S.inpS,
        width: 46,
        textAlign: "center"
      },
      type: "number",
      value: v,
      onChange: e => setEditD(p => {
        const n = JSON.parse(JSON.stringify(p));
        n.exercises[ei].pyGrid[r][c] = e.target.value;
        return n;
      })
    }) : /*#__PURE__*/React.createElement("div", {
      style: {
        background: v ? "#1E1E22" : "transparent",
        border: v ? "1px solid #2A2A2E" : "1px solid #1A1A1E",
        borderRadius: 6,
        padding: "5px 4px",
        textAlign: "center",
        fontSize: 13,
        fontWeight: 700,
        color: v ? "#ccc" : "#444",
        minWidth: 38
      }
    }, v || "—")))))))) : editing ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 6
      }
    }, ex.sets.map((s, si) => /*#__PURE__*/React.createElement("div", {
      key: si,
      style: {
        display: "flex",
        gap: 8,
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: "#555",
        width: 18
      }
    }, si + 1), /*#__PURE__*/React.createElement("input", {
      style: {
        ...S.inpS,
        width: 64
      },
      type: "number",
      value: s.kg,
      onChange: e => upES(ei, si, "kg", e.target.value)
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        color: "#444",
        fontSize: 12
      }
    }, "\xD7"), /*#__PURE__*/React.createElement("input", {
      style: {
        ...S.inpS,
        width: 64
      },
      type: "number",
      value: s.reps,
      onChange: e => upES(ei, si, "reps", e.target.value)
    })))) : /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        flexWrap: "wrap"
      }
    }, ex.sets.filter(s => s.done).map((s, j) => /*#__PURE__*/React.createElement("span", {
      key: j,
      style: {
        background: "#1E1E22",
        borderRadius: 6,
        padding: "3px 10px",
        fontSize: 13,
        color: "#ccc"
      }
    }, s.kg ? s.kg + "×" : "", s.reps)), ex.sets.filter(s => s.done).length === 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: "#444"
      }
    }, "\u2014")))), editing && /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8,
        marginTop: 10
      }
    }, /*#__PURE__*/React.createElement("button", {
      style: {
        ...S.btn,
        flex: 1
      },
      onClick: saveE
    }, "Sauver"), /*#__PURE__*/React.createElement("button", {
      style: {
        ...S.btnO,
        flex: 1,
        color: "#888",
        borderColor: "#333"
      },
      onClick: () => {
        setEditId(null);
        setEditD(null);
      }
    }, "Annuler")));
  }), delId && /*#__PURE__*/React.createElement(Modal, {
    onClose: () => setDelId(null)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "10px 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 700,
      marginBottom: 12
    }
  }, "Supprimer ?"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: "#888",
      marginBottom: 20
    }
  }, "Action irr\xE9versible."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      ...S.btnO,
      flex: 1,
      color: "#888",
      borderColor: "#333"
    },
    onClick: () => setDelId(null)
  }, "Annuler"), /*#__PURE__*/React.createElement("button", {
    style: {
      ...S.btnD,
      flex: 1
    },
    onClick: () => {
      onDelete(delId);
      setDelId(null);
    }
  }, "Supprimer")))));
};
})();
