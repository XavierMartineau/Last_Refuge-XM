/* LAST REFUGE · XM — Escape room « Sas 07 » · Lampe torche.
   Fichier chargé dans l’ordre par escape-room.js : il partage la portée globale des autres fichiers. */
'use strict';
/* ════════════════════════════════════════════════════════════════
   7d. LAMPE TORCHE : projecteur attaché à la caméra (avec léger retard quand on tourne). Réglages : CONFIG.flashlight.
   ════════════════════════════════════════════════════════════════ */
const FL = CONFIG.flashlight;
let flashOn = FL.startOn;
const flash = new THREE.SpotLight(FL.color, FL.intensity, FL.distance, FL.angle, FL.penumbra, FL.decay);
flash.castShadow = FL.shadows;
flash.shadow.mapSize.set(512, 512);
flash.shadow.bias = -0.0004;
flash.shadow.normalBias = 0.03;
const flashFill = new THREE.PointLight(FL.color, FL.fill, 6, 2);
scene.add(flash, flash.target, flashFill);
const flashDir = new THREE.Vector3(0, 0, -1),
  _f = new THREE.Vector3(),
  _r = new THREE.Vector3(),
  _u = new THREE.Vector3();
let fNext = 6,
  fUntil = 0;
const _rc = new THREE.Raycaster();
_rc.camera = camera;
let _fk = 1,
  _fkT = 1,
  _fc = 0,
  _nextFlashProbe = 0,
  _fkF = 1,
  _fkFs = 1;
function flashLabel() {
  document.getElementById('fl').textContent = flashOn ? TEXTS.ui.flashOn : TEXTS.ui.flashOff;
}
function toggleFlash() {
  if (AV.heldItem !== 'flashlight') {
    selectHeldItem('flashlight');
    return;
  }
  flashOn = !flashOn;
  SND.play('flash');
  flashLabel();
}
function selectHeldItem(item) {
  if (item === 'weapon' && !State.armed) return say('Récupérez d’abord une arme dans le casier.', 2500);
  AV.heldItem = item;
  flashOn = item === 'flashlight';
  if (AV.obj) {
    AV.obj.userData.setHeldItem(item);
    setFirstPersonAvatar(AV.obj);
  }
  SND.play('flash');
  flashLabel();
  say(item === 'weapon' ? 'Arme en main.' : 'Lampe torche en main.', 1800);
}
document.getElementById('fl').onclick = toggleFlash;
flashLabel();
function updateFlash(dt, t) {
  _f.set(0, 0, -1).applyQuaternion(camera.quaternion);
  _r.set(1, 0, 0).applyQuaternion(camera.quaternion);
  _u.set(0, 1, 0).applyQuaternion(camera.quaternion);
  flashDir.lerp(_f, 1 - Math.exp(-dt * FL.swayLag)).normalize();
  flash.position
    .copy(rig.pos)
    .addScaledVector(_r, 0.2)
    .addScaledVector(_u, -0.16)
    .addScaledVector(_f, AV.tp ? 0.55 : -0.5); // reculée derrière la tête : jamais plus près que ~0,5 m d’une surface
  flash.target.position.copy(flash.position).addScaledVector(flashDir, 10);
  flashFill.position.copy(rig.pos).addScaledVector(_f, AV.tp ? 0.8 : -0.35);
  if (t > fNext) {
    fUntil = t + 0.05 + Math.random() * 0.09;
    fNext = t + 7 + Math.random() * 16;
  } // minuscule scintillement de temps en temps
  const m = !flashOn ? 0 : FL.flicker && t < fUntil ? 0.4 : 1;
  if (flashOn && (perf.lowEnd ? t >= _nextFlashProbe : _fc++ % 4 === 0)) {
    _nextFlashProbe = t + 0.25;
    _rc.set(rig.pos, _f);
    _rc.far = 6;
    const h = _rc
      .intersectObjects(scene.children, true)
      .find((x) => x.object.visible && !x.object.isPoints && !x.object.isLine);
    const d = h ? h.distance : 6;
    _fkT = Math.min(1, Math.max(0.02, Math.pow(d / FL.closeDist, 2)));
    _fkF = Math.min(1, Math.max(0.03, Math.pow(d / 2.2, 2)));
  } // plus la surface visée est proche, plus le faisceau baisse
  _fk += (_fkT - _fk) * Math.min(1, dt * 8);
  _fkFs += (_fkF - _fkFs) * Math.min(1, dt * 8);
  const _lit = 1 - 0.75 * (neon.k[roomOf(rig.pos.z)] || 0); // salle éclairée par les néons : la lampe s’efface (inutile et éblouissante)
  flash.intensity = FL.intensity * m * _fk * _lit;
  flashFill.intensity = FL.fill * m * _fkFs * _lit;
}
function renderInv() {
  /* inventaire */ const e = document.getElementById('inv'),
    it = [
      State.card && TEXTS.ui.items.card,
      State.fuses > 0 && TEXTS.ui.items.fuse + ' ×' + State.fuses,
      State.crowbar && !State.barDone && TEXTS.ui.items.crowbar,
      State.keyCtrl && !State.breaker && TEXTS.ui.items.keyctrl,
      State.battery && 'Batterie',
      State.fuel && 'Bidon d’essence',
      State.noteLocker && 'Note du casier (« … 1 9 »)',
      State.cutters && 'Pince coupante',
      State.badge && 'Badge d’accès',
      State.screwdriver && 'Tournevis',
      State.drill && 'Perceuse',
      State.cable && 'Câble de masse',
      State.book && 'Carnet de mission',
      State.fz > 0 && 'Fusible 30 A ×' + State.fz,
      ...qInvList()
    ].filter(Boolean);
  INV_LAST = it;
  e.style.display = it.length ? 'block' : 'none';
  e.textContent = '🎒 ' + TEXTS.ui.inventory + ' · ' + it.length + ' — ' + (TOUCH ? 'touchez' : 'H');
  refreshInvFull();
}

/* Textes fixes de l’interface (venus de TEXTS) */
function applyUITexts() {
  const U = TEXTS.ui,
    g = (i) => document.getElementById(i) || {};
  g('objl').textContent = U.objective;
  g('help').textContent = U.help;
  g('back').textContent = U.back;
  g('kok').textContent = U.validate;
  g('kno').textContent = U.cancel;
  g('endt').textContent = U.endTitle;
  g('endp').textContent = U.endText;
  g('endb').textContent = U.replay;
  sndLabel();
}
applyUITexts();
