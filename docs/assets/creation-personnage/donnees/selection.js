/* LAST REFUGE · XM — Sélection et validation d’un personnage (JSON compatible avec la version 2D).
   Module extrait de createur-personnage-3d+armes.html (partagé par le créateur et l’escape room). */
import {WALT,WCTX,WLAB} from '../armes/donnees-armes.js';
import {D,DEF,GENDERS,LABEL,LEN,NAMES} from './donnees.js';

const REGS=g=>({...(g==='other'?{species:LEN.species,specialBack:4,specialHead:4,specialFace:4}:{}),skin:LEN.skin,face:LEN.face,eyes:LEN.eyes,eyeColor:LEN.eyeColor,brows:LEN.brows,nose:LEN.nose,mouth:LEN.mouth,...(g==='female'?{}:{beard:LEN.beard}),
  hair:LEN.hair[g],hairColor:LEN.hairColor,outfit:LEN.outfit,outfitColor:LEN.outfitColor,camo:LEN.camo,pants:LEN.pants,pantsColor:LEN.pantsColor,boots:LEN.boots,bootsColor:LEN.bootsColor,gloves:LEN.gloves,glovesColor:LEN.glovesColor,arms:LEN.arms,gear:LEN.gear,backpack:LEN.backpack,weapon:LEN.weapon,wMuzzle:LEN.wMuzzle,wOptic:LEN.wOptic,wUnder:LEN.wUnder,wStock:LEN.wStock,wMag:LEN.wMag,wFinish:LEN.wFinish,glasses:LEN.glasses,headwear:LEN.headwear,accColor:LEN.accColor,extra:LEN.extra,background:LEN.background,pattern:LEN.pattern,nameFont:LEN.nameFont,nameColor:LEN.nameColor,nameStyle:LEN.nameStyle,nameSize:LEN.nameSize,namePos:LEN.namePos});
function choiceName(k,i,g){
  if(k==='hair')return NAMES.hair[g][i];
  if(k==='species')return D.SPNAMES[i];
  if(WALT[k]&&WALT[k][WCTX.w])return WALT[k][WCTX.w][i];
  if(k==='pattern')return D.PNAMES[i];if(k==='nameFont')return D.NFONTS[i][0];if(k==='nameStyle')return D.NSTYLE[i];if(k==='nameSize')return D.NSIZE[i];if(k==='namePos')return D.NPOS[i];
  if(NAMES[k])return NAMES[k][i]??('Choix '+(i+1));
  return 'Choix '+(i+1)}
function sanitize(raw){            // même validation que la version 2D
  const g=GENDERS[raw?.gender]?raw.gender:'male',reg=REGS(g),o={gender:g};
  for(const k in reg){const v=raw?.[k];o[k]=Number.isInteger(v)&&v>=0&&v<reg[k]?v:(DEF[k]<reg[k]?DEF[k]:0)}
  o.name=typeof raw?.name==='string'?raw.name.slice(0,20):'';return o}
const labelOf=k=>(WLAB[k]&&WLAB[k][WCTX.w])||LABEL[k];

export {REGS,choiceName,sanitize,labelOf};
