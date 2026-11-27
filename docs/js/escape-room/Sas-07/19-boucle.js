/* LAST REFUGE · XM — Escape room « Sas 07 » · Boucle d’animation et finitions de la scène.
   Fichier chargé dans l’ordre par escape-room.js : il partage la portée globale des autres fichiers. */
'use strict';
/* ════════════════════════════════════════════════════════════════
   12. BOUCLE D’ANIMATION
   ════════════════════════════════════════════════════════════════ */
const clock = new THREE.Clock();
const fpsToggle = document.getElementById('fps-toggle'),
  fpsValue = document.getElementById('fps-value');
let fpsFrames = 0, fpsElapsed = 0, fpsSkip = true;
fpsToggle.addEventListener('click', () => {
  const enabled = fpsToggle.getAttribute('aria-pressed') !== 'true';
  fpsToggle.setAttribute('aria-pressed', String(enabled));
  fpsValue.hidden = !enabled;
  fpsValue.textContent = '-- FPS';
  fpsFrames = 0;
  fpsElapsed = 0;
  fpsSkip = true;
});
document.addEventListener('visibilitychange', () => {
  fpsFrames = 0;
  fpsElapsed = 0;
  fpsSkip = true;
});
function updateFps(delta) {
  if (fpsValue.hidden || document.hidden) {
    fpsFrames = 0;
    fpsElapsed = 0;
    return;
  }
  if (fpsSkip) {
    fpsSkip = false;
    return;
  }
  fpsFrames++;
  fpsElapsed += delta;
  if (fpsElapsed >= 1) {
    fpsValue.textContent = Math.round(fpsFrames / fpsElapsed) + ' FPS';
    fpsFrames = 0;
    fpsElapsed = 0;
  }
}
const loopMenu = document.getElementById('menu'),
  loopAlarm = document.getElementById('alarmfx'),
  loopBack = document.getElementById('back');
function loop() {
  requestAnimationFrame(loop);
  const delta = clock.getDelta();
  // menu ouvert, onglet caché ou carte en cours de transfert : rien à dessiner, le temps de jeu est figé
  if (loopMenu.classList.contains('on') || document.hidden || MapScenes.loading) {
    clock.elapsedTime -= delta;
    fpsFrames = 0;
    fpsElapsed = 0;
    return;
  }
  // dev mode ouvert : partie en pause, mais la scène reste dessinée (téléportations visibles)
  if (DEV.paused()) {
    clock.elapsedTime -= delta;
    applyRig(clock.elapsedTime);
    avatarFrame(0, clock.elapsedTime);
    renderGame();
    updateFps(delta);
    return;
  }
  const dt = Math.min(delta, 0.05),
    t = clock.elapsedTime;
  gameTimersFrame(delta);
  renderer.shadowMap.needsUpdate = (loop.f = (loop.f || 0) + 1) % 2 === 0;
  for (const w of tweens) {
    w.t += dt;
    const k = Math.min(1, w.t / w.d);
    w.fn(w.ease(k));
    if (k >= 1) {
      tweens.delete(w);
      w.res();
    }
  }
  updateControls(dt, t);
  updateAim(dt);
  applyRig(t);
  avatarFrame(dt, t);
  MapScenes.animate(t);
  combatFrame(dt, t);
  if (State.armed && (down('fire') || (aimedMouseShot && isAiming()))) fire();
  updateFlash(dt, t);
  // néons : éteints tant que le courant n’est pas rétabli (levier → pièces 1-2, générateur → pièces 3-4), avec des étincelles rares
  for (const r of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) {
    const on = r === 1 ? State.power : r === 7 ? State.wareLight : true; // salle 1 : levier ; salle 7 (entrepôt) : interrupteur à trouver ; les autres : toujours alimentées
    if (on && !neon.was[r]) {
      neon.was[r] = true;
      neon.sw[r] = t;
    }
    if (false) {
      neon.spark[r] = t + 0.05 + Math.random() * 0.08;
      neon.nextSpark[r] = t + 3 + Math.random() * 9;
    }
    const boot = on ? Math.min(1, (t - neon.sw[r]) / 0.7) : 1; // allumage en douceur (fondu), sans grésillement                         // allumage en grésillant
    const fl = 1; // intensité constante : aucun clignotement   // scintillement organique : battement lent + micro-grésillements
    let kk = on ? boot * fl : t < neon.spark[r] ? 0.2 : 0;
    if (false) {
      const nd = (neon.die = neon.die || {}),
        d = nd[r] || (nd[r] = { ph: 0, t0: 0, nx: t + 4 + Math.random() * 10 }); // baisse douce de ~1,4 s (jamais d'extinction brusque ni de stroboscope)
      if (d.ph === 0 && t > d.nx) {
        d.ph = 1;
        d.t0 = t;
        if (State.room === r) SND.play('neonoff');
      }
      if (d.ph === 1) {
        const x = (t - d.t0) / 1.4;
        if (x >= 1) {
          d.ph = 0;
          d.nx = t + 10 + Math.random() * 8;
        } else kk *= 1 - 0.85 * Math.pow(Math.sin(Math.PI * x), 2);
      }
    }
    neon.k[r] = on ? Math.max(0.1, kk) : kk;
  } // plancher : jamais sous 10 % une fois le courant rétabli
  neon.tubes.forEach((o) => {
    const k = neon.k[o.room];
    if (o.lastK === k) return;
    o.lastK = k;
    o.m.emissiveIntensity = (o.room === 12 ? 0.8 : 3.2) * k;
    o.m.emissive.setHex(k > 0.6 ? 0xcfe4ff : 0x8e9296);
    if (o.hm) {
      o.hm.opacity = (o.room === 12 ? 0 : 0.62) * k;
      o.hm.color.setHex(k > 0.6 ? 0xbcd6ff : 0x8e9296);
    }
  }); // plein feu : blanc-bleu · en flash : gris-blanc faible
  neon.lights.forEach((o) => o.l.color.setHex(neon.k[o.room] > 0.6 ? 0xcfe4ff : 0xa9adb1));
  bigLights.forEach((L) => L.color.setHex((neon.k[roomOf(rig.pos.z)] || 0) > 0.6 ? 0xcfe4ff : 0xa9adb1));
  neon.lights.forEach(
    (o) =>
      (o.l.intensity =
        o.base * neon.k[o.room] * CONFIG.light.neonPower * (o.room === 2 && State.solved ? 1.25 : 1))
  );
  {
    const rr = roomOf(rig.pos.z),
      big = rr >= 5,
      hh =
        rr === 12
          ? 8.6
          : rr === 11
            ? 9.6
            : rr === 10
              ? 4.6
              : rr === 9
                ? 8.6
                : rr === 8
                  ? 9.6
                  : rr === 7
                    ? 10
                    : rr === 6
                      ? 4.8
                      : 6.5,
      kk = big ? neon.k[rr] * CONFIG.light.neonPower : 0; // 3 lampes « suiveuses » éclairent les grandes salles
    bloom.strength = rr === 12 ? 0.12 : 0.34;
    bigLights.forEach((L, i) => {
      L.position.set(rig.pos.x * 0.7, rr === 12 ? hh - 2 : hh, rig.pos.z + (i - 1) * 13);
      L.intensity = kk * hh * hh * (i === 1 ? 2 : 1.2) * (rr === 12 ? 0.65 : rr >= 7 && rr <= 10 ? 0.35 : 1);
    });
    neonPoolUpdate(rr, dt);
  }
  if (State.gen1) {
    genG.position.y = Math.sin(t * 70) * 0.0025;
    genG.rotation.z = Math.sin(t * 53) * 0.002;
  }
  tankLight.intensity = 5 + 1.5 * Math.sin(t * 1.7);
  alarms.forEach((a) => (a.intensity = a.userData.on() ? 3.2 * (0.55 + 0.45 * Math.sin(t * 2)) : 0));
  {
    const al =
        SOUND.alarm &&
        [
          !State.power,
          !State.solved,
          !State.vaultUnlocked,
          !State.power4,
          !State.power5,
          !State.wareCode,
          !State.key,
          !State.power8,
          !State.key2,
          !State.key4,
          !State.breaker,
          !State.zDone
        ][State.room - 1],
      fx = loopAlarm,
      op = al ? (0.03 + 0.05 * (0.5 + 0.5 * Math.sin(t * 2))).toFixed(3) : '0';
    if (fx && fx.style.opacity !== op) fx.style.opacity = op;
  } // alarme rouge pulsante
  beacons.forEach((b) => (b.m.emissiveIntensity = b.on() ? 3 * (0.5 + 0.5 * Math.sin(t * 4)) : 0));
  if (perf.lowEnd) {
    const count = Math.ceil(blinkers.length / 4),
      start = loop.blinkerIndex || 0;
    for (let i = 0; i < count; i++) {
      const b = blinkers[(start + i) % blinkers.length];
      b.m.emissiveIntensity = Math.sin(t * b.s + b.p) > 0.2 ? 2.2 : 0.1;
    }
    loop.blinkerIndex = (start + count) % (blinkers.length || 1);
  } else {
    blinkers.forEach((b) => (b.m.emissiveIntensity = Math.sin(t * b.s + b.p) > 0.2 ? 2.2 : 0.1));
  }
  rotors.forEach((r) => {
    if (!r.on || r.on()) r.o.rotation.z += dt * r.s;
  });
  spinners.forEach((s, i) => {
    if (i === 0) s.rotation.z += dt * 8;
    else s.position.y = 1.2 + Math.sin(t * 0.8) * 0.05;
  });
  SND.update(t, dt);
  perfTick();
  try {
    CCTV.track(dt, t);
    CCTV.frame(dt, t);
  } catch (e) {
    if (!CCTV.err) {
      CCTV.err = 1;
      console.warn('CCTV', e);
    }
  }
  selFrame(t);
  {
    const bk = loopBack,
      sh = State.focus && !State.releasing ? 'block' : 'none';
    if (bk && bk.style.display !== sh) {
      bk.style.display = sh;
      document.body.classList.toggle('zoom', sh === 'block');
    }
  }
  renderGame();
  updateFps(delta);
}
/* ── Audit des zones de clic : une zone invisible plus grande que l'objet qu'elle protège est réduite à sa taille réelle (+ marge) ── */
function fitHitBoxes() {
  try {
    let n = 0;
    const inv = new THREE.Matrix4(),
      tmp = new THREE.Box3(),
      vb = new THREE.Box3(),
      lb = new THREE.Box3(),
      P = new THREE.Vector3();
    scene.updateMatrixWorld(true);
    const hits = [];
    scene.traverse((o) => {
      if (o.userData && o.userData.hit && o.parent) hits.push(o);
    });
    hits.forEach((o) => {
      let owner = o.parent;
      while (owner && !(owner.userData && owner.userData.interactive)) owner = owner.parent;
      if (!owner) return;
      let nh = 0;
      owner.traverse((m) => {
        if (m.userData && m.userData.hit) nh++;
      });
      if (nh !== 1) return; // propriétaire à plusieurs zones : on n'y touche pas
      vb.makeEmpty();
      owner.traverse((m) => {
        if (!m.isMesh || m.userData.hit || !m.geometry) return;
        for (let v = m; v && v !== owner.parent; v = v.parent) if (!v.visible) return;
        if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
        tmp.copy(m.geometry.boundingBox).applyMatrix4(m.matrixWorld);
        vb.union(tmp);
      });
      if (vb.isEmpty()) return;
      inv.copy(o.parent.matrixWorld).invert();
      lb.makeEmpty();
      for (let i = 0; i < 8; i++)
        lb.expandByPoint(
          P.set(
            i & 1 ? vb.max.x : vb.min.x,
            i & 2 ? vb.max.y : vb.min.y,
            i & 4 ? vb.max.z : vb.min.z
          ).applyMatrix4(inv)
        );
      const g = o.geometry.parameters,
        s = lb.getSize(new THREE.Vector3()),
        c = lb.getCenter(new THREE.Vector3()),
        w = Math.min(g.width, Math.max(0.16, s.x + 0.1)),
        h = Math.min(g.height, Math.max(0.16, s.y + 0.1)),
        d = Math.min(g.depth, Math.max(0.16, s.z + 0.1));
      if (w < g.width * 0.9 || h < g.height * 0.9 || d < g.depth * 0.9) {
        o.geometry.dispose();
        o.geometry = new THREE.BoxGeometry(w, h, d);
        o.position.copy(c);
        n++;
      }
    });
    console.info('[hitbox] ' + n + ' zone(s) ajustée(s) sur ' + hits.length);
  } catch (e) {
    console.warn('hitbox', e);
  }
}
/* ── Anti-chevauchement : un easter egg ou un objet de quête trop près d'un autre objet interactif est écarté (le clic visait le mauvais objet) ── */
function nudgeApart() {
  try {
    const all = [];
    scene.children.forEach((o) => {
      if (o.userData && o.userData.interactive && o.visible) all.push(o);
    });
    const mine = all.filter((o) => /^(egg_|q\d+_)/.test(o.userData.id || ''));
    let moved = 0;
    mine.forEach((a) => {
      for (let it = 0; it < 4; it++) {
        const b = all.find(
          (x) =>
            (x !== a &&
              x.position.distanceTo(a.position) < 0.6 &&
              !/^(egg_|q\d+_)/.test(x.userData.id || '')) ||
            (x !== a && x.position.distanceTo(a.position) < 0.45)
        );
        if (!b) break;
        const dx = a.position.x - b.position.x,
          dz = a.position.z - b.position.z,
          l = Math.hypot(dx, dz) || 1;
        a.position.x += (dx / l) * 0.7;
        a.position.z += (dz / l) * 0.7;
        moved++;
      }
    });
    console.info('[hitbox] ' + moved + " objet(s) écarté(s) d'un voisin trop proche");
  } catch (e) {
    console.warn('nudge', e);
  }
}
nudgeApart();
fitHitBoxes();
/* ── Quitter l’escape room : confirmation puis retour à l’accueil ── */
(function () {
  const b = document.getElementById('menuquit');
  if (!b) return;
  const ov = document.createElement('div');
  ov.id = 'quitov';
  ov.style.cssText =
    'position:fixed;inset:0;z-index:80;display:none;place-items:center;background:#000d;font-family:var(--stencil);color:var(--bone);text-align:center';
  ov.innerHTML = `<div style="width:min(420px,90vw);padding:24px;border:2px solid #3a3326;background:linear-gradient(180deg,#1b1d19,#0a0b09);box-shadow:0 12px 40px #000c"><h3 id="qt" style="letter-spacing:.18em;margin:0 0 8px"></h3><p id="qp" style="font:400 15px 'Special Elite',monospace;color:#b8bba6;margin:0 0 14px"></p><div id="qb" style="display:flex;gap:8px;justify-content:center"></div></div>`;
  document.body.appendChild(ov);
  ['pointerdown', 'mousedown', 'touchstart', 'wheel', 'keydown'].forEach((ev) =>
    ov.addEventListener(ev, (x) => x.stopPropagation(), { passive: true })
  );
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || ov.style.display !== 'grid') return;
    event.preventDefault();
    event.stopPropagation();
    document.getElementById('quitcancel').click();
  }, true);
  const btn = (label, fn, main) => {
    const e = document.createElement('button');
    e.textContent = label;
    e.style.cssText =
      'padding:10px 18px;font:700 15px var(--stencil);letter-spacing:.08em;color:#fff;border:1px solid ' +
      (main ? '#e0554a' : '#4a4536') +
      ';background:' +
      (main ? 'linear-gradient(180deg,#c4281c,#8f1d14)' : 'linear-gradient(180deg,#2b2d28,#171814)');
    e.onclick = fn;
    return e;
  };
  const show = (t, p, btns) => {
    document.getElementById('qt').textContent = t;
    document.getElementById('qp').textContent = p;
    const q = document.getElementById('qb');
    q.innerHTML = '';
    btns.forEach((x) => q.appendChild(x));
    ov.style.display = 'grid';
  };
  const askQuit = () => {
    modalOpen = true;
    const cancel = btn('Annuler', () => {
      ov.style.display = 'none';
      modalOpen = document.getElementById('menu').classList.contains('on');
    });
    cancel.id = 'quitcancel';
    show('QUITTER L’ESCAPE ROOM ?', 'La partie en cours sera perdue.', [
      btn('Quitter', bye, true),
      cancel
    ]);
    if (window.LastRefugeManette && window.LastRefugeManette.active) cancel.focus();
  };
  function bye() {
    try {
      if (SND.on) SND.toggle();
    } catch (e) {}
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'lastrefuge-game-quit' }, '*');
      return;
    }
    location.href = CONFIG.quitUrl;
  }
  b.addEventListener('click', askQuit);
})();
