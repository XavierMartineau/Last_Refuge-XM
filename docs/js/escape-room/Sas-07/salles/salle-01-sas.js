/* LAST REFUGE · XM — Escape room « Sas 07 » · Salle 1 : sas d’entrée (générateur, levier, casiers, terminal).
   Fichier chargé dans l’ordre par escape-room.js : il partage la portée globale des autres fichiers. */
'use strict';
shell(9.7, { w: 28, d: 27.4 });
wallWithDoor(-4, 28);
const _r1 = scene.children.length; // salle 1 : x ±7, z de -4 à +9,7
const door1 = makeDoor('door_room1', 0, -3.85, 'Examiner la porte du sas');
// éclairage : NÉONS ÉTEINTS tant que le levier n’est pas abaissé → seule la lampe torche éclaire au début
const spot1 = new THREE.SpotLight(0xdfffe8, 0, 14, 1.05, 0.7, 2);
spot1.position.set(0, 3.25, 0.8);
spot1.target.position.set(0, 0, -0.8);
scene.add(spot1, spot1.target);
const fill1 = new THREE.PointLight(0x7fa0c0, 0, 9, 2);
fill1.position.set(0, 2.8, -2.6);
scene.add(fill1);
const alarm1 = new THREE.PointLight(0xff2010, 0, 8, 2);
alarm1.position.set(-2.5, 3, -3.2);
scene.add(alarm1);
alarms.push(alarm1);
alarm1.userData.on = () => !State.power;
neon.lights.push({ l: spot1, room: 1, base: 90 }, { l: fill1, room: 1, base: 6 });

// Panneau taché de sang n°1 (mur ouest) — contient « 47 »
const p1 = box(1.1, 0.9, 0.05, clue1(), -3.93, 1.7, -1.9);
p1.rotation.y = Math.PI / 2;
interactive(p1, 'panel_blood_01', 'Inspecter le panneau taché', 'inspect', { focusDist: 1.3 });
/* ── Plaque de maintenance : cadre + face en acier rayé/rouillé + 4 vis (0,1 = chromées cruciformes · 2,3 = vieilles vis rouillées de sécurité) ── */
function buildBloodPlate(g) {
  const sf = new Surface(512).base('#454a45', 0.5, 0.5).grain(34).scratches(70).rust(4).grime(0.7);
  sf.write('MAINTENANCE', 256, 92, 'bold 52px Arial', 'rgba(235,200,90,.85)');
  sf.write('ACCÈS RESTREINT', 256, 150, 'bold 28px Arial', 'rgba(235,200,90,.6)');
  const face = pbr(sf, { metal: 0.65, bump: 1.1 });
  box(1.16, 0.96, 0.04, mats.dark, 0, 0, 0, g); // cadre épais
  plane(1.1, 0.9, face, 0, 0, 0.0215, g); // face rayée
  // coulures de rouille sous les deux vieilles vis (bas de la plaque)
  [-0.52, 0.52].forEach((x) => {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 256;
    const k = c.getContext('2d'),
      gr = k.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, 'rgba(150,70,20,.75)');
    gr.addColorStop(0.5, 'rgba(110,50,16,.35)');
    gr.addColorStop(1, 'rgba(90,40,10,0)');
    k.fillStyle = gr;
    k.beginPath();
    k.moveTo(24, 0);
    k.lineTo(40, 0);
    k.lineTo(46, 256);
    k.lineTo(18, 256);
    k.fill();
    const t = new THREE.CanvasTexture(c);
    const p = new THREE.Mesh(
      new THREE.PlaneGeometry(0.12, 0.42),
      new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false })
    );
    p.position.set(x, -0.36, 0.0235);
    g.add(p);
  });
  const chrome = new THREE.MeshStandardMaterial({ color: 0xd5dade, roughness: 0.22, metalness: 1 }),
    dk = new THREE.MeshStandardMaterial({ color: 0x15171a, roughness: 0.7 }),
    rsf = new Surface(64).base('#5a3418', 0.95, 0.4).grain(70).rust(14),
    rust = pbr(rsf, { metal: 0.3, bump: 3 }),
    rw = new THREE.MeshStandardMaterial({ color: 0x4a2a12, roughness: 1, metalness: 0.4 }),
    screws = [];
  [
    [-0.52, 0.42],
    [0.52, 0.42],
    [-0.52, -0.42],
    [0.52, -0.42]
  ].forEach(([sx, sy], i) => {
    const s = new THREE.Group();
    s.position.set(sx, sy, 0.03);
    s.userData.y0 = sy;
    s.userData.good = i < 2;
    g.add(s);
    if (i < 2) {
      // vis en bon état : rondelle + tête chromée bombée + empreinte cruciforme
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.046, 0.006, 18), chrome);
      w.rotation.x = Math.PI / 2;
      s.add(w);
      const h = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.034, 0.016, 18), chrome);
      h.rotation.x = Math.PI / 2;
      h.position.z = 0.01;
      s.add(h);
      const d = new THREE.Mesh(new THREE.SphereGeometry(0.03, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), chrome);
      d.rotation.x = Math.PI / 2;
      d.scale.set(1, 0.35, 1);
      d.position.z = 0.017;
      s.add(d);
      box(0.05, 0.006, 0.004, dk, 0, 0, 0.0235, s);
      box(0.006, 0.05, 0.004, dk, 0, 0, 0.0235, s);
    } else {
      // vieille vis : tête irrégulière rouillée, rondelle tordue, empreinte arrachée
      const gm = new THREE.IcosahedronGeometry(0.034, 1),
        pos = gm.attributes.position;
      for (let v = 0; v < pos.count; v++) {
        const j = (Math.sin(v * 12.9898 + i * 3.1) * 43758.5453) % 1;
        pos.setXYZ(
          v,
          pos.getX(v) * (1 + 0.16 * j),
          pos.getY(v) * (1 + 0.16 * j),
          pos.getZ(v) * (0.55 + 0.2 * j)
        );
      }
      gm.computeVertexNormals();
      const h = new THREE.Mesh(gm, rust);
      h.position.z = 0.012;
      s.add(h);
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.044, 0.007, 7), rw);
      w.rotation.x = Math.PI / 2;
      w.rotation.z = i;
      s.add(w);
      box(0.034, 0.006, 0.004, dk, 0.004, 0.002, 0.025, s).rotation.z = 0.4;
    } // empreinte à moitié rongée
    screws.push(s);
  });
  return screws;
}
const bloodCover = new THREE.Group();
bloodCover.position.set(p1.position.x + 0.045, p1.position.y, p1.position.z);
bloodCover.rotation.y = Math.PI / 2;
scene.add(bloodCover);
const bloodScrews = buildBloodPlate(bloodCover);
decal(bloodDecal(2), 0.7, 0.5, 0.1, -0.05, 0.019, bloodCover);
bloodCover.traverse((c) => {
  c.raycast = () => {};
});
/* ── Outil animé devant la plaque : tournevis (rotation + vis qui sort) ou perceuse (vibration, étincelles, vis détruite) ── */
function toolDriver(g) {
  const hm = new THREE.MeshStandardMaterial({ color: 0xd8b020, roughness: 0.5 }),
    bk = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.6 });
  const h = cyl(0.024, 0.13, hm, 0, 0, 0.19, g, 14);
  h.rotation.x = Math.PI / 2;
  const gr = cyl(0.026, 0.05, bk, 0, 0, 0.2, g, 14);
  gr.rotation.x = Math.PI / 2;
  const sh = cyl(0.006, 0.14, mats.steel, 0, 0, 0.07, g, 8);
  sh.rotation.x = Math.PI / 2;
  const tp = box(0.012, 0.003, 0.012, mats.steel, 0, 0, 0.003, g);
}
function toolDrill(g) {
  const org = new THREE.MeshStandardMaterial({ color: 0xd06a10, roughness: 0.5, metalness: 0.2 }),
    bk = new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.6 });
  box(0.07, 0.08, 0.2, org, 0, 0.01, 0.19, g);
  box(0.05, 0.12, 0.05, bk, 0, -0.07, 0.22, g);
  box(0.075, 0.04, 0.1, bk, 0, -0.14, 0.2, g);
  const ch = cyl(0.017, 0.05, mats.steel, 0, 0.01, 0.075, g, 12);
  ch.rotation.x = Math.PI / 2;
  const bit = cyl(0.004, 0.09, mats.steel, 0, 0.01, 0.03, g, 6);
  bit.rotation.x = Math.PI / 2;
  g.userData.bit = bit;
}
function plateTool(kind, list) {
  return new Promise(async (done) => {
    const tl = new THREE.Group();
    (kind === 'drill' ? toolDrill : toolDriver)(tl);
    tl.traverse((c) => {
      c.raycast = () => {};
    });
    bloodCover.add(tl);
    const wp = new THREE.Vector3();
    for (const i of list) {
      const sc = bloodScrews[i],
        sx = sc.position.x,
        sy = sc.position.y,
        y0 = sc.userData.y0;
      tl.position.set(sx + 0.4, sy - 0.3, 0.6);
      tl.rotation.set(0, 0, 0);
      await tween(0.4, (k) => tl.position.set(sx + 0.4 * (1 - k), sy - 0.3 * (1 - k), 0.6 - 0.55 * k)); // l'outil arrive devant la vis
      if (kind === 'driver') {
        for (let n = 0; n < 5; n++) setTimeout(() => SND.play('click'), n * 170);
        await tween(
          0.95,
          (k) => {
            const a = -k * Math.PI * 4;
            tl.rotation.z = a;
            sc.rotation.z = a;
            sc.position.z = 0.03 + 0.07 * k;
            tl.position.z = 0.05 + 0.07 * k;
            tl.position.x = sx + Math.sin(k * 45) * 0.003;
          },
          (k) => k
        ); // dévissage : l'outil et la vis tournent ensemble
        SND.play('padfall');
        await tween(
          0.55,
          (k) => {
            sc.position.y = y0 - 0.55 * k * k;
            sc.position.z = 0.1 + 0.1 * k;
            sc.rotation.x = 0.8 * k;
            tl.position.z = 0.12 + 0.4 * k;
            tl.position.x = sx + 0.3 * k;
          },
          (k) => k
        );
        sc.visible = false;
      } else {
        SND.play('drill');
        for (let n = 0; n < 4; n++)
          setTimeout(
            () => {
              bloodCover.localToWorld(wp.set(sx, sy, 0.07));
              sparkBurst(wp.x, wp.y, wp.z);
            },
            180 + n * 330
          );
        await tween(
          1.5,
          (k) => {
            tl.position.set(
              sx + (Math.random() - 0.5) * 0.007,
              sy + (Math.random() - 0.5) * 0.007,
              0.05 + 0.008 * Math.sin(k * 60)
            );
            sc.scale.setScalar(1 - 0.65 * k);
            sc.rotation.z = k * 50;
            if (tl.userData.bit) tl.userData.bit.rotation.y = k * 200;
          },
          (k) => k
        );
        sc.visible = false;
        await tween(
          0.45,
          (k) => {
            tl.position.z = 0.05 + 0.5 * k;
            tl.position.x = sx + 0.3 * k;
          },
          (k) => k
        );
      }
    }
    bloodCover.remove(tl);
    done();
  });
} // le clic traverse la plaque et vise le panneau
decal(bloodDecal(3), 1.6, 1.6, -3.97, 1.2, -1.9, scene, Math.PI / 2);

// Levier d’alimentation (mur ouest)
const lever = new THREE.Group();
lever.position.set(-3.9, 1.35, 1.4);
lever.rotation.y = Math.PI / 2;
scene.add(lever);
box(0.32, 0.55, 0.06, mats.dark, 0, 0, 0, lever);
const arm = new THREE.Group();
arm.position.set(0, 0, 0.05);
arm.rotation.z = 0.65;
lever.add(arm);
cyl(0.02, 0.36, mats.steel, 0, 0.18, 0, arm, 8);
const knob = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), glow(0xb01010, 0.6));
knob.position.set(0, 0.37, 0);
arm.add(knob);
const leverLed = box(0.05, 0.05, 0.02, glow(0xff2a1a, 3), 0, -0.22, 0.04, lever);
decal(bloodDecal(2), 0.6, 0.7, 0, -0.1, 0.035, lever);
interactive(lever, 'switch_power', 'Actionner le levier', 'toggle', { arm, led: leverLed, focusDist: 1.3 });
const genG = new THREE.Group();
genG.position.set(-3.0, 0, -3.42);
scene.add(genG); // petit générateur de secours, au fond du sas
box(0.95, 0.12, 0.6, mats.dark, 0, 0.1, 0, genG);
box(0.88, 0.52, 0.52, mats.lockerA, 0, 0.42, 0, genG);
box(0.8, 0.05, 0.46, mats.dark, 0, 0.7, 0, genG);
cyl(0.2, 0.32, mats.rustpipe, -0.18, 0.9, 0, genG, 16).rotation.z = Math.PI / 2; // réservoir
cyl(0.045, 0.5, mats.rustpipe, 0.3, 0.95, 0.12, genG, 10); // échappement
for (let i = 0; i < 5; i++) box(0.5, 0.012, 0.01, mats.dark, 0.08, 0.5 + i * 0.06, 0.27, genG); // grille
const genCord = new THREE.Group();
genCord.position.set(-0.3, 0.55, 0.28);
genG.add(genCord);
box(0.12, 0.05, 0.04, mats.rustpipe, 0, -0.03, 0.03, genCord);
box(0.012, 0.12, 0.012, mats.dark, 0, 0.05, 0, genCord); // poignée du lanceur
const genLed = box(0.05, 0.05, 0.02, glow(0xff2a1a, 3), 0.3, 0.55, 0.27, genG);
decal(bloodDecal(2), 0.5, 0.4, 0.1, 0.4, 0.265, genG);
const genBatMesh = new THREE.Group();
genBatMesh.position.set(0.25, 0.76, -0.05);
genG.add(genBatMesh);
genBatMesh.visible = false; // batterie branchée sur le dessus
box(0.22, 0.13, 0.13, mats.dark, 0, 0, 0, genBatMesh);
box(
  0.2,
  0.04,
  0.005,
  new THREE.MeshStandardMaterial({ color: 0xd8b420, roughness: 0.6 }),
  0,
  0.01,
  0.068,
  genBatMesh
);
cyl(0.02, 0.03, mats.steel, -0.07, 0.08, 0, genBatMesh, 8);
cyl(0.02, 0.03, mats.steel, 0.07, 0.08, 0, genBatMesh, 8);
const genLamp = new THREE.PointLight(0xffa550, 0, 6, 2);
genLamp.position.set(0, 1, 0.6);
genG.add(genLamp);

const cvTex = (w, h, fn) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  fn(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};
const dial = cvTex(128, 128, (x, w, h) => {
  x.fillStyle = '#16181a';
  x.beginPath();
  x.arc(64, 64, 62, 0, 7);
  x.fill();
  x.strokeStyle = '#8a8a80';
  x.lineWidth = 4;
  x.stroke();
  x.fillStyle = '#8a1a12';
  x.beginPath();
  x.moveTo(64, 70);
  x.arc(64, 70, 50, -Math.PI / 2 - 1.0, -Math.PI / 2 - 0.5);
  x.closePath();
  x.fill();
  x.strokeStyle = '#e8e2c8';
  x.lineWidth = 3;
  for (let i = 0; i <= 8; i++) {
    const a = -Math.PI / 2 + 1.0 - i * 0.25,
      r1 = 40,
      r2 = i % 4 ? 46 : 52;
    x.beginPath();
    x.moveTo(64 + Math.cos(a) * r1, 70 + Math.sin(a) * r1);
    x.lineTo(64 + Math.cos(a) * r2, 70 + Math.sin(a) * r2);
    x.stroke();
  }
  x.fillStyle = '#e8e2c8';
  x.font = 'bold 20px Arial';
  x.textAlign = 'center';
  x.fillText('E', 24, 60);
  x.fillText('F', 104, 60);
  x.font = 'bold 13px Arial';
  x.fillText('ESSENCE', 64, 104);
});
const gaugeD = new THREE.Mesh(
  new THREE.PlaneGeometry(0.16, 0.16),
  new THREE.MeshBasicMaterial({ map: dial, toneMapped: false })
);
gaugeD.position.set(-0.18, 0.95, 0.205);
genG.add(gaugeD);
const genNeedle = new THREE.Group();
genNeedle.position.set(-0.18, 0.93, 0.208);
genNeedle.rotation.z = 1.0;
genG.add(genNeedle);
genNeedle.userData.t = 1.0;
box(
  0.007,
  0.06,
  0.002,
  new THREE.MeshBasicMaterial({ color: 0xff3a22, toneMapped: false }),
  0,
  0.03,
  0,
  genNeedle
);
const bayG = new THREE.Group();
bayG.position.set(0.25, 0.735, -0.05);
genG.add(bayG);
box(0.28, 0.02, 0.19, mats.dark, 0, 0, 0, bayG);
[-0.07, 0.07].forEach((x, i) => {
  cyl(0.02, 0.03, mats.steel, x, 0.025, 0, bayG, 8);
  box(
    0.012,
    0.012,
    0.14,
    new THREE.MeshStandardMaterial({ color: i ? 0x151515 : 0x8a1010, roughness: 0.7 }),
    x,
    0.02,
    0.1,
    bayG
  );
});
const bayLbl = cvTex(256, 96, (x, w, h) => {
  x.fillStyle = '#2a0c0a';
  x.fillRect(0, 0, w, h);
  x.strokeStyle = '#ff6a50';
  x.lineWidth = 5;
  x.strokeRect(4, 4, w - 8, h - 8);
  x.fillStyle = '#ff6a50';
  x.font = 'bold 34px Arial';
  x.textAlign = 'center';
  x.fillText('BATTERIE', 128, 42);
  x.fillText('MANQUANTE', 128, 78);
});
const bayP = new THREE.Mesh(
  new THREE.PlaneGeometry(0.26, 0.1),
  new THREE.MeshBasicMaterial({ map: bayLbl, toneMapped: false })
);
bayP.rotation.x = -Math.PI / 2;
bayP.position.set(0, 0.012, -0.01);
bayG.add(bayP);
bayP.position.z = 0.0;
bayP.rotation.z = 0;
function genItems() {
  return [
    ['Trouver une batterie (casier ouvert)', State.battery || State.genBat],
    ['Trouver une pince coupante (caisse à outils)', State.cutters],
    ['Couper le cadenas du casier 1 : bidon d’essence', State.fuel || State.genFuel],
    ['Trouver le câble de masse (zone de stockage, sud-est)', State.cable || State.genGround],
    ['Brancher la batterie au générateur', State.genBat],
    ['Remplir le réservoir', State.genFuel],
    ['Raccorder le câble de masse', State.genGround],
    ['Ouvrir la vanne de carburant', State.valve],
    ['Démarrer le générateur', State.gen1]
  ];
}
function genSync() {
  try {
    bayG.visible = !State.genBat;
    const tg = State.genFuel ? -1.0 : 1.0;
    if (genNeedle.userData.t !== tg) {
      genNeedle.userData.t = tg;
      const a = genNeedle.rotation.z;
      tween(1.4, (k) => {
        genNeedle.rotation.z = a + (tg - a) * k + (k < 1 ? Math.sin(k * 40) * 0.04 * (1 - k) : 0);
      });
    }
    const el = document.getElementById('genq');
    if (!el) return;
    if (window.genRender) return genRender(el);
    el.innerHTML =
      '<h4>GÉNÉRATEUR</h4><div class="' +
      (State.genBat ? '' : 'bad') +
      '">Batterie : ' +
      (State.genBat ? 'branchée' : 'MANQUANTE') +
      '</div><div class="' +
      (State.genFuel ? '' : 'bad') +
      '">Réservoir : ' +
      (State.genFuel ? 'plein (100 %)' : '0 % — vide') +
      '</div><div style="margin-top:5px">' +
      genItems()
        .map(([l, d]) => '<div class="' + (d ? 'd' : '') + '">' + (d ? '☑ ' : '☐ ') + l + '</div>')
        .join('') +
      '</div>';
  } catch (e) {}
}
/* Fiche du générateur (thème militaire) : voyants d’état, jauge de carburant, procédure à cocher */
window.genRender = function (el) {
  const row = (ok, l, v) =>
    '<div class="gr ' + (ok ? 'ok' : 'bad') + '"><i></i><span>' + l + '</span><b>' + v + '</b></div>';
  el.innerHTML =
    '<div class="gh"><span>GÉNÉRATEUR DE SECOURS</span><em>GX-07 · 230 V</em></div>' +
    row(State.genBat, 'Batterie', State.genBat ? 'BRANCHÉE' : 'MANQUANTE') +
    '<div class="gr ' +
    (State.genFuel ? 'ok' : 'bad') +
    '"><i></i><span>Réservoir</span><b>' +
    (State.genFuel ? '100 %' : '0 %') +
    '</b></div><div class="gbar"><u style="width:' +
    (State.genFuel ? 100 : 3) +
    '%"></u></div>' +
    row(State.genGround, 'Mise à la terre', State.genGround ? 'RACCORDÉE' : 'ABSENTE') +
    row(State.valve, 'Vanne carburant', State.valve ? 'OUVERTE' : 'FERMÉE') +
    '<div class="gt">PROCÉDURE DE DÉMARRAGE</div>' +
    genItems()
      .map(([l, d]) => '<div class="gc' + (d ? ' d' : '') + '"><i></i>' + l + '</div>')
      .join('');
};
function genCard() {
  genSync();
  const el = document.getElementById('genq');
  if (el) el.style.display = 'block';
}
function genHide() {
  const el = document.getElementById('genq');
  if (el) el.style.display = 'none';
}
interactive(genG, 'gen_sas', 'Examiner le générateur', 'toggle', {
  led: genLed,
  focusDist: 1.5,
  focusFn: (c) => c.clone().add(new THREE.Vector3(0.05, 0.6, 1.25))
});

const SPARKL = new THREE.PointLight(0xffeeaa, 0, 4, 2);
scene.add(SPARKL);
function sparkBurst(x, y, z) {
  const n = 30,
    g = new THREE.BufferGeometry(),
    pos = new Float32Array(n * 3),
    vel = [];
  for (let i = 0; i < n; i++) {
    vel.push(
      new THREE.Vector3((Math.random() - 0.5) * 1.8, Math.random() * 1.6 + 0.4, (Math.random() - 0.5) * 1.8)
    );
  }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const m = new THREE.PointsMaterial({
      color: 0xffe9a0,
      size: 0.06,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false
    }),
    p = new THREE.Points(g, m);
  p.frustumCulled = false;
  scene.add(p);
  const L = SPARKL;
  L.position.set(x, y, z);
  tween(
    0.9,
    (k) => {
      const tt = k * 0.9;
      for (let i = 0; i < n; i++) {
        pos[i * 3] = x + vel[i].x * tt;
        pos[i * 3 + 1] = y + vel[i].y * tt - 2.2 * tt * tt;
        pos[i * 3 + 2] = z + vel[i].z * tt;
      }
      g.attributes.position.needsUpdate = true;
      m.opacity = 1 - k;
      L.intensity = 8 * (1 - k) * (Math.random() < 0.65 ? 1 : 0.25);
      if (k >= 1) {
        scene.remove(p);
        L.intensity = 0;
        g.dispose();
        m.dispose();
      }
    },
    (k) => k
  );
}

// Terminal (mur est) avec écran + digicode
const term = new THREE.Group();
term.position.set(3.4, 0, -1.7);
term.rotation.y = -Math.PI / 2;
scene.add(term);
box(1.5, 0.85, 0.7, mats.dark, 0, 0.425, 0, term);
box(0.66, 0.46, 0.07, mats.dark, 0, 1.2, -0.12, term);
const screen1 = makeScreen(0.56, 0.36);
screen1.mesh.position.set(0, 1.2, -0.08);
term.add(screen1.mesh);
box(0.24, 0.03, 0.3, mats.steel, 0.4, 0.87, 0.12, term);
for (let i = 0; i < 12; i++)
  box(
    0.045,
    0.02,
    0.045,
    mats.dark,
    0.4 + ((i % 3) - 1) * 0.06,
    0.89,
    0.12 + (Math.floor(i / 3) - 1.5) * 0.06,
    term
  );
interactive(term, 'terminal_01', 'Utiliser le terminal', 'keypad', { focusDist: 1.1 });
decal(bloodDecal(3), 0.9, 0.9, -0.3, 0.851, 0.1, term, 0, -Math.PI / 2);

// Casiers (mur sud) : le n°3 s’ouvre et contient la note
const hitBox = (w, h, d, x, y, z, p) => {
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
  );
  m.position.set(x, y, z);
  m.visible = false;
  m.userData.hit = true;
  p.add(m);
  return m;
}; // visible=false : jamais rendue ni contourée, mais toujours « cliquable » (le Raycaster ignore .visible)     // zone de clic invisible
const padMat = new THREE.MeshStandardMaterial({ color: 0x6b5a34, metalness: 0.85, roughness: 0.5 });
function padlock(par, x, y, z) {
  const G = new THREE.Group();
  G.position.set(x, y, z);
  par.add(G);
  box(0.1, 0.085, 0.045, padMat, 0, 0, 0, G); // cadenas : corps + anse + trou de serrure
  const sh = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.0075, 8, 16, Math.PI), mats.steel);
  sh.position.set(0, 0.042, 0);
  G.add(sh);
  box(0.012, 0.022, 0.01, mats.dark, 0, -0.008, 0.025, G);
  return G;
}
const lockers = [];
for (let i = 0; i < 4; i++) {
  const g = new THREE.Group();
  g.position.set(-1.7 + i * 1.15, 0, 3.72);
  g.rotation.y = Math.PI;
  scene.add(g);
  box(0.85, 2.05, 0.5, i % 2 ? mats.lockerB : mats.lockerA, 0, 1.025, -0.25, g);
  plane(0.74, 1.92, new THREE.MeshBasicMaterial({ color: 0x000000 }), 0, 1.0, 0.003, g); // cavité sombre
  const dp = new THREE.Group();
  dp.position.set(-0.425, 0, 0.01);
  g.add(dp); // charnière
  box(0.84, 2.02, 0.04, i % 2 ? mats.lockerB : mats.lockerA, 0.42, 1.03, 0, dp);
  for (let k = 0; k < 6; k++) box(0.5, 0.02, 0.03, mats.dark, 0.42, 1.75 - k * 0.05, 0.025, dp); // grille d’aération
  box(0.03, 0.2, 0.05, mats.steel, 0.72, 1.0, 0.04, dp);
  const pad = i !== 2 ? padlock(dp, 0.72, 0.9, 0.07) : null; // casiers 1, 2 et 4 : cadenas rouillé
  hitBox(0.84, 2.0, 0.2, 0, 1.02, 0.08, g); // zone de clic sur toute la porte (cadenas compris)
  interactive(g, `locker_0${i + 1}`, i === 2 ? 'Ouvrir le casier' : 'Inspecter le casier', 'open', {
    pivot: dp,
    pad,
    focusDist: 1.6
  });
  lockers.push(g);
}
const note = box(0.24, 0.005, 0.32, paperTex(), 0, 1.2, 0, lockers[2]);
note.rotation.x = -Math.PI / 2 + 0.1;
note.position.z = 0.02;
interactive(note, 'note_log', 'Lire la note', 'inspect', {
  focusDist: 0.7,
  focusFn: (c) => c.clone().add(new THREE.Vector3(0, 0.04, -0.62))
});
const lkStuff = new THREE.Group();
lockers[2].add(lkStuff); // étagère + batterie (visibles seulement quand le casier est ouvert)
box(0.7, 0.03, 0.2, mats.steel, 0, 0.9, 0.1, lkStuff);
const batG = new THREE.Group();
batG.position.set(-0.15, 0.98, 0.1);
lkStuff.add(batG);
box(0.2, 0.12, 0.12, mats.dark, 0, 0, 0, batG);
box(
  0.18,
  0.04,
  0.005,
  new THREE.MeshStandardMaterial({ color: 0xd8b420, roughness: 0.6 }),
  0,
  0.01,
  0.063,
  batG
);
cyl(0.018, 0.03, mats.steel, -0.06, 0.075, 0, batG, 8);
cyl(0.018, 0.03, mats.steel, 0.06, 0.075, 0, batG, 8);
interactive(batG, 'battery_01', 'Prendre la batterie', 'pickup', { focusDist: 0.8 });
function lockerStuff(on) {
  [lkStuff, note].forEach((o) => {
    o.visible = on;
    o.traverse((c) => {
      c.raycast = on ? THREE.Mesh.prototype.raycast : () => {};
    });
  });
}
lockerStuff(false);
const lkItems = [null, null, null, null];
function lkShow(g, on) {
  g.visible = on;
  g.traverse((c) => {
    c.raycast = on ? THREE.Mesh.prototype.raycast : () => {};
  });
}
{
  // casier 1 : le bidon d'essence
  const s = new THREE.Group();
  lockers[0].add(s);
  const red = new THREE.MeshStandardMaterial({ color: 0x8a1c14, roughness: 0.55, metalness: 0.3 }),
    c = new THREE.Group();
  c.position.set(0, 0.04, 0.17);
  c.rotation.y = 0.25;
  s.add(c);
  box(0.36, 0.44, 0.16, red, 0, 0.22, 0, c);
  box(0.1, 0.04, 0.14, red, 0.1, 0.46, 0, c);
  box(0.1, 0.02, 0.04, mats.dark, -0.1, 0.46, 0, c);
  cyl(0.03, 0.05, mats.dark, 0.1, 0.5, 0, c, 8);
  box(
    0.3,
    0.12,
    0.005,
    new THREE.MeshStandardMaterial({ color: 0xe0c040, roughness: 0.7 }),
    0,
    0.26,
    0.083,
    c
  );
  hitBox(0.5, 0.6, 0.3, 0, 0.3, 0, c);
  interactive(c, 'fuelcan_01', 'Prendre le bidon d’essence', 'pickup', { focusDist: 0.9 });
  lkItems[0] = s;
  lkShow(s, false);
}
{
  // casier 2 : le tournevis, posé sur une étagère
  const s = new THREE.Group();
  lockers[1].add(s);
  box(0.7, 0.03, 0.2, mats.steel, 0, 0.9, 0.1, s);
  const t = new THREE.Group();
  t.position.set(0.05, 0.94, 0.1);
  t.rotation.y = 0.5;
  s.add(t);
  cyl(
    0.017,
    0.1,
    new THREE.MeshStandardMaterial({ color: 0xd8b020, roughness: 0.6 }),
    0,
    0,
    0,
    t,
    10
  ).rotation.z = Math.PI / 2;
  cyl(0.005, 0.11, mats.steel, 0.1, 0, 0, t, 6).rotation.z = Math.PI / 2;
  hitBox(0.3, 0.12, 0.15, 0.05, 0, 0, t);
  interactive(t, 'screwdriver_01', 'Prendre le tournevis', 'pickup', { focusDist: 0.7 });
  lkItems[1] = s;
  lkShow(s, false);
}
{
  // casier 4 : le badge d'accès
  const s = new THREE.Group();
  lockers[3].add(s);
  box(0.7, 0.03, 0.2, mats.steel, 0, 0.9, 0.1, s);
  const b = new THREE.Group();
  b.position.set(-0.1, 0.935, 0.1);
  b.rotation.y = -0.3;
  s.add(b);
  box(0.09, 0.004, 0.058, new THREE.MeshStandardMaterial({ color: 0xd8d8cc, roughness: 0.6 }), 0, 0, 0, b);
  box(
    0.09,
    0.005,
    0.016,
    new THREE.MeshStandardMaterial({ color: 0x2a4a9a, roughness: 0.5 }),
    0,
    0.001,
    -0.02,
    b
  );
  hitBox(0.2, 0.1, 0.15, 0, 0.02, 0, b);
  interactive(b, 'badge_01', 'Prendre le badge d’accès', 'pickup', { focusDist: 0.7 });
  lkItems[3] = s;
  lkShow(s, false);
}
{
  // la perceuse sans fil, par terre au fond du casier 4
  const s = lkItems[3],
    d = new THREE.Group();
  d.position.set(0.1, 0.04, 0.17);
  d.rotation.y = 0.6;
  s.add(d);
  const org = new THREE.MeshStandardMaterial({ color: 0xd06a10, roughness: 0.55, metalness: 0.3 });
  box(0.24, 0.075, 0.06, org, 0, 0.06, 0, d);
  box(0.05, 0.14, 0.05, mats.dark, -0.04, 0.0, 0, d);
  box(0.09, 0.05, 0.07, mats.dark, -0.04, -0.06, 0, d);
  cyl(0.014, 0.1, mats.steel, 0.16, 0.062, 0, d, 8).rotation.z = Math.PI / 2;
  hitBox(0.34, 0.25, 0.2, 0, 0.05, 0, d);
  interactive(d, 'drill_01', 'Prendre la perceuse', 'pickup', { focusDist: 0.8 });
  lkShow(s, false);
}

// Décor : caisses, barils, câbles, flaque de sang au sol
box(1, 0.7, 0.8, mats.crate, 2.9, 0.35, 2.9);
box(0.8, 0.6, 0.7, mats.crate, 2.9, 1.0, 2.9);
[
  [-3.2, 3.1],
  [-3.3, 2.3]
].forEach(([x, z]) => cyl(0.32, 0.95, mats.rustpipe, x, 0.475, z));
decal(bloodDecal(5), 2.2, 2.2, 0.6, 0.015, 0.6, scene, 0, -Math.PI / 2);
cable(new THREE.Vector3(-3.9, 3.1, -3), new THREE.Vector3(-3.9, 2.6, 3), 0.7);
cable(new THREE.Vector3(3.9, 3.1, -3.5), new THREE.Vector3(3.9, 2.8, 1.5), 0.5, 0.03);
{
  const fan = new THREE.Group();
  fan.position.set(3.95, 2.5, -3);
  fan.rotation.y = -Math.PI / 2;
  scene.add(fan);
  box(0.7, 0.7, 0.06, mats.dark, 0, 0, 0, fan);
  const bl = new THREE.Group();
  bl.position.z = 0.05;
  fan.add(bl);
  for (let i = 0; i < 4; i++) {
    const b = box(0.28, 0.06, 0.01, mats.steel, 0, 0.14, 0, bl);
    b.position.applyAxisAngle(new THREE.Vector3(0, 0, 1), (i * Math.PI) / 2);
    b.rotation.z = (i * Math.PI) / 2;
  }
  spinners.push(bl);
}

/* ───────── DÉCOR SUPPLÉMENTAIRE : matériaux, petits constructeurs, pièce 1 plus remplie ───────── */
mats.mattress = pbr(
  new Surface()
    .base('#4a4a3c', 0.9, 0.5)
    .grain(30)
    .blob(150, 200, 110, '90,10,10', 0.5, null, 0.6)
    .blob(380, 120, 90, '60,50,30', 0.5)
    .blood(3, { drip: false })
    .grime(0.5),
  { bump: 2 }
);
mats.cloth = pbr(new Surface().base('#3d4637', 0.95, 0.5).grain(34).streaks(4, '30,30,20', 0.5).grime(0.6), {
  bump: 2.2
});
mats.wood = pbr(
  new Surface()
    .base('#5c4630', 0.8, 0.5)
    .grain(30)
    .brush(70)
    .streaks(5, '40,26,14', 0.4)
    .scratches(26)
    .grime(0.5),
  { bump: 2 }
);
mats.bag = pbr(new Surface().base('#0f1112', 0.35, 0.5).brush(20).scratches(14).blood(3), {
  metal: 0.1,
  bump: 1
});
const plateMat = (txt, bg = '#4b5049') => {
  const sf = new Surface(256).base(bg, 0.6, 0.5).grain(20).rust(3);
  sf.write(txt, 128, 140, 'bold 170px Georgia', 'rgba(88,8,7,.95)');
  sf.blood(1, { drip: false });
  return pbr(sf, { metal: 0.4, bump: 1.6 });
};
const sign = (lines, bg = '#b48a22', fg = '#15171a') => {
  const sf = new Surface(256).base(bg, 0.5, 0.5).grain(16).rust(2);
  lines.forEach((t, i) => sf.write(t, 128, 70 + i * 58, 'bold 46px Arial', fg));
  return pbr(sf, { metal: 0.3, bump: 1 });
};
const paperTex2 = (lines) => {
  const sf = new Surface(256)
    .base('#cbbf9e', 0.9, 0.5)
    .grain(30)
    .blob(40, 200, 60, '110,80,30', 0.4)
    .blob(210, 40, 50, '110,80,30', 0.35);
  lines.forEach((t, i) => sf.write(t, 128, 40 + i * 36, '17px Georgia', 'rgba(40,30,20,.9)'));
  sf.blood(1, { w: 120, h: 100, drip: false });
  return pbr(sf, { bump: 0.6 });
};
const beacon = (x, y, z, on) => {
  const m = glow(0xff2a1a, 0),
    b = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), m);
  b.position.set(x, y, z);
  scene.add(b);
  box(0.2, 0.05, 0.2, mats.dark, x, y + 0.1, z);
  beacons.push({ m, on });
};
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// Pièce 1 : banc, sac mortuaire, armoire à pharmacie
box(0.5, 0.06, 1.9, mats.wood, 3.6, 0.45, 0.85);
[-0.8, 0.8].forEach((dz) => box(0.06, 0.45, 0.4, mats.dark, 3.6, 0.225, 0.85 + dz));
const bag = new THREE.Group();
bag.position.set(-2.3, 0, 0.1);
bag.rotation.y = 0.12;
scene.add(bag);
box(0.62, 0.2, 1.9, mats.bag, 0, 0.12, 0, bag);
decal(bloodDecal(3), 1.4, 2.4, -2.3, 0.011, 0.1, scene, 0, -Math.PI / 2);
interactive(bag, 'bag_01', 'Examiner le sac mortuaire', 'inspect', { focusDist: 2 });
const med = new THREE.Group();
med.position.set(-3.88, 1.55, -0.2);
med.rotation.y = Math.PI / 2;
scene.add(med);
box(0.5, 0.6, 0.16, mats.lockerA, 0, 0, 0, med);
box(0.4, 0.5, 0.02, mats.dark, 0, 0, 0.085, med);
{
  const rm = new THREE.MeshStandardMaterial({ color: 0x8a1010, roughness: 0.6 });
  box(0.24, 0.07, 0.02, rm, 0, 0, 0.1, med);
  box(0.07, 0.24, 0.02, rm, 0, 0, 0.1, med);
}
decal(bloodDecal(1), 0.45, 0.45, 0, -0.05, 0.1, med);
interactive(med, 'medcab', 'Ouvrir l’armoire à pharmacie', 'inspect', { focusDist: 1.1 });

const room1Colliders = [],
  fillCols = [];
function neonFill(room, hw, k, zs, y, S = 12) {
  const xs = [];
  for (let x = S; x < hw * k - 3; x += S) if (x > hw - 5) xs.push(x, -x);
  const rows = [],
    len = zs[0] - zs[1],
    nr = Math.max(1, Math.round(len / 10));
  for (let i = 0; i < nr; i++) rows.push(zs[0] - (len * (i + 0.5)) / nr);
  xs.forEach((x) => rows.forEach((z) => addNeon(room, x, z, room < 5 ? 2.4 : 4, y)));
}
function smallFill(x0, x1, z0, z1, n) {
  for (let i = 0; i < n; i++) {
    const x = x0 + Math.random() * (x1 - x0),
      z = z0 + Math.random() * (z1 - z0);
    if (Math.random() < 0.5) {
      box(1, 0.7, 0.8, mats.crate, x, 0.35, z).rotation.y = Math.random() * 0.6;
      box(0.8, 0.6, 0.7, mats.crate, x + 0.05, 1.0, z).rotation.y = Math.random();
      fillCols.push([x - 0.7, x + 0.7, z - 0.7, z + 0.7]);
    } else {
      cyl(0.32, 0.95, mats.rustpipe, x, 0.475, z);
      cyl(0.32, 0.95, mats.rustpipe, x + 0.7, 0.475, z + 0.2);
      fillCols.push([x - 0.45, x + 1.1, z - 0.45, z + 0.65]);
    }
  }
}
/* élargit une salle déjà construite : les objets proches des murs (|x| > hw−thr) suivent les murs, puis on remplit l'espace libre */
function widenRoom(i0, o) {
  try {
    const k = 3,
      grp = o.group || scene,
      bb = new THREE.Box3(),
      c = new THREE.Vector3(),
      th = o.hw - o.thr,
      sh = (k - 1) * o.hw;
    grp.children.slice(i0).forEach((ob) => {
      if (ob.isCamera) return;
      ob.updateWorldMatrix(true, true);
      bb.makeEmpty();
      bb.setFromObject(ob);
      if (bb.isEmpty()) ob.getWorldPosition(c);
      else bb.getCenter(c);
      if (Math.abs(c.x) > th) ob.position.x += Math.sign(c.x) * sh;
    });
    neonFill(o.room, o.hw, k, o.zs, o.y, o.S || 12);
    const x0 = th + 1,
      x1 = th + sh - 1;
    if (o.small) {
      [
        [-x1, -x0],
        [x0, x1]
      ].forEach(([a, b]) => smallFill(a, b, o.zs[0] - 1.5, o.zs[1] + 1.5, o.fill));
    } else {
      const n0 = EXTRA_COLLIDERS.length;
      [
        [-x1, -x0],
        [x0, x1]
      ].forEach(([a, b]) => scatter(a, b, o.zs[0] - 3, o.zs[1] + 3, o.fill, o.avoid || [], o.kinds));
      fillCols.push(
        ...EXTRA_COLLIDERS.splice(n0).map((c) => [c[0], c[1], c[2] + (o.zoff || 0), c[3] + (o.zoff || 0)])
      );
    }
  } catch (e) {
    console.warn('Salle ' + o.room + ' :', e);
  }
}

/* salle 1 agrandie : les objets près des murs ouest / est / sud suivent les nouveaux murs, puis on ajoute du décor et des néons */
(function relayoutRoom1(i0) {
  try {
    const bb = new THREE.Box3(),
      c = new THREE.Vector3();
    scene.children.slice(i0).forEach((o) => {
      if (o.isCamera) return;
      o.updateWorldMatrix(true, true);
      bb.makeEmpty();
      bb.setFromObject(o);
      if (bb.isEmpty()) o.getWorldPosition(c);
      else bb.getCenter(c);
      const dx = c.x < -2.2 ? -10 : c.x > 2.2 ? 10 : 0,
        dz = c.z > 2 ? 19.4 : 0;
      if (dx || dz) {
        o.position.x += dx;
        o.position.z += dz;
      }
    });
    const crateStack = (x, z, ry = 0) => {
      box(1, 0.7, 0.8, mats.crate, x, 0.35, z).rotation.y = ry;
      box(0.8, 0.6, 0.7, mats.crate, x + 0.05, 1.0, z).rotation.y = ry + 0.25;
      room1Colliders.push([x - 0.7, x + 0.7, z - 0.7, z + 0.7]);
    };
    crateStack(-1.9, 6.4);
    crateStack(2.7, 5.3, 0.4);
    crateStack(5.3, 3.6, -0.3);
    crateStack(-5.6, 5.6, 0.2);
    [
      [4.0, 8.9],
      [4.75, 8.55],
      [-4.3, 8.9]
    ].forEach(([x, z]) => {
      cyl(0.32, 0.95, mats.rustpipe, x, 0.475, z);
      room1Colliders.push([x - 0.4, x + 0.4, z - 0.4, z + 0.4]);
    });
    {
      const t = new THREE.Group();
      t.position.set(0, 0, 4.4);
      scene.add(t);
      box(2.4, 0.08, 0.9, mats.steel, 0, 0.88, 0, t);
      {
        const tb = new THREE.Group();
        tb.position.set(0.6, 0.92, 0.05);
        t.add(tb);
        const red = new THREE.MeshStandardMaterial({ color: 0x9a2a18, roughness: 0.6, metalness: 0.3 });
        box(0.5, 0.18, 0.26, red, 0, 0.09, 0, tb);
        box(0.44, 0.02, 0.2, mats.dark, 0, 0.19, 0, tb);
        const lid = new THREE.Group();
        lid.position.set(0, 0.18, -0.13);
        tb.add(lid);
        box(0.5, 0.03, 0.26, red, 0, 0.015, 0.13, lid);
        box(0.2, 0.03, 0.03, mats.dark, 0, 0.05, 0.13, lid);
        hitBox(0.6, 0.4, 0.4, 0, 0.1, 0, tb);
        interactive(tb, 'toolbox_01', 'Ouvrir la caisse à outils', 'use', { lid, focusDist: 1.2 });
      }
      [-1.05, 1.05].forEach((dx) =>
        [-0.35, 0.35].forEach((dz) => box(0.07, 0.88, 0.07, mats.dark, dx, 0.44, dz, t))
      );
      room1Colliders.push([-1.3, 1.3, 3.9, 4.9]);
    }
    decal(bloodDecal(5), 2.8, 2.8, -3.2, 0.015, 5.6, scene, 0, -Math.PI / 2);
    decal(bloodDecal(3), 1.8, 1.8, 2.2, 0.015, 2.4, scene, 0, -Math.PI / 2);
    decal(bloodDecal(4), 2.2, 2.2, 0, 0.015, 7.4, scene, 0, -Math.PI / 2);
    [-9, -3, 3, 9].forEach((x) => [-1, 5.5, 12, 18.5].forEach((z) => addNeon(1, x, z, 2.4))); // 16 néons au plafond (allégé pour les performances)                                           // 12 néons au plafond
    {
      const gp = genG.position,
        lp = lever.position,
        ex = lp.x + 0.05,
        P = [
          [gp.x - 0.46, 0.4, gp.z + 0.12],
          [gp.x - 0.7, 0.05, gp.z + 0.4],
          [ex, 0.02, gp.z + 1.4],
          [ex, 0.02, lp.z - 2],
          [ex, 0.02, lp.z - 0.5],
          [ex, 0.3, lp.z - 0.12],
          [ex, 0.95, lp.z],
          [ex, 1.08, lp.z]
        ].map((p) => new THREE.Vector3(...p)); // câble : générateur → levier
      const cb = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(P), 60, 0.022, 8),
        new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.7 })
      );
      cb.raycast = () => {};
      scene.add(cb);
    }
  } catch (e) {
    console.warn('Salle 1 :', e);
  }
})(_r1);
