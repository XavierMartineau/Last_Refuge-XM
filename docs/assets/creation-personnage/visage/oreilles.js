/* LAST REFUGE · XM — Oreilles (humaines, pointues, félines).
   Module extrait de createur-personnage-3d+armes.html (partagé par le créateur et l’escape room). */
import {ell,mat,spike} from '../outils/outils-3d.js';
import {R} from '../tete/tete.js';

function ears(C){
  const{head,H,sp}=C;if(sp.ears==='none')return;
  for(const side of[-1,1]){const x=side*R*H.sx*.96;
    if(sp.ears==='pointed'){const o=spike([x,-.005,-.012],[side*.9,.45,0],.026,.1,C.skin,head)}
    else if(sp.ears==='cat'){spike([side*.075,.115,-.01],[side*.35,1,0],.045,.1,C.skin,head);spike([side*.075,.118,-.005],[side*.35,1,0],.028,.085,mat('#d98a98'),head)}
    else{const e=ell(.012,.03,.021,C.skin,x+side*.006,-.012,-.012,head);e.rotation.z=side*.1}}}

export {ears};
