/* LAST REFUGE · XM — Escape room « Sas 07 » · Visionneuse 3D des objets de l’inventaire.
   Fichier chargé dans l’ordre par escape-room.js : il partage la portée globale des autres fichiers. */
'use strict';
/* ═══════════════ VISIONNEUSE 3D DES OBJETS DE L’INVENTAIRE ═══════════════
   Cliquez un objet dans l’inventaire (touche H) : il s’affiche en 3D, on le fait tourner à 360° en glissant (souris ou doigt),
   molette = zoom, bouton ✕ / Échap = fermer. Les modèles sont construits avec des formes simples (fonction modelFor). */
const ITEM3D = (function () {
  const css = document.createElement('style');
  css.textContent = `
  #iv{position:fixed;inset:0;z-index:70;display:none;place-items:center;background:#000c}#iv.on{display:grid}
  #iv .ivb{width:min(560px,94vw);background:linear-gradient(180deg,#1b1d19,#0a0b09);border:2px solid #3a3326;box-shadow:0 14px 50px #000d;color:var(--bone);font-family:var(--stencil);position:relative}
  #iv .ivb::before{content:'';position:absolute;left:0;right:0;top:0;height:8px;background:var(--hazard)}
  #iv header{display:flex;justify-content:space-between;align-items:center;padding:16px 16px 6px}#iv h3{margin:0;font-size:20px;letter-spacing:.14em;text-transform:uppercase}
  #iv canvas{display:block;width:100%;aspect-ratio:4/3;background:radial-gradient(ellipse at center,#2a2c26,#0a0b09);cursor:grab;touch-action:none}#iv canvas:active{cursor:grabbing}
  #iv p{margin:0;padding:10px 16px 4px;font:400 14px 'Special Elite',monospace;color:#b8bba6}#iv small{display:block;padding:0 16px 12px;color:#8d907f;font:400 12px monospace}
  #iv button{font:700 16px var(--stencil);color:var(--bone);background:linear-gradient(180deg,#2b2d28,#171814);border:1px solid #4a4536;padding:6px 14px}#iv button:hover{border-color:var(--bloodb)}`;
  (document.head || document.body).appendChild(css);
  const root = document.createElement('div');
  root.id = 'iv';
  root.innerHTML =
    '<div class="ivb"><header><h3 id="ivt"></h3><button id="ivx" aria-label="Fermer">✕ Fermer</button></header><canvas id="ivc" width="640" height="480"></canvas><p id="ivd"></p><small>Glissez pour faire tourner l’objet dans tous les sens · molette : zoom · Échap : fermer</small></div>';
  document.body.appendChild(root);
  ['pointerdown', 'mousedown', 'touchstart', 'wheel', 'keydown'].forEach((ev) =>
    root.addEventListener(ev, (x) => x.stopPropagation(), { passive: true })
  );
  let R = null,
    sc,
    cam,
    pivot,
    cur = null,
    open = false,
    yaw = 0.6,
    pitch = 0.25,
    vy = 0,
    vp = 0,
    zoom = 1,
    drag = null,
    raf = 0;
  const M = (c, m = 0.2, r = 0.5) => new THREE.MeshStandardMaterial({ color: c, metalness: m, roughness: r });
  const steel = () => M(0x9a9da0, 0.9, 0.3),
    dark = () => M(0x24272a, 0.5, 0.5),
    rubber = () => M(0x111213, 0.1, 0.8),
    red = () => M(0xb01818, 0.3, 0.5);
  const bx = (w, h, d, m, x = 0, y = 0, z = 0, p) => {
    const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    o.position.set(x, y, z);
    (p || pivot).add(o);
    return o;
  };
  const cy = (rt, rb, h, m, x = 0, y = 0, z = 0, p, seg = 20) => {
    const o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m);
    o.position.set(x, y, z);
    (p || pivot).add(o);
    return o;
  };
  const tor = (R2, r, m, x = 0, y = 0, z = 0, p, seg = 24) => {
    const o = new THREE.Mesh(new THREE.TorusGeometry(R2, r, 12, seg), m);
    o.position.set(x, y, z);
    (p || pivot).add(o);
    return o;
  };
  const tex = (w, h, fn) => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    fn(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };
  /* ── Modèles 3D simples, un par type d’objet (tout est centré autour de l’origine) ── */
  const MODELS = {
    key() {
      const g = new THREE.Group(),
        m = M(0xc9a24a, 0.9, 0.3);
      tor(0.28, 0.07, m, -0.55, 0, 0, g);
      cy(0.05, 0.05, 1.1, m, 0.15, 0, 0, g).rotation.z = Math.PI / 2;
      [0.45, 0.62, 0.78].forEach((x, i) => bx(0.09, 0.22 - i * 0.04, 0.06, m, x, -0.13, 0, g));
      return g;
    },
    card() {
      const g = new THREE.Group();
      bx(1.1, 0.7, 0.03, M(0xdedbd0, 0.1, 0.6), 0, 0, 0, g);
      bx(1.1, 0.12, 0.035, M(0x222222, 0.3, 0.5), 0, 0.2, 0, g);
      bx(0.3, 0.34, 0.036, M(0x7a8a9a, 0.2, 0.6), -0.3, -0.1, 0, g);
      bx(0.5, 0.05, 0.036, M(0x555555), 0.25, -0.05, 0, g);
      bx(0.4, 0.05, 0.036, M(0x555555), 0.2, -0.18, 0, g);
      bx(0.22, 0.14, 0.036, M(0xc4281c), 0.38, 0.2, 0, g);
      return g;
    },
    fuse() {
      const g = new THREE.Group(),
        gl = new THREE.MeshStandardMaterial({
          color: 0xffe9a0,
          transparent: true,
          opacity: 0.7,
          roughness: 0.15
        });
      cy(0.15, 0.15, 0.8, gl, 0, 0, 0, g).rotation.z = Math.PI / 2;
      [-0.45, 0.45].forEach((x) => (cy(0.17, 0.17, 0.18, steel(), x, 0, 0, g).rotation.z = Math.PI / 2));
      cy(0.015, 0.015, 0.7, M(0x998866, 0.5, 0.4), 0, 0, 0, g).rotation.z = Math.PI / 2;
      return g;
    },
    battery() {
      const g = new THREE.Group();
      bx(1.1, 0.7, 0.6, M(0x1c3a52, 0.3, 0.5), 0, 0, 0, g);
      bx(1.12, 0.08, 0.62, dark(), 0, 0.3, 0, g);
      [-0.3, 0.3].forEach((x, i) => cy(0.07, 0.07, 0.12, i ? red() : steel(), x, 0.45, 0.1, g));
      bx(0.6, 0.2, 0.01, M(0xe6e0c8), 0, 0, 0.31, g);
      return g;
    },
    jerry() {
      const g = new THREE.Group();
      bx(0.9, 1.0, 0.4, red(), 0, 0, 0, g);
      bx(0.5, 0.12, 0.3, red(), -0.1, 0.56, 0, g);
      cy(0.09, 0.09, 0.12, dark(), 0.25, 0.58, 0, g);
      const h = tor(0.16, 0.04, dark(), -0.15, 0.68, 0, g);
      bx(0.6, 0.25, 0.01, M(0xe6e0c8), 0, -0.1, 0.21, g);
      return g;
    },
    pliers() {
      const g = new THREE.Group(),
        m = M(0xb02020, 0.4, 0.5);
      [1, -1].forEach((s) => {
        const h = bx(0.12, 0.9, 0.1, m, s * 0.12, -0.4, 0, g);
        h.rotation.z = -s * 0.12;
        const j = bx(0.14, 0.5, 0.08, steel(), -s * 0.05, 0.25, 0, g);
        j.rotation.z = s * 0.1;
      });
      cy(0.07, 0.07, 0.14, steel(), 0, 0, 0, g).rotation.x = Math.PI / 2;
      return g;
    },
    screwdriver() {
      const g = new THREE.Group();
      cy(0.13, 0.11, 0.7, M(0xe0a020, 0.1, 0.6), 0, -0.35, 0, g);
      cy(0.04, 0.04, 0.9, steel(), 0, 0.45, 0, g);
      cy(0.045, 0.03, 0.12, dark(), 0, 0.92, 0, g);
      return g;
    },
    drill() {
      const g = new THREE.Group(),
        m = M(0xd4a017, 0.3, 0.5);
      bx(0.9, 0.38, 0.34, m, 0, 0.35, 0, g);
      const h = bx(0.28, 0.7, 0.3, dark(), -0.1, -0.15, 0, g);
      h.rotation.z = 0.15;
      bx(0.5, 0.2, 0.4, dark(), -0.15, -0.55, 0, g);
      cy(0.14, 0.14, 0.25, steel(), 0.58, 0.35, 0, g).rotation.z = Math.PI / 2;
      cy(0.025, 0.025, 0.4, steel(), 0.85, 0.35, 0, g).rotation.z = Math.PI / 2;
      return g;
    },
    cable() {
      const g = new THREE.Group(),
        r = rubber();
      for (let i = 0; i < 5; i++)
        tor(0.5 - i * 0.02, 0.045, r, 0, i * 0.09 - 0.18, 0, g, 32).rotation.x = Math.PI / 2;
      bx(0.22, 0.12, 0.1, red(), 0.58, 0.2, 0, g);
      bx(0.22, 0.12, 0.1, steel(), -0.58, -0.15, 0, g);
      return g;
    },
    crowbar() {
      const g = new THREE.Group(),
        m = M(0x3a3d40, 0.9, 0.4);
      cy(0.05, 0.05, 1.5, m, 0, 0, 0, g).rotation.z = Math.PI / 2;
      const c = bx(0.45, 0.08, 0.08, m, 0.82, 0.17, 0, g);
      c.rotation.z = 0.9;
      const c2 = bx(0.3, 0.08, 0.08, m, -0.78, -0.1, 0, g);
      c2.rotation.z = -0.5;
      return g;
    },
    note() {
      const g = new THREE.Group(),
        t = tex(256, 320, (c, w, h) => {
          c.fillStyle = '#e6dfc4';
          c.fillRect(0, 0, w, h);
          c.fillStyle = '#4a3a2a';
          c.font = 'italic 22px Georgia';
          ['Un chiffre a été', 'noyé dans le sang.', 'Il ne reste que 1 9', 'pour faire le code.'].forEach(
            (l, i) => c.fillText(l, 20, 60 + i * 40)
          );
          c.fillStyle = '#7a1a14';
          c.beginPath();
          c.arc(170, 230, 40, 0, 6.3);
          c.fill();
        });
      bx(0.8, 1.0, 0.015, new THREE.MeshStandardMaterial({ map: t, roughness: 0.9 }), 0, 0, 0, g);
      return g;
    },
    book() {
      const g = new THREE.Group();
      bx(0.9, 1.2, 0.18, M(0x3a4a2c, 0.1, 0.8), 0, 0, 0, g);
      bx(0.82, 1.12, 0.15, M(0xd8d0b0, 0, 0.9), 0.03, 0, 0.005, g);
      bx(0.06, 1.2, 0.2, M(0x2a3320, 0.1, 0.8), -0.43, 0, 0, g);
      bx(0.5, 0.3, 0.01, M(0xc9a24a, 0.6, 0.4), 0.05, 0.2, 0.095, g);
      return g;
    },
    vest() {
      const g = new THREE.Group();
      bx(1, 1.1, 0.3, M(0x3a4030, 0.1, 0.8), 0, 0, 0, g);
      bx(0.3, 0.4, 0.34, dark(), -0.25, -0.1, 0, g);
      bx(0.3, 0.4, 0.34, dark(), 0.25, -0.1, 0, g);
      bx(0.9, 0.1, 0.34, M(0x555a48), 0, 0.4, 0, g);
      return g;
    },
    crate() {
      const g = new THREE.Group();
      bx(0.9, 0.7, 0.7, M(0x6b5a37, 0.05, 0.9), 0, 0, 0, g);
      bx(0.95, 0.08, 0.75, M(0x4a3d24, 0.05, 0.9), 0, 0.3, 0, g);
      bx(0.95, 0.08, 0.75, M(0x4a3d24, 0.05, 0.9), 0, -0.3, 0, g);
      return g;
    }
  };
  function modelFor(n) {
    const s = n.toLowerCase();
    return s.startsWith('clé') || s.startsWith('cle')
      ? 'key'
      : /carte|badge/.test(s)
        ? 'card'
        : s.startsWith('fusible')
          ? 'fuse'
          : s.startsWith('batterie')
            ? 'battery'
            : /bidon|essence/.test(s)
              ? 'jerry'
              : /pince/.test(s)
                ? 'pliers'
                : /tournevis/.test(s)
                  ? 'screwdriver'
                  : /perceuse/.test(s)
                    ? 'drill'
                    : /câble|cable/.test(s)
                      ? 'cable'
                      : /pied-de-biche/.test(s)
                        ? 'crowbar'
                        : /note/.test(s)
                          ? 'note'
                          : /carnet/.test(s)
                            ? 'book'
                            : /équipement/.test(s)
                              ? 'vest'
                              : 'crate';
  }
  function init() {
    const c = document.getElementById('ivc');
    R = new THREE.WebGLRenderer({ canvas: c, antialias: true, alpha: true });
    R.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    R.toneMapping = THREE.ACESFilmicToneMapping;
    sc = new THREE.Scene();
    cam = new THREE.PerspectiveCamera(40, 4 / 3, 0.1, 50);
    cam.position.set(0, 0, 3.4);
    sc.add(new THREE.HemisphereLight(0xcfd8ff, 0x403020, 1.1));
    const d = new THREE.DirectionalLight(0xfff0d8, 2.4);
    d.position.set(2, 3, 3);
    sc.add(d);
    const d2 = new THREE.DirectionalLight(0x88aaff, 0.8);
    d2.position.set(-3, -1, -2);
    sc.add(d2);
    pivot = new THREE.Group();
    sc.add(pivot);
    c.addEventListener('pointerdown', (e) => {
      drag = { x: e.clientX, y: e.clientY };
      vy = vp = 0;
      c.setPointerCapture(e.pointerId);
    });
    c.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x,
        dy = e.clientY - drag.y;
      drag = { x: e.clientX, y: e.clientY };
      yaw += dx * 0.012;
      pitch += dy * 0.012;
      vy = dx * 0.012;
      vp = dy * 0.012;
    });
    ['pointerup', 'pointercancel'].forEach((ev) =>
      c.addEventListener(ev, () => {
        drag = null;
      })
    );
    c.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        zoom = Math.max(0.5, Math.min(2.2, zoom * (e.deltaY > 0 ? 0.92 : 1.08)));
      },
      { passive: false }
    );
  }
  function loop() {
    if (!open) return;
    raf = requestAnimationFrame(loop);
    if (!drag) {
      yaw += vy;
      pitch += vp;
      vy *= 0.94;
      vp *= 0.94;
      if (Math.abs(vy) < 0.0008 && Math.abs(vp) < 0.0008) yaw += 0.006;
    } // inertie puis rotation lente automatique
    pivot.rotation.set(pitch, yaw, 0, 'XYZ');
    cam.position.z = 3.4 / zoom;
    const c = R.domElement,
      w = c.clientWidth,
      h = c.clientHeight;
    if (c.width !== Math.round(w * R.getPixelRatio())) {
      R.setSize(w, h, false);
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
    }
    R.render(sc, cam);
  }
  function show(name, desc) {
    if (!R) init();
    if (cur) {
      pivot.remove(cur);
      cur = null;
    }
    const g = MODELS[modelFor(name)]();
    cur = new THREE.Group();
    pivot.add(cur);
    // le modèle est construit dans pivot (via bx/cy) ou renvoyé en groupe : on l’ajoute puis on le recentre
    cur.add(g);
    const b = new THREE.Box3().setFromObject(g),
      c = b.getCenter(new THREE.Vector3()),
      s = 1.7 / Math.max(...b.getSize(new THREE.Vector3()).toArray());
    g.position.sub(c);
    cur.scale.setScalar(s);
    yaw = 0.6;
    pitch = 0.25;
    vy = vp = 0;
    zoom = 1;
    document.getElementById('ivt').textContent = name;
    document.getElementById('ivd').textContent = desc || '';
    open = true;
    root.classList.add('on');
    loop();
  }
  function close() {
    if (!open) return;
    open = false;
    root.classList.remove('on');
    cancelAnimationFrame(raf);
    SND.play('click');
  }
  document.getElementById('ivx').addEventListener('click', close);
  root.addEventListener('click', (e) => {
    if (e.target === root) close();
  });
  addEventListener(
    'keydown',
    (e) => {
      if (open && e.code === 'Escape') {
        e.stopImmediatePropagation();
        close();
      }
    },
    true
  );
  // clic sur une carte de l’inventaire (touche H) → vue 3D (le carnet de mission garde son ouverture dédiée)
  const ifg = document.getElementById('ifg');
  if (ifg)
    ifg.addEventListener('click', (e) => {
      const c = e.target.closest('.card');
      if (!c) return;
      const n = c.querySelector('.n'),
        d = c.querySelector('.d');
      if (!n) return;
      const name = n.textContent;
      if (/Carnet de mission/.test(name)) return;
      show(name, d ? d.textContent : '');
    });
  return { show, close };
})();
