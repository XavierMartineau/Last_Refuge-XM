/* LAST REFUGE · XM — Bottes et chaussures (9 modèles).
   Module extrait de createur-personnage-3d+armes.html (partagé par le créateur et l’escape room). */
import * as THREE from 'three';
import {leather,metal} from '../materiaux/materiaux.js';
import {box,cyl,ell,grp,mat,mk,sh} from '../outils/outils-3d.js';

const BOOTCOL=['#16110d','#4a3420','#8a6b43','#3c4a30','#555a5c','#e8e8e2','#8a1e18','#1a2540'];
const BT=[{sh:0,low:1},{sh:.2,laces:7,lug:1},{sh:.38},{sh:.36,shiny:1},{sh:.02,shiny:1,thin:1},{sh:.2,laces:7,lug:1,desert:1},{sh:.28,fur:1,lug:1},{sh:.2,laces:7,lug:1,toe:1},{sh:0,open:1}];
function buildFoot(C,kn,side){
  const bt=BT[C.s.boots]||BT[0],col=BOOTCOL[C.s.bootsColor]||'#16110d',fg=grp(0,-.41,0,kn);
  const up=bt.shiny?mat(col,{roughness:.22,metalness:.1}):leather(bt.desert&&C.s.bootsColor===0?'#8a6b43':col,.6),sole=mat(bt.low?'#ececE6':'#0e0e0e',{roughness:.85}),lace=mat('#d9d4c4',{roughness:.9}),sh2=bt.sh;
  box(.108,bt.thin?.02:.03,.285,sole,0,-.066,.045,fg);
  if(bt.lug)for(let i=0;i<7;i++)box(.112,.008,.012,sole,0,-.086,-.07+i*.045,fg);
  if(bt.open){ell(.046,.034,.115,C.skin,0,-.035,.05,fg);box(.1,.008,.02,up,0,-.012,.03,fg);box(.1,.008,.02,up,0,-.01,.1,fg);box(.07,.04,.012,up,0,-.03,-.075,fg);return}
  ell(.052,.043,.135,up,0,-.03,.05,fg);ell(.05,.037,.06,bt.toe?metal('#8a8d88',.35):up,0,-.038,.145,fg);
  if(sh2>.03){cyl(.062,.067,sh2,up,0,sh2/2-.01,0,fg,16);const t=mk(new THREE.TorusGeometry(.064,.008,6,16),mat(sh(col,-.2),{roughness:.7}),0,sh2-.01,0,fg);t.rotation.x=Math.PI/2}
  if(bt.laces){for(let i=0;i<bt.laces;i++){const y=-.015+i*(sh2+.02)/bt.laces;box(.05,.005,.01,lace,0,y,.063+(y<.02?.045:0),fg)}box(.04,sh2*.9,.008,mat(sh(col,-.15),{roughness:.8}),0,sh2/2,.066,fg)}
  if(bt.fur)cyl(.079,.079,.05,mat('#d8d4c8',{roughness:1}),0,sh2-.015,0,fg,16);
  if(!bt.thin)ell(.05,.012,.05,mat(sh(col,-.3),{roughness:.8}),0,-.05,-.07,fg)}

export {BOOTCOL,BT,buildFoot};
