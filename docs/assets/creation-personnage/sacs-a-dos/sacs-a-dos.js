/* LAST REFUGE · XM — Sacs à dos (7 modèles).
   Module extrait de createur-personnage-3d+armes.html (partagé par le créateur et l’escape room). */
import * as THREE from 'three';
import {fab,metal} from '../materiaux/materiaux.js';
import {box,cyl,mat,sh} from '../outils/outils-3d.js';

const BP=[null,{w:.34,h:.46,d:.2,y:1.2,pk:1,molle:1},{w:.36,h:.62,d:.26,y:1.14,roll:1,lid:1},{w:.28,h:.34,d:.14,y:1.22},{w:.32,h:.4,d:.2,y:1.2,ant:1},{w:.34,h:.38,d:.2,y:1.22,cross:1,white:1},{w:.34,h:.5,d:.22,y:1.16,roll:1,top:1},{w:.42,h:.64,d:.3,y:1.12,pk:2,molle:1,big:1}];
function backpack(C){
  const k=C.s.backpack;if(!k)return;const bp=BP[k],{body}=C,zb=-((C.prof(1.2)+.05)*.64+bp.d/2);
  const bm=bp.white?mat('#dcd8cc',{roughness:.8}):fab(C.mainHex,(k===1||k===7)?(C.s.camo||0):0,{side:THREE.DoubleSide}),dk=fab(sh(C.mainHex,-.35),0),zfy=y=>(C.prof(y)+.03)*.64;
  box(bp.w,bp.h,bp.d,bm,0,bp.y,zb,body);box(bp.w*.96,.05,bp.d*1.02,dk,0,bp.y+bp.h/2,zb,body);
  if(bp.pk)for(const s of[-1,1])box(.06,bp.h*.5,bp.d*.8,dk,s*(bp.w/2+.03),bp.y-bp.h*.1,zb,body);
  if(bp.pk===2)box(bp.w*.8,bp.h*.4,.08,dk,0,bp.y-bp.h*.12,zb-bp.d/2-.04,body);
  if(bp.molle)for(let i=0;i<4;i++)box(bp.w*.9,.008,.012,dk,0,bp.y-bp.h*.3+i*.07,zb-bp.d/2-.006,body);
  if(bp.roll||bp.top){const c=cyl(.07,.07,bp.w+.04,mat('#8a6b43',{roughness:.9}),0,bp.roll&&!bp.top?bp.y-bp.h/2-.05:bp.y+bp.h/2+.09,zb,body,16);c.rotation.z=Math.PI/2}
  if(bp.lid)box(bp.w*1.02,.06,bp.d*1.04,dk,0,bp.y+bp.h/2+.03,zb,body);
  if(bp.ant){cyl(.004,.004,.6,metal('#9a9d98',.3),.12,bp.y+bp.h/2+.3,zb-.05,body,6);box(.12,.1,.04,dk,0,bp.y,zb-bp.d/2-.02,body)}
  if(bp.cross){const r=mat('#b02020',{roughness:.7});box(.14,.045,.01,r,0,bp.y,zb-bp.d/2-.006,body);box(.045,.14,.01,r,0,bp.y,zb-bp.d/2-.006,body)}
  for(const s of[-1,1]){box(.05,.3,.014,dk,s*.1,1.2,zfy(1.2)+.012,body);box(.05,.014,.2,dk,s*.1,1.4,-.0,body);box(.05,.014,.07,dk,s*.1,1.395,.075,body)}}

export {BP,backpack};
