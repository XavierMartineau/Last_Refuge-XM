/* LAST REFUGE · XM — Escape room « Sas 07 » · Combat : infectés, tir, munitions, vie.
   Fichier chargé dans l’ordre par escape-room.js : il partage la portée globale des autres fichiers. */
'use strict';
/* ═════════ COMBAT : zombies, tir, munitions, vie ═════════
   Réglages : CONFIG.zombies (nombre simultané, vitesse, dégâts…) et CONFIG.zombieTarget (nombre à abattre, écrit sur le recensement).
   Contrôles : clic = tirer là où l’on pointe · Espace = tirer devant soi (maintenir = rafale) · R = recharger. */
const ZC = CONFIG.zombies,
  zRoots = [],
  fxParts = [],
  fxTracers = [],
  zRay = new THREE.Raycaster();
const zSkin = ['#6f7d63', '#7a806a', '#5f6d58', '#84806a', '#667a6a'].map(
  (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85 })
);
const zCloth = ['#3a3f33', '#4a3a30', '#2e3238', '#463c2c', '#2a3a40'].map(
  (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.95 })
);
const zBlood = new THREE.MeshStandardMaterial({ color: 0x5a0a08, roughness: 0.35 }),
  zEyeM = glow(0xffe46a, 2.4),
  partM = new THREE.MeshBasicMaterial({ color: 0x7a0d0a }),
  tracM = new THREE.MeshBasicMaterial({
    color: 0xffe6a0,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
const mFlash = new THREE.PointLight(0xffc880, 0, 9, 2);
scene.add(mFlash);
const SPAWNS = [
  [-18, -264],
  [0, -267],
  [18, -264],
  [-21, -232],
  [21, -232],
  [-10, -268],
  [10, -268],
  [21, -250],
  [-45, -264],
  [45, -264],
  [-60, -245],
  [60, -245],
  [-40, -232],
  [40, -232],
  [-65, -262],
  [65, -262]
];
function makeZombie() {
  const root = new THREE.Group(),
    pick = (a) => a[(Math.random() * a.length) | 0],
    sk = pick(zSkin),
    cl = pick(zCloth),
    pn = pick(zCloth);
  const body = new THREE.Group();
  root.add(body);
  box(0.46, 0.62, 0.26, cl, 0, 1.2, 0, body);
  box(0.4, 0.24, 0.24, pn, 0, 0.8, 0, body);
  box(0.2, 0.14, 0.01, zBlood, 0.06, 1.25, 0.135, body);
  box(0.08, 0.3, 0.01, zBlood, -0.1, 1.1, 0.135, body);
  const headG = new THREE.Group();
  headG.position.set(0, 1.66, 0.03);
  body.add(headG);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.125, 16, 12), sk);
  head.scale.set(0.95, 1.12, 1);
  head.castShadow = true;
  head.userData.head = true;
  headG.add(head);
  const jaw = box(0.11, 0.05, 0.09, sk, 0, -0.11, 0.05, headG);
  jaw.userData.head = true;
  [-0.045, 0.045].forEach((x) => {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.017, 8, 6), zEyeM);
    e.position.set(x, 0.02, 0.112);
    headG.add(e);
  });
  box(0.05, 0.03, 0.02, zBlood, 0.05, -0.07, 0.115, headG);
  const arms = [-1, 1].map((s) => {
    const a = new THREE.Group();
    a.position.set(s * 0.29, 1.46, 0);
    body.add(a);
    cyl(0.045, 0.3, sk, 0, -0.15, 0, a, 10);
    const f = new THREE.Group();
    f.position.set(0, -0.3, 0);
    a.add(f);
    cyl(0.04, 0.28, sk, 0, -0.14, 0, f, 10);
    box(0.08, 0.1, 0.05, sk, 0, -0.3, 0, f);
    a.userData.f = f;
    return a;
  });
  const legs = [-1, 1].map((s) => {
    const l = new THREE.Group();
    l.position.set(s * 0.11, 0.8, 0);
    body.add(l);
    cyl(0.07, 0.4, pn, 0, -0.2, 0, l, 10);
    const k = new THREE.Group();
    k.position.set(0, -0.4, 0);
    l.add(k);
    cyl(0.055, 0.4, pn, 0, -0.2, 0, k, 10);
    box(0.1, 0.06, 0.2, zBlood, 0, -0.42, 0.05, k);
    l.userData.k = k;
    return l;
  });
  root.userData = {
    zombie: true,
    body,
    headG,
    arms,
    legs,
    hp: ZC.hp,
    state: 'walk',
    phase: Math.random() * 6,
    speed: ZC.speed[0] + Math.random() * (ZC.speed[1] - ZC.speed[0]),
    nextHit: 0,
    dieT: 0,
    lean: Math.random() * 0.2
  };
  return root;
}
function spawnZombie() {
  const p = SPAWNS[(Math.random() * SPAWNS.length) | 0],
    z = makeZombie();
  z.position.set(p[0] + (Math.random() - 0.5) * 3, 0, p[1] + Z12 + (Math.random() - 0.5) * 3);
  scene.add(z);
  zRoots.push(z);
  State.spawned++;
  SND.play('zgroan');
}
function killZombie(z, t) {
  const u = z.userData;
  if (u.state === 'dead') return;
  u.state = 'dead';
  u.dieT = t;
  State.kills++;
  SND.play('zdie');
  hud();
  if (State.kills >= CONFIG.zombieTarget && !State.zDone) endFight();
}
function endFight() {
  State.zDone = true;
  setObjective(TEXTS.objectives.exitShutter);
  SND.play('success');
  say(TEXTS.msg.zWin, 8000);
  doorShutter.userData.led.material = glow(0x30ff70, 3);
  doorShutter.userData.hint = TEXTS.hints.door_shutter_unlocked;
  zRoots.forEach((z) => {
    if (z.userData.state === 'walk') z.userData.state = 'collapse';
  });
  exitLight.material.emissiveIntensity = 5;
  setTimeout(() => Actions.handlers.door_shutter(doorShutter), 3200);
}
function hud() {
  const c = document.getElementById('combat');
  if (!c) return;
  c.style.display = State.armed ? 'flex' : 'none';
  document.getElementById('hpfill').style.width = Math.max(0, State.hp) + '%';
  const st = AV.stats;
  document.getElementById('ammo').textContent =
    st && st.mag
      ? State.reloading
        ? 'RECHARGEMENT…'
        : 'MUNITIONS ' + State.ammo + ' / ' + st.mag
      : 'ARME BLANCHE';
  document.getElementById('kills').textContent = 'ZOMBIES ABATTUS : ' + State.kills;
}
function equipWeapon() {
  const w = (AV.state && AV.state.weapon) || 2;
  State.armed = true;
  loadAvatar({ ...(AV.state || {}), weapon: w });
  AV.tp = true;
  AV.stats = CL.weaponStats(AV.state);
  State.ammo = AV.stats.mag;
  State.hp = 100;
  State.spawnT = 1.5;
  hud();
}
function muzzlePos() {
  const sy = Math.sin(rig.yaw),
    cy = Math.cos(rig.yaw);
  return new THREE.Vector3(
    rig.pos.x - sy * 0.9 + cy * 0.2,
    rig.pos.y - 0.32,
    rig.pos.z - cy * 0.9 - sy * 0.2
  );
}
function burst(p, n = 6) {
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.04), partM);
    m.position.copy(p);
    scene.add(m);
    fxParts.push({
      m,
      v: new THREE.Vector3((Math.random() - 0.5) * 2.5, Math.random() * 2.5, (Math.random() - 0.5) * 2.5),
      t: 0
    });
  }
}
function tracer(a, b) {
  const d = b.clone().sub(a),
    l = d.length();
  if (l < 0.1) return;
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1, 4), tracM);
  m.position.copy(a).addScaledVector(d, 0.5);
  m.scale.y = l;
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  scene.add(m);
  fxTracers.push({ m, t: 0 });
}
function hitZombie(z, dmg, head, p, t) {
  const u = z.userData;
  if (u.state === 'dead') return;
  u.hp -= dmg * (head ? 2.5 : 1);
  burst(p, head ? 9 : 5);
  SND.play('zhit');
  u.stagger = t + 0.25;
  if (u.hp <= 0) killZombie(z, t);
}
let fireT = 0,
  hurtT = 0;
function fire(e) {
  if (
    !State.armed ||
    State.zDone ||
    State.focus ||
    modalOpen ||
    State.doorExit ||
    rig.locked ||
    State.reloading
  )
    return;
  const t = clock.elapsedTime,
    st = AV.stats;
  if (!st) return;
  if (t < fireT) return;
  fireT = t + Math.min(3, Math.max(0.07, 60 / st.rate));
  const k = AV.state.weapon;
  if (e) {
    const r = el.getBoundingClientRect();
    zRay.setFromCamera(
      new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1),
      camera
    );
  } else zRay.setFromCamera(new THREE.Vector2(0, 0), camera);
  const alive = zRoots.filter((z) => z.userData.state === 'walk' || z.userData.state === 'collapse');
  if (k === 1 || k === 11) {
    // arme blanche : touche les zombies proches, devant soi
    SND.play('swing');
    const fw = new THREE.Vector3(-Math.sin(rig.yaw), 0, -Math.cos(rig.yaw));
    alive.forEach((z) => {
      const d = z.position.clone().sub(rig.pos);
      d.y = 0;
      if (d.length() < 2.3 && d.normalize().dot(fw) > 0.25)
        hitZombie(z, st.dmg, false, z.position.clone().setY(1.3), t);
    });
    return;
  }
  if (st.mag && State.ammo <= 0) {
    SND.play('empty');
    reload();
    return;
  }
  State.ammo--;
  hud();
  SND.play('shot', k);
  mFlash.position.copy(muzzlePos());
  mFlash.intensity = 7;
  setTimeout(() => (mFlash.intensity = 0), 55);
  const pellets = k === 3 ? 8 : 1,
    spread = ((100 - st.acc) / 100) * (k === 3 ? 0.09 : 0.05);
  for (let i = 0; i < pellets; i++) {
    const o = zRay.ray.origin.clone(),
      d = zRay.ray.direction.clone();
    d.x += (Math.random() - 0.5) * spread;
    d.y += (Math.random() - 0.5) * spread;
    d.z += (Math.random() - 0.5) * spread;
    d.normalize();
    zRay.set(o, d);
    zRay.far = st.range + 4;
    const hit = zRay.intersectObjects(alive, true)[0],
      end = hit ? hit.point : o.clone().addScaledVector(d, Math.min(st.range, 40));
    tracer(muzzlePos(), end);
    if (k === 12) {
      // roquette : dégâts de zone autour du point d’impact
      burst(end, 22);
      SND.play('boom');
      mFlash.intensity = 14;
      alive.forEach((z) => {
        const dd = z.position.distanceTo(end);
        if (dd < 4.5) hitZombie(z, st.dmg * (1 - dd / 4.5), false, z.position.clone().setY(1.2), t);
      });
      continue;
    }
    if (hit) {
      let r = hit.object;
      while (r && !(r.userData && r.userData.zombie)) r = r.parent;
      if (r) hitZombie(r, k === 3 ? st.dmg / 5 : st.dmg, !!hit.object.userData.head, hit.point, t);
    }
  }
  if (k !== 12 && st.recoil) rig.pitch = Math.max(-1, Math.min(1, rig.pitch + st.recoil * 0.00012));
}
function reload() {
  const st = AV.stats;
  if (!State.armed || !st || !st.mag || State.reloading || State.ammo >= st.mag) return;
  State.reloading = true;
  SND.play('reload');
  hud();
  setTimeout(
    () => {
      State.reloading = false;
      State.ammo = st.mag;
      hud();
    },
    AV.state.weapon === 12 ? 2500 : 1400
  );
}
function playerHurt(n) {
  n *= Math.max(0.35, 1 - 0.06 * (State.bonus || 0));
  State.hp -= n;
  hurtT = 0.5;
  SND.play('hurt');
  hud();
  if (State.hp <= 0) {
    State.hp = 100;
    say(TEXTS.msg.zDead, 5000);
    zRoots.forEach((z) => {
      scene.remove(z);
    });
    zRoots.length = 0;
    State.spawned = State.kills;
    rig.pos.set(0, 1.6, -228 + Z12);
    rig.yaw = 0;
    rig.pitch = 0;
    State.reloading = false;
    State.ammo = AV.stats ? AV.stats.mag : 0;
    hud();
  }
}
const zBlock = (x, z) => {
  for (const c of EXTRA_COLLIDERS)
    if (x > c[0] - 0.3 && x < c[1] + 0.3 && z > c[2] - 0.3 && z < c[3] + 0.3) return true;
  return Math.abs(x) > 74.3 || z < -271 + Z12 || z > -222.4 + Z12;
};
function combatFrame(dt, t) {
  const hurt = document.getElementById('hurt');
  if (hurt) {
    hurtT = Math.max(0, hurtT - dt);
    hurt.style.opacity = hurtT * 1.6;
  }
  if (State.armed && !State.zDone && roomOf(rig.pos.z) === 12 && !State.doorExit) {
    State.spawnT = (State.spawnT || 0) - dt;
    const aliveN = zRoots.filter((z) => z.userData.state === 'walk').length;
    if (State.spawnT <= 0 && aliveN < ZC.maxAlive && State.spawned < CONFIG.zombieTarget + ZC.extra) {
      spawnZombie();
      State.spawnT = ZC.spawnEvery;
    }
  }
  for (let i = zRoots.length - 1; i >= 0; i--) {
    const z = zRoots[i],
      u = z.userData;
    if (u.state === 'walk') {
      const dx = rig.pos.x - z.position.x,
        dz = rig.pos.z - z.position.z,
        d = Math.hypot(dx, dz) || 1;
      z.rotation.y = Math.atan2(dx, dz);
      const sp = (t < (u.stagger || 0) ? 0.25 : 1) * u.speed;
      if (d > 0.95) {
        const sx = (dx / d) * sp * dt,
          sz = (dz / d) * sp * dt;
        if (!zBlock(z.position.x + sx, z.position.z)) z.position.x += sx;
        if (!zBlock(z.position.x, z.position.z + sz)) z.position.z += sz;
      } else if (t > u.nextHit && !State.doorExit) {
        u.nextHit = t + 1;
        playerHurt(ZC.hitDamage);
        u.swipe = t + 0.3;
      }
      for (const o of zRoots)
        if (o !== z && o.userData.state === 'walk') {
          const ox = z.position.x - o.position.x,
            oz = z.position.z - o.position.z,
            od = Math.hypot(ox, oz);
          if (od < 0.6 && od > 0.001) {
            z.position.x += (ox / od) * 0.6 * dt;
            z.position.z += (oz / od) * 0.6 * dt;
          }
        }
      u.phase += dt * sp * 4.2;
      const s = Math.sin(u.phase);
      u.legs[0].rotation.x = s * 0.6;
      u.legs[1].rotation.x = -s * 0.6;
      u.legs[0].userData.k.rotation.x = Math.max(0, -s) * 0.7;
      u.legs[1].userData.k.rotation.x = Math.max(0, s) * 0.7;
      const sw = t < (u.swipe || 0) ? -0.5 : 0;
      u.arms.forEach((a, j) => {
        a.rotation.x = -1.35 + Math.sin(u.phase * 0.7 + j) * 0.12 + sw;
        a.rotation.z = (j ? -1 : 1) * 0.08;
      });
      u.body.rotation.x = 0.16 + u.lean + Math.sin(u.phase * 0.5) * 0.03;
      u.body.position.y = Math.abs(s) * 0.03;
      u.headG.rotation.z = Math.sin(u.phase * 0.4) * 0.12;
      if (State.doorExit) z.visible = false;
    } else {
      // chute puis disparition
      if (u.state === 'collapse') {
        u.state = 'dead';
        u.dieT = t + Math.random() * 0.6;
      }
      const k = Math.min(1, (t - u.dieT) / 0.6);
      if (k >= 0) {
        u.body.rotation.x = 0.16 + (-Math.PI / 2 - 0.16) * k;
        u.body.position.y = -0.55 * k;
        z.rotation.y += 0;
      }
      if (t - u.dieT > 4) {
        z.position.y -= dt * 0.4;
      }
      if (t - u.dieT > 7) {
        scene.remove(z);
        z.traverse((o) => {
          if (o.geometry) o.geometry.dispose();
        });
        zRoots.splice(i, 1);
      }
    }
  }
  for (let i = fxParts.length - 1; i >= 0; i--) {
    const p = fxParts[i];
    p.t += dt;
    p.v.y -= 9 * dt;
    p.m.position.addScaledVector(p.v, dt);
    if (p.m.position.y < 0.03) {
      p.m.position.y = 0.03;
      p.v.set(0, 0, 0);
    }
    if (p.t > 1.4) {
      scene.remove(p.m);
      p.m.geometry.dispose();
      fxParts.splice(i, 1);
    }
  }
  for (let i = fxTracers.length - 1; i >= 0; i--) {
    const f = fxTracers[i];
    f.t += dt;
    if (f.t > 0.06) {
      scene.remove(f.m);
      f.m.geometry.dispose();
      fxTracers.splice(i, 1);
    }
  }
}

/* Atmosphère : poussières en suspension */
// (les faux cônes de lumière ont été retirés : ils faisaient un effet bizarre au plafond)
// Luminaires de plafond sobres : boîtier métallique + diffuseur mat, sous chaque spot
const dust = (() => {
  const n = 5200,
    a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const z = -Math.random() * 275 + 3.7;
    a[i * 3] = (Math.random() - 0.5) * (z < -132 ? 48 : z < -32 ? 36 : 10.6);
    a[i * 3 + 1] = Math.random() * (z < -32 ? 7 : 3.2);
    a[i * 3 + 2] = z;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(a, 3));
  const p = noRay(
    new THREE.Points(
      g,
      new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.018,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    )
  );
  p.visible = false;
  scene.add(p);
  return p;
})();

/* Écrans / voyants initiaux */
screen1.draw(TEXTS.screens.term_off, '#ff6a5a');
