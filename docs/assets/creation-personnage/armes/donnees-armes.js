/* LAST REFUGE · XM — Armurerie : liste des armes, pièces, finitions et caractéristiques.
   Module extrait de createur-personnage-3d+armes.html (partagé par le créateur et l’escape room). */
import { DEF, LABEL, LEN, NAMES, emptyChoices } from '../donnees/donnees.js';
import { clamp } from '../outils/outils-3d.js';

Object.assign(LEN, { weapon: 13, wMuzzle: 5, wOptic: 5, wUnder: 5, wStock: 5, wMag: 4, wFinish: 8 });
const WCTX = { w: 0 };
const GUN_MUZ = ['Standard', 'Frein de bouche', 'Silencieux', 'Cache-flamme', 'Compensateur'];
Object.assign(NAMES, {
  weapon: [
    'Aucune arme',
    'Couteau de combat',
    'Pistolet 9 mm',
    'Fusil à pompe',
    'AK-47',
    'Fusil de précision',
    'Minigun',
    'Revolver Magnum',
    'Pistolet-mitrailleur',
    'Carabine M4',
    'Fusil à levier',
    'Machette',
    'Lance-roquettes'
  ],
  wMuzzle: GUN_MUZ,
  wOptic: ['Organes de visée (fer)', 'Point rouge', 'Holographique', 'Lunette ACOG', 'Lunette longue portée'],
  wUnder: ['Aucun', 'Poignée verticale', 'Lampe tactique', 'Laser', 'Bipied'],
  wStock: ['Standard', 'Crosse pliante', 'Crosse tactique', 'Crosse en bois', 'Sans crosse'],
  wMag: ['Chargeur standard', 'Chargeur étendu', 'Chargeur tambour', 'Double chargeur'],
  wFinish: [
    'Noir mat',
    'Acier brossé',
    'Vert militaire',
    'Sable désert',
    'Bois et noir',
    'Blanc arctique',
    'Rouge sang',
    'Bleu nuit'
  ]
});
Object.assign(LABEL, {
  weapon: 'Arme',
  wMuzzle: 'Embout (bouche du canon)',
  wOptic: 'Optique de visée',
  wUnder: 'Accessoire sous le canon',
  wStock: 'Crosse',
  wMag: 'Chargeur',
  wFinish: 'Finition'
});
Object.assign(DEF, { weapon: 0, wMuzzle: 0, wOptic: 0, wUnder: 0, wStock: 0, wMag: 0, wFinish: 4 });
emptyChoices.add('weapon');
const WFIN = ['#1b1b1d', '#8a8d90', '#4a5a3a', '#b09a6a', '#26272a', '#d8d8d4', '#8a1e18', '#2a3140'];
const WSLOTS = {
  1: ['wMuzzle', 'wFinish'],
  2: ['wMuzzle', 'wOptic', 'wUnder', 'wMag', 'wFinish'],
  3: ['wMuzzle', 'wOptic', 'wUnder', 'wStock', 'wMag', 'wFinish'],
  4: ['wMuzzle', 'wOptic', 'wUnder', 'wStock', 'wMag', 'wFinish'],
  5: ['wMuzzle', 'wOptic', 'wUnder', 'wStock', 'wMag', 'wFinish'],
  6: ['wMuzzle', 'wUnder', 'wMag', 'wFinish'],
  7: ['wMuzzle', 'wOptic', 'wUnder', 'wFinish'],
  8: ['wMuzzle', 'wOptic', 'wUnder', 'wStock', 'wMag', 'wFinish'],
  9: ['wMuzzle', 'wOptic', 'wUnder', 'wStock', 'wMag', 'wFinish'],
  10: ['wMuzzle', 'wOptic', 'wFinish'],
  11: ['wMuzzle', 'wFinish'],
  12: ['wOptic', 'wFinish']
};
const WALT = {
  wMuzzle: {
    11: ['Lame droite', 'Lame courbe', 'Lame kukri', 'Lame dentelée', 'Pointe clip'],
    1: ['Pointe classique', 'Pointe tanto', 'Lame dentelée', 'Pointe crochet', 'Double tranchant']
  },
  wMag: { 6: ['Boîte 200 coups', 'Boîte 400 coups', 'Tambour dorsal', 'Double boîte'] },
  wUnder: { 6: ['Poignée standard', 'Poignée renforcée', 'Lampe', 'Laser', 'Trépied'] }
};
const WLAB = {
  wMuzzle: { 1: 'Forme de la lame (embout)', 11: 'Forme de la lame (embout)' },
  wMag: { 6: 'Munitions' },
  wUnder: { 6: 'Poignées' }
};
const WPN = [
  null,
  {
    n: 'Couteau de combat',
    dmg: 35,
    rate: 90,
    range: 2,
    acc: 100,
    wt: 0.4,
    mag: 0,
    cat: 'Mêlée silencieuse'
  },
  { n: 'Pistolet 9 mm', dmg: 25, rate: 60, range: 35, acc: 70, wt: 1, mag: 15, cat: 'Arme de poing' },
  {
    n: 'Fusil à pompe',
    dmg: 90,
    rate: 25,
    range: 20,
    acc: 45,
    wt: 3.3,
    mag: 8,
    cat: 'Courte portée, gros dégâts'
  },
  { n: 'AK-47', dmg: 42, rate: 600, range: 90, acc: 58, wt: 4.3, mag: 30, cat: 'Fusil d’assaut' },
  { n: 'Fusil de précision', dmg: 140, rate: 40, range: 400, acc: 92, wt: 6.5, mag: 5, cat: 'Longue portée' },
  { n: 'Minigun', dmg: 30, rate: 3000, range: 120, acc: 28, wt: 20, mag: 200, cat: 'Arme lourde' },
  {
    n: 'Revolver Magnum',
    dmg: 70,
    rate: 45,
    range: 40,
    acc: 75,
    wt: 1.2,
    mag: 6,
    cat: 'Arme de poing lourde'
  },
  {
    n: 'Pistolet-mitrailleur',
    dmg: 22,
    rate: 800,
    range: 45,
    acc: 62,
    wt: 2.9,
    mag: 30,
    cat: 'Rafale rapprochée'
  },
  {
    n: 'Carabine M4',
    dmg: 38,
    rate: 750,
    range: 110,
    acc: 72,
    wt: 3.4,
    mag: 30,
    cat: 'Fusil d’assaut polyvalent'
  },
  {
    n: 'Fusil à levier',
    dmg: 85,
    rate: 35,
    range: 130,
    acc: 80,
    wt: 3.1,
    mag: 8,
    cat: 'Précis, cadence lente'
  },
  { n: 'Machette', dmg: 55, rate: 70, range: 2, acc: 95, wt: 0.8, mag: 0, cat: 'Mêlée tranchante' },
  { n: 'Lance-roquettes', dmg: 400, rate: 6, range: 200, acc: 50, wt: 7, mag: 1, cat: 'Explosif' }
];
const WMOD = {
  // modificateurs : + / - ajoutés, x = multiplié
  wMuzzle: [
    {},
    { acc: 4, recoil: -12, noise: 10 },
    { acc: 6, xr: 0.92, xd: 0.97, noise: -70 },
    { acc: 2, recoil: -5, noise: -10 },
    { acc: 6, recoil: -20 }
  ],
  wOptic: [{}, { acc: 8 }, { acc: 10 }, { acc: 14, xr: 1.1 }, { acc: 22, xr: 1.35, xrate: 0.95 }],
  wUnder: [{}, { acc: 6, recoil: -10 }, { acc: 2, wt: 0.2 }, { acc: 5 }, { acc: 12, wt: 0.6, recoil: -18 }],
  wStock: [
    {},
    { wt: -0.3, acc: -5 },
    { acc: 5, wt: 0.2 },
    { wt: 0.4, xd: 1.02 },
    { wt: -0.6, acc: -12, recoil: 15 }
  ],
  wMag: [{}, { xm: 1.5, wt: 0.2 }, { xm: 2.5, wt: 0.8, xrate: 0.95 }, { xm: 2, wt: 0.3 }]
};
const KNIFE_MOD = [
  {},
  { xd: 1.1 },
  { xd: 1.15, acc: -5 },
  { xd: 1.05, acc: 5, xrate: 0.9 },
  { xd: 1.1, wt: 0.05 }
];
function weaponStats(s) {
  const b = WPN[s.weapon];
  if (!b) return null;
  const r = {
    dmg: b.dmg,
    rate: b.rate,
    range: b.range,
    acc: b.acc,
    wt: b.wt,
    mag: b.mag,
    noise: 100,
    recoil: 50,
    name: b.n,
    cat: b.cat
  };
  const ap = (m) => {
    if (!m) return;
    r.acc += m.acc || 0;
    r.wt += m.wt || 0;
    r.recoil += m.recoil || 0;
    r.noise += m.noise || 0;
    r.range *= m.xr || 1;
    r.dmg *= m.xd || 1;
    r.rate *= m.xrate || 1;
    r.mag *= m.xm || 1;
  };
  if (s.weapon === 1 || s.weapon === 11) {
    ap(KNIFE_MOD[s.wMuzzle]);
    r.noise = 5;
    r.recoil = 0;
  } else for (const k of WSLOTS[s.weapon] || []) if (k !== 'wFinish') ap(WMOD[k][s[k]]);
  r.acc = clamp(Math.round(r.acc), 5, 100);
  r.dmg = Math.round(r.dmg);
  r.rate = Math.round(r.rate);
  r.range = Math.round(r.range);
  r.mag = Math.round(r.mag);
  r.wt = Math.round(r.wt * 10) / 10;
  r.noise = clamp(Math.round(r.noise), 0, 140);
  r.recoil = clamp(Math.round(r.recoil), 0, 100);
  return r;
}

export { WCTX, GUN_MUZ, WFIN, WSLOTS, WALT, WLAB, WPN, WMOD, KNIFE_MOD, weaponStats };
