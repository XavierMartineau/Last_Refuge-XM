/* LAST REFUGE · XM — Modèles 3D des 12 armes et de leurs pièces (embouts, optiques, crosses, chargeurs).
   Module extrait de createur-personnage-3d+armes.html (partagé par le créateur et l’escape room). */
import * as THREE from 'three';
import {WFIN} from './donnees-armes.js';
import {gunPaint,leather,metal,polyMat,woodMat} from '../materiaux/materiaux.js';
import {V,box,chain,cyl,ell,glowM,grp,limb,mat,mk,sh} from '../outils/outils-3d.js';
import {px} from '../tete/decalques.js';
import {R} from '../tete/tete.js';

function gunModel(s,k,wg,anim){
  const fin=WFIN[s.wFinish]||WFIN[0],bm=gunPaint(fin),st=metal('#26282a',.4),steel=metal('#9a9d98',.28),poly=polyMat('#17181a'),wood=woodMat(),furn=s.wFinish===4?wood:poly,brass=mat('#c9a64a',{metalness:.7,roughness:.3});
  const zc=(r0,r1,len,m,x,y,z)=>{const o=mk(new THREE.CylinderGeometry(r1,r0,len,24),m,x,y,z+len/2,wg);o.rotation.x=Math.PI/2;return o};
  const bx=(w,h,d,m,x,y,z)=>box(w,h,d,m,x,y,z,wg);
  const px=(pts,w,m,x=0,y=0,z=0)=>{const sp=new THREE.Shape();pts.forEach((q,i)=>i?sp.lineTo(q[0],q[1]):sp.moveTo(q[0],q[1]));sp.closePath();
    const g=new THREE.ExtrudeGeometry(sp,{depth:w,bevelEnabled:true,bevelThickness:.0022,bevelSize:.0022,bevelSegments:1,curveSegments:4});g.translate(0,0,-w/2);g.rotateY(-Math.PI/2);return mk(g,m,x,y,z,wg)};
  const rail=(z0,z1,y)=>{bx(.02,.005,z1-z0,st,0,y,(z0+z1)/2);for(let z=z0+.005;z<z1;z+=.012)bx(.026,.004,.005,st,0,y+.004,z)};
  const screws=(zs,y,m=steel)=>zs.forEach(z=>{for(const q of[-1,1])zc(.004,.004,.003,m,q*.0215,y,z).rotation.z=Math.PI/2});
  const muzzle=(zm,y,r)=>{switch(s.wMuzzle){
    case 1:zc(r*1.8,r*1.8,.06,bm,0,y,zm);for(let i=0;i<3;i++)bx(r*4,.004,.008,st,0,y,zm+.012+i*.014);break;
    case 2:zc(r*2.3,r*2.3,.2,st,0,y,zm);for(let i=0;i<5;i++)zc(r*2.4,r*2.4,.004,mat('#0c0c0c'),0,y,zm+.025+i*.036);zc(r*2.35,r*2.35,.012,st,0,y,zm+.2);break;
    case 3:zc(r*1.4,r*2.1,.08,st,0,y,zm);for(let i=0;i<6;i++){const q=i/6*6.28;bx(.004,.016,.03,st,Math.cos(q)*r*2,y+Math.sin(q)*r*2,zm+.05)}break;
    case 4:zc(r*1.9,r*1.9,.05,bm,0,y,zm);bx(r*4,.014,.02,st,0,y+r*1.9,zm+.025);bx(r*4,.014,.02,st,0,y-r*1.9,zm+.025);break}
    if(!s.wMuzzle)zc(r*1.25,r*1.25,.012,st,0,y,zm)};
  const optic=(z,y)=>{const o=s.wOptic;if(!o)return;const g=glowM('#ff3030',1.4),gl=mat('#aaddff',{transparent:true,opacity:.38,roughness:.05});
    rail(z-.07,z+.07,y);
    if(o===1){bx(.03,.03,.05,st,0,y+.024,z);bx(.016,.02,.002,gl,0,y+.036,z+.026);ell(.0025,.0025,.0025,g,0,y+.036,z+.022,wg)}
    if(o===2){bx(.038,.014,.07,st,0,y+.014,z);for(const q of[-1,1])bx(.004,.034,.07,st,q*.017,y+.036,z);bx(.034,.004,.07,st,0,y+.056,z);bx(.03,.03,.002,gl,0,y+.036,z+.034)}
    if(o===3){zc(.02,.02,.14,st,0,y+.036,z-.07);zc(.027,.027,.03,st,0,y+.036,z+.06);zc(.026,.026,.026,st,0,y+.036,z-.08);zc(.0165,.0165,.004,mat('#4488ff',{emissive:'#102040',roughness:.08}),0,y+.036,z+.092);bx(.014,.014,.022,st,0,y+.012,z);ell(.0025,.0025,.0025,glowM('#ff8a20',1.6),0,y+.062,z-.01,wg)}
    if(o===4){zc(.0155,.0155,.4,st,0,y+.046,z-.19);zc(.032,.032,.07,st,0,y+.046,z+.2);zc(.028,.028,.05,st,0,y+.046,z-.23);zc(.0295,.0295,.012,steel,0,y+.046,z+.0);
      zc(.0165,.0165,.004,mat('#6a5aff',{emissive:'#101040',roughness:.08}),0,y+.046,z+.27);for(const zz of[-.05,.08])bx(.022,.026,.012,st,0,y+.02,z+zz);
      zc(.007,.007,.03,steel,.036,y+.048,z-.02).rotation.z=Math.PI/2;zc(.007,.007,.03,steel,0,y+.084,z-.02)}};
  const under=(z,y)=>{const u=s.wUnder;if(!u)return;
    if(u===1){cyl(.0165,.0155,.11,poly,0,y-.055,z,wg,12);bx(.022,.01,.04,st,0,y,z)}
    if(u===2){zc(.021,.021,.085,st,0,y-.022,z);zc(.0175,.0175,.004,glowM('#ffffee',2.6),0,y-.022,z+.085);bx(.03,.012,.04,st,0,y,z-.01)}
    if(u===3){bx(.022,.03,.055,st,0,y-.02,z);zc(.005,.005,.01,glowM('#ff2020',2.6),0,y-.02,z+.055);bx(.026,.01,.04,st,0,y,z)}
    if(u===4)for(const q of[-1,1]){limb([q*.012,y,z],[q*.07,y-.15,z+.15],.006,.005,st,wg);zc(.007,.007,.02,steel,q*.07,y-.15,z+.15)}};
  // crosse : profils selon le type (0 standard, 1 pliante, 2 tactique, 3 bois, 4 aucune)
  const stockP=(zb,y,len,h,drop=.05)=>{const t=s.wStock;
    if(t===4){bx(.03,.07,.02,st,0,y,zb);return}
    if(t===1){for(const q of[-1,1])zc(.006,.006,len*.95,st,q*.016,y+h*.25,zb-len*.95);px([[zb-len*.95-.01,y+h*.5],[zb-len*.95+.012,y+h*.5],[zb-len*.95+.012,y-h*.5],[zb-len*.95-.01,y-h*.5]],.03,poly);return}
    if(t===2){px([[zb,y+h*.4],[zb-len*.6,y+h*.42],[zb-len,y+h*.3],[zb-len,y-h*.7],[zb-len*.55,y-h*.4],[zb,y-h*.4]],.036,poly);px([[zb-len*.3,y+h*.42],[zb-len*.85,y+h*.34],[zb-len*.85,y+h*.52],[zb-len*.3,y+h*.55]],.032,furn);bx(.042,h*1.15,.022,mat('#0f0f0f',{roughness:.9}),0,y-.1*h,zb-len);return}
    const m=t===3?wood:furn;px([[zb,y+h*.45],[zb-len*.55,y+h*.38],[zb-len,y+h*.28],[zb-len*1.01,y-h*.85],[zb-len*.7,y-h*.52-drop*.4],[zb-len*.3,y-h*.45],[zb,y-h*.4]],.036,m);bx(.038,h*1.05,.016,mat('#0f0f0f',{roughness:.9}),0,y-h*.28,zb-len*1.0)};
  const pgrip=(z,y,len,rake,m)=>{px([[z-.02,y],[z+.022,y],[z+.022-rake,y-len],[z-.03-rake,y-len],[z-.034-rake*.4,y-len*.45]],.032,m);
    for(let i=0;i<5;i++)bx(.034,.003,.026,mat('#0b0b0b'),0,y-.02-i*len*.17,z-rake*(.05+i*.2));};
  const guard=(z,y,l)=>{px([[z,y],[z+l,y],[z+l,y-.04],[z+l*.5,y-.052],[z+l*.15,y-.04],[z,y-.03]],.006,st);bx(.006,.03,.004,st,0,y-.04,z+l*.3).rotation.x=.3};
  // gravures : marquage du fabricant sur les deux côtés du boîtier (texture transparente, léger relief métallique)
  const engr=(text,z,y,w,h,xs)=>{const c=document.createElement('canvas');c.width=512;c.height=Math.max(16,Math.round(512*h/w));const cx=c.getContext('2d');cx.font=`bold ${Math.round(c.height*.62)}px "Courier New",monospace`;cx.textAlign='center';cx.textBaseline='middle';cx.fillStyle='rgba(205,208,200,.6)';cx.fillText(text,256,c.height/2);
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;const m=new THREE.MeshStandardMaterial({map:t,transparent:true,roughness:.35,metalness:.8,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});
    for(const q of[-1,1]){const p=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m);p.position.set(q*xs,y,z);p.rotation.y=q*Math.PI/2;wg.add(p)}};
  const ENG={2:['MODEL 9 · 9x19 · N°7731',.01,.038,.13,.0155,.0178],3:['PUMP 12 GA · N°3320',.02,.0,.19,.02,.0235],4:['AK-47 · 7,62x39 · N°48213',.0,.0,.3,.02,.0225],5:['PRECISION .308 · N°0417',.0,.0,.26,.02,.0225],7:['MAGNUM .357',-.02,.01,.1,.016,.0175],8:['SMG 9 · N°20817',-.05,.0,.22,.02,.0225],9:['M4 · 5.56 NATO · N°9902',-.04,.0,.24,.02,.0205],10:['MODEL 94 · .30-30',.0,.0,.2,.02,.0195]};
  const R={},put=(n,v)=>R[n]=v;
  switch(k){
    case 1:{                                               // COUTEAU DE COMBAT (lame extrudée, poignée cordée, garde, pommeau)
      const hm=leather(fin==='#1b1b1d'?'#1a1512':fin,.6);zc(.0155,.0135,.13,hm,0,0,-.135);zc(.0175,.0175,.014,steel,0,0,-.005);ell(.0185,.0185,.014,steel,0,0,-.14,wg);bx(.054,.014,.012,steel,0,0,.012);
      for(let i=0;i<6;i++)zc(.0165,.0165,.004,mat('#0a0a0a'),0,0,-.125+i*.019);
      const t=s.wMuzzle,P=[[[0,.016],[.13,.016],[.2,-.014],[.14,-.019],[0,-.019]],[[0,.017],[.17,.017],[.205,-.006],[.19,-.019],[0,-.019]],null,[[0,.016],[.12,.018],[.2,.011],[.225,-.014],[.205,-.016],[.17,-.005],[0,-.019]],[[0,.018],[.12,.02],[.215,0],[.12,-.02],[0,-.018]]];
      let pts=P[t];if(!pts){pts=[[0,.016],[.13,.016],[.2,-.012]];for(let i=0;i<8;i++)pts.push([.19-i*.0225,i%2?-.012:-.018]);pts.push([0,-.019])}
      const sh2=new THREE.Shape();sh2.moveTo(pts[0][0],pts[0][1]);pts.slice(1).forEach(p=>sh2.lineTo(p[0],p[1]));
      const g=new THREE.ExtrudeGeometry(sh2,{depth:.0045,bevelEnabled:true,bevelThickness:.0012,bevelSize:.0012,bevelSegments:1});g.translate(0,0,-.00225);g.rotateY(-Math.PI/2);
      mk(g,metal('#c9ccc8',.16),0,0,.018,wg);bx(.0016,.003,.17,metal('#e8ebe7',.1),0,.0,.1);   // lame + fil poli
      put('gR',V(0,0,-.07));put('wR',V(0,0,-.075))}break;
    case 2:{                                               // PISTOLET (culasse, carcasse, rail, gâchette, chargeur)
      bx(.026,.026,.17,bm,0,-.004,.0);px([[-.075,.058],[.095,.058],[.098,.03],[.095,.016],[-.075,.016]],.03,bm);for(let i=0;i<6;i++)bx(.032,.036,.003,st,0,.037,-.07+i*.007);   // culasse + cannelures
      px([[-.075,.016],[.07,.016],[.07,-.012],[.01,-.014],[-.03,-.03],[-.075,-.012]],.028,furn);rail(.01,.07,-.016);
      pgrip(-.02,-.012,.105,.03,furn);guard(.0,-.016,.07);bx(.006,.02,.005,st,0,-.03,.03).rotation.x=.25;bx(.004,.012,.012,st,0,.062,-.07);bx(.004,.01,.01,st,0,.062,.09);
      const mh=[.02,.05,.02,.036][s.wMag]||.02;
      if(s.wMag===2){const d=mk(new THREE.CylinderGeometry(.04,.04,.03,18),st,0,-.14,-.04,wg);d.rotation.z=Math.PI/2}else{bx(.026,mh+.02,.04,st,0,-.115-mh/2,-.044);bx(.03,.01,.044,poly,0,-.125-mh,-.044)}
      if(s.wMag===3)bx(.024,.04,.036,st,0,-.15,-.01);
      zc(.0075,.0075,.04,steel,0,.036,.096);muzzle(.135,.036,.0078);optic(-.01,.06);under(.06,-.022);
      put('gR',V(0,-.05,-.03));put('wR',V(0,.045,-.08));put('gL',V(-.012,-.06,.012));put('wL',V(-.045,.04,-.06))}break;
    case 3:{                                               // FUSIL À POMPE (carcasse, tube-magasin, garde-main coulissante, crosse)
      px([[-.12,.045],[.14,.04],[.15,.0],[.12,-.04],[-.04,-.045],[-.12,-.02]],.042,bm);bx(.044,.016,.1,st,0,.0,.02);bx(.008,.04,.06,st,.022,.012,.0);
      zc(.0145,.0145,.6,steel,0,.026,.14);zc(.012,.012,.5+(s.wMag===1?.1:0),st,0,-.014,.14);bx(.004,.01,.005,brass,0,.044,.74);
      px([[.17,.012],[.4,.012],[.4,-.03],[.17,-.03]],.052,furn);for(let i=0;i<9;i++)bx(.056,.003,.012,mat('#0b0b0b'),0,-.009,.19+i*.024);
      pgrip(-.07,-.04,.1,.045,furn);guard(-.055,-.047,.1);
      if(s.wMag===2){const d=mk(new THREE.CylinderGeometry(.05,.05,.04,18),st,0,-.08,.04,wg);d.rotation.z=Math.PI/2}
      if(s.wMag===3)for(const q of[-1,1])bx(.012,.064,.12,st,q*.034,.0,-.02);
      stockP(-.12,.0,.32,.1);muzzle(.74,.026,.0145);optic(.0,.052);under(.38,-.03);
      put('gR',V(0,-.085,-.06));put('wR',V(0,.05,-.075));put('gL',V(0,-.01,.2));put('wL',V(0,.02,-.07))}break;
    case 4:{                                               // AK-47 (boîtier embouti, couvre-culasse, tube à gaz, garde-main bois, chargeur courbe)
      px([[-.2,.034],[.2,.034],[.2,-.034],[-.2,-.034]],.04,bm);px([[-.2,.034],[.1,.034],[.1,.05],[-.02,.054],[-.2,.046]],.038,st);screws([-.15,-.05,.12,.18],.0);
      for(let i=0;i<3;i++)bx(.042,.002,.12,mat('#0e0e0e'),0,.0,-.14+i*.0);                                   // fente d’éjection
      px([[.16,.03],[.4,.034],[.4,-.026],[.16,-.036]],.05,wood);px([[.2,.05],[.4,.046],[.4,.034],[.2,.034]],.04,wood);for(let i=0;i<8;i++)bx(.052,.003,.01,mat('#2a1a0c'),0,-.0,.2+i*.025);
      zc(.0085,.0085,.26,steel,0,.012,.38);zc(.0105,.0105,.34,steel,0,.056,.18);bx(.016,.034,.02,st,0,.036,.5);bx(.006,.03,.006,st,0,.066,.5);ell(.007,.007,.007,st,0,.07,.5,wg);
      zc(.012,.012,.04,st,0,.012,.64);zc(.0095,.0095,.03,steel,0,.012,.62);bx(.012,.02,.02,st,0,.034,-.18);bx(.006,.018,.006,st,0,.056,-.14);
      pgrip(-.03,-.034,.115,.05,furn);guard(-.005,-.042,.1);
      const cap=[.15,.22,0,.15][s.wMag];
      if(s.wMag===2){const d=mk(new THREE.CylinderGeometry(.075,.075,.062,20),st,0,-.14,.06,wg);d.rotation.z=Math.PI/2;zc(.02,.02,.07,st,0,-.075,.0)}
      else{const pts=[],pb=[];const n=8;for(let i=0;i<=n;i++){const t=i/n,z0=.04+Math.pow(t,1.7)*.1*(cap/.15),y0=-.034-t*cap;pts.push([z0,y0]);pb.push([z0-.04-t*.012,y0+(i?0:0)])}
        px(pts.concat(pb.reverse()),.032,st);for(let i=1;i<n;i+=2)bx(.034,.003,.004,mat('#0e0e0e'),0,-.034-i/n*cap,.04+Math.pow(i/n,1.7)*.1*(cap/.15)-.02);
        if(s.wMag===3){const q=bx(.03,.14,.036,st,.034,-.1,.02);q.rotation.x=-.2}}
      stockP(-.2,-.002,.3,.1);muzzle(.65,.012,.0095);optic(-.02,.054);under(.28,-.036);
      put('gR',V(0,-.09,-.055));put('wR',V(0,.05,-.075));put('gL',V(0,-.015,.15));put('wL',V(0,.02,-.07))}break;
    case 5:{                                               // FUSIL DE PRÉCISION (culasse, verrou, canon lourd cannelé, crosse trou de pouce, bipied)
      px([[-.2,.034],[.22,.034],[.22,-.034],[-.2,-.034]],.04,bm);bx(.012,.016,.07,st,.032,.024,-.04);ell(.011,.011,.011,st,.052,.024,-.06,wg);zc(.005,.005,.05,st,.04,.024,-.06).rotation.z=Math.PI/2;
      rail(-.18,.2,.037);zc(.0125,.0105,.74,steel,0,.012,.2);for(let i=0;i<6;i++)zc(.0145,.0145,.004,st,0,.012,.3+i*.1);
      px([[.12,.0],[.5,.002],[.5,-.036],[.12,-.04]],.05,furn);px([[-.2,.0],[-.06,-.034],[-.06,-.06],[-.2,-.06]],.046,furn);
      pgrip(-.06,-.034,.115,.06,furn);guard(-.04,-.045,.1);
      if(s.wMag===2){const d=mk(new THREE.CylinderGeometry(.06,.06,.05,18),st,0,-.1,.04,wg);d.rotation.z=Math.PI/2}else bx(.032,.05+[0,.04,0,.02][s.wMag],.07,st,0,-.075,.04);
      px([[-.2,.02],[-.38,.0],[-.6,.0],[-.6,-.13],[-.4,-.15],[-.3,-.1],[-.2,-.07]],.04,furn);bx(.042,.12,.02,mat('#0f0f0f',{roughness:.9}),0,-.068,-.6);
      if(s.wStock)stockP(-.2,.0,.3,.1);
      muzzle(.94,.012,.011);if(!s.wOptic){bx(.006,.03,.006,st,0,.05,.82);bx(.014,.02,.012,st,0,.044,-.03);bx(.004,.02,.004,st,0,.06,-.03)}else optic(.02,.037);
      if(!s.wUnder)for(const q of[-1,1]){limb([q*.012,-.03,.5],[q*.07,-.17,.62],.005,.004,st,wg);zc(.007,.007,.02,steel,q*.07,-.17,.62)}else under(.5,-.04);
      put('gR',V(0,-.09,-.06));put('wR',V(0,.05,-.075));put('gL',V(0,-.025,.05));put('wL',V(0,.03,-.07))}break;
    case 6:{                                               // MINIGUN (6 canons rotatifs, carter, moteur, bande de munitions, poignées)
      zc(.075,.075,.34,bm,0,.0,-.04);zc(.058,.058,.07,st,0,0,.3);zc(.08,.08,.04,st,0,0,-.08);zc(.06,.06,.12,st,0,0,-.2);
      const rot=grp(0,0,.37,wg);for(let i=0;i<6;i++){const a=i/6*Math.PI*2;cyl(.011,.011,.66,steel,Math.cos(a)*.038,Math.sin(a)*.038,.33,rot,12).rotation.x=Math.PI/2}
      for(const z of[.0,.2,.42,.62]){const r=mk(new THREE.TorusGeometry(.05,.008,8,20),st,0,0,z,rot)}
      anim&&anim.push(t=>{rot.rotation.z=t*9});
      bx(.05,.05,.18,st,0,.095,.04);bx(.04,.02,.22,st,0,.125,.04);rail(-.04,.14,.137);
      pgrip(-.06,-.07,.1,.0,furn);bx(.07,.014,.02,st,0,-.075,-.06);px([[.08,-.07],[.26,-.07],[.26,-.095],[.08,-.095]],.012,st);cyl(.014,.014,.1,poly,0,-.12,.17,wg,12);
      const boxM=[[.16,.12,.2],[.2,.16,.26],[.14,.14,.14],[.14,.12,.18]][s.wMag];bx(boxM[0],boxM[1],boxM[2],mat(sh(fin,-.1),{roughness:.5,metalness:.5}),-.18,-.1,-.04);bx(boxM[0]+.01,.01,boxM[2]+.01,st,-.18,-.1+boxM[1]/2,-.04);
      if(s.wMag===3){bx(boxM[0],boxM[1],boxM[2],mat(sh(fin,-.1),{roughness:.5,metalness:.5}),.18,-.1,-.04)}
      chain([[-.12,-.04,.04],[-.1,-.0,.07],[-.06,.04,.07],[-.03,.06,.06]],.011,.011,brass,wg);
      if(s.wMuzzle)zc(.052,.052,.04+s.wMuzzle*.02,bm,0,0,1.0);under(.18,-.05);
      put('gR',V(0,-.1,-.06));put('wR',V(0,.05,-.07));put('gL',V(0,-.125,.17));put('wL',V(0,.05,-.07))}break;
    case 7:{                                               // REVOLVER MAGNUM (tambour cannelé, canon à nervure, crosse bois)
      px([[-.1,.045],[.07,.045],[.07,.0],[-.0,-.03],[-.1,-.02]],.03,bm);zc(.031,.031,.06,steel,0,.014,-.025);for(let i=0;i<6;i++){const q=i/6*6.283;bx(.006,.012,.058,st,Math.cos(q)*.031,.014+Math.sin(q)*.031,-.025+.03)}
      zc(.0125,.0115,.17,steel,0,.024,.045);zc(.0095,.0095,.12,bm,0,-.0,.05);bx(.008,.008,.17,st,0,.04,.1);bx(.004,.014,.006,st,0,.039,.2);
      bx(.008,.028,.014,st,0,.052,-.1).rotation.x=.4;pgrip(-.1,-.02,.115,.05,wood);guard(-.04,-.03,.075);bx(.006,.018,.004,st,0,-.034,-.015).rotation.x=.25;
      muzzle(.215,.024,.0115);optic(-.01,.048);under(.1,-.014);
      put('gR',V(0,-.07,-.11));put('wR',V(0,.05,-.075));put('gL',V(-.012,-.08,-.09));put('wL',V(-.045,.04,-.06))}break;
    case 8:{                                               // PISTOLET-MITRAILLEUR (carter tubulaire, chargeur droit, crosse télescopique)
      px([[-.2,.036],[.1,.036],[.1,-.03],[-.2,-.03]],.04,bm);px([[-.2,.036],[.1,.04],[.1,.03],[-.2,.03]],.044,st);screws([-.15,-.02,.06],.0);bx(.008,.02,.03,st,.024,.012,-.04);
      zc(.019,.019,.22,bm,0,.0,.1);for(let i=0;i<8;i++)bx(.04,.004,.006,mat('#0b0b0b'),0,.0,.14+i*.02);zc(.009,.009,.12,steel,0,.0,.32);bx(.014,.03,.02,st,0,.03,.4);bx(.012,.022,.012,st,0,.04,-.18);
      px([[.1,.026],[.32,.022],[.32,-.026],[.1,-.03]],.046,furn);pgrip(-.03,-.03,.115,.05,furn);guard(-.005,-.04,.1);
      const mc=[.17,.24,.0,.17][s.wMag];
      if(s.wMag===2){const d=mk(new THREE.CylinderGeometry(.07,.07,.05,20),st,0,-.12,.05,wg);d.rotation.z=Math.PI/2}
      else{px([[.03,-.03],[.075,-.03],[.085,-.03-mc],[.04,-.03-mc]],.028,st);for(let i=1;i<5;i++)bx(.03,.003,.004,mat('#0e0e0e'),0,-.03-i*mc/5,.055);if(s.wMag===3)bx(.028,mc,.04,st,.032,-.03-mc/2,.06)}
      stockP(-.2,.0,.26,.09);muzzle(.44,.0,.009);optic(-.02,.04);under(.28,-.032);
      put('gR',V(0,-.09,-.05));put('wR',V(0,.05,-.075));put('gL',V(0,-.015,.15));put('wL',V(0,.02,-.07))}break;
    case 9:{                                               // CARABINE M4 (rail supérieur, garde-main rond, poignée A2, crosse rétractable)
      px([[-.2,.026],[.12,.026],[.12,-.03],[-.2,-.03]],.036,bm);px([[-.16,-.03],[.12,-.03],[.1,-.06],[-.05,-.06],[-.12,-.045]],.034,bm);rail(-.2,.2,.032);
      bx(.005,.02,.006,st,0,.056,.18);bx(.005,.02,.006,st,0,.056,-.16);screws([-.12,-.02,.08],.0);
      zc(.0275,.0275,.28,bm,0,.0,.1);for(let i=0;i<7;i++)zc(.029,.029,.004,st,0,.0,.12+i*.035);rail(.12,.36,.0275+.0);
      zc(.0085,.0085,.2,steel,0,.0,.36);bx(.016,.028,.02,st,0,.016,.4);pgrip(-.045,-.06,.1,.05,furn);guard(-.015,-.06,.1);
      const mc=[.13,.19,0,.13][s.wMag];
      if(s.wMag===2){const d=mk(new THREE.CylinderGeometry(.065,.065,.06,20),st,0,-.14,.04,wg);d.rotation.z=Math.PI/2}
      else{px([[.01,-.06],[.045,-.06],[.06,-.06-mc],[.025,-.06-mc]],.03,st);for(let i=1;i<5;i++)bx(.032,.003,.004,mat('#0e0e0e'),0,-.06-i*mc/5,.03);if(s.wMag===3)bx(.03,mc,.036,st,.034,-.06-mc/2,.02)}
      stockP(-.2,-.01,.28,.09);muzzle(.56,.0,.0095);optic(-.03,.032);under(.22,-.03);
      put('gR',V(0,-.1,-.05));put('wR',V(0,.05,-.075));put('gL',V(0,-.02,.17));put('wL',V(0,.02,-.07))}break;
    case 10:{                                              // FUSIL À LEVIER (carcasse acier, crosse et fût bois, levier de sous-garde, tube-magasin)
      px([[-.1,.04],[.12,.04],[.12,-.03],[-.1,-.04]],.034,bm);bx(.012,.02,.03,steel,.02,.02,-.04);bx(.01,.02,.03,steel,0,.044,-.1);
      px([[-.03,-.04],[.06,-.04],[.065,-.1],[-.04,-.115],[-.05,-.07]],.008,steel);
      zc(.0105,.0095,.62,steel,0,.02,.12);zc(.0085,.0085,.5,st,0,-.015,.12);bx(.004,.014,.005,st,0,.036,.72);bx(.01,.016,.02,st,0,.036,-.02);
      px([[.12,.0],[.42,.0],[.42,-.044],[.12,-.044]],.044,wood);px([[-.1,.035],[-.32,.02],[-.6,.0],[-.6,-.12],[-.38,-.1],[-.2,-.07],[-.1,-.04]],.04,wood);bx(.042,.12,.014,mat('#0f0f0f',{roughness:.9}),0,-.06,-.6);
      muzzle(.74,.02,.0105);optic(-.02,.046);
      put('gR',V(0,-.085,-.09));put('wR',V(0,.05,-.075));put('gL',V(0,-.025,.08));put('wL',V(0,.03,-.07))}break;
    case 11:{                                              // MACHETTE (lame longue extrudée, poignée cordée, garde)
      zc(.0165,.015,.14,leather('#1a1512',.6),0,0,-.14);for(let i=0;i<6;i++)zc(.0175,.0175,.004,mat('#0a0a0a'),0,0,-.13+i*.02);ell(.019,.019,.014,steel,0,0,-.145,wg);bx(.05,.016,.012,steel,0,0,.0);
      const t=s.wMuzzle,P=[[[0,.03],[.46,.03],[.5,.0],[.46,-.012],[0,-.012]],[[0,.03],[.3,.04],[.46,.034],[.52,-.01],[.46,-.012],[0,-.012]],[[0,.025],[.2,.05],[.38,.048],[.5,0],[.38,-.014],[0,-.012]],null,[[0,.03],[.4,.03],[.52,.0],[.44,-.01],[0,-.012]]];
      let pts=P[t];if(!pts){pts=[[0,.03],[.46,.03],[.5,.0],[.46,-.012]];for(let i=0;i<8;i++)pts.push([.44-i*.055,i%2?-.006:-.016]);pts.push([0,-.012])}
      const sh2=new THREE.Shape();sh2.moveTo(pts[0][0],pts[0][1]);pts.slice(1).forEach(p=>sh2.lineTo(p[0],p[1]));
      const g=new THREE.ExtrudeGeometry(sh2,{depth:.005,bevelEnabled:true,bevelThickness:.0013,bevelSize:.0013,bevelSegments:1});g.translate(0,0,-.0025);g.rotateY(-Math.PI/2);
      mk(g,gunPaint(fin==='#1b1b1d'?'#2a2c2e':fin),0,0,.008,wg);bx(.0018,.003,.4,metal('#d8dbd7',.15),0,-.011,.2);
      put('gR',V(0,0,-.08));put('wR',V(0,0,-.075))}break;
    case 12:{                                              // LANCE-ROQUETTES (tube, venturi évasé, protection thermique bois, ogive, poignées)
      zc(.03,.03,.95,bm,0,0,-.5);zc(.062,.032,.14,st,0,0,-.66);zc(.066,.066,.012,steel,0,0,-.67);for(let i=0;i<6;i++){const q=i/6*6.283;bx(.004,.01,.1,st,Math.cos(q)*.045,Math.sin(q)*.045,-.62)}
      zc(.0395,.0395,.3,woodMat(),0,0,-.08);zc(.042,.042,.01,steel,0,0,-.08);zc(.042,.042,.01,steel,0,0,.22);
      zc(.034,.034,.1,st,0,0,.45);const og=mk(new THREE.CylinderGeometry(.012,.055,.3,24),st,0,0,.65,wg);og.rotation.x=Math.PI/2;zc(.055,.055,.18,mat('#4a5a3a',{roughness:.6,metalness:.4}),0,0,.45);zc(.014,.014,.02,steel,0,0,.8);
      pgrip(-.1,-.03,.11,.05,furn);guard(-.08,-.04,.09);pgrip(.05,-.036,.1,.0,furn);bx(.004,.03,.004,st,0,.04,.3);optic(.0,.034);
      put('gR',V(0,-.085,-.12));put('wR',V(0,.05,-.075));put('gL',V(0,-.085,.05));put('wL',V(0,.05,-.07))}break;}
  if(ENG[k])engr(...ENG[k]);
  return R}

export {gunModel};
