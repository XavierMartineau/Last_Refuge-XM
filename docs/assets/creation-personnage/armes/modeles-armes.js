/* LAST REFUGE · XM — Modèles 3D des 12 armes et de leurs pièces (embouts, optiques, crosses, chargeurs).
   Module extrait de createur-personnage-3d+armes.html (partagé par le créateur et l’escape room). */
import * as THREE from 'three';
import { WFIN } from './donnees-armes.js';
import { gunPaint, leather, metal, polyMat, woodMat } from '../materiaux/materiaux.js';
import { V, box, chain, cyl, ell, glowM, grp, limb, mat, mk, sh } from '../outils/outils-3d.js';
import { px } from '../tete/decalques.js';
import { R } from '../tete/tete.js';

function gunModel(s, k, wg, anim) {
  const fin = WFIN[s.wFinish] || WFIN[0],
    bm = gunPaint(fin),
    st = metal('#26282a', 0.4),
    steel = metal('#9a9d98', 0.28),
    poly = polyMat('#17181a'),
    wood = woodMat(),
    furn = s.wFinish === 4 ? wood : poly,
    brass = mat('#c9a64a', { metalness: 0.7, roughness: 0.3 });
  const zc = (r0, r1, len, m, x, y, z) => {
    const o = mk(new THREE.CylinderGeometry(r1, r0, len, 24), m, x, y, z + len / 2, wg);
    o.rotation.x = Math.PI / 2;
    return o;
  };
  const bx = (w, h, d, m, x, y, z) => box(w, h, d, m, x, y, z, wg);
  const px = (pts, w, m, x = 0, y = 0, z = 0) => {
    const sp = new THREE.Shape();
    pts.forEach((q, i) => (i ? sp.lineTo(q[0], q[1]) : sp.moveTo(q[0], q[1])));
    sp.closePath();
    const g = new THREE.ExtrudeGeometry(sp, {
      depth: w,
      bevelEnabled: true,
      bevelThickness: 0.0022,
      bevelSize: 0.0022,
      bevelSegments: 1,
      curveSegments: 4
    });
    g.translate(0, 0, -w / 2);
    g.rotateY(-Math.PI / 2);
    return mk(g, m, x, y, z, wg);
  };
  const rail = (z0, z1, y) => {
    bx(0.02, 0.005, z1 - z0, st, 0, y, (z0 + z1) / 2);
    for (let z = z0 + 0.005; z < z1; z += 0.012) bx(0.026, 0.004, 0.005, st, 0, y + 0.004, z);
  };
  const screws = (zs, y, m = steel) =>
    zs.forEach((z) => {
      for (const q of [-1, 1]) zc(0.004, 0.004, 0.003, m, q * 0.0215, y, z).rotation.z = Math.PI / 2;
    });
  const muzzle = (zm, y, r) => {
    switch (s.wMuzzle) {
      case 1:
        zc(r * 1.8, r * 1.8, 0.06, bm, 0, y, zm);
        for (let i = 0; i < 3; i++) bx(r * 4, 0.004, 0.008, st, 0, y, zm + 0.012 + i * 0.014);
        break;
      case 2:
        zc(r * 2.3, r * 2.3, 0.2, st, 0, y, zm);
        for (let i = 0; i < 5; i++) zc(r * 2.4, r * 2.4, 0.004, mat('#0c0c0c'), 0, y, zm + 0.025 + i * 0.036);
        zc(r * 2.35, r * 2.35, 0.012, st, 0, y, zm + 0.2);
        break;
      case 3:
        zc(r * 1.4, r * 2.1, 0.08, st, 0, y, zm);
        for (let i = 0; i < 6; i++) {
          const q = (i / 6) * 6.28;
          bx(0.004, 0.016, 0.03, st, Math.cos(q) * r * 2, y + Math.sin(q) * r * 2, zm + 0.05);
        }
        break;
      case 4:
        zc(r * 1.9, r * 1.9, 0.05, bm, 0, y, zm);
        bx(r * 4, 0.014, 0.02, st, 0, y + r * 1.9, zm + 0.025);
        bx(r * 4, 0.014, 0.02, st, 0, y - r * 1.9, zm + 0.025);
        break;
    }
    if (!s.wMuzzle) zc(r * 1.25, r * 1.25, 0.012, st, 0, y, zm);
  };
  const optic = (z, y) => {
    const o = s.wOptic;
    if (!o) return;
    const g = glowM('#ff3030', 1.4),
      gl = mat('#aaddff', { transparent: true, opacity: 0.38, roughness: 0.05 });
    rail(z - 0.07, z + 0.07, y);
    if (o === 1) {
      bx(0.03, 0.03, 0.05, st, 0, y + 0.024, z);
      bx(0.016, 0.02, 0.002, gl, 0, y + 0.036, z + 0.026);
      ell(0.0025, 0.0025, 0.0025, g, 0, y + 0.036, z + 0.022, wg);
    }
    if (o === 2) {
      bx(0.038, 0.014, 0.07, st, 0, y + 0.014, z);
      for (const q of [-1, 1]) bx(0.004, 0.034, 0.07, st, q * 0.017, y + 0.036, z);
      bx(0.034, 0.004, 0.07, st, 0, y + 0.056, z);
      bx(0.03, 0.03, 0.002, gl, 0, y + 0.036, z + 0.034);
    }
    if (o === 3) {
      zc(0.02, 0.02, 0.14, st, 0, y + 0.036, z - 0.07);
      zc(0.027, 0.027, 0.03, st, 0, y + 0.036, z + 0.06);
      zc(0.026, 0.026, 0.026, st, 0, y + 0.036, z - 0.08);
      zc(
        0.0165,
        0.0165,
        0.004,
        mat('#4488ff', { emissive: '#102040', roughness: 0.08 }),
        0,
        y + 0.036,
        z + 0.092
      );
      bx(0.014, 0.014, 0.022, st, 0, y + 0.012, z);
      ell(0.0025, 0.0025, 0.0025, glowM('#ff8a20', 1.6), 0, y + 0.062, z - 0.01, wg);
    }
    if (o === 4) {
      zc(0.0155, 0.0155, 0.4, st, 0, y + 0.046, z - 0.19);
      zc(0.032, 0.032, 0.07, st, 0, y + 0.046, z + 0.2);
      zc(0.028, 0.028, 0.05, st, 0, y + 0.046, z - 0.23);
      zc(0.0295, 0.0295, 0.012, steel, 0, y + 0.046, z + 0.0);
      zc(
        0.0165,
        0.0165,
        0.004,
        mat('#6a5aff', { emissive: '#101040', roughness: 0.08 }),
        0,
        y + 0.046,
        z + 0.27
      );
      for (const zz of [-0.05, 0.08]) bx(0.022, 0.026, 0.012, st, 0, y + 0.02, z + zz);
      zc(0.007, 0.007, 0.03, steel, 0.036, y + 0.048, z - 0.02).rotation.z = Math.PI / 2;
      zc(0.007, 0.007, 0.03, steel, 0, y + 0.084, z - 0.02);
    }
  };
  const under = (z, y) => {
    const u = s.wUnder;
    if (!u) return;
    if (u === 1) {
      cyl(0.0165, 0.0155, 0.11, poly, 0, y - 0.055, z, wg, 12);
      bx(0.022, 0.01, 0.04, st, 0, y, z);
    }
    if (u === 2) {
      zc(0.021, 0.021, 0.085, st, 0, y - 0.022, z);
      zc(0.0175, 0.0175, 0.004, glowM('#ffffee', 2.6), 0, y - 0.022, z + 0.085);
      bx(0.03, 0.012, 0.04, st, 0, y, z - 0.01);
    }
    if (u === 3) {
      bx(0.022, 0.03, 0.055, st, 0, y - 0.02, z);
      zc(0.005, 0.005, 0.01, glowM('#ff2020', 2.6), 0, y - 0.02, z + 0.055);
      bx(0.026, 0.01, 0.04, st, 0, y, z);
    }
    if (u === 4)
      for (const q of [-1, 1]) {
        limb([q * 0.012, y, z], [q * 0.07, y - 0.15, z + 0.15], 0.006, 0.005, st, wg);
        zc(0.007, 0.007, 0.02, steel, q * 0.07, y - 0.15, z + 0.15);
      }
  };
  // crosse : profils selon le type (0 standard, 1 pliante, 2 tactique, 3 bois, 4 aucune)
  const stockP = (zb, y, len, h, drop = 0.05) => {
    const t = s.wStock;
    if (t === 4) {
      bx(0.03, 0.07, 0.02, st, 0, y, zb);
      return;
    }
    if (t === 1) {
      for (const q of [-1, 1]) zc(0.006, 0.006, len * 0.95, st, q * 0.016, y + h * 0.25, zb - len * 0.95);
      px(
        [
          [zb - len * 0.95 - 0.01, y + h * 0.5],
          [zb - len * 0.95 + 0.012, y + h * 0.5],
          [zb - len * 0.95 + 0.012, y - h * 0.5],
          [zb - len * 0.95 - 0.01, y - h * 0.5]
        ],
        0.03,
        poly
      );
      return;
    }
    if (t === 2) {
      px(
        [
          [zb, y + h * 0.4],
          [zb - len * 0.6, y + h * 0.42],
          [zb - len, y + h * 0.3],
          [zb - len, y - h * 0.7],
          [zb - len * 0.55, y - h * 0.4],
          [zb, y - h * 0.4]
        ],
        0.036,
        poly
      );
      px(
        [
          [zb - len * 0.3, y + h * 0.42],
          [zb - len * 0.85, y + h * 0.34],
          [zb - len * 0.85, y + h * 0.52],
          [zb - len * 0.3, y + h * 0.55]
        ],
        0.032,
        furn
      );
      bx(0.042, h * 1.15, 0.022, mat('#0f0f0f', { roughness: 0.9 }), 0, y - 0.1 * h, zb - len);
      return;
    }
    const m = t === 3 ? wood : furn;
    px(
      [
        [zb, y + h * 0.45],
        [zb - len * 0.55, y + h * 0.38],
        [zb - len, y + h * 0.28],
        [zb - len * 1.01, y - h * 0.85],
        [zb - len * 0.7, y - h * 0.52 - drop * 0.4],
        [zb - len * 0.3, y - h * 0.45],
        [zb, y - h * 0.4]
      ],
      0.036,
      m
    );
    bx(0.038, h * 1.05, 0.016, mat('#0f0f0f', { roughness: 0.9 }), 0, y - h * 0.28, zb - len * 1.0);
  };
  const pgrip = (z, y, len, rake, m) => {
    px(
      [
        [z - 0.02, y],
        [z + 0.022, y],
        [z + 0.022 - rake, y - len],
        [z - 0.03 - rake, y - len],
        [z - 0.034 - rake * 0.4, y - len * 0.45]
      ],
      0.032,
      m
    );
    for (let i = 0; i < 5; i++)
      bx(0.034, 0.003, 0.026, mat('#0b0b0b'), 0, y - 0.02 - i * len * 0.17, z - rake * (0.05 + i * 0.2));
  };
  const guard = (z, y, l) => {
    px(
      [
        [z, y],
        [z + l, y],
        [z + l, y - 0.04],
        [z + l * 0.5, y - 0.052],
        [z + l * 0.15, y - 0.04],
        [z, y - 0.03]
      ],
      0.006,
      st
    );
    bx(0.006, 0.03, 0.004, st, 0, y - 0.04, z + l * 0.3).rotation.x = 0.3;
  };
  // gravures : marquage du fabricant sur les deux côtés du boîtier (texture transparente, léger relief métallique)
  const engr = (text, z, y, w, h, xs) => {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = Math.max(16, Math.round((512 * h) / w));
    const cx = c.getContext('2d');
    cx.font = `bold ${Math.round(c.height * 0.62)}px "Courier New",monospace`;
    cx.textAlign = 'center';
    cx.textBaseline = 'middle';
    cx.fillStyle = 'rgba(205,208,200,.6)';
    cx.fillText(text, 256, c.height / 2);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    const m = new THREE.MeshStandardMaterial({
      map: t,
      transparent: true,
      roughness: 0.35,
      metalness: 0.8,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2
    });
    for (const q of [-1, 1]) {
      const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
      p.position.set(q * xs, y, z);
      p.rotation.y = (q * Math.PI) / 2;
      wg.add(p);
    }
  };
  const ENG = {
    2: ['MODEL 9 · 9x19 · N°7731', 0.01, 0.038, 0.13, 0.0155, 0.0178],
    3: ['PUMP 12 GA · N°3320', 0.02, 0.0, 0.19, 0.02, 0.0235],
    4: ['AK-47 · 7,62x39 · N°48213', 0.0, 0.0, 0.3, 0.02, 0.0225],
    5: ['PRECISION .308 · N°0417', 0.0, 0.0, 0.26, 0.02, 0.0225],
    7: ['MAGNUM .357', -0.02, 0.01, 0.1, 0.016, 0.0175],
    8: ['SMG 9 · N°20817', -0.05, 0.0, 0.22, 0.02, 0.0225],
    9: ['M4 · 5.56 NATO · N°9902', -0.04, 0.0, 0.24, 0.02, 0.0205],
    10: ['MODEL 94 · .30-30', 0.0, 0.0, 0.2, 0.02, 0.0195]
  };
  const R = {},
    put = (n, v) => (R[n] = v);
  switch (k) {
    case 1:
      {
        // COUTEAU DE COMBAT (lame extrudée, poignée cordée, garde, pommeau)
        const hm = leather(fin === '#1b1b1d' ? '#1a1512' : fin, 0.6);
        zc(0.0155, 0.0135, 0.13, hm, 0, 0, -0.135);
        zc(0.0175, 0.0175, 0.014, steel, 0, 0, -0.005);
        ell(0.0185, 0.0185, 0.014, steel, 0, 0, -0.14, wg);
        bx(0.054, 0.014, 0.012, steel, 0, 0, 0.012);
        for (let i = 0; i < 6; i++) zc(0.0165, 0.0165, 0.004, mat('#0a0a0a'), 0, 0, -0.125 + i * 0.019);
        const t = s.wMuzzle,
          P = [
            [
              [0, 0.016],
              [0.13, 0.016],
              [0.2, -0.014],
              [0.14, -0.019],
              [0, -0.019]
            ],
            [
              [0, 0.017],
              [0.17, 0.017],
              [0.205, -0.006],
              [0.19, -0.019],
              [0, -0.019]
            ],
            null,
            [
              [0, 0.016],
              [0.12, 0.018],
              [0.2, 0.011],
              [0.225, -0.014],
              [0.205, -0.016],
              [0.17, -0.005],
              [0, -0.019]
            ],
            [
              [0, 0.018],
              [0.12, 0.02],
              [0.215, 0],
              [0.12, -0.02],
              [0, -0.018]
            ]
          ];
        let pts = P[t];
        if (!pts) {
          pts = [
            [0, 0.016],
            [0.13, 0.016],
            [0.2, -0.012]
          ];
          for (let i = 0; i < 8; i++) pts.push([0.19 - i * 0.0225, i % 2 ? -0.012 : -0.018]);
          pts.push([0, -0.019]);
        }
        const sh2 = new THREE.Shape();
        sh2.moveTo(pts[0][0], pts[0][1]);
        pts.slice(1).forEach((p) => sh2.lineTo(p[0], p[1]));
        const g = new THREE.ExtrudeGeometry(sh2, {
          depth: 0.0045,
          bevelEnabled: true,
          bevelThickness: 0.0012,
          bevelSize: 0.0012,
          bevelSegments: 1
        });
        g.translate(0, 0, -0.00225);
        g.rotateY(-Math.PI / 2);
        mk(g, metal('#c9ccc8', 0.16), 0, 0, 0.018, wg);
        bx(0.0016, 0.003, 0.17, metal('#e8ebe7', 0.1), 0, 0.0, 0.1); // lame + fil poli
        put('gR', V(0, 0, -0.07));
        put('wR', V(0, 0, -0.075));
      }
      break;
    case 2:
      {
        // PISTOLET (culasse, carcasse, rail, gâchette, chargeur)
        bx(0.026, 0.026, 0.17, bm, 0, -0.004, 0.0);
        px(
          [
            [-0.075, 0.058],
            [0.095, 0.058],
            [0.098, 0.03],
            [0.095, 0.016],
            [-0.075, 0.016]
          ],
          0.03,
          bm
        );
        for (let i = 0; i < 6; i++) bx(0.032, 0.036, 0.003, st, 0, 0.037, -0.07 + i * 0.007); // culasse + cannelures
        px(
          [
            [-0.075, 0.016],
            [0.07, 0.016],
            [0.07, -0.012],
            [0.01, -0.014],
            [-0.03, -0.03],
            [-0.075, -0.012]
          ],
          0.028,
          furn
        );
        rail(0.01, 0.07, -0.016);
        pgrip(-0.02, -0.012, 0.105, 0.03, furn);
        guard(0.0, -0.016, 0.07);
        bx(0.006, 0.02, 0.005, st, 0, -0.03, 0.03).rotation.x = 0.25;
        bx(0.004, 0.012, 0.012, st, 0, 0.062, -0.07);
        bx(0.004, 0.01, 0.01, st, 0, 0.062, 0.09);
        const mh = [0.02, 0.05, 0.02, 0.036][s.wMag] || 0.02;
        if (s.wMag === 2) {
          const d = mk(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 18), st, 0, -0.14, -0.04, wg);
          d.rotation.z = Math.PI / 2;
        } else {
          bx(0.026, mh + 0.02, 0.04, st, 0, -0.115 - mh / 2, -0.044);
          bx(0.03, 0.01, 0.044, poly, 0, -0.125 - mh, -0.044);
        }
        if (s.wMag === 3) bx(0.024, 0.04, 0.036, st, 0, -0.15, -0.01);
        zc(0.0075, 0.0075, 0.04, steel, 0, 0.036, 0.096);
        muzzle(0.135, 0.036, 0.0078);
        optic(-0.01, 0.06);
        under(0.06, -0.022);
        put('gR', V(0, -0.05, -0.03));
        put('wR', V(0, 0.045, -0.08));
        put('gL', V(-0.012, -0.06, 0.012));
        put('wL', V(-0.045, 0.04, -0.06));
      }
      break;
    case 3:
      {
        // FUSIL À POMPE (carcasse, tube-magasin, garde-main coulissante, crosse)
        px(
          [
            [-0.12, 0.045],
            [0.14, 0.04],
            [0.15, 0.0],
            [0.12, -0.04],
            [-0.04, -0.045],
            [-0.12, -0.02]
          ],
          0.042,
          bm
        );
        bx(0.044, 0.016, 0.1, st, 0, 0.0, 0.02);
        bx(0.008, 0.04, 0.06, st, 0.022, 0.012, 0.0);
        zc(0.0145, 0.0145, 0.6, steel, 0, 0.026, 0.14);
        zc(0.012, 0.012, 0.5 + (s.wMag === 1 ? 0.1 : 0), st, 0, -0.014, 0.14);
        bx(0.004, 0.01, 0.005, brass, 0, 0.044, 0.74);
        px(
          [
            [0.17, 0.012],
            [0.4, 0.012],
            [0.4, -0.03],
            [0.17, -0.03]
          ],
          0.052,
          furn
        );
        for (let i = 0; i < 9; i++) bx(0.056, 0.003, 0.012, mat('#0b0b0b'), 0, -0.009, 0.19 + i * 0.024);
        pgrip(-0.07, -0.04, 0.1, 0.045, furn);
        guard(-0.055, -0.047, 0.1);
        if (s.wMag === 2) {
          const d = mk(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 18), st, 0, -0.08, 0.04, wg);
          d.rotation.z = Math.PI / 2;
        }
        if (s.wMag === 3) for (const q of [-1, 1]) bx(0.012, 0.064, 0.12, st, q * 0.034, 0.0, -0.02);
        stockP(-0.12, 0.0, 0.32, 0.1);
        muzzle(0.74, 0.026, 0.0145);
        optic(0.0, 0.052);
        under(0.38, -0.03);
        put('gR', V(0, -0.085, -0.06));
        put('wR', V(0, 0.05, -0.075));
        put('gL', V(0, -0.01, 0.2));
        put('wL', V(0, 0.02, -0.07));
      }
      break;
    case 4:
      {
        // AK-47 (boîtier embouti, couvre-culasse, tube à gaz, garde-main bois, chargeur courbe)
        px(
          [
            [-0.2, 0.034],
            [0.2, 0.034],
            [0.2, -0.034],
            [-0.2, -0.034]
          ],
          0.04,
          bm
        );
        px(
          [
            [-0.2, 0.034],
            [0.1, 0.034],
            [0.1, 0.05],
            [-0.02, 0.054],
            [-0.2, 0.046]
          ],
          0.038,
          st
        );
        screws([-0.15, -0.05, 0.12, 0.18], 0.0);
        for (let i = 0; i < 3; i++) bx(0.042, 0.002, 0.12, mat('#0e0e0e'), 0, 0.0, -0.14 + i * 0.0); // fente d’éjection
        px(
          [
            [0.16, 0.03],
            [0.4, 0.034],
            [0.4, -0.026],
            [0.16, -0.036]
          ],
          0.05,
          wood
        );
        px(
          [
            [0.2, 0.05],
            [0.4, 0.046],
            [0.4, 0.034],
            [0.2, 0.034]
          ],
          0.04,
          wood
        );
        for (let i = 0; i < 8; i++) bx(0.052, 0.003, 0.01, mat('#2a1a0c'), 0, -0.0, 0.2 + i * 0.025);
        zc(0.0085, 0.0085, 0.26, steel, 0, 0.012, 0.38);
        zc(0.0105, 0.0105, 0.34, steel, 0, 0.056, 0.18);
        bx(0.016, 0.034, 0.02, st, 0, 0.036, 0.5);
        bx(0.006, 0.03, 0.006, st, 0, 0.066, 0.5);
        ell(0.007, 0.007, 0.007, st, 0, 0.07, 0.5, wg);
        zc(0.012, 0.012, 0.04, st, 0, 0.012, 0.64);
        zc(0.0095, 0.0095, 0.03, steel, 0, 0.012, 0.62);
        bx(0.012, 0.02, 0.02, st, 0, 0.034, -0.18);
        bx(0.006, 0.018, 0.006, st, 0, 0.056, -0.14);
        pgrip(-0.03, -0.034, 0.115, 0.05, furn);
        guard(-0.005, -0.042, 0.1);
        const cap = [0.15, 0.22, 0, 0.15][s.wMag];
        if (s.wMag === 2) {
          const d = mk(new THREE.CylinderGeometry(0.075, 0.075, 0.062, 20), st, 0, -0.14, 0.06, wg);
          d.rotation.z = Math.PI / 2;
          zc(0.02, 0.02, 0.07, st, 0, -0.075, 0.0);
        } else {
          const pts = [],
            pb = [];
          const n = 8;
          for (let i = 0; i <= n; i++) {
            const t = i / n,
              z0 = 0.04 + Math.pow(t, 1.7) * 0.1 * (cap / 0.15),
              y0 = -0.034 - t * cap;
            pts.push([z0, y0]);
            pb.push([z0 - 0.04 - t * 0.012, y0 + (i ? 0 : 0)]);
          }
          px(pts.concat(pb.reverse()), 0.032, st);
          for (let i = 1; i < n; i += 2)
            bx(
              0.034,
              0.003,
              0.004,
              mat('#0e0e0e'),
              0,
              -0.034 - (i / n) * cap,
              0.04 + Math.pow(i / n, 1.7) * 0.1 * (cap / 0.15) - 0.02
            );
          if (s.wMag === 3) {
            const q = bx(0.03, 0.14, 0.036, st, 0.034, -0.1, 0.02);
            q.rotation.x = -0.2;
          }
        }
        stockP(-0.2, -0.002, 0.3, 0.1);
        muzzle(0.65, 0.012, 0.0095);
        optic(-0.02, 0.054);
        under(0.28, -0.036);
        put('gR', V(0, -0.09, -0.055));
        put('wR', V(0, 0.05, -0.075));
        put('gL', V(0, -0.015, 0.15));
        put('wL', V(0, 0.02, -0.07));
      }
      break;
    case 5:
      {
        // FUSIL DE PRÉCISION (culasse, verrou, canon lourd cannelé, crosse trou de pouce, bipied)
        px(
          [
            [-0.2, 0.034],
            [0.22, 0.034],
            [0.22, -0.034],
            [-0.2, -0.034]
          ],
          0.04,
          bm
        );
        bx(0.012, 0.016, 0.07, st, 0.032, 0.024, -0.04);
        ell(0.011, 0.011, 0.011, st, 0.052, 0.024, -0.06, wg);
        zc(0.005, 0.005, 0.05, st, 0.04, 0.024, -0.06).rotation.z = Math.PI / 2;
        rail(-0.18, 0.2, 0.037);
        zc(0.0125, 0.0105, 0.74, steel, 0, 0.012, 0.2);
        for (let i = 0; i < 6; i++) zc(0.0145, 0.0145, 0.004, st, 0, 0.012, 0.3 + i * 0.1);
        px(
          [
            [0.12, 0.0],
            [0.5, 0.002],
            [0.5, -0.036],
            [0.12, -0.04]
          ],
          0.05,
          furn
        );
        px(
          [
            [-0.2, 0.0],
            [-0.06, -0.034],
            [-0.06, -0.06],
            [-0.2, -0.06]
          ],
          0.046,
          furn
        );
        pgrip(-0.06, -0.034, 0.115, 0.06, furn);
        guard(-0.04, -0.045, 0.1);
        if (s.wMag === 2) {
          const d = mk(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 18), st, 0, -0.1, 0.04, wg);
          d.rotation.z = Math.PI / 2;
        } else bx(0.032, 0.05 + [0, 0.04, 0, 0.02][s.wMag], 0.07, st, 0, -0.075, 0.04);
        px(
          [
            [-0.2, 0.02],
            [-0.38, 0.0],
            [-0.6, 0.0],
            [-0.6, -0.13],
            [-0.4, -0.15],
            [-0.3, -0.1],
            [-0.2, -0.07]
          ],
          0.04,
          furn
        );
        bx(0.042, 0.12, 0.02, mat('#0f0f0f', { roughness: 0.9 }), 0, -0.068, -0.6);
        if (s.wStock) stockP(-0.2, 0.0, 0.3, 0.1);
        muzzle(0.94, 0.012, 0.011);
        if (!s.wOptic) {
          bx(0.006, 0.03, 0.006, st, 0, 0.05, 0.82);
          bx(0.014, 0.02, 0.012, st, 0, 0.044, -0.03);
          bx(0.004, 0.02, 0.004, st, 0, 0.06, -0.03);
        } else optic(0.02, 0.037);
        if (!s.wUnder)
          for (const q of [-1, 1]) {
            limb([q * 0.012, -0.03, 0.5], [q * 0.07, -0.17, 0.62], 0.005, 0.004, st, wg);
            zc(0.007, 0.007, 0.02, steel, q * 0.07, -0.17, 0.62);
          }
        else under(0.5, -0.04);
        put('gR', V(0, -0.09, -0.06));
        put('wR', V(0, 0.05, -0.075));
        put('gL', V(0, -0.025, 0.05));
        put('wL', V(0, 0.03, -0.07));
      }
      break;
    case 6:
      {
        // MINIGUN (6 canons rotatifs, carter, moteur, bande de munitions, poignées)
        zc(0.075, 0.075, 0.34, bm, 0, 0.0, -0.04);
        zc(0.058, 0.058, 0.07, st, 0, 0, 0.3);
        zc(0.08, 0.08, 0.04, st, 0, 0, -0.08);
        zc(0.06, 0.06, 0.12, st, 0, 0, -0.2);
        const rot = grp(0, 0, 0.37, wg);
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          cyl(0.011, 0.011, 0.66, steel, Math.cos(a) * 0.038, Math.sin(a) * 0.038, 0.33, rot, 12).rotation.x =
            Math.PI / 2;
        }
        for (const z of [0.0, 0.2, 0.42, 0.62]) {
          const r = mk(new THREE.TorusGeometry(0.05, 0.008, 8, 20), st, 0, 0, z, rot);
        }
        anim &&
          anim.push((t) => {
            rot.rotation.z = t * 9;
          });
        bx(0.05, 0.05, 0.18, st, 0, 0.095, 0.04);
        bx(0.04, 0.02, 0.22, st, 0, 0.125, 0.04);
        rail(-0.04, 0.14, 0.137);
        pgrip(-0.06, -0.07, 0.1, 0.0, furn);
        bx(0.07, 0.014, 0.02, st, 0, -0.075, -0.06);
        px(
          [
            [0.08, -0.07],
            [0.26, -0.07],
            [0.26, -0.095],
            [0.08, -0.095]
          ],
          0.012,
          st
        );
        cyl(0.014, 0.014, 0.1, poly, 0, -0.12, 0.17, wg, 12);
        const boxM = [
          [0.16, 0.12, 0.2],
          [0.2, 0.16, 0.26],
          [0.14, 0.14, 0.14],
          [0.14, 0.12, 0.18]
        ][s.wMag];
        bx(
          boxM[0],
          boxM[1],
          boxM[2],
          mat(sh(fin, -0.1), { roughness: 0.5, metalness: 0.5 }),
          -0.18,
          -0.1,
          -0.04
        );
        bx(boxM[0] + 0.01, 0.01, boxM[2] + 0.01, st, -0.18, -0.1 + boxM[1] / 2, -0.04);
        if (s.wMag === 3) {
          bx(
            boxM[0],
            boxM[1],
            boxM[2],
            mat(sh(fin, -0.1), { roughness: 0.5, metalness: 0.5 }),
            0.18,
            -0.1,
            -0.04
          );
        }
        chain(
          [
            [-0.12, -0.04, 0.04],
            [-0.1, -0.0, 0.07],
            [-0.06, 0.04, 0.07],
            [-0.03, 0.06, 0.06]
          ],
          0.011,
          0.011,
          brass,
          wg
        );
        if (s.wMuzzle) zc(0.052, 0.052, 0.04 + s.wMuzzle * 0.02, bm, 0, 0, 1.0);
        under(0.18, -0.05);
        put('gR', V(0, -0.1, -0.06));
        put('wR', V(0, 0.05, -0.07));
        put('gL', V(0, -0.125, 0.17));
        put('wL', V(0, 0.05, -0.07));
      }
      break;
    case 7:
      {
        // REVOLVER MAGNUM (tambour cannelé, canon à nervure, crosse bois)
        px(
          [
            [-0.1, 0.045],
            [0.07, 0.045],
            [0.07, 0.0],
            [-0.0, -0.03],
            [-0.1, -0.02]
          ],
          0.03,
          bm
        );
        zc(0.031, 0.031, 0.06, steel, 0, 0.014, -0.025);
        for (let i = 0; i < 6; i++) {
          const q = (i / 6) * 6.283;
          bx(0.006, 0.012, 0.058, st, Math.cos(q) * 0.031, 0.014 + Math.sin(q) * 0.031, -0.025 + 0.03);
        }
        zc(0.0125, 0.0115, 0.17, steel, 0, 0.024, 0.045);
        zc(0.0095, 0.0095, 0.12, bm, 0, -0.0, 0.05);
        bx(0.008, 0.008, 0.17, st, 0, 0.04, 0.1);
        bx(0.004, 0.014, 0.006, st, 0, 0.039, 0.2);
        bx(0.008, 0.028, 0.014, st, 0, 0.052, -0.1).rotation.x = 0.4;
        pgrip(-0.1, -0.02, 0.115, 0.05, wood);
        guard(-0.04, -0.03, 0.075);
        bx(0.006, 0.018, 0.004, st, 0, -0.034, -0.015).rotation.x = 0.25;
        muzzle(0.215, 0.024, 0.0115);
        optic(-0.01, 0.048);
        under(0.1, -0.014);
        put('gR', V(0, -0.07, -0.11));
        put('wR', V(0, 0.05, -0.075));
        put('gL', V(-0.012, -0.08, -0.09));
        put('wL', V(-0.045, 0.04, -0.06));
      }
      break;
    case 8:
      {
        // PISTOLET-MITRAILLEUR (carter tubulaire, chargeur droit, crosse télescopique)
        px(
          [
            [-0.2, 0.036],
            [0.1, 0.036],
            [0.1, -0.03],
            [-0.2, -0.03]
          ],
          0.04,
          bm
        );
        px(
          [
            [-0.2, 0.036],
            [0.1, 0.04],
            [0.1, 0.03],
            [-0.2, 0.03]
          ],
          0.044,
          st
        );
        screws([-0.15, -0.02, 0.06], 0.0);
        bx(0.008, 0.02, 0.03, st, 0.024, 0.012, -0.04);
        zc(0.019, 0.019, 0.22, bm, 0, 0.0, 0.1);
        for (let i = 0; i < 8; i++) bx(0.04, 0.004, 0.006, mat('#0b0b0b'), 0, 0.0, 0.14 + i * 0.02);
        zc(0.009, 0.009, 0.12, steel, 0, 0.0, 0.32);
        bx(0.014, 0.03, 0.02, st, 0, 0.03, 0.4);
        bx(0.012, 0.022, 0.012, st, 0, 0.04, -0.18);
        px(
          [
            [0.1, 0.026],
            [0.32, 0.022],
            [0.32, -0.026],
            [0.1, -0.03]
          ],
          0.046,
          furn
        );
        pgrip(-0.03, -0.03, 0.115, 0.05, furn);
        guard(-0.005, -0.04, 0.1);
        const mc = [0.17, 0.24, 0.0, 0.17][s.wMag];
        if (s.wMag === 2) {
          const d = mk(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 20), st, 0, -0.12, 0.05, wg);
          d.rotation.z = Math.PI / 2;
        } else {
          px(
            [
              [0.03, -0.03],
              [0.075, -0.03],
              [0.085, -0.03 - mc],
              [0.04, -0.03 - mc]
            ],
            0.028,
            st
          );
          for (let i = 1; i < 5; i++) bx(0.03, 0.003, 0.004, mat('#0e0e0e'), 0, -0.03 - (i * mc) / 5, 0.055);
          if (s.wMag === 3) bx(0.028, mc, 0.04, st, 0.032, -0.03 - mc / 2, 0.06);
        }
        stockP(-0.2, 0.0, 0.26, 0.09);
        muzzle(0.44, 0.0, 0.009);
        optic(-0.02, 0.04);
        under(0.28, -0.032);
        put('gR', V(0, -0.09, -0.05));
        put('wR', V(0, 0.05, -0.075));
        put('gL', V(0, -0.015, 0.15));
        put('wL', V(0, 0.02, -0.07));
      }
      break;
    case 9:
      {
        // CARABINE M4 (rail supérieur, garde-main rond, poignée A2, crosse rétractable)
        px(
          [
            [-0.2, 0.026],
            [0.12, 0.026],
            [0.12, -0.03],
            [-0.2, -0.03]
          ],
          0.036,
          bm
        );
        px(
          [
            [-0.16, -0.03],
            [0.12, -0.03],
            [0.1, -0.06],
            [-0.05, -0.06],
            [-0.12, -0.045]
          ],
          0.034,
          bm
        );
        rail(-0.2, 0.2, 0.032);
        bx(0.005, 0.02, 0.006, st, 0, 0.056, 0.18);
        bx(0.005, 0.02, 0.006, st, 0, 0.056, -0.16);
        screws([-0.12, -0.02, 0.08], 0.0);
        zc(0.0275, 0.0275, 0.28, bm, 0, 0.0, 0.1);
        for (let i = 0; i < 7; i++) zc(0.029, 0.029, 0.004, st, 0, 0.0, 0.12 + i * 0.035);
        rail(0.12, 0.36, 0.0275 + 0.0);
        zc(0.0085, 0.0085, 0.2, steel, 0, 0.0, 0.36);
        bx(0.016, 0.028, 0.02, st, 0, 0.016, 0.4);
        pgrip(-0.045, -0.06, 0.1, 0.05, furn);
        guard(-0.015, -0.06, 0.1);
        const mc = [0.13, 0.19, 0, 0.13][s.wMag];
        if (s.wMag === 2) {
          const d = mk(new THREE.CylinderGeometry(0.065, 0.065, 0.06, 20), st, 0, -0.14, 0.04, wg);
          d.rotation.z = Math.PI / 2;
        } else {
          px(
            [
              [0.01, -0.06],
              [0.045, -0.06],
              [0.06, -0.06 - mc],
              [0.025, -0.06 - mc]
            ],
            0.03,
            st
          );
          for (let i = 1; i < 5; i++) bx(0.032, 0.003, 0.004, mat('#0e0e0e'), 0, -0.06 - (i * mc) / 5, 0.03);
          if (s.wMag === 3) bx(0.03, mc, 0.036, st, 0.034, -0.06 - mc / 2, 0.02);
        }
        stockP(-0.2, -0.01, 0.28, 0.09);
        muzzle(0.56, 0.0, 0.0095);
        optic(-0.03, 0.032);
        under(0.22, -0.03);
        put('gR', V(0, -0.1, -0.05));
        put('wR', V(0, 0.05, -0.075));
        put('gL', V(0, -0.02, 0.17));
        put('wL', V(0, 0.02, -0.07));
      }
      break;
    case 10:
      {
        // FUSIL À LEVIER (carcasse acier, crosse et fût bois, levier de sous-garde, tube-magasin)
        px(
          [
            [-0.1, 0.04],
            [0.12, 0.04],
            [0.12, -0.03],
            [-0.1, -0.04]
          ],
          0.034,
          bm
        );
        bx(0.012, 0.02, 0.03, steel, 0.02, 0.02, -0.04);
        bx(0.01, 0.02, 0.03, steel, 0, 0.044, -0.1);
        px(
          [
            [-0.03, -0.04],
            [0.06, -0.04],
            [0.065, -0.1],
            [-0.04, -0.115],
            [-0.05, -0.07]
          ],
          0.008,
          steel
        );
        zc(0.0105, 0.0095, 0.62, steel, 0, 0.02, 0.12);
        zc(0.0085, 0.0085, 0.5, st, 0, -0.015, 0.12);
        bx(0.004, 0.014, 0.005, st, 0, 0.036, 0.72);
        bx(0.01, 0.016, 0.02, st, 0, 0.036, -0.02);
        px(
          [
            [0.12, 0.0],
            [0.42, 0.0],
            [0.42, -0.044],
            [0.12, -0.044]
          ],
          0.044,
          wood
        );
        px(
          [
            [-0.1, 0.035],
            [-0.32, 0.02],
            [-0.6, 0.0],
            [-0.6, -0.12],
            [-0.38, -0.1],
            [-0.2, -0.07],
            [-0.1, -0.04]
          ],
          0.04,
          wood
        );
        bx(0.042, 0.12, 0.014, mat('#0f0f0f', { roughness: 0.9 }), 0, -0.06, -0.6);
        muzzle(0.74, 0.02, 0.0105);
        optic(-0.02, 0.046);
        put('gR', V(0, -0.085, -0.09));
        put('wR', V(0, 0.05, -0.075));
        put('gL', V(0, -0.025, 0.08));
        put('wL', V(0, 0.03, -0.07));
      }
      break;
    case 11:
      {
        // MACHETTE (lame longue extrudée, poignée cordée, garde)
        zc(0.0165, 0.015, 0.14, leather('#1a1512', 0.6), 0, 0, -0.14);
        for (let i = 0; i < 6; i++) zc(0.0175, 0.0175, 0.004, mat('#0a0a0a'), 0, 0, -0.13 + i * 0.02);
        ell(0.019, 0.019, 0.014, steel, 0, 0, -0.145, wg);
        bx(0.05, 0.016, 0.012, steel, 0, 0, 0.0);
        const t = s.wMuzzle,
          P = [
            [
              [0, 0.03],
              [0.46, 0.03],
              [0.5, 0.0],
              [0.46, -0.012],
              [0, -0.012]
            ],
            [
              [0, 0.03],
              [0.3, 0.04],
              [0.46, 0.034],
              [0.52, -0.01],
              [0.46, -0.012],
              [0, -0.012]
            ],
            [
              [0, 0.025],
              [0.2, 0.05],
              [0.38, 0.048],
              [0.5, 0],
              [0.38, -0.014],
              [0, -0.012]
            ],
            null,
            [
              [0, 0.03],
              [0.4, 0.03],
              [0.52, 0.0],
              [0.44, -0.01],
              [0, -0.012]
            ]
          ];
        let pts = P[t];
        if (!pts) {
          pts = [
            [0, 0.03],
            [0.46, 0.03],
            [0.5, 0.0],
            [0.46, -0.012]
          ];
          for (let i = 0; i < 8; i++) pts.push([0.44 - i * 0.055, i % 2 ? -0.006 : -0.016]);
          pts.push([0, -0.012]);
        }
        const sh2 = new THREE.Shape();
        sh2.moveTo(pts[0][0], pts[0][1]);
        pts.slice(1).forEach((p) => sh2.lineTo(p[0], p[1]));
        const g = new THREE.ExtrudeGeometry(sh2, {
          depth: 0.005,
          bevelEnabled: true,
          bevelThickness: 0.0013,
          bevelSize: 0.0013,
          bevelSegments: 1
        });
        g.translate(0, 0, -0.0025);
        g.rotateY(-Math.PI / 2);
        mk(g, gunPaint(fin === '#1b1b1d' ? '#2a2c2e' : fin), 0, 0, 0.008, wg);
        bx(0.0018, 0.003, 0.4, metal('#d8dbd7', 0.15), 0, -0.011, 0.2);
        put('gR', V(0, 0, -0.08));
        put('wR', V(0, 0, -0.075));
      }
      break;
    case 12:
      {
        // LANCE-ROQUETTES (tube, venturi évasé, protection thermique bois, ogive, poignées)
        zc(0.03, 0.03, 0.95, bm, 0, 0, -0.5);
        zc(0.062, 0.032, 0.14, st, 0, 0, -0.66);
        zc(0.066, 0.066, 0.012, steel, 0, 0, -0.67);
        for (let i = 0; i < 6; i++) {
          const q = (i / 6) * 6.283;
          bx(0.004, 0.01, 0.1, st, Math.cos(q) * 0.045, Math.sin(q) * 0.045, -0.62);
        }
        zc(0.0395, 0.0395, 0.3, woodMat(), 0, 0, -0.08);
        zc(0.042, 0.042, 0.01, steel, 0, 0, -0.08);
        zc(0.042, 0.042, 0.01, steel, 0, 0, 0.22);
        zc(0.034, 0.034, 0.1, st, 0, 0, 0.45);
        const og = mk(new THREE.CylinderGeometry(0.012, 0.055, 0.3, 24), st, 0, 0, 0.65, wg);
        og.rotation.x = Math.PI / 2;
        zc(0.055, 0.055, 0.18, mat('#4a5a3a', { roughness: 0.6, metalness: 0.4 }), 0, 0, 0.45);
        zc(0.014, 0.014, 0.02, steel, 0, 0, 0.8);
        pgrip(-0.1, -0.03, 0.11, 0.05, furn);
        guard(-0.08, -0.04, 0.09);
        pgrip(0.05, -0.036, 0.1, 0.0, furn);
        bx(0.004, 0.03, 0.004, st, 0, 0.04, 0.3);
        optic(0.0, 0.034);
        put('gR', V(0, -0.085, -0.12));
        put('wR', V(0, 0.05, -0.075));
        put('gL', V(0, -0.085, 0.05));
        put('wL', V(0, 0.05, -0.07));
      }
      break;
  }
  if (ENG[k]) engr(...ENG[k]);
  return R;
}

export { gunModel };
