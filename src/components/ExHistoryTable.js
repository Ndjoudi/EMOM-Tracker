(function(){
// ─── Exercise History Table ───
const S = window.S;
const IC = window.IC;
const thS = window.thS;
window.ExHistoryTable = function ExHistoryTable({
  exName,
  history,
  onClose
}) {
  const entries = window.getExHist(history, exName);
  const maxSets = entries.reduce((m, e) => Math.max(m, e.sets.filter(s => s.done).length), 0);
  // Un exo pyramide ne remplit pas `sets` : son historique vit dans les grilles
  const pyEntries = entries.filter(e => e.pyramid && e.pyGrid && e.pyGrid.length);
  const isPyramid = pyEntries.length > 0;
  if (isPyramid) {
    const totalOf = g => g.flat().reduce((a, v) => a + (parseInt(v) || 0), 0);
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 17,
        fontWeight: 700
      }
    }, exName), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        background: "#F59E0B22",
        color: S.orange,
        borderRadius: 4,
        padding: "1px 6px",
        fontWeight: 700
      }
    }, "PYRAMIDE")), /*#__PURE__*/React.createElement("button", {
      style: S.btnG,
      onClick: onClose
    }, /*#__PURE__*/React.createElement(IC.close, null))), /*#__PURE__*/React.createElement("div", {
      style: {
        maxHeight: "60vh",
        overflowY: "auto"
      }
    }, pyEntries.map((entry, ei) => {
      const prev = pyEntries[ei + 1];
      const total = totalOf(entry.pyGrid);
      const pTot = prev ? totalOf(prev.pyGrid) : null;
      const delta = pTot ? Math.round((total - pTot) / pTot * 100) : null;
      return /*#__PURE__*/React.createElement("div", {
        key: ei,
        style: {
          marginBottom: 16,
          paddingBottom: 12,
          borderBottom: ei < pyEntries.length - 1 ? "1px solid #1E1E22" : "none"
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          alignItems: "baseline",
          gap: 8,
          marginBottom: 6
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 12,
          color: "#aaa",
          fontWeight: 600
        }
      }, window.dateFr(entry.date)), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11,
          color: "#555"
        }
      }, entry.pyGrid.length, "\xD7", entry.pyGrid[0] ? entry.pyGrid[0].length : 0, " \xB7 ", total, " reps"), delta !== null && /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 11,
          fontWeight: 700,
          color: delta > 0 ? "#22C55E" : delta < 0 ? "#EF4444" : "#F59E0B"
        }
      }, delta > 0 ? "▲" : delta < 0 ? "▼" : "=", Math.abs(delta), "%")), /*#__PURE__*/React.createElement("div", {
        style: {
          overflowX: "auto"
        }
      }, /*#__PURE__*/React.createElement("table", {
        style: {
          borderCollapse: "separate",
          borderSpacing: "3px"
        }
      }, /*#__PURE__*/React.createElement("tbody", null, entry.pyGrid.map((row, r) => /*#__PURE__*/React.createElement("tr", {
        key: r
      }, /*#__PURE__*/React.createElement("td", {
        style: {
          fontSize: 11,
          fontWeight: 700,
          color: "#555",
          paddingRight: 4
        }
      }, r + 1), row.map((v, c) => {
        const cur = parseInt(v) || 0;
        const p = prev && prev.pyGrid[r] ? parseInt(prev.pyGrid[r][c]) || 0 : null;
        const col = !cur ? "#444" : p === null || p === 0 ? "#E8E8EA" : cur > p ? "#22C55E" : cur === p ? "#F59E0B" : "#EF4444";
        return /*#__PURE__*/React.createElement("td", {
          key: c,
          style: {
            padding: 0
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            background: cur ? "#1E1E22" : "transparent",
            border: "1px solid " + (cur ? "#2A2A2E" : "#1A1A1E"),
            borderRadius: 6,
            padding: "5px 4px",
            textAlign: "center",
            fontSize: 13,
            fontWeight: 700,
            color: col,
            minWidth: 36
          }
        }, v || "—"));
      })))))));
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 14,
        marginTop: 4,
        justifyContent: "center"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: window.perfC.up
      }
    }, "\u25B2 Progression"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: window.perfC.same
      }
    }, "= Stable"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: window.perfC.down
      }
    }, "\u25BC R\xE9gression")));
  }
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 700
    }
  }, exName), /*#__PURE__*/React.createElement("button", {
    style: S.btnG,
    onClick: onClose
  }, /*#__PURE__*/React.createElement(IC.close, null))), entries.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#555",
      textAlign: "center",
      padding: 30,
      fontSize: 14
    }
  }, "Aucun historique"), entries.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: "auto"
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      borderBottom: "2px solid #2A2A2E"
    }
  }, /*#__PURE__*/React.createElement("th", {
    style: {
      ...thS,
      textAlign: "left",
      minWidth: 60
    }
  }, "Date"), Array.from({
    length: maxSets
  }, (_, i) => /*#__PURE__*/React.createElement("th", {
    key: i,
    style: {
      ...thS,
      textAlign: "center",
      minWidth: 70
    }
  }, "S", i + 1)), /*#__PURE__*/React.createElement("th", {
    style: {
      ...thS,
      textAlign: "center",
      minWidth: 36
    }
  }))), /*#__PURE__*/React.createElement("tbody", null, entries.map((entry, ei) => {
    const prev = entries[ei + 1];
    const done = entry.sets.filter(s => s.done);
    const prevDone = prev ? prev.sets.filter(s => s.done) : [];
    const sessionPerf = prev ? window.getSessionPerf(done, prevDone) : "neutral";
    return /*#__PURE__*/React.createElement("tr", {
      key: ei,
      style: {
        borderBottom: "1px solid #1E1E22"
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "10px 4px 10px 0",
        color: "#aaa",
        fontSize: 12,
        whiteSpace: "nowrap"
      }
    }, window.dateFr(entry.date)), Array.from({
      length: maxSets
    }, (_, si) => {
      const s = done[si];
      const ps = prevDone[si];
      const p = s ? window.perf(s, ps) : "neutral";
      return /*#__PURE__*/React.createElement("td", {
        key: si,
        style: {
          padding: "10px 4px",
          textAlign: "center"
        }
      }, s ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          color: "#E8E8EA",
          fontWeight: 600
        }
      }, s.kg ? s.kg + "×" : "", s.reps), ps && /*#__PURE__*/React.createElement("div", {
        style: {
          color: window.perfC[p],
          fontSize: 11,
          fontWeight: 700,
          marginTop: 2
        }
      }, window.perfI[p])) : /*#__PURE__*/React.createElement("span", {
        style: {
          color: "#333"
        }
      }, "\u2014"));
    }), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "10px 0",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        color: window.perfC[sessionPerf],
        fontWeight: 800
      }
    }, window.perfI[sessionPerf])));
  })))), entries.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 14,
      marginTop: 14,
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: window.perfC.up
    }
  }, "\u25B2 Progression"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: window.perfC.same
    }
  }, "= Stable"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: window.perfC.down
    }
  }, "\u25BC R\xE9gression")));
};
})();
