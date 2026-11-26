/* LAST REFUGE · XM — Décalques peints sur le visage (taches, cicatrices, tatouages…).
   Module extrait de createur-personnage-3d+armes.html (partagé par le créateur et l’escape room). */
import * as THREE from 'three';
import {clamp} from '../outils/outils-3d.js';
import {R,shell} from './tete.js';

function dctx(C,kind='base'){if(!C.dc[kind]){const cv=document.createElement('canvas');cv.width=1024;cv.height=512;C.dc[kind]={cv,ctx:cv.getContext('2d')}}return C.dc[kind].ctx}
function cvp(C,x,y){                       // point du visage (mètres) → pixel du canvas (projection de la sphère)
  const H=C.H,uy=clamp(y/(R*H.sy),-.999,.999),t=H.taper(uy),ux=clamp(x/(R*H.sx*t),-.999,.999),uz=Math.sqrt(Math.max(0,1-ux*ux-uy*uy));
  let ph=Math.atan2(uz,-ux);if(ph<0)ph+=Math.PI*2;
  return[ph/(Math.PI*2)*1024,Math.acos(uy)/Math.PI*512]}
const px=m=>m/R*163;
function dStroke(C,ctx,pts,col,w){ctx.strokeStyle=col;ctx.lineWidth=px(w);ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();pts.forEach((p,i)=>{const q=cvp(C,p[0],p[1]);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])});ctx.stroke()}
function dDot(C,ctx,x,y,r,col,sy=1){const q=cvp(C,x,y);ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(q[0],q[1],px(r),px(r*sy),0,0,6.3);ctx.fill()}
function dPoly(C,ctx,pts,fill,line){ctx.beginPath();pts.forEach((p,i)=>{const q=cvp(C,p[0],p[1]);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])});ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill()}if(line){ctx.strokeStyle=line;ctx.lineWidth=px(.002);ctx.stroke()}}
function flushDecals(C){
  for(const kind in C.dc){
    const tex=new THREE.CanvasTexture(C.dc[kind].cv);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;C.tex.push(tex);
    const m=new THREE.MeshStandardMaterial({map:tex,transparent:true,depthWrite:false,roughness:.8,polygonOffset:true,polygonOffsetFactor:-2,...(kind==='glow'?{emissive:'#ffffff',emissiveMap:tex,emissiveIntensity:1.3}:{})});
    C.head.add(shell(C.H,(x,y,z)=>z>-.35,.003,m))}}

export {dctx,cvp,px,dStroke,dDot,dPoly,flushDecals};
