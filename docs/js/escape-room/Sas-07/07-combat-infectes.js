/* LAST REFUGE · XM — Escape room « Sas 07 » · Combat : infectés, tir, munitions, vie.
   Fichier chargé dans l’ordre par escape-room.js : il partage la portée globale des autres fichiers. */
'use strict';
/* ═════════ COMBAT : zombies, tir, munitions, vie ═════════
   Réglages : CONFIG.zombies (nombre simultané, vitesse, dégâts…) et CONFIG.zombieTarget (nombre à abattre).
   Contrôles : clic = tirer là où l’on pointe · Espace = tirer devant soi (maintenir = rafale) · R = recharger. */
const ZC = CONFIG.zombies,
  zRoots = [],
  fxParts = [],
  fxTracers = [],
  zRay = new THREE.Raycaster();
const partM = new THREE.MeshBasicMaterial({ color: 0x7a0d0a }),
  tracM = new THREE.MeshBasicMaterial({
    color: 0xffe6a0,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
const mFlash = new THREE.PointLight(0xffc880, 0, 9, 2);
scene.add(mFlash);
const inSafeZone = (x, z, padding = 0) => MapScenes.safe(x, z, padding);
const townPopulation = [];
function zombieStats(stats) {
  if (!stats || !Number.isFinite(stats.dmg) || stats.dmg <= 0 || !Number.isFinite(stats.rate))
    throw new Error('Statistiques de l’arme indisponibles pour les infectés.');
  const power = Math.min(1, Math.log2(1 + stats.dmg / 25) / 5);
  const ranged = stats.mag > 0 ? 0.38 + 0.3 * Math.sqrt(Math.min(stats.rate, 3000) / 3000) : 0;
  return { hp: Math.ceil(stats.dmg * 4), speed: (0.72 + 0.16 * power + ranged) * 1.4 };
}
function rebalanceZombies() {
  for (const z of zRoots) {
    const u = z.userData;
    if (u.state !== 'walk') continue;
    const stats = zombieStats(AV.stats);
    u.hp = (u.hp / u.maxHp) * stats.hp;
    u.maxHp = stats.hp;
    u.speed = stats.speed;
    if (u.model.bar.visible) ZombieAssets.setZombieHealth(u.model, u.hp / u.maxHp);
  }
}
function makeZombie(record) {
  const weapon = (AV.state && AV.state.weapon) || 2;
  const stats = zombieStats(AV.stats || CL.weaponStats({ ...AV.state, weapon }));
  const model = ZombieAssets.createZombie(record.id);
  const root = model.root;
  root.userData = {
    zombie: true,
    model,
    record,
    hp: stats.hp * record.health,
    maxHp: stats.hp,
    state: 'walk',
    speed: stats.speed,
    nextHit: 0,
    dieT: 0
  };
  if (record.health < 1) ZombieAssets.setZombieHealth(model, record.health);
  return root;
}
function spawnZombie(record) {
  const z = makeZombie(record);
  z.position.set(record.x, record.y, record.z);
  record.root = z;
  scene.add(z);
  zRoots.push(z);
}
function killZombie(z, t) {
  const u = z.userData;
  if (u.state === 'dead') return;
  u.state = 'dead';
  u.record.dead = true;
  u.record.root = null;
  u.record.health = 0;
  u.dieT = t;
  u.animatedDeath = ZombieAssets.killZombieModel(u.model);
  State.kills++;
  SND.play('zdie');
  hud();
  setObjective(objectiveNow());
  if (State.kills >= CONFIG.zombieTarget && !State.zDone) endFight();
}
function endFight() {
  State.zDone = true;
  setObjective(objectiveNow());
  SND.play('success');
  say('Dernier infecté abattu. Le téléporteur de sortie est déverrouillé.', 8000);
}
function hud() {
  const hp = THREE.MathUtils.clamp(State.hp, 0, 100);
  document.getElementById('hpfill').style.width = hp + '%';
  document.getElementById('hpbar').setAttribute('aria-valuenow', String(Math.round(hp * 10) / 10));
  document.getElementById('player-health').textContent = Math.round(hp * 10) / 10 + ' / 100 PV';
  const c = document.getElementById('combat');
  if (!c) return;
  const fighting = State.armed && MapScenes.active === 'town';
  c.style.display = fighting ? 'flex' : 'none';
  document.getElementById('ammo-panel').style.display = fighting ? 'flex' : 'none';
  document.getElementById('wave').textContent = 'INFECTÉS RESTANTS : ' + (CONFIG.zombieTarget - State.kills);
  const st = AV.stats;
  document.getElementById('ammo-state').textContent = State.reloading ? 'RECHARGEMENT…' : 'CHARGEUR';
  document.getElementById('ammo').textContent = st && st.mag ? State.ammo + ' / ' + st.mag : 'ARME BLANCHE';
  document.getElementById('kills').textContent = 'ZOMBIES ABATTUS : ' + State.kills;
}
function equipWeapon() {
  const w = (AV.state && AV.state.weapon) || 2;
  State.armed = true;
  if (!loadAvatar({ ...(AV.state || {}), weapon: w })) {
    State.armed = false;
    hud();
    say('Impossible d’équiper votre personnage. Réessayez.', 5000);
    return false;
  }
  AV.tp = true;
  AV.stats = CL.weaponStats(AV.state);
  State.ammo = AV.stats.mag;
  State.hp = 100;
  State.spawnT = 1.5;
  hud();
  return true;
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
  ZombieAssets.setZombieHealth(u.model, u.hp / u.maxHp);
  burst(p, head ? 9 : 5);
  SND.play('zhit');
  u.stagger = t + 0.25;
  if (u.hp <= 0) killZombie(z, t);
}
let fireT = 0,
  lastFireRequest = -Infinity,
  lastShotSound = -Infinity,
  hurtT = 0,
  healingRemaining = 0,
  wasInSafeZone = false;
function fire(e) {
  if (
    !State.armed ||
    MapScenes.active !== 'town' ||
    State.zDone ||
    State.focus ||
    modalOpen ||
    State.doorExit ||
    rig.locked ||
    State.reloading ||
    inSafeZone(rig.pos.x, rig.pos.z)
  )
    return;
  const t = clock.elapsedTime,
    st = AV.stats;
  if (!st || !Number.isFinite(st.rate) || st.rate <= 0) return;
  const interval = Math.min(3, 60 / st.rate);
  if (t - lastFireRequest > 0.2) fireT = Math.max(fireT, t);
  lastFireRequest = t;
  if (t < fireT) return;
  fireT = Math.max(fireT, t - interval * 2);
  while (fireT <= t + 0.000001) {
    fireT += interval;
    if (!fireShot(e, st, t)) break;
  }
}
function fireShot(e, st, t) {
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
    firstPersonFire(true);
    SND.play('swing');
    const fw = new THREE.Vector3(-Math.sin(rig.yaw), 0, -Math.cos(rig.yaw));
    alive.forEach((z) => {
      const d = z.position.clone().sub(rig.pos);
      d.y = 0;
      const distance = d.length();
      const origin = rig.pos.clone(), target = z.position.clone().add(new THREE.Vector3(0, 1, 0));
      const toward = target.clone().sub(origin);
      if (distance < 2.3 && d.normalize().dot(fw) > 0.25 &&
        !MapScenes.obstruction(new THREE.Ray(origin, toward.clone().normalize()), toward.length()))
        hitZombie(z, st.dmg, false, target, t);
    });
    return true;
  }
  if (st.mag && State.ammo <= 0) {
    SND.play('empty');
    reload();
    return false;
  }
  State.ammo--;
  firstPersonFire(false);
  hud();
  if (k !== 6 || t - lastShotSound >= 0.08) {
    SND.play('shot', k);
    lastShotSound = t;
  }
  mFlash.position.copy(muzzlePos());
  mFlash.intensity = 7;
  gameTimeout(() => (mFlash.intensity = 0), 55);
  const pellets = k === 3 ? 8 : 1,
    spread = ((100 - st.acc) / 100) * (k === 3 ? 0.09 : 0.05) * (1 - 0.7 * aimBlend),
    origin = zRay.ray.origin.clone(),
    direction = zRay.ray.direction.clone();
  for (let i = 0; i < pellets; i++) {
    const o = origin.clone(),
      d = direction.clone();
    d.x += (Math.random() - 0.5) * spread;
    d.y += (Math.random() - 0.5) * spread;
    d.z += (Math.random() - 0.5) * spread;
    d.normalize();
    zRay.set(o, d);
    zRay.far = st.range + 4;
    let hit = zRay.intersectObjects(alive.flatMap((z) => z.userData.model.hitboxes), false)[0];
    const obstruction = MapScenes.obstruction(zRay.ray, hit ? hit.distance : st.range);
    if (obstruction) hit = null;
    const end = obstruction ? obstruction.position : hit ? hit.point : o.clone().addScaledVector(d, st.range);
    tracer(muzzlePos(), end);
    if (k === 12) {
      // roquette : dégâts de zone autour du point d’impact
      burst(end, 22);
      SND.play('boom');
      mFlash.intensity = 14;
      alive.forEach((z) => {
        const dd = z.position.distanceTo(end);
        const target = z.position.clone().add(new THREE.Vector3(0, 1, 0));
        const toward = target.clone().sub(end);
        if (dd < 4.5 && !MapScenes.obstruction(new THREE.Ray(end.clone().addScaledVector(d, -0.02), toward.clone().normalize()), toward.length()))
          hitZombie(z, st.dmg * (1 - dd / 4.5), false, target, t);
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
  return true;
}
function reload() {
  const st = AV.stats;
  if (!State.armed || !st || !st.mag || State.reloading || State.ammo >= st.mag) return;
  State.reloading = true;
  SND.play('reload');
  hud();
  gameTimeout(
    () => {
      State.reloading = false;
      State.ammo = AV.stats ? AV.stats.mag : 0;
      hud();
    },
    AV.state.weapon === 12 ? 2500 : 1400
  );
}
function playerHurt(n) {
  if (MapScenes.active !== 'town' || inSafeZone(rig.pos.x, rig.pos.z)) return false;
  n *= Math.max(0.35, 1 - 0.06 * (State.bonus || 0));
  State.hp -= n;
  hurtT = 0.5;
  SND.play('hurt');
  hud();
  if (State.hp <= 0) {
    State.hp = 100;
    healingRemaining = 0;
    say(TEXTS.msg.zDead, 5000);
    clearTownZombies();
    MapScenes.respawn();
    rig.yaw = -Math.PI / 2;
    rig.pitch = 0;
    State.reloading = false;
    State.ammo = AV.stats ? AV.stats.mag : 0;
    hud();
    return true;
  }
  return false;
}
function clearTownZombies() {
  zRoots.forEach((z) => {
    const u = z.userData;
    if (!u.record.dead) {
      u.record.x = z.position.x;
      u.record.z = z.position.z;
      u.record.health = Math.max(0, u.hp / u.maxHp);
      u.record.root = null;
    }
    scene.remove(z);
    ZombieAssets.disposeZombie(u.model);
  });
  zRoots.length = 0;
}
function combatFrame(dt, t) {
  if (healingRemaining > 0) {
    const amount = Math.min(healingRemaining, 10 * dt, 100 - State.hp);
    State.hp += amount;
    healingRemaining -= amount;
    if (State.hp >= 100 || healingRemaining <= 0.0001) healingRemaining = 0;
    hud();
  }
  const safe = inSafeZone(rig.pos.x, rig.pos.z);
  if (safe !== wasInSafeZone) {
    wasInSafeZone = safe;
    if (State.armed && !State.zDone)
      say(safe ? 'Zone sûre : protégé des infectés, tir interdit.' : 'Vous quittez la zone sûre.', 2500);
  }
  const hurt = document.getElementById('hurt');
  if (hurt) {
    hurtT = Math.max(0, hurtT - dt);
    hurt.style.opacity = hurtT * 1.6;
  }
  if (!State.zDone && MapScenes.active === 'town' && !State.doorExit) {
    State.spawnT = (State.spawnT || 0) - dt;
    const aliveN = zRoots.filter((z) => z.userData.state === 'walk').length;
    if (ZombieAssets.zombiesReady() && State.spawnT <= 0 && aliveN < ZC.maxAlive) {
      const nearby = townPopulation
        .filter((record) => !record.dead && !record.root &&
          Math.hypot(record.x - rig.pos.x, record.z - rig.pos.z) <= 35)
        .sort((a, b) => Math.hypot(a.x - rig.pos.x, a.z - rig.pos.z) - Math.hypot(b.x - rig.pos.x, b.z - rig.pos.z));
      if (nearby.length) spawnZombie(nearby[0]);
      State.spawnT = ZC.spawnEvery;
    }
  }
  for (let i = zRoots.length - 1; i >= 0; i--) {
    const z = zRoots[i],
      u = z.userData,
      scale = MapScenes.zombieScale();
    if (u.state === 'walk') {
      const d = Math.hypot(rig.pos.x - z.position.x, rig.pos.z - z.position.z);
      if (d > 45) {
        u.record.x = z.position.x;
        u.record.z = z.position.z;
        u.record.health = Math.max(0, u.hp / u.maxHp);
        u.record.root = null;
        scene.remove(z);
        ZombieAssets.disposeZombie(u.model);
        zRoots.splice(i, 1);
        continue;
      }
      if (!u.waypoint || Math.hypot(u.waypoint[0] - z.position.x, u.waypoint[1] - z.position.z) < 0.2)
        u.waypoint = MapScenes.zombieTarget(z.position.x, z.position.z);
      const goal = u.waypoint;
      const dx = goal ? goal[0] - z.position.x : 0, dz = goal ? goal[1] - z.position.z : 0;
      const distance = Math.hypot(dx, dz) || 1;
      if (goal) z.rotation.y = Math.atan2(dx, dz);
      const sp = (t < (u.stagger || 0) ? 0.25 : 1) * u.speed;
      if (d > 0.95 * scale && goal) {
        const sx = (dx / distance) * Math.min(distance, sp * dt),
          sz = (dz / distance) * Math.min(distance, sp * dt);
        if (MapScenes.townMove(z.position.x + sx, z.position.z)) z.position.x += sx;
        if (MapScenes.townMove(z.position.x, z.position.z + sz)) z.position.z += sz;
      } else if (d <= 0.95 * scale && t > u.nextHit && !State.doorExit && !safe) {
        const origin = z.position.clone().add(new THREE.Vector3(0, scale, 0));
        const toward = rig.pos.clone().sub(origin);
        if (!MapScenes.obstruction(new THREE.Ray(origin, toward.clone().normalize()), toward.length())) {
          u.nextHit = t + 1;
          if (playerHurt(ZC.hitDamage)) return;
          ZombieAssets.attackZombie(u.model);
        }
      }
      for (const o of zRoots)
        if (o !== z && o.userData.state === 'walk') {
          const ox = z.position.x - o.position.x,
            oz = z.position.z - o.position.z,
            od = Math.hypot(ox, oz);
          if (od < 0.6 * scale && od > 0.001) {
            const sx = (ox / od) * 0.6 * scale * dt,
              sz = (oz / od) * 0.6 * scale * dt;
            if (MapScenes.townMove(z.position.x + sx, z.position.z)) z.position.x += sx;
            if (MapScenes.townMove(z.position.x, z.position.z + sz)) z.position.z += sz;
          }
        }
      ZombieAssets.animateZombie(u.model, dt, d > 0.95 * scale ? sp / scale : 0.35);
      if (State.doorExit) z.visible = false;
    } else {
      // chute puis disparition
      if (u.state === 'collapse') {
        u.state = 'dead';
        u.dieT = t + Math.random() * 0.6;
        u.animatedDeath = ZombieAssets.killZombieModel(u.model);
      }
      const k = Math.min(1, (t - u.dieT) / 0.6);
      if (u.animatedDeath) {
        ZombieAssets.animateZombie(u.model, dt, 1);
      } else if (k >= 0) {
        u.model.body.rotation.x = -Math.PI / 2 * k;
        u.model.body.position.y = -0.55 * k;
      }
      if (t - u.dieT > 4) {
        z.position.y -= dt * 0.4;
      }
      if (t - u.dieT > 7) {
        scene.remove(z);
        ZombieAssets.disposeZombie(u.model);
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
