/* LAST REFUGE · XM — Prise en main de l’arme : poses et cinématique inverse des bras.
   Module extrait de createur-personnage-3d+armes.html (partagé par le créateur et l’escape room). */
import { gunModel } from './modeles-armes.js';
import { V, clamp, grp } from '../outils/outils-3d.js';

const WHOLD = {
  1: { a: V(0, 0, -0.07), B: V(0.2, 1.04, 0.3), rx: -0.6, ry: -0.1, two: 0 },
  2: { a: V(0, -0.05, -0.03), B: V(0.09, 1.3, 0.46), rx: 0.0, ry: -0.02, two: 1 },
  3: { a: V(0, 0, -0.44), B: V(0.12, 1.27, -0.08), rx: 0.05, ry: -0.25, two: 1 },
  4: { a: V(0, -0.02, -0.5), B: V(0.16, 1.27, -0.08), rx: 0.05, ry: -0.25, two: 1 },
  5: { a: V(0, 0, -0.6), B: V(0.16, 1.27, -0.08), rx: 0.05, ry: -0.25, two: 1 },
  6: { a: V(0, -0.1, -0.06), B: V(0.17, 1.02, 0.14), rx: 0.04, ry: -0.1, two: 1 },
  7: { a: V(0, -0.07, -0.11), B: V(0.09, 1.3, 0.42), rx: 0, ry: -0.02, two: 1 },
  8: { a: V(0, 0, -0.46), B: V(0.16, 1.27, -0.08), rx: 0.05, ry: -0.25, two: 1 },
  9: { a: V(0, -0.01, -0.48), B: V(0.16, 1.27, -0.08), rx: 0.05, ry: -0.25, two: 1 },
  10: { a: V(0, -0.04, -0.6), B: V(0.16, 1.27, -0.08), rx: 0.05, ry: -0.25, two: 1 },
  11: { a: V(0, 0, -0.08), B: V(0.2, 1.04, 0.3), rx: -0.6, ry: -0.1, two: 0 },
  12: { a: V(0, 0, -0.4), B: V(0.17, 1.38, 0.0), rx: 0.02, ry: -0.12, two: 1 }
};
function aimArm(a, T, pole) {
  const S = a.ag.position.clone(),
    L1 = 0.3,
    L2 = 0.27,
    d = T.clone().sub(S),
    dir = d.clone().normalize();
  let Dd = clamp(d.length(), 0.12, L1 + L2 - 0.005);
  const A = Math.acos(clamp((L1 * L1 + Dd * Dd - L2 * L2) / (2 * L1 * Dd), -1, 1)),
    p = pole
      .clone()
      .sub(dir.clone().multiplyScalar(pole.dot(dir)))
      .normalize();
  const E = S.clone()
      .addScaledVector(dir, Math.cos(A) * L1)
      .addScaledVector(p, Math.sin(A) * L1),
    down = V(0, -1, 0);
  a.ag.quaternion.setFromUnitVectors(down, E.clone().sub(S).normalize());
  const w = T.clone().sub(E).normalize().applyQuaternion(a.ag.quaternion.clone().invert());
  a.eg.quaternion.setFromUnitVectors(down, w);
  a.posed = true;
}
function buildWeapon(C) {
  const s = C.s,
    k = s.weapon;
  if (!k) return;
  const { body } = C,
    H = WHOLD[k],
    wg = grp(0, 0, 0, body);
  C.weapon = wg;
  const G = gunModel(s, k, wg, C.anim);
  const Rr = C.arms.find((a) => a.side > 0),
    Ll = C.arms.find((a) => a.side < 0);
  wg.rotation.set(H.rx, H.ry, 0, 'YXZ');
  wg.position.set(0, 0, 0);
  wg.updateMatrix();
  wg.position.copy(H.B).sub(H.a.clone().applyMatrix4(wg.matrix));
  const fwd = V(0, 0, 1).applyQuaternion(wg.quaternion),
    wr = () => G.gR.clone().add(G.wR).applyMatrix4(wg.matrix),
    wl = () => G.gL.clone().add(G.wL).applyMatrix4(wg.matrix);
  for (let i = 0; i < 45; i++) {
    wg.updateMatrix();
    const ok =
      wr().distanceTo(Rr.ag.position) <= 0.55 && (!H.two || wl().distanceTo(Ll.ag.position) <= 0.555);
    if (ok) break;
    wg.position.addScaledVector(fwd, -0.01);
  } // on rapproche l’arme du corps jusqu’à ce que les deux mains l’atteignent
  wg.updateMatrix();
  aimArm(Rr, wr(), V(0.6, -1, -0.25));
  if (H.two) aimArm(Ll, wl(), V(-0.6, -1, -0.25));
  else aimArm(Ll, V(-0.12, 1.1, 0.3), V(-0.6, -1, 0.1));
}

export { WHOLD, aimArm, buildWeapon };
