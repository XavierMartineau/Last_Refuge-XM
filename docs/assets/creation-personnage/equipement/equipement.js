/* LAST REFUGE · XM — Équipement : ceintures, holsters, bandoulières, harnais…
   Module extrait de createur-personnage-3d+armes.html (partagé par le créateur et l’escape room). */
import * as THREE from 'three';
import {fab,metal} from '../materiaux/materiaux.js';
import {box,cyl,lerp,limb,mat,mk,sh} from '../outils/outils-3d.js';

function gearBuild(C){
  const k=C.s.gear;if(!k)return;const{body}=C,zf=y=>(C.prof(y)+.035)*.64,nyl=fab(sh(C.mainHex,-.35),0),blk=mat('#1d1f1c',{roughness:.7}),mt=metal('#8a8d88',.4),dk=mat('#222420',{roughness:.5,metalness:.4});
  const belt=y=>{const b=mk(new THREE.TorusGeometry(1,.02,6,28),nyl,0,y,0,body);b.rotation.x=Math.PI/2;const r=C.prof(y)+.032;b.scale.set(r,r*.64,1);box(.055,.045,.014,mt,0,y,zf(y)+.002,body)};
  const pouch=(x,y,zz,w=.07,h=.09)=>{box(w,h,.05,nyl,x,y,zz,body);box(w+.004,.025,.054,blk,x,y+h/2-.01,zz,body)};
  switch(k){
    case 1:belt(1.03);pouch(-.1,1.0,zf(1.0)+.02);pouch(-.17,.99,zf(1.0)-.04,.06,.1);pouch(.1,1.0,zf(1.0)+.02);pouch(.18,.99,zf(1.0)-.05,.06,.1);pouch(0,1.0,-zf(1.0)-.02,.16,.1);break;
    case 2:{belt(1.03);const L=C.legs[1].lg;cyl(.084,.084,.03,blk,0,-.2,0,L,14);box(.045,.2,.095,blk,.1,-.2,.015,L);box(.032,.08,.055,dk,.1,-.07,.0,L);box(.026,.05,.12,dk,.1,-.2,.07,L);pouch(-.1,1.0,zf(1.0)+.02)}break;
    case 3:{const A=[-.13,1.37,zf(1.37)+.012],B=[.13,1.04,zf(1.04)+.012];limb(A,B,.021,.021,nyl,body);
      for(let i=0;i<8;i++){const t=(i+.5)/8;cyl(.0075,.0075,.045,metal('#c9a64a',.3),lerp(A[0],B[0],t),lerp(A[1],B[1],t),lerp(A[2],B[2],t)+.02,body,8)}belt(1.03)}break;
    case 4:belt(1.03);pouch(-.12,.98,-zf(.98)-.03,.12,.11);pouch(.12,.98,-zf(.98)-.03,.12,.11);break;
    case 5:{pouch(-.11,1.27,zf(1.27)+.02,.09,.2);cyl(.004,.004,.34,mt,-.14,1.5,zf(1.27)+.02,body,6);box(.05,.012,.012,blk,-.11,1.3,zf(1.3)+.05,body);belt(1.03)}break;
    case 6:{belt(1.03);const c=cyl(.042,.042,.17,mat('#4a5a3a',{roughness:.8}),.19,.97,.0,body,14);c.rotation.z=.1;cyl(.026,.026,.02,blk,.19,1.07,.0,body,10);box(.026,.14,.016,blk,-.18,.97,.04,body);box(.024,.06,.02,mat('#2a1a10'),-.18,1.06,.04,body)}break;
    case 7:{belt(1.03);for(const s of[-1,1])box(.04,.34,.014,nyl,s*.085,1.2,zf(1.2)+.012,body);box(.22,.035,.014,nyl,0,1.28,zf(1.28)+.012,body);
      for(const s of[-1,1]){const t=mk(new THREE.TorusGeometry(.015,.004,6,12),mt,s*.085,1.35,zf(1.35)+.02,body)}pouch(-.1,1.05,zf(1.05)+.02);pouch(.1,1.05,zf(1.05)+.02);pouch(0,1.18,zf(1.18)+.025,.12,.07)}break;
    case 8:{for(const l of C.legs){cyl(.088,.085,.035,nyl,0,-.14,0,l.lg,14);cyl(.088,.085,.03,nyl,0,-.32,0,l.lg,14);box(.03,.03,.01,mt,0,-.14,.087,l.lg)}
      for(const s of[-1,1])box(.045,.3,.014,nyl,s*.09,1.2,zf(1.2)+.012,body);box(.2,.035,.014,nyl,0,1.26,zf(1.26)+.012,body);belt(1.03)}break}}

export {gearBuild};
