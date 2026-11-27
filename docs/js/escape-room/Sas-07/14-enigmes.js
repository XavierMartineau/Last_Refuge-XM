/* LAST REFUGE · XM — Escape room « Sas 07 » · Énigmes et actions (une fonction par objet).
   Fichier chargé dans l’ordre par escape-room.js : il partage la portée globale des autres fichiers. */
'use strict';
/* ════════════════════════════════════════════════════════════════
   10. ÉNIGMES / ACTIONS (une fonction par id — faciles à étendre)
   ════════════════════════════════════════════════════════════════ */
const R = Actions.register.bind(Actions);
const fmt = (str, o = {}) => str.replace(/\{(\w+)\}/g, (_, k) => o[k] ?? ''); // remplace {n}, {total}… dans un texte
const M = TEXTS.msg,
  Hn = TEXTS.hints; // raccourcis vers les textes (voir TEXTS en haut du fichier)

// ── Pièce 1 ──
R('gen_sas', async (o) => {
  const u = o.userData,
    P = genG.position;
  if (!State.focus) await focusOn(o);
  genCard();
  if (State.gen1) return say(M.genAlready);
  const hint = () => {
    u.hint = !State.genBat
      ? 'Examiner le générateur'
      : !State.genFuel
        ? 'Faire le plein'
        : 'Tirer le démarreur';
  };
  if (State.battery && !State.genBat) {
    State.genBat = true;
    State.battery = false;
    genBatMesh.visible = true;
    renderInv();
    SND.play('sparkle');
    sparkBurst(P.x + 0.25, 0.9, P.z);
    genLed.material = glow(0xffb020, 3);
    hint();
    say(M.genBatIn, 4500);
    return setObjective(objectiveNow());
  }
  if (State.fuel && !State.genFuel) {
    State.genFuel = true;
    State.fuel = false;
    renderInv();
    SND.play('pour');
    hint();
    say(M.genFuelIn, 4500);
    return setObjective(objectiveNow());
  }
  if (State.cable && !State.genGround) {
    State.genGround = true;
    State.cable = false;
    powerKit.groundMesh.visible = true;
    renderInv();
    SND.play('clank');
    sparkBurst(P.x + 0.48, 0.2, P.z + 0.1);
    hint();
    say('Vous serrez la pince de masse sur le châssis : plus de risque d’électrocution.', 5000);
    return setObjective(objectiveNow());
  }
  if (!State.genBat || !State.genFuel) {
    SND.play('locked');
    return say(
      !State.genBat && !State.genFuel ? M.genNoBoth : !State.genBat ? M.genNoBat : M.genNoFuel,
      5000
    );
  }
  if (!State.genGround) {
    SND.play('locked');
    return say(
      'Pas de mise à la terre : le générateur crache des étincelles. Il faut un câble de masse.',
      5000
    );
  }
  if (!State.valve) {
    SND.play('locked');
    return say(
      'La vanne de carburant est fermée : le moteur ne reçoit rien. Ouvrez la molette rouge sur le réservoir.',
      5200
    );
  }
  u.tries = (u.tries || 0) + 1;
  tween(
    0.35,
    (k) => {
      genCord.position.z = 0.28 + 0.22 * Math.sin(k * Math.PI);
      genCord.position.x = -0.3 - 0.1 * Math.sin(k * Math.PI);
    },
    (k) => k
  );
  SND.play('lever');
  if (u.tries < 2) {
    gameTimeout(() => SND.play('sputter'), 250);
    return say(M.genTry, 3000);
  }
  State.gen1 = true;
  u.hint = 'Générateur en marche';
  gameTimeout(() => SND.play('genstart'), 250);
  u.led.material = glow(0x30ff70, 3);
  tween(
    2.5,
    (k) => {
      genLamp.intensity = 14 * Math.min(1, k * 2);
    },
    (k) => k
  );
  say(M.genSasOn, 5500);
  setObjective(objectiveNow());
  gameTimeout(() => {
    if (State.focus === o) release();
  }, 3200);
});
const EGGS = [];
let eggN = 0;
const M0 = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.8 });
function egg(id, hint, msg, x, z, build, ry = 0, y = 0) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = ry;
  scene.add(g);
  build(g);
  hitBox(0.8, 1, 0.8, 0, 0.45, 0, g);
  interactive(g, id, hint, 'inspect', { focusDist: 1.2 });
  EGGS.push(id);
  R(id, () => {
    SND.play('click');
    const first = !State['egg_' + id];
    State['egg_' + id] = true;
    if (first) eggN++;
    say(msg + '   [' + eggN + '/' + EGGS.length + ' secrets]', 6500);
    if (first && eggN === EGGS.length)
      gameTimeout(() => {
        SND.play('success');
        say('Tous les secrets du bunker sont trouvés ! Même les morts en rient jaune.', 8000);
      }, 2600);
  });
}
const stele = (lines, bg, fg) => (g) => {
  box(0.06, 1.3, 0.06, mats.dark, 0, 0.65, 0, g);
  box(0.9, 0.6, 0.04, mats.dark, 0, 1.25, 0, g);
  plane(0.82, 0.52, sign(lines, bg, fg), 0, 1.25, 0.025, g);
};
const B = {
  teddy: (g) => {
    const f = M0(0x6a4a2a);
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), f);
    b.position.y = 0.16;
    g.add(b);
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), f);
    h.position.set(0, 0.37, 0.03);
    g.add(h);
    [-0.08, 0.08].forEach((x) => {
      const e = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), f);
      e.position.set(x, 0.46, 0.03);
      g.add(e);
    });
    g.rotation.z = 0.15;
    box(0.14, 0.01, 0.04, M0(0x8a1010), 0, 0.3, 0.12, g);
  },
  duck: (g) => {
    const y = M0(0xe8c020);
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), y);
    b.position.y = 0.06;
    b.scale.set(1, 0.8, 1.2);
    g.add(b);
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), y);
    h.position.set(0, 0.14, 0.05);
    g.add(h);
    box(0.04, 0.015, 0.03, M0(0xe07010), 0, 0.135, 0.095, g);
  },
  mug: (g) => {
    cyl(0.05, 0.1, M0(0xdddddd), 0, 0.05, 0, g, 14);
    const t = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.008, 6, 12), M0(0xdddddd));
    t.position.set(0.06, 0.05, 0);
    g.add(t);
    cyl(0.044, 0.005, M0(0x2a1208), 0, 0.098, 0, g, 14);
  },
  photo: (g) => {
    box(0.34, 0.26, 0.02, mats.dark, 0, 0.13, 0, g).rotation.x = -0.2;
    plane(0.28, 0.2, sign(['♥ FAMILLE', '1998'], '#9a8f6a', '#2a2418'), 0, 0.13, 0.016, g).rotation.x = -0.2;
  },
  book: (g) => {
    box(0.24, 0.04, 0.32, M0(0x6a1a1a), 0, 0.02, 0, g);
    box(0.2, 0.03, 0.28, M0(0xd8cfb0), 0.01, 0.02, 0, g);
  },
  ration: (g) => {
    box(0.32, 0.12, 0.22, M0(0x4a5a30), 0, 0.06, 0, g);
    plane(0.2, 0.08, sign(['RATION', '1987'], '#c9b46a', '#1a1a1a'), 0, 0.07, 0.112, g);
  },
  cigs: (g) => {
    box(0.07, 0.1, 0.03, M0(0xe8e0d0), 0, 0.05, 0, g);
    box(0.07, 0.03, 0.031, M0(0xa01818), 0, 0.085, 0, g);
  },
  clock: (g) => {
    box(0.2, 0.09, 0.1, mats.dark, 0, 0.045, 0, g);
    box(0.16, 0.05, 0.005, glow(0xff2a1a, 2.5), 0, 0.05, 0.052, g);
  },
  coin: (g) => {
    cyl(0.03, 0.006, mats.steel, 0, 0.003, 0, g, 14);
  },
  console: (g) => {
    box(0.18, 0.03, 0.1, M0(0x2a2e8a), 0, 0.015, 0, g);
    box(0.07, 0.005, 0.05, glow(0x40ff80, 1.5), 0, 0.032, 0, g);
  },
  usb: (g) => {
    box(0.05, 0.012, 0.02, mats.dark, 0, 0.006, 0, g);
    box(0.02, 0.01, 0.015, mats.steel, 0.035, 0.006, 0, g);
  },
  coffee: (g) => {
    box(0.7, 1.5, 0.5, mats.dark, 0, 0.75, 0, g);
    box(0.5, 0.35, 0.02, glow(0xff3a20, 1.6), 0, 1.15, 0.26, g);
    box(0.4, 0.12, 0.3, mats.steel, 0, 0.45, 0.18, g);
    box(0.2, 0.08, 0.02, mats.steel, 0.15, 0.85, 0.26, g);
  },
  donut: (g) => {
    box(0.3, 0.07, 0.22, M0(0xe8e4d8), 0, 0.035, 0, g);
    plane(0.18, 0.04, sign(['BEIGNETS'], '#e8e4d8', '#a01818'), 0, 0.05, 0.112, g);
  }
};
// salle 1
egg(
  'egg_teddy',
  'Examiner l’ours en peluche',
  'Un ours en peluche taché. L’étiquette brodée dit : « À Léa, pour ses 6 ans ». Mieux vaut ne pas penser à Léa.',
  -2.4,
  7.6,
  B.teddy,
  0.4
);
egg(
  'egg_duck',
  'Examiner le canard en plastique',
  'Un canard en plastique jaune, posé là comme si de rien n’était. Il couine. Même l’apocalypse n’a pas eu sa peau.',
  -0.85,
  4.3,
  B.duck,
  0.3,
  0.92
);
// salle 2
egg(
  'egg_poster2',
  'Lire l’affiche',
  '« NE PAS APPUYER SUR LE GRAND BOUTON ROUGE. » Quelqu’un a ajouté au marqueur : « trop tard. »',
  6,
  -9.5,
  stele(['NE PAS', 'APPUYER', 'LE BOUTON'], '#b83a22', '#f2e8d0'),
  0.2
);
egg(
  'egg_mug',
  'Examiner la tasse',
  '« Meilleur papa du bunker ». Le café à l’intérieur a une couche de moisissure digne d’un laboratoire.',
  -6,
  -8.2,
  B.mug,
  0
);
// salle 3
egg(
  'egg_photo',
  'Regarder la photo',
  'Une photo de famille sous verre fêlé. Au dos : « On revient dans une semaine ». La date date de 1998.',
  8,
  -15,
  B.photo,
  0.3
);
egg(
  'egg_diary',
  'Ouvrir le journal intime',
  '« Jour 12 : j’ai trouvé un sandwich. Jour 13 : le sandwich m’a trouvé. » La suite est déchirée.',
  -9,
  -19,
  B.book,
  0.5
);
// salle 4
egg(
  'egg_ration',
  'Examiner la ration',
  'Ration de survie, date de péremption : 1987. Mention manuscrite : « Goût poulet (probablement) ».',
  7,
  -26.5,
  B.ration,
  0.2
);
egg(
  'egg_sign4',
  'Lire le panneau',
  '« Fumer tue. » Quelqu’un a barré et écrit dessous : « Les zombies aussi. »',
  -8,
  -28,
  stele(['FUMER', 'TUE', '(ILS AUSSI)'], '#d8b020', '#1a1a1a'),
  -0.2
);
// salle 5 : hangar
egg(
  'egg_cigs',
  'Examiner le paquet',
  'Un paquet de cigarettes vide. Sur le papier d’emballage : « Dernière clope avant la fin du monde ».',
  10,
  -45,
  B.cigs,
  0.8
);
egg(
  'egg_graf5',
  'Lire les graffitis',
  'Au charbon sur un panneau : « ILS SONT DANS LES MURS ». Puis, plus petit : « …non, en fait, ils sont dans le hangar. »',
  -12,
  -60,
  stele(['ILS SONT', 'DANS LES', 'MURS'], '#2a2a28', '#c8c0a0'),
  0.3
);
// salle 6 : entrepôt
egg(
  'egg_clock',
  'Regarder le réveil',
  'Un radio-réveil bloqué sur 03:17. Il clignote, patient, comme s’il attendait qu’on remette l’heure.',
  8,
  -85,
  B.clock,
  0.2
);
egg(
  'egg_inv6',
  'Lire l’inventaire',
  '« Inventaire : 3 palettes, 40 caisses, 0 espoir. » Tout le monde a signé. Même Gérard, qui n’a jamais travaillé ici.',
  -10,
  -95,
  stele(['STOCK:', '0 ESPOIR'], '#4b5049', '#e8e2c8'),
  0.1
);
// salle 7 : silo
egg(
  'egg_coin',
  'Ramasser la pièce',
  'Une pièce d’un franc. Vous la lancez : face. Vous la relancez : face. Elle est pipée. Tout est pipé ici.',
  6,
  -115,
  B.coin,
  0
);
egg(
  'egg_silo',
  'Lire la pancarte',
  '« SILO 7 — NE PAS REGARDER EN BAS ». Évidemment, vous regardez en bas. Rien. Juste le vide qui vous regarde aussi.',
  -8,
  -125,
  stele(['NE PAS', 'REGARDER', 'EN BAS'], '#b83a22', '#f2e8d0'),
  -0.1
);
// salle 8 : commandement
egg(
  'egg_console',
  'Examiner la console',
  'Une console portable : « GAME OVER — niveau 8 atteint ». Quelqu’un a battu le record du bunker. Respect.',
  10,
  -150,
  B.console,
  0.4
);
egg(
  'egg_meeting',
  'Lire le tableau',
  '« Réunion de 15 h : comment éviter l’apocalypse. » En dessous : « Points abordés : aucun. Buffet : oui. »',
  -12,
  -160,
  stele(['RÉUNION', '15 H', 'BUFFET: OUI'], '#c9bc99', '#2a2418'),
  0.2
);
// salle 9 : évacuation
egg(
  'egg_sticker',
  'Lire l’autocollant',
  'Sur le pare-chocs d’une jeep : « Mon autre voiture est un char. » Au moins, il avait de l’humour.',
  12,
  -190,
  stele(['MON AUTRE', 'VOITURE', 'EST UN CHAR'], '#6b7a3a', '#f2ecd0'),
  -0.2
);
egg(
  'egg_usb',
  'Ramasser la clé USB',
  'Une clé USB étiquetée « photos_vacances_FINAL_v2 ». Vous la branchez mentalement. Trop de risques.',
  -12,
  -205,
  B.usb,
  0.7
);
// salle 10 : prison
egg(
  'egg_jm',
  'Lire la gravure',
  '« Jean-Marc était ici. » Gravé très profondément. Il a dû vraiment s’ennuyer.',
  -8.2,
  -230.6,
  stele(['JEAN-MARC', 'ÉTAIT ICI'], '#6b6f66', '#1a1a18'),
  Math.PI / 2
);
egg(
  'egg_dessert',
  'Lire la gravure',
  '« Jour 214 : on ne m’a toujours pas servi de dessert. » Le détenu a ensuite ajouté : « Je veux voir le directeur. »',
  -8.2,
  -237.6,
  stele(['JOUR 214', 'PAS DE', 'DESSERT'], '#6b6f66', '#1a1a18'),
  Math.PI / 2
);
// salle 11 : complexe
egg(
  'egg_coffee',
  'Examiner le distributeur',
  'Distributeur de café : « Il manque 20 centimes. » Même l’apocalypse n’a pas de monnaie.',
  10,
  -292,
  B.coffee,
  -0.4
);
egg(
  'egg_sign11',
  'Lire le panneau',
  '« EN CAS D’INCENDIE : ne pas paniquer. EN CAS DE ZOMBIES : paniquer, mais discrètement. »',
  22,
  -300,
  stele(['PANIQUER', 'DISCRÈTEMENT'], '#d8b020', '#1a1a1a'),
  0.3
);
