/* LAST REFUGE · XM — Escape room « Sas 07 » · Post-traitement : contour, bloom, sortie.
   Fichier chargé dans l’ordre par escape-room.js : il partage la portée globale des autres fichiers. */
'use strict';
/* ════════════════════════════════════════════════════════════════
   11. POST-PROCESSING : rendu → contour → bloom → sortie (tone mapping)
   ════════════════════════════════════════════════════════════════ */
const rt = new THREE.WebGLRenderTarget(innerWidth, innerHeight, {
  type: THREE.HalfFloatType,
  samples: TOUCH && !CONFIG.device.antialiasMobile ? 0 : (CONFIG.device.msaaDesktop ?? 2)
}); // MSAA dans le composer
const composer = new EffectComposer(renderer, rt);
composer.addPass(new RenderPass(scene, camera));
const outline = new OutlinePass(new THREE.Vector2(innerWidth, innerHeight), scene, camera);
outline.edgeStrength = 5;
outline.edgeGlow = 0;
outline.edgeThickness = 2.5;
outline.pulsePeriod = 0;
outline.visibleEdgeColor.set(0x22d3ee);
outline.hiddenEdgeColor.set(0x0a4a5a); // bordure cyan FIXE (aucun pulsement)
composer.addPass(outline);
const firstPersonPass = new RenderPass(FP.scene, FP.camera);
firstPersonPass.clear = false;
firstPersonPass.clearDepth = true;
firstPersonPass.enabled = false;
composer.addPass(firstPersonPass);
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.34, 0.4, 0.93);
composer.addPass(bloom);
bloom.enabled = !TOUCH || CONFIG.device.bloomMobile;
composer.addPass(new OutputPass());
const daltonien = new ShaderPass({
  uniforms: {
    tDiffuse: { value: null },
    row0: { value: new THREE.Vector3(1, 0, 0) },
    row1: { value: new THREE.Vector3(0, 1, 0) },
    row2: { value: new THREE.Vector3(0, 0, 1) }
  },
  vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: 'uniform sampler2D tDiffuse; uniform vec3 row0; uniform vec3 row1; uniform vec3 row2; varying vec2 vUv; void main() { vec4 c = texture2D(tDiffuse, vUv); gl_FragColor = vec4(clamp(vec3(dot(row0, c.rgb), dot(row1, c.rgb), dot(row2, c.rgb)), 0.0, 1.0), c.a); }'
});
daltonien.enabled = false;
composer.addPass(daltonien);
addEventListener('lastrefuge-daltonien', (event) => {
  const { active, matrix } = event.detail;
  daltonien.enabled = !!active;
  if (active) matrix.forEach((row, i) => daltonien.uniforms['row' + i].value.fromArray(row));
});
if (window.lastRefugeDaltonien) window.lastRefugeDaltonien.apply();
function resize() {
  const w = innerWidth,
    h = innerHeight;
  renderer.setSize(w, h);
  composer.setSize(w, h);
  camera.aspect = w / h;
  camera.fov = rig.fov = w / h < 1 ? CONFIG.device.fovPortrait : CONFIG.fov;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
resize();
var invOpen = false,
  INV_LAST = [];
/* ── Cadre de visée autour de l'objet survolé (coins pulsés + distance), lisible de près comme de loin ── */
const _sb = new THREE.Box3(),
  _st = new THREE.Box3(),
  _sv = new THREE.Vector3();
function selBox(o) {
  _sb.makeEmpty();
  o.traverse((m) => {
    if (!m.isMesh || m.userData.hit || !m.geometry || !m.visible) return;
    if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
    _st.copy(m.geometry.boundingBox).applyMatrix4(m.matrixWorld);
    _sb.union(_st);
  });
  return _sb;
}
function selFrame(t) {
  const s = document.getElementById('sel');
  if (!s) return;
  if (!hovered || modalOpen || State.focus) {
    s.style.display = 'none';
    return;
  }
  const b =
    (selFrame.n = (selFrame.n || 0) + 1) % 6 === 1 || selFrame.o !== hovered
      ? ((selFrame.o = hovered), (selFrame.b = selBox(hovered).clone()))
      : selFrame.b;
  if (b.isEmpty()) {
    s.style.display = 'none';
    return;
  }
  let x0 = 1e9,
    y0 = 1e9,
    x1 = -1e9,
    y1 = -1e9,
    ok = true;
  const r = el.getBoundingClientRect();
  for (let i = 0; i < 8; i++) {
    _sv.set(i & 1 ? b.max.x : b.min.x, i & 2 ? b.max.y : b.min.y, i & 4 ? b.max.z : b.min.z).project(camera);
    if (_sv.z > 1) {
      ok = false;
      break;
    }
    const px = (_sv.x * 0.5 + 0.5) * r.width + r.left,
      py = (-_sv.y * 0.5 + 0.5) * r.height + r.top;
    x0 = Math.min(x0, px);
    x1 = Math.max(x1, px);
    y0 = Math.min(y0, py);
    y1 = Math.max(y1, py);
  }
  if (!ok || x1 - x0 > r.width * 0.9) {
    s.style.display = 'none';
    return;
  }
  const cx = (x0 + x1) / 2,
    cy = (y0 + y1) / 2,
    w = Math.max(46, x1 - x0 + 14),
    h = Math.max(46, y1 - y0 + 14);
  s.style.display = 'block';
  s.style.width = w + 'px';
  s.style.height = h + 'px';
  s.style.transform = 'translate(' + (cx - w / 2) + 'px,' + (cy - h / 2) + 'px)';
  const d = hovered.getWorldPosition(_sv).distanceTo(rig.pos);
  document.getElementById('selt').textContent = (d < 10 ? d.toFixed(1) : Math.round(d)) + ' M';
  s.className = 'hud ' + (hovered.userData.actionType || 'inspect');
}
const INVD = [
  ['Carte d’accès', '🪪', 'Carte magnétique : ouvre le lecteur de la chambre forte.'],
  ['Fusible', '🔌', 'Rétablit le courant dans un coffret électrique.'],
  ['Clé du silo', '🗝️', 'Ouvre la porte de sortie du silo.'],
  ['Clé du convoi', '🗝️', 'Déverrouille le convoi.'],
  ['Clé du casier d’armes', '🗝️', 'Ouvre le casier d’armes.'],
  ['Clé de cellule', '🗝️', 'Ouvre une cellule du bloc.'],
  ['Clé du bloc cellulaire', '🗝️', 'Ouvre la porte du bloc cellulaire.'],
  ['Pied-de-biche', '🔧', 'Force une porte ou un panneau bloqué.'],
  ['Clé du poste de contrôle', '🗝️', 'Accès au poste de contrôle.'],
  ['Batterie', '🔋', 'À brancher sur le générateur du sas.'],
  ['Bidon d’essence', '⛽', 'À verser dans le réservoir du générateur.'],
  ['Note du casier', '📄', 'Un numéro à retenir.'],
  ['Pince coupante', '✂️', 'Coupe les cadenas rouillés des casiers.'],
  ['Badge d’accès', '🪪', 'Badge du Dr Leroy : utile au terminal.'],
  ['Tournevis', '🪛', 'Dévisse les vis cruciformes.'],
  ['Perceuse', '🔩', 'Perce les vis de sécurité rouillées.'],
  ['Câble de masse', '🔌', 'Relie le générateur à la terre.'],
  [
    'Carnet de mission',
    '📖',
    'Liste toutes les missions et opérations annexes. Touche O pour l’ouvrir ou le fermer.'
  ],
  ['Équipement renforcé', '🛡️', '−6 % de dégâts subis par quête annexe terminée (max −65 %).']
];
function refreshInvFull() {
  try {
    const el = document.getElementById('invfull');
    if (!el || !invOpen) return;
    const it = INV_LAST,
      g = document.getElementById('ifg');
    g.innerHTML = it.length
      ? it
          .map((n) => {
            const d = INVD.find((x) => n.startsWith(x[0])) || [
              '',
              '📦',
              'Objet de quête annexe : voir les opérations annexes.'
            ];
            return (
              '<div class="card"><div class="g">' +
              d[1] +
              '</div><div><div class="n">' +
              n +
              '</div><div class="d">' +
              d[2] +
              '</div></div></div>'
            );
          })
          .join('')
      : '<div class="empty">Sac vide. Fouillez les casiers, les caisses et les bureaux.</div>';
    const rr = roomOf(rig.pos.z),
      main = subGoals0(rr),
      ql = questLines(rr),
      last = ql[ql.length - 1];
    document.getElementById('ifm').innerHTML =
      '<h5>Mission principale · Secteur ' +
      String(rr).padStart(2, '0') +
      '</h5><p class="ob">' +
      objectiveNow() +
      '</p>' +
      (main.length
        ? '<ul>' +
          main.map(([l, d]) => '<li class="' + (d ? 'd' : '') + '">' + l + '</li>').join('') +
          '</ul>'
        : '') +
      '<h5>Opérations annexes</h5><ul>' +
      ql
        .slice(0, -1)
        .map(([l, d]) => '<li class="' + (d ? 'd' : '') + '">' + l.replace('Annexe — ', '') + '</li>')
        .join('') +
      '</ul><p class="tot">' +
      last[0] +
      '</p>';
    document.getElementById('ifc').textContent = it.length + ' objet' + (it.length > 1 ? 's' : '');
  } catch (e) {}
}
function setInv(o) {
  const el = document.getElementById('invfull');
  if (!el) return;
  if (o && (modalOpen || State.doorExit)) return;
  if (!o && !invOpen) return;
  if (o && State.focus) release(true);
  invOpen = o;
  el.classList.toggle('on', o);
  modalOpen = o;
  SND.play('click');
  if (o) refreshInvFull();
}
document.getElementById('ifx').onclick = () => setInv(false);
document.getElementById('inv').onclick = () => setInv(true);
const objEl = document.getElementById('obj');
objEl.onclick = () => objEl.classList.toggle('min');
if (innerHeight < 480) objEl.classList.add('min');
addEventListener('keydown', (e) => {
  if (e.repeat) return;
  const K = CONTROLS.keys;
  if (K.inventory.includes(e.code)) {
    if (invOpen || !modalOpen) setInv(!invOpen);
  } else if (e.code === 'Escape' && invOpen) setInv(false);
  else if (K.objectives.includes(e.code) && !modalOpen) objEl.classList.toggle('min');
});
// ── perf : la résolution s’adapte toute seule à la puissance de l’appareil (CONFIG.device.pixelRatio* = résolution maximale)
const perf = {
  base: renderer.getPixelRatio(),
  s: 1,
  acc: 0,
  n: 0,
  last: performance.now(),
  cool: 3000,
  cut: false,
  outlineCut: false,
  outlineRetry: 0,
  lowEnd: false,
  beforeLowEnd: null
};
function perfApply() {
  const pr = perf.base * perf.s;
  renderer.setPixelRatio(pr);
  composer.setPixelRatio(pr);
  resize();
  perf.cool = 3500;
  if (perf.s <= 0.6 && !perf.cut) {
    perf.cut = true;
    flash.castShadow = false;
  }
} // dernier recours : plus d’ombre pour la lampe
function setLowEndMode(enabled) {
  enabled = !!enabled;
  if (perf.lowEnd === enabled) return;
  if (enabled) {
    const reducedLights = [...neonPool.slice(2).map((entry) => entry.L), bigLights[0], bigLights[2]];
    perf.beforeLowEnd = {
      s: perf.s, cut: perf.cut, flashShadow: flash.castShadow,
      shadows: renderer.shadowMap.enabled, bloom: bloom.enabled, outline: outline.enabled,
      lights: reducedLights.map((light) => [light, light.visible]), cameraFar: camera.far,
      localLights: scene.children.filter((object) => object.isLight && object.distance > 0)
    };
    perf.lowEnd = true;
    perf.s = Math.min(perf.s, 0.5);
    perfApply();
    renderer.shadowMap.enabled = false;
    bloom.enabled = false;
    outline.enabled = false;
    reducedLights.forEach((light) => { light.visible = false; });
    camera.far = Math.min(camera.far, MapScenes.active ? 100 : roomOf(rig.pos.z) <= 4 ? 20 : 60);
  } else {
    const previous = perf.beforeLowEnd;
    perf.lowEnd = false;
    perf.s = previous.s;
    perfApply();
    perf.cut = previous.cut;
    flash.castShadow = previous.flashShadow;
    renderer.shadowMap.enabled = previous.shadows;
    bloom.enabled = previous.bloom;
    outline.enabled = previous.outline;
    previous.lights.forEach(([light, visible]) => { light.visible = visible; });
    camera.far = previous.cameraFar;
    perf.beforeLowEnd = null;
  }
  camera.updateProjectionMatrix();
  scene.traverse((object) => {
    if (object.material) [].concat(object.material).forEach((material) => { material.needsUpdate = true; });
  });
  perf.acc = 0;
  perf.n = 0;
  perf.last = performance.now();
}
function renderGame() {
  if (!perf.lowEnd) {
    composer.render();
    return;
  }
  const far = Math.min(perf.beforeLowEnd.cameraFar,
    MapScenes.active ? 100 : roomOf(rig.pos.z) <= 4 ? 20 : 60);
  if (camera.far !== far) {
    camera.far = far;
    camera.updateProjectionMatrix();
  }
  const hiddenLights = [];
  for (const light of perf.beforeLowEnd.localLights) {
    const range = far + light.distance;
    if (light.visible && light.position.distanceToSquared(camera.position) > range * range) {
      light.visible = false;
      hiddenLights.push(light);
    }
  }
  const autoClear = renderer.autoClear;
  try {
    if (daltonien.enabled) {
      composer.render();
    } else {
      renderer.autoClear = true;
      renderer.render(scene, camera);
      if (firstPersonPass.enabled) {
        renderer.autoClear = false;
        renderer.clearDepth();
        renderer.render(FP.scene, FP.camera);
      }
    }
  } finally {
    hiddenLights.forEach((light) => { light.visible = true; });
    renderer.autoClear = autoClear;
  }
}
function perfTick() {
  const now = performance.now(),
    d = now - perf.last;
  perf.last = now;
  if (document.hidden || d > 400 || modalOpen) return;
  perf.acc += d;
  perf.n++;
  perf.cool -= d;
  perf.outlineRetry = Math.max(0, perf.outlineRetry - d);
  if (perf.n >= 90) {
    const avg = perf.acc / perf.n;
    perf.acc = 0;
    perf.n = 0;
    if (perf.cool <= 0) {
      if (perf.lowEnd) {
        if (avg > 33 && perf.s > 0.35) {
          perf.s = Math.max(0.35, perf.s - 0.05);
          perfApply();
        } else if (avg < 19 && perf.s < 0.5) {
          perf.s = Math.min(0.5, perf.s + 0.05);
          perfApply();
        }
      } else if (avg > 21) {
        if (!perf.outlineCut && outline.enabled) {
          outline.enabled = false;
          perf.outlineCut = true;
          perf.outlineRetry = 30000;
          perf.cool = 3500;
        } else if (perf.s > 0.4) {
          perf.s = Math.max(0.4, perf.s - 0.2);
          perfApply();
        }
      } else if (avg < 14) {
        if (perf.s < 1) {
          perf.s = Math.min(1, perf.s + 0.1);
          perfApply();
        } else if (perf.outlineCut && perf.outlineRetry === 0) {
          outline.enabled = true;
          perf.outlineCut = false;
          perf.cool = 3500;
        }
      }
    }
  }
}
