// Nom (texte SVG)
const creatorMotionQuery=window.matchMedia('(prefers-reduced-motion: reduce)');
function applyCreatorMotion(){
  document.documentElement.dataset.motion=creatorMotionQuery.matches?'off':window.afterlockPreferences.load().motion;
}
creatorMotionQuery.addEventListener('change',applyCreatorMotion);
window.addEventListener('storage',applyCreatorMotion);
applyCreatorMotion();

function nameSvg(s){
 const t=(s.name||'').trim(); if(!t)return '';
 const fs=[20,26,32,40][s.nameSize], y=s.namePos?fs+16:344, col=NCOL[s.nameColor], ff=NFONTS[s.nameFont][1];
 const esc=t.replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m])), long=t.length*fs*.6>280, bw=Math.min(280,t.length*fs*.6+30);
 const T=x=>`<text x="150" y="${y}" text-anchor="middle" font-family="${ff}" font-size="${fs}" font-weight="700"${long?' textLength="280" lengthAdjust="spacingAndGlyphs"':''} ${x}>${esc}</text>`;
 return [
  T(`fill="${col}" stroke="${OL}" stroke-width="4" paint-order="stroke" stroke-linejoin="round"`),
  T(`fill="#000" fill-opacity=".4" transform="translate(3 3)"`)+T(`fill="${col}"`),
  T(`fill="${col}" stroke="${OL}" stroke-width="8" paint-order="stroke" stroke-linejoin="round"`),
  `<rect x="${150-bw/2}" y="${y-fs}" width="${bw}" height="${fs*1.3}" rx="8" fill="#000" fill-opacity=".55"/>`+T(`fill="${col}"`),
  `<filter id="nb"><feGaussianBlur stdDeviation="4"/></filter>`+T(`fill="none" stroke="${col}" stroke-width="7" filter="url(#nb)"`)+T(`fill="#fff" stroke="${col}" stroke-width="1.5" paint-order="stroke"`),
  T(`fill="${col}"`)][s.nameStyle];
}
// Listes par type : seules ces entrées changent entre homme / femme / autres
const REGS=g=>({...(g==='other'?{species:SPECIES,specialBack:SPECIAL_BACK,specialHead:SPECIAL_HEAD,specialFace:SPECIAL_FACE}:{}),skin:g==='other'?FANT:HUMAN,face:FACES,eyes:EYES,eyeColor:EYECOL,brows:BROWS,nose:NOSE,mouth:MOUTH,...(g==='female'?{}:{beard:BEARD}),
 hair:HAIRS[g],hairColor:HAIRCOL,outfit:OUTFITS[g],outfitColor:OUTCOL,glasses:GLASSES,headwear:HEAD,accColor:ACCCOL,extra:EXTRA,background:BGS,pattern:PAT,nameFont:NFONTS,nameColor:NCOL,nameStyle:NSTYLE,nameSize:NSIZE,namePos:NPOS});
const LABEL={species:'Style (espèce)',skin:'Teint',face:'Visage',eyes:'Yeux',eyeColor:'Couleur yeux',brows:'Sourcils',nose:'Nez',mouth:'Bouche',beard:'Barbe',hair:'Cheveux',hairColor:'Couleur cheveux',outfit:'Haut',outfitColor:'Couleur haut',glasses:'Lunettes',headwear:'Couvre-chef',extra:'Détail',specialBack:'Ailes et appendices',specialHead:'Cornes et antennes',specialFace:'Détails spéciaux',background:'Fond',accColor:'Couleur couvre-chef',pattern:'Motif du fond',nameFont:'Police du nom',nameColor:'Couleur du nom',nameStyle:'Style du nom',nameSize:'Taille',namePos:'Position'};
const GENDERS={male:'Homme',female:'Femme',other:'Autres'};
const DEF={species:1,skin:3,face:0,eyes:0,eyeColor:1,brows:1,nose:0,mouth:0,beard:0,hair:3,hairColor:2,outfit:0,outfitColor:0,glasses:0,headwear:0,extra:0,specialBack:0,specialHead:0,specialFace:0,background:0,accColor:0,pattern:0,nameFont:0,nameColor:0,nameStyle:0,nameSize:1,namePos:0};

/* ============ 3. RENDU ============ */
const $=id=>document.getElementById(id), svg=$('character'), mirror=s=>`<g>${s}</g><g transform="translate(300 0) scale(-1 1)">${s}</g>`;
const STEPS=[{t:'1. Base',keys:['species','skin','face','eyes','eyeColor','brows','nose','mouth','beard','hair','hairColor','outfit','outfitColor']},
 {t:'2. Accessoires',keys:['headwear','accColor','glasses','extra','specialBack','specialHead','specialFace']},{t:'3. Fond & nom',keys:['background','pattern','nameFont','nameColor','nameStyle','nameSize','namePos']}];
let cur=0,maxStep=0;   // maxStep : étape la plus loin débloquée (via « Continuer »)
let state={gender:'male',...DEF};
let galleryKey=null;
const emptyChoices=new Set(['hair','beard','glasses','headwear','extra']);
const specialNames={specialBack:['Aucun','Ailes de chauve-souris','Ailes de plumes','Appendices mutants'],specialHead:['Aucun','Cornes','Antennes','Crête mutante'],specialFace:['Aucun','Cicatrices','Implant cybernétique','Marques mutantes']};
const choiceName=(k,i)=>specialNames[k]?.[i]??(i===0&&emptyChoices.has(k)?'Aucun':'Choix '+(i+1));
const STEP_DETAILS=[
  ['La base','Choisissez la silhouette et les traits de votre survivant.'],
  ['Les accessoires','Complétez votre équipement avant la mission.'],
  ['Fond & nom','Terminez votre portrait et exportez votre personnage en JSON.']
];
function preview(k,i,s,reg,f){
  const c=OUTCOL[s.outfitColor], ec=EYECOL[s.eyeColor], lip=s.gender==='female'?'#d6456a':'#c0645a';
  const drawings={
    face:()=>ol(BASE.face.male[i]),
    eyes:()=>ol(mirror(EYES[i](ec)),2.5),
    brows:()=>`<g stroke="var(--brow)" stroke-width="5" stroke-linecap="round" fill="none">${mirror(`<path d="${BROWS[i]}"/>`)}</g>`,
    nose:()=>ol(NOSE[i],2.5), mouth:()=>ol(MOUTH[i](lip),2.5),
    beard:()=>`<g fill="var(--hair)" stroke="${OL}" stroke-width="3">${call(BEARD[i],f)}</g>`,
    hair:()=>reg.hair[i].join(''),
    outfit:()=>OUTFITS[s.gender][i](c,s.gender).replaceAll('tcl',`tcl-preview-${i}`),
    glasses:()=>GLASSES[i], headwear:()=>call(HEAD[i],ACCCOL[s.accColor]),
    extra:()=>call(EXTRA[i],{cw:f[0]}),
    specialBack:()=>SPECIAL_BACK[i], specialHead:()=>SPECIAL_HEAD[i], specialFace:()=>SPECIAL_FACE[i]
  };
  const boxes={face:'75 45 150 175',eyes:'100 105 100 48',brows:'100 90 100 35',nose:'130 135 40 40',mouth:'120 165 60 45',beard:'75 125 150 115',hair:'65 10 170 220',outfit:'45 195 210 165',glasses:'85 105 130 60',headwear:'65 0 170 130',extra:'75 90 150 170',specialBack:'0 145 300 135',specialHead:'60 20 180 85',specialFace:'90 125 120 65'};
  const art=drawings[k]();
  return art?`<svg viewBox="${boxes[k]}" aria-hidden="true" style="--skin:${reg.skin[s.skin]};--hair:${HAIRCOL[s.hairColor]};--brow:${sh(HAIRCOL[s.hairColor],-.15)}">${art}</svg>`:'<span aria-hidden="true">—</span>';
}
// Valide un état : type connu, entiers dans [0, n-1] sinon valeur par défaut
function sanitize(raw){
  const g=GENDERS[raw?.gender]?raw.gender:'male', reg=REGS(g), o={gender:g};
  for(const k in reg){const v=raw?.[k];o[k]=Number.isInteger(v)&&v>=0&&v<reg[k].length?v:(DEF[k]<reg[k].length?DEF[k]:0)}
  o.name=typeof raw?.name==='string'?raw.name.slice(0,20):'';return o;
}
function render(raw){
  const s=state=sanitize(raw), g=s.gender, reg=REGS(g), f=[...FACES[s.face]], sp=SPECIES[g==='other'?s.species:0];
  if(g==='female')f[1]*=.82;
  const [cw]=f, skin=reg.skin[s.skin], hair=HAIRCOL[s.hairColor], c=OUTCOL[s.outfitColor], ec=EYECOL[s.eyeColor], x={cw}, fem=g==='female';
  const lip=fem?'#d6456a':'#c0645a', set=(k,v)=>$('layer-'+k).innerHTML=v||'';
  svg.style.setProperty('--skin',skin); svg.style.setProperty('--hair',hair); svg.style.setProperty('--brow',sh(hair,-.15));
  set('bg',BGS[s.background]+PAT[s.pattern]); set('back',call(sp.back,x)); set('special-back',g==='other'?SPECIAL_BACK[s.specialBack]:''); set('hair-back',reg.hair[s.hair][0]);
  set('neck',BASE.neck[fem?'female':'male'][s.face]);
  set('outfit',OUTFITS[g][s.outfit](c,g));
  set('head',ol(call(sp.ears,x)??BASE.ears[s.face])+ol(BASE.face[fem?'female':'male'][s.face])+BASE.blush);
  set('beard',g==='female'?'':`<g fill="var(--hair)" stroke="${OL}" stroke-width="3" stroke-linejoin="round">${call(BEARD[s.beard],f)}</g>`);
  set('nose',ol(NOSE[s.nose],2.5));
  const es=sp.es||1, ei=sp.fe??s.eyes;
  set('eyes',sp.eyes?sp.eyes(ec):`<g transform="translate(150 128) scale(${es}) translate(-150 -128)">${ol(mirror(EYES[ei](ec)+(fem?LASH:'')),2.5)}</g>`);
  const bw=fem?3.5:5.5;
  set('brows',sp.brows?`<g stroke="var(--brow)">${sp.brows}</g>`:BROWS[s.brows]?`<g stroke="var(--brow)" stroke-width="${bw}" stroke-linecap="round" fill="none">${mirror(`<path d="${BROWS[s.brows]}"/>`)}</g>`:'');
  set('mouth',ol(MOUTH[s.mouth](lip),2.5));
  set('hair-front',reg.hair[s.hair][1]); set('over',sp.over?ol(call(sp.over,x),2.5):''); set('top',sp.top?ol(call(sp.top,x)):'');
  set('special-head',g==='other'?SPECIAL_HEAD[s.specialHead]:''); set('extra',call(EXTRA[s.extra],x)); set('special-face',g==='other'?SPECIAL_FACE[s.specialFace]:''); set('glasses',GLASSES[s.glasses]); set('headwear',call(HEAD[s.headwear],ACCCOL[s.accColor])); set('name',nameSvg(s));
  $('json').value=JSON.stringify(s,null,2);
  const SW={skin:reg.skin,hairColor:HAIRCOL,eyeColor:EYECOL,outfitColor:OUTCOL,accColor:ACCCOL,nameColor:NCOL,background:BGP.map(p=>`linear-gradient(135deg,${p[0]},${p[1]})`)};
  const CH={species:i=>[SPNAMES[i]],pattern:i=>[PNAMES[i]],nameFont:i=>[NFONTS[i][0],'font-family:'+NFONTS[i][1]],nameStyle:i=>[NSTYLE[i]],nameSize:i=>[NSIZE[i]],namePos:i=>[NPOS[i]]};
  $('controls').innerHTML=STEPS[cur].keys.filter(k=>k in reg).map(k=>{const n=reg[k].length,lab=`<h3>${LABEL[k]}</h3>`+(k==='species'?'<small>Choisir un style applique son look complet (couleurs, tenue, accessoires). Tu peux ensuite tout modifier.</small>':'');
   if(SW[k])return lab+`<div class="sw">${SW[k].map((v,i)=>`<button data-k="${k}" data-i="${i}" aria-pressed="${s[k]===i}" aria-label="${LABEL[k]} ${i+1}" style="background:${v}"></button>`).join('')}</div>`;
   if(CH[k])return lab+`<div class="sw">${[...Array(n)].map((_,i)=>{const[t,st='']=CH[k](i);return `<button class="f" data-k="${k}" data-i="${i}" aria-pressed="${s[k]===i}" style="${st}">${t}</button>`}).join('')}</div>`;
   const gallery=`<button type="button" class="gallery-open" data-gallery="${k}" aria-label="Voir ${LABEL[k]} en images" aria-haspopup="dialog"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg></button>`;
   const content=`<div class="choice-selector"><button type="button" class="choice-arrow" data-k="${k}" data-d="-1" aria-label="${LABEL[k]} précédent">‹</button><div class="choice-current" aria-live="polite">${preview(k,s[k],s,reg,f)}<span><strong>${choiceName(k,s[k])}</strong><small>${s[k]+1} / ${n}</small></span></div><button type="button" class="choice-arrow" data-k="${k}" data-d="1" aria-label="${LABEL[k]} suivant">›</button>${gallery}</div>`;
   return `<div class="choice-group">${lab}${content}</div>`}).join('');
  document.querySelectorAll('#tabs button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.g===g));
  $('steps').querySelectorAll('button').forEach((b,i)=>{b.setAttribute('aria-pressed',i===cur);b.disabled=i>maxStep;b.textContent=(i>maxStep?'🔒 ':'')+STEPS[i].t});
  $('tabs').hidden=$('type-label').hidden=cur!==0;$('nameBox').hidden=$('jsonbox').hidden=cur!==2;$('back').hidden=cur===0;$('next').hidden=cur===2;$('finish').hidden=cur!==2;
  $('step-label').textContent=`ÉTAPE 0${cur+1} / 03`;
  $('step-title').textContent=STEP_DETAILS[cur][0];$('step-description').textContent=STEP_DETAILS[cur][1];
  if($('name').value!==s.name)$('name').value=s.name;
  if($('gallery-dialog').open)renderGallery();
}

/* ============ 4. INTERFACE ============ */
function renderGallery(){
 const s=state,reg=REGS(s.gender),f=[...FACES[s.face]];
 if(s.gender==='female')f[1]*=.82;
 $('gallery-title').textContent=LABEL[galleryKey];
 const portrait=svg.cloneNode(true),ids=new Map();
 portrait.querySelectorAll('[id]').forEach(el=>{const old=el.id,next=`gallery-${old}`;ids.set(old,next);el.id=next});
 portrait.querySelectorAll('*').forEach(el=>[...el.attributes].forEach(attr=>{let value=attr.value;ids.forEach((next,old)=>{value=value.replaceAll(`url(#${old})`,`url(#${next})`);if(value===`#${old}`)value=`#${next}`});if(value!==attr.value)el.setAttribute(attr.name,value)}));
 portrait.removeAttribute('id');portrait.setAttribute('aria-label','Aperçu du personnage');
 $('gallery-portrait').replaceChildren(portrait);
 $('gallery-options').innerHTML=reg[galleryKey].map((_,i)=>`<button type="button" data-i="${i}" aria-label="${specialNames[galleryKey]?`${LABEL[galleryKey]} : ${choiceName(galleryKey,i)}`:`${LABEL[galleryKey]} ${i+1}`}" aria-pressed="${s[galleryKey]===i}">${preview(galleryKey,i,s,reg,f)}<span>${choiceName(galleryKey,i)}</span></button>`).join('');
}
$('tabs').innerHTML=Object.entries(GENDERS).map(([k,v])=>`<button data-g="${k}">${v}</button>`).join('');
$('tabs').onclick=e=>{const b=e.target.closest('button');if(b)render({gender:b.dataset.g,name:state.name,...(b.dataset.g==='other'?{...PRESETS[DEF.species],species:DEF.species}:{})})};   // changer de type = valeurs par défaut du type
$('controls').onclick=e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.gallery){galleryKey=b.dataset.gallery;renderGallery();$('gallery-dialog').showModal();if(document.documentElement.dataset.embedded)window.parent.postMessage({type:'afterlock-creator-modal',open:true},'*');return}
 const {k,i,d}=b.dataset;
 if(d!==undefined){const n=REGS(state.gender)[k].length;render({...state,[k]:(state[k]+Number(d)+n)%n});$('controls').querySelector(`[data-k="${k}"][data-d="${d}"]`).focus();return}
 render({...state,...(k==='species'?PRESETS[+i]:{}),[k]:+i});$('controls').querySelector(`[data-k="${k}"][data-i="${i}"]`).focus();
};
$('gallery-options').onclick=e=>{const b=e.target.closest('button');if(!b)return;const i=Number(b.dataset.i);render({...state,[galleryKey]:i});$('gallery-options').querySelector(`[data-i="${i}"]`).focus()};
$('gallery-close').onclick=()=>$('gallery-dialog').close();
$('gallery-dialog').addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();$('gallery-dialog').close()}});
$('gallery-dialog').addEventListener('close',()=>{if(document.documentElement.dataset.embedded)window.parent.postMessage({type:'afterlock-creator-modal',open:false},'*');const opener=$('controls').querySelector(`[data-gallery="${galleryKey}"]`);if(opener)opener.focus();galleryKey=null});
$('rand').onclick=()=>{const reg=REGS(state.gender),r={...state};for(const k of STEPS[cur].keys)if(k in reg)r[k]=Math.floor(Math.random()*reg[k].length);render(r)};
$('reset').onclick=()=>render({gender:state.gender});
$('load').onclick=()=>{let data;try{data=JSON.parse($('json').value)}catch(error){$('msg').textContent='JSON invalide : vérifiez la syntaxe.';return}if(!data||typeof data!=='object'||Array.isArray(data)){$('msg').textContent='JSON invalide : un objet personnage est attendu.';return}render(data);$('msg').textContent='Personnage chargé.'};
$('dl').onclick=()=>{const a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));a.href=url;a.download='character.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
$('steps').innerHTML=STEPS.map((x,i)=>`<button data-i="${i}">${x.t}</button>`).join('');
const go=i=>{cur=Math.max(0,Math.min(2,maxStep,i));render(state);$('step-title').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})};
$('steps').onclick=e=>{const b=e.target.closest('button');if(b)go(+b.dataset.i)};
$('next').onclick=()=>{maxStep=Math.max(maxStep,Math.min(2,cur+1));go(cur+1)};$('back').onclick=()=>go(cur-1);
$('name').oninput=e=>{state.name=e.target.value;render(state)};
if(new URLSearchParams(location.search).get('embed')==='1' && window.parent!==window){
  document.documentElement.dataset.embedded='true';
  document.documentElement.dataset.theme='dark';
  const notifyHeight=()=>window.parent.postMessage({type:'afterlock-creator-height',height:document.body.getBoundingClientRect().height},'*');
  new ResizeObserver(notifyHeight).observe(document.body);
  let stageOffset=0;
  window.addEventListener('message',event=>{
    if(event.source!==window.parent || !event.data || event.data.type!=='afterlock-creator-viewport' ||
       !Number.isFinite(event.data.top) || !Number.isFinite(event.data.height))return;
    document.documentElement.style.setProperty('--viewport-height',`${event.data.height}px`);
    document.documentElement.style.setProperty('--parent-frame-top',`${Math.max(0,-event.data.top)}px`);
    const stage=$('stage'),bounds=stage.getBoundingClientRect(),main=document.querySelector('.creator').getBoundingClientRect();
    const base=bounds.top-stageOffset;
    stageOffset=Math.max(0,Math.min(16-event.data.top-base,main.bottom-base-bounds.height));
    stage.style.transform=`translateY(${stageOffset}px)`;
  });
  $('finish').addEventListener('click',event=>{event.preventDefault();window.parent.postMessage({type:'afterlock-creator-close'},'*')});
}
render({gender:'male'});
