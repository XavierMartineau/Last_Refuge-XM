/* LAST REFUGE · XM — Assemblage d’un personnage complet à partir de son état JSON.
   Module extrait de createur-personnage-3d+armes.html (partagé par le créateur et l’escape room). */
import * as THREE from 'three';
import {buildWeapon} from '../armes/prise-en-main.js';
import {beard} from '../barbes/barbes.js';
import {armWear} from '../bras/details-bras.js';
import {hair} from '../cheveux/cheveux.js';
import {buildBody} from '../corps/corps.js';
import {headwear} from '../couvre-chefs/couvre-chefs.js';
import {extras} from '../details-visage/details-visage.js';
import {D} from '../donnees/donnees.js';
import {sanitize} from '../donnees/selection.js';
import {gearBuild} from '../equipement/equipement.js';
import {SPX} from '../especes/especes.js';
import {specials} from '../especes/particularites.js';
import {glasses} from '../lunettes/lunettes.js';
import {skinMat} from '../materiaux/materiaux.js';
import {grp,mat,mk,safe,seed,setSeed,sh} from '../outils/outils-3d.js';
import {backpack} from '../sacs-a-dos/sacs-a-dos.js';
import {buildOutfit} from '../tenues/hauts.js';
import {flushDecals} from '../tete/decalques.js';
import {makeHead} from '../tete/tete.js';
import {mouth} from '../visage/bouche.js';
import {nose} from '../visage/nez.js';
import {ears} from '../visage/oreilles.js';
import {brows} from '../visage/sourcils.js';
import {eyes} from '../visage/yeux.js';

function buildCharacter(raw,opt={}){
  const s=sanitize(raw),g=s.gender,fem=g==='female',root=new THREE.Group(),sp=g==='other'?(SPX[s.species]||{}):{};
  setSeed(7+s.hair*13+s.beard*5+s.skin);                                  // aléatoire stable
  const C={s,g,fem,sp,root,opt,anim:[],tex:[],dc:{},eyes:[],mats:new Set()};
  const skinHex=D.HUMAN[s.skin]||D.HUMAN[0],spSkin=g==='other'?(D.FANT[s.skin]||skinHex):skinHex;
  const base=g==='other'?spSkin:skinHex;
  C.skinHex=sp.zombie?'#8da07a':base;C.hairHex=D.HAIRCOL[s.hairColor]||'#3a2a1a';C.mainHex=D.OUTCOL[s.outfitColor]||'#556b4a';
  C.skin=skinMat(C.skinHex),C.skinD=skinMat(sh(C.skinHex,-.25));
  C.hairM=new THREE.MeshPhysicalMaterial({color:C.hairHex,roughness:.5,sheen:1,sheenColor:new THREE.Color(C.hairHex).lerp(new THREE.Color('#ffffff'),.35),sheenRoughness:.4,clearcoat:.25,clearcoatRoughness:.35});C.hairD=mat(sh(C.hairHex,-.12),{roughness:.6,side:THREE.DoubleSide});
  const sc=sp.scale||1,body=C.body=grp(0,0,0,root),H=C.H=makeHead(s.face,fem);
  if(sp.scale)root.scale.setScalar(sc);
  C.opt={...opt};
  safe(()=>buildBody(C),'corps');
  // tête
  const head=C.head=grp(0,1.58,0,body),face=mk(H.geo,C.skin,0,0,0,head);C.faceMesh=face;
  head.scale.setScalar(1);
  safe(()=>ears(C),'oreilles');safe(()=>eyes(C),'yeux');safe(()=>brows(C),'sourcils');
  if(!sp.cyclops||true)safe(()=>nose(C),'nez');safe(()=>mouth(C),'bouche');
  safe(()=>beard(C),'barbe');safe(()=>hair(C),'cheveux');safe(()=>glasses(C),'lunettes');safe(()=>headwear(C),'couvre-chef');
  safe(()=>extras(C),'détail');safe(()=>buildOutfit(C),'tenue');safe(()=>gearBuild(C),'équipement');safe(()=>backpack(C),'sac à dos');safe(()=>C.arms.forEach(a=>armWear(C,a)),'bras');safe(()=>buildWeapon(C),'arme');
  if(g==='other')safe(()=>specials(C),'particularités');
  safe(()=>flushDecals(C),'décalques');
  // respiration + léger balancement de la tête
  C.walk={phase:0,amt:0};C.pitch=0;
  C.anim.push(t=>{const w=C.walk,sw=Math.sin(w.phase);
    body.position.y=Math.sin(t*1.6)*.003+Math.abs(Math.cos(w.phase))*.015*w.amt;head.rotation.y=Math.sin(t*.5)*.08*(1-w.amt);head.rotation.x=Math.sin(t*.7)*.02+C.pitch;
    C.arms.forEach(a=>{if(a.posed)return;a.ag.rotation.x=Math.sin(t*1.2+a.side)*.03*(1-w.amt)-a.side*sw*.55*w.amt;a.eg.rotation.x=-.14-w.amt*Math.max(0,a.side*sw)*.5});
    (C.legs||[]).forEach(l=>{l.lg.rotation.x=l.side*sw*.6*w.amt;l.kn.rotation.x=Math.max(0,l.side*Math.cos(w.phase))*.8*w.amt})});
  root.userData.setWalk=(p,a)=>{C.walk.phase=p;C.walk.amt=a};root.userData.setPitch=p=>{C.pitch=p};
  // clignement des yeux
  let nextB=2;C.anim.push(t=>{if(t>nextB){nextB=t+2+Math.random()*4}const b=t>nextB-.14&&t<nextB?.1:1;C.eyes.forEach(e=>e.scale.y=b)});
  // ombre douce au sol
  root.userData.update=t=>C.anim.forEach(f=>f(t));
  root.userData.dispose=()=>{root.traverse(o=>{if(o.geometry&&o!==face)o.geometry.dispose()});C.tex.forEach(t=>t.dispose());H.geo.dispose()};
  return root}

export {buildCharacter};
