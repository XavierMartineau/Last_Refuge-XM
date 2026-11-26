/* LAST REFUGE · XM — Barbes et moustaches (10 modèles).
   Module extrait de createur-personnage-3d+armes.html (partagé par le créateur et l’escape room). */
import {chain,ell,mat,tube} from '../outils/outils-3d.js';
import {shell} from '../tete/tete.js';

const JAW=(x,y,z)=>y<-.2&&y>-.99&&z>-.2&&(z>.1||Math.abs(x)>.55)&&!(Math.abs(x)<.3&&y>-.55&&y<-.36&&z>.4);
function beard(C){
  const b=C.s.beard;if(C.fem||!b)return;const{head,H}=C,m=C.hairM,fine=mat(C.hairHex,{roughness:.9,transparent:true,opacity:.5,depthWrite:false});
  const stache=()=>{for(const side of[-1,1]){const pts=[];for(let i=0;i<=4;i++){const t=i/4,x=side*(.004+.034*t),y=-.047-.012*t*t;pts.push([x,y,H.surf(x,y)+.007])}tube(pts,.0065,m,head,10,6)}};
  const chin=(w,h)=>ell(w,h,w*.9,m,0,-.125,H.surf(0,-.125)-.002,head);
  switch(b){
    case 1:head.add(shell(H,JAW,.003,fine));break;
    case 2:stache();break;
    case 3:chin(.018,.026);break;
    case 4:head.add(shell(H,JAW,.012,m));break;
    case 5:head.add(shell(H,JAW,.02,m));stache();chin(.03,.03);break;
    case 6:head.add(shell(H,JAW,.02,m));stache();chain([[0,-.13,.08],[0,-.2,.09],[0,-.29,.1],[0,-.37,.1]],.04,.006,m,head);break;
    case 7:head.add(shell(H,(x,y,z)=>Math.abs(x)>.7&&y<.1&&y>-.55&&z>-.2,.014,m));stache();break;
    case 8:head.add(shell(H,(x,y,z)=>y<-.2&&y>-.99&&z>-.2&&(Math.abs(x)>.75||y<-.78),.013,m));break;
    case 9:chin(.016,.022);for(const side of[-1,1])chain([[side*.012,-.14,.1],[side*.016,-.22,.115],[side*.012,-.3,.12],[side*.006,-.37,.11]],.012,.006,m,head);break}}

export {JAW,beard};
