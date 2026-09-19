(function(){
// ─── Circuit History Screen ───
const {
  useState: uSCH
} = React;
const S = window.S;
const IC = window.IC;
window.CircuitHistoryScreen = function CircuitHistoryScreen({
  circuitHistory,
  circuits,
  onBack,
  onDelete
}) {
  const [selCircuit, setSelCircuit] = uSCH('all');
  const [expanded, setExpanded] = uSCH(null);
  const circuitNames = [...new Set(circuitHistory.map(h => h.circuitName))];
  const filtered = selCircuit === 'all' ? circuitHistory : circuitHistory.filter(h => h.circuitName === selCircuit);
  const fmt2 = ms => {
    const s = Math.floor(ms / 1000);
    return Math.floor(s / 60) + 'm' + String(s % 60).padStart(2, '0') + 's';
  };
  const dateLabel = ts => new Date(ts).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
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
  }, "Historique Circuits"), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 30
    }
  })), circuitNames.length > 1 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      padding: '10px 14px 4px',
      overflowX: 'auto'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setSelCircuit('all'),
    style: {
      background: selCircuit === 'all' ? '#1E1E22' : 'transparent',
      border: selCircuit === 'all' ? '1px solid #333' : '1px solid transparent',
      borderRadius: 8,
      padding: '5px 12px',
      fontSize: 13,
      fontWeight: 600,
      cursor: 'pointer',
      fontFamily: 'inherit',
      color: selCircuit === 'all' ? '#fff' : '#555',
      whiteSpace: 'nowrap',
      flexShrink: 0
    }
  }, "Tous"), circuitNames.map(n => /*#__PURE__*/React.createElement("button", {
    key: n,
    onClick: () => setSelCircuit(n),
    style: {
      background: selCircuit === n ? '#F59E0B22' : 'transparent',
      border: selCircuit === n ? '1px solid #F59E0B' : '1px solid transparent',
      borderRadius: 8,
      padding: '5px 12px',
      fontSize: 13,
      fontWeight: 600,
      cursor: 'pointer',
      fontFamily: 'inherit',
      color: selCircuit === n ? '#F59E0B' : '#555',
      whiteSpace: 'nowrap',
      flexShrink: 0
    }
  }, n))), filtered.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: 60,
      color: '#555',
      fontSize: 14
    }
  }, "Aucune s\xE9ance enregistr\xE9e"), filtered.map((entry, idx) => {
    const isOpen = expanded === entry.date + idx;
    const totalReps = entry.series.reduce((a, row) => a + row.reduce((b, v) => b + (parseInt(v) || 0), 0), 0);
    return /*#__PURE__*/React.createElement("div", {
      key: idx,
      style: {
        ...S.card,
        marginTop: idx === 0 ? 10 : 0,
        borderColor: isOpen ? '#F59E0B44' : undefined
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        cursor: 'pointer'
      },
      onClick: () => setExpanded(isOpen ? null : entry.date + idx)
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        background: '#F59E0B22',
        color: '#F59E0B',
        borderRadius: 5,
        padding: '1px 7px',
        fontWeight: 700
      }
    }, "\u26A1 Circuit"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 15,
        fontWeight: 700
      }
    }, entry.circuitName)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: '#555'
      }
    }, dateLabel(entry.date)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 12,
        marginTop: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: '#888'
      }
    }, entry.series.length, " s\xE9rie", entry.series.length > 1 ? 's' : ''), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: '#888'
      }
    }, entry.exos.length, " exo", entry.exos.length > 1 ? 's' : ''), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: '#888'
      }
    }, totalReps, " reps total"), entry.duration && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: '#888'
      }
    }, fmt2(entry.duration)))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 18,
        color: '#555'
      }
    }, isOpen ? '▲' : '▼'))), isOpen && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 12,
        borderTop: '1px solid #1E1E22',
        paddingTop: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        overflowX: 'auto'
      }
    }, /*#__PURE__*/React.createElement("table", {
      style: {
        borderCollapse: 'separate',
        borderSpacing: '3px',
        width: '100%'
      }
    }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", {
      style: {
        fontSize: 10,
        color: '#555',
        fontWeight: 700,
        textAlign: 'left',
        padding: '0 4px 6px',
        textTransform: 'uppercase'
      }
    }, "S\xE9r."), entry.exos.map((ex, ei) => /*#__PURE__*/React.createElement("th", {
      key: ei,
      style: {
        fontSize: 10,
        color: '#aaa',
        fontWeight: 700,
        textAlign: 'center',
        padding: '0 2px 6px',
        minWidth: 44
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        maxWidth: 64
      }
    }, ex.name))), /*#__PURE__*/React.createElement("th", {
      style: {
        fontSize: 10,
        color: '#555',
        fontWeight: 700,
        textAlign: 'right',
        padding: '0 0 6px 4px'
      }
    }, "Total"))), /*#__PURE__*/React.createElement("tbody", null, (() => {
      // Séance précédente du MÊME circuit (pas juste filtered[idx+1] qui peut être un autre circuit)
      const sameList = circuitHistory.filter(h => h.circuitName === entry.circuitName);
      const myPos = sameList.findIndex(h => h.date === entry.date);
      const prevEntry = myPos >= 0 ? sameList[myPos + 1] : null;
      return entry.series.map((row, si) => {
        const rowTotal = row.reduce((a, v) => a + (parseInt(v) || 0), 0);
        return /*#__PURE__*/React.createElement("tr", {
          key: si
        }, /*#__PURE__*/React.createElement("td", {
          style: {
            fontSize: 12,
            fontWeight: 700,
            color: '#555',
            padding: '4px 4px 4px 0'
          }
        }, si + 1), row.map((val, ei) => {
          const cur = parseInt(val) || 0;
          const prev = prevEntry && prevEntry.series[si] ? parseInt(prevEntry.series[si][ei]) || 0 : null;
          const color = !cur ? '#555' : prev === null ? '#E8E8EA' : cur > prev ? '#22C55E' : cur === prev ? '#F59E0B' : '#EF4444';
          const bg = !cur ? 'transparent' : prev === null ? '#1E1E22' : cur > prev ? '#22C55E11' : cur === prev ? '#F59E0B11' : '#EF444411';
          const border = !cur ? '1px solid #222' : prev === null ? '1px solid #2A2A2E' : cur > prev ? '1px solid #22C55E33' : cur === prev ? '1px solid #F59E0B33' : '1px solid #EF444433';
          return /*#__PURE__*/React.createElement("td", {
            key: ei,
            style: {
              padding: '2px'
            }
          }, /*#__PURE__*/React.createElement("div", {
            style: {
              background: bg,
              border,
              borderRadius: 6,
              padding: '6px 4px',
              textAlign: 'center',
              fontSize: 13,
              fontWeight: 700,
              color,
              minWidth: 40
            }
          }, val || '—'));
        }), /*#__PURE__*/React.createElement("td", {
          style: {
            fontSize: 12,
            fontWeight: 700,
            color: '#555',
            textAlign: 'right',
            padding: '4px 0 4px 4px'
          }
        }, rowTotal));
      });
    })()))), /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        if (window.confirm('Supprimer cette séance ?')) onDelete(entry.date + idx, idx);
      },
      style: {
        marginTop: 10,
        background: 'transparent',
        border: '1px solid #991B1B',
        borderRadius: 8,
        padding: '6px 14px',
        fontSize: 12,
        color: '#EF4444',
        cursor: 'pointer',
        fontFamily: 'inherit'
      }
    }, "Supprimer")));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 40
    }
  }));
};
})();
