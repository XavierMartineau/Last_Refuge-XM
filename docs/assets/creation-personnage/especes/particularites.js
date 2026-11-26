/* LAST REFUGE · XM — Particularités des personnages « Autres » : ailes, queues, cornes, antennes, marques.
   Module extrait de createur-personnage-3d+armes.html (partagé par le créateur et l’escape room). */
import * as THREE from 'three';
import {D} from '../donnees/donnees.js';
import {chain,ell,glowM,grp,limb,mat,mk,rnd,sh,spike,tube} from '../outils/outils-3d.js';
import {dDot,dStroke,dctx} from '../tete/decalques.js';
import {R} from '../tete/tete.js';

function specials(C){
  const{head,body,sp}=C;
  const dk=mat('#2a2230',{roughness:.7,side:THREE.DoubleSide}),mem=mat('#3a2a46',{roughness:.65,side:THREE.DoubleSide});
  // ailes / appendices du dos (specialBack 1..3) — l’espèce peut aussi en imposer
  const sb=C.s.specialBack,wing=sb||(sp.wings==='bat'?1:sp.wings==='thin'?2:0);
  const wg=(kind,side)=>{
    const g=grp(side*.06,1.28,-.1,body);g.rotation.y=side*.5;
    if(kind===1||kind===2){                                                    // chauve-souris / fines
      const rib=[[0,0,0],[side*.3,.22,-.05],[side*.7,.34,-.12],[side*1.05,.28,-.2]];chain(rib.map(p=>[p[0],p[1],p[2]]),.02,.008,dk,g);
      const sh2=new THREE.Shape();sh2.moveTo(0,0);sh2.lineTo(side*.3,.22);sh2.lineTo(side*.7,.34);sh2.lineTo(side*1.05,.28);sh2.lineTo(side*.8,-.1);sh2.lineTo(side*.5,.0);sh2.lineTo(side*.3,-.25);sh2.lineTo(0,-.3);
      const wm=mk(new THREE.ShapeGeometry(sh2),kind===2?mat('#cfd8e8',{roughness:.4,transparent:true,opacity:.6,side:THREE.DoubleSide}):mem,0,0,-.05,g);wm.castShadow=false}
    else if(kind===3){                                                          // plumes
      for(let i=0;i<9;i++){const t=i/8,a=.2+t*.9,len=.5-.18*Math.abs(t-.35);limb([side*.02,.05-t*.1,-.02],[side*Math.cos(a)*len,Math.sin(a)*len*.7+.1-t*.3,-.04-t*.01],.025,.003,mat('#e9e4d8',{roughness:.8}),g)}}
    return g};
  if(wing===1||wing===2||wing===3)for(const s of[-1,1])wg(wing,s);
  if(sb===3){for(let i=0;i<4;i++){const a=(i-1.5)*.35;tube([[0,1.2,-.1],[Math.sin(a)*.2,1.3,-.28],[Math.sin(a)*.4,1.15,-.4],[Math.sin(a)*.5,.95,-.36]],.02,mat('#5a3a5a',{roughness:.6}),body,16,6)}}   // appendices mutants
  // queue
  if(sp.tail){const m=sp.tail==='cat'?C.hairM:mat(sh(D.HUMAN[C.s.skin]||'#6a8a5a',-.1),{roughness:.7});tube([[0,.95,-.12],[0,.85,-.3],[.12,.7,-.42],[.3,.78,-.5],[.38,.98,-.45]],.035,m,body,24,8)}
  // cornes / antennes / crête (specialHead 1..3 ou imposées)
  const shd=C.s.specialHead||(sp.horns?1:sp.antenna?2:sp.crest?3:0),hm=mat('#d8cfb4',{roughness:.5});
  if(shd===1)for(const s of[-1,1]){chain([[s*.07,.1,0],[s*.11,.18,.0],[s*.13,.26,.02],[s*.1,.33,.04]],.026,.006,hm,head)}
  if(shd===2)for(const s of[-1,1]){tube([[s*.05,.13,.03],[s*.07,.22,.05],[s*.1,.3,.02]],.005,mat('#222'),head,10,5);ell(.014,.014,.014,glowM('#6fffa0',1.8),s*.1,.31,.02,head)}
  if(shd===3)for(let i=0;i<7;i++){const t=i/6,a=.4+t*2.0;spike([0,Math.sin(a)*R*.95,Math.cos(a)*R*.95],[0,Math.sin(a),Math.cos(a)],.017-.004*t,.07-.02*Math.abs(t-.5),mat('#4a7a4a',{roughness:.5}),head)}
  // défense du « Mutant massif »
  if(sp.tusks)for(const s of[-1,1])spike([s*.03,-.085,C.H.surf(s*.03,-.085)],[s*.2,1,.3],.012,.05,hm,head);
  if(sp.fangs)for(const s of[-1,1])spike([s*.012,-.07,C.H.surf(s*.012,-.07)],[0,-1,.1],.004,.015,mat('#f4f1e6'),head);
  // détails spéciaux (visage) specialFace 1..3
  const sf=C.s.specialFace,ctx=dctx(C,sf===2?'glow':'base');
  if(sf===1){dStroke(C,ctx,[[-.09,.06],[-.05,.0],[-.02,-.05]],'rgba(120,30,30,.9)',.006);dStroke(C,ctx,[[.08,.1],[.06,.03],[.09,-.03]],'rgba(120,30,30,.9)',.006)}
  if(sf===2){dStroke(C,ctx,[[.09,.08],[.12,.02],[.1,-.05],[.06,-.09]],'rgba(120,255,200,1)',.007);dDot(C,ctx,.12,.02,.008,'rgba(255,255,255,1)')}
  if(sf===3){for(const[x,y]of[[-.07,.0],[.08,.04],[.0,-.1],[-.09,.08],[.05,-.07]])dDot(C,ctx,x,y,.011,'rgba(60,220,120,.55)')}
  // zombie : peau terne, cicatrices
  if(sp.zombie){const z=dctx(C);dStroke(C,z,[[-.1,.08],[-.04,.04],[-.06,-.02]],'rgba(60,40,40,.85)',.006);dDot(C,z,.06,-.03,.03,'rgba(70,90,60,.5)',.7)}
  if(sp.cyber){const z=dctx(C,'glow');dStroke(C,z,[[.06,.1],[.12,.07],[.12,-.03]],'rgba(255,60,60,1)',.005);dStroke(C,z,[[.12,.03],[.15,.03]],'rgba(255,60,60,1)',.004)}
  if(sp.scales){const z=dctx(C);for(let i=0;i<14;i++){const x=(rnd()-.5)*.2,y=(rnd()-.5)*.2;dDot(C,z,x,y,.008,'rgba(30,70,30,.25)')}}
}

export {specials};
