/* LAST REFUGE · XM — Pantalons (9 modèles) et jambes.
   Module extrait de createur-personnage-3d+armes.html (partagé par le créateur et l’escape room). */
import * as THREE from 'three';
import {buildFoot} from '../bottes/bottes.js';
import {D} from '../donnees/donnees.js';
import {fab} from '../materiaux/materiaux.js';
import {box,cyl,ell,grp,lerp,mat,mk,sh,th} from '../outils/outils-3d.js';

const PT=[{r:1},{r:1.07,pockets:1},{r:1.05,pockets:1,camo:1},{r:1.03,pockets:1,knee:1,camo:1},{r:1.06,pockets:1,work:1},{r:1.07,short:1,pockets:1},{r:1.02,cuff:1},{r:.98,shiny:1},{r:1.04,knee:1}];
function buildLegs(C){
  const{body,P,s}=C,pt=PT[s.pants]||PT[0],camoK=s.camo||1,pcol=D.OUTCOL[s.pantsColor]||'#3b3f45';
  const pm=pt.camo?fab(pcol,camoK,{side:THREE.DoubleSide}):pt.shiny?mat(pcol,{roughness:.28,metalness:.1,side:THREE.DoubleSide}):fab(pcol,0,{side:THREE.DoubleSide}),dk=fab(sh(pcol,-.3),0),r=pt.r;
  C.pantsM=pm;C.legs=[];
  C.torso(.86,1.05,.012,pm);ell(P.hr*1.05,.12,P.hr*.7,pm,0,.93,0,body);
  const b=mk(new THREE.TorusGeometry(1,.014,6,28),dk,0,1.04,0,body);b.rotation.x=Math.PI/2;const br=C.prof(1.04)+.014;b.scale.set(br,br*.64,1);
  for(const side of[-1,1]){
    const lg=grp(side*.085,.93,0,body),kn=grp(0,-.44,0,lg);
    cyl(.07,.058,.44,C.skin,0,-.22,0,lg,14);cyl(.056,.044,.41,C.skin,0,-.205,0,kn,14);ell(.058,.06,.058,C.skin,0,0,0,kn);
    const th=pt.short?.27:.44,rt=.079*r,rb=lerp(rt,.066*r,th/.44);
    cyl(rt,rb,th,pm,0,-th/2,0,lg,16,true);
    if(!pt.short)cyl(.066*r,.05*r,.41,pm,0,-.205,0,kn,16,true);
    if(pt.pockets){box(.034,.12,.1,pm,side*(rt+.012),-.15,.015,lg);box(.036,.035,.104,dk,side*(rt+.013),-.1,.015,lg)}
    if(pt.knee){ell(.052,.065,.03,dk,0,0,.052,kn);box(.09,.012,.02,dk,0,.06,.045,kn);box(.09,.012,.02,dk,0,-.06,.045,kn)}
    if(pt.work){box(.1,.06,.012,dk,0,-.12,.075,lg)}
    if(pt.cuff)cyl(.056,.056,.03,dk,0,-.385,0,kn,14);
    C.legs.push({lg,kn,side});buildFoot(C,kn,side)}}

export {PT,buildLegs};
