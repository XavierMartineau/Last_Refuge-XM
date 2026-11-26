/* LAST REFUGE · XM — Bouches (13 modèles).
   Module extrait de createur-personnage-3d+armes.html (partagé par le créateur et l’escape room). */
import * as THREE from 'three';
import {box,ell,mat,spike,th,tube} from '../outils/outils-3d.js';

const MOUTH=[{w:.032,s:0},{w:.036,s:.014},{w:.045,s:.02,o:.014,te:1},{w:.028,s:-.012},{w:.026,s:0,o:.026},{w:.034,s:.012,sm:.008},{w:.036,s:-.004,o:.045,te:1,to:1},{w:.04,s:.004,o:.012,te:1},{w:.034,s:.008,o:.012,fa:1},{w:.03,s:.012,o:.014,to:1},{w:.018,s:.004},{w:.034,s:0,t:.0065},{w:.036,s:.006,sm:-.01,t:.0045}];
function mouth(C){
  const m=MOUTH[C.s.mouth],{head,H}=C,y0=-.072,th=m.t||.0035,lip=mat(C.fem?'#c4506a':'#a85a52',{roughness:.45});
  const line=(dy,k)=>{const pts=[];for(let i=0;i<=8;i++){const t=i/8*2-1,x=t*m.w,y=y0+dy+m.s*(t*t-.5)*k+(m.sm||0)*t;pts.push([x,y,H.surf(x,y)+th*.5])}return pts};
  if(m.o){
    const cav=new THREE.Mesh(new THREE.CircleGeometry(1,20),mat('#2a0d10',{roughness:.9}));cav.scale.set(m.w*.9,m.o*.55,1);cav.position.set(0,y0-m.o*.5,H.surf(0,y0-m.o*.5)+.0012);head.add(cav);
    tube(line(0,1),th,lip,head,16,6);tube(line(-m.o,.6),th,lip,head,16,6);
    if(m.te)box(m.w*1.2,.007,.004,mat('#f2efe2'),0,y0-.005,H.surf(0,y0-.005)+.0025,head);
    if(m.to)ell(m.w*.45,m.o*.22,.006,mat('#c25a6a'),0,y0-m.o*.8,H.surf(0,y0-m.o*.8)+.002,head);
    if(m.fa)for(const side of[-1,1])spike([side*m.w*.5,y0-.002,H.surf(side*m.w*.5,y0)+.003],[0,-1,.1],.004,.013,mat('#f4f1e6'),head)
  }else tube(line(0,1),th,lip,head,16,6)}

export {MOUTH,mouth};
