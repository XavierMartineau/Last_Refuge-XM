/* LAST REFUGE · XM — Tête : sphère déformée selon la forme du visage et « coques » qui épousent le crâne.
   Module extrait de createur-personnage-3d+armes.html (partagé par le créateur et l’escape room). */
import * as THREE from 'three';
import { D } from '../donnees/donnees.js';
import { clamp } from '../outils/outils-3d.js';

const R = 0.15;
function makeHead(face, fem) {
  let [cw, f1, f2] = D.FACES[face];
  if (fem) f1 *= 0.82;
  const sx = (cw / 56) * 0.98,
    sy = (f2 / 206) * 1.07,
    sz = 0.97,
    chinW = 0.6 + 0.4 * clamp(f1 / 56, 0, 1);
  const taper = (uy) => 1 - (1 - chinW) * Math.pow(clamp(-uy, 0, 1), 1.4);
  const dz = (uy) => 1 - 0.08 * clamp(-uy, 0, 1);
  const def = (ux, uy, uz) => {
    const t = taper(uy);
    return [ux * R * sx * t, uy * R * sy, uz * R * sz * dz(uy)];
  };
  const surf = (x, y) => {
    const uy = y / (R * sy);
    if (Math.abs(uy) >= 0.999) return 0;
    const t = taper(uy),
      ux = x / (R * sx * t),
      r2 = ux * ux + uy * uy;
    if (r2 >= 0.999) return 0;
    return Math.sqrt(1 - r2) * R * sz * dz(uy);
  };
  const geo = new THREE.SphereGeometry(1, 48, 32),
    U = geo.attributes.position.array.slice(),
    P = new Float32Array(U.length),
    N = new Float32Array(U.length);
  for (let i = 0; i < U.length; i += 3) {
    const d = def(U[i], U[i + 1], U[i + 2]);
    P[i] = d[0];
    P[i + 1] = d[1];
    P[i + 2] = d[2];
    const t = taper(U[i + 1]) || 1,
      nx = U[i] / (R * sx * t),
      ny = U[i + 1] / (R * sy),
      nz = U[i + 2] / (R * sz),
      l = Math.hypot(nx, ny, nz) || 1;
    N[i] = nx / l;
    N[i + 1] = ny / l;
    N[i + 2] = nz / l;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(P, 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(N, 3));
  return { geo, U, P, N, idx: geo.index.array, uv: geo.attributes.uv, def, surf, sx, sy, sz, taper };
}
function shell(H, test, off, m) {
  const { U, P, N, idx } = H,
    keep = [];
  for (let i = 0; i < idx.length; i += 3) {
    const a = idx[i] * 3,
      b = idx[i + 1] * 3,
      c = idx[i + 2] * 3;
    if (
      test(
        (U[a] + U[b] + U[c]) / 3,
        (U[a + 1] + U[b + 1] + U[c + 1]) / 3,
        (U[a + 2] + U[b + 2] + U[c + 2]) / 3
      )
    )
      keep.push(idx[i], idx[i + 1], idx[i + 2]);
  }
  const g = new THREE.BufferGeometry(),
    n = P.length,
    pos = new Float32Array(n);
  for (let i = 0; i < n; i += 3) {
    const l = Math.hypot(P[i], P[i + 1], P[i + 2]) || 1;
    pos[i] = P[i] + (P[i] / l) * off;
    pos[i + 1] = P[i + 1] + (P[i + 1] / l) * off;
    pos[i + 2] = P[i + 2] + (P[i + 2] / l) * off;
  }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(N, 3));
  g.setAttribute('uv', H.uv);
  g.setIndex(keep);
  const o = new THREE.Mesh(g, m);
  o.castShadow = true;
  o.receiveShadow = true;
  return o;
}

export { R, makeHead, shell };
