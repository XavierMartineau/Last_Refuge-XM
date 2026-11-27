/* LAST REFUGE · XM — Escape room « Sas 07 » · Raycasting : survol, contour, infobulle et clic.
   Fichier chargé dans l’ordre par escape-room.js : il partage la portée globale des autres fichiers. */
'use strict';
/* ════════════════════════════════════════════════════════════════
   8. RAYCASTING : hover (contour + infobulle + curseur) et clic
   ════════════════════════════════════════════════════════════════ */
const ray = new THREE.Raycaster(),
  mv = new THREE.Vector2(),
  tip = document.getElementById('tip');
let hovered = null;
function interactionLabel(pickup = false) {
  const pad = window.LastRefugeManette, settings = window.LastRefugeReglages;
  if (pad && pad.active) {
    const binding = settings ? settings.load().pb_interact : 'A';
    return pad.label(binding || 'A');
  }
  if (pickup) return settings ? settings.actionKey('take') : 'E';
  return TOUCH ? 'Toucher' : 'Clic gauche';
}
function pick(e) {
  const r = gameCanvasRect();
  mv.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(mv, camera);
  for (const h of ray.intersectObjects(scene.children, true)) {
    // 1er objet touché = occultation respectée
    let o = h.object;
    while (o) {
      if (o.userData && o.userData.interactive) return o;
      o = o.parent;
    }
    return null;
  }
  return null;
}
function hover(e) {
  if (rig.locked || modalOpen) {
    setHover(null);
    return;
  }
  let o = pick(e);
  if (onZoomCooldown(o)) o = null; // objet qu’on vient de quitter : ni contour ni infobulle pendant 2 s
  setHover(o);
  if (o) {
    tip.textContent = '[' + interactionLabel(o.userData.actionType === 'pickup') + '] ' + o.userData.hint;
    tip.style.transform = `translate(${e.clientX + 16}px,${e.clientY + 14}px)`;
  }
}
function takeNearest() {
  // touche E : prend l’objet visé (ou pointé), s’il est à portée
  const r = gameCanvasRect();
  let o =
    hovered && hovered.userData.actionType === 'pickup'
      ? hovered
      : pick({ clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 });
  if (!o || o.userData.actionType !== 'pickup' || onZoomCooldown(o)) return;
  const p = new THREE.Vector3();
  o.getWorldPosition(p);
  if (p.distanceTo(new THREE.Vector3(rig.pos.x, rig.pos.y - 0.4, rig.pos.z)) > 3.4) {
    SND.play('click');
    return say(M.tooFar, 1800);
  }
  actObj = o;
  (Actions.handlers[o.userData.id] || (() => {}))(o);
}
function setHover(o) {
  if (o === hovered) return;
  hovered = o;
  if (o && SOUND.hoverTick) SND.play('tick');
  outline.selectedObjects = o && o !== State.focus ? [o] : [];
  if (o) outline.visibleEdgeColor.set(0x22d3ee);
  el.style.cursor = o ? 'var(--curh)' : 'var(--cur)';
  tip.classList.toggle('on', !!o);
}
function click(e) {
  if (rig.locked || modalOpen) return;
  if (isAiming()) return fire();
  const o = pick(e);
  if (onZoomCooldown(o)) return; // objet quitté il y a moins de 2 s
  if (!o) {
    if (!State.focus && State.armed) fire(e);
    return;
  }
  if (State.focus && State.focus !== o && !['btn_green', 'btn_red', 'btn_blue'].includes(o.userData.id)) {
    release();
    return;
  }
  if (o.userData.actionType === 'pickup') {
    SND.play('click');
    return say('Appuyez sur ' + interactionLabel(true) + ' pour le prendre.', 2200);
  } // les objets se prennent avec la touche E
  actObj = o;
  const fn =
    Actions.handlers[o.userData.id] ||
    (() => {
      SND.play('click');
      say(o.userData.text || TEXTS.msg.nothing);
    });
  fn(o);
}
