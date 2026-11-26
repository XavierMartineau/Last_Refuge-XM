/* LAST REFUGE · XM — Coiffures : 14 (homme), 13 (femme), 10 (autres).
   Module extrait de createur-personnage-3d+armes.html (partagé par le créateur et l’escape room). */
import * as THREE from 'three';
import {chain,ell,mat,mk,rnd,sh,spike} from '../outils/outils-3d.js';
import {R,shell} from '../tete/tete.js';

const HSEQ={male:[null,'short','buzz','undercut','spiky','pomp','quiff','mid','long','pony','bun','mohawk','afro','curly'],
  female:[null,'short','bob','bobLong','long','curlyLong','pony','pigtails','bun','braids','bangsLong','mid','afro'],
  other:[null,'short','spiky','mohawk','long','bun','braids','afro','curly','pony']};
const hcap=(C,f,b,off)=>C.head.add(shell(C.H,(x,y,z)=>y>(z>0?f:b)&&!(Math.abs(x)>.9&&y<.15),off,C.hairM));
const hback=(C,len,top=.03)=>{const r=R*C.H.sx*1.02,o=mk(new THREE.CylinderGeometry(r,r*.92,len,24,1,true,Math.PI*.5-.45,Math.PI+.9),C.hairD,0,top-len/2,0,C.head);o.scale.z=C.H.sz*.98;return o};
const hring=(C,len)=>{const r=R*C.H.sx*1.05,o=mk(new THREE.CylinderGeometry(r,r*1.03,len,24,1,true,.55,Math.PI*2-1.1),C.hairD,0,.01-len/2,0,C.head);o.scale.z=C.H.sz*1.0;return o};
function capPts(n,ymin){const a=[];for(let i=0;i<n;i++){const uy=ymin+(.98-ymin)*rnd(),r=Math.sqrt(1-uy*uy),an=rnd()*Math.PI*2;a.push([r*Math.cos(an),uy,r*Math.sin(an)])}return a}
function spikesAt(C,pts,len,r,m=C.hairM){for(const p of pts){const l=Math.hypot(p[0],p[1],p[2]),d=[p[0]/l,p[1]/l,p[2]/l],q=C.H.def(d[0],d[1],d[2]);spike([q[0]-d[0]*.01,q[1]-d[1]*.01,q[2]-d[2]*.01],d,r,len,m,C.head)}}
const midline=(n,a0,a1)=>{const a=[];for(let i=0;i<n;i++){const t=a0+(a1-a0)*i/(n-1);a.push([0,Math.sin(t),Math.cos(t)])}return a};
const HS={
  buzz:C=>hcap(C,.35,-.1,.008),
  short:C=>hcap(C,.3,-.2,.02),
  undercut:C=>{hcap(C,.32,.25,.022);ell(.1,.055,.12,C.hairM,0,.125,.005,C.head)},
  spiky:C=>{hcap(C,.3,-.15,.016);spikesAt(C,capPts(18,.3),.07,.02)},
  pomp:C=>{hcap(C,.3,-.1,.02);const o=ell(.11,.07,.14,C.hairM,0,.145,.045,C.head);o.rotation.x=-.2},
  quiff:C=>{hcap(C,.3,-.1,.02);const o=ell(.1,.06,.11,C.hairM,0,.15,.07,C.head);o.rotation.x=-.35},
  mid:C=>{hcap(C,.25,-.45,.03);hback(C,.12)},
  long:C=>{hcap(C,.22,-.6,.03);hback(C,C.fem?.46:.34);if(C.fem)for(const side of[-1,1])ell(.026,.17,.02,C.hairM,side*.125,-.1,.04,C.head)},
  curlyLong:C=>{HS.curly(C);hback(C,.34);for(const side of[-1,1])ell(.03,.16,.03,C.hairM,side*.125,-.08,.03,C.head)},
  bangsLong:C=>{hcap(C,.08,-.6,.03);hback(C,.4)},
  bob:C=>{hcap(C,.25,-.4,.03);hring(C,.12)},
  bobLong:C=>{hcap(C,.25,-.4,.03);hring(C,.22)},
  pony:C=>{hcap(C,.28,-.3,.025);const m=C.hairM;chain([[0,.08,-.13],[0,.03,-.2],[0,-.06,-.23],[0,-.18,-.21],[0,-.3,-.18]],.034,.012,m,C.head);ell(.04,.02,.04,mat(sh(C.hairHex,-.4)),0,.075,-.13,C.head)},
  bun:C=>{hcap(C,.28,-.3,.025);ell(.065,.06,.065,C.hairM,0,.15,-.07,C.head)},
  pigtails:C=>{hcap(C,.28,-.3,.025);for(const side of[-1,1]){chain([[side*.11,.08,-.05],[side*.15,.0,-.07],[side*.16,-.1,-.06],[side*.15,-.2,-.04]],.032,.014,C.hairM,C.head);ell(.03,.02,.03,mat('#c0392b'),side*.115,.08,-.05,C.head)}},
  braids:C=>{hcap(C,.25,-.5,.028);for(const side of[-1,1])for(let i=0;i<7;i++)ell(.022,.03,.02,C.hairM,side*(.115+.004*i),-.03-i*.045,.05+.012*i,C.head)},
  mohawk:C=>{hcap(C,.62,.55,.012);spikesAt(C,midline(9,.55,2.7),.1,.026)},
  afro:C=>{ell(.2,.19,.17,C.hairM,0,.06,-.03,C.head)},
  curly:C=>{hcap(C,.28,-.3,.022);for(const p of capPts(46,.2)){const q=C.H.def(p[0],p[1],p[2]);ell(.024,.024,.024,C.hairM,q[0]*1.07,q[1]*1.07,q[2]*1.07,C.head)}}
};
function hair(C){const k=HSEQ[C.g][C.s.hair];if(k)HS[k](C)}

export {HSEQ,hcap,hback,hring,capPts,spikesAt,midline,HS,hair};
