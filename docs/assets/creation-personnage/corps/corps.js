/* LAST REFUGE · XM — Corps : torse, cou, bras et mains, jambes.
   Module extrait de createur-personnage-3d+armes.html (partagé par le créateur et l’escape room). */
import * as THREE from 'three';
import {buildHand} from '../gants/gants.js';
import {cyl,ell,grp,lerp,mk} from '../outils/outils-3d.js';
import {buildLegs} from '../pantalons/pantalons.js';

function buildBody(C){
  const{fem,body}=C,P=C.P=fem?{sw:.155,tr:.148,wr:.108,hr:.15,arm:.04}:{sw:.2,tr:.172,wr:.14,hr:.155,arm:.047};
  const pts=[[.86,P.hr*.98],[.98,P.wr],[1.12,P.wr*1.05],[1.24,P.tr],[1.33,P.sw*.9],[1.39,.07]];
  C.prof=y=>{let r=pts[pts.length-1][1];if(y<=pts[0][0])r=pts[0][1];else for(let i=1;i<pts.length;i++)if(y<=pts[i][0]){const a=pts[i-1],b=pts[i];r=lerp(a[1],b[1],(y-a[0])/(b[0]-a[0]));break}
    return r+(fem?.016*Math.exp(-Math.pow((y-1.2)/.06,2)):0)};
  C.torso=(y0,y1,off,m,fl=0,n=12)=>{const v=[];for(let i=0;i<=n;i++){const y=lerp(y0,y1,i/n);v.push(new THREE.Vector2(C.prof(y)+off+fl*Math.max(0,1-y)*.35,y))}
    const o=mk(new THREE.LatheGeometry(v,56),m,0,0,0,body);o.scale.z=.64;return o};
  C.torso(.86,1.4,0,C.skin);
  ell(P.sw*.55,.05,.085,C.skin,0,1.385,-.01,body);                               // trapèzes
  cyl(.05,.058,.15,C.skin,0,1.42,0,body);ell(.056,.04,.056,C.skin,0,1.37,.0,body);   // cou
  C.arms=[];
  for(const side of[-1,1]){
    const ag=grp(side*P.sw,1.31,0,body);ag.rotation.z=side*.12;
    ell(P.arm*1.3,P.arm*1.25,P.arm*1.25,C.skin,0,0,0,ag);                          // deltoïde
    ell(P.arm*1.06,.12,P.arm*1.06,C.skin,0,-.12,0,ag);                               // biceps
    cyl(P.arm,P.arm*.86,.3,C.skin,0,-.15,0,ag,14);
    const eg=grp(0,-.3,0,ag);eg.rotation.x=-.14;
    ell(P.arm*.9,P.arm*.9,P.arm*.9,C.skin,0,0,0,eg);cyl(P.arm*.85,P.arm*.62,.27,C.skin,0,-.135,0,eg,14);
    buildHand(C,eg,side);C.arms.push({ag,eg,side})}
  buildLegs(C);C.chest=body}

export {buildBody};
