/* LAST REFUGE · XM — Escape room « Sas 07 » · DEV MODE (outil de test).
   Fichier chargé dans l’ordre par escape-room.js : il partage la portée globale des autres fichiers. */
'use strict';
/* ═══════════════ DEV MODE ═══════════════
   Outil de test. Invisible/inerte tant qu’on ne l’utilise pas : il ne touche que State/rig quand on clique sur une action.
   Déverrouillé une fois (code), il le reste pour toute la session (mémoire + sessionStorage). */
const DEV = (function () {
  const CODE = 'popol',
    HINT = 'nom du chat';
  const S = { unlocked: false, open: false, paused: false, sec: { 1: true } };
  try {
    S.unlocked = sessionStorage.getItem('devUnlocked') === '1';
  } catch (e) {}
  // — Données par salle : objets à donner, mécanismes à débloquer (flags de State), porte de sortie —
  const GIVE = {
    1: {
      book: true,
      cutters: true,
      screwdriver: true,
      badge: true,
      battery: true,
      fuel: true,
      drill: true,
      cable: true,
      fz: 2
    },
    3: { card: true },
    5: { fuses: 2 },
    10: { crowbar: true, keyCtrl: true }
  };
  const MECH = {
    1: () => {
      Object.assign(State, {
        gen1: true,
        genBat: true,
        genFuel: true,
        genGround: true,
        valve: true,
        brkOk: true,
        fzIn: 2,
        fz: 0,
        cable: false,
        battery: false,
        fuel: false,
        termOk: true,
        badge: true,
        screwdriver: true,
        panelOpen: true,
        unlocked: true
      });
      const sw = scene.getObjectByName('switch_power');
      if (sw && !State.power && Actions.handlers.switch_power) Actions.handlers.switch_power(sw);
      else State.power = true;
    },
    2: { solved: true },
    3: { vaultUnlocked: true, safe: true, card: true },
    4: { power4: true, brk: [1, 1, 1, 1] },
    5: { power5: true, fuses: 2, fusesIn: 2 },
    6: { wareCode: true },
    10: { crowbar: true, keyCtrl: true, barDone: true, bureauOpen: true }, // objets du complexe (salle 11)
    11: { breaker: true }
  };
  const NAMES = [
    'Sas d’entrée',
    'Salle de contrôle',
    'Dortoir / chambre forte',
    'Distribution électrique',
    'Hangar principal',
    'Hangar sud',
    'Silo',
    'Salle de commandement',
    'Aire d’évacuation',
    'Bloc cellulaire',
    'Ligne de coupure',
    'Post-Apocalyptic City'
  ];
  // — Actions (chacune se termine par sync() : inventaire, objectif, panneau) —
  const sync = () => {
    try {
      renderInv();
      setObjective(objectiveNow());
    } catch (e) {}
    paint();
  };
  const apply = (o) => {
    if (typeof o === 'function') o();
    else Object.assign(State, o);
  };
  const give = (r) => {
    if (GIVE[r]) Object.assign(State, GIVE[r]);
  };
  const mech = (r) => {
    if (MECH[r]) apply(MECH[r]);
  };
  const openDoor = (r) => {
    const wall = WALLS[r - 1];
    if (!wall) return;
    const D = DOORS.find((d) => d.z === wall[0]);
    if (!D) return;
    const o = scene.getObjectByName(D.id);
    if (o && !State[D.flag]) {
      State[D.flag] = true;
      SND.play('door');
      try {
        openDoorAnim(o, 1.6);
      } catch (e) {}
    } else State[D.flag] = true;
  };
  const tp = (r) => {
    if (State.focus) {
      State.focus = null;
      State.releasing = false;
      genHide();
      document.getElementById('back').style.display = 'none';
    }
    if (r === 12) {
      MapScenes.enter('city');
      return;
    }
    MapScenes.leave();
    rig.pos.set(0, 1.6, CONFIG.roomZ[r - 1]);
    rig.vy = 0;
    rig.yaw = 0;
    rig.pitch = 0;
    State.room = r;
    sync();
  };
  const complete = (r) => {
    give(r);
    mech(r);
    openDoor(r);
  };
  const A = {
    tp,
    give: (r) => {
      give(r);
      sync();
    },
    mech: (r) => {
      mech(r);
      sync();
    },
    done: (r) => {
      complete(r);
      sync();
    },
    skip: () => {
      const r = State.room;
      complete(r);
      if (r < 12) tp(r + 1);
      else sync();
    },
    prev: () => tp(Math.max(1, State.room - 1)),
    auto: () => {
      complete(State.room);
      sync();
      say('DEV : salle ' + State.room + ' complétée automatiquement.', 3500);
    },
    allRooms: () => {
      for (let r = 1; r <= 12; r++) complete(r);
      tp(12);
      say('DEV : toutes les salles validées.', 3500);
    },
    heal: () => {
      State.hp = 100;
      State.ammo = Math.max(State.ammo || 0, 60);
      hud();
      sync();
    }
  };
  // — Interface —
  const css = document.createElement('style');
  css.textContent = `
  #devb{position:fixed;left:50%;bottom:2px;translate:-50% 0;z-index:40;font:600 10px/12px var(--stencil);letter-spacing:.2em;color:#8d907f;background:#0000;border:0;padding:1px 8px;opacity:.28;cursor:pointer;pointer-events:auto}
  #devb:hover,#devb.on{opacity:.9;color:var(--bloodb)}
  #devc{position:fixed;left:50%;top:50%;translate:-50% -50%;z-index:60;width:min(300px,86vw);padding:16px;display:none;background:linear-gradient(180deg,#1b1d19,#0a0b09);border:2px solid #3a3326;box-shadow:0 12px 40px #000c;font-family:var(--stencil);color:var(--bone)}
  #devc.on{display:block}#devc h5{margin:0 0 4px;letter-spacing:.2em;font-size:16px}#devc p{margin:0 0 8px;font:400 14px 'Special Elite',monospace;color:#b8bba6}
  #devc input{width:100%;box-sizing:border-box;padding:8px;font:600 18px var(--stencil);background:#050605;color:var(--bone);border:1px solid #4a4536;letter-spacing:.2em}
  #devc .r{display:flex;gap:6px;margin-top:8px}#devc .r button{flex:1;padding:8px}#devc.bad input{border-color:var(--bloodb);animation:devsh .3s}
  @keyframes devsh{25%{translate:-6px 0}75%{translate:6px 0}}
  #devp{position:fixed;left:8px;top:60px;bottom:24px;width:min(300px,86vw);z-index:45;display:none;flex-direction:column;background:linear-gradient(180deg,#1b1d19f2,#0a0b09f2);border:2px solid #3a3326;box-shadow:0 8px 30px #000c;font-family:var(--stencil);color:var(--bone);pointer-events:auto}
  #devp.on{display:flex}#devp header{display:flex;align-items:center;justify-content:space-between;padding:6px 10px;border-bottom:3px solid #b48a22}
  #devp header b{letter-spacing:.2em;font-size:15px}#devp header span{font:400 13px 'Special Elite',monospace;color:#b8bba6}
  #devp .body{overflow:auto;padding:8px;flex:1}#devp h6{margin:8px 0 4px;font-size:12px;letter-spacing:.2em;color:var(--rust)}
  #devp .g{display:grid;grid-template-columns:1fr 1fr;gap:5px}#devp button{padding:7px 4px;font-size:13px}
  #devp .acc>button.h{width:100%;text-align:left;margin-top:4px;display:flex;justify-content:space-between;background:#14150f}
  #devp .acc.cur>button.h{border-color:#b48a22;color:#ffd070}#devp .acc .c{display:none;padding:6px 0 2px}#devp .acc.open .c{display:grid}
  #devp .full{grid-column:1/3;background:linear-gradient(180deg,#3a1a14,#1b0d0a)}`;
  (document.head || document.body).appendChild(css);
  const b = document.getElementById('devmb') || document.createElement('button'); // bouton placé dans le menu Options
  const c = document.createElement('div');
  c.id = 'devc';
  c.innerHTML =
    '<h5>DEV MODE</h5><p>Indice : ' +
    HINT +
    '</p><input id="devi" type="text" autocomplete="off" spellcheck="false" aria-label="Code"><div class="r"><button id="devok">Valider</button><button id="devno">Annuler</button></div>';
  document.body.appendChild(c);
  const p = document.createElement('div');
  p.id = 'devp';
  document.body.appendChild(p);
  // les saisies/clics sur ces fenêtres ne doivent jamais atteindre le jeu (déplacement, regard, raccourcis)
  [c, p].forEach((e) =>
    ['pointerdown', 'mousedown', 'touchstart', 'wheel', 'click', 'keydown', 'keyup'].forEach((ev) =>
      e.addEventListener(ev, (x) => x.stopPropagation(), { passive: true })
    )
  );
  /* Pause : tant que le panneau ou la saisie du code est ouvert, le temps, les infectés et les
     contrôles sont figés (la scène reste affichée pour voir l’effet des téléportations). */
  function updatePause() {
    const want = (S.open && S.unlocked) || c.classList.contains('on');
    if (want === S.paused) return;
    S.paused = want;
    if (want) {
      modalOpen = true;
      keysDown.clear();
      mouseAim = padAim = false;
      if (document.pointerLockElement) document.exitPointerLock();
      SND.pause();
    } else {
      modalOpen = document.getElementById('menu').classList.contains('on');
      if (!modalOpen) SND.resume();
    }
  }
  function paint() {
    updatePause();
    b.classList.toggle('on', S.open);
    b.textContent = S.unlocked
      ? S.open
        ? 'Dev Mode : fermer le panneau'
        : 'Dev Mode : ouvrir le panneau'
      : 'Dev Mode (code requis)';
    p.classList.toggle('on', S.open && S.unlocked);
    if (!(S.open && S.unlocked)) return;
    const sc = p.querySelector('.body') ? p.querySelector('.body').scrollTop : 0;
    let h =
      '<header><b>DEV MODE</b><span>salle ' +
      State.room +
      '</span><button data-a="close" style="padding:2px 8px">×</button></header><div class="body"><h6>RACCOURCIS</h6><div class="g">' +
      '<button class="full" data-a="auto">⚡ AUTO COMPLETE LEVEL</button><button data-a="skip">Salle suivante ▶</button><button data-a="prev">◀ Salle précédente</button>' +
      '<button data-a="allRooms">Tout valider + fin</button><button data-a="heal">Soin + munitions</button></div><h6>SALLES</h6>';
    for (let r = 1; r <= 12; r++) {
      const open = S.sec[r],
        cur = State.room === r;
      h +=
        '<div class="acc' +
        (open ? ' open' : '') +
        (cur ? ' cur' : '') +
        '"><button class="h" data-a="sec" data-r="' +
        r +
        '"><span>' +
        r +
        ' · ' +
        NAMES[r - 1] +
        '</span><span>' +
        (open ? '−' : '+') +
        '</span></button><div class="c g">' +
        '<button data-a="tp" data-r="' +
        r +
        '">Téléporter</button><button data-a="give" data-r="' +
        r +
        '">Donner objets</button><button data-a="mech" data-r="' +
        r +
        '">Débloquer mécanismes</button><button data-a="door" data-r="' +
        r +
        '">Ouvrir la porte</button><button class="full" data-a="done" data-r="' +
        r +
        '">✔ Compléter cette salle</button></div></div>';
    }
    p.innerHTML = h + '</div>';
    p.querySelector('.body').scrollTop = sc;
  }
  p.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    const a = t.dataset.a,
      r = +t.dataset.r;
    if (a === 'close') {
      S.open = false;
      paint();
    } else if (a === 'sec') {
      S.sec[r] = !S.sec[r];
      paint();
    } else if (a === 'door') {
      openDoor(r);
      sync();
    } else if (A[a]) A[a](r);
  });
  const tryCode = () => {
    const i = document.getElementById('devi');
    if (i.value.trim().toLowerCase() === CODE) {
      S.unlocked = true;
      S.open = true;
      try {
        sessionStorage.setItem('devUnlocked', '1');
      } catch (e) {}
      c.classList.remove('on', 'bad');
      i.value = '';
      SND.play('success');
      paint();
    } else {
      c.classList.remove('bad');
      void c.offsetWidth;
      c.classList.add('bad');
      SND.play('error');
      i.select();
    }
  };
  b.addEventListener('click', () => {
    const mo = document.getElementById('menuok');
    if (mo) mo.click();
    if (S.unlocked) {
      S.open = !S.open;
      paint();
    } else {
      c.classList.add('on');
      updatePause();
      setTimeout(() => document.getElementById('devi').focus(), 30);
    }
  });
  document.getElementById('devok').addEventListener('click', tryCode);
  document.getElementById('devno').addEventListener('click', () => {
    c.classList.remove('on', 'bad');
    updatePause();
  });
  document.getElementById('devi').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') tryCode();
    else if (e.key === 'Escape') {
      c.classList.remove('on', 'bad');
      updatePause();
    }
  });
  // Échap ferme le panneau du dev mode (et relance la partie) au lieu d’ouvrir le menu
  addEventListener('keydown', (e) => {
    if (e.code !== 'Escape' || !S.open || !S.unlocked || c.classList.contains('on')) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    S.open = false;
    paint();
  }, true);
  {
    const iv = setInterval(() => {
      if (S.open && S.unlocked) paint();
    }, 1500);
    if (iv && iv.unref) iv.unref();
  } // garde le panneau synchronisé avec la salle courante
  return { S, A, complete, paused: () => S.paused };
})();
{
  const seen = new Set();
  scene.traverse((o) => {
    (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
      if (!m || seen.has(m) || !m.isMeshStandardMaterial) return;
      seen.add(m);
      if (m.metalness > 0.5) m.roughness = Math.max(m.roughness, 0.6);
    });
  });
} // moins de reflets éblouissants sur les métaux
window.prepareSas07 = async (progress) => {
  modalOpen = true;
  progress('Préparation des matériaux et du rendu 3D…');
  await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));
  applyRig(0);
  avatarFrame(0, 0);
  await renderer.compileAsync(scene, camera);
  await renderer.compileAsync(FP.scene, FP.camera);
  // toutes les textures du bunker envoyées à la carte graphique maintenant, pas en entrant dans chaque salle
  const textures = new Set();
  scene.traverse((object) => {
    for (const material of [].concat(object.material || []))
      for (const value of Object.values(material)) if (value && value.isTexture) textures.add(value);
  });
  let sent = 0;
  for (const texture of textures) {
    renderer.initTexture(texture);
    if (++sent % 12 === 0) {
      progress('Envoi des textures à la carte graphique…', sent, textures.size);
      await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));
    }
  }
  progress('Chargement des textures visibles…');
  await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));
  renderGame();
};
window.startSas07 = () => {
  modalOpen = false;
  loop();
};

/* API publique pour étendre le prototype depuis la console ou votre propre code */
window.EscapeRoom = {
  addVent,
  LOW,
  Combat: {
    GH,
    EXTRA_COLLIDERS,
    fire,
    reload,
    zRoots,
    spawnZombie,
    killZombie,
    combatFrame,
    equipWeapon,
    rig,
    AV,
    hud,
    roomOf,
    blocked
  },
  THREE,
  scene,
  camera,
  State,
  Actions,
  interactive,
  say,
  setObjective,
  tween,
  focusOn,
  release,
  passDoor,
  toggleFlash,
  mats,
  Surface,
  pbr,
  CONFIG,
  CONTROLS,
  SOUND,
  TEXTS,
  SND
};
