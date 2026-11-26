/* LAST REFUGE · XM — Yeux (14 modèles) : sclère, iris, pupille, paupières.
   Module extrait de createur-personnage-3d+armes.html (partagé par le créateur et l’escape room). */
import * as THREE from 'three';
import {D} from '../donnees/donnees.js';
import {corneaMat,irisMat,scleraMat} from '../materiaux/materiaux.js';
import {box,ell,grp,mat} from '../outils/outils-3d.js';

const EYE=[{w:1,h:1,i:.62},{w:1.1,h:.8,i:.58,lid:.15,tilt:.12},{w:1.25,h:1.3,i:.72},{w:.75,h:.7,i:.55,lid:.1},{w:1.05,h:.9,i:.6,lid:.45},{w:1.05,h:.8,i:.58,lid:.62},
  {w:1.05,h:.85,i:.6,lid:.28,tilt:-.2},{w:1.1,h:1,i:.66,lid:.05,tilt:.2},{w:1.05,h:1.05,i:.7,p:'slit'},{w:1.05,h:1,i:.64,glow:1},{w:1.05,h:1,i:.55,white:0},{w:1.05,h:1,i:.01,p:'none'},{w:1.05,h:1,i:.6,p:'ring',glow:1},{w:1.05,h:.95,i:.6,lid:.35,bags:1}];
function makeEye(C,x,y,e,k,col,side=0,glow=false){
  const{head,H}=C,re=.026*e.w*k,rh=.03*e.h*k,g=grp(x,y,H.surf(x,y)-.004,head);g.rotation.y=side*.2;if(e.tilt)g.rotation.z=side*e.tilt;
  ell(re,rh,re*.8,e.white===0?mat('#101010',{roughness:.3}):scleraMat(),0,0,0,g);if(e.white!==0){const cn=ell(re*1.012,rh*1.012,re*.8*1.012+.0006,corneaMat(),0,0,0,g);cn.castShadow=false}
  const zf=re*.8+.0008,ir=Math.min(re,rh)*e.i*.98,gl=glow||e.glow;
  const disc=(r,m,a,b,c,sx=1,sy=1)=>{const o=new THREE.Mesh(new THREE.CircleGeometry(r,20),m);o.position.set(a,b,c);o.scale.set(sx,sy,1);g.add(o);return o};
  if(e.white!==0)disc(ir,gl?mat(col,{emissive:col,emissiveIntensity:1.5,roughness:.3}):irisMat(col),0,0,zf);
  const pk=C.sp.slit?'slit':e.p||'round';
  if(pk==='round')disc(ir*.5,mat('#050505'),0,0,zf+.0006);
  else if(pk==='slit')disc(ir*.9,mat('#050505'),0,0,zf+.0006,.22,1);
  else if(pk==='ring'){const o=new THREE.Mesh(new THREE.RingGeometry(ir*.45,ir*.7,20),mat('#050505'));o.position.set(0,0,zf+.0006);g.add(o)}
  if(e.white!==0&&pk!=='none')disc(ir*.2,mat('#ffffff',{emissive:'#ffffff',emissiveIntensity:.8}),re*.22,rh*.25,zf+.0012);
  if(e.lid>.02){const lid=new THREE.Mesh(new THREE.SphereGeometry(1,18,10,0,Math.PI*2,0,e.lid*Math.PI*.6+.05),C.skin);lid.scale.set(re*1.1,rh*1.1,re*.9);lid.castShadow=true;g.add(lid)}
  if(e.bags)ell(re*1.1,rh*.18,.003,C.skinD,0,-rh*1.25,re*.5,g);
  if(C.fem){const l=box(re*2.3,.0028,.004,mat('#1a1411'),0,rh*1.02,re*.55,g);l.rotation.z=side*.06}
  C.eyes.push(g)}
function eyes(C){
  const{s,sp}=C,e=EYE[s.eyes],ec=D.EYECOL[s.eyeColor],es=sp.es||1;
  if(sp.cyclops){makeEye(C,0,.012,e,2.1*es,ec);return}
  for(const side of[-1,1])makeEye(C,side*.05,.015,e,es,(sp.cyber&&side>0)?'#ff3030':ec,side,!!(sp.cyber&&side>0));
  if(sp.eyes3)makeEye(C,0,.07,e,.7*es,ec,0)}

export {EYE,makeEye,eyes};
