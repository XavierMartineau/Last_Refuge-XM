/* LAST REFUGE · XM — Manette Xbox (API Gamepad, disposition « standard »).
   Dans les menus, la manette envoie les mêmes touches que le clavier :
   croix / stick gauche → flèches · A → valider · B → Échap · LB / RB → Q / E · Y → R.
   En jeu, un gestionnaire « onFrame » reçoit l’état complet de la manette à chaque image. */
(() => {
  const B = { A: 0, B: 1, X: 2, Y: 3, LB: 4, RB: 5, LT: 6, RT: 7, VIEW: 8, MENU: 9, L3: 10, R3: 11, UP: 12, DOWN: 13, LEFT: 14, RIGHT: 15 };
  const NAMES = ["A", "B", "X", "Y", "LB", "RB", "LT", "RT", "View", "Menu", "L3", "R3", "↑", "↓", "←", "→"];
  // boutons au-delà de la disposition standard (Home, pavé tactile, palettes arrière, C/Z… des manettes Flydigi, etc.)
  const nameOf = (i) => NAMES[i] || "B" + i;

  /* ---------- détection du modèle de manette ---------- */
  const MODELS = {
    xbox: { label: "Manette Xbox", short: "XBOX" },
    ps: { label: "Manette PlayStation", short: "PLAYSTATION" },
    flydigi: { label: "Manette Flydigi", short: "FLYDIGI" },
    nintendo: { label: "Manette Nintendo", short: "NINTENDO" },
    generique: { label: "Manette générique", short: "MANETTE" }
  };
  function detect(id) {
    const s = String(id || "").toLowerCase();
    if (/flydigi|vendor: 2f24|2f24-|04b4/.test(s)) return "flydigi";
    if (/054c|dualsense|dualshock|playstation|ps5|ps4|wireless controller/.test(s)) return "ps";
    if (/057e|nintendo|pro controller|joy-con/.test(s)) return "nintendo";
    if (/xbox|xinput|045e|x-box/.test(s)) return "xbox";
    return "generique";
  }
  // libellés des boutons selon le modèle (les noms enregistrés restent ceux de la disposition Xbox)
  const LABELS = {
    ps: { A: "✕", B: "○", X: "□", Y: "△", LB: "L1", RB: "R1", LT: "L2", RT: "R2", View: "Create", Menu: "Options", B16: "PS", B17: "Pavé" },
    nintendo: { A: "B", B: "A", X: "Y", Y: "X", LB: "L", RB: "R", LT: "ZL", RT: "ZR", View: "−", Menu: "+", B16: "Home", B17: "Capture" },
    xbox: { B16: "Xbox" },
    flydigi: { B16: "Home", B17: "C", B18: "Z", B19: "M1", B20: "M2", B21: "M3", B22: "M4" },
    generique: {}
  };
  let current = { type: "xbox", id: "", buttons: 17 };
  const label = (name, type = current.type) => (LABELS[type] && LABELS[type][name]) || (/^B\d+$/.test(name) ? "Bouton " + name.slice(1) : name);
  function updateModel(pad) {
    const next = { type: detect(pad.id), id: pad.id, buttons: pad.buttons.length };
    if (next.type !== current.type || next.buttons !== current.buttons || next.id !== current.id) {
      current = next;
      document.documentElement.dataset.manetteType = next.type;
      dispatchEvent(new CustomEvent("lastrefuge-manette", { detail: { ...current, ...MODELS[current.type] } }));
    }
  }
  const listeners = [];
  let captureCb = null;
  let running = false, padActive = false, prev = [], last = 0;
  const repeat = {};

  function key(code, type = "keydown") {
    const keyNames = { ArrowUp: "ArrowUp", ArrowDown: "ArrowDown", ArrowLeft: "ArrowLeft", ArrowRight: "ArrowRight", Enter: "Enter", Escape: "Escape", Space: " " };
    const ev = new KeyboardEvent(type, { code, key: keyNames[code] || code.replace(/^Key/, "").toLowerCase(), bubbles: true, cancelable: true });
    (document.activeElement && document.activeElement !== document.body ? document.activeElement : window).dispatchEvent(ev);
  }
  const tap = (code) => { key(code, "keydown"); key(code, "keyup"); };

  function firstPad() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const p of pads) if (p && p.connected) return p;
    return null;
  }

  // navigation spatiale entre boutons d’une fenêtre (digicode, inventaire…)
  function spatial(dir, scope) {
    const items = [...(scope || document).querySelectorAll("button:not([disabled]),a[href],input:not([type=hidden]),select,[tabindex]:not([tabindex='-1'])")]
      .filter((el) => el.offsetParent !== null && el.getBoundingClientRect().width > 0);
    if (!items.length) return;
    const cur = document.activeElement && items.includes(document.activeElement) ? document.activeElement : null;
    if (!cur) { items[0].focus(); return; }
    const a = cur.getBoundingClientRect(), ax = a.left + a.width / 2, ay = a.top + a.height / 2;
    let best = null, bestScore = Infinity;
    for (const el of items) {
      if (el === cur) continue;
      const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, dx = x - ax, dy = y - ay;
      const ok = dir === "left" ? dx < -4 : dir === "right" ? dx > 4 : dir === "up" ? dy < -4 : dy > 4;
      if (!ok) continue;
      const main = dir === "left" || dir === "right" ? Math.abs(dx) : Math.abs(dy);
      const side = dir === "left" || dir === "right" ? Math.abs(dy) : Math.abs(dx);
      const score = main + side * 2.5;
      if (score < bestScore) { bestScore = score; best = el; }
    }
    if (best) best.focus();
  }

  function held(name, on, now, fire) {
    const r = repeat[name] || (repeat[name] = { on: false, next: 0 });
    if (on && !r.on) { r.on = true; r.next = now + 380; fire(); }
    else if (on && now >= r.next) { r.next = now + 110; fire(); }
    else if (!on) r.on = false;
  }

  function loop(now) {
    requestAnimationFrame(loop);
    const pad = firstPad();
    if (!pad) { if (padActive) setActive(false); return; }
    const dt = Math.min(.05, (now - (last || now)) / 1000);
    last = now;
    updateModel(pad);
    const btn = pad.buttons.map((b) => b.pressed || b.value > .5);
    const pressed = (i) => btn[i] && !prev[i];
    const any = btn.some(Boolean) || pad.axes.some((a) => Math.abs(a) > .4);
    if (any && !padActive) setActive(true);

    // réaffectation : le prochain bouton pressé est envoyé à la console de réglages
    if (captureCb) {
      const i = btn.findIndex((b, k) => b && !prev[k]);
      prev = btn;
      if (i >= 0) { const cb = captureCb; captureCb = null; cb(nameOf(i)); }
      return;
    }

    for (const l of listeners) {
      const menu = l.menuActive ? l.menuActive() : true;
      if (!menu && l.onFrame) { l.onFrame(pad, { pressed, btn, dt, B }); continue; }
      if (!menu) continue;
      const lx = pad.axes[0] || 0, ly = pad.axes[1] || 0;
      const dirs = { up: btn[B.UP] || ly < -.6, down: btn[B.DOWN] || ly > .6, left: btn[B.LEFT] || lx < -.6, right: btn[B.RIGHT] || lx > .6 };
      const codes = { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight" };
      for (const d of Object.keys(dirs)) held(d, dirs[d], now, () => (l.spatial && l.spatial() ? spatial(d, l.scope && l.scope()) : tap(codes[d])));
      if (pressed(B.A)) {
        const el = document.activeElement;
        if (l.spatial && l.spatial() && el && el !== document.body) el.click();
        else tap("Enter");
      }
      if (pressed(B.B)) tap("Escape");
      if (pressed(B.LB)) tap("KeyQ");
      if (pressed(B.RB)) tap("KeyE");
      if (pressed(B.Y)) tap("KeyR");
      if (pressed(B.MENU) && l.onMenu) l.onMenu();
    }
    prev = btn;
  }

  function setActive(on) {
    padActive = on;
    document.documentElement.classList.toggle("manette-active", on);
    listeners.forEach((l) => l.onPad && l.onPad(on));
  }

  addEventListener("gamepadconnected", (e) => {
    updateModel(e.gamepad);
    document.documentElement.dataset.manette = e.gamepad.id;
    listeners.forEach((l) => l.onConnect && l.onConnect(e.gamepad));
  });
  addEventListener("gamepaddisconnected", () => { delete document.documentElement.dataset.manette; setActive(false); });
  // revenir au clavier / à la souris dès qu’on s’en sert
  ["mousemove", "keydown", "pointerdown"].forEach((t) => addEventListener(t, (e) => { if (padActive && e.isTrusted) setActive(false); }, { passive: true }));

  function attach(opts) {
    listeners.push(opts);
    if (!running && "getGamepads" in navigator) { running = true; requestAnimationFrame(loop); }
    return () => listeners.splice(listeners.indexOf(opts), 1);
  }

  function vibrate(strong = .6, weak = .3, ms = 120) {
    const pad = firstPad();
    const act = pad && pad.vibrationActuator;
    if (act && act.playEffect) act.playEffect("dual-rumble", { duration: ms, strongMagnitude: strong, weakMagnitude: weak }).catch(() => {});
  }

  const capture = (cb) => { captureCb = cb; };
  const index = (name) => { const i = NAMES.indexOf(name); return i >= 0 ? i : /^B\d+$/.test(name) ? +name.slice(1) : -1; };
  const model = () => ({ ...current, ...MODELS[current.type] });

  window.LastRefugeManette = { attach, vibrate, tap, key, capture, index, label, model, detect, nameOf, NAMES, BUTTONS: B, get active() { return padActive; } };
})();
