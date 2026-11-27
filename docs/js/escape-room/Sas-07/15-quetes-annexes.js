/* LAST REFUGE · XM — Escape room « Sas 07 » · Quêtes annexes (3 par salle).
   Fichier chargé dans l’ordre par escape-room.js : il partage la portée globale des autres fichiers. */
'use strict';
/* ═════════ QUÊTES ANNEXES : 3 par salle (livraison, collection, réparation). Chaque quête terminée donne +1 « équipement renforcé » (−6 % de dégâts subis par les zombies).
   Réglages : QDATA (textes, noms, objets) et QZ (zones où les objets sont placés au hasard, mais toujours au même endroit) ═════════ */
const QDATA = {
  1: {
    f: [
      'Clé à molette',
      'Vanne de vapeur',
      'Vous serrez la vanne : le sifflement de vapeur s’arrête, enfin le silence.',
      'tool'
    ],
    c: [
      'Page du journal',
      'Le journal du Dr Leroy est complet : « Jour 1 : l’expérience a dérapé. Jour 2 : ils ne dorment jamais. Jour 3 : ne rouvrez pas la porte nord. »'
    ],
    r: [
      'Radio de campagne',
      ['Antenne', 'Pile'],
      'La radio crachote : « …poste 7 à tous… ne descendez pas… ils savent écouter… » Puis plus rien.'
    ]
  },
  2: {
    f: [
      'Disquette de sauvegarde',
      'Lecteur de disquettes',
      'Le lecteur avale la disquette. Un journal défile : « RÉACTEUR : OK. MORALE DE L’ÉQUIPE : NON. »',
      'paper'
    ],
    c: [
      'Photo de l’équipe',
      'Les trois morceaux forment la photo de l’équipe au complet, souriante devant la porte. Au dos : « Plus que 3 jours de garde ! »'
    ],
    r: [
      'Caméra de surveillance',
      ['Câble vidéo', 'Objectif'],
      'L’écran s’allume : une silhouette rôde au loin, hors de portée. La caméra se coupe d’elle-même.'
    ]
  },
  3: {
    f: [
      'Couverture propre',
      'Lit défait',
      'Vous bordez le lit avec une tendresse absurde. Un mot sous l’oreiller : « Merci. »',
      'cloth'
    ],
    c: [
      'Lettre à la famille',
      'Les lettres mises bout à bout forment un adieu : « Si vous lisez ceci, je n’ai pas pu rentrer. Dites aux enfants que j’ai tenu. »'
    ],
    r: [
      'Radio-réveil',
      ['Pile AA', 'Antenne de fortune'],
      'Le réveil sonne à 03:17, puis une voix : « Levez-vous. Ils arrivent. » Il s’éteint de lui-même.'
    ]
  },
  4: {
    f: [
      'Bidon d’huile',
      'Machine grippée',
      'La machine redémarre dans un hoquet d’huile noire. Elle ronronne comme un vieux chat.',
      'bottle'
    ],
    c: [
      'Plaque de maintenance',
      'Les plaques assemblées : « MAINTENANCE : graisser chaque jour. Ne jamais, au grand jamais, ouvrir le carter bleu. »'
    ],
    r: [
      'Compresseur',
      ['Joint en caoutchouc', 'Courroie'],
      'Le compresseur se remet à souffler. Un sifflement d’air, puis une odeur de caoutchouc brûlé.'
    ]
  },
  5: {
    f: [
      'Clé de levage',
      'Treuil bloqué',
      'Le treuil libère sa chaîne : une caisse oubliée tombe et révèle un dessin d’enfant au feutre : « papa ».',
      'tool'
    ],
    c: [
      'Médaille militaire',
      'Les médailles alignées : « Pour bravoure face à l’inconnu. » Aucun nom gravé. Personne n’a reçu la quatrième.'
    ],
    r: [
      'Balise de détresse',
      ['Batterie de balise', 'Antenne parabolique'],
      'La balise émet un signal clair, et une réponse arrive : trois bips longs. Quelqu’un écoute encore.'
    ]
  },
  6: {
    f: [
      'Étiquette de palette',
      'Palette sans nom',
      'Vous collez l’étiquette. Le stock est enfin à jour : 3 palettes, 0 espoir.',
      'paper'
    ],
    c: [
      'Bon de livraison',
      'Les bons recollés : « Livraison 13 : 40 caisses de rations. Livraison 14 : refusée, motif : cadavre dans le camion. »'
    ],
    r: [
      'Chariot élévateur',
      ['Clé de contact', 'Fusible 30 A'],
      'Le chariot tousse, démarre, puis cale. Mais pendant quelques secondes, il a vécu.'
    ]
  },
  7: {
    f: [
      'Corde épaisse',
      'Anneau rouillé',
      'Vous nouez la corde à l’anneau. Descendre n’est plus une folie, juste une mauvaise idée.',
      'cable'
    ],
    c: [
      'Fragment de carte',
      'La carte reconstituée montre des galeries sous le silo, marquées d’une croix rouge : « Ne pas fouiller. »'
    ],
    r: [
      'Sirène du silo',
      ['Pile 9 V', 'Haut-parleur'],
      'La sirène hoquette un son plaintif, puis se tait. Très loin en bas, quelque chose a répondu.'
    ]
  },
  8: {
    f: [
      'Dossier confidentiel',
      'Classeur verrouillé',
      'Le classeur s’ouvre : « Projet LAZARE — résultats : concluants. Conséquences : voir fenêtre. »',
      'paper'
    ],
    c: [
      'Carte stratégique',
      'La carte du front, entière : des cercles rouges partout. Une seule zone verte, le bunker. Annotation : « Sacrifiée. »'
    ],
    r: [
      'Téléphone rouge',
      ['Combiné', 'Cordon torsadé'],
      'Le téléphone sonne dans le vide. Quelqu’un décroche… puis raccroche. Il ne reste que le bip.'
    ]
  },
  9: {
    f: [
      'Bidon de carburant',
      'Jeep à sec',
      'La jeep rugit une seconde, puis cale. Le tableau de bord affiche : 13 km avant la panne.',
      'bottle'
    ],
    c: [
      'Clé de camion',
      'Le trousseau complet : sur chaque clé une étiquette, « Camion 1 : retour impossible », « Camion 2 : retour impossible »…'
    ],
    r: [
      'Gyrophare',
      ['Ampoule', 'Câble secteur'],
      'Le gyrophare tourne et éclaire un instant la vaste aire d’évacuation… et tout ce que vous ne vouliez pas voir.'
    ]
  },
  10: {
    f: [
      'Cuillère affûtée',
      'Mur écaillé',
      'Vous grattez : derrière le plâtre, un minuscule tunnel, bouché de l’autre côté depuis longtemps.',
      'tool'
    ],
    c: [
      'Gravure de détenu',
      'Les gravures forment un décompte : « 214 jours. Pas de dessert. Jean-Marc, si tu lis ça : j’ai pris ta couverture. »'
    ],
    r: [
      'Interphone des cellules',
      ['Micro', 'Câble de masse'],
      'L’interphone grésille : « Cellule 3, silence ! » puis un rire creux. Quelqu’un s’amuse encore.'
    ]
  },
  11: {
    f: [
      'Pièce de monnaie',
      'Distributeur de café',
      'Le distributeur avale la pièce et sort un café tiède, sans goût. Vous n’avez jamais rien bu d’aussi bon.',
      'coin'
    ],
    c: [
      'Badge de visiteur',
      'Les badges réunis : « VISITEUR : accès interdit à tous les niveaux. » Quelqu’un a barré « interdit » et écrit « tant pis ».'
    ],
    r: [
      'Ascenseur de service',
      ['Câble d’acier', 'Contrepoids'],
      'L’ascenseur gémit, descend d’un étage, puis remonte à vide. Rassurant, probablement.'
    ]
  },
  12: {
    f: [
      'Chiffon à huile',
      'Fusil rouillé',
      'Vous astiquez : sous la rouille, un nom gravé, « Capitaine Morel ». Il vous aurait remercié.',
      'cloth'
    ],
    c: [
      'Douille dorée',
      'Les douilles alignées forment un message en morse : « SOS… SOS… ils sont déjà là. »'
    ],
    r: [
      'Coffre de munitions',
      ['Clé du coffre', 'Code du coffre'],
      'Le coffre s’ouvre : vide, sauf un mot : « Trop tard. Désolé. — M. »'
    ]
  }
};
const QZ = {
  1: [
    [-12, 12],
    [-1.5, 21]
  ],
  2: [
    [-9, 9],
    [-5.5, -10.5]
  ],
  3: [
    [-12, 12],
    [-13.5, -20.5]
  ],
  4: [
    [-12, 12],
    [-23.5, -30.5]
  ],
  5: [
    [-45, 45],
    [-36, -68]
  ],
  6: [
    [-45, 45],
    [-76, -98]
  ],
  7: [
    [-17, 13],
    [-104, -130]
  ],
  8: [
    [-22, 22],
    [-134, -153]
  ],
  9: [
    [-22, 12],
    [-181, -216]
  ],
  10: [
    [-8.5, 8.5],
    [-224, -260]
  ],
  11: [
    [-2, 45],
    [-268, -308]
  ],
  12: [
    [-40, 40],
    [-318, -356]
  ]
};
const QS = [],
  QK = {
    paper: (g) => {
      box(0.2, 0.005, 0.28, M0(0xd8cfb0), 0, 0.004, 0, g).rotation.y = 0.4;
    },
    tool: (g) => {
      cyl(0.015, 0.22, mats.steel, 0, 0.02, 0, g, 8).rotation.z = Math.PI / 2;
      box(0.05, 0.03, 0.02, mats.steel, 0.1, 0.02, 0, g);
    },
    cell: (g) => {
      box(0.09, 0.13, 0.06, mats.dark, 0, 0.065, 0, g);
      box(0.09, 0.03, 0.061, M0(0xd8b420), 0, 0.1, 0, g);
    },
    cable: (g) => {
      const t = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.012, 6, 14), M0(0x151515));
      t.rotation.x = Math.PI / 2;
      t.position.y = 0.015;
      g.add(t);
    },
    bottle: (g) => {
      cyl(0.07, 0.24, M0(0x8a1c14), 0, 0.12, 0, g, 10);
      cyl(0.03, 0.05, mats.dark, 0, 0.26, 0, g, 8);
    },
    coin: (g) => {
      cyl(0.03, 0.006, mats.steel, 0, 0.004, 0, g, 14);
    },
    cloth: (g) => {
      box(0.25, 0.03, 0.2, M0(0x7a8060), 0, 0.015, 0, g);
    },
    box: (g) => {
      box(0.14, 0.09, 0.1, mats.crate, 0, 0.045, 0, g);
    }
  };
function qrng(seed) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function qdir(room, x, z) {
  const zn = QZ[room],
    cx = (zn[0][0] + zn[0][1]) / 2,
    cz = (zn[1][0] + zn[1][1]) / 2,
    hx = (zn[0][1] - zn[0][0]) / 2,
    hz = Math.abs(zn[1][1] - zn[1][0]) / 2,
    a = [z < cz - hz * 0.3 ? 'vers le fond' : z > cz + hz * 0.3 ? 'vers l’entrée' : 'au milieu'];
  if (x < cx - hx * 0.3) a.push('côté ouest');
  else if (x > cx + hx * 0.3) a.push('côté est');
  return a.join(', ');
}
function qDone(q) {
  q.done = true;
  State.bonus = (State.bonus || 0) + 1;
  SND.play('success');
  renderInv();
  setObjective(objectiveNow());
  say(
    'Quête annexe terminée : ' +
      q.title.replace('Annexe — ', '') +
      '.  ' +
      q.final +
      '   [Équipement renforcé +' +
      State.bonus +
      ']',
    9000
  );
}
function qItem(q, it, kind) {
  const g = new THREE.Group();
  g.position.set(it.x, 0, it.z);
  g.rotation.y = it.x * 3;
  scene.add(g);
  (QK[kind] || QK.box)(g);
  const s = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), glow(0xffd070, 1.6));
  s.position.y = 0.32;
  g.add(s);
  hitBox(0.5, 0.7, 0.5, 0, 0.25, 0, g);
  interactive(g, it.id, 'Prendre : ' + it.name, 'pickup', { focusDist: 0.8 });
  R(it.id, (o) => {
    hideObj(o);
    it.got = true;
    SND.play('click');
    renderInv();
    if (q.type === 'collect') {
      const k = q.items.filter((i) => i.got).length;
      if (k === q.items.length) return qDone(q);
      say(it.name + ' : ' + k + '/' + q.items.length, 3800);
    } else say('Vous trouvez : ' + it.name + '.', 3800);
    setObjective(objectiveNow());
  });
}
function qTarget(q) {
  const t = q.target,
    g = new THREE.Group();
  g.position.set(t.x, 0, t.z);
  g.rotation.y = t.x * 2;
  scene.add(g);
  box(0.8, 1.1, 0.5, mats.dark, 0, 0.55, 0, g);
  const w = t.name
    .toUpperCase()
    .split(' ')
    .filter((x) => x.length > 1)
    .slice(0, 2)
    .map((x) => x.slice(0, 9));
  plane(0.66, 0.34, sign(w.length ? w : ['?'], '#4b5049', '#e8e2c8'), 0, 0.78, 0.256, g);
  const led = box(0.07, 0.07, 0.02, glow(0xff2a1a, 3), 0, 1.0, 0.255, g);
  hitBox(1, 1.3, 0.8, 0, 0.6, 0, g);
  t.led = led;
  interactive(g, t.id, 'Utiliser : ' + t.name, 'use', { focusDist: 1.6 });
  R(t.id, (o) => {
    if (q.done) return say('C’est déjà réparé.', 2500);
    const miss = q.items.filter((i) => !i.got);
    if (miss.length) {
      SND.play('locked');
      return say('Il manque : ' + miss.map((i) => i.name).join(', ') + '.', 4500);
    }
    SND.play('lever');
    led.material = glow(0x30ff70, 3);
    qDone(q);
  });
}
(function buildQuests() {
  for (let rm = 1; rm <= 12; rm++) {
    const D = QDATA[rm],
      zn = QZ[rm],
      rnd = qrng(rm * 977 + 13),
      pts = [],
      sp = rm === 1 ? 2.5 : 5;
    const pt = () => {
      let x, z;
      // jamais dans un meuble, un mur ou une cellule fermée (marge de 0,6 m)
      const free = (px, pz) =>
        pz > -32 ||
        (floorAt(px, pz) === null && // jamais sur une plateforme ou un escalier (objet enterré)
        ![...COLLIDERS, ...EXTRA_COLLIDERS].some(
          (c) => c.length === 4 && px > c[0] - 0.6 && px < c[1] + 0.6 && pz > c[2] - 0.6 && pz < c[3] + 0.6
        ));
      for (let k = 0; k < 160; k++) {
        x = zn[0][0] + rnd() * (zn[0][1] - zn[0][0]);
        z = zn[1][0] + rnd() * (zn[1][1] - zn[1][0]);
        if (free(x, z) && (z > -32 || Math.abs(x) > 1.2) && pts.every((p) => Math.hypot(p[0] - x, p[1] - z) > sp)) break;
      }
      pts.push([x, z]);
      return { x, z };
    };
    const qf = {
      room: rm,
      type: 'fetch',
      title: 'Annexe — ' + D.f[1],
      final: D.f[2],
      items: [{ id: 'q' + rm + '_f1', name: D.f[0], ...pt() }],
      target: { id: 'q' + rm + '_ft', name: D.f[1], ...pt() }
    };
    const qc = {
      room: rm,
      type: 'collect',
      title: 'Annexe — ' + D.c[0] + 's',
      final: D.c[1],
      items: [1, 2, 3].map((i) => ({ id: 'q' + rm + '_c' + i, name: D.c[0], ...pt() }))
    };
    const qr = {
      room: rm,
      type: 'repair',
      title: 'Annexe — ' + D.r[0],
      final: D.r[2],
      items: D.r[1].map((n, i) => ({ id: 'q' + rm + '_r' + (i + 1), name: n, ...pt() })),
      target: { id: 'q' + rm + '_rt', name: D.r[0], ...pt() }
    };
    [qf, qc, qr].forEach((q) => QS.push(q));
    qItem(qf, qf.items[0], D.f[3]);
    qTarget(qf);
    qc.items.forEach((it) => qItem(qc, it, 'paper'));
    qr.items.forEach((it, i) => qItem(qr, it, i ? 'box' : 'cell'));
    qTarget(qr);
  }
})();
function qInvList() {
  const a = [];
  QS.forEach((q) => {
    if (q.done) return;
    const got = q.items.filter((i) => i.got);
    if (!got.length) return;
    if (q.type === 'collect') a.push(q.items[0].name + ' ×' + got.length);
    else got.forEach((i) => a.push(i.name));
  });
  if (State.bonus) a.push('Équipement renforcé +' + State.bonus);
  return a;
}
function questLines(rr) {
  const L = QS.filter((q) => q.room === rr).map((q) => {
    if (q.done) return [q.title, true];
    const miss = q.items.filter((i) => !i.got);
    let s;
    if (q.type === 'collect')
      s =
        q.title +
        ' (' +
        (q.items.length - miss.length) +
        '/' +
        q.items.length +
        ') — ' +
        qdir(rr, miss[0].x, miss[0].z);
    else if (miss.length)
      s = q.title + ' : trouver « ' + miss[0].name + ' » (' + qdir(rr, miss[0].x, miss[0].z) + ')';
    else s = q.title + ' : utiliser « ' + q.target.name + ' » (' + qdir(rr, q.target.x, q.target.z) + ')';
    return [s, false];
  });
  const n = QS.filter((q) => q.done).length;
  L.push(['Quêtes annexes terminées : ' + n + '/' + QS.length, n === QS.length]);
  return L;
}

/* ── Étapes supplémentaires pour rétablir le courant (salle 1) ──
   1) 2 fusibles 30 A  → tableau électrique (réarmement du disjoncteur)      [State.fz, State.fzIn, State.brkOk]
   2) câble de masse    → pince sur le châssis du générateur                   [State.cable, State.genGround]
   3) vanne de carburant→ molette sur le réservoir                              [State.valve]
   puis : batterie + essence + démarreur (déjà en place) → levier. */
const sleep = (ms) => new Promise((r) => gameTimeout(r, ms));
const powerKit = (function () {
  const LP = lever.position,
    GP = genG.position,
    mkGlass = () =>
      new THREE.MeshStandardMaterial({
        color: 0xffe9a0,
        transparent: true,
        opacity: 0.75,
        roughness: 0.2,
        emissive: 0x553300,
        emissiveIntensity: 0.4
      });
  // tableau électrique à deux douilles de fusible (mur ouest, juste au sud du levier)
  const bx = new THREE.Group();
  bx.position.set(LP.x + 0.02, 1.4, LP.z + 1.5);
  bx.rotation.y = Math.PI / 2;
  scene.add(bx);
  box(0.7, 0.9, 0.12, mats.dark, 0, 0, 0, bx);
  plane(0.5, 0.2, sign(['DISJONCTEUR', 'GÉNÉRAL'], '#b48a22', '#15171a'), 0, 0.3, 0.062, bx);
  decal(bloodDecal(2), 0.5, 0.4, 0.1, -0.2, 0.064, bx);
  [-0.15, 0.15].forEach((x) => {
    const s = cyl(0.05, 0.05, mats.steel, x, -0.02, 0.07, bx, 14);
    s.rotation.x = Math.PI / 2;
  });
  const fzMesh = [-0.15, 0.15].map((x) => {
    const g = new THREE.Group();
    g.position.set(x, -0.02, 0.085);
    bx.add(g);
    const gl = cyl(0.022, 0.08, mkGlass(), 0, 0, 0.04, g, 10);
    gl.rotation.x = Math.PI / 2;
    const cp = cyl(0.025, 0.015, mats.steel, 0, 0, 0, g, 10);
    cp.rotation.x = Math.PI / 2;
    g.visible = false;
    return g;
  });
  const led = box(0.06, 0.06, 0.02, glow(0xff2a1a, 3), 0, -0.3, 0.07, bx);
  hitBox(0.7, 0.9, 0.2, 0, 0, 0.06, bx);
  interactive(bx, 'breaker_01', 'Examiner le tableau électrique', 'use', { focusDist: 1.3, led });
  R('breaker_01', async (o) => {
    if (State.brkOk) return say('Le disjoncteur est réarmé. Le tableau ronronne doucement.', 3500);
    const have = State.fz || 0,
      already = State.fzIn || 0;
    await focusOn(o);
    if (!have && !already) {
      SND.play('locked');
      say(
        'Deux douilles de fusible vides. Il faut deux fusibles 30 A : il doit y en avoir dans la caisse à outils et près d’un lit de camp.',
        6500
      );
      return release();
    }
    const n = Math.min(have, 2 - already);
    for (let i = 0; i < n; i++) {
      fzMesh[already + i].visible = true;
      SND.play('click');
      await sleep(400);
    }
    State.fzIn = already + n;
    State.fz = have - n;
    renderInv();
    if (State.fzIn >= 2) {
      State.brkOk = true;
      SND.play('lever');
      gameTimeout(() => SND.play('success'), 250);
      o.userData.led.material = glow(0x30ff70, 3);
      say(
        'Les deux fusibles en place, vous réarmez le disjoncteur : un claquement sec. Le tableau est enfin alimenté.',
        6500
      );
    } else say('Un fusible en place. Il en manque encore un.', 4500);
    setObjective(objectiveNow());
    release();
  });
  // vanne de carburant (molette rouge sur le réservoir du générateur)
  const vg = new THREE.Group();
  vg.position.set(-0.18, 1.13, 0);
  genG.add(vg);
  const tor = new THREE.Mesh(
    new THREE.TorusGeometry(0.055, 0.008, 6, 18),
    new THREE.MeshStandardMaterial({ color: 0xb01818, roughness: 0.5, metalness: 0.6 })
  );
  tor.rotation.x = Math.PI / 2;
  vg.add(tor);
  for (let i = 0; i < 3; i++) box(0.11, 0.008, 0.008, mats.steel, 0, 0, 0, vg).rotation.y = (i * Math.PI) / 3;
  cyl(0.012, 0.05, mats.steel, 0, -0.03, 0, vg, 8);
  hitBox(0.2, 0.14, 0.2, 0, 0, 0, vg);
  interactive(vg, 'gen_valve', 'Ouvrir la vanne de carburant', 'use', {
    focusDist: 0.9,
    focusFn: (c) => c.clone().add(new THREE.Vector3(0, 0.5, 0.7))
  });
  R('gen_valve', async (o) => {
    if (State.valve) return say('La vanne est déjà ouverte.', 2500);
    await focusOn(o);
    SND.play('clank');
    await tween(0.9, (k) => {
      vg.rotation.y = -Math.PI * 2 * k;
    });
    State.valve = true;
    o.userData.hint = 'Vanne ouverte';
    say('Vous tournez la molette : la vanne grince puis cède. Le carburant peut circuler.', 5000);
    setObjective(objectiveNow());
    release();
  });
  // câble de masse (visible une fois la pince serrée sur le châssis)
  const groundMesh = new THREE.Group();
  genG.add(groundMesh);
  groundMesh.visible = false;
  box(
    0.06,
    0.05,
    0.05,
    new THREE.MeshStandardMaterial({ color: 0xb01818, roughness: 0.5 }),
    0.48,
    0.14,
    0.06,
    groundMesh
  );
  const gcb = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.48, 0.14, 0.08),
        new THREE.Vector3(0.7, 0.03, 0.4),
        new THREE.Vector3(1.2, 0.015, 0.7),
        new THREE.Vector3(1.5, 0.01, 0.7)
      ]),
      20,
      0.012,
      6
    ),
    new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.7 })
  );
  groundMesh.add(gcb);
  cyl(0.012, 0.3, mats.steel, 1.5, 0.1, 0.7, groundMesh, 6);
  // objets à ramasser (touche E) : ils brillent légèrement pour être repérés
  function mkPick(id, name, x, y, z, build, fn) {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    g.rotation.y = x * 3;
    scene.add(g);
    build(g);
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 6), glow(0xffd070, 1.6));
    s.position.y = 0.3;
    g.add(s);
    hitBox(0.5, 0.6, 0.5, 0, 0.2, 0, g);
    interactive(g, id, 'Prendre : ' + name, 'pickup', { focusDist: 0.8 });
    R(id, (o) => {
      hideObj(o);
      SND.play('click');
      fn();
      renderInv();
      setObjective(objectiveNow());
    });
    return g;
  }
  mkPick(
    'groundcable_01',
    'Câble de masse',
    10.2,
    0,
    13.2,
    (g) => {
      const t = new THREE.Mesh(
        new THREE.TorusGeometry(0.11, 0.018, 6, 18),
        new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.7 })
      );
      t.rotation.x = Math.PI / 2;
      t.position.y = 0.02;
      g.add(t);
      box(
        0.06,
        0.05,
        0.05,
        new THREE.MeshStandardMaterial({ color: 0xb01818, roughness: 0.5 }),
        0.13,
        0.03,
        0,
        g
      );
    },
    () => {
      State.cable = true;
      say('Un câble de masse avec sa pince crocodile : de quoi relier le générateur à la terre.', 5000);
    }
  );
  mkPick(
    'fuse_02',
    'Fusible 30 A',
    -8.85,
    0.02,
    13.4,
    (g) => {
      const f = cyl(0.02, 0.09, mkGlass(), 0, 0.02, 0, g, 10);
      f.rotation.z = Math.PI / 2;
      [-0.05, 0.05].forEach(
        (x) => (cyl(0.022, 0.015, mats.steel, x, 0.02, 0, g, 10).rotation.z = Math.PI / 2)
      );
    },
    () => {
      State.fz = (State.fz || 0) + 1;
      say('Un fusible 30 A, tombé sous le lit de camp. Il manque encore le tableau électrique.', 5000);
    }
  );
  return { bx, vg, groundMesh, fzMesh };
})();
/* ── Décor de la salle 1 agrandie (coordonnées absolues, salle : x ±13.9, z -4 → 23.4) ── */
const ROOM1_DECOR_START = scene.children.length;
(function room1Decor() {
  const floorDecal = (x, z, w, d, n) => decal(bloodDecal(n), w, d, x, 0.012, z, scene, 0, -Math.PI / 2);
  // 1) camp : trois lits picots alignés, couvertures tachées
  [-11.6, -9.9, -7.5].forEach((x, i) => {
    const g = new THREE.Group();
    g.position.set(x, 0, 13.4);
    g.rotation.y = (i - 1) * 0.06;
    scene.add(g);
    [
      [-0.38, -0.95],
      [0.38, -0.95],
      [-0.38, 0.95],
      [0.38, 0.95]
    ].forEach(([a, b]) => box(0.05, 0.34, 0.05, mats.dark, a, 0.17, b, g));
    box(0.84, 0.07, 2.0, mats.cloth, 0, 0.37, 0, g);
    box(0.5, 0.1, 0.3, mats.cloth, 0, 0.45, -0.7, g);
    if (i === 0) decal(bloodDecal(3), 0.7, 1.4, 0, 0.42, 0.2, g, 0, -Math.PI / 2);
    pushC(x, 13.4, 0.45, 1.05);
  });
  // 2) cage de stockage (angle sud-est) : montants, lisses, étagère métallique et caisses
  [
    [8, 11],
    [8, 16.2],
    [13.4, 11],
    [13.4, 16.2]
  ].forEach(([x, z]) => box(0.08, 2.6, 0.08, mats.steel, x, 1.3, z));
  [
    [10.7, 11, 5.4, 0.05],
    [10.7, 16.2, 5.4, 0.05],
    [13.4, 13.6, 0.05, 5.2]
  ].forEach(([x, z, w, d]) => {
    [0.4, 1.3, 2.5].forEach((y) => box(w, 0.04, d, mats.steel, x, y, z));
  });
  box(0.5, 2.2, 4.2, mats.dark, 13.1, 1.1, 13.6);
  [0.5, 1.1, 1.7].forEach((y) => box(0.5, 0.05, 4.2, mats.steel, 13.1, y, 13.6));
  pushC(13.1, 13.6, 0.3, 2.1);
  [
    [12.6, 15.2, 0.7],
    [12.55, 12.2, 0.6],
    [11.6, 15.7, 0.5]
  ].forEach(([x, z, s], i) => {
    box(s, s, s, mats.crate, x, s / 2, z).rotation.y = i * 0.5;
    pushC(x, z, s / 2 + 0.05, s / 2 + 0.05);
  });
  decal(bloodDecal(2), 0.9, 0.9, 13.2, 1.1, 12.5, scene, -Math.PI / 2);
  // 3) barricade de sacs de terre
  for (let row = 0; row < 3; row++)
    for (let i = 0; i < (row === 2 ? 5 : 6); i++) {
      const s = box(
        0.7,
        0.28,
        0.45,
        mats.cloth,
        3 + i * 0.68 + (row % 2) * 0.34,
        0.14 + row * 0.27,
        16.8 + (i % 2) * 0.04
      );
      s.rotation.y = ((i % 3) - 1) * 0.07;
    }
  pushC(5.2, 16.85, 2.3, 0.35);
  // 4) table radio (interactive) + lampe
  const rt = new THREE.Group();
  rt.position.set(-3.5, 0, 19.6);
  scene.add(rt);
  box(1.7, 0.06, 0.8, mats.wood, 0, 0.82, 0, rt);
  [
    [-0.8, -0.35],
    [0.8, -0.35],
    [-0.8, 0.35],
    [0.8, 0.35]
  ].forEach(([a, b]) => box(0.06, 0.8, 0.06, mats.dark, a, 0.4, b, rt));
  const rad = box(0.5, 0.26, 0.2, mats.dark, -0.3, 0.98, 0, rt);
  const led = box(0.04, 0.04, 0.02, glow(0xff3a2a, 3), -0.15, 1.02, 0.11, rt);
  cyl(0.012, 0.5, mats.steel, -0.5, 1.35, 0, rt, 6).rotation.z = 0.15;
  const lamp = box(0.1, 0.1, 0.1, glow(0xffcf80, 2.2), 0.5, 0.9, 0.1, rt);
  pushC(-3.5, 19.6, 0.9, 0.45);
  hitBox(0.6, 0.4, 0.3, -0.3, 0.98, 0, rt);
  interactive(rt, 'radio_01', 'Écouter la radio', 'use', { focusDist: 1.4 });
  const msgs = [
    '« …secteur nord perdu… répétez, secteur nord perdu… ne tentez pas de rejoindre la surface… »',
    '« …ils sentent le bruit. Ne courez pas, ne criez pas. Le bunker 07 est le dernier point de repli… »',
    'Un message en boucle, haché de parasites : « …code de la chambre forte… demandez au chat… »'
  ];
  let mi = 0;
  R('radio_01', () => {
    SND.play('radio');
    say(msgs[mi++ % msgs.length], 6500);
  });
  // 5) panneaux d’avertissement (murs nord, est et ouest)
  [
    ['DANGER', 'ZONE CONTAMINÉE', '#a31616', '#e8e2cf', -8, 23.27, Math.PI],
    ['ACCÈS', 'RESTREINT', '#b48a22', '#15171a', 0, 23.27, Math.PI],
    ['NE PAS', 'OUVRIR', '#a31616', '#e8e2cf', 8, 23.27, Math.PI],
    ['ISSUE', 'DE SECOURS', '#2f6b3a', '#e8e2cf', 13.77, 19, -Math.PI / 2],
    ['SALLE DES', 'GÉNÉRATEURS', '#b48a22', '#15171a', -13.77, 6, Math.PI / 2]
  ].forEach(([a, b, bg, fg, x, z, ry]) => plane(1.1, 0.55, sign([a, b], bg, fg), x, 2.1, z, scene, ry));
  // 6) sacs mortuaires, flaques de sang, traînées
  [
    [5, 19.2, 0.3],
    [7.5, 20.4, -0.2]
  ].forEach(([x, z, r], i) => {
    const b = box(
      0.55,
      0.2,
      1.9,
      new THREE.MeshStandardMaterial({ color: 0x14171a, roughness: 0.55 }),
      x,
      0.1,
      z
    );
    b.rotation.y = r;
    floorDecal(x, z, 1.3, 2.4, 3 + i);
  });
  floorDecal(-1, 9, 3, 3, 4);
  floorDecal(9, 6, 2.6, 2.2, 3);
  floorDecal(-10, 19, 2.8, 2.2, 3);
  floorDecal(0, 21, 4, 2, 4);
  // 7) tuyauterie au plafond, barils de produits, casques jetés
  [-8, -3, 8].forEach((x, i) => {
    const p = cyl(0.1, 26, mats.rustpipe, x, 3.0, 9.7, scene, 10);
    p.rotation.x = Math.PI / 2;
    p.castShadow = false;
  });
  [
    [-12, 21],
    [-12.8, 20.4],
    [12.4, 21.4]
  ].forEach(([x, z], i) => {
    cyl(0.3, 0.9, mats.rustpipe, x, 0.45, z, scene, 14);
    pushC(x, z, 0.34, 0.34);
  });
  const helm = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    mats.cloth
  );
  helm.position.set(-6.5, 0.03, 16.5);
  scene.add(helm);
})();
genG.userData.focusPt = () => genG.localToWorld(new THREE.Vector3(0.55, 0.6, 0)); // cible décalée : le générateur apparaît à gauche, la fiche reste à droite
genG.userData.focusFn = (c) => c.clone().add(new THREE.Vector3(0, 0.45, 2.7)); // caméra plus reculée : tout le générateur est visible
/* ── Entrepôt (salle 7) : plongé dans le noir tant que l’interrupteur général n’est pas actionné ── */
State.wareLight = false;
(function wareSwitch() {
  const g = new THREE.Group();
  g.position.set(7.5, 1.35, -102.16);
  g.rotation.y = Math.PI;
  scene.add(g);
  box(0.22, 0.32, 0.05, mats.dark, 0, 0, 0, g);
  const arm = box(0.04, 0.12, 0.04, glow(0xd8d8d0, 0.4), 0, 0.02, 0.04, g);
  arm.rotation.x = 0.5;
  const led = box(0.035, 0.035, 0.02, glow(0xff2a1a, 3), 0, -0.11, 0.03, g);
  plane(0.2, 0.07, sign(['GÉNÉRAL'], '#b48a22', '#15171a'), 0, 0.2, 0.026, g, 0);
  hitBox(0.4, 0.5, 0.3, 0, 0, 0.06, g);
  interactive(g, 'switch_ware', 'Actionner l’interrupteur général', 'use', { focusDist: 1.1, led, arm });
  R('switch_ware', async (o) => {
    if (State.wareLight) return say('L’entrepôt est déjà éclairé.', 2500);
    State.wareLight = true;
    SND.play('lever');
    gameTimeout(() => SND.play('power'), 300);
    tween(0.3, (k) => {
      o.userData.arm.rotation.x = 0.5 - 1.0 * k;
    });
    o.userData.led.material = glow(0x30ff70, 3);
    o.userData.hint = 'Interrupteur général (allumé)';
    say(
      'Un claquement sec : les néons de l’entrepôt s’allument un à un. Vous pouvez éteindre la lampe de poche.',
      6000
    );
    setObjective(objectiveNow());
  });
})();
{
  const _o = objectiveNow;
  objectiveNow = function () {
    return State.room === 7 && !State.wareLight
      ? 'Entrepôt plongé dans le noir : trouvez l’interrupteur général (mur de la porte, côté est) avec la lampe de poche.'
      : _o();
  };
}
/* ── Carnet de mission (objet à ramasser, posé sur une table près du point de départ) ── */
const BOOK = (function () {
  const NAMES = [
    'Sas d’entrée',
    'Salle de contrôle',
    'Dortoir / chambre forte',
    'Distribution électrique',
    'Hangar principal',
    'Hangar sud',
    'Entrepôt (silo)',
    'Commandement',
    'Quartiers',
    'Blocs cellulaires',
    'Ligne de coupure',
    'Zone d’évacuation'
  ];
  const S = { open: false, sec: {} };
  // objet 3D : petite table + carnet fermé qui brille légèrement
  const tb = new THREE.Group();
  tb.position.set(2.4, 0, -1.7);
  scene.add(tb);
  box(0.8, 0.05, 0.55, mats.wood, 0, 0.8, 0, tb);
  [
    [-0.34, -0.22],
    [0.34, -0.22],
    [-0.34, 0.22],
    [0.34, 0.22]
  ].forEach(([a, b]) => box(0.05, 0.78, 0.05, mats.dark, a, 0.39, b, tb));
  pushC(2.4, -1.7, 0.45, 0.32);
  const bk = new THREE.Group();
  bk.position.set(2.4, 0.84, -1.7);
  bk.rotation.y = 0.5;
  scene.add(bk);
  box(0.3, 0.035, 0.22, new THREE.MeshStandardMaterial({ color: 0x3a4a2c, roughness: 0.8 }), 0, 0.018, 0, bk);
  box(
    0.27,
    0.022,
    0.2,
    new THREE.MeshStandardMaterial({ color: 0xd8d0b0, roughness: 0.9 }),
    0.01,
    0.04,
    0,
    bk
  );
  box(
    0.03,
    0.04,
    0.22,
    new THREE.MeshStandardMaterial({ color: 0x2a3320, roughness: 0.8 }),
    -0.15,
    0.03,
    0,
    bk
  );
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), glow(0xffd070, 1.8));
  dot.position.y = 0.2;
  bk.add(dot);
  hitBox(0.5, 0.4, 0.45, 0, 0.08, 0, bk);
  interactive(bk, 'book_01', 'Prendre le carnet de mission', 'pickup', { focusDist: 0.8 });
  R('book_01', (o) => {
    State.book = true;
    hideObj(o);
    dot.visible = false;
    SND.play('paper');
    renderInv();
    say(
      'Un carnet de mission : toutes vos missions y sont notées. Touche O pour l’ouvrir ou le fermer.',
      6500
    );
    gameTimeout(() => api.open(), 900);
  });
  // interface : carte des secteurs + sections dépliables
  const css = document.createElement('style');
  css.textContent = `
  #book{position:fixed;inset:0;z-index:50;display:none;place-items:center;background:#000b}#book.on{display:grid}
  #book .bk{width:min(900px,96vw);max-height:92vh;display:flex;flex-direction:column;background:linear-gradient(180deg,#26241a,#14130d);border:2px solid #4a4128;box-shadow:0 20px 60px #000d,inset 0 0 80px #0008;color:var(--bone);font-family:'Special Elite','Courier New',monospace;position:relative}
  #book .bk::before{content:'';position:absolute;left:0;right:0;top:0;height:8px;background:var(--hazard)}
  #book header{display:flex;justify-content:space-between;align-items:center;padding:16px 18px 8px}#book h3{margin:0;font:700 22px var(--stencil);letter-spacing:.18em}#book small{color:var(--bloodb);letter-spacing:.2em;font-family:var(--stencil)}
  #book .map{display:grid;grid-template-columns:repeat(12,1fr);gap:4px;padding:6px 18px}
  #book .map button{padding:8px 0;font:600 14px var(--stencil);background:#0b0c09;color:#8d907f;border:1px solid #3a3326}
  #book .map button.cur{background:#3a2a0a;color:#ffd070;border-color:#b48a22}#book .map button.done{color:#3fdc72;border-color:#2a5a38}
  #book .tools{display:flex;gap:6px;padding:4px 18px}#book .tools button{padding:5px 12px;font:600 13px var(--stencil)}
  #book .list{overflow:auto;padding:6px 18px 16px;flex:1}
  #book .sec{border:1px solid #3a3326;margin-top:6px;background:#0b0c09}
  #book .sec>button{width:100%;display:flex;justify-content:space-between;padding:9px 12px;font:600 15px var(--stencil);letter-spacing:.08em;text-align:left}
  #book .sec.cur>button{border-color:#b48a22;color:#ffd070}#book .sec .c{display:none;padding:6px 14px 10px}#book .sec.open .c{display:block}
  #book h5{margin:8px 0 3px;font:600 12px var(--stencil);letter-spacing:.2em;color:var(--rust)}
  #book ul{list-style:none;margin:0;padding:0}#book li{padding:2px 0 2px 20px;position:relative;font-size:14px;line-height:1.3}
  #book li::before{content:'';position:absolute;left:0;top:5px;width:11px;height:11px;border:1.5px solid #8d907f}#book li.d{color:#6f7566;text-decoration:line-through}#book li.d::before{background:#3fdc72;border-color:#3fdc72}
  #book .ob{margin:2px 0 4px;color:#ffd070}#book .tag{font-size:11px;letter-spacing:.12em;color:#8d907f}
  #book footer{padding:6px 18px 12px;font-size:12px;color:#8d907f}
  @media(max-width:600px){#book .map{grid-template-columns:repeat(6,1fr)}}`;
  (document.head || document.body).appendChild(css);
  const root = document.createElement('div');
  root.id = 'book';
  root.innerHTML =
    '<div class="bk"><header><div><small>CARNET DE MISSION · BUNKER 07</small><h3>Missions &amp; opérations</h3></div><button id="bkx" class="x" aria-label="Fermer" style="padding:4px 14px;font-size:20px">✕</button></header><div class="map" id="bkmap"></div><div class="tools"><button id="bkall">Tout ouvrir</button><button id="bkno">Tout fermer</button></div><div class="list" id="bklist"></div><footer>O ou Échap pour fermer · cliquez un secteur pour l’ouvrir ou le fermer</footer></div>';
  document.body.appendChild(root);
  ['pointerdown', 'mousedown', 'touchstart', 'wheel'].forEach((ev) =>
    root.addEventListener(ev, (x) => x.stopPropagation(), { passive: true })
  );
  const li = (a) =>
    a.map(([l, d]) => '<li class="' + (d ? 'd' : '') + '">' + l.replace('Annexe — ', '') + '</li>').join('');
  function paint() {
    const cur = State.room;
    let m = '',
      h = '';
    for (let r = 1; r <= 12; r++) {
      const st = r < cur ? 'done' : r === cur ? 'cur' : '';
      m += '<button data-r="' + r + '" class="' + st + '">' + String(r).padStart(2, '0') + '</button>';
      const open = S.sec[r] === undefined ? r === cur : S.sec[r];
      let ql = [];
      try {
        ql = questLines(r);
      } catch (e) {}
      const last = ql.length ? ql[ql.length - 1] : null,
        side = ql.slice(0, -1);
      h +=
        '<div class="sec' +
        (open ? ' open' : '') +
        (r === cur ? ' cur' : '') +
        '"><button data-r="' +
        r +
        '"><span>SECTEUR ' +
        String(r).padStart(2, '0') +
        ' · ' +
        NAMES[r - 1].toUpperCase() +
        '</span><span class="tag">' +
        (r < cur ? 'EXPLORÉ' : r === cur ? 'EN COURS' : 'À VENIR') +
        ' ' +
        (open ? '−' : '+') +
        '</span></button><div class="c">' +
        (r === cur
          ? '<h5>Mission principale</h5><p class="ob">' +
            objectiveNow() +
            '</p>' +
            (subGoals0(r).length ? '<ul>' + li(subGoals0(r)) + '</ul>' : '')
          : '') +
        '<h5>Opérations annexes</h5>' +
        (side.length ? '<ul>' + li(side) + '</ul>' : '<p class="tag">Aucune.</p>') +
        (last ? '<p class="tag">' + last[0] + '</p>' : '') +
        '</div></div>';
    }
    document.getElementById('bkmap').innerHTML = m;
    document.getElementById('bklist').innerHTML = h;
  }
  const toggle = (r) => {
    const cur = State.room,
      open = S.sec[r] === undefined ? r === cur : S.sec[r];
    S.sec[r] = !open;
    const sc = document.getElementById('bklist').scrollTop;
    paint();
    document.getElementById('bklist').scrollTop = sc;
  };
  root.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.id === 'bkx') api.close();
    else if (t.id === 'bkall') {
      for (let r = 1; r <= 12; r++) S.sec[r] = true;
      paint();
    } else if (t.id === 'bkno') {
      for (let r = 1; r <= 12; r++) S.sec[r] = false;
      paint();
    } else if (t.dataset.r) toggle(+t.dataset.r);
  });
  const api = {
    open() {
      if (!State.book) {
        say(
          'Vous n’avez pas encore de carnet de mission : cherchez-le sur la table près de votre point de départ.',
          5000
        );
        return;
      }
      if (S.open || (modalOpen && !invOpen) || State.doorExit) return;
      if (invOpen) setInv(false);
      if (State.focus) release(true);
      S.open = true;
      root.classList.add('on');
      modalOpen = true;
      SND.play('paper');
      paint();
    },
    close() {
      if (!S.open) return;
      S.open = false;
      root.classList.remove('on');
      modalOpen = false;
      SND.play('click');
    },
    toggle() {
      S.open ? api.close() : api.open();
    }
  };
  addEventListener(
    'keydown',
    (e) => {
      if (e.repeat) return;
      if (CONTROLS.keys.objectives.includes(e.code) && !(e.target && e.target.tagName === 'INPUT')) {
        e.stopImmediatePropagation();
        api.toggle();
      } else if (e.code === 'Escape' && S.open) {
        e.stopImmediatePropagation();
        api.close();
      }
    },
    true
  );
  document.getElementById('ifg').addEventListener('click', (e) => {
    const c = e.target.closest('.card');
    if (c && /Carnet de mission/.test(c.textContent)) {
      setInv(false);
      api.open();
    }
  });
  {
    const iv = setInterval(() => {
      if (S.open) paint();
    }, 1200);
    if (iv && iv.unref) iv.unref();
  }
  gameTimeout(() => {
    if (!State.book)
      say(
        'Un carnet de mission est posé sur la table, près de la porte : prenez-le pour voir vos objectifs.',
        7000
      );
  }, 2500);
  return api;
})();
/* ── Perf : le décor de la salle 1 ne projette pas d’ombre (beaucoup de petits objets) ── */
(function () {
  const n0 = ROOM1_DECOR_START;
  scene.children.slice(n0).forEach((o) =>
    o.traverse((m) => {
      if (m.isMesh && !m.userData.hit) m.castShadow = false;
    })
  );
})();
