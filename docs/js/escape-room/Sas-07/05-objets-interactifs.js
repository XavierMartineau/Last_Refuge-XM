/* LAST REFUGE · XM — Escape room « Sas 07 » · Système d’objets interactifs, état de la partie et actions.
   Fichier chargé dans l’ordre par escape-room.js : il partage la portée globale des autres fichiers. */
'use strict';
/* ════════════════════════════════════════════════════════════════
   5. SYSTÈME D’OBJETS INTERACTIFS
   interactive(obj,id,hint,actionType,extra) : donne un nom, un id et un userData standard.
   Pour ajouter vos propres événements : Actions.register('mon_id', obj => {...})
   ════════════════════════════════════════════════════════════════ */
function interactive(obj, id, hint, actionType = 'inspect', extra = {}) {
  obj.name = id;
  obj.userData = {
    interactive: true,
    id,
    actionType,
    state: 'idle',
    hint: TEXTS.hints[id] ?? hint,
    ...extra
  };
  return obj;
}
let modalOpen = false; // état « une fenêtre modale est ouverte » (déclaré en premier : utilisé par de nombreux écouteurs)
const State = {
  cutters: false,
  badge: false,
  screwdriver: false,
  panelOpen: false,
  battery: false,
  fuel: false,
  genBat: false,
  genFuel: false,
  noteLocker: false,
  gen1: false,
  panelRead: false,
  power: false,
  unlocked: false,
  door1: false,
  locker3: false,
  room: 1,
  townGateOpen: false,
  seq: [],
  solved: false,
  doorExit: false,
  focus: null,
  door2: false,
  door3: false,
  doorFinal: false,
  safe: false,
  card: false,
  vaultUnlocked: false,
  power4: false,
  brk: [0, 0, 0, 0],
  doorHangar: false,
  doorWare: false,
  doorEnd: false,
  power5: false,
  fuses: 0,
  fusesIn: 0,
  wareCode: false,
  key: false,
  doorCmd: false,
  doorExit2: false,
  relays: 0,
  power8: false,
  key2: false,
  keyCell: false,
  key4: false,
  crowbar: false,
  keyCtrl: false,
  barDone: false,
  bureauOpen: false,
  breaker: false,
  doorBlock: false,
  doorExit3: false,
  cell3seen: false,
  armed: false,
  zDone: false,
  kills: 0,
  spawned: 0,
  wave: 0,
  hp: 100,
  ammo: 0,
  reloading: false,
  spawnT: 0
};
const Actions = {
  handlers: {},
  register(id, fn) {
    this.handlers[id] = fn;
  }
};
