/* LAST REFUGE · XM — Sourcils (10 modèles).
   Module extrait de createur-personnage-3d+armes.html (partagé par le créateur et l’escape room). */
import {mat,sh,tube} from '../outils/outils-3d.js';

const BROW=[null,{l:.05,t:.008,a:.006,tl:.004},{l:.05,t:.014,a:.005,tl:.002},{l:.05,t:.004,a:.013,tl:.004},{l:.05,t:.008,a:0,tl:0},{l:.05,t:.01,a:.002,tl:-.014},{l:.05,t:.008,a:.003,tl:.014},{l:.068,t:.008,a:.006,tl:.004},{l:.032,t:.011,a:.004,tl:0},{l:.052,t:.019,a:.004,tl:.002}];
function brows(C){
  const b=BROW[C.s.brows];if(!b||C.sp.cyclops)return;const m=mat(sh(C.hairHex,-.15),{roughness:.6});
  for(const side of[-1,1]){const pts=[];for(let i=0;i<=5;i++){const t=i/5,x=side*(.02+b.l*t),y=.055+b.a*Math.sin(Math.PI*t)+b.tl*t;pts.push([x,y,C.H.surf(x,y)+b.t*.4])}
    tube(pts,b.t/2,m,C.head,12,6)}}

export {BROW,brows};
