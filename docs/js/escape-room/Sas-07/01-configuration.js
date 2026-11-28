/* LAST REFUGE · XM — Escape room « Sas 07 » · Configuration : réglages du jeu, des contrôles, du son et tous les textes.
   Fichier chargé dans l’ordre par escape-room.js : il partage la portée globale des autres fichiers. */
'use strict';
const gameTimers = new Set();
function gameTimeout(callback, ms) {
  gameTimers.add({ callback, remaining: ms });
}
function gameTimersFrame(dt) {
  for (const timer of [...gameTimers]) {
    timer.remaining -= dt * 1000;
    if (timer.remaining <= 0) {
      gameTimers.delete(timer);
      timer.callback();
    }
  }
}
const AV = {
  obj: null,
  tp: true,
  heldItem: 'flashlight',
  vis: true,
  dist: 2.3,
  shoulder: 0.5,
  amt: 0,
  key: 'lastrefuge-3d-character',
  state: null
}; // réglages du personnage jouable

/* ════════════════════════════════════════════════════════════════
   1. CONFIGURATION (tout ce qu’on peut vouloir ajuster est ici)
   Pièce 1 : sas, centrée en (0,0,0)   — Pièce 2 : salle de contrôle, centrée en (0,0,-8)
   ════════════════════════════════════════════════════════════════ */
const CONFIG = {
  W: 8,
  H: 3.4,
  eye: 1.6,
  fov: 68,
  // ───── APPAREIL : adapter le jeu à un téléphone / une tablette (tout se règle ici) ─────
  device: {
    touch: 'auto', // 'auto' = détecte l’écran tactile · true = forcer les contrôles tactiles · false = jamais
    pixelRatioDesktop: 1, // netteté sur ordinateur (le jeu baisse tout seul la résolution s’il rame)
    msaaDesktop: 0, // anticrénelage ordinateur : 0, 2 ou 4 (4 = plus net mais plus lourd)
    pixelRatioMobile: 1.25, // netteté sur mobile (baisser à 1 si ça rame)
    antialiasMobile: false, // anticrénelage (MSAA) sur mobile : coûteux
    bloomMobile: true, // halo lumineux des néons sur mobile (false = plus fluide)
    shadowsMobile: true, // ombres sur mobile (false = beaucoup plus fluide)
    stickSize: 120, // taille du joystick (px)
    buttonSize: 62, // taille des boutons d’action (px)
    lookSpeed: 1.3, // multiplicateur de sensibilité du regard au doigt
    fovPortrait: 82
  }, // champ de vision quand l’écran est en hauteur
  interactReach: 0.5, // distance max (m, au sol) entre le corps du joueur et un objet pour pouvoir l’activer ou le prendre
  doorCode: '482915', // code à 6 chiffres de la porte du sas (révélé par le terminal quand l’énigme de la pièce 1 est résolue)
  code: '4719', // code du terminal (47 sur le panneau + 19 dans la note)
  sequence: ['green', 'red', 'blue'], // ordre des boutons de la salle 2
  roomZ: [0, -8, -17, -27, -52, -87], // centre (z) de chacune des 6 salles
  quitUrl: '../../../../index.html', // retour à l'accueil depuis la page du jeu
  wareCode: ['3', '0', '7', '1'], // entrepôt : un chiffre sur chacune des 4 affiches (allées 1 à 4) = code du digicode
  safeCode: '5294', // coffre de la pièce 3 = numéros des lits de la rangée EST (de l’entrée vers le fond)
  breakers: [1, 0, 1, 1], // pièce 4 : position des 4 disjoncteurs (1 = ON) — même motif peint sur le mur
  light: {
    ambient: 0.05, // lumière ambiante (très faible : on est dans le noir)
    neonPower: 2.3
  }, // puissance des néons une fois le courant rétabli (levier = pièces 1-2, générateur = pièces 3-4)
  /* LAMPE TORCHE : touche F (voir CONTROLS.keys.flashlight) ou bouton en haut à droite */
  flashlight: {
    startOn: true,
    closeDist: 4,
    closeMin: 0.1, // à moins de closeDist mètres d’une surface la lampe faiblit (jusqu’à closeMin × sa puissance)
    color: 0xfff1d6,
    intensity: 75,
    distance: 26,
    angle: 0.38,
    penumbra: 0.55,
    decay: 1.7,
    fill: 1.3, // petite lueur autour du joueur
    swayLag: 14, // retard du faisceau quand on tourne (plus petit = plus de balancement)
    flicker: true,
    shadows: true
  }
};

/* ───────── CONTRÔLES & DÉPLACEMENT : modifiez ces valeurs librement ─────────
   Les touches utilisent « event.code » (position physique sur le clavier) :
   KeyW/KeyA/KeyS/KeyD = ZQSD sur un clavier AZERTY, WASD sur un QWERTY. Autres codes : ArrowUp, ShiftLeft, Space, Escape, KeyM… */
const CONTROLS = {
  look: {
    sensitivity: 1, // vitesse du regard à la souris / au doigt
    invertY: false, // true = axe vertical inversé
    pitchLimit: 1.1, // angle max haut/bas (radians)
    inertia: 0.9, // 0 = s’arrête net, 0.95 = glisse longtemps
    keyTurnSpeed: 1.8, // rotation avec ← → (radians par seconde)
    keyPitchSpeed: 1.2
  }, // regard haut/bas au clavier
  walk: {
    enabled: true, // false = pas de marche (regard et clic seulement)
    speed: 2.0, // mètres par seconde
    sprintMultiplier: 1.7, // multiplicateur quand on maintient Maj
    crouchEye: 0.85, // hauteur des yeux accroupi (debout = 1.6)
    crouchSpeed: 0.45, // multiplicateur de vitesse accroupi
    radius: 0.25, // « épaisseur » du joueur pour les collisions
    bob: true,
    bobAmount: 0.035,
    bobSpeed: 7
  }, // balancement de la caméra en marchant
  keys: {
    forward: ['KeyW', 'ArrowUp'],
    back: ['KeyS', 'ArrowDown'],
    left: ['KeyA'],
    right: ['KeyD'],
    turnLeft: ['ArrowLeft'],
    turnRight: ['ArrowRight'],
    lookUp: ['PageUp'],
    lookDown: ['PageDown'],
    sprint: ['ShiftLeft', 'ShiftRight'],
    crouch: ['ControlLeft', 'ControlRight', 'KeyC'],
    inventory: ['KeyH'],
    objectives: ['KeyO'],
    exitZoom: ['Escape'],
    mute: [],
    flashlight: ['KeyF'],
    view: ['KeyV'],
    take: ['KeyE']
  }
};

/* ───────── SON : volumes (0 à 1) et options ───────── */
const SOUND = {
  enabled: true,
  music: 0.8,
  musicBoost: 3.2,
  musicOn: true, // musicBoost = amplification globale de la musique (monter si encore trop faible)
  // musique : volume (0 à 1) et interrupteur
  master: 0.5,
  sfx: 0.9,
  ambience: 0.8,
  reverb: 0.35,
  hoverTick: true, // petit « tic » quand on survole un objet
  footsteps: true, // bruit de pas
  drips: true, // gouttes d’eau aléatoires
  alarm: true
}; // bip d’alarme tant que l’énigme de la pièce n’est pas résolue

/* ───────── TEXTES : tous les messages du jeu sont ici ─────────
   {n} et {total} sont remplacés automatiquement. Les clés de « hints » sont les id des objets
   (la version « _on », « _open »… est utilisée quand l’état de l’objet change). */
const TEXTS = {
  ui: {
    objective: 'OBJECTIF',
    help: 'Clic-glisser : regarder · ZQSD / WASD : marcher · ← → : tourner · Maj : courir · Ctrl / C : s’accroupir · H : inventaire · O : objectifs · F : lampe torche · V : vue 1re/3e personne · Clic : interagir · Échap : quitter le zoom · M : son',
    back: '← Quitter le zoom',
    validate: 'Valider',
    cancel: 'Annuler',
    keypadTitle: 'CODE D’ACCÈS',
    soundOn: '🔊 Son',
    soundOff: '🔇 Muet',
    hintPrefix: '[Clic] ',
    endTitle: 'ÉVASION RÉUSSIE',
    endText: 'La lumière du jour… enfin.',
    replay: 'Rejouer',
    flashOn: '🔦 Lampe : ON (F)',
    flashOff: '🔦 Lampe : OFF (F)',
    inventory: 'Inventaire',
    items: {
      card: 'Carte d’accès',
      fuse: 'Fusible'
    },
    safeTitle: 'CODE DU COFFRE'
  },
  intro:
    'Vous reprenez conscience dans un sas plongé dans le noir. Votre lampe torche marche : F pour l’allumer ou l’éteindre. Glissez pour regarder, ZQSD pour marcher.',
  objectives: {
    start: 'Retrouvez le courant du sas.',
    lever: 'Le générateur tourne : actionnez le levier.',
    needCode: 'Trouvez le code du terminal : panneau taché et casiers.',
    openDoor: 'Entrez le code à 6 chiffres sur la porte du sas.',
    room2: 'Rétablissez la séquence d’alimentation. Un panneau mural donne l’ordre des boutons.',
    exit: 'Franchissez la porte nord.',
    openVault: 'Ouvrez la porte du fond.',
    room3: 'Trouvez le code du coffre : une note traîne sur la table et les lits portent des numéros.',
    needCard: 'Utilisez la carte d’accès sur le lecteur, près de la porte du fond.',
    room4: 'Rétablissez le générateur : les disjoncteurs doivent suivre le motif peint sur le mur.',
    exitFinal: 'Le courant est rétabli. Sortez par la porte du fond.',
    room5:
      'Hangar : trouvez les 3 fusibles et placez-les dans la boîte à fusibles, près de la porte du fond.',
    openHangar: 'Le courant revient dans le hangar. Ouvrez la porte du fond.',
    room6:
      'Entrepôt : lisez les 4 affiches des allées (1 à 4) et composez le code au digicode, près de la porte du fond.',
    openWare: 'Le digicode est validé. Ouvrez la porte du fond pour vous échapper.'
  },
  hints: {
    door_room1: 'Examiner la porte du sas',
    door_room1_unlocked: 'Ouvrir la porte',
    door_room1_open: 'Franchir la porte',
    panel_blood_01: 'Inspecter le panneau taché',
    switch_power: 'Actionner le levier',
    switch_power_on: 'Levier abaissé',
    terminal_01: 'Utiliser le terminal',
    locker_01: 'Inspecter le casier',
    locker_02: 'Inspecter le casier',
    locker_03: 'Ouvrir le casier',
    locker_03_open: 'Casier ouvert',
    locker_04: 'Inspecter le casier',
    note_log: 'Lire la note',
    btn_green: 'Appuyer sur le bouton vert',
    btn_red: 'Appuyer sur le bouton rouge',
    btn_blue: 'Appuyer sur le bouton bleu',
    panel_blood_02: 'Inspecter le panneau',
    valve_pipe: 'Tourner la vanne',
    tank_01: 'Examiner la cuve',
    door_exit: 'Examiner la porte nord',
    door_exit_unlocked: 'Ouvrir la porte nord',
    door_vault: 'Examiner la porte du fond',
    door_vault_unlocked: 'Ouvrir la porte du fond',
    door_final: 'Examiner la porte de sortie',
    door_final_unlocked: 'Ouvrir la porte de sortie',
    note_safe: 'Lire la note',
    note_desk: 'Lire le journal',
    radio_01: 'Écouter la radio',
    safe_01: 'Examiner le coffre',
    safe_01_open: 'Coffre ouvert',
    keycard: 'Prendre la carte d’accès',
    reader_01: 'Utiliser le lecteur',
    panel_blood_03: 'Inspecter le panneau peint',
    gen_01: 'Examiner le générateur',
    medcab: 'Ouvrir l’armoire à pharmacie',
    rack_01: 'Examiner le serveur',
    rack_02: 'Examiner le serveur',
    bag_01: 'Examiner le sac mortuaire',
    fuse_1: 'Prendre le fusible',
    fuse_2: 'Prendre le fusible',
    fuse_3: 'Prendre le fusible',
    fusebox_01: 'Utiliser la boîte à fusibles',
    door_hangar: 'Examiner la porte du hangar',
    door_hangar_unlocked: 'Ouvrir la porte du hangar',
    door_ware: 'Examiner la porte de sortie',
    door_ware_unlocked: 'Sortir du bunker',
    poster_1: 'Lire l’affiche de l’allée 1',
    poster_2: 'Lire l’affiche de l’allée 2',
    poster_3: 'Lire l’affiche de l’allée 3',
    poster_4: 'Lire l’affiche de l’allée 4',
    keypad_ware: 'Utiliser le digicode'
  },
  msg: {
    panel1: 'Des chiffres tracés dans le sang séché : « 4 7 ». La suite a été effacée.',
    powerAlready: 'Le levier est bloqué en position haute. Le courant est rétabli.',
    powerOn: 'Un grondement. Les néons se stabilisent et le terminal s’allume.',
    termNoPower: 'L’écran est noir. Il n’y a plus de courant dans le sas.',
    termDone: 'Terminal : « Verrou principal désengagé. »',
    termOk: 'Le terminal affiche un code à 6 chiffres : {c}. Il ouvre la porte du sas.',
    termCode: 'Terminal : « Code de la porte du sas : {c} ».',
    doorCodeTitle: 'CODE DU SAS (6 CHIFFRES)',
    doorBad: 'Code incorrect. Le verrou reste fermé.',
    doorUnlocked: 'Clac. Le verrou de la porte du sas se désengage.',
    termBad: 'Terminal : « Code incorrect. »',
    locker3Done: 'Le casier est déjà ouvert.',
    locker3Open:
      'Le casier grince et s’ouvre. Une note est collée au fond, et une batterie est posée sur l’étagère.',
    note: '« …le dernier chiffre a été scellé dans le sang. Il ne reste que 1 9 pour finir le code. »',
    lockersOther: [
      'Cadenas rouillé : impossible à forcer.',
      'Vide, hormis une odeur de moisi.',
      'Des vêtements déchirés, tachés de sang.'
    ], // casiers 1, 2 et 4
    door1Locked: 'Verrouillée. Un terminal est relié à la porte.',
    door1Open: 'Les gonds hurlent. La salle de contrôle s’ouvre devant vous.',
    panel2: 'Trois pastilles de couleur numérotées au sang : 1 vert, 2 rouge, 3 bleu.',
    valve: 'La vanne est grippée par la rouille. Elle ne bougera plus.',
    tank: 'Quelque chose flotte dans le liquide vert, immobile. Mieux vaut ne pas s’approcher.',
    seqWrong: 'Bzzzt ! Mauvaise séquence : la console se réinitialise.',
    seqProgress: 'Séquence correcte… ({n}/{total})',
    seqOk: 'La console s’illumine. La porte nord se déverrouille.',
    consoleLocked: 'La console est verrouillée en position « ouvert ».',
    exitLocked: 'Verrouillée. Les moniteurs indiquent que la séquence n’est pas validée.',
    exit2Open: 'La porte nord s’ouvre sur un immense dortoir plongé dans le noir.',
    safeNote: 'Note',
    noteDesk:
      '« Jour 12 — La lumière baisse. Il ne reste que les lampes torches. Gardez-les pour les couloirs noirs. »',
    noteSafe: '« Coffre : les numéros des lits de la rangée EST, de l’entrée vers le fond. »',
    radio:
      'Un grésillement, puis une voix hachée : « …ne restez pas dans le noir… le courant du fond… générateur… »',
    safeOpen: 'Le coffre s’ouvre. Une carte d’accès est posée au fond.',
    safeDone: 'Le coffre est ouvert.',
    safeBad: 'Le coffre reste fermé.',
    cardTaken: 'Vous prenez la carte d’accès.',
    readerNoCard: 'Le lecteur clignote : « CARTE REQUISE ».',
    readerOk: 'Bip. Le verrou de la porte du fond se désengage.',
    readerDone: 'Le lecteur est au vert.',
    vaultLocked: 'Verrouillée. Un lecteur de carte est fixé au mur à côté.',
    vaultOpen: 'La porte du fond s’ouvre sur une salle des machines.',
    panel3: 'Quatre disques peints dans le sang : plein, vide, plein, plein.',
    brkToggle: 'Disjoncteur {n} : {s}.',
    brkOk:
      'Le générateur démarre dans un grondement. Les néons s’allument et la porte de sortie se déverrouille.',
    genOff: 'Le générateur est à l’arrêt. Le tableau de disjoncteurs est mal réglé.',
    genOn: 'Le générateur tourne. Tout vibre.',
    finalLocked: 'Verrouillée. Le générateur est à l’arrêt.',
    medcab: 'Des bandages poisseux et une seringue vide. Rien d’utile.',
    rack: 'Les disques tournent encore. Un journal défile : « ALIMENTATION AUXILIAIRE : ÉCHEC ».',
    bag: 'Un sac mortuaire noir, fermé. Mieux vaut ne pas l’ouvrir.',
    nothing: 'Rien d’intéressant.',
    needGen:
      'Le levier est mort : aucun courant. Il faut d’abord démarrer le petit générateur, au fond du sas.',
    noteFirst: 'Le casier est fermé.',
    batTaken: 'Une batterie de camion, lourde mais intacte. Elle ira sur le générateur.',
    fuelTaken: 'Un bidon d’essence, encore à moitié plein.',
    genNoBat:
      'Le générateur n’a plus de batterie : les bornes sont à nu. Il y en a peut-être une dans un casier.',
    genNoFuel: 'Le réservoir est vide. Il faut de l’essence : un bidon traîne forcément dans le sas.',
    genNoBoth:
      'Pas de batterie, réservoir vide. Cherchez une batterie (casiers) et un bidon d’essence dans le sas.',
    genBatIn: 'Vous branchez la batterie : une gerbe d’étincelles jaillit des bornes !',
    genFuelIn: 'Vous videz le bidon dans le réservoir. Reste à tirer le démarreur.',
    genTry: 'Le moteur tousse, crache de la fumée… et cale. Encore une fois !',
    genSasOn: 'Le générateur démarre dans un vacarme. Le levier devrait répondre, maintenant.',
    genAlready: 'Le générateur tourne, rugueux et brûlant.',
    finalOpen:
      'La porte s’ouvre sur un hangar gigantesque, englouti dans le noir. Le courant est coupé ici aussi.',
    viewTP: 'Vue 3e personne.',
    viewFP: 'Vue 1re personne.',
    fuseTaken: 'Vous ramassez un fusible. ({n}/3)',
    fuseboxNone: 'Trois emplacements vides. Il manque des fusibles : cherchez dans le hangar.',
    fuseboxIn: 'Vous placez {k} fusible(s). ({n}/3)',
    fuseboxOk:
      'Les trois fusibles sont en place. Un grondement, puis les néons du hangar se rallument. La porte du fond se déverrouille.',
    fuseboxDone: 'La boîte à fusibles est complète.',
    hangarLocked: 'Verrouillée. Le courant du hangar est coupé : la boîte à fusibles est vide.',
    hangarOpen: 'La porte s’ouvre sur un entrepôt aux rayonnages interminables.',
    poster: 'Affiche « ALLÉE {n} » : un chiffre a été tracé au sang… « {d} ».',
    wareTitle: 'CODE DE L’ENTREPÔT',
    wareOk: 'Bip. Le verrou de la porte de sortie se désengage.',
    wareBad: 'Code incorrect.',
    wareDone: 'Le digicode est au vert.',
    wareLocked: 'Verrouillée. Un digicode est fixé au mur à côté.',
    wareOpen: 'La porte s’ouvre : un courant d’air froid… la sortie, enfin.',
    pressE: 'Appuyez sur E pour le prendre.',
    tooFar: 'Trop loin : approchez-vous à moins de {d} m.'
  },
  screens: {
    term_off: ['TERMINAL SAS 07', '', '> ALIMENTATION:', '  HORS LIGNE'],
    term_on: ['TERMINAL SAS 07', '', '> ALIMENTATION: OK', '> CODE D’ACCÈS ?', '  _ _ _ _'],
    term_ok: ['TERMINAL SAS 07', '', '> ACCÈS AUTORISÉ', '> VERROU OUVERT'],
    mon_off: [
      ['SYSTÈME', '> HORS SERVICE', '> SÉQUENCE ?'],
      ['RÉACTEUR', '> INSTABLE', '> 0%'],
      ['PORTE NORD', '> VERROUILLÉE']
    ],
    mon_err: [
      ['SYSTÈME', '> ERREUR', '> RESET'],
      ['RÉACTEUR', '> INSTABLE'],
      ['PORTE NORD', '> VERROUILLÉE']
    ],
    mon_ok: [
      ['SYSTÈME', '> EN LIGNE'],
      ['RÉACTEUR', '> STABLE', '> 100%'],
      ['PORTE NORD', '> DÉVERROUILLÉE']
    ]
  }
};
const easeInOut = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
let _s = 1337;
const rnd = () => {
  _s |= 0;
  _s = (_s + 0x6d2b79f5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}; // aléatoire déterministe
