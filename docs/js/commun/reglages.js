/* LAST REFUGE · XM — Console de réglages (page Options + menu en jeu).
   Navigation : souris, clavier (↑ ↓ choisir · ← → modifier · Q / E onglet · R rétablir · Échap retour)
   et manette (croix / stick gauche · LB / RB onglet · Y rétablir · B retour).
   Les valeurs sont enregistrées dans le navigateur (clé « lastrefuge.reglages »). */
(() => {
  const KEY = "lastrefuge.reglages";

  const ICONS = {
    affichage: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="12" rx="1"/><path d="M8 20h8M12 16v4"/></svg>',
    audio: '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg>',
    commandes: '<svg viewBox="0 0 24 24"><rect x="2" y="7" width="13" height="10" rx="1"/><path d="M5 10h1M8 10h1M11 10h1M5 13h7"/><rect x="17" y="6" width="5" height="11" rx="2.5"/><path d="M19.5 6v4"/></svg>',
    manette: '<svg viewBox="0 0 24 24"><path d="M7 7h10a5 5 0 0 1 4.9 6l-.7 3.4a2.4 2.4 0 0 1-4.2 1L15 15H9l-2 2.4a2.4 2.4 0 0 1-4.2-1L2.1 13A5 5 0 0 1 7 7z"/><path d="M7 10v4M5 12h4"/><circle cx="16" cy="11" r=".6"/><circle cx="18" cy="13" r=".6"/></svg>',
    accessibilite: '<svg viewBox="0 0 24 24"><circle cx="12" cy="4.5" r="1.8"/><path d="M5 8l7 1.5L19 8M12 9.5V14l-3 6M12 14l3 6"/></svg>',
    partie: '<svg viewBox="0 0 24 24"><path d="M5 3h9v18H5z"/><path d="M14 12h7M18 9l3 3-3 3"/><circle cx="11" cy="12" r=".8"/></svg>'
  };

  const pct = (v) => `${Math.round(v)} %`;

  /* ---------- Touches reconfigurables ----------
     kb_<action> : liste de codes clavier physiques (KeyboardEvent.code), comme CONTROLS.keys dans le jeu.
     pb_<action> : bouton de manette (nom Xbox). */
  const kb = (action, label, def) => ({ id: "kb_" + action, action, label, type: "bind", device: "kb", def, scope: "jeu",
    desc: "Touche utilisée pour « " + label.toLowerCase() + " ». Validez puis appuyez sur la nouvelle touche. Retour arrière efface, Échap annule." });
  const pb = (action, label, def) => ({ id: "pb_" + action, action, label, type: "bind", device: "pad", def, scope: "jeu",
    desc: "Bouton de manette pour « " + label.toLowerCase() + " ». Validez puis appuyez sur le nouveau bouton : tous les boutons sont acceptés, y compris les boutons supplémentaires (palettes arrière, C / Z…). B annule si vous ne choisissez pas B." });

  const KEY_NAMES = {
    Space: "Espace", Enter: "Entrée", Escape: "Échap", Backspace: "Retour", Tab: "Tab", CapsLock: "Verr. maj",
    ShiftLeft: "Maj", ShiftRight: "Maj droite", ControlLeft: "Ctrl", ControlRight: "Ctrl droit", AltLeft: "Alt", AltRight: "Alt Gr",
    MetaLeft: "Win", ArrowUp: "↑", ArrowDown: "↓", ArrowLeft: "←", ArrowRight: "→", PageUp: "Pg ↑", PageDown: "Pg ↓",
    Home: "Début", End: "Fin", Insert: "Inser", Delete: "Suppr", Backquote: "²", Minus: ")", Equal: "=", BracketLeft: "^",
    BracketRight: "$", Semicolon: "M", Quote: "ù", Backslash: "*", Comma: ";", Period: ":", Slash: "!", IntlBackslash: "<"
  };
  // la vraie disposition du clavier est utilisée quand le navigateur la fournit (sinon : nom QWERTY de la touche)
  let layout = null;
  if (navigator.keyboard && navigator.keyboard.getLayoutMap) {
    navigator.keyboard.getLayoutMap().then((m) => { layout = m; document.dispatchEvent(new Event("lastrefuge-layout")); }).catch(() => {});
  }
  function keyLabel(code) {
    if (!code) return "—";
    if (layout && layout.get(code) && /^(Key|Digit)/.test(code)) return layout.get(code).toUpperCase();
    if (KEY_NAMES[code]) return KEY_NAMES[code];
    if (/^Key/.test(code)) return code.slice(3);
    if (/^Digit/.test(code)) return code.slice(5);
    if (/^Numpad/.test(code)) return "Pavé " + code.slice(6);
    if (/^F\d+$/.test(code)) return code;
    return code;
  }
  const padLabel = (name) => (window.LastRefugeManette ? window.LastRefugeManette.label(name) : name);
  const PAD_BUTTONS = ["A", "B", "X", "Y", "LB", "RB", "LT", "RT", "View", "Menu", "L3", "R3", "↑", "↓", "←", "→"];

  /* ---------- Schéma des réglages ---------- */
  const TABS = [
    { id: "affichage", label: "Affichage", sections: [
      { title: "Affichage", rows: [
        { id: "motion", label: "Animations", type: "choice", def: "full",
          options: [["full", "Fluides"], ["reduced", "Réduites"], ["off", "Désactivées"]],
          desc: "Intensité des animations de l’interface (gyrophares, radars, transitions). La préférence « réduire les animations » du système reste prioritaire." },
        { id: "contrast", label: "Contraste renforcé", type: "choice", def: false, options: [[false, "Non"], [true, "Oui"]],
          desc: "Contours et textes plus lumineux pour une meilleure lisibilité." },
        { id: "fov", label: "Champ de vision", type: "slider", def: 68, min: 55, max: 95, step: 1, format: (v) => `${v}°`, scope: "jeu",
          desc: "Angle de vue de la caméra dans l’escape room. Plus la valeur est grande, plus on voit large, mais les objets paraissent plus petits." }
      ]},
      { title: "Graphismes", rows: [
        { id: "brightness", label: "Luminosité", type: "slider", def: 100, min: 60, max: 150, step: 5, format: pct, scope: "jeu",
          desc: "Exposition générale de la scène 3D. Augmentez-la si les couloirs du bunker sont trop sombres sur votre écran." },
        { id: "shadows", label: "Ombres", type: "choice", def: true, options: [[false, "Non"], [true, "Oui"]], scope: "jeu",
          desc: "Ombres portées en temps réel. Désactivez-les si le jeu manque de fluidité (pris en compte au prochain lancement)." },
        { id: "lowEnd", label: "Mode PC peu puissant", type: "choice", def: false, options: [[false, "Non"], [true, "Oui"]], scope: "jeu",
          desc: "Réduit fortement la résolution, le nombre de lumières et les mises à jour des caméras ; désactive ombres, halo et contour 3D. Les réglages précédents sont rétablis à la désactivation." }
      ]}
    ]},
    { id: "audio", label: "Audio", sections: [
      { title: "Volume", rows: [
        { id: "master", label: "Volume général", type: "slider", def: 100, min: 0, max: 100, step: 5, format: pct,
          desc: "Volume de tous les sons du jeu." },
        { id: "music", label: "Musique", type: "slider", def: 80, min: 0, max: 100, step: 5, format: pct,
          desc: "Volume de la musique d’ambiance générée en direct." },
        { id: "sfx", label: "Effets", type: "slider", def: 100, min: 0, max: 100, step: 5, format: pct,
          desc: "Volume des bruitages : pas, portes, tirs, infectés." }
      ]},
      { title: "Interface", rows: [
        { id: "homeMusic", label: "Ambiance des menus", type: "choice", def: true, options: [[false, "Non"], [true, "Oui"]], scope: "site",
          desc: "Ambiance sonore des menus. Si le navigateur bloque la lecture automatique, elle démarre à la première interaction." },
        { id: "sound", label: "Retours sonores", type: "choice", def: false, options: [[false, "Non"], [true, "Oui"]],
          desc: "Petits clics mécaniques lorsque vous utilisez les menus du site." }
      ]}
    ]},
    { id: "commandes", label: "Clavier & souris", sections: [
      { title: "Souris", rows: [
        { id: "mouseLook", label: "Regard à la souris", type: "choice", def: "auto", options: [["auto", "Automatique"], ["drag", "Cliquer-glisser"]], scope: "jeu",
          desc: "Automatique : la caméra suit la souris sans cliquer (le curseur est capturé, un viseur s’affiche au centre ; Échap le libère et ouvre le menu). Cliquer-glisser : comportement classique d’un point & click." },
        { id: "sensitivity", label: "Sensibilité du regard", type: "slider", def: 10, min: 1, max: 30, step: 1, format: (v) => (v / 10).toFixed(1), scope: "jeu",
          desc: "Vitesse de rotation de la caméra quand vous glissez la souris." },
        { id: "invertY", label: "Inverser l’axe vertical", type: "choice", def: false, options: [[false, "Non"], [true, "Oui"]], scope: "jeu",
          desc: "Inverse le regard haut / bas à la souris et au clavier." },
        { id: "view", label: "Vue au démarrage", type: "choice", def: "tp", options: [["tp", "3e personne"], ["fp", "1re personne"]], scope: "jeu",
          desc: "Caméra utilisée en début de partie. Touche V (ou R3 à la manette) pour changer en jeu." }
      ]},
      { title: "Déplacements", rows: [
        kb("forward", "Avancer", ["KeyW", "ArrowUp"]),
        kb("back", "Reculer", ["KeyS", "ArrowDown"]),
        kb("left", "Pas à gauche", ["KeyA"]),
        kb("right", "Pas à droite", ["KeyD"]),
        kb("turnLeft", "Tourner à gauche", ["ArrowLeft"]),
        kb("turnRight", "Tourner à droite", ["ArrowRight"]),
        kb("sprint", "Courir (maintenir)", ["ShiftLeft", "ShiftRight"]),
        kb("crouch", "S’accroupir (maintenir)", ["ControlLeft", "KeyC"])
      ]},
      { title: "Actions", rows: [
        kb("take", "Interagir / prendre", ["KeyE"]),
        kb("fire", "Tirer", ["Space"]),
        kb("reload", "Recharger", ["KeyR"]),
        kb("flashlight", "Lampe torche", ["KeyF"]),
        kb("inventory", "Inventaire", ["KeyH"]),
        kb("objectives", "Carnet de mission", ["KeyO"]),
        kb("map", "Carte", ["KeyM"]),
        kb("view", "Vue 1re / 3e personne", ["KeyV"]),
        { type: "keys", label: "Regarder / cliquer", keys: ["Souris", "Clic"] },
        { type: "keys", label: "Menu / quitter le zoom", keys: ["Échap"] }
      ]}
    ]},
    { id: "manette", label: "Manette", sections: [
      { title: "Manette détectée", rows: [
        { id: "padModel", label: "Modèle de manette", type: "choice", def: "auto",
          options: [["auto", "Automatique"], ["xboxseries", "Xbox Series X|S"], ["xboxone", "Xbox One"], ["xbox360", "Xbox 360"], ["ps5", "PS5 DualSense"], ["ps4", "PS4 DualShock 4"], ["flydigi", "Flydigi"], ["switch", "Switch Pro"], ["8bitdo", "8BitDo"], ["generique", "Générique"]],
          desc: "Choisit les symboles et le schéma affichés. En mode XInput, Windows présente beaucoup de manettes (Flydigi, 8BitDo…) comme une manette Xbox : choisissez ici votre vrai modèle si la détection automatique se trompe." }
      ]},
      { title: "Sensibilité", rows: [
        { id: "padLookX", label: "Sensibilité horizontale", type: "slider", def: 5, min: 1, max: 10, step: 1, format: (v) => String(v),
          desc: "Vitesse de rotation horizontale au stick droit." },
        { id: "padLookY", label: "Sensibilité verticale", type: "slider", def: 4, min: 1, max: 10, step: 1, format: (v) => String(v),
          desc: "Vitesse du regard haut / bas au stick droit." },
        { id: "padInvertY", label: "Inverser l’axe vertical", type: "choice", def: false, options: [[false, "Non"], [true, "Oui"]],
          desc: "Inverse le regard haut / bas au stick droit." },
        { id: "padVibration", label: "Vibrations", type: "choice", def: true, options: [[false, "Non"], [true, "Oui"]],
          desc: "Retour de force lors des tirs, des coups reçus et des portes qui s’ouvrent (si la manette le permet)." }
      ]},
      { title: "Zone morte de la manette", rows: [
        { id: "padDeadL", label: "Zone morte du stick gauche", type: "slider", def: 12, min: 0, max: 40, step: 1, format: pct,
          desc: "Inclinaison minimale du stick gauche avant que le détenu ne commence à marcher. Augmentez-la si le personnage avance tout seul." },
        { id: "padDeadR", label: "Zone morte du stick droit", type: "slider", def: 10, min: 0, max: 40, step: 1, format: pct,
          desc: "Inclinaison minimale du stick droit avant que la caméra ne tourne." },
        { id: "padTrigger", label: "Seuil des gâchettes", type: "slider", def: 35, min: 5, max: 90, step: 5, format: pct,
          desc: "Pression nécessaire sur LT / RT pour déclencher l’action. Les valeurs basses réagissent plus vite mais déclenchent plus facilement par accident." }
      ]},
      { title: "Boutons de la manette", rows: [
        pb("interact", "Interagir / prendre", "A"),
        pb("crouch", "S’accroupir (bascule)", "B"),
        pb("reload", "Recharger", "X"),
        pb("flashlight", "Lampe torche", "Y"),
        pb("fire", "Tirer (maintenir)", "RT"),
        pb("aim", "Viser (maintenir)", "LT"),
        pb("sprint", "Courir (bascule)", "L3"),
        pb("inventory", "Inventaire", "LB"),
        pb("objectives", "Carnet de mission", "RB"),
        pb("map", "Carte", "View"),
        pb("view", "Vue 1re / 3e personne", "R3"),
        { type: "keys", label: "Marcher / regarder", keys: ["LS", "RS"] },
        { type: "keys", label: "Menu (réglages)", keys: ["Menu"] },
        { type: "keys", label: "Menus : naviguer / valider / retour", keys: ["✛", "A", "B"] }
      ]}
    ]},
    { id: "accessibilite", label: "Accessibilité", sections: [
      { title: "Daltonisme", rows: [
        { id: "colorblind", label: "Mode daltonien", type: "choice", def: "non", visual: "daltonien",
          options: [["non", "Non"], ["deuteranopie", "Deutéranopie"], ["protanopie", "Protanopie"], ["tritanopie", "Tritanopie"]],
          desc: "À l’aide des planches ci-dessous, testez les différents filtres pour trouver la correction des couleurs qui vous convient le mieux. Vous devez voir un cadenas au milieu de chaque cercle. La correction s’applique à tout le site et à l’escape room." },
        { id: "cbMode", label: "Type de filtre", type: "choice", def: "correction", visual: "daltonien",
          options: [["correction", "Correction"], ["simulation", "Simulation"]],
          desc: "Correction : les couleurs difficiles à distinguer sont décalées vers des teintes que vous percevez mieux. Simulation : affiche le jeu tel qu’une personne daltonienne le voit (utile pour vérifier la lisibilité d’un écran)." },
        { id: "cbStrength", label: "Force de la correction", type: "choice", def: 10, visual: "daltonien",
          options: [[0, "0"], [1, "1"], [2, "2"], [3, "3"], [4, "4"], [5, "5"], [6, "6"], [7, "7"], [8, "8"], [9, "9"], [10, "10"]],
          desc: "À l’aide des planches ci-dessous, ajustez la puissance du filtre pour trouver la correction qui vous convient le mieux. Vous devez voir un cadenas au milieu de chaque cercle." }
      ]},
      { title: "Lisibilité", rows: [
        { id: "uiScale", label: "Taille du texte du jeu", type: "choice", def: 100, options: [[100, "Normale"], [115, "Grande"], [130, "Très grande"]], scope: "jeu",
          desc: "Agrandit les messages, l’objectif et les menus de l’escape room." },
        { id: "subtitles", label: "Messages à l’écran", type: "choice", def: "normal", options: [["court", "Courts"], ["normal", "Normaux"], ["long", "Longs"]], scope: "jeu",
          desc: "Durée d’affichage des messages et des indices en bas de l’écran." }
      ]}
    ]}
  ];

  const allRows = () => TABS.flatMap((t) => t.sections.flatMap((s) => s.rows)).filter((r) => r.id);
  const defaults = () => Object.fromEntries(allRows().map((r) => [r.id, r.def]));

  function load() {
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { saved = {}; }
    const values = { ...defaults(), ...saved };
    // préférences historiques du site (animations, son, contraste)
    if (window.afterlockPreferences) {
      const p = window.afterlockPreferences.load();
      if (!("motion" in saved)) values.motion = p.motion;
      if (!("sound" in saved)) values.sound = p.sound;
      if (!("contrast" in saved)) values.contrast = p.contrast;
    }
    return values;
  }

  function save(values) {
    try { localStorage.setItem(KEY, JSON.stringify(values)); } catch (e) { /* stockage indisponible */ }
    if (window.afterlockPreferences) window.afterlockPreferences.save({ motion: values.motion, sound: values.sound, contrast: values.contrast });
    dispatchEvent(new Event("lastrefuge-reglages"));
  }

  /* ---------- planches de test du mode daltonien (générées, mises en cache) ---------- */
  let platesUrl = null;
  function plates() {
    if (platesUrl) return platesUrl;
    const W = 600, H = 400, c = document.createElement("canvas");
    c.width = W; c.height = H;
    const x = c.getContext("2d");
    x.fillStyle = "#f4f1ea"; x.fillRect(0, 0, W, H);
    const SETS = [
      [["#f2b06b", "#e9a35a", "#f5c27e", "#eaa868"], ["#a9a9a9", "#9a9a9a", "#b5b5b5"]],
      [["#f6d3a3", "#f2c891", "#f7dcb5"], ["#c9d39a", "#bcc98a", "#d3dba7"]],
      [["#8fae5a", "#7fa04c", "#9cba66", "#86a654"], ["#e7a35c", "#dd9550", "#efb06c"]],
      [["#c8c25a", "#d6cf6a", "#b9b64e", "#e0c64f"], ["#e09a3a", "#d88a34", "#e6a84a"]],
      [["#e8a3b7", "#df93aa", "#f0b3c4", "#d887a0"], ["#4f5a4a", "#5d6858", "#46503f"]],
      [["#f2b3a3", "#eea594", "#f6c2b4"], ["#6f6b4e", "#7a7656", "#625f44"]]
    ];
    // silhouette de cadenas (anse + corps + trou de serrure)
    const lock = (cx, cy, r) => {
      const p = new Path2D();
      p.rect(cx - r * .48, cy - r * .08, r * .96, r * .7);
      const a = new Path2D();
      a.arc(cx, cy - r * .1, r * .32, Math.PI, 0);
      return { body: p, shackle: a, w: r * .13 };
    };
    let seed = 7;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    SETS.forEach(([bg, fg], k) => {
      const cx = 100 + (k % 3) * 200, cy = 100 + Math.floor(k / 3) * 200, R = 88, L = lock(cx, cy, R);
      x.lineWidth = L.w;
      for (let gy = -R; gy <= R; gy += 8) for (let gx = -R; gx <= R; gx += 8) {
        const px = cx + gx + (rnd() - .5) * 5, py = cy + gy + (rnd() - .5) * 5;
        if (Math.hypot(px - cx, py - cy) > R) continue;
        const inside = x.isPointInPath(L.body, px, py) || x.isPointInStroke(L.shackle, px, py);
        const pal = inside ? fg : bg;
        x.fillStyle = pal[Math.floor(rnd() * pal.length)];
        x.beginPath(); x.arc(px, py, 2.6 + rnd() * 1.8, 0, Math.PI * 2); x.fill();
      }
    });
    platesUrl = c.toDataURL("image/png");
    return platesUrl;
  }

  // cartes d’accès du pénitencier : référence des couleurs de niveau (bas → élevé)
  function keycards() {
    const C = [["#9a9d98", 1], ["#3fae49", 2], ["#2f6fd6", 3], ["#9b4fd0", 4], ["#e0952a", 5]];
    return `<div class="rg-cards">${C.map(([col, n]) => `
      <svg viewBox="0 0 60 60" aria-hidden="true"><rect x="2" y="2" width="56" height="56" rx="3" fill="${col}"/>
        <rect x="2" y="2" width="56" height="56" rx="3" fill="url(#rg-card-shade)"/>
        <rect x="10" y="14" width="40" height="27" rx="3" fill="#1c1c1a"/><rect x="14" y="19" width="10" height="8" rx="1" fill="#d9b44a"/>
        <path d="M14 33h28M14 37h18" stroke="#6f6b61" stroke-width="2"/><circle cx="42" cy="23" r="4" fill="${col}"/>
        <text x="54" y="54" text-anchor="end" font-size="8" fill="#fff">${"★".repeat(n)}</text></svg>`).join("")}
      <svg width="0" height="0" style="position:absolute"><defs><linearGradient id="rg-card-shade" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient></defs></svg>
    </div><div class="rg-cards__legend"><span>Accès bas</span><span>Accès élevé</span></div>`;
  }

  const consoles = new Set();
  addEventListener("keydown", (e) => { for (const f of consoles) if (f(e) === true) break; }, true);
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  /* ---------- Interface ---------- */
  function mount(host, opts = {}) {
    const context = opts.context || "site";
    const tabs = TABS.map((t) => ({ ...t })).concat(opts.extraTabs || []);
    let values = load();
    let tabIndex = Math.max(0, tabs.findIndex((t) => t.id === opts.tab));
    let rowIndex = 0;
    let padMode = false;

    const root = document.createElement("div");
    root.className = "rg rg--" + context;
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-label", "Réglages");
    root.innerHTML = `
      <header class="rg-head">
        <div class="rg-brand">
          <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 3 42 10v13c0 11-7 18-18 22C13 41 6 34 6 23V10Z"/><path class="rg-brand__bars" d="M17 15v20M24 12v26M31 15v20M12 22h24"/><circle class="rg-brand__light" cx="24" cy="7.5" r="2.2"/></svg>
          <span><b>LAST REFUGE</b><small>CONSOLE DE RÉGLAGES · XM-07</small></span>
        </div>
        <nav class="rg-tabs" role="tablist" aria-label="Catégories"></nav>
        <div class="rg-status">
          <span class="rg-chip rg-chip--input">⌨ CLAVIER · SOURIS</span>
          <span class="rg-chip rg-chip--rec"><i></i> REC <time></time></span>
        </div>
      </header>
      <div class="rg-watermark" aria-hidden="true"></div>
      <p class="rg-tabname" aria-hidden="true"></p>
      <aside class="rg-sections" aria-label="Sections"></aside>
      <div class="rg-list" tabindex="-1"></div>
      <section class="rg-info" aria-live="polite"></section>
      <footer class="rg-foot">
        <div class="rg-legend" aria-hidden="true">
          <span><kbd data-k="↑ ↓" data-p="✛">↑ ↓</kbd> Naviguer</span>
          <span><kbd data-k="← →" data-p="✛">← →</kbd> Modifier</span>
          <span><kbd data-k="Q" data-p="LB">Q</kbd><kbd data-k="E" data-p="RB">E</kbd> Catégorie</span>
        </div>
        <span class="rg-saved" aria-live="polite"></span>
        <button type="button" class="rg-btn" data-rg="reset"><kbd data-k="R" data-p="Y">R</kbd> Rétablir par défaut</button>
        <button type="button" class="rg-btn" data-rg="back"><kbd data-k="Échap" data-p="B">Échap</kbd> ${opts.backLabel || "Retour"}</button>
      </footer>`;
    host.appendChild(root);
    const $ = (s) => root.querySelector(s);

    const visibleRows = (tab) => tab.sections.flatMap((s) => s.rows).filter((r) => !(r.scope === "jeu" && context === "site" && opts.hideGameOnly));
    const indexOfValue = (row) => Math.max(0, row.options.findIndex(([v]) => v === values[row.id]));
    const valueLabel = (row) => row.type === "slider" ? (row.format ? row.format(values[row.id]) : String(values[row.id])) : (row.options[indexOfValue(row)] || [, ""])[1];

    function renderTabs() {
      $(".rg-tabs").innerHTML = tabs.map((t, i) => `
        <button type="button" role="tab" class="rg-tab" data-tab="${i}" aria-selected="${i === tabIndex}" title="${t.label}">
          <span class="rg-tab__icon" aria-hidden="true">${ICONS[t.icon || t.id] || ICONS.partie}</span><span class="rg-sr">${t.label}</span>
        </button>`).join("");
      $(".rg-tabname").innerHTML = `<span>${tabs[tabIndex].label}</span><small>${String(tabIndex + 1).padStart(2, "0")} / ${String(tabs.length).padStart(2, "0")}</small>`;
      $(".rg-watermark").textContent = tabs[tabIndex].label;
      if (padMode) setPadLabels();
    }

    /* schéma de manette Xbox : les boutons concernés par la ligne s’allument */
    const PAD_ALIAS = { L3: "LS", R3: "RS", "✛": "DPAD" };
    function padSvg(keys) {
      const PAD = window.LastRefugeManette;
      const m = PAD ? PAD.model() : { type: "xbox", base: "xbox", buttons: 17, label: "Manette Xbox" };
      const L = (n) => (PAD ? PAD.label(n, m.type) : n);
      const on = new Set((keys || []).map((k) => PAD_ALIAS[k] || k));
      const c = (id) => (on.has(id) ? "hl" : "");
      const ps = m.base === "ps";
      // sticks : décalés (Xbox, Flydigi, Nintendo) ou symétriques (PlayStation)
      const ls = ps ? [86, 104] : [66, 66], rs = ps ? [154, 104] : [150, 100], dp = ps ? [64, 66] : [94, 97];
      const face = ps
        ? `<g class="rg-pad__face"><text x="186" y="52" class="rg-pad__sym rg-pad__tri ${c("Y")}">△</text><text x="170" y="68" class="rg-pad__sym rg-pad__sq ${c("X")}">□</text><text x="202" y="68" class="rg-pad__sym rg-pad__ci ${c("B")}">○</text><text x="186" y="84" class="rg-pad__sym rg-pad__cr ${c("A")}">✕</text></g>`
        : `<circle class="rg-pad__abxy rg-pad__y ${c("Y")}" cx="186" cy="48" r="8"/><text x="186" y="51" class="rg-pad__l">${L("Y")}</text>
           <circle class="rg-pad__abxy rg-pad__x ${c("X")}" cx="170" cy="64" r="8"/><text x="170" y="67" class="rg-pad__l">${L("X")}</text>
           <circle class="rg-pad__abxy rg-pad__b ${c("B")}" cx="202" cy="64" r="8"/><text x="202" y="67" class="rg-pad__l">${L("B")}</text>
           <circle class="rg-pad__abxy rg-pad__a ${c("A")}" cx="186" cy="80" r="8"/><text x="186" y="83" class="rg-pad__l">${L("A")}</text>`;
      // boutons supplémentaires : palettes arrière et C / Z (Flydigi) ou boutons génériques
      let extra = "";
      if (m.base === "flydigi") {
        extra = `<g class="rg-pad__extra">
          <rect class="rg-pad__btn ${c("B17")}" x="160" y="30" width="12" height="8" rx="2"/><text x="166" y="27" class="${c("B17")}">C</text>
          <rect class="rg-pad__btn ${c("B18")}" x="176" y="30" width="12" height="8" rx="2"/><text x="182" y="27" class="${c("B18")}">Z</text>
          <path class="rg-pad__paddle ${c("B19")}" d="M70 142l10-12 8 4-8 12z"/><text x="64" y="156" class="${c("B19")}">M1</text>
          <path class="rg-pad__paddle ${c("B20")}" d="M92 140l6-12 8 2-4 12z"/><text x="96" y="156" class="${c("B20")}">M2</text>
          <path class="rg-pad__paddle ${c("B21")}" d="M148 140l-6-12-8 2 4 12z"/><text x="144" y="156" class="${c("B21")}">M3</text>
          <path class="rg-pad__paddle ${c("B22")}" d="M170 142l-10-12-8 4 8 12z"/><text x="176" y="156" class="${c("B22")}">M4</text></g>`;
      } else if (m.buttons > 17) {
        const n = m.buttons - 17;
        extra = `<text x="120" y="156" class="rg-pad__more">+ ${n} bouton${n > 1 ? "s" : ""} supplémentaire${n > 1 ? "s" : ""}</text>`;
      }
      const touch = ps ? `<rect class="rg-pad__btn ${c("B17")}" x="98" y="40" width="44" height="22" rx="4"/>` : "";
      return `<svg class="rg-pad rg-pad--${m.base}" viewBox="0 0 240 160" aria-hidden="true">
        <path class="rg-pad__sh ${c("LT")}" d="M40 22h38l4-12H50z"/><path class="rg-pad__sh ${c("RT")}" d="M200 22h-38l-4-12h32z"/>
        <text x="58" y="8" class="${c("LT")}">${L("LT")}</text><text x="182" y="8" class="${c("RT")}">${L("RT")}</text>
        <path class="rg-pad__sh ${c("LB")}" d="M34 34c8-8 28-12 50-10l-2 8c-20-1-36 2-44 8z"/><path class="rg-pad__sh ${c("RB")}" d="M206 34c-8-8-28-12-50-10l2 8c20-1 36 2 44 8z"/>
        <text x="20" y="34" class="${c("LB")}">${L("LB")}</text><text x="220" y="34" class="${c("RB")}">${L("RB")}</text>
        <path class="rg-pad__body" d="M60 34h120c28 0 44 22 50 58l6 30c4 20-10 34-26 30-10-3-18-14-26-28l-6-10H62l-6 10c-8 14-16 25-26 28-16 4-30-10-26-30l6-30c6-36 22-58 50-58z"/>
        ${touch}
        <circle class="rg-pad__btn ${c("LS")}" cx="${ls[0]}" cy="${ls[1]}" r="15"/><circle cx="${ls[0]}" cy="${ls[1]}" r="9" class="rg-pad__cap"/><text x="${ls[0]}" y="${ls[1] + 4}" class="rg-pad__l2 ${c("LS")}">L</text>
        <circle class="rg-pad__btn ${c("RS")}" cx="${rs[0]}" cy="${rs[1]}" r="15"/><circle cx="${rs[0]}" cy="${rs[1]}" r="9" class="rg-pad__cap"/><text x="${rs[0]}" y="${rs[1] + 4}" class="rg-pad__l2 ${c("RS")}">R</text>
        <path class="rg-pad__btn ${c("DPAD")}" d="M${dp[0] - 10} ${dp[1] - 5}h10v-10h10v10h10v10h-10v10h-10v-10h-10z"/>
        <rect class="rg-pad__btn ${c("View")}" x="${ps ? 84 : 100}" y="${ps ? 44 : 58}" width="10" height="8" rx="3"/><rect class="rg-pad__btn ${c("Menu")}" x="${ps ? 146 : 128}" y="${ps ? 44 : 58}" width="10" height="8" rx="3"/>
        ${face}
        <circle class="rg-pad__home ${c("B16")}" cx="120" cy="${ps ? 74 : 44}" r="6"/>
        ${extra}
      </svg>
      <p class="rg-pad__model">${m.label}${m.id ? "" : " (aucune manette détectée)"}</p>`;
    }

    function controlHtml(row, i) {
      if (row.type === "keys") return `<span class="rg-keys">${row.keys.map((k) => `<kbd>${k}</kbd>`).join("")}</span>`;
      if (row.type === "bind") {
        if (listening === row) return `<span class="rg-bind rg-bind--listen">${row.device === "pad" ? "Appuyez sur un bouton…" : "Appuyez sur une touche…"}</span>`;
        const v = [].concat(values[row.id] || []);
        return `<span class="rg-bind">${v.length ? v.map((c) => `<kbd class="${row.device === "pad" ? "rg-padkey rg-padkey--" + c : ""}">${row.device === "pad" ? padLabel(c) : keyLabel(c)}</kbd>`).join("") : "<em>Non assignée</em>"}<small>${row.device === "pad" ? "A" : "Entrée"} : modifier</small></span>`;
      }
      if (row.type === "action") return `<span class="rg-action${row.danger ? " rg-action--danger" : ""}">${row.button || "Ouvrir"}</span>`;
      if (row.type === "slider") {
        const v = values[row.id], p = ((v - row.min) / (row.max - row.min)) * 100;
        return `<span class="rg-slider" data-slider="${i}" style="--p:${p}%"><span class="rg-slider__fill"></span><b>${valueLabel(row)}</b></span>`;
      }
      const cur = indexOfValue(row);
      return `<span class="rg-choice"><button type="button" class="rg-arrow" data-step="-1" data-row="${i}" tabindex="-1" aria-label="Précédent">‹</button><b>${valueLabel(row)}</b><button type="button" class="rg-arrow" data-step="1" data-row="${i}" tabindex="-1" aria-label="Suivant">›</button>
        <span class="rg-segs">${row.options.map((_, k) => `<i class="${k === cur ? "on" : ""}"></i>`).join("")}</span></span>`;
    }

    function renderList() {
      const tab = tabs[tabIndex];
      let i = 0, html = "", nav = "";
      tab.sections.forEach((sec, s) => {
        const n = sec.rows.length;
        html += `<h3 class="rg-sec" id="rg-sec-${s}"><span>${sec.title}</span><small>${String(n).padStart(2, "0")} ${n > 1 ? "ÉLÉMENTS" : "ÉLÉMENT"}</small></h3>`;
        nav += `<button type="button" class="rg-dot" data-sec="${s}" aria-label="${sec.title}"><i></i><span>${sec.title}</span></button>`;
        sec.rows.forEach((row) => {
          const ro = row.type === "keys";
          const changed = row.id && !same(values[row.id], row.def);
          html += `<div class="rg-row${ro ? " rg-row--ro" : ""}${row.disabled ? " rg-row--off" : ""}${changed ? " rg-row--changed" : ""}" data-i="${i}" data-sec="${s}" tabindex="-1" role="${ro ? "listitem" : "group"}" aria-label="${row.label}">
            <span class="rg-num">${String(i + 1).padStart(2, "0")}</span><span class="rg-label">${row.label}${row.scope === "jeu" ? '<em title="S’applique dans l’escape room">JEU</em>' : ""}</span><span class="rg-ctrl">${controlHtml(row, i)}</span></div>`;
          i++;
        });
      });
      $(".rg-list").innerHTML = html;
      $(".rg-sections").innerHTML = nav;
      rowIndex = Math.min(rowIndex, i - 1);
      focusRow(rowIndex, false);
    }

    const rowsOfTab = () => tabs[tabIndex].sections.flatMap((s) => s.rows);

    function renderInfo() {
      const row = rowsOfTab()[rowIndex];
      if (!row) { $(".rg-info").innerHTML = ""; return; }
      let extra = "";
      if (row.type === "choice") {
        const cur = indexOfValue(row);
        extra = `<ul class="rg-opts">${row.options.map(([, l], k) => `<li class="${k === cur ? "on" : ""}">${l}</li>`).join("")}</ul>`;
      } else if (row.type === "slider") {
        extra = `<p class="rg-range">Minimum ${row.format ? row.format(row.min) : row.min} · Maximum ${row.format ? row.format(row.max) : row.max} · Par défaut ${row.format ? row.format(row.def) : row.def}</p>`;
      } else if (row.type === "bind") {
        const d = [].concat(row.def);
        extra = `<p class="rg-range">Par défaut : ${d.map((c) => `<kbd>${row.device === "pad" ? padLabel(c) : keyLabel(c)}</kbd>`).join(" ")}</p>`;
      } else if (row.type === "keys") {
        extra = `<p class="rg-range">${row.keys.map((k) => `<kbd>${k}</kbd>`).join(" ")}</p>`;
      }
      const scope = row.scope === "jeu" ? `<p class="rg-scope">● S’applique dans l’escape room.</p>` : "";
      const tab = tabs[tabIndex];
      const code = `RGL-${tab.id.slice(0, 3).toUpperCase()}-${String(rowIndex + 1).padStart(2, "0")}`;
      const visual = row.visual === "daltonien"
        ? `<img class="rg-plates" src="${plates()}" alt="Six planches de test à pastilles : un cadenas apparaît au centre de chaque cercle."> ${keycards()}`
        : tab.id === "manette"
        ? padSvg(row.type === "keys" ? row.keys : row.type === "bind" ? [values[row.id]] : ({ padLookX: ["RS"], padLookY: ["RS"], padInvertY: ["RS"], padDeadL: ["LS"], padDeadR: ["RS"], padTrigger: ["LT", "RT"], padVibration: [], padModel: [] })[row.id])
        : `<div class="rg-emblem">${ICONS[tab.icon || tab.id] || ICONS.partie}</div>`;
      const state = row.id ? (same(values[row.id], row.def) ? "<span class='rg-tag'>PAR DÉFAUT</span>" : "<span class='rg-tag rg-tag--mod'>MODIFIÉ</span>") : "";
      $(".rg-info").innerHTML = `
        <div class="rg-info__top"><span>${code}</span>${state}</div>
        <div class="rg-info__visual">${visual}</div>
        <h4>${row.label}</h4><p>${row.desc || (row.type === "keys" ? "Commande du jeu. Les touches clavier ne sont pas encore personnalisables." : row.type === "action" ? "Action immédiate sur la partie en cours." : "")}</p>${extra}${scope}`;
    }

    function focusRow(i, scroll = true) {
      const rows = root.querySelectorAll(".rg-row");
      if (!rows.length) return;
      rowIndex = (i + rows.length) % rows.length;
      rows.forEach((r) => r.classList.toggle("is-focus", +r.dataset.i === rowIndex));
      const el = rows[rowIndex];
      if (scroll) el.scrollIntoView({ block: "nearest" });
      root.querySelectorAll(".rg-dot").forEach((d) => d.classList.toggle("on", d.dataset.sec === el.dataset.sec));
      renderInfo();
    }

    let savedTimer;
    function setValue(row, value) {
      if (row.disabled) return;
      values = { ...values, [row.id]: value };
      save(values);
      renderList();
      if (opts.onChange) opts.onChange(row.id, value, values);
      if (row.id === "padModel") dispatchEvent(new CustomEvent("lastrefuge-padmodel", { detail: value }));
      flashSaved();
    }
    function flashSaved() {
      const s = $(".rg-saved");
      s.textContent = "✔ Enregistré";
      clearTimeout(savedTimer);
      savedTimer = setTimeout(() => { s.textContent = ""; }, 1400);
    }

    function step(dir) {
      const row = rowsOfTab()[rowIndex];
      if (!row || row.disabled) return;
      if (row.type === "choice") {
        const n = row.options.length, k = (indexOfValue(row) + dir + n) % n;
        setValue(row, row.options[k][0]);
      } else if (row.type === "slider") {
        const v = Math.min(row.max, Math.max(row.min, values[row.id] + dir * row.step));
        if (v !== values[row.id]) setValue(row, v);
      }
    }

    function activate() {
      const row = rowsOfTab()[rowIndex];
      if (!row || row.disabled) return;
      if (row.type === "bind") listen(row);
      else if (row.type === "action" && row.run) row.run();
      else if (row.type === "choice") step(1);
    }

    /* ---------- réaffectation des touches ---------- */
    let listening = null;
    function listen(row) {
      listening = row;
      renderList();
      if (row.device === "pad" && window.LastRefugeManette) {
        window.LastRefugeManette.capture((name) => {
          if (listening !== row) return;
          if (name === "B" && row.def !== "B" && values[row.id] !== "B") { stopListen(); return; }
          assignPad(row, name);
        });
      }
    }
    function stopListen() {
      listening = null;
      if (window.LastRefugeManette) window.LastRefugeManette.capture(null);
      renderList();
    }
    function bindRows(device) { return TABS.flatMap((t) => t.sections.flatMap((s) => s.rows)).filter((r) => r.type === "bind" && r.device === device); }
    function assignKey(row, code) {
      const next = { ...values };
      // une touche ne sert qu’à une action : on la retire des autres
      for (const r of bindRows("kb")) if (r !== row) next[r.id] = [].concat(next[r.id] || []).filter((c) => c !== code);
      next[row.id] = [code];
      commitBinds(next, bindRows("kb"));
    }
    function assignPad(row, name) {
      const next = { ...values }, old = next[row.id];
      // le bouton déjà utilisé ailleurs prend l’ancien bouton de cette action (échange)
      for (const r of bindRows("pad")) if (r !== row && next[r.id] === name) next[r.id] = old;
      next[row.id] = name;
      commitBinds(next, bindRows("pad"));
    }
    function commitBinds(next, rows) {
      values = next;
      save(values);
      listening = null;
      if (window.LastRefugeManette) window.LastRefugeManette.capture(null);
      renderList();
      rows.forEach((r) => opts.onChange && opts.onChange(r.id, values[r.id], values));
      flashSaved();
    }

    function setTab(i) {
      tabIndex = (i + tabs.length) % tabs.length;
      rowIndex = 0;
      renderTabs();
      renderList();
      $(".rg-list").scrollTop = 0;
    }

    function reset() {
      const ids = rowsOfTab().filter((r) => r.id).map((r) => r.id);
      const d = defaults();
      values = { ...values };
      ids.forEach((id) => { values[id] = Array.isArray(d[id]) ? d[id].slice() : d[id]; });
      save(values);
      renderList();
      ids.forEach((id) => opts.onChange && opts.onChange(id, values[id], values));
    }

    function back() { if (opts.onBack) opts.onBack(); }

    /* souris */
    root.addEventListener("click", (e) => {
      const t = e.target.closest("[data-tab],[data-step],[data-sec],[data-rg],.rg-row");
      if (!t) return;
      if (t.dataset.tab !== undefined) setTab(+t.dataset.tab);
      else if (t.dataset.step !== undefined) { focusRow(+t.dataset.row, false); step(+t.dataset.step); }
      else if (t.classList.contains("rg-dot")) {
        const first = root.querySelector(`.rg-row[data-sec="${t.dataset.sec}"]`);
        root.querySelector("#rg-sec-" + t.dataset.sec).scrollIntoView({ block: "start", behavior: "smooth" });
        if (first) focusRow(+first.dataset.i, false);
      } else if (t.dataset.rg === "reset") reset();
      else if (t.dataset.rg === "back") back();
      else if (t.classList.contains("rg-row")) {
        const i = +t.dataset.i;
        const slider = e.target.closest("[data-slider]");
        const row = rowsOfTab()[i];
        focusRow(i, false);
        if (slider && row.type === "slider") {
          const r = slider.getBoundingClientRect(), k = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
          setValue(row, Math.round((row.min + k * (row.max - row.min)) / row.step) * row.step);
        } else if (row.type === "action" || row.type === "bind") activate();
      }
    });
    root.addEventListener("mouseover", (e) => {
      const r = e.target.closest(".rg-row");
      if (r && +r.dataset.i !== rowIndex) focusRow(+r.dataset.i, false);
    });
    // glisser sur une barre
    let dragRow = null;
    root.addEventListener("pointerdown", (e) => {
      const s = e.target.closest("[data-slider]");
      if (s && e.button === 0) {
        e.preventDefault();
        dragRow = s;
      }
    });
    addEventListener("pointerup", () => { dragRow = null; });
    addEventListener("pointercancel", () => { dragRow = null; });
    root.addEventListener("pointermove", (e) => {
      if (!dragRow || !(e.buttons & 1)) return;
      const i = +dragRow.dataset.slider, row = rowsOfTab()[i];
      const r = dragRow.getBoundingClientRect(), k = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      const v = Math.round((row.min + k * (row.max - row.min)) / row.step) * row.step;
      if (v !== values[row.id]) { setValue(row, v); dragRow = root.querySelector(`[data-slider="${i}"]`); }
    });

    /* clavier (et manette, qui envoie les mêmes touches) */
    function onKey(e) {
      if (!root.isConnected || !isOpen()) return;
      const k = e.code;
      if (listening) {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (listening.device === "pad") { if (k === "Escape") stopListen(); return true; }
        if (k === "Escape") stopListen();
        else if (k === "Backspace" || k === "Delete") commitBinds({ ...values, [listening.id]: [] }, [listening]);
        else assignKey(listening, k);
        return true;
      }
      const map = { ArrowUp: () => focusRow(rowIndex - 1), ArrowDown: () => focusRow(rowIndex + 1),
        ArrowLeft: () => step(-1), ArrowRight: () => step(1), KeyQ: () => setTab(tabIndex - 1), KeyE: () => setTab(tabIndex + 1),
        KeyR: reset, Enter: activate, NumpadEnter: activate };
      if (k === "Escape" && opts.handleEscape !== false) { e.preventDefault(); back(); return; }
      if (map[k] && !(e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName))) {
        e.preventDefault();
        e.stopImmediatePropagation();
        map[k]();
        return true;
      }
    }
    consoles.add(onKey);
    document.addEventListener("lastrefuge-layout", () => renderList());
    const isOpen = () => opts.isOpen ? opts.isOpen() : true;

    function setPadLabels() {
      root.querySelectorAll("kbd[data-p]").forEach((k) => { k.textContent = padMode ? padLabel(k.dataset.p) : k.dataset.k; });
      const m = window.LastRefugeManette ? window.LastRefugeManette.model() : null;
      $(".rg-chip--input").textContent = padMode ? "🎮 " + (m ? m.label.toUpperCase() : "MANETTE") : "⌨ CLAVIER · SOURIS";
    }
    // nouveau modèle de manette détecté : symboles et schéma mis à jour
    addEventListener("lastrefuge-manette", (e) => {
      root.dataset.pad = e.detail.base || e.detail.type;
      setPadLabels();
      renderList();
    });

    function setPad(on) {
      if (on === padMode) return;
      padMode = on;
      root.classList.toggle("rg--pad", on);
      setPadLabels();
    }

    // horloge de la console
    const clock = () => { const d = new Date(); root.querySelector(".rg-chip--rec time").textContent = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }); };
    clock();
    setInterval(clock, 20000);

    renderTabs();
    renderList();
    return { root, setTab: (id) => setTab(Math.max(0, tabs.findIndex((t) => t.id === id))), values: () => values, setPad, refresh: () => { values = load(); renderList(); } };
  }

  // libellé d’une action pour les indices à l’écran (ex. « [E] Prendre »)
  function actionKey(action) {
    const v = load()["kb_" + action];
    return keyLabel([].concat(v || [])[0]);
  }

  window.LastRefugeReglages = { mount, load, save, defaults, TABS, keyLabel, actionKey };
})();
