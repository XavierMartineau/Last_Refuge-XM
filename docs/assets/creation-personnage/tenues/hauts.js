/* LAST REFUGE · XM — Hauts et tenues (10 modèles).
   Module extrait de createur-personnage-3d+armes.html (partagé par le créateur et l’escape room). */
import * as THREE from 'three';
import {fab,metal} from '../materiaux/materiaux.js';
import {box,cyl,ell,mat,mk,sh} from '../outils/outils-3d.js';

const OUT=[
  {hem:.98,sleeve:'short'},                                         // 0 Tee-shirt
  {hem:.96,sleeve:'long'},                                          // 1 Manches longues
  {hem:.92,sleeve:'long',hood:1,pocket:1,cuffs:1},                  // 2 Sweat à capuche
  {hem:.9,sleeve:'long',zip:1,collar:1,pockets:2,patch:1},          // 3 Veste de survie
  {hem:.98,sleeve:'short',vest:1},                                  // 4 Gilet tactique
  {hem:.52,sleeve:'long',collar:1,belt:1,flare:1,zip:1},            // 5 Manteau long
  {hem:.98,sleeve:'none',straps:1},                                 // 6 Débardeur
  {hem:1,sleeve:'short',plates:1,pouches:1},                        // 7 Plaque de blindage
  {poncho:1,sleeve:'none'},                                         // 8 Poncho
  {hem:.6,sleeve:'long',lapel:1,pockets:2,flare:.5}                 // 9 Blouse de laboratoire
];
function buildOutfit(C){
  const o=OUT[C.s.outfit],{body,P}=C,main=fab(C.mainHex,C.s.camo,{side:THREE.DoubleSide}),dark=fab(sh(C.mainHex,-.3),0,{side:THREE.DoubleSide}),light=mat(sh(C.mainHex,.25),{roughness:.8}),
    fabric=o.vest||o.plates?dark:main,zf=y=>(C.prof(y)+.03)*.64,hw=metal('#8a8f86',.4);
  if(o.poncho){
    const p=mk(new THREE.ConeGeometry(.36,.62,24,1,true),main,0,1.1,0,body);p.material=main;
    const r=mk(new THREE.TorusGeometry(.075,.014,8,16),dark,0,1.4,0,body);r.rotation.x=Math.PI/2;
    mk(new THREE.TorusGeometry(.3,.012,8,28),dark,0,.82,0,body).rotation.x=Math.PI/2;
    return}
  C.torso(o.hem,1.385,.012,fabric,o.flare||0);
  if(o.vest){C.torso(.98,1.385,.03,main);
    for(const side of[-1,1]){box(.07,.07,.035,light,side*.075,1.08,zf(1.08)+.01,body);box(.07,.07,.035,light,side*.075,1.17,zf(1.17)+.01,body);box(.045,.2,.012,dark,side*.1,1.34,0,body).rotation.z=-side*.1}}
  if(o.plates){C.torso(1.0,1.37,.02,dark);box(.2,.23,.035,metal('#3a3d3a',.5),0,1.2,zf(1.2)+.012,body);box(.2,.23,.035,metal('#3a3d3a',.5),0,1.2,-zf(1.2)-.012,body);
    for(const side of[-1,1])box(.06,.075,.04,light,side*.09,1.04,zf(1.04)+.01,body);box(.3,.03,.2,dark,0,1.02,0,body)}
  if(o.collar){const c=cyl(.074,.082,.06,main,0,1.44,0,body,18,true);c.material=main}
  if(o.hood){ell(.12,.1,.1,dark,0,1.39,-.075,body);const t=mk(new THREE.TorusGeometry(.075,.022,8,18),dark,0,1.4,0,body);t.rotation.x=Math.PI/2}
  if(o.straps)for(const side of[-1,1])box(.03,.1,.012,main,side*.07,1.37,.03,body);
  if(o.lapel)for(const side of[-1,1]){const l=box(.05,.17,.01,light,side*.04,1.3,zf(1.3)+.004,body);l.rotation.z=side*.35}
  if(o.zip)box(.007,1.37-o.hem-.03,.005,hw,0,(1.37+o.hem)/2,zf((1.37+o.hem)/2)-.012,body);
  if(o.belt){const b=mk(new THREE.TorusGeometry(1,.016,8,28),dark,0,1.06,0,body);b.scale.set(C.prof(1.06)+.02,(C.prof(1.06)+.02)*.64,1);b.rotation.x=Math.PI/2;b.scale.set(C.prof(1.06)+.02,1,(C.prof(1.06)+.02)*.64);box(.04,.04,.01,hw,0,1.06,zf(1.06)-.004,body)}
  for(let i=0;i<(o.pockets||0);i++)for(const side of[-1,1])box(.07,.065,.014,light,side*.09,1.08-i*.0,zf(1.08)-.003,body);
  if(o.pocket)box(.14,.07,.016,dark,0,1.02,zf(1.02),body);
  if(o.patch)for(const side of[-1,1])box(.04,.04,.01,mat('#b5a17b'),side*P.sw,1.31,C.prof(1.31)*0+.03,body).position.x=side*(P.sw+.025);
  // manches
  for(const a of C.arms){
    const len=o.sleeve==='long'?.3:o.sleeve==='short'?.13:0;if(!len)continue;const r=P.arm+.011,sm=fabric===dark&&!o.vest?main:(o.vest||o.plates?dark:main);
    cyl(r,r*.88,len,sm,0,-len/2,0,a.ag,14,true);
    if(o.sleeve==='long'){cyl(r*.88,r*.74,.27,sm,0,-.135,0,a.eg,14,true);if(o.cuffs)cyl(r*.78,r*.78,.03,dark,0,-.26,0,a.eg,14,true)}}}

export {OUT,buildOutfit};
