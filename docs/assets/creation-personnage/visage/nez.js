/* LAST REFUGE · XM — Nez (9 modèles).
   Module extrait de createur-personnage-3d+armes.html (partagé par le créateur et l’escape room). */
import {ell,limb} from '../outils/outils-3d.js';

const NOSE=[{l:.022,w:.012,t:.011},{l:.03,w:.014,t:.013},{l:.04,w:.013,t:.012},{l:.03,w:.02,t:.016},{l:.04,w:.011,t:.009},{l:.026,w:.013,t:.012,up:.01},{l:.036,w:.013,t:.012,hook:.007},{l:.014,w:.019,t:.014},{l:.028,w:.017,t:.019}];
function nose(C){
  const n=NOSE[C.s.nose],{head,H}=C,y1=-.022+(n.up||0),y0=.03,zt=H.surf(0,y1)+n.l;
  limb([0,y0,H.surf(0,y0)+.004],[0,y1+.004,zt-.004],n.w*.6,n.w*.9,C.skin,head);
  if(n.hook)ell(n.w*.5,n.w*.5,n.w*.5,C.skin,0,y0-.012,H.surf(0,y0-.012)+n.l*.55+n.hook,head);
  ell(n.t,n.t*.85,n.t*.9,C.skin,0,y1,zt-n.t*.3,head);
  for(const side of[-1,1])ell(n.t*.55,n.t*.5,n.t*.5,C.skinD,side*n.w*.95,y1+.002,zt-n.t*.7,head)}

export {NOSE,nose};
