/* LAST REFUGE · XM — Escape room « Sas 07 » · Tweens et caméra (zoom, transitions entre pièces).
   Fichier chargé dans l’ordre par escape-room.js : il partage la portée globale des autres fichiers. */
'use strict';
/* ════════════════════════════════════════════════════════════════
   7. TWEENS + CAMÉRA (rotation 360°, zoom, transition entre pièces)
   ════════════════════════════════════════════════════════════════ */
let actObj = null;
const tweens = new Set();
const easeOutBack = (k) => {
  const c = 1.4;
  return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2);
};
function rattle(o) {
  const u = o && o.userData;
  if (!u || u.rattling) return;
  const t = u.pivot || o,
    wh = u.wheel,
    r0 = t.rotation.y;
  u.rattling = true; // porte / casier verrouillé : secousse + roue qui tressaute
  tween(
    0.45,
    (k) => {
      const a = Math.sin(k * Math.PI * 7) * (1 - k);
      t.rotation.y = r0 + a * (u.pivot ? 0.045 : 0.012);
      if (wh) wh.rotation.z = a * 0.35;
      if (k >= 1) {
        t.rotation.y = r0;
        if (wh) wh.rotation.z = 0;
      }
    },
    (k) => k
  ).then(() => {
    u.rattling = false;
  });
}
function openDoorAnim(o, d) {
  const u = o.userData,
    w = u.wheel; // 1) la roue tourne et déverrouille  2) le battant pivote  3) petit rebond
  if (u.led && u.led.material && u.led.material.clone) {
    u.led.material = u.led.material.clone();
    u.led.material.emissive.setHex(0x30ff70);
  }
  tween(d * 0.45, (k) => {
    w.rotation.z = -6.28 * k;
  });
  gameTimeout(() => SND.play('unlock'), d * 380);
  gameTimeout(
    () =>
      tween(
        d * 0.75,
        (k) => {
          o.rotation.y = 1.65 * easeOutBack(k);
        },
        (k) => k
      ),
    d * 420
  );
}
const tween = (d, fn, ease = easeInOut) => new Promise((res) => tweens.add({ d, t: 0, fn, ease, res }));
const rig = {
  pos: new THREE.Vector3(0, 1.6, 0),
  yaw: 0,
  pitch: 0,
  fov: CONFIG.fov,
  vy: 0,
  vp: 0,
  locked: false
};
async function flyTo(pos, yaw, pitch, fov, d = 1.2) {
  rig.locked = true;
  const p0 = rig.pos.clone(),
    y0 = rig.yaw,
    pi0 = rig.pitch,
    f0 = rig.fov;
  const dy = ((((yaw - y0 + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI; // plus court chemin angulaire
  await tween(d, (k) => {
    rig.pos.lerpVectors(p0, pos, k);
    rig.yaw = y0 + dy * k;
    rig.pitch = pi0 + (pitch - pi0) * k;
    rig.fov = f0 + (fov - f0) * k;
  });
  rig.locked = false;
}
let saved = null;
// après « Quitter le zoom », l’objet quitté ne peut plus être activé pendant 2 s (évite de le recliquer par erreur)
const ZOOM_COOLDOWN_MS = 2000;
const zoomCooldown = { obj: null, until: 0 };
const onZoomCooldown = (o) => !!o && o === zoomCooldown.obj && performance.now() < zoomCooldown.until;
async function focusOn(obj) {
  // zoom fluide devant un objet
  if (!State.focus) saved = { pos: rig.pos.clone(), yaw: rig.yaw, pitch: rig.pitch, fov: rig.fov };
  State.focus = obj; // déjà en zoom : on se déplace vers le nouvel objet en gardant la position d’origine
  const c = obj.userData.focusPt
    ? obj.userData.focusPt()
    : new THREE.Box3().setFromObject(obj).getCenter(new THREE.Vector3()); // focusPt : point visé imposé (évite qu’un accessoire caché décentre la vue)
  const n = new THREE.Vector3(0, 0, 1).applyQuaternion(obj.getWorldQuaternion(new THREE.Quaternion()));
  const to = obj.userData.focusFn
      ? obj.userData.focusFn(c)
      : c.clone().addScaledVector(n, obj.userData.focusDist || 1.2),
    d = c.clone().sub(to);
  SND.play('zoom');
  document.getElementById('back').style.display = 'block';
  await flyTo(to, Math.atan2(-d.x, -d.z), Math.atan2(d.y, Math.hypot(d.x, d.z)), 46, 1.0);
}
async function release(manual) {
  if (!State.focus) return;
  if (manual !== true) return; // sortie automatique ignorée : seul le bouton retour (ou Échap) ramène la caméra
  genHide();
  document.getElementById('back').style.display = 'none';
  const s = saved,
    left = State.focus;
  zoomCooldown.obj = left;
  zoomCooldown.until = Infinity; // bloqué pendant le retour de la caméra…
  State.releasing = true;
  try {
    await flyTo(s.pos, s.yaw, s.pitch, s.fov, 0.9);
  } finally {
    State.releasing = false;
    State.focus = null;
    zoomCooldown.until = performance.now() + ZOOM_COOLDOWN_MS; // …puis encore 2 s
    // le regard à la souris reprend tout seul (sans clic qui réactiverait l’objet)
    if (window.lastRefugeRelock) window.lastRefugeRelock();
  }
}
const roomOf = (z) =>
  z > -4
    ? 1
    : z > -12
      ? 2
      : z > -22
        ? 3
        : z > -32
          ? 4
          : z > -72
            ? 5
            : z > -102
              ? 6
              : z > -132
                ? 7
                : z > -172
                  ? 8
                  : z > -222
                    ? 9
                    : z > -262
                      ? 10
                      : z > -312
                        ? 11
                        : 12; // numéro de pièce selon la profondeur z
async function passDoor(z) {
  // traverse une porte ouverte (dans un sens ou dans l’autre)
  const dir = rig.pos.z > z ? -1 : 1,
    to = roomOf(z + dir * 1.5),
    yaw = dir < 0 ? 0 : Math.PI;
  const near = to >= 5 || roomOf(z - dir * 1.5) >= 5; // grandes salles : on atterrit juste derrière la porte
  await flyTo(new THREE.Vector3(0, 1.6, z), yaw, 0, CONFIG.fov, 1.1);
  await flyTo(
    new THREE.Vector3(0, 1.6, near ? z + dir * 2.4 : CONFIG.roomZ[to - 1]),
    yaw,
    0,
    CONFIG.fov,
    near ? 0.9 : 1.4
  );
  setObjective(objectiveNow());
}
