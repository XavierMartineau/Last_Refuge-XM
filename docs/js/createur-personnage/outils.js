/* ============ 1. OUTILS ============ */
const OL='#2b1a16', hx=h=>[1,3,5].map(i=>parseInt(h.substr(i,2),16)), th=v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0');
const sh=(h,a)=>'#'+hx(h).map(v=>th(a<0?v*(1+a):v+(255-v)*a)).join('');          // éclaircit / assombrit
const ol=(s,w=3)=>`<g stroke="${OL}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round">${s}</g>`;
const both=s=>`${s}<g transform="translate(300 0) scale(-1 1)">${s}</g>`;   // miroir gauche/droite autour de x=150
const P=d=>`<path d="${d}"/>`, call=(v,a,b)=>typeof v==='function'?v(a,b):v;
