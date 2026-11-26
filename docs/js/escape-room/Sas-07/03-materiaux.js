/* LAST REFUGE · XM — Escape room « Sas 07 » · Bibliothèque de matériaux (murs, sol, acier, rouille, sang…).
   Fichier chargé dans l’ordre par escape-room.js : il partage la portée globale des autres fichiers. */
'use strict';
/* ════════════════════════════════════════════════════════════════
   3. BIBLIOTHÈQUE DE MATÉRIAUX
   ════════════════════════════════════════════════════════════════ */
const mats = {
  wall: pbr(
    new Surface()
      .base('#5a6054', 0.92, 0.5)
      .grain(24)
      .blob(120, 80, 90, '0,0,0', 0.2, null, 0.4)
      .blob(380, 300, 110, '0,0,0', 0.2, null, 0.4)
      .streaks(5)
      .scratches(12)
      .grime(),
    { rx: 2, ry: 1, bump: 2.4 }
  ),
  band: pbr(
    new Surface()
      .base('#37402f', 0.55, 0.5)
      .grain(18)
      .rust(20)
      .streaks(10)
      .scratches(30)
      .rivets(64, 16)
      .blood(2)
      .grime(0.6),
    { rx: 2, ry: 1, metal: 0.35, bump: 2 }
  ),
  floor: pbr(
    new Surface()
      .base('#2b2e2a', 0.62, 0.5)
      .lines(128)
      .rivets(128, 20)
      .grain(22)
      .rust(8)
      .puddle(130, 150, 70)
      .puddle(380, 360, 90)
      .blood(4, { drip: false })
      .scratches(30)
      .grime(0.5),
    { rx: 2, ry: 2, metal: 0.5, bump: 2 }
  ),
  ceil: pbr(new Surface().base('#25282a', 0.85, 0.5).grain(20).rust(10).streaks(6).grime(0.6), {
    rx: 2,
    ry: 2,
    bump: 2
  }),
  steel: pbr(new Surface().base('#6a6a63', 0.38, 0.5).brush(90).scratches(35).rust(6).grime(0.4), {
    metal: 0.85,
    bump: 1
  }),
  dark: pbr(new Surface().base('#242824', 0.45, 0.5).brush(40).scratches(20).rust(3), {
    metal: 0.8,
    bump: 1
  }),
  rustpipe: pbr(new Surface().base('#5a4636', 0.6, 0.5).rust(34).streaks(6).grain(20), {
    metal: 0.6,
    bump: 2.2
  }),
  door: pbr(
    new Surface()
      .base('#3c4839', 0.5, 0.5)
      .grain(18)
      .brush(40)
      .rust(14)
      .hazard(0, 440, 512, 50)
      .rivets(64, 16)
      .streaks(8)
      .blood(5)
      .scratches(30)
      .grime(0.65),
    { metal: 0.6, bump: 2 }
  ),
  lockerA: pbr(new Surface().base('#44514a', 0.45, 0.5).brush(50).rust(10).scratches(30).grime(0.5), {
    metal: 0.7,
    bump: 1.6
  }),
  lockerB: pbr(new Surface().base('#47524a', 0.45, 0.5).brush(50).rust(8).blood(8).scratches(24).grime(0.5), {
    metal: 0.7,
    bump: 1.6
  }),
  crate: pbr(new Surface().base('#6b5a37', 0.85, 0.5).grain(30).brush(60).rust(3).grime(0.6), { bump: 2.2 }),
  rubber: new THREE.MeshStandardMaterial({ color: 0x0c0d0c, roughness: 0.55 }),
  wood: pbr(
    new Surface()
      .base('#5b4630', 0.8, 0.5)
      .grain(34)
      .brush(90)
      .streaks(3, '60,40,20', 0.4)
      .scratches(16)
      .grime(0.55),
    { bump: 2 }
  ),
  cloth: pbr(
    new Surface()
      .base('#4a5238', 0.92, 0.5)
      .grain(46)
      .streaks(4, '40,44,30', 0.5)
      .blood(2, { drip: false })
      .grime(0.6),
    { bump: 1.4 }
  ),
  glass: new THREE.MeshPhysicalMaterial({
    color: 0x88ffcc,
    transparent: true,
    opacity: 0.22,
    roughness: 0.04,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    depthWrite: false
  })
};
// copie d’un matériau avec une texture répétée plus souvent (pour les très grandes surfaces)
const tiled = (m, rx, ry) => {
  const c = m.clone();
  ['map', 'roughnessMap', 'bumpMap'].forEach((k) => {
    if (m[k]) {
      c[k] = m[k].clone();
      c[k].repeat.set(rx, ry);
      c[k].needsUpdate = true;
    }
  });
  return c;
};
const glow = (hex, i = 3) =>
  new THREE.MeshStandardMaterial({ color: 0x000000, emissive: hex, emissiveIntensity: i }); // éléments qui « brillent » → capturés par le Bloom

// Panneaux-indices (le sang forme réellement le message sur la texture)
function clue1() {
  const s = new Surface()
    .base('#4b5049', 0.6, 0.5)
    .grain(20)
    .brush(60)
    .rust(12)
    .scratches(20)
    .rivets(64, 14)
    .blood(6);
  s.write('4  7', 256, 190, 'bold 160px Georgia', 'rgba(88,8,7,.96)')
    .drips(150, 360, 230, 5)
    .write('_  _', 256, 380, 'bold 130px Georgia', 'rgba(88,8,7,.28)')
    .grime();
  return pbr(s, { metal: 0.5, bump: 2.6 });
}
function clue2() {
  const s = new Surface().base('#4b504a', 0.6, 0.5).grain(20).brush(60).rust(10).rivets(64, 14);
  [
    ['#2fa94f', 110],
    ['#c93a2c', 256],
    ['#3562c9', 402]
  ].forEach(([c, x], i) => {
    s.stamp(
      (g) => {
        g.beginPath();
        g.arc(x, 200, 48, 0, 6.3);
        g.fill();
      },
      c,
      gray(0.3),
      gray(0.7)
    );
    s.write(String(i + 1), x, 330, 'bold 110px Georgia', 'rgba(88,8,7,.95)');
  });
  s.blood(7).drips(90, 420, 300, 6).grime();
  return pbr(s, { metal: 0.5, bump: 2.4 });
}
function paperTex() {
  const s = new Surface(256)
    .base('#cbbf9e', 0.9, 0.5)
    .grain(30)
    .blob(40, 200, 60, '110,80,30', 0.4)
    .blob(210, 40, 50, '110,80,30', 0.35);
  ['…le dernier chiffre a été', 'scellé dans le sang.', 'Il ne reste que 1 9', 'pour finir le code.'].forEach(
    (t, i) => s.write(t, 128, 50 + i * 45, '20px Georgia', 'rgba(40,30,20,.9)')
  );
  s.blood(1, { w: 120, h: 100, drip: false });
  return pbr(s, { bump: 0.6 });
}
