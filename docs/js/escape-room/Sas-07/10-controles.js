/* LAST REFUGE · XM — Escape room « Sas 07 » · Contrôles : regard, marche et collisions.
   Fichier chargé dans l’ordre par escape-room.js : il partage la portée globale des autres fichiers. */
'use strict';
/* ════════════════════════════════════════════════════════════════
   7c. CONTRÔLES : regard (souris/tactile/clavier) + marche avec collisions.
   Tout se règle dans CONTROLS (haut du fichier) : touches, vitesses, sensibilité, rayon du joueur…
   ════════════════════════════════════════════════════════════════ */
let drag = null;
const el = renderer.domElement;
let mouseAim = false,
  padAim = false,
  aimBlend = 0,
  aimedMouseShot = false;
function canAim() {
  return !!(State.armed && AV.stats && AV.stats.mag && !State.focus && !modalOpen && !rig.locked && !State.doorExit);
}
function isAiming() {
  return canAim() && (mouseAim || padAim);
}
function updateAim(dt) {
  if (!canAim()) mouseAim = padAim = false;
  const target = isAiming() ? 1 : 0;
  aimBlend += (target - aimBlend) * Math.min(1, dt * 12);
}
el.addEventListener('mousedown', (e) => {
  if (e.button === 2) {
    e.preventDefault();
    e.stopImmediatePropagation();
    mouseAim = canAim();
  } else if (e.button === 0 && isAiming()) {
    e.preventDefault();
    e.stopImmediatePropagation();
    aimedMouseShot = true;
    drag = null;
    fire();
  }
}, true);
el.addEventListener('contextmenu', (e) => e.preventDefault());
el.addEventListener('pointerup', (e) => {
  if (e.button === 0 && aimedMouseShot) e.stopImmediatePropagation();
}, true);
addEventListener('mouseup', (e) => {
  if (e.button === 2) mouseAim = false;
  if (e.button === 0) {
    if (aimedMouseShot) drag = null;
    aimedMouseShot = false;
  }
}, true);
addEventListener('pointercancel', () => { mouseAim = aimedMouseShot = false; drag = null; });
addEventListener('blur', () => { mouseAim = padAim = aimedMouseShot = false; });
el.addEventListener('pointerdown', (e) => {
  if (e.button !== 0) return;
  drag = { x: e.clientX, y: e.clientY, moved: false };
  el.setPointerCapture(e.pointerId);
});
el.addEventListener('pointermove', (e) => {
  const L = CONTROLS.look;
  if (drag) {
    const dx = e.clientX - drag.x,
      dy = e.clientY - drag.y;
    if (Math.hypot(dx, dy) > 5) drag.moved = true;
    if (drag.moved && !rig.locked && !State.focus && !modalOpen) {
      rig.vy = dx * 0.0035 * L.sensitivity * (TOUCH ? CONFIG.device.lookSpeed : 1);
      rig.vp = dy * 0.003 * L.sensitivity * (TOUCH ? CONFIG.device.lookSpeed : 1) * (L.invertY ? -1 : 1);
      rig.yaw += rig.vy;
      rig.pitch = THREE.MathUtils.clamp(rig.pitch + rig.vp, -L.pitchLimit, L.pitchLimit);
      drag.x = e.clientX;
      drag.y = e.clientY;
    }
  } else hover(e);
});
el.addEventListener('pointerup', (e) => {
  if (e.button !== 0) return;
  if (drag && !drag.moved) click(e);
  drag = null;
});

const keysDown = new Set(),
  down = (n) => CONTROLS.keys[n].some((c) => keysDown.has(c)); // touches testées par « code physique » (indépendant AZERTY/QWERTY)
addEventListener('keydown', (e) => {
  keysDown.add(e.code);
  const K = CONTROLS.keys;
  if (K.exitZoom.includes(e.code)) release(true);
  if (K.mute.includes(e.code) && !e.repeat) SND.toggle();
  if (K.flashlight.includes(e.code) && !e.repeat && !modalOpen) toggleFlash();
  if (K.take.includes(e.code) && !e.repeat && !modalOpen && !State.focus && !rig.locked && !State.doorExit)
    takeNearest();
  if (K.fire.includes(e.code) && !modalOpen) fire();
  if (K.reload.includes(e.code) && !e.repeat && !modalOpen) reload();
  if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault();
});
addEventListener('keyup', (e) => keysDown.delete(e.code));
addEventListener('blur', () => keysDown.clear());
document.getElementById('back').onclick = () => release(true);
// ── contrôles tactiles : joystick de marche + boutons (le regard se fait en glissant sur l’écran)
if (TOUCH) {
  document.body.classList.add('touch');
  const ts = document.getElementById('touchui');
  ts.style.setProperty('--stick', CONFIG.device.stickSize + 'px');
  ts.style.setProperty('--btn', CONFIG.device.buttonSize + 'px');
  const joy = document.getElementById('joy'),
    knob = joy.firstElementChild,
    K = CONTROLS.keys,
    vk = [K.forward[0], K.back[0], K.left[0], K.right[0]];
  let jid = null;
  const stick = (e) => {
    const r = joy.getBoundingClientRect(),
      R = r.width / 2;
    let dx = e.clientX - (r.left + R),
      dy = e.clientY - (r.top + R);
    const m = Math.hypot(dx, dy);
    if (m > R) {
      dx *= R / m;
      dy *= R / m;
    }
    knob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    vk.forEach((c) => keysDown.delete(c));
    const t = R * 0.28;
    if (dy < -t) keysDown.add(vk[0]);
    if (dy > t) keysDown.add(vk[1]);
    if (dx < -t) keysDown.add(vk[2]);
    if (dx > t) keysDown.add(vk[3]);
  };
  const end = () => {
    jid = null;
    knob.style.transform = '';
    vk.forEach((c) => keysDown.delete(c));
  };
  joy.addEventListener('pointerdown', (e) => {
    jid = e.pointerId;
    joy.setPointerCapture(jid);
    stick(e);
    e.preventDefault();
  });
  joy.addEventListener('pointermove', (e) => {
    if (e.pointerId === jid) stick(e);
  });
  ['pointerup', 'pointercancel'].forEach((n) => joy.addEventListener(n, end));
  document.querySelectorAll('#tbtns button').forEach((b) =>
    b.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      const a = b.dataset.a;
      if (modalOpen) return;
      if (a === 'take') takeNearest();
      else if (a === 'fire') fire();
      else if (a === 'reload') reload();
      else if (a === 'inv') setInv(true);
      else if (a === 'crouch') {
        touchCrouch = !touchCrouch;
        b.classList.toggle('on', touchCrouch);
      } else toggleFlash();
    })
  );
}

// Zones où l’on ne peut pas marcher : [xMin, xMax, zMin, zMax] (caisses, tonneaux, mobilier, machines…)
const COLLIDERS = [
  [-3.7, -2.8, 1.95, 3.45],
  [2.4, 3.4, 2.5, 3.3],
  [3.0, 4.0, -2.5, -0.9],
  [3.3, 3.95, -0.15, 1.85],
  [-2.7, -1.9, -0.9, 1.1], // pièce 1 : tonneaux, caisses, terminal, banc, sac
  [-1.25, 1.25, -9.95, -9.05],
  [-3.45, -2.15, -10.85, -9.55],
  [-3.55, -2.45, -5.75, -4.85],
  [2.85, 3.55, -11.55, -10.85],
  [-3.95, -3.05, -8.4, -6.4],
  [2.5, 3.9, -5.4, -4.6], // pièce 2
  [3.95, 6, -20.0, -13.5],
  [-6, -3.95, -20.0, -13.5],
  [-1.45, 1.45, -17.7, -15.3],
  [-5.7, -4.7, -13.4, -12.3],
  [4.9, 5.7, -13.4, -12.4],
  [-4.0, -3.0, -22, -21.4], // pièce 3 : lits, table, caisses, tonneaux, coffre
  [-5.7, -4.1, -27.9, -25.1],
  [2.5, 5.5, -32, -31.2],
  [-4.3, -2.7, -32, -30.8],
  [3.9, 5.7, -23.9, -22.6] // pièce 4 : générateur, étagères, caisses, bidons
];
COLLIDERS.push([-3.55, -2.45, -3.8, -3.05]);
COLLIDERS.forEach((c) => {
  if (c[3] > -4.1 && c.length === 4) {
    const cx = (c[0] + c[1]) / 2,
      cz = (c[2] + c[3]) / 2,
      dx = cx < -2.2 ? -10 : cx > 2.2 ? 10 : 0,
      dz = cz > 2 ? 19.4 : 0;
    c[0] += dx;
    c[1] += dx;
    c[2] += dz;
    c[3] += dz;
  }
}); // salle 1 agrandie : les collisions suivent les objets déplacés
room1Colliders.forEach((c) => COLLIDERS.push(c));
[
  [-4, -12, 4, 2],
  [-12, -22, 6, 3],
  [-22, -32, 6, 3],
  [-32, -72, 20, 5],
  [-72, -102, 20, 5],
  [-102, -132, 15, 4],
  [-132, -172, 25, 5],
  [-172, -222, 25, 5],
  [-312, -362, 25, 5]
].forEach(([za, zb, hw, thr]) =>
  [COLLIDERS, EXTRA_COLLIDERS].forEach((arr) =>
    arr.forEach((c) => {
      if (c.length !== 4) return;
      const cz = (c[2] + c[3]) / 2;
      if (cz <= za && cz > zb) {
        const cx = (c[0] + c[1]) / 2;
        if (Math.abs(cx) > hw - thr) {
          const s = Math.sign(cx) * 2 * hw;
          c[0] += s;
          c[1] += s;
        }
      }
    })
  )
); // salles agrandies : collisions suivent les objets déplacés
[[-222, -262, 15, 10.5]].forEach(([za, zb, hw, thr]) =>
  EXTRA_COLLIDERS.forEach((c) => {
    if (c.length !== 4) return;
    const cz = (c[2] + c[3]) / 2;
    if (cz <= za && cz > zb) {
      const cx = (c[0] + c[1]) / 2;
      if (Math.abs(cx) > hw - thr) {
        const s = Math.sign(cx) * 2 * hw;
        c[0] += s;
        c[1] += s;
      }
    }
  })
); // prison : les collisions des cellules suivent
fillCols.forEach((c) => EXTRA_COLLIDERS.push(c));
const WALLS = [
  [-4, () => State.door1],
  [-12, () => State.door2],
  [-22, () => State.door3],
  [-32, () => State.doorFinal],
  [-72, () => State.doorHangar],
  [-102, () => State.doorWare],
  [-132, () => State.doorEnd],
  [-172, () => State.doorCmd],
  [-222, () => State.doorExit2],
  [-262, () => State.doorBlock],
  [-312, () => State.doorExit3],
  [-362, () => State.zDone]
]; // murs mitoyens : passage seulement par la porte ouverte
function blocked(x, z) {
  if (MapScenes.active && rig.pos.z < -900) return MapScenes.blocked(x, z);
  const r = CONTROLS.walk.radius,
    hw =
      z > -3.8
        ? 13.9
        : z > -12.15
          ? 11.9
          : z > -32.15
            ? 17.9
            : z > -102
              ? 59.9
              : z > -132
                ? 44.9
                : z > -222
                  ? 74.9
                  : z > -262
                    ? 44.9
                    : z > -312
                      ? 59.9
                      : 74.9;
  if (Math.abs(x) > hw - r || z > 22.9 || z < -361.4) return true; // murs extérieurs
  for (const [wz, open] of WALLS)
    if (Math.abs(z - wz) < 0.15 + r && (Math.abs(x) > 0.9 - r || !open())) return true;
  for (const c of COLLIDERS) if (x > c[0] - r && x < c[1] + r && z > c[2] - r && z < c[3] + r) return true;
  if (z < -32)
    for (const c of EXTRA_COLLIDERS)
      if (x > c[0] - r && x < c[1] + r && z > c[2] - r && z < c[3] + r) return true;
  return false;
}
function objectiveNow() {
  const O = TEXTS.objectives,
    r = roomOf(rig.pos.z);
  if (MapScenes.active && rig.pos.z < -900)
    return MapScenes.active === 'city'
      ? 'Explorez la ville et trouvez le passage vers Zombie Town.'
      : 'Explorez Zombie Town et trouvez la sortie.';
  if (r === 1)
    return State.termOk
      ? O.openDoor
      : State.power
        ? O.needCode
        : State.gen1
          ? State.brkOk
            ? O.lever
            : 'Réarmez le disjoncteur (2 fusibles) puis actionnez le levier.'
          : O.start;
  if (r === 2) return State.solved ? O.exit : O.room2;
  if (r === 3) return State.vaultUnlocked ? O.openVault : State.card ? O.needCard : O.room3;
  if (r === 4) return State.power4 ? O.exitFinal : O.room4;
  if (r === 5) return State.power5 ? O.openHangar : O.room5;
  if (r === 6) return State.wareCode ? O.openWare : O.room6;
  if (r === 7) return State.key ? O.exitEnd : O.room7;
  if (r === 8) return State.power8 ? O.openCmd : O.room8;
  if (r === 9) return State.key2 ? O.exitFinal2 : O.room9;
  if (r === 10) return State.key4 ? O.exitBlock : State.keyCell ? O.openCell : O.room10;
  if (r === 11)
    return State.breaker
      ? O.exitComplex
      : State.keyCtrl
        ? O.useCtrl
        : State.barDone
          ? O.getKey
          : State.crowbar
            ? O.useBar
            : O.room11;
  if (State.zDone) return O.exitShutter;
  if (State.armed) return fmt(O.fight, { n: CONFIG.zombieTarget });
  return State.key3 ? O.needLocker : O.room12;
}
let walkD = 0,
  stepD = 0,
  touchCrouch = false;
rig.dip = 0;
State.crouch = false;
const LOW = []; // zones « basses » : on n'y entre qu'accroupi (conduits, passages étroits)
function addVent(x, z, w = 1.1, len = 6, axis = 'z', h = 1.15) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = axis === 'x' ? Math.PI / 2 : 0;
  scene.add(g);
  box(w + 0.12, 0.07, len, mats.steel, 0, h, 0, g);
  [-1, 1].forEach((s) => box(0.06, h, len, mats.dark, s * (w / 2 + 0.03), h / 2, 0, g));
  box(0.05, 0.02, len * 0.9, glow(0xff8030, 0.7), 0, h - 0.06, 0, g);
  const hx = axis === 'z' ? w / 2 : len / 2,
    hz = axis === 'z' ? len / 2 : w / 2,
    zn = { x1: x - hx, x2: x + hx, z1: z - hz, z2: z + hz, axis };
  LOW.push(zn);
  return zn;
}
const inLow = (zn, x, z) => x > zn.x1 && x < zn.x2 && z > zn.z1 && z < zn.z2;
const lowAt = (x, z) => LOW.some((zn) => inLow(zn, x, z));
function lowOK(ox, oz, nx, nz) {
  for (const zn of LOW) {
    const a = inLow(zn, ox, oz),
      b = inLow(zn, nx, nz);
    if (b && !a) {
      if (!State.crouch) return false;
      if (zn.axis === 'z' ? oz > zn.z1 && oz < zn.z2 : ox > zn.x1 && ox < zn.x2) return false;
    } // il faut être accroupi, et entrer par un bout
    if (a && !b && (zn.axis === 'z' ? nz > zn.z1 && nz < zn.z2 : nx > zn.x1 && nx < zn.x2)) return false;
  } // pas de sortie par le côté
  return true;
}
function updateControls(dt, t) {
  const L = CONTROLS.look,
    Wk = CONTROLS.walk,
    free = !rig.locked && !State.focus && !modalOpen && !State.doorExit;
  if (!free) {
    rig.vy = rig.vp = 0;
    rig.bob = 0;
    rig.moving = false;
    return;
  }
  // regard au clavier + inertie après un glissement de souris
  rig.yaw += ((down('turnLeft') ? 1 : 0) - (down('turnRight') ? 1 : 0)) * L.keyTurnSpeed * dt;
  rig.pitch += ((down('lookUp') ? 1 : 0) - (down('lookDown') ? 1 : 0)) * L.keyPitchSpeed * dt;
  if (!drag?.moved) {
    rig.yaw += rig.vy;
    rig.pitch += rig.vp;
    rig.vy *= L.inertia;
    rig.vp *= L.inertia;
  }
  rig.pitch = THREE.MathUtils.clamp(rig.pitch, -L.pitchLimit, L.pitchLimit);
  // marche : avant/arrière + pas de côté, vitesse normalisée en diagonale, collisions axe par axe (on glisse le long des murs)
  State.crouch = down('crouch') || touchCrouch || lowAt(rig.pos.x, rig.pos.z);
  let moving = false;
  if (Wk.enabled) {
    const f = (down('forward') ? 1 : 0) - (down('back') ? 1 : 0),
      s = (down('right') ? 1 : 0) - (down('left') ? 1 : 0);
    if (f || s) {
      const sp =
          (Wk.speed * (State.crouch ? Wk.crouchSpeed : down('sprint') ? Wk.sprintMultiplier : 1) * dt) /
          Math.hypot(f, s),
        sy = Math.sin(rig.yaw),
        cy = Math.cos(rig.yaw);
      const dx = (-sy * f + cy * s) * sp,
        dz = (-cy * f - sy * s) * sp,
        ox = rig.pos.x,
        oz = rig.pos.z;
      if (!blocked(ox + dx, oz) && lowOK(ox, oz, ox + dx, oz)) rig.pos.x += dx;
      if (!blocked(rig.pos.x, oz + dz) && lowOK(rig.pos.x, oz, rig.pos.x, oz + dz)) rig.pos.z += dz;
      const moved = Math.hypot(rig.pos.x - ox, rig.pos.z - oz);
      if (moved > 0) {
        moving = true;
        walkD += moved;
        stepD += moved;
        if (stepD > (down('sprint') ? 0.95 : 0.75)) {
          stepD = 0;
          if (SOUND.footsteps) SND.play('step');
        }
      }
    }
  }
  rig.moving = moving;
  rig.dip += ((State.crouch ? 1.6 - Wk.crouchEye : 0) - rig.dip) * Math.min(1, dt * 10);
  rig.pos.y += (1.6 - rig.dip + GH(rig.pos.x, rig.pos.z) - rig.pos.y) * Math.min(1, dt * 9); // escaliers : la hauteur suit le sol
  rig.bob = Wk.bob
    ? (rig.bob || 0) * 0.8 + (moving ? Math.sin(walkD * Wk.bobSpeed) * Wk.bobAmount : 0) * 0.2
    : 0; // léger balancement de la caméra
  const rm = roomOf(rig.pos.z);
  if (rm !== State.room) {
    State.room = rm;
    setObjective(objectiveNow());
  } // changement de pièce en marchant
}
