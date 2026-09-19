// ─── Icons — Lucide via React.createElement ───
// window.lucide est disponible via le CDN UMD chargé avant ce fichier.
// On crée un helper qui transforme un iconNode Lucide en composant React.

(function () {
  const { createElement } = React;

  // Convertit le tableau de données Lucide en éléments React imbriqués
  function lucideToReact(iconNode, size, style) {
    const svgAttrs = {
      xmlns: "http://www.w3.org/2000/svg",
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 2,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      style: { display: "block", flexShrink: 0, ...style },
    };

    const children = iconNode.map(([tag, attrs], i) => {
      // Convertir les attributs kebab-case → camelCase pour React
      const reactAttrs = { key: i };
      for (const [k, v] of Object.entries(attrs)) {
        const camel = k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        reactAttrs[camel] = v;
      }
      return createElement(tag, reactAttrs);
    });

    return createElement("svg", svgAttrs, ...children);
  }

  // Factory : crée un composant React pour une icône Lucide donnée
  function makeIcon(name, defaultSize = 20) {
    return function LucideIcon({ size, style } = {}) {
      const iconData = window.lucide[name];
      if (!iconData) {
        console.warn(`[Icons] Lucide icon "${name}" not found`);
        return null;
      }
      return lucideToReact(iconData, size ?? defaultSize, style);
    };
  }

  window.IC = {
    // Navigation & actions générales
    plus:      makeIcon("Plus", 20),
    minus:     makeIcon("Minus", 20),
    play:      makeIcon("Play", 22),
    stop:      makeIcon("Square", 18),
    back:      makeIcon("ChevronLeft", 22),
    trash:     makeIcon("Trash2", 18),
    check:     makeIcon("Check", 18),
    checkAll:  makeIcon("CheckCheck", 20),
    close:     makeIcon("X", 20),
    edit:      makeIcon("Pencil", 14),
    arrowUp:   makeIcon("ChevronUp", 16),
    arrowDown: makeIcon("ChevronDown", 16),

    // Workout & fitness
    dumbbell:  makeIcon("Dumbbell", 22),
    clock:     makeIcon("Timer", 16),
    sound:     makeIcon("Volume2", 16),
    coffee:    makeIcon("Coffee", 20),

    // Navigation écrans
    hist:      makeIcon("History", 20),
    lib:       makeIcon("LayoutGrid", 22),
    chartBar:  makeIcon("BarChart2", 20),
    transfer:  makeIcon("ArrowLeftRight", 20),
    brain:     makeIcon("Brain", 20),
    user:      makeIcon("User", 20),
  };
})();
