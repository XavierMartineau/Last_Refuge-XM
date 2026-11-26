/* LAST REFUGE · XM — Escape room « Sas 07 » · Poste de surveillance (caméras) et carte.
   Fichier chargé dans l’ordre par escape-room.js : il partage la portée globale des autres fichiers. */
'use strict';
/* ═══════════════ POSTE DE SURVEILLANCE (poste de contrôle de la mezzanine, salle 11, fermé à clé) + CARTE (touche M) ═══════════════
   • 6 écrans : 5 caméras (rendues en direct dans des textures basse résolution) + 1 écran « PLAN » (carte avec votre position).
   • Cliquez un écran pour entrer en mode caméra : la caméra mobile SUIT LA SOURIS, 1-6 changent d’écran.
   • Le code de l’armoire à munitions est peint sur UN seul mur (cellule est n°2) : il n’est affiché QUE dans l’image de la caméra n°2.
   Tout est réglable dans CCTV_CFG ci-dessous. */
const CCTV = (function () {
  const CCTV_CFG = {
    // pos = position de la caméra · yaw = direction de base (0 = vers -z, -π/2 = vers l’est) · range = amplitude de rotation (rad) si mobile
    cams: [
      { name: 'CELLULES · COULOIR', pos: [0, 4.5, -224.5], yaw: 0, tilt: -0.12, pan: false },
      {
        name: 'CELLULES · MOBILE',
        pos: [0, 4.5, -245.5],
        yaw: 0,
        tilt: -0.1,
        pan: true,
        range: 1.9,
        reveal: true
      },
      { name: 'HANGAR · MOBILE', pos: [0, 4.6, -34], yaw: 0, tilt: -0.12, pan: true, range: 1.3 },
      { name: 'ENTREPÔT', pos: [0, 9, -104], yaw: 0, tilt: -0.25, pan: false },
      { name: 'SAS D’ENTRÉE', pos: [0, 2.9, -3.4], yaw: Math.PI, tilt: -0.08, pan: false }
    ],
    wall: { x: -50.2, z: -304, y: PLAT.y + 1.9 }, // centre du mur d’écrans (mur est du poste de contrôle)
    camRes: [320, 180],
    mainRes: [640, 360], // résolution des textures de caméra
    codeWall: { x: 14.82, y: 1.7, z: -245.5 }
  }; // où est peint le code (cellule est n°2)
  const NAMES = [
    'Sas d’entrée',
    'Salle de contrôle',
    'Dortoir / chambre forte',
    'Distribution électrique',
    'Hangar principal',
    'Hangar sud',
    'Entrepôt (silo)',
    'Commandement',
    'Quartiers',
    'Blocs cellulaires',
    'Ligne de coupure',
    'Zone d’évacuation'
  ];
  const HW = {
    1: 13.9,
    2: 11.9,
    3: 17.9,
    4: 17.9,
    5: 59.9,
    6: 59.9,
    7: 44.9,
    8: 74.9,
    9: 74.9,
    10: 44.9,
    11: 59.9,
    12: 74.9
  };
  const ZR = {
    1: [23.4, -4],
    2: [-4, -12],
    3: [-12, -22],
    4: [-22, -32],
    5: [-32, -72],
    6: [-72, -102],
    7: [-102, -132],
    8: [-132, -172],
    9: [-172, -222],
    10: [-222, -262],
    11: [-262, -312],
    12: [-312, -362]
  };
  /* ── Carte : plan 2D de LA SALLE où vous êtes (murs et meubles à l’échelle, portes, objets présents, votre position et direction) ── */
  let _ints = [],
    _intsAt = 0;
  function roomObjects() {
    const now = performance.now();
    if (now < _intsAt) return _ints;
    _intsAt = now + 1500;
    _ints = [];
    scene.traverse((o) => {
      if (o.userData && o.userData.interactive && o.userData.id) _ints.push(o);
    });
    return _ints;
  }
  const _wp = new THREE.Vector3();
  const shortName = (o) =>
    String(o.userData.hint || o.userData.id)
      .replace(
        /^(Prendre|Ramasser|Examiner|Inspecter|Ouvrir|Lire|Actionner|Écouter)\s*(le |la |l’|l'|les |un |une |des )?/i,
        ''
      )
      .slice(0, 22);
  function drawMap(g, W, H, big) {
    const r = roomOf(rig.pos.z),
      hw = HW[r],
      zr = ZR[r],
      zT = zr[0],
      zB = zr[1],
      rw = 2 * hw,
      rd = zT - zB;
    g.fillStyle = '#07100a';
    g.fillRect(0, 0, W, H);
    const hdr = Math.round(H * (big ? 0.09 : 0.13)),
      ft = Math.round(H * (big ? 0.08 : 0)),
      aw = W - W * 0.04,
      ah = H - hdr - ft - H * 0.03,
      s = Math.min(aw / rw, ah / rd),
      ox = (W - rw * s) / 2,
      oy = hdr + (ah - rd * s) / 2 + H * 0.01;
    const X = (x) => ox + (x + hw) * s,
      Z = (z) => oy + (zT - z) * s; // monde → pixels (nord = haut)
    g.strokeStyle = '#14331c';
    g.lineWidth = 1;
    for (let x = -hw; x <= hw; x += 5) {
      g.beginPath();
      g.moveTo(X(x), Z(zT));
      g.lineTo(X(x), Z(zB));
      g.stroke();
    }
    for (let z = zB; z <= zT; z += 5) {
      g.beginPath();
      g.moveTo(X(-hw), Z(z));
      g.lineTo(X(hw), Z(z));
      g.stroke();
    }
    g.fillStyle = '#0c1b11';
    g.fillRect(X(-hw), Z(zT), rw * s, rd * s);
    g.strokeStyle = '#9fd8a8';
    g.lineWidth = 3;
    g.strokeRect(X(-hw), Z(zT), rw * s, rd * s);
    // murs et meubles (collisions du jeu) qui se trouvent dans cette salle
    g.fillStyle = '#2a3a2c';
    g.strokeStyle = '#4f7a58';
    g.lineWidth = 1;
    const area = rw * rd;
    const draw = (c) => {
      if (c.length !== 4) return;
      const cx = (c[0] + c[1]) / 2,
        cz = (c[2] + c[3]) / 2;
      if (cx < -hw || cx > hw || cz > zT || cz < zB) return;
      const w = c[1] - c[0],
        d = c[3] - c[2];
      if (w * d > area * 0.5) return;
      g.fillRect(X(c[0]), Z(c[3]), Math.max(1.5, w * s), Math.max(1.5, d * s));
      g.strokeRect(X(c[0]), Z(c[3]), Math.max(1.5, w * s), Math.max(1.5, d * s));
    };
    COLLIDERS.forEach(draw);
    EXTRA_COLLIDERS.forEach(draw);
    // objets de la salle : portes (vert = ouverte, rouge = fermée), objets à ramasser (losanges), éléments à examiner (points)
    const labels = [];
    roomObjects().forEach((o) => {
      if (!o.visible) return;
      o.getWorldPosition(_wp);
      const x = _wp.x,
        z = _wp.z;
      if (x < -hw - 1 || x > hw + 1 || z > zT + 1 || z < zB - 1) return;
      const u = o.userData,
        px = X(x),
        py = Z(z);
      if (/^door_/.test(u.id)) {
        const D = DOORS.find((d) => d.id === u.id),
          op = D && State[D.flag];
        g.fillStyle = op ? '#3fdc72' : '#c4281c';
        g.fillRect(px - Math.max(6, s * 1.2), py - 3, Math.max(12, s * 2.4), 6);
        return;
      }
      if (u.actionType === 'pickup') {
        g.fillStyle = '#ffd070';
        g.beginPath();
        g.moveTo(px, py - 6);
        g.lineTo(px + 5, py);
        g.lineTo(px, py + 6);
        g.lineTo(px - 5, py);
        g.closePath();
        g.fill();
        labels.push([px, py, shortName(o)]);
      } else {
        g.fillStyle = '#22d3ee';
        g.beginPath();
        g.arc(px, py, 3, 0, 6.283);
        g.fill();
      }
    });
    if (big) {
      g.font = 'bold ' + Math.round(H * 0.02) + 'px monospace';
      g.fillStyle = '#ffd070';
      g.textBaseline = 'middle';
      labels.slice(0, 30).forEach(([x, y, t]) => g.fillText(t, x + 8, y));
    }
    // joueur : point rouge pulsé + cône de vision
    const px = X(rig.pos.x),
      py = Z(rig.pos.z),
      t = performance.now() / 1000,
      L = Math.max(30, s * 6),
      a = -rig.yaw; // yaw 0 = vers -z (haut de la carte)
    g.fillStyle = 'rgba(255,59,42,.18)';
    g.beginPath();
    g.moveTo(px, py);
    g.arc(px, py, L, a - Math.PI / 2 - 0.6, a - Math.PI / 2 + 0.6);
    g.closePath();
    g.fill();
    g.fillStyle = '#ff3b2a';
    g.beginPath();
    g.arc(px, py, Math.max(5, s * 0.45), 0, 6.283);
    g.fill();
    g.strokeStyle = 'rgba(255,59,42,' + (0.7 - 0.5 * Math.abs(Math.sin(t * 2))) + ')';
    g.lineWidth = 2;
    g.beginPath();
    g.arc(px, py, Math.max(9, s * 0.9) * (1 + 0.3 * Math.abs(Math.sin(t * 2))), 0, 6.283);
    g.stroke();
    // en-tête et légende
    g.textBaseline = 'alphabetic';
    g.fillStyle = '#ffd070';
    g.font = 'bold ' + Math.round(hdr * 0.5) + 'px monospace';
    g.fillText(
      'SECTEUR ' + String(r).padStart(2, '0') + ' · ' + NAMES[r - 1].toUpperCase(),
      W * 0.02,
      hdr * 0.62
    );
    if (big) {
      g.font = Math.round(H * 0.026) + 'px monospace';
      g.fillStyle = '#9fd8a8';
      g.fillText(
        '● VOUS   ◆ objet à ramasser   • à examiner   ▬ porte (vert ouverte / rouge fermée)',
        W * 0.02,
        H - ft * 0.35
      );
      g.fillText(
        'Inventaire : ' + (INV_LAST.length ? INV_LAST.join(' · ').slice(0, 110) : 'vide'),
        W * 0.02,
        H - ft * 0.05
      );
    }
  }
  /* ── Carte plein écran (touche M) ── */
  const ov = document.createElement('canvas');
  ov.id = 'mapov';
  ov.style.cssText =
    'position:fixed;left:50%;top:50%;translate:-50% -50%;width:min(92vw,170vh);aspect-ratio:16/9;z-index:15;display:none;pointer-events:none;border:2px solid #3a3326;box-shadow:0 10px 40px #000c;opacity:.96';
  ov.width = 1280;
  ov.height = 720;
  document.body.appendChild(ov);
  const octx = ov.getContext('2d');
  let mapOn = false,
    mapT = 0;
  const toggleMap = () => {
    mapOn = !mapOn;
    ov.style.display = mapOn ? 'block' : 'none';
    SND.play('paper');
    if (mapOn) drawMap(octx, 1280, 720, true);
  };
  addEventListener(
    'keydown',
    (e) => {
      if (e.repeat || (e.target && e.target.tagName === 'INPUT')) return;
      if (CONTROLS.keys.map.includes(e.code)) toggleMap();
    },
    true
  );
  const mb = document.createElement('button');
  mb.className = 'hud';
  mb.id = 'mapb';
  mb.textContent = 'MAP';
  mb.title = 'Carte (M)';
  mb.style.cssText =
    'pointer-events:auto;right:14px;top:58px;padding:6px 8px;font:700 12px var(--stencil);letter-spacing:.1em;color:#b9bca8;background:#0a0c0a8c;border:1px solid #ffffff1c;border-radius:6px';
  mb.onclick = toggleMap;
  document.body.appendChild(mb);
  /* ── Écrans 3D ── */
  const Y = PLAT.y,
    W = CCTV_CFG.wall,
    cams = CCTV_CFG.cams,
    N = cams.length;
  const mkRT = (w, h) => {
    const r = new THREE.WebGLRenderTarget(w, h);
    r.texture.colorSpace = THREE.SRGBColorSpace;
    return r;
  };
  const rts = cams.map(() => mkRT(...CCTV_CFG.camRes)),
    mainRT = mkRT(...CCTV_CFG.mainRes);
  const mapC = document.createElement('canvas');
  mapC.width = 480;
  mapC.height = 270;
  const mapCtx = mapC.getContext('2d'),
    mapTex = new THREE.CanvasTexture(mapC);
  mapTex.colorSpace = THREE.SRGBColorSpace;
  const cam = new THREE.PerspectiveCamera(70, 16 / 9, 0.1, 140),
    fill = new THREE.PointLight(0xbfffd0, 0, 45, 1.6);
  scene.add(fill); // lampe qui n’éclaire que pendant le rendu d’une caméra
  // modèles de caméras fixés au plafond (elles tournent réellement)
  cams.forEach((c) => {
    const g = new THREE.Group();
    g.position.set(...c.pos);
    scene.add(g);
    c.model = g;
    c.off = 0;
    c.offT = 0;
    cyl(0.03, 0.25, mats.steel, 0, 0.2, 0, g, 8);
    const body = box(0.22, 0.2, 0.45, mats.dark, 0, 0, -0.12, g);
    const lens = box(0.1, 0.1, 0.04, glow(0xff2a1a, 2), 0, 0, -0.36, g);
    g.rotation.set(c.tilt || 0, c.yaw, 0, 'YXZ');
    body.castShadow = false;
  });
  // mur d’écrans : 1 grand écran central + 6 vignettes, sur une table de surveillance
  const grpW = new THREE.Group();
  grpW.position.set(W.x, Y, W.z);
  grpW.rotation.y = -Math.PI / 2;
  scene.add(grpW); // repère local : +x = vers le sud (z croissant)... faces vers l’ouest
  box(14.6, 0.1, 1.2, mats.dark, 0, 0.85, 0.55, grpW);
  box(15, 0.8, 1.2, mats.lockerA, 0, 0.4, 0.55, grpW);
  pushC(W.x - 0.55, W.z, 0.6, 7.5);
  const scr = (w, h, x, y, mat) => {
    box(w + 0.1, h + 0.1, 0.06, mats.dark, x, y, -0.02, grpW);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    m.position.set(x, y, 0.02);
    grpW.add(m);
    return m;
  };
  const mainMat = new THREE.MeshBasicMaterial({ map: mainRT.texture, toneMapped: false }),
    thumbs = [];
  const mainScr = scr(3.0, 1.7, 0, 1.95, mainMat);
  const lbl = (t, x, y) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(1.4, 0.18),
      new THREE.MeshBasicMaterial({
        map: cvTex(256, 32, (g, w, h) => {
          g.fillStyle = '#050805';
          g.fillRect(0, 0, w, h);
          g.fillStyle = '#9fd8a8';
          g.font = 'bold 22px monospace';
          g.fillText(t, 6, 24);
        }),
        toneMapped: false
      })
    );
    m.position.set(x, y, 0.025);
    grpW.add(m);
  };
  const xs = [-5.6, -4.0, -2.4, 2.4, 4.0, 5.6]; // 3 vignettes de chaque côté de l’écran principal (x local ; sera -z monde après rotation)
  for (let i = 0; i <= N; i++) {
    const x = xs[i],
      mat = new THREE.MeshBasicMaterial({ map: i < N ? rts[i].texture : mapTex, toneMapped: false });
    const m = scr(1.5, 0.84, x, 1.9, mat);
    m.userData.idx = i;
    thumbs.push(m);
    lbl(i < N ? i + 1 + ' · ' + cams[i].name : i + 1 + ' · PLAN', x, 1.38);
  }
  const sel = { i: 1 };
  function setSel(i) {
    sel.i = i;
    mainMat.map = i < N ? mainRT.texture : mapTex;
    mainMat.needsUpdate = true;
  }
  // le point de visée / la position d’observation (on recule pour voir tout le mur)
  const focusPt = () => new THREE.Vector3(W.x, W.y, W.z),
    focusFn = (c) => new THREE.Vector3(W.x - 7.6, W.y - 0.15, W.z);
  const hud = document.createElement('div');
  hud.id = 'camhud';
  hud.className = 'hud';
  hud.style.cssText =
    'left:50%;translate:-50% 0;top:12px;display:none;pointer-events:auto;text-align:center;padding:8px 14px;background:linear-gradient(180deg,#1b1d19f2,#0a0b09f2);border:2px solid #3a3326;font:600 15px var(--stencil);color:#e6e0c8;z-index:12';
  hud.innerHTML =
    '<div id="camtt"></div><div style="font:400 12px monospace;color:#8d907f;margin-top:4px">Bougez la souris : la caméra mobile vous suit · 1-6 pour changer d’écran · bouton « Quitter le zoom » pour sortir</div>';
  const mouse = { x: 0, y: 0 };
  addEventListener('pointermove', (e) => {
    mouse.x = (e.clientX / innerWidth) * 2 - 1;
    mouse.y = (e.clientY / innerHeight) * 2 - 1;
  });
  addEventListener('keydown', (e) => {
    if (!active()) return;
    const n = +e.key;
    if (n >= 1 && n <= N + 1) select(n - 1);
  });
  const active = () => !!(State.focus && State.focus.userData && State.focus.userData.cctv);
  function select(i) {
    setSel(i);
    SND.play('click');
    title();
  }
  function title() {
    const t = document.getElementById('camtt');
    if (t)
      t.textContent =
        sel.i < N
          ? 'CAMÉRA ' +
            (sel.i + 1) +
            ' · ' +
            cams[sel.i].name +
            (cams[sel.i].pan ? ' · ORIENTABLE' : ' · FIXE')
          : 'PLAN DU BUNKER · position en direct';
  }
  // éléments interactifs : chaque vignette sélectionne son écran (on entre d’abord en mode caméra)
  const enter = async (o) => {
    if (!State.focus) {
      await focusOn(o);
    }
    hud.style.display = 'block';
    title();
  };
  thumbs.forEach((m) => {
    const idx = m.userData.idx,
      hb = box(1.5, 0.84, 0.3, mats.dark, 0, 0, 0, m);
    hb.visible = false;
    interactive(m, 'cctv_' + idx, 'Écran de surveillance ' + (idx + 1), 'use', { cctv: 1, focusPt, focusFn });
    R('cctv_' + idx, async (o) => {
      await enter(o);
      select(idx);
    });
  });
  interactive(mainScr, 'cctv_main', 'Écran principal de surveillance', 'use', { cctv: 1, focusPt, focusFn });
  R('cctv_main', async (o) => {
    await enter(o);
    title();
  });
  // le code : peint sur UN mur, invisible hors caméra (affiché seulement pendant le rendu de la caméra qui possède reveal:true)
  const cw = CCTV_CFG.codeWall,
    code = CONFIG.camCode.split('').join('  ');
  const codeMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 1.0),
    new THREE.MeshBasicMaterial({
      map: cvTex(512, 230, (g, w, h) => {
        g.fillStyle = '#3c3f38';
        g.fillRect(0, 0, w, h);
        g.fillStyle = '#d8ccb0';
        g.font = 'bold 120px Georgia';
        g.textAlign = 'center';
        g.fillText(code, w / 2, 150);
        g.strokeStyle = '#8a1c14';
        g.lineWidth = 6;
        g.strokeRect(10, 10, w - 20, h - 20);
      }),
      toneMapped: false,
      transparent: true
    })
  );
  codeMesh.position.set(cw.x, cw.y, cw.z);
  codeMesh.rotation.y = -Math.PI / 2;
  codeMesh.visible = false;
  codeMesh.raycast = () => {};
  scene.add(codeMesh);
  // armoire à munitions (poste de contrôle) : s’ouvre avec le code vu en caméra
  {
    const g = new THREE.Group();
    g.position.set(W.x - 5.1, Y + 1.3, W.z - 7.7);
    scene.add(g);
    box(0.9, 1.2, 0.25, mats.lockerA, 0, 0, 0, g);
    box(0.7, 0.35, 0.03, mats.dark, 0, 0.25, 0.14, g);
    box(0.2, 0.2, 0.03, glow(0xff2a1a, 2), 0, -0.2, 0.14, g);
    hitBox(1, 1.3, 0.4, 0, 0, 0.05, g);
    interactive(g, 'ammo_safe', 'Armoire à munitions (code à 4 chiffres)', 'use', { focusDist: 1.4 });
    R('ammo_safe', async (o) => {
      if (State.ammoCache) return say('Armoire déjà vidée.', 2500);
      if (!State.focus) await focusOn(o);
      if (
        await askCode('ARMOIRE À MUNITIONS', 4, CONFIG.camCode, {
          note: ['INDICE', 'Le code est peint sur un mur… visible seulement par caméra']
        })
      ) {
        State.ammoCache = true;
        State.ammo = (State.ammo || 0) + 30;
        SND.play('success');
        say('L’armoire s’ouvre : 30 cartouches 9 mm.', 5000);
        renderInv();
      } else say('Code refusé.', 3000);
      await release();
    });
  }
  /* ── rendu des caméras (appelé par la boucle) ── */
  function renderFeed(i, rt, showCode) {
    const c = cams[i];
    c.model.visible = false;
    cam.position.set(...c.pos);
    cam.rotation.set(c.tilt || 0, c.yaw + c.off, 0, 'YXZ');
    fill.position.copy(cam.position);
    fill.intensity = 60;
    codeMesh.visible = !!(showCode && c.reveal);
    const old = renderer.getRenderTarget(),
      sm = renderer.shadowMap.needsUpdate;
    renderer.shadowMap.needsUpdate = false;
    renderer.setRenderTarget(rt);
    renderer.render(scene, cam);
    renderer.setRenderTarget(old);
    renderer.shadowMap.needsUpdate = sm;
    fill.intensity = 0;
    codeMesh.visible = false;
    c.model.visible = true;
    c.model.rotation.set(c.tilt || 0, c.yaw + c.off, 0, 'YXZ');
  }
  let rr = 0,
    fr = 0,
    mapAt = 0;
  function frame(dt, t) {
    const near = Math.hypot(rig.pos.x - W.x, rig.pos.z - W.z) < 22 && Math.abs(rig.pos.y - (Y + 1.6)) < 2.5;
    if (!active() && hud.style.display !== 'none') hud.style.display = 'none';
    if (!near && !active()) return;
    fr++;
    if (active()) {
      const c = sel.i < N ? cams[sel.i] : null; // pilotage de la caméra choisie
      if (c && c.pan) {
        if (c.baseTilt === undefined) c.baseTilt = c.tilt || 0; // la caméra SUIT LA SOURIS du joueur (souris à droite → regarde à droite, en bas → regarde en bas)
        const tx = -mouse.x * c.range,
          ty = Math.max(-0.7, Math.min(0.2, c.baseTilt - mouse.y * 0.35)),
          k = Math.min(1, dt * 5);
        c.off += (tx - c.off) * k;
        c.tilt = (c.tilt || 0) + (ty - (c.tilt || 0)) * k;
      }

      if (sel.i < N && fr % 2 === 0) renderFeed(sel.i, mainRT, true);
    }
    if (fr % 3 === 0) {
      const i = rr++ % N;
      if (!(active() && i === sel.i && false)) renderFeed(i, rts[i], true);
    } // vignettes : une caméra à la fois
    if (performance.now() > mapAt) {
      mapAt = performance.now() + 250;
      drawMap(mapCtx, 480, 270, false);
      mapTex.needsUpdate = true;
      if (mapOn) drawMap(octx, 1280, 720, true);
    }
  }
  /* ── Caméras de surveillance dans CHAQUE salle : elles suivent le joueur des yeux (quand il est dans leur salle) ── */
  const RC_Y = {
    1: 2.8,
    2: 2.8,
    3: 2.8,
    4: 2.8,
    5: 4.4,
    6: 4.4,
    7: 7,
    8: 4.4,
    9: 4.4,
    10: 4.3,
    11: 4.3,
    12: 4.3
  };
  const roomCams = [];
  for (let r = 1; r <= 12; r++) {
    const zT = ZR[r][0],
      zw = r === 1 ? zT - 0.5 : zT - 0.5,
      x = r === 1 ? 4 : 4.5,
      y = RC_Y[r];
    const arm = box(0.06, 0.06, 0.45, mats.steel, x, y + 0.12, zw + 0.2),
      head = new THREE.Group();
    head.position.set(x, y, zw);
    head.rotation.order = 'YXZ';
    scene.add(head);
    cyl(0.03, 0.18, mats.steel, 0, 0.1, 0, head, 8);
    const body = box(0.22, 0.2, 0.45, mats.dark, 0, 0, -0.12, head);
    body.castShadow = false;
    arm.castShadow = false;
    const lm = glow(0xff2a1a, 2.5);
    box(0.1, 0.1, 0.04, lm, 0, 0, -0.36, head);
    head.userData = { room: r, lm };
    head.rotation.y = 0;
    roomCams.push(head);
  }
  const _ang = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  function aim(head, tx, ty, tz, k) {
    const p = head.position,
      dx = tx - p.x,
      dy = ty - p.y,
      dz = tz - p.z,
      yaw = Math.atan2(-dx, -dz),
      pitch = Math.max(-1.1, Math.min(0.4, Math.atan2(dy, Math.hypot(dx, dz))));
    head.rotation.y += _ang(yaw - head.rotation.y) * k;
    head.rotation.x += (pitch - head.rotation.x) * k;
  }
  function track(dt, t) {
    const cur = roomOf(rig.pos.z),
      k = Math.min(1, dt * 4);
    roomCams.forEach((h) => {
      const r = h.userData.room;
      h.userData.lm.emissiveIntensity = Math.sin(t * 3 + r) > 0.3 ? 3 : 0.4;
      if (r === cur)
        aim(h, rig.pos.x, rig.pos.y - 0.25, rig.pos.z, k); // le joueur est dans la salle : la caméra le suit
      else {
        h.rotation.y += _ang(Math.sin(t * 0.45 + r) * 0.7 - h.rotation.y) * dt;
        h.rotation.x += (-0.3 - h.rotation.x) * dt;
      }
    }); // sinon : balayage lent
    cams.forEach((c) => {
      if (c.pan || roomOf(c.pos[2]) !== cur) return;
      const dx = rig.pos.x - c.pos[0],
        dz = rig.pos.z - c.pos[2],
        yaw = Math.atan2(-dx, -dz),
        pitch = Math.max(-0.7, Math.min(0.2, Math.atan2(rig.pos.y - 0.25 - c.pos[1], Math.hypot(dx, dz))));
      c.off += _ang(yaw - c.yaw - c.off) * k;
      c.tilt = (c.tilt || 0) + (pitch - (c.tilt || 0)) * k;
      c.model.rotation.set(c.tilt, c.yaw + c.off, 0, 'YXZ');
    });
  } // les caméras fixes du poste de surveillance suivent aussi le joueur
  setSel(1);
  return { frame, track, cfg: CCTV_CFG };
})();

R('panel_blood_01', async (o) => {
  if (!State.bloodOpen) {
    if (!State.power) {
      SND.play('locked');
      return say(
        'Une plaque vissée, couverte de sang séché. À la lampe torche on ne distingue rien : il faudrait la lumière des néons pour travailler dessus.',
        5500
      );
    }
    if (!State.boltA) {
      if (!State.screwdriver) {
        SND.play('locked');
        return say(
          'La plaque est tenue par quatre vis. Les deux du haut sont cruciformes : il faut un tournevis. Les deux du bas sont des vis de sécurité rouillées.',
          6000
        );
      }
      await focusOn(o);
      await plateTool('driver', [0, 1]);
      State.boltA = true;
      say(
        'Les deux vis du haut tournent et tombent. Celles du bas sont des vis de sécurité rouillées : le tournevis glisse dessus. Il faut les percer avec une perceuse.',
        7500
      );
      setObjective(objectiveNow());
      return release();
    }
    if (!State.drill) {
      SND.play('locked');
      return say(
        'Les deux vis du bas sont des vis de sécurité rouillées : le tournevis ne mord pas. Il faut les percer avec une perceuse.',
        5500
      );
    }
    await focusOn(o);
    await plateTool('drill', [2, 3]);
    SND.play('unlock');
    State.bloodOpen = true;
    const y0 = bloodCover.position.y;
    await tween(1.0, (k) => {
      bloodCover.position.y = y0 - 0.9 * k * k;
      bloodCover.position.x = p1.position.x + 0.045 + 0.35 * k;
      bloodCover.rotation.z = 0.5 * k;
    });
    bloodCover.visible = false;
    SND.play('paper');
    say('Vous dévissez la plaque : derrière, des chiffres tracés dans le sang. ' + M.panel1, 7000);
    State.panelRead = true;
    return setObjective(objectiveNow());
  }
  SND.play('paper');
  await focusOn(o);
  say(M.panel1);
});
R('switch_power', (o) => {
  if (State.power) return say(M.powerAlready);
  if (!State.gen1) {
    SND.play('locked');
    return say(M.needGen);
  }
  if (!State.brkOk) {
    SND.play('locked');
    return say(
      'Le levier ne répond pas : le disjoncteur est ouvert. Il manque deux fusibles dans le tableau électrique voisin.',
      5500
    );
  }
  State.power = true;
  o.userData.state = 'on';
  o.userData.hint = Hn.switch_power_on;
  SND.play('lever');
  setTimeout(() => SND.play('power'), 350);
  tween(0.6, (k) => {
    o.userData.arm.rotation.z = 0.65 - 1.3 * k;
  });
  o.userData.led.material = glow(0x30ff70, 3);
  screen1.draw(TEXTS.screens.term_on, '#5fe08a');
  say(M.powerOn);
  setObjective(TEXTS.objectives.needCode);
});
R('terminal_01', async (o) => {
  if (!State.power) {
    SND.play('error');
    return say(M.termNoPower);
  }
  if (!State.badge && !State.termOk) {
    SND.play('error');
    return say('Le terminal exige un badge d’accès. Il doit traîner dans un des casiers cadenassés…', 5500);
  }
  if (State.termOk) return say(fmt(M.termCode, { c: CONFIG.doorCode }), 7000);
  await focusOn(o);
  if (await askCode(TEXTS.ui.keypadTitle, 4, CONFIG.code)) {
    State.termOk = true;
    SND.play('success');
    screen1.draw([...TEXTS.screens.term_ok, '', 'CODE SAS : ' + CONFIG.doorCode], '#5fe08a');
    door1.userData.hint = 'Utiliser le digicode du sas';
    say(fmt(M.termOk, { c: CONFIG.doorCode }), 9000);
    setObjective(TEXTS.objectives.openDoor);
  } else say(M.termBad);
  release();
});
R('locker_03', (o) => {
  if (State.locker3) return say(M.locker3Done);
  State.locker3 = true;
  (o.children || []).forEach((c) => {
    if (c.userData && c.userData.hit) c.raycast = () => {};
  });
  o.userData.hint = Hn.locker_03_open;
  SND.play('latch');
  setTimeout(() => SND.play('lockerdoor'), 140);
  tween(0.9, (k) => {
    o.userData.pivot.rotation.y = -1.9 * k;
  });
  setTimeout(() => lockerStuff(true), 350);
  say(M.locker3Open, 6000);
});
R('note_log', async (o) => {
  if (!State.locker3) {
    SND.play('locked');
    return say(M.noteFirst);
  }
  SND.play('paper');
  await focusOn(o);
  say(M.note, 7000);
  if (!State.noteLocker) {
    State.noteLocker = true;
    renderInv();
    setObjective(objectiveNow());
  }
}); // la note va dans l'inventaire
R('battery_01', (o) => {
  State.battery = true;
  hideObj(o);
  SND.play('click');
  renderInv();
  say(M.batTaken, 4500);
  setObjective(objectiveNow());
});
R('fuelcan_01', (o) => {
  State.fuel = true;
  hideObj(o);
  SND.play('click');
  renderInv();
  say(M.fuelTaken, 4500);
  setObjective(objectiveNow());
});
const LKMSG = [
  'Le cadenas cède avec un claquement sec. Dans le casier : un bidon d’essence, intact.',
  'Le cadenas cède. Sur l’étagère : un tournevis cruciforme et une odeur de rouille.',
  'Le cadenas cède. Sur l’étagère : un badge d’accès, « Dr LEROY — niveau 2 ». Au fond, par terre : une perceuse sans fil.'
];
['locker_01', 'locker_02', 'locker_04'].forEach((id, i) =>
  R(id, (o) => {
    const u = o.userData,
      k = [0, 1, 3][i];
    if (u.cut) return say('Le casier est déjà ouvert.', 2500);
    if (!State.cutters) {
      SND.play('locked');
      return say('Cadenas rouillé : impossible à forcer à la main. Une pince coupante serait idéale.', 5200);
    }
    u.cut = true;
    (o.children || []).forEach((c) => {
      if (c.userData && c.userData.hit) c.raycast = () => {};
    });
    SND.play('cutlock');
    setTimeout(() => SND.play('padfall'), 380);
    const pd = u.pad,
      py = pd.position.y;
    tween(
      0.5,
      (t) => {
        pd.position.y = py - 0.5 * t * t;
        pd.rotation.z = 1.4 * t;
        pd.position.z = 0.07 + 0.15 * t;
      },
      (t) => t
    ).then(() => {
      pd.visible = false;
    });
    setTimeout(() => {
      SND.play('latch');
      setTimeout(() => SND.play('lockerdoor'), 140);
      tween(0.9, (t) => {
        u.pivot.rotation.y = -1.9 * t;
      });
      lkShow(lkItems[k], true);
      say(LKMSG[i], 5500);
    }, 900);
  })
);
R('screwdriver_01', (o) => {
  State.screwdriver = true;
  hideObj(o);
  SND.play('click');
  renderInv();
  say('Un tournevis cruciforme. Utile pour tout ce qui est vissé.', 4000);
  setObjective(objectiveNow());
});
R('drill_01', (o) => {
  State.drill = true;
  hideObj(o);
  SND.play('click');
  renderInv();
  say('Une perceuse sans fil, batterie chargée. De quoi venir à bout des vis de sécurité.', 4500);
  setObjective(objectiveNow());
});
R('badge_01', (o) => {
  State.badge = true;
  hideObj(o);
  SND.play('click');
  renderInv();
  say('Un badge d’accès au nom de « Dr LEROY ». Le terminal devrait le reconnaître.', 4500);
  setObjective(objectiveNow());
});

// ── Pièce 2 ──
R('panel_blood_02', async (o) => {
  SND.play('paper');
  await focusOn(o);
  say(M.panel2);
});
R('valve_pipe', () => {
  SND.play('locked');
  say(M.valve);
});
R('tank_01', () => {
  SND.play('drip');
  say(M.tank);
});
const press = (o) => {
  if (State.solved) return say(M.consoleLocked);
  const k = o.userData.color,
    cap = o.userData.cap;
  SND.play('press', k);
  tween(0.25, (v) => {
    cap.position.y = 0.05 - 0.03 * Math.sin(v * Math.PI);
  });
  State.seq.push(k);
  const ok = State.seq.every((c, i) => c === CONFIG.sequence[i]);
  if (!ok) {
    State.seq = [];
    setTimeout(() => SND.play('error'), 150);
    say(M.seqWrong);
    setMonitors(...TEXTS.screens.mon_err, '#ff6a5a');
    return;
  }
  if (State.seq.length === CONFIG.sequence.length) {
    State.solved = true;
    setTimeout(() => {
      SND.play('success');
      SND.play('unlock');
    }, 250);
    doorExit.userData.led.material = glow(0x30ff70, 3);
    doorExit.userData.hint = Hn.door_exit_unlocked;
    setMonitors(...TEXTS.screens.mon_ok, '#7fe9ff');
    say(M.seqOk);
    setObjective(TEXTS.objectives.exit);
  } else say(fmt(M.seqProgress, { n: State.seq.length, total: CONFIG.sequence.length }), 2500);
};
['btn_green', 'btn_red', 'btn_blue'].forEach((id) => R(id, press));
// ── Portes : même logique pour les 4 (verrouillée → ouvrir → traverser) ──
const DOORS = [
  {
    id: 'door_room1',
    z: -4,
    flag: 'door1',
    ok: () => State.unlocked,
    locked: M.door1Locked,
    open: M.door1Open
  },
  { id: 'door_exit', z: -12, flag: 'door2', ok: () => State.solved, locked: M.exitLocked, open: M.exit2Open },
  {
    id: 'door_vault',
    z: -22,
    flag: 'door3',
    ok: () => State.vaultUnlocked,
    locked: M.vaultLocked,
    open: M.vaultOpen
  },
  {
    id: 'door_final',
    z: -32,
    flag: 'doorFinal',
    ok: () => State.power4,
    locked: M.finalLocked,
    open: M.finalOpen
  },
  {
    id: 'door_hangar',
    z: -72,
    flag: 'doorHangar',
    ok: () => State.power5,
    locked: M.hangarLocked,
    open: M.hangarOpen
  },
  {
    id: 'door_ware',
    z: -102,
    flag: 'doorWare',
    ok: () => State.wareCode,
    locked: M.wareLocked,
    open: M.wareOpen
  },
  { id: 'door_end', z: -132, flag: 'doorEnd', ok: () => State.key, locked: M.endLocked, open: M.endOpen },
  { id: 'door_cmd', z: -172, flag: 'doorCmd', ok: () => State.power8, locked: M.cmdLocked, open: M.cmdOpen },
  {
    id: 'door_exit2',
    z: -222,
    flag: 'doorExit2',
    ok: () => State.key2,
    locked: M.exit2Locked,
    open: M.exit2Open2
  },
  {
    id: 'door_block',
    z: -262,
    flag: 'doorBlock',
    ok: () => State.key4,
    locked: M.blockLocked,
    open: M.blockOpen
  },
  {
    id: 'door_exit3',
    z: -312,
    flag: 'doorExit3',
    ok: () => State.breaker,
    locked: M.exit3Locked,
    open: M.exit3Open
  },
  {
    id: 'door_shutter',
    z: -362,
    flag: 'doorShutter',
    ok: () => State.zDone,
    locked: M.shutterLocked,
    final: true
  }
];
DOORS.forEach((D) =>
  R(D.id, (o) => {
    if (!D.ok()) {
      SND.play('locked');
      return say(D.locked);
    }
    if (!State[D.flag]) {
      State[D.flag] = true;
      o.userData.hint = Hn.door_room1_open;
      SND.play('door');
      const d = D.final ? 1.8 : 1.6;
      openDoorAnim(o, d);
      if (D.open) say(D.open);
      if (D.final) {
        State.doorExit = true;
        exitLight.material.emissiveIntensity = 6;
        setTimeout(async () => {
          await flyTo(new THREE.Vector3(0, 1.6, -362.2), 0, 0, 52, 2.2);
          SND.play('success');
          document.getElementById('end').classList.add('on');
          modalOpen = true;
        }, 900);
      }
      return;
    }
    if (!D.final) passDoor(D.z);
  })
);

// porte du sas : il faut d’abord le code (terminal), puis le saisir sur le digicode de la porte
{
  const door1Open = Actions.handlers.door_room1;
  R('door_room1', async (o) => {
    if (State.door1) return door1Open(o);
    if (!State.termOk) {
      SND.play('locked');
      return say(M.door1Locked);
    }
    if (!State.unlocked && !State.panelOpen) {
      if (!State.screwdriver) {
        SND.play('locked');
        return say('Le panneau du digicode est vissé au mur. Il faut un tournevis pour y accéder.', 5500);
      }
      await focusOn(o);
      SND.play('click');
      setTimeout(() => SND.play('unlock'), 350);
      State.panelOpen = true;
      say('Vous dévissez le panneau : le digicode apparaît, câbles à nu.', 4500);
      setObjective(objectiveNow());
      return release();
    }
    if (!State.unlocked) {
      await focusOn(o);
      if (await askCode(M.doorCodeTitle, 6, CONFIG.doorCode)) {
        State.unlocked = true;
        SND.play('success');
        setTimeout(() => SND.play('unlock'), 450);
        o.userData.led.material = glow(0x30ff70, 3);
        o.userData.hint = Hn.door_room1_unlocked;
        say(M.doorUnlocked);
      } else {
        say(M.doorBad);
      }
      return release();
    }
    door1Open(o);
  });
}
// ── Décors cliquables ──
R('bag_01', () => {
  SND.play('locked');
  say(M.bag);
});
R('toolbox_01', (o) => {
  const u = o.userData;
  if (State.cutters) return say('Il ne reste que de la rouille et un vieux boulon.');
  State.cutters = true;
  State.fz = (State.fz || 0) + 1;
  SND.play('locker');
  tween(0.6, (k) => {
    u.lid.rotation.x = -1.9 * k;
  });
  renderInv();
  say(
    'Au fond de la caisse : une pince coupante, assez grosse pour venir à bout d’un cadenas, et un fusible 30 A.',
    6000
  );
  setObjective(objectiveNow());
});
R('medcab', () => {
  SND.play('locked');
  say(M.medcab);
});
['rack_01', 'rack_02'].forEach((id) =>
  R(id, () => {
    SND.play('click');
    say(M.rack);
  })
);
R('note_desk', async (o) => {
  SND.play('paper');
  await focusOn(o);
  say(M.noteDesk, 7000);
});

// ── Pièce 3 ──
R('sticky_safe', async (o) => {
  SND.play('paper');
  await focusOn(o);
  say('Un post-it collé au mur, à côté du coffre : « ' + CONFIG.safeCode.split('').join(' ') + ' ».', 6000);
});
R('note_safe', async (o) => {
  SND.play('paper');
  await focusOn(o);
  say(M.noteSafe, 7000);
});
R('radio_01', () => {
  SND.play('radio');
  say(M.radio, 6500);
});
R('safe_01', async (o) => {
  if (State.safe) return say(M.safeDone);
  await focusOn(o);
  if (
    await askCode(TEXTS.ui.safeTitle, 4, CONFIG.safeCode, {
      note: ['CODE DU COFFRE', CONFIG.safeCode.split('').join(' ')]
    })
  ) {
    State.safe = true;
    o.userData.hint = Hn.safe_01_open;
    SND.play('success');
    setTimeout(() => SND.play('locker'), 300);
    tween(0.9, (k) => {
      o.userData.pivot.rotation.y = -1.9 * k;
    });
    card.visible = true;
    delete card.raycast;
    say(M.safeOpen);
  } else say(M.safeBad);
  release();
});
R('keycard', (o) => {
  State.card = true;
  o.visible = false;
  o.raycast = () => {};
  SND.play('paper');
  renderInv();
  say(M.cardTaken);
  setObjective(TEXTS.objectives.needCard);
});
R('reader_01', (o) => {
  if (State.vaultUnlocked) return say(M.readerDone);
  if (!State.card) {
    SND.play('error');
    return say(M.readerNoCard);
  }
  State.vaultUnlocked = true;
  State.card = false;
  renderInv();
  SND.play('success');
  setTimeout(() => SND.play('unlock'), 400);
  o.userData.led.material = glow(0x30ff70, 3);
  doorVault.userData.led.material = glow(0x30ff70, 3);
  doorVault.userData.hint = Hn.door_vault_unlocked;
  say(M.readerOk);
  setObjective(TEXTS.objectives.openVault);
});

// ── Pièce 4 ──
R('panel_blood_03', async (o) => {
  SND.play('paper');
  await focusOn(o);
  say(M.panel3);
});
R('gen_01', () => {
  SND.play('click');
  say(State.power4 ? M.genOn : M.genOff);
});
for (let i = 1; i <= 4; i++)
  R(`brk_${i}`, (o) => {
    if (State.power4) return say(M.genOn);
    const j = o.userData.idx;
    State.brk[j] ^= 1;
    SND.play('lever');
    const a = o.userData.arm,
      from = a.rotation.x,
      to = State.brk[j] ? -0.7 : 0.7;
    tween(0.25, (k) => {
      a.rotation.x = from + (to - from) * k;
    });
    o.userData.led.material = glow(State.brk[j] ? 0x30ff70 : 0xff2a1a, 3);
    if (State.brk.every((v, n) => v === CONFIG.breakers[n])) {
      State.power4 = true;
      setTimeout(() => SND.play('genstart'), 300);
      gen.userData.led.material = glow(0x30ff70, 3);
      doorFinal.userData.led.material = glow(0x30ff70, 3);
      doorFinal.userData.hint = Hn.door_final_unlocked;
      say(M.brkOk, 7000);
      setObjective(TEXTS.objectives.exitFinal);
    } else say(fmt(M.brkToggle, { n: j + 1, s: State.brk[j] ? 'ON' : 'OFF' }), 2000);
  });
// ── Pièces 5 à 7 ──
['fuse_1', 'fuse_2', 'fuse_3'].forEach((id) =>
  R(id, (o) => {
    State.fuses++;
    hideObj(o);
    SND.play('click');
    renderInv();
    say(fmt(M.fuseTaken, { n: State.fuses + State.fusesIn }));
  })
);
R('fusebox_01', (o) => {
  if (State.power5) return say(M.fuseboxDone);
  if (State.fuses < 1) {
    SND.play('locked');
    return say(M.fuseboxNone);
  }
  const k = State.fuses;
  State.fusesIn += k;
  State.fuses = 0;
  renderInv();
  SND.play('locker');
  o.userData.leds.forEach((l, i) => {
    if (i < State.fusesIn) l.material = glow(0x30ff70, 3);
  });
  if (State.fusesIn >= 3) {
    State.power5 = true;
    setTimeout(() => {
      SND.play('success');
      SND.play('genstart');
    }, 350);
    doorHangar.userData.led.material = glow(0x30ff70, 3);
    doorHangar.userData.hint = Hn.door_hangar_unlocked;
    say(M.fuseboxOk, 7000);
    setObjective(TEXTS.objectives.openHangar);
  } else say(fmt(M.fuseboxIn, { k, n: State.fusesIn }));
});
[1, 2, 3, 4].forEach((n) =>
  R('poster_' + n, async (o) => {
    SND.play('paper');
    await focusOn(o);
    say(fmt(M.poster, { n, d: CONFIG.wareCode[n - 1] }), 7000);
  })
);
R('keypad_ware', async (o) => {
  if (State.wareCode) return say(M.wareDone);
  await focusOn(o);
  if (await askCode(M.wareTitle, CONFIG.wareCode.length, CONFIG.wareCode.join(''))) {
    State.wareCode = true;
    SND.play('success');
    setTimeout(() => SND.play('unlock'), 350);
    o.userData.led.material = glow(0x30ff70, 3);
    doorWare.userData.led.material = glow(0x30ff70, 3);
    doorWare.userData.hint = Hn.door_ware_unlocked;
    say(M.wareOk);
    setObjective(TEXTS.objectives.openWare);
  } else say(M.wareBad);
  release();
});
R('key_01', (o) => {
  State.key = true;
  hideObj(o);
  SND.play('paper');
  renderInv();
  say(M.keyTaken);
  doorEnd.userData.led.material = glow(0x30ff70, 3);
  doorEnd.userData.hint = Hn.door_end_unlocked;
  setObjective(TEXTS.objectives.exitEnd);
});
[1, 2, 3].forEach((n) =>
  R('relay_' + n, (o) => {
    if (o.userData.done) return say(M.relayDone);
    o.userData.done = true;
    State.relays++;
    SND.play('lever');
    const a = o.userData.arm,
      f = a.rotation.x;
    tween(0.4, (k) => {
      a.rotation.x = f + (-0.7 - f) * k;
    });
    o.userData.led.material = glow(0x30ff70, 3);
    if (State.relays >= 3) {
      State.power8 = true;
      setTimeout(() => {
        SND.play('success');
        SND.play('genstart');
      }, 350);
      doorCmd.userData.led.material = glow(0x30ff70, 3);
      doorCmd.userData.hint = Hn.door_cmd_unlocked;
      say(M.relaysOk, 7000);
      setObjective(TEXTS.objectives.openCmd);
    } else say(fmt(M.relay, { n: State.relays }));
  })
);
R('key_02', (o) => {
  State.key2 = true;
  hideObj(o);
  SND.play('paper');
  renderInv();
  say(M.key2Taken);
  doorExit2.userData.led.material = glow(0x30ff70, 3);
  doorExit2.userData.hint = Hn.door_exit2_unlocked;
  setObjective(TEXTS.objectives.exitFinal2);
});
// ── Bloc cellulaire (salle 10) ──
['W0', 'W1', 'W2', 'W3', 'E0', 'E1', 'E2', 'E3'].forEach((n) =>
  R('gate_' + n, (o) => {
    if (o.userData.opened) return say(M.cellAlready);
    if (n === 'W2') {
      if (!State.keyCell) {
        SND.play('locked');
        return say(M.cellLocked);
      }
      openGate(o);
      return say(M.cellOpenNow);
    }
    SND.play('locked');
    say(n === 'W3' ? M.cellRust : M.cellLocked);
  })
);
R('note_cells', async (o) => {
  SND.play('paper');
  await focusOn(o);
  say(M.cellNote, 7000);
});
R('scratch_code', async (o) => {
  SND.play('paper');
  await focusOn(o);
  say(fmt(M.scratch, { d: CONFIG.drawerCode.split('').join(' ') }), 8000);
});
R('drawer_guard', async (o) => {
  if (State.keyCell) return say(M.drawerEmpty);
  await focusOn(o);
  if (await askCode(M.drawerTitle, 3, CONFIG.drawerCode)) {
    State.keyCell = true;
    SND.play('success');
    setTimeout(() => SND.play('key'), 300);
    renderInv();
    say(M.drawerOk, 6000);
    setObjective(objectiveNow());
  } else say(M.drawerBad);
  release();
});
R('bunk', (o) => {
  if (!State.keyCell && !State.cell3seen) {
    SND.play('click');
    State.cell3seen = true;
    return say(M.bunkNo);
  }
  if (State.key4) return say(M.bunkDone);
  State.key4 = true;
  SND.play('key');
  renderInv();
  say(M.bunkOk, 6000);
  doorBlock.userData.led.material = glow(0x30ff70, 3);
  doorBlock.userData.hint = Hn.door_block_unlocked;
  setObjective(objectiveNow());
});
// ── Complexe à étages (salle 11) ──
R('note_stairs', async (o) => {
  SND.play('paper');
  await focusOn(o);
  say(fmt(M.stairsNote, { d: CONFIG.bureauCode.split('').join(' ') }), 8000);
});
R('door_bureau', async (o) => {
  if (o.userData.opened) return say(M.doorAlready);
  if (!State.bureauOpen) {
    await focusOn(o);
    if (await askCode(M.bureauTitle, 3, CONFIG.bureauCode)) {
      State.bureauOpen = true;
      SND.play('success');
      o.userData.led.material = glow(0x30ff70, 3);
      say(M.bureauOpen);
      await release();
      openInner(o);
    } else {
      say(M.bureauBad);
      await release();
    }
    return;
  }
  openInner(o);
});
R('crowbar', (o) => {
  State.crowbar = true;
  hideObj(o);
  SND.play('click');
  renderInv();
  say(M.crowbarTaken);
  setObjective(objectiveNow());
});
R('bar_depot', (o) => {
  if (State.barDone) return;
  if (!State.crowbar) {
    SND.play('locked');
    return say(M.barNeed);
  }
  State.barDone = true;
  SND.play('lever');
  setTimeout(() => SND.play('clank'), 400);
  const y0 = o.position.y;
  tween(0.7, (k) => {
    o.position.y = y0 - 1.0 * k * k;
    o.rotation.z = 0.9 * k;
  }).then(() => hideObj(o));
  doorDepot.userData.led.material = glow(0x30ff70, 3);
  say(M.barOk, 5000);
  setObjective(objectiveNow());
});
R('door_depot', (o) => {
  if (o.userData.opened) return say(M.doorAlready);
  if (!State.barDone) {
    SND.play('locked');
    return say(M.barNeed);
  }
  openInner(o);
});
R('key_ctrl', (o) => {
  State.keyCtrl = true;
  hideObj(o);
  SND.play('key');
  renderInv();
  say(M.keyCtrlTaken);
  doorCtrl.userData.led.material = glow(0x30ff70, 3);
  setObjective(objectiveNow());
});
R('door_ctrl', (o) => {
  if (o.userData.opened) return say(M.doorAlready);
  if (!State.keyCtrl) {
    SND.play('locked');
    return say(M.ctrlLocked);
  }
  say(M.ctrlOpen);
  openInner(o);
});
R('breaker', (o) => {
  if (State.breaker) return say(M.breakerDone);
  State.breaker = true;
  SND.play('lever');
  setTimeout(() => {
    SND.play('success');
    SND.play('genstart');
  }, 350);
  const a = o.userData.arm,
    f = a.rotation.x;
  tween(0.6, (k) => {
    a.rotation.x = f + (-0.7 - f) * k;
  });
  o.userData.led.material = glow(0x30ff70, 3);
  doorExit3.userData.led.material = glow(0x30ff70, 3);
  doorExit3.userData.hint = Hn.door_exit3_unlocked;
  say(M.breakerOk, 7000);
  setObjective(objectiveNow());
});
R('note_gunkey', async (o) => {
  SND.play('paper');
  await focusOn(o);
  say(M.keyNote, 7000);
});
R('clue_zombies', async (o) => {
  SND.play('paper');
  await focusOn(o);
  say(fmt(M.census, { n: CONFIG.zombieTarget }), 9000);
});
R('key_03', (o) => {
  State.key3 = true;
  hideObj(o);
  SND.play('paper');
  renderInv();
  say(M.key3Taken);
  setObjective(TEXTS.objectives.needLocker);
});
[0, 1, 2, 4, 5].forEach((i) =>
  R('locker_x' + i, (o) => {
    const u = o.userData,
      pv = u.pivot;
    u.open = !u.open;
    SND.play('locker');
    say(u.open ? M.lockerX : M.nothing, 2600);
    const a0 = pv.rotation.y,
      a1 = u.open ? -1.9 : 0;
    tween(
      0.8,
      (k) => {
        pv.rotation.y = a0 + (a1 - a0) * easeOutBack(k);
      },
      (k) => k
    );
  })
); // casiers de l'armurerie : s'ouvrent et se referment
R('locker_gun', async (o) => {
  if (State.armed) return say(M.lockerOpen);
  if (!State.key3) {
    SND.play('locked');
    return say(M.lockerNoKey);
  }
  State.key3 = false;
  renderInv();
  SND.play('unlock');
  const pv = o.userData.pivot;
  tween(1.1, (k) => {
    pv.rotation.y = -1.9 * k;
  });
  o.userData.led.material = glow(0x30ff70, 3);
  setTimeout(() => {
    SND.play('locker');
    equipWeapon();
    say(M.lockerOpen, 7000);
    setObjective(objectiveNow());
  }, 900);
});
