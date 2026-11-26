/* LAST REFUGE · XM — Détails des bras : bandages, brassards, montres, tatouages…
   Module extrait de createur-personnage-3d+armes.html (partagé par le créateur et l’escape room). */
import * as THREE from 'three';
import {leather,metal} from '../materiaux/materiaux.js';
import {TEXC,box,clamp,cvs,cyl,ell,glowM,mat,mk,mkTex} from '../outils/outils-3d.js';

function tattooMat(){
  if(TEXC.has('tat'))return TEXC.get('tat');
  const c=cvs(256,256),x=c.getContext('2d');x.strokeStyle='rgba(25,38,60,.85)';x.lineWidth=5;x.lineCap='round';
  for(let i=0;i<14;i++){x.beginPath();const y=i*18+6;x.moveTo(0,y);for(let k=1;k<=8;k++)x.quadraticCurveTo(k*32-16,y+(k%2?14:-14),k*32,y);x.stroke()}
  for(let i=0;i<8;i++){x.beginPath();x.arc(30+i*30,128+Math.sin(i)*50,10,0,6.3);x.stroke()}
  const t=mkTex(c,1,1);const m=new THREE.MeshStandardMaterial({map:t,transparent:true,roughness:.7,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2});TEXC.set('tat',m);return m}
function armWear(C,a){
  const k=C.s.arms;if(!k)return;const{ag,eg,side}=a,P=C.P,white=mat('#e6e2d4',{roughness:.9}),blood=mat('#7a1010',{roughness:.6}),dk=mat('#1b1b1b',{roughness:.5,metalness:.3}),lea=leather('#3a2a1a',.6),rf=y=>P.arm*(.85-.23*clamp(-y/.27,0,1));
  switch(k){
    case 1:for(let i=0;i<6;i++){const y=-.05-i*.04;const o=cyl(rf(y)+.006,rf(y-.04)+.006,.045,white,0,y-.02,0,eg,12);o.rotation.z=(i%2?.08:-.08)}ell(.012,.02,.008,blood,side*(rf(-.1)+.006),-.1,.01,eg);break;
    case 2:cyl(P.arm+.009,P.arm*.95,.075,mat('#b02020',{roughness:.8}),0,-.12,0,ag,14);box(.004,.045,.014,white,side*(P.arm+.011),-.12,0,ag);box(.004,.014,.045,white,side*(P.arm+.011),-.12,0,ag);break;
    case 3:if(side<0){const t=mk(new THREE.TorusGeometry(P.arm*.68,.006,6,16),dk,0,-.22,0,eg);t.rotation.x=Math.PI/2;box(.03,.008,.03,metal('#9a9d98',.3),0,-.22,P.arm*.7,eg);box(.022,.003,.022,glowM('#6fffa0',.8),0,-.215,P.arm*.7+.005,eg)}break;
    case 4:cyl(P.arm*.72,P.arm*.7,.07,lea,0,-.225,0,eg,14);for(let i=0;i<5;i++)ell(.004,.004,.004,metal('#c8c8c0',.3),Math.cos(i/5*6.28)*P.arm*.72,-.225,Math.sin(i/5*6.28)*P.arm*.72,eg);break;
    case 5:ell(P.arm*1.2,.055,P.arm*1.2,dk,0,0,.005,eg);cyl(P.arm*.9,P.arm*.9,.025,mat('#2a2a28'),0,-.07,0,eg,12);break;
    case 6:[-.215,-.245].forEach(y=>{const t=mk(new THREE.TorusGeometry(P.arm*.66,.006,6,16),metal('#b0b3ae',.25),0,y,0,eg);t.rotation.x=Math.PI/2});break;
    case 7:cyl(P.arm*.86+.0015,P.arm*.64+.0015,.27,tattooMat(),0,-.135,0,eg,18,true);cyl(P.arm+.0015,P.arm*.87+.0015,.3,tattooMat(),0,-.15,0,ag,18,true);break;
    case 8:cyl(P.arm*.9,P.arm*.68,.21,dk,0,-.13,0,eg,12,true);[-.05,-.15].forEach(y=>cyl(P.arm*.92-(y<-.1?.03:0),P.arm*.92-(y<-.1?.03:0),.02,mat('#3a3a36'),0,y,0,eg,12));box(.04,.12,.012,metal('#555',.4),0,-.1,P.arm*.9,eg);break}}

export {tattooMat,armWear};
