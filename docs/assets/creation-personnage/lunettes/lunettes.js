/* LAST REFUGE · XM — Lunettes et visières (11 modèles).
   Module extrait de createur-personnage-3d+armes.html (partagé par le créateur et l’escape room). */
import * as THREE from 'three';
import {metal} from '../materiaux/materiaux.js';
import {box,cyl,ell,glowM,limb,mat,mk} from '../outils/outils-3d.js';
import {R} from '../tete/tete.js';

function glasses(C){
  const gI=C.s.glasses;if(!gI)return;const{head,H}=C,fr=metal('#2a2a2a',.4),gl=mat('#1a1a1a',{roughness:.1,metalness:.3,transparent:true,opacity:.85}),clear=mat('#cfe8ff',{roughness:.05,transparent:true,opacity:.28,depthWrite:false});
  const ez=H.surf(.05,.015)+.014,lensM=[null,clear,clear,gl,gl,gl,clear,gl,null,mat('#4a7a8a',{roughness:.1,transparent:true,opacity:.6}),glowM('#ff3030',1.2),clear][gI];
  const ring=(x,r,sx=1,sy=1,thk=.0035)=>{const t=mk(new THREE.TorusGeometry(r,thk,8,24),fr,x,.015,ez,head);t.scale.set(sx,sy,1);return t};
  const lens=(x,r,sx=1,sy=1)=>{if(!lensM)return;const o=new THREE.Mesh(new THREE.CircleGeometry(r,24),lensM);o.position.set(x,.015,ez-.001);o.scale.set(sx,sy,1);head.add(o)};
  const temples=()=>{for(const side of[-1,1]){const x=side*.075;limb([x,.015,ez-.004],[side*R*H.sx*.95,.01,-.01],.0025,.0025,fr,head)}};
  switch(gI){
    case 1:for(const s of[-1,1]){ring(s*.05,.026);lens(s*.05,.026)}box(.02,.004,.004,fr,0,.02,ez,head);temples();break;
    case 2:for(const s of[-1,1]){const b=box(.052,.038,.004,fr,s*.05,.015,ez,head);lens(s*.05,.02,1.2,.9)}temples();break;
    case 3:for(const s of[-1,1]){const t=ring(s*.05,.03,1.1,.95);lens(s*.05,.03,1.1,.95)}box(.025,.004,.004,fr,0,.025,ez,head);temples();break;
    case 4:for(const s of[-1,1]){box(.056,.034,.006,gl,s*.05,.013,ez,head)}box(.03,.006,.006,fr,0,.02,ez,head);temples();break;
    case 5:for(const s of[-1,1]){ring(s*.05,.025,1.15,.9,.005);lens(s*.05,.025,1.15,.9)}limb([-.075,.015,ez-.004],[-R*H.sx*.95,.01,-.01],.004,.004,mat('#2c3a2c'),head);limb([.075,.015,ez-.004],[R*H.sx*.95,.01,-.01],.004,.004,mat('#2c3a2c'),head);break;
    case 6:ring(.05,.027);lens(.05,.027);limb([.05,-.012,ez],[.06,-.1,ez+.03],.0012,.0012,metal('#b0a070'),head);break;
    case 7:{const v=mk(new THREE.CylinderGeometry(R*H.sx*1.02,R*H.sx*1.02,.05,24,1,true,-.9,1.8),mat('#2b3d52',{roughness:.1,transparent:true,opacity:.6,side:THREE.DoubleSide}),0,.015,0,head);v.scale.z=H.sz;break}
    case 8:{const p=box(.06,.045,.006,mat('#111'),-.05,.015,ez,head);p.rotation.z=.1;limb([-.075,.015,ez-.004],[-R*H.sx*.95,.01,-.01],.003,.003,mat('#111'),head);limb([-.07,.03,ez-.002],[.07,.05,ez-.002],.002,.002,mat('#111'),head);ell(.012,.012,.004,fr,.05,.015,ez-.002,head);break}
    case 9:for(const s of[-1,1]){ring(s*.05,.028,1,1,.007);lens(s*.05,.028);cyl(.033,.033,.01,mat('#7a6a4a',{metalness:.6,roughness:.4}),s*.05,.015,ez-.004,head,18).rotation.x=Math.PI/2}limb([-.075,.015,ez],[-R*H.sx*.95,.01,-.01],.005,.005,mat('#3a2a1a'),head);limb([.075,.015,ez],[R*H.sx*.95,.01,-.01],.005,.005,mat('#3a2a1a'),head);break;
    case 10:{const v=box(.14,.034,.008,glowM('#ff3030',1.3),0,.015,ez,head);v.scale.z=1;box(.145,.04,.004,fr,0,.015,ez-.004,head);temples();break}
    case 11:for(const s of[-1,1]){const t=mk(new THREE.TorusGeometry(.025,.003,8,16,Math.PI),fr,s*.05,.018,ez,head);t.rotation.z=Math.PI;lens(s*.05,.02,1,.5)}box(.02,.004,.004,fr,0,.025,ez,head);temples();break}}

export {glasses};
