/* LAST REFUGE · XM — Escape room « Sas 07 » · Personnage jouable (créé avec la fiche d’écrou 3D).
   Fichier chargé dans l’ordre par escape-room.js : il partage la portée globale des autres fichiers. */
'use strict';
/* ════════════════════════════════════════════════════════════════
   7e. PERSONNAGE JOUABLE (créé avec « createur-personnage-3d.html »)
   • Vue 3e personne par défaut ; touche V (ou bouton) pour alterner avec la vue 1re personne.
   Réglages : AV.dist (distance caméra), AV.shoulder (décalage d’épaule), AV.tp (true = 3e personne).
   ════════════════════════════════════════════════════════════════ */
const FP = (() => {
  const scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera(CONFIG.fov, 1, 0.05, 10),
    model = new THREE.Group(),
    light = new THREE.DirectionalLight(0xffe6c6, 1.5);
  scene.add(model, new THREE.HemisphereLight(0xdce9ec, 0x40382c, 1.3), light);
  light.position.set(-1, 2, 1);
  return {
    scene,
    camera,
    model,
    kick: 0,
    melee: false,
    reducedMotion: typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null
  };
})();
const scopeOverlay = document.createElement('div');
scopeOverlay.id = 'scope-overlay';
scopeOverlay.setAttribute('aria-hidden', 'true');
scopeOverlay.innerHTML = '<div class="scope-lens"><i></i><b></b></div>';
document.body.appendChild(scopeOverlay);
function firstPersonFire(melee) {
  if (!AV.tp && !(FP.reducedMotion && FP.reducedMotion.matches)) {
    FP.kick = 1;
    FP.melee = melee;
  }
}
function setFirstPersonAvatar(avatar) {
  FP.model.clear();
  FP.kick = 0;
  const parts = avatar.userData.getFirstPersonParts();
  if (!parts.length) return;
  const body = new THREE.Group();
  body.position.set(0.23, -1.55 * avatar.scale.y, -0.05);
  body.rotation.y = Math.PI;
  body.scale.copy(avatar.scale);
  parts.forEach((part, i) => {
    if (i < 2 || AV.heldItem === 'weapon') body.add(part.clone());
  });
  FP.model.add(body);
}
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
function updatePortrait(avatar, state) {
  const canvas = document.getElementById('player-portrait');
  const name = state.name;
  const label = document.getElementById('player-name');
  label.textContent = name.trim() || 'DÉTENU';
  label.style.fontFamily = CL.D.NFONTS[state.nameFont][1];
  label.style.color = CL.D.NCOL[state.nameColor];
  label.style.fontSize = [12, 14, 16, 18][state.nameSize] + 'px';
  label.dataset.style = String(state.nameStyle);
  canvas.setAttribute('aria-label', 'Portrait de ' + (name.trim() || 'votre détenu'));
  const portraitScene = new THREE.Scene();
  portraitScene.background = new THREE.Color(0x252a22);
  portraitScene.add(new THREE.HemisphereLight(0xe4e9dc, 0x464039, 1.8));
  const light = new THREE.DirectionalLight(0xffe6c6, 2);
  light.position.set(1, 3, 4);
  portraitScene.add(light);
  const model = avatar.clone();
  model.position.set(0, 0, 0);
  model.rotation.set(0, 0, 0);
  model.visible = true;
  portraitScene.add(model);
  const scale = model.scale.y;
  const portraitCamera = new THREE.PerspectiveCamera(32, 1, 0.01, 10 * scale);
  portraitCamera.position.set(0, 1.62 * scale, 0.9 * scale);
  portraitCamera.lookAt(0, 1.58 * scale, 0);
  const target = new THREE.WebGLRenderTarget(canvas.width, canvas.height);
  target.texture.colorSpace = THREE.SRGBColorSpace;
  const previous = renderer.getRenderTarget();
  try {
    renderer.setRenderTarget(target);
    renderer.render(portraitScene, portraitCamera);
    const pixels = new Uint8Array(canvas.width * canvas.height * 4);
    renderer.readRenderTargetPixels(target, 0, 0, canvas.width, canvas.height, pixels);
    const ctx = canvas.getContext('2d');
    const image = ctx.createImageData(canvas.width, canvas.height);
    for (let y = 0; y < canvas.height; y++) {
      const source = (canvas.height - 1 - y) * canvas.width * 4;
      image.data.set(pixels.subarray(source, source + canvas.width * 4), y * canvas.width * 4);
    }
    ctx.putImageData(image, 0, 0);
  } finally {
    renderer.setRenderTarget(previous);
    target.dispose();
  }
}
function loadAvatar(json) {
  try {
    let st = CL.sanitize(json || {});
    if (State.armed && !st.weapon) st = CL.sanitize({ ...st, weapon: 2 });
    FP.model.clear();
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
    o.userData.setHeldItem(AV.heldItem);
    setFirstPersonAvatar(o);
    if (State.armed) {
      AV.stats = CL.weaponStats(st);
      State.ammo = Math.min(State.ammo, AV.stats.mag);
      rebalanceZombies();
    }
    try {
      updatePortrait(o, st);
    } catch (error) {
      console.error('Portrait du personnage impossible à afficher :', error);
    }
    hud();
    return true;
  } catch (e) {
    console.warn('Personnage :', e);
    AV.obj = null;
    return false;
  }
}
function camCollide(x, z) {
  if (MapScenes.active && rig.pos.z < -900) return MapScenes.walkHeight(x, z, MapScenes.height()) === null;
  return blocked(x, z);
}
function avatarFrame(dt, t) {
  const o = AV.obj;
  const fp = !!o && !AV.tp && !State.focus && !State.doorExit && FP.model.children.length > 0;
  firstPersonPass.enabled = fp && !(hasMagnifyingOptic() && aimBlend > 0.6);
  if (fp) {
    if (FP.camera.fov !== rig.fov || FP.camera.aspect !== camera.aspect) {
      FP.camera.fov = rig.fov;
      FP.camera.aspect = camera.aspect;
      FP.camera.updateProjectionMatrix();
    }
    FP.kick = Math.max(0, FP.kick - dt * (FP.melee ? 3.5 : 8));
    const motion = FP.reducedMotion && FP.reducedMotion.matches ? 0 : 1,
      walk = rig.moving ? Math.sin(walkD * 4.2) : 0;
    const body = FP.model.children[0],
      weapon = body.children[2];
    body.position.x = weapon ? THREE.MathUtils.lerp(0.23, weapon.position.x * body.scale.x, aimBlend) : 0.23;
    body.position.y = THREE.MathUtils.lerp(-1.55, -1.43, aimBlend) * body.scale.y;
    FP.model.position.set(walk * 0.008 * motion, Math.abs(walk) * 0.006 * motion, FP.kick * 0.06);
    FP.model.rotation.set(-FP.kick * (FP.melee ? 0.35 : 0.1), 0, FP.kick * (FP.melee ? 0.18 : 0.025));
  }
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
    const hy = rig.pos.y + 0.18; // point visé : tête, légèrement à droite
    const dtc = Math.min(0.1, Math.max(0, t - (AV.lt || t)));
    AV.lt = t;
    const rh = MapScenes.active ? Infinity :
      ([0, 3.4, 3.4, 3.4, 3.4, 6.5, 4.8, 10, 9.6, 8.6, 4.6, 9.6, 8.6][roomOf(rig.pos.z)] || 3.4),
      fl = rig.pos.y - 1.6 + rig.dip;
    const onMap = MapScenes.active && rig.pos.z < -900;
    const pathBlocked = onMap ? MapScenes.cameraWallBlocked : camCollide;
    let k = 1;
    for (let step = 1; step <= 12; step++) {
      const part = step / 12,
        ex = rig.pos.x + (cy * AV.shoulder + sy * cp * AV.dist) * part,
        ez = rig.pos.z + (-sy * AV.shoulder + cy * cp * AV.dist) * part;
      if (
        pathBlocked(ex, ez) ||
        pathBlocked(ex + cy * 0.2, ez - sy * 0.2) ||
        pathBlocked(ex - cy * 0.2, ez + sy * 0.2)
      ) {
        k = Math.max(0, part - 0.1);
        break;
      }
    }
    if (onMap) {
      for (; k > 0; k = Math.max(0, k - 0.05)) {
        const x = rig.pos.x + (cy * AV.shoulder + sy * cp * AV.dist) * k,
          z = rig.pos.z + (-sy * AV.shoulder + cy * cp * AV.dist) * k;
        if (!camCollide(x, z) && !camCollide(x + cy * 0.2, z - sy * 0.2) &&
          !camCollide(x - cy * 0.2, z + sy * 0.2)) break;
      }
      const start = rig.pos.clone(),
        end = new THREE.Vector3(
          rig.pos.x + (cy * AV.shoulder + sy * cp * AV.dist) * k,
          hy - sp * AV.dist * k,
          rig.pos.z + (-sy * AV.shoulder + cy * cp * AV.dist) * k
        ),
        direction = end.clone().sub(start),
        distance = direction.length();
      if (distance > 0) {
        direction.normalize();
        const rayStartK = k;
        for (const side of [-0.2, 0, 0.2]) {
          const origin = start.clone().add(new THREE.Vector3(cy * side, 0, -sy * side));
          const hit = MapScenes.obstruction(new THREE.Ray(origin, direction), distance);
          if (hit) k = Math.min(k, rayStartK * Math.max(0, (hit.distance - 0.2) / distance));
        }
      }
    }
    AV.k = AV.k === undefined ? k : k < AV.k ? k : AV.k + (k - AV.k) * Math.min(1, dtc * 3); // se rapproche vite d'un mur, revient doucement
    const d = AV.dist * AV.k,
      hx = rig.pos.x + cy * AV.shoulder * AV.k,
      hz = rig.pos.z - sy * AV.shoulder * AV.k,
      ceiling = MapScenes.active ? MapScenes.cameraCeiling(hx + sy * cp * d, hz + cy * cp * d) : rh;
    camera.position.set(
      hx + sy * cp * d,
      Math.min(Math.max(hy - sp * d, fl + 0.35), ceiling - 0.25),
      hz + cy * cp * d
    );
    if (hasMagnifyingOptic() && aimBlend > 0)
      camera.position.lerp(new THREE.Vector3(rig.pos.x, rig.pos.y, rig.pos.z), aimBlend);
    AV.vis = AV.k > 0.4 && !(hasMagnifyingOptic() && aimBlend > 0.6);
    camera.rotation.set(rig.pitch, rig.yaw, 0);
  } else {
    AV.vis = true;
    camera.position.set(rig.pos.x, rig.pos.y + (rig.bob || 0) + Math.sin(t * 1.3) * 0.004, rig.pos.z);
    camera.rotation.set(rig.pitch, rig.yaw, 0);
  }
  const scoped = hasMagnifyingOptic();
  scopeOverlay.style.opacity = scoped ? String(aimBlend) : '0';
  const zoom = scoped ? (AV.state.wOptic === 4 ? 0.72 : 0.55) : 0.3;
  const fov = rig.fov * (1 - zoom * aimBlend);
  if (Math.abs(camera.fov - fov) > 0.01) {
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }
}
// Chargement du personnage créé et commande de changement de vue
{
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
    if (o) {
      keysDown.clear();
      mouseAim = padAim = false;
      SND.pause();
      viewLabel();
    } else SND.resume();
  };
  $m('menub').onclick = () => setMenu(true);
  $m('menux').onclick = () => setMenu(false);
  $m('menuok').onclick = () => setMenu(false);
  mn.addEventListener('pointerdown', (e) => {
    if (e.target === mn) setMenu(false);
  });
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
