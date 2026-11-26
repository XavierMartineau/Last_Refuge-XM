/* LAST REFUGE · XM — Mains articulées et gants (8 modèles).
   Module extrait de createur-personnage-3d+armes.html (partagé par le créateur et l’escape room). */
import {fab,leather,metal} from '../materiaux/materiaux.js';
import {box,cyl,ell,grp,th} from '../outils/outils-3d.js';

const GLOVECOL=['#14110e','#4a3420','#3c4a30','#5a5d5f','#8a6b43','#e8e8e2','#a02828','#d8b030'];
const GLV=[null,{cuff:.045},{cuff:.055,knuckle:1},{cuff:.03,fl:1},{cuff:.05,bulk:1.1,fab:1},{cuff:.11,bulk:1.35,fab:1},{cuff:.02,thin:1,white:1},{cuff:.03,fl:.5,fab:1}];
function buildHand(C,eg,side){
  const gl=GLV[C.s.gloves],col=GLOVECOL[C.s.glovesColor]||'#14110e',skin=C.skin;
  const gm=gl?(gl.fab?fab(gl.white?'#e8e8e2':col,0):leather(gl.white?'#e8e8e2':col,.5)):null,pm=gm||skin;
  const bulk=(gl&&gl.bulk)||(gl&&gl.thin?0.93:0)||1,fem=C.fem?.92:1,hg=grp(0,-.275,0,eg);hg.rotation.x=-.08;
  ell(.021*bulk,.052*bulk*fem,.043*bulk*fem,pm,0,-.05,0,hg);                       // paume (épaisseur selon x, doigts alignés selon z)
  for(let i=0;i<4;i++){
    const z=(-.03+i*.02)*fem*bulk,L=[.034,.043,.045,.036][i]*fem,r=.0087*bulk,fs=gl&&gl.fl?skin:pm;
    const f1=grp(0,-.095,z,hg);f1.rotation.z=-side*(.22+.05*i);
    cyl(r,r*.93,L,pm,0,-L/2,0,f1,8);
    const f2=grp(0,-L,0,f1);f2.rotation.z=-side*.55;const L2=L*.85;
    cyl(r*.92,r*.78,L2,fs,0,-L2/2,0,f2,8);ell(r*.8,r*.8,r*.8,fs,0,-L2,0,f2)}
  const th=grp(-side*.02*bulk,-.06,.042*fem*bulk,hg);th.rotation.x=-.8;th.rotation.z=-side*.35;
  cyl(.0105*bulk,.0095*bulk,.036,pm,0,-.018,0,th,8);const t2=grp(0,-.036,0,th);t2.rotation.x=.25;cyl(.0095*bulk,.008*bulk,.03,pm,0,-.015,0,t2,8);
  if(gl&&gl.knuckle){box(.012,.05,.075,metal('#2b2f2b',.5),side*.026,-.075,0,hg);for(let i=0;i<4;i++)box(.014,.012,.016,metal('#3a3f3a',.5),side*.028,-.108,(-.03+i*.02),hg)}
  if(gl)cyl(.043*bulk,.045*bulk,gl.cuff,gm,0,gl.cuff*.3,0,hg,14,true)               // poignet du gant
}

export {GLOVECOL,GLV,buildHand};
