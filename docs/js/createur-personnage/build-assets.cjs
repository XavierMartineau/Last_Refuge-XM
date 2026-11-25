const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../../assets/creation-personnage");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));

function readAsset(relativePath) {
  const resolved = path.resolve(root, relativePath);
  if (!resolved.startsWith(root + path.sep)) throw new Error(`Chemin d'asset invalide : ${relativePath}`);
  const contents = fs.readFileSync(resolved, "utf8");
  if (relativePath.endsWith(".json")) return JSON.parse(contents);
  if (!relativePath.endsWith(".svg")) throw new Error(`Format d'asset inconnu : ${relativePath}`);
  const match = contents.match(/^<svg\b[^>]*>([\s\S]*)<\/svg>\s*$/);
  if (!match) throw new Error(`SVG invalide : ${relativePath}`);
  return match[1];
}

function readTree(value) {
  if (typeof value === "string") return readAsset(value);
  if (Array.isArray(value)) return value.map(readTree);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, readTree(item)]));
  return value;
}

const data = readTree(manifest);
function faceVariants(value) {
  if (Array.isArray(value)) return value;
  const variants = [...value.matchAll(/<!-- variant:([\d,]+) --><g(?: display="none")?>([\s\S]*?)<\/g><!-- end-variant -->/g)];
  if (!variants.length) return data.data.FACES.map(() => value);
  const faces = Array(data.data.FACES.length);
  for (const [, indexes, body] of variants) for (const index of indexes.split(",").map(Number)) {
    if (index >= faces.length || faces[index] !== undefined) throw new Error(`Variante de visage invalide : ${index}`);
    faces[index] = body;
  }
  if (faces.some(value => value === undefined) || Object.keys(faces).length !== faces.length) throw new Error("Variante de visage manquante");
  return faces;
}
data.beard = data.beard.map(faceVariants);
data.extra = data.extra.map(faceVariants);
data.species = data.species.map(sp => sp.ears === undefined ? sp : {...sp, ears: faceVariants(sp.ears)});
data.hair = Object.fromEntries(Object.entries(data.hair).map(([type, paths]) => [type, paths.map(body => {
  const match = body.match(/^<!-- back -->([\s\S]*)<!-- front -->([\s\S]*)$/);
  if (!match) throw new Error(`Calques de cheveux manquants : ${type}`);
  return [match[1], match[2]];
})]));
data.brows = data.brows.map(body => {
  if (!body) return "";
  const match = body.match(/^<path d="([^"]*)"\/>$/);
  if (!match) throw new Error("Chemin de sourcil invalide");
  return match[1];
});

const result = `// Généré à partir de docs/assets/creation-personnage/manifest.json.
const CHARACTER_ASSETS=${JSON.stringify(data)};
const {HUMAN,FANT,HAIRCOL,EYECOL,OUTCOL,BGP,ACCCOL,NCOL,NFONTS,NSTYLE,NSIZE,NPOS,PNAMES,FACES,SPNAMES,PRESETS}=CHARACTER_ASSETS.data;
const {nose:NOSE,glasses:GLASSES,hair:HAIRS,base:BASE,background:BGS,pattern:PAT,lash:LASH,brows:BROWS}=CHARACTER_ASSETS;
const assetColor=(svg,color)=>svg.replaceAll('var(--choice-color, #123456)',color).replace(/var\\(--choice-shade-([mp\\d]+), #[0-9a-f]{6}\\)/g,(_,amount)=>sh(color,Number(amount.replace('m','-').replace('p','.'))));
const faceIndex=cw=>{const i=FACES.findIndex(face=>face[0]===cw);if(i<0)throw new Error('Visage inconnu : '+cw);return i};
const EYES=CHARACTER_ASSETS.eyes.map(svg=>color=>assetColor(svg,color));
const MOUTH=CHARACTER_ASSETS.mouth.map(svg=>color=>assetColor(svg,color));
const BEARD=CHARACTER_ASSETS.beard.map(variants=>face=>variants[faceIndex(face[0])]);
const OUTFITS=Object.fromEntries(Object.entries(CHARACTER_ASSETS.outfit).map(([type,variants])=>[type,variants.map(svg=>color=>assetColor(svg,color))]));
const HEAD=CHARACTER_ASSETS.head.map(svg=>color=>assetColor(svg,color));
const EXTRA=CHARACTER_ASSETS.extra.map(variants=>ctx=>variants[faceIndex(ctx.cw)]);
const SPECIES=CHARACTER_ASSETS.species.map(sp=>({...sp,...(sp.ears?{ears:ctx=>sp.ears[faceIndex(ctx.cw)]}:{}),...(sp.eyes?{eyes:color=>assetColor(sp.eyes,color)}:{})}));
`;
fs.writeFileSync(path.join(__dirname, "assets-generes.js"), result);
console.log(`Assets générés : ${data.eyes.length} yeux, ${data.mouth.length} bouches, ${data.species.length} espèces.`);
