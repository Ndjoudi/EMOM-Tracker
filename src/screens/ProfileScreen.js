(function(){
// ─── Profile Screen ───
const {
  useState: useStateProfile
} = React;
const S = window.S;
const IC = window.IC;
window.ProfileScreen = function ProfileScreen({
  profile,
  onSave,
  onBack
}) {
  const [p, setP] = useStateProfile({
    ...profile
  });
  const f = (k, v) => setP(prev => ({
    ...prev,
    [k]: v
  }));
  return /*#__PURE__*/React.createElement("div", {
    style: S.app
  }, /*#__PURE__*/React.createElement("div", {
    style: S.header
  }, /*#__PURE__*/React.createElement("button", {
    style: S.btnG,
    onClick: onBack
  }, /*#__PURE__*/React.createElement(IC.back, null)), /*#__PURE__*/React.createElement("span", {
    style: S.hTitle
  }, "Mon profil"), /*#__PURE__*/React.createElement("button", {
    style: {
      ...S.btnG,
      color: S.blue,
      fontSize: 15,
      fontWeight: 600
    },
    onClick: () => onSave(p)
  }, "Sauver")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: S.card
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: '#555',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      marginBottom: 12
    }
  }, "Identit\xE9"), /*#__PURE__*/React.createElement("label", {
    style: S.lbl
  }, "Pr\xE9nom"), /*#__PURE__*/React.createElement("input", {
    style: {
      ...S.inp,
      marginBottom: 10
    },
    placeholder: "Ex: Neelcafree",
    value: p.name || '',
    onChange: e => f('name', e.target.value)
  }), /*#__PURE__*/React.createElement("label", {
    style: S.lbl
  }, "Poids de corps (kg)"), /*#__PURE__*/React.createElement("input", {
    style: S.inp,
    type: "number",
    placeholder: "78",
    value: p.weight || '',
    onChange: e => f('weight', e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    style: S.card
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: '#555',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      marginBottom: 12
    }
  }, "Mensurations (cm) \u2014 optionnel"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: S.lbl
  }, "Bras"), /*#__PURE__*/React.createElement("input", {
    style: S.inpS,
    type: "number",
    placeholder: "38",
    value: p.armCm || '',
    onChange: e => f('armCm', e.target.value)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: S.lbl
  }, "Poitrine"), /*#__PURE__*/React.createElement("input", {
    style: S.inpS,
    type: "number",
    placeholder: "102",
    value: p.chestCm || '',
    onChange: e => f('chestCm', e.target.value)
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    style: S.lbl
  }, "Taille"), /*#__PURE__*/React.createElement("input", {
    style: S.inpS,
    type: "number",
    placeholder: "82",
    value: p.waistCm || '',
    onChange: e => f('waistCm', e.target.value)
  })))), /*#__PURE__*/React.createElement("div", {
    style: S.card
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: '#555',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      marginBottom: 6
    }
  }, "Cl\xE9 API Groq"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: '#555',
      marginBottom: 10
    }
  }, "R\xE9cup\xE8re ta cl\xE9 sur ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: S.blue
    }
  }, "console.groq.com/keys"), " \u2014 stock\xE9e uniquement sur cet appareil."), /*#__PURE__*/React.createElement("input", {
    style: {
      ...S.inp,
      fontFamily: 'monospace',
      fontSize: 13
    },
    placeholder: "gsk_...",
    value: p.groqKey || '',
    onChange: e => f('groqKey', e.target.value),
    autoComplete: "off",
    autoCorrect: "off",
    spellCheck: false
  }), p.groqKey && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: '#22C55E',
      marginTop: 8
    }
  }, "\u2713 Cl\xE9 configur\xE9e \u2014 Coach IA activ\xE9"))));
};
})();
