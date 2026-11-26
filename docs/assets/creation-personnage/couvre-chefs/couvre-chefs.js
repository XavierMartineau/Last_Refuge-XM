/* LAST REFUGE · XM — Couvre-chefs (17 modèles).
   Module extrait de createur-personnage-3d+armes.html (partagé par le créateur et l’escape room). */
import * as THREE from 'three';
import {D} from '../donnees/donnees.js';
import {metal} from '../materiaux/materiaux.js';
import {box,cyl,ell,glowM,mat,mk,sh,spike,tube} from '../outils/outils-3d.js';
import {R,shell} from '../tete/tete.js';

function headwear(C){
  const k=C.s.headwear;if(!k)return;const{head,H}=C,col=D.ACCCOL[C.s.accColor],m=mat(col,{roughness:.75,side:THREE.DoubleSide}),dk=mat(sh(col,-.35),{roughness:.8,side:THREE.DoubleSide}),lt=mat(sh(col,.3),{roughness:.7}),mt=metal('#7a7d78',.45);
  const dome=(f,b,off,mm=m)=>head.add(shell(H,(x,y,z)=>y>(z>0?f:b),off,mm));
  const brim=(r,y,w,mm=m,sy=1)=>{const o=mk(new THREE.RingGeometry(r,r+w,28),mm,0,y,0,head);o.rotation.x=-Math.PI/2;o.scale.set(1,sy,1);return o};
  switch(k){
    case 1:dome(.1,-.25,.022);box(.01,.01,.01,m,0,.17,0,head);ell(.03,.03,.03,lt,0,.172,0,head);break;                            // bonnet
    case 2:dome(.25,-.1,.02);{const b=mk(new THREE.CylinderGeometry(.11,.11,.006,20,1,false,-.2,Math.PI+.4),dk,0,.1,.12,head);b.rotation.x=.1;b.scale.set(1,1,.9);b.position.set(0,.09,.15)}break;   // casquette
    case 3:dome(.04,-.35,.03,mat('#4c5a3c',{roughness:.6}));brim(R*H.sx*1.0,.075,.012,mat('#4c5a3c'));break;                     // casque militaire
    case 4:dome(.35,.0,.014);{const t=ell(.05,.03,.04,m,0,.0,-.15,head);t.position.set(0,.08,-.15)}break;                           // bandana
    case 5:head.add(shell(H,(x,y,z)=>y>.38&&y<.55,.012,m));break;                                                              // bandeau
    case 6:dome(.35,.0,.025);brim(R*H.sx*.99,.065,.12,m);break;                                                                  // large bord
    case 7:dome(.05,-.3,.03,mat('#e0b020',{roughness:.5}));brim(R*H.sx,.07,.04,mat('#e0b020'));box(.012,.1,.05,mat('#c09010'),0,.16,0,head);break;   // chantier
    case 8:dome(.1,-.4,.035,mat('#6a5640',{roughness:.95}));for(const s of[-1,1])ell(.025,.07,.04,mat('#6a5640',{roughness:.95}),s*.14,.0,.0,head);break; // chapka
    case 9:head.add(shell(H,(x,y,z)=>y>-.1&&!(y<.35&&y>-.05&&Math.abs(x)<.7&&z>.1),.014,dk));break;                              // cagoule
    case 10:{const b=ell(.19,.05,.19,dk,.03,.11,-.01,head);b.rotation.z=-.15}break;                                                 // béret
    case 11:head.add(shell(H,(x,y,z)=>y>.0||z<-.25,.04,m));ell(.12,.05,.11,m,0,.0,-.15,head);break;                                // capuche
    case 12:dome(.35,.0,.025,mat('#6a4a2a',{roughness:.8}));brim(R*H.sx*.99,.065,.14,mat('#6a4a2a'),.9);break;                    // cowboy
    case 13:{const bandM=metal('#2a2a2a',.4);tube([[-.16,-.01,0],[-.16,.12,0],[0,.19,0],[.16,.12,0],[.16,-.01,0]],.007,bandM,head,16,6);for(const s of[-1,1])cyl(.045,.045,.04,mat('#1a1a1a'),s*.168,-.02,0,head,16).rotation.z=Math.PI/2}break;   // casque audio
    case 14:{head.add(shell(H,(x,y,z)=>y>-.35&&z>-.4,.018,mat('#2a2f28',{roughness:.5})));const mk2=cyl(.045,.055,.07,mat('#1b1d1b'),0,-.065,.17,head,14);mk2.rotation.x=Math.PI/2;for(const s of[-1,1])ell(.032,.032,.01,glowM('#6fbf7a',.5),s*.05,.02,H.surf(s*.05,.02)+.03,head)}break;   // masque à gaz
    case 15:dome(.08,-.2,.028,mat('#2c3328',{roughness:.5}));box(.06,.012,.05,metal('#1a1a1a'),0,.14,.14,head);break;               // casque tactique
    case 16:cyl(.095,.095,.19,mat('#16161a'),0,.2,0,head,22);brim(.0,.1,.17,mat('#16161a'));box(.2,.02,.2,mat('#7a1018'),0,.12,0,head);break;   // haut-de-forme
    case 17:{const g=metal('#d8b030',.25),r=R*H.sx;for(let i=0;i<7;i++){const a=i/7*Math.PI*2;spike([Math.cos(a)*r*.95,.115,Math.sin(a)*r*.95*H.sz],[0,1,0],.018,.07,g,head)}const rg=mk(new THREE.TorusGeometry(r*.96,.01,8,28),g,0,.115,0,head);rg.rotation.x=Math.PI/2;rg.scale.set(1,H.sz,1)}break;   // couronne
  }}

export {headwear};
