/* LAST REFUGE · XM — Escape room « Sas 07 » · Personnage jouable (créé avec la fiche d’écrou 3D).
   Fichier chargé dans l’ordre par escape-room.js : il partage la portée globale des autres fichiers. */
'use strict';
/* ════════════════════════════════════════════════════════════════
   7e. PERSONNAGE JOUABLE (créé avec « createur-personnage-3d.html »)
   • Vue 3e personne par défaut ; touche V (ou bouton) pour alterner avec la vue 1re personne.
   • Bouton « 👤 Personnage » : collez le JSON exporté par le créateur (ou « Mon navigateur » pour reprendre la sauvegarde locale).
   Réglages : AV.dist (distance caméra), AV.shoulder (décalage d’épaule), AV.tp (true = 3e personne).
   ════════════════════════════════════════════════════════════════ */
let _env = null;
function charEnv() {
  if (_env) return _env;
  try {
    const pm = new THREE.PMREMGenerator(renderer);
    _env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    pm.dispose();
  } catch (e) {}
  return _env;
} // reflets doux uniquement sur le personnage (la salle reste sombre)
function loadAvatar(json) {
  try {
    const st = CL.sanitize(json || {});
    if (AV.obj) {
      scene.remove(AV.obj);
      try {
        AV.obj.userData.dispose && AV.obj.userData.dispose();
      } catch (e) {}
    }
    const o = CL.buildCharacter(State.armed ? st : { ...st, weapon: 0 }); // l’arme n’apparaît qu’après le casier d’armes (salle finale)
    const env = charEnv();
    o.traverse((m) => {
      m.castShadow = false;
      m.raycast = () => {};
      m.frustumCulled = false;
      if (m.material && env)
        (Array.isArray(m.material) ? m.material : [m.material]).forEach((x) => {
          if (x.isMeshStandardMaterial) {
            x.envMap = env;
            x.envMapIntensity = 0.4;
          }
        });
    }); // pas d’ombre portée (la lampe est derrière lui) et jamais cliquable
    scene.add(o);
    AV.obj = o;
    AV.state = st;
    return true;
  } catch (e) {
    console.warn('Personnage :', e);
    AV.obj = null;
    return false;
  }
}
function camCollide(x, z) {
  return blocked(x, z);
}
function avatarFrame(dt, t) {
  const o = AV.obj;
  if (!o) return;
  const tp = AV.tp && !State.focus && !State.doorExit;
  o.visible = tp && AV.vis;
  if (!tp) return;
  const moving = !!rig.moving;
  AV.amt += ((moving ? 1 : 0) - AV.amt) * Math.min(1, dt * 10);
  o.position.set(rig.pos.x, rig.pos.y - 1.6 + rig.dip, rig.pos.z);
  o.rotation.y = rig.yaw + Math.PI;
  o.userData.setWalk && o.userData.setWalk(walkD * 4.2, AV.amt);
  o.userData.setPitch && o.userData.setPitch(-rig.pitch * 0.7);
  o.userData.update && o.userData.update(t);
}
function applyRig(t) {
  const o = AV.obj,
    tp = AV.tp && o && !State.focus && !State.doorExit;
  if (tp) {
    const sy = Math.sin(rig.yaw),
      cy = Math.cos(rig.yaw),
      cp = Math.cos(rig.pitch),
      sp = Math.sin(rig.pitch);
    const hx = rig.pos.x + cy * AV.shoulder,
      hz = rig.pos.z - sy * AV.shoulder,
      hy = rig.pos.y + 0.18; // point visé : tête, légèrement à droite
    const dtc = Math.min(0.1, Math.max(0, t - (AV.lt || t)));
    AV.lt = t;
    const rh = [0, 3.4, 3.4, 3.4, 3.4, 6.5, 4.8, 10, 9.6, 8.6, 4.6, 9.6, 8.6][roomOf(rig.pos.z)] || 3.4,
      fl = rig.pos.y - 1.6 + rig.dip;
    let k = 1;
    for (; k > 0.1; k -= 0.05) {
      const ex = hx + sy * cp * AV.dist * k,
        ez = hz + cy * cp * AV.dist * k;
      if (
        !camCollide(ex, ez) &&
        !camCollide(ex + cy * 0.25, ez - sy * 0.25) &&
        !camCollide(ex - cy * 0.25, ez + sy * 0.25)
      )
        break;
    } // recule seulement si la place est libre (marge de 25 cm)
    AV.k = AV.k === undefined ? k : k < AV.k ? k : AV.k + (k - AV.k) * Math.min(1, dtc * 3); // se rapproche vite d'un mur, revient doucement
    const d = AV.dist * AV.k;
    camera.position.set(
      hx + sy * cp * d,
      Math.min(Math.max(hy - sp * d, fl + 0.35), rh - 0.25),
      hz + cy * cp * d
    );
    AV.vis = AV.k > 0.4;
    camera.rotation.set(rig.pitch, rig.yaw, 0);
  } else {
    AV.vis = true;
    camera.position.set(rig.pos.x, rig.pos.y + (rig.bob || 0) + Math.sin(t * 1.3) * 0.004, rig.pos.z);
    camera.rotation.set(rig.pitch, rig.yaw, 0);
  }
  if (Math.abs(camera.fov - rig.fov) > 0.01) {
    camera.fov = rig.fov;
    camera.updateProjectionMatrix();
  }
}
// interface : bouton + fenêtre de chargement du personnage
{
  const cm = document.getElementById('charm'),
    tx = document.getElementById('chj'),
    ms = document.getElementById('chmsg');
  const open = () => {
      cm.classList.add('on');
      modalOpen = true;
      ms.textContent = '';
    },
    close = () => {
      cm.classList.remove('on');
      modalOpen = false;
    };
  const apply = (j, label) => {
    if (loadAvatar(j)) {
      try {
        localStorage.setItem(AV.key, JSON.stringify(AV.state));
      } catch (e) {}
      ms.textContent = label;
      SND.play('success');
    } else ms.textContent = 'Impossible de construire ce personnage.';
  };
  document.getElementById('chr').onclick = open;
  document.getElementById('chno').onclick = close;
  document.getElementById('chok').onclick = () => {
    try {
      apply(JSON.parse(tx.value), 'Personnage chargé.');
    } catch (e) {
      ms.textContent = 'JSON invalide : ' + e.message;
    }
  };
  document.getElementById('chdef').onclick = () => {
    apply({}, 'Personnage par défaut.');
  };
  document.getElementById('chls').onclick = () => {
    let j = null;
    try {
      j = JSON.parse(localStorage.getItem(AV.key) || 'null');
    } catch (e) {}
    if (j) apply(j, 'Personnage du navigateur chargé.');
    else ms.textContent = 'Aucune sauvegarde trouvée dans ce navigateur : collez le JSON à la place.';
  };
  document.getElementById('chv').onclick = () => {
    AV.tp = !AV.tp;
    ms.textContent = AV.tp ? 'Vue 3e personne.' : 'Vue 1re personne.';
  };
  addEventListener('keydown', (e) => {
    if (CONTROLS.keys.view.includes(e.code) && !e.repeat && !modalOpen) {
      AV.tp = !AV.tp;
      say(AV.tp ? TEXTS.msg.viewTP : TEXTS.msg.viewFP, 1800);
    }
  });
  let sv = null;
  try {
    sv = JSON.parse(localStorage.getItem(AV.key) || 'null');
  } catch (e) {}
  if (!loadAvatar(sv || {})) AV.tp = false;
}

// ── menu (☰ ou Échap) : jeu, volumes, rappel des contrôles. Liste des contrôles modifiable ci-dessous ──
{
  const mn = document.getElementById('menu'),
    $m = (i) => document.getElementById(i);
  const MENU_CONTROLS = [
    ['Regarder', ['Clic + glisser']],
    ['Marcher', ['ZQSD']],
    ['Tourner', ['←', '→']],
    ['Courir', ['Maj']],
    ['Interagir', ['Clic']],
    ['Prendre un objet', ['E']],
    ['Lampe torche', ['F']],
    ['Carte du bunker', ['M']],
    ['Carnet de mission', ['O']],
    ['Vue 1re / 3e personne', ['V']],
    ['Tirer', ['Espace']],
    ['Recharger', ['R']],
    ['Quitter le zoom', ['Échap']],
    ['Couper le son', ['M']],
    ['Ouvrir ce menu', ['Échap']]
  ];
  $m('help').innerHTML = MENU_CONTROLS.map(
    ([a, k]) => `<li><span>${a}</span><span>${k.map((x) => '<kbd>' + x + '</kbd>').join('')}</span></li>`
  ).join('');
  {
    const _s = sndLabel;
    sndLabel = function () {
      _s();
      const b = $m('snd');
      if (b) b.dataset.on = SND.on ? 1 : 0;
    };
  }
  {
    const _f = flashLabel;
    flashLabel = function () {
      _f();
      const b = $m('fl');
      if (b) b.dataset.on = flashOn ? 1 : 0;
    };
  }
  sndLabel();
  flashLabel();
  const viewLabel = () => {
    $m('vw').textContent = AV.tp ? 'Vue : 3e personne' : 'Vue : 1re personne';
  };
  $m('vw').onclick = () => {
    AV.tp = !AV.tp;
    viewLabel();
  };
  const slider = (id, key) => {
    const el = $m(id),
      out = $m(id + 'o'),
      paint = () => {
        el.style.setProperty('--v', el.value + '%');
        out.textContent = el.value + ' %';
      };
    el.value = Math.round(SOUND[key] * 100);
    paint();
    el.oninput = () => {
      SOUND[key] = el.value / 100;
      paint();
    };
  };
  slider('vmas', 'master');
  slider('vmus', 'music');
  slider('vsfx', 'sfx');
  const setMenu = (o) => {
    if (o && modalOpen && !mn.classList.contains('on')) return;
    mn.classList.toggle('on', o);
    modalOpen = o;
    if (o) viewLabel();
  };
  $m('menub').onclick = () => setMenu(true);
  $m('menux').onclick = () => setMenu(false);
  $m('menuok').onclick = () => setMenu(false);
  mn.addEventListener('pointerdown', (e) => {
    if (e.target === mn) setMenu(false);
  });
  {
    const prev = $m('chr').onclick;
    $m('chr').onclick = (e) => {
      setMenu(false);
      prev && prev.call(e.currentTarget, e);
    };
  }
  addEventListener('keydown', (e) => {
    if (
      e.code === 'Escape' &&
      !State.focus &&
      !State.doorExit &&
      (mn.classList.contains('on') || !modalOpen)
    ) {
      setMenu(!mn.classList.contains('on'));
    }
  });
}

setObjective(TEXTS.objectives.start);
say(TEXTS.intro, 7500);
