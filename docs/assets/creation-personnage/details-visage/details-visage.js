/* LAST REFUGE · XM — Détails du visage (16 modèles) : taches, cicatrices, piercings, masques…
   Module extrait de createur-personnage-3d+armes.html (partagé par le créateur et l’escape room). */
import {metal} from '../materiaux/materiaux.js';
import {box,ell,mat,tube} from '../outils/outils-3d.js';
import {dDot,dPoly,dStroke,dctx} from '../tete/decalques.js';
import {R,shell} from '../tete/tete.js';

function extras(C){
  const k=C.s.extra;if(!k)return;const{head,H}=C,ctx=dctx(C);
  switch(k){
    case 1:for(const[x,y]of[[-.04,-.01],[-.055,-.025],[-.03,-.03],[-.065,-.01],[.04,-.01],[.055,-.025],[.03,-.03],[.065,-.01],[0,-.012],[-.02,-.015],[.02,-.015]])dDot(C,ctx,x,y,.0035,'rgba(150,80,40,.7)');break;
    case 2:dStroke(C,ctx,[[.06,.07],[.075,.03],[.09,-.02]],'rgba(130,40,40,.9)',.006);for(let i=0;i<3;i++)dStroke(C,ctx,[[.06+i*.012,.045-i*.02],[.085+i*.012,.04-i*.02]],'rgba(150,60,60,.85)',.003);break;
    case 3:dPoly(C,ctx,[[.07,-.01],[.115,-.01],[.115,-.04],[.07,-.04]],'rgba(240,200,170,.95)','rgba(130,90,70,.9)');dStroke(C,ctx,[[.075,-.025],[.11,-.025]],'rgba(150,100,80,.8)',.002);break;
    case 4:for(const s of[-1,1]){const x=s*R*H.sx*.96;ell(.006,.006,.006,metal('#d8b030',.2),x,-.045,-.005,head)}break;
    case 5:ell(.0045,.0045,.0045,metal('#d8d8d8',.2),.03,-.027,H.surf(.03,-.027)+.012,head);break;
    case 6:for(let i=0;i<5;i++)dStroke(C,ctx,[[-.11,.0+i*.012],[-.085,.02+i*.01],[-.06,.0+i*.012]],'rgba(30,60,110,.75)',.003);break;
    case 7:dStroke(C,ctx,[[-.09,.015],[-.04,.025],[.04,.025],[.09,.015]],'rgba(200,40,30,.85)',.014);dStroke(C,ctx,[[-.09,-.02],[.09,-.02]],'rgba(240,240,230,.85)',.01);break;
    case 8:head.add(shell(H,(x,y,z)=>y<-.12&&y>-.7&&z>.1,.008,mat('#d8e6ee',{roughness:.8})));break;
    case 9:{const sc=mat('#a02828',{roughness:.9});tube([[-.14,-.2,.05],[-.1,-.23,.12],[0,-.25,.14],[.1,-.23,.12],[.14,-.2,.05]],.025,sc,head,18,8);ell(.03,.06,.025,sc,.07,-.3,.1,head)}break;
    case 10:for(const s of[-.04,.04])ell(.0035,.0035,.0035,metal('#d8d8d8',.3),s,-.2,.14,C.body);{const chn=[[-.07,0,0],[-.06,-.03,.03],[0,-.06,.05],[.06,-.03,.03],[.07,0,0]];tube(chn.map(p=>[p[0],1.38+p[1],.1+p[2]]),.003,metal('#d8d8d8',.3),C.body,12,5);box(.04,.06,.004,metal('#d8d8d8',.3),0,1.3,.115,C.body)}break;
    case 11:dDot(C,ctx,-.05,-.005,.02,'rgba(60,40,80,.35)',.5);dDot(C,ctx,.05,-.005,.02,'rgba(60,40,80,.35)',.5);break;
    case 12:dStroke(C,ctx,[[-.05,-.015],[-.052,-.035]],'rgba(30,70,140,.85)',.004);dDot(C,ctx,-.052,-.04,.005,'rgba(30,70,140,.85)');break;
    case 13:dStroke(C,ctx,[[-.12,.1],[-.09,.12],[-.05,.1]],'rgba(240,240,230,.9)',.016);dStroke(C,ctx,[[-.1,.03],[-.12,.0]],'rgba(240,240,230,.9)',.014);break;
    case 14:for(let i=0;i<3;i++)dStroke(C,ctx,[[.03+i*.014,.01],[.05+i*.014,-.05]],'rgba(160,30,30,.85)',.0035);break;
    case 15:ell(.005,.005,.005,metal('#d8d8d8',.3),.07,.085,H.surf(.07,.085)+.004,head);ell(.005,.005,.005,metal('#d8d8d8',.3),.07,.07,H.surf(.07,.07)+.004,head);break;
    case 16:{const sc=mat('#7a4a8a',{roughness:.9});tube([[-.13,-.18,.05],[-.1,-.22,.12],[0,-.23,.14],[.1,-.22,.12],[.13,-.18,.05]],.03,sc,head,18,8)}break;
  }}

export {extras};
