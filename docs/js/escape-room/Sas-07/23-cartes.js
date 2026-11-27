/* LAST REFUGE · XM — Cartes de fin : chargement à la demande et exploration. */
'use strict';
const MapScenes = (() => {
  const offset = -2000;
  const mapScale = 2;
  const sceneScale = 2;
  const zombieRadius = 0.7;
  const townExit = { start: 100, depth: 0.65, steps: 12, rise: 0.22, z: 1.5, width: 3, end: 110 };
  const townKits = [];
  const definitions = {
    city: {
      file: 'post-apocalyptic_city.glb',
      name: 'Post-Apocalyptic City',
      bounds: [-37, 33, -31, 32],
      entry: [15, -25],
      returnPoint: [24, 25],
      portals: [
        { x: 12, z: -27, label: 'RETOUR AU COMPLEXE', target: 'complex' },
        { x: 25, z: 25, label: 'VERS ZOMBIE TOWN', target: 'town' }
      ]
    },
    town: {
      file: 'zombie_town_textured.glb',
      name: 'Zombie Town',
      bounds: [-53, 56, -14, 14],
      entry: [-45, 0],
      portals: [
        { x: -47, z: 4, label: 'RETOUR À LA VILLE', target: 'city' },
        { x: 54, z: 0.75, label: 'FIN DE L’EXPLORATION', target: 'end' }
      ]
    }
  };
  for (const definition of Object.values(definitions)) {
    definition.bounds = definition.bounds.map((value) => value * mapScale);
    definition.entry = definition.entry.map((value) => value * mapScale);
    if (definition.returnPoint) definition.returnPoint = definition.returnPoint.map((value) => value * mapScale);
    definition.portals.forEach((p) => { p.x *= mapScale; p.z *= mapScale; });
  }
  const loader = new GLTFLoader();
  const preloaded = new Map();
  const down = new THREE.Vector3(0, -1, 0);
  const api = {
    active: null,
    height: () => ground,
    movementScale: () => api.active ? 2 : 1,
    zombieScale: () => 1
  };
  let current = null, ground = 0, busy = false;

  api.preload = async (progress) => {
    for (const [id, definition] of Object.entries(definitions)) {
      if (preloaded.has(id)) continue;
      progress('Téléchargement de ' + definition.name + '…');
      const gltf = await loader.loadAsync(new URL(definition.file, window.zombieMapBase).href, (event) => {
        const loaded = (event.loaded / 1048576).toFixed(1);
        const total = event.total > 0 ? (event.total / 1048576).toFixed(1) : null;
        progress('Téléchargement de ' + definition.name + ' : ' + loaded +
          (total ? ' / ' + total : '') + ' Mo', event.loaded, event.total);
      });
      progress('Préparation des collisions : ' + definition.name + '…');
      await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));
      gltf.scene.scale.multiplyScalar(mapScale);
      const octree = new Octree().fromGraphNode(gltf.scene);
      preloaded.set(id, { gltf, octree });
    }
  };

  function floorAt(octree, x, z, from) {
    const hit = octree.rayIntersect(new THREE.Ray(new THREE.Vector3(x, from, z), down));
    return hit && hit.distance <= 2 * mapScale ? hit.position.y : null;
  }
  function clearAt(octree, x, z, y, radius = 0.3, scale = 1) {
    const capsule = new Capsule(
      new THREE.Vector3(x, y + radius + 0.1 * scale, z),
      new THREE.Vector3(x, y + 1.3 * scale, z),
      radius
    );
    const hit = octree.capsuleIntersect(capsule);
    return !hit || hit.depth < 0.04;
  }
  function pointHeight(map, x, z, previous) {
    if (map.id === 'town') {
      const base = 0.7 * mapScale;
      if (x >= townExit.start && x <= townExit.end && Math.abs(z - townExit.z) <= townExit.width / 2) {
        const step = Math.min(townExit.steps, Math.floor((x - townExit.start) / townExit.depth) + 1);
        return base + step * townExit.rise;
      }
      return base;
    }
    return floorAt(map.octree, x, z, previous + 0.65);
  }
  function findClearPoint(map, x, z) {
    const b = map.definition.bounds;
    for (let radius = 0; radius <= 24; radius++) {
      for (let dx = -radius; dx <= radius; dx++) for (let dz = -radius; dz <= radius; dz++) {
        if (Math.max(Math.abs(dx), Math.abs(dz)) !== radius) continue;
        const px = x + dx, pz = z + dz;
        if (px < b[0] + 0.3 || px > b[1] - 0.3 || pz < b[2] + 0.3 || pz > b[3] - 0.3) continue;
        const y = map.id === 'town' ? 0.7 * mapScale : floorAt(map.octree, px, pz, 1.3 * mapScale);
        if (y !== null && clearAt(map.octree, px, pz, y)) return [px, y, pz];
      }
    }
    return null;
  }
  api.walkHeight = (x, z, previous) => {
    const localZ = z - offset, b = current.definition.bounds;
    if (x < b[0] + 0.3 || x > b[1] - 0.3 || localZ < b[2] + 0.3 || localZ > b[3] - 0.3)
      return null;
    if (current.id === 'town' && cageBlocked(current, x, localZ)) return null;
    const y = pointHeight(current, x, localZ, previous);
    if (y === null || Math.abs(y - previous) > 0.45 || !clearAt(current.octree, x, localZ, y)) return null;
    return y;
  };
  api.blocked = (x, z) => {
    const y = api.walkHeight(x, z, ground);
    if (y === null) return true;
    ground = y;
    return false;
  };
  api.safe = (x, z, padding = 0) => api.active === 'town' &&
    Math.hypot(x - current.entry[0], z - offset - current.entry[1]) < 8 + padding;
  api.cameraCeiling = (x, z) => api.active === 'town' &&
    Math.abs(x - current.entry[0]) < 5 && Math.abs(z - offset - current.entry[1]) < 5
    ? 0.7 * mapScale + 7 : Infinity;
  api.cameraWallBlocked = (x, z) => api.active === 'town' && cageBlocked(current, x, z - offset);
  api.townMove = (x, z) => {
    if (api.active !== 'town' || api.safe(x, z, 0.4)) return false;
    const b = current.definition.bounds, localZ = z - offset;
    if (x >= townExit.start - zombieRadius && x <= townExit.end + zombieRadius &&
      Math.abs(localZ - townExit.z) <= townExit.width / 2 + zombieRadius) return false;
    return x >= b[0] + zombieRadius && x <= b[1] - zombieRadius && localZ >= b[2] + zombieRadius &&
      localZ <= b[3] - zombieRadius && clearAt(current.octree, x, localZ, 0.7 * mapScale, zombieRadius);
  };
  api.respawn = () => {
    const entry = current.entry;
    rig.pos.set(entry[0], ground + 1.6, entry[1] + offset);
    rig.vy = rig.vp = 0;
  };
  api.obstruction = (ray, maxDistance) => {
    if (!current) return null;
    const localRay = ray.clone();
    localRay.origin.z -= offset;
    const hit = current.octree.rayIntersect(localRay);
    if (!hit || hit.distance > maxDistance) return null;
    hit.position.z += offset;
    return hit;
  };
  function disposeMap(map) {
    if (!map) return;
    scene.remove(map.group);
    const geometries = new Set(), materials = new Set(), textures = new Set();
    map.group.traverse((o) => {
      if (o.geometry) geometries.add(o.geometry);
      for (const material of Array.isArray(o.material) ? o.material : o.material ? [o.material] : []) {
        materials.add(material);
        for (const value of Object.values(material)) if (value && value.isTexture) textures.add(value);
      }
    });
    textures.forEach((t) => t.dispose());
    materials.forEach((m) => m.dispose());
    geometries.forEach((g) => g.dispose());
    map.octree.clear();
  }
  api.leave = () => {
    if (!current) return;
    clearTownZombies();
    disposeMap(current);
    current = null;
    api.active = null;
    scene.fog.density = 0.04;
    hud();
  };
  function portal(map, info) {
    const point = findClearPoint(map, info.x, info.z);
    if (!point) throw new Error('Passage inaccessible : ' + info.label);
    info.x = point[0];
    info.z = point[2];
    const y = info.target === 'end' && map.id === 'town'
      ? point[1] + townExit.steps * townExit.rise : point[1];
    const mesh = new THREE.Group();
    mesh.position.set(info.x, y, info.z);
    mesh.scale.setScalar(sceneScale);
    if (map.id === 'town') mesh.rotation.y = Math.PI / 2;
    interactive(mesh, 'map_' + info.target, info.label, 'use');
    const metal = new THREE.MeshStandardMaterial({ color: 0x333e3c, metalness: 0.8, roughness: 0.38 });
    const glow = new THREE.MeshStandardMaterial({ color: 0x58d9bd, emissive: 0x199b82, emissiveIntensity: 1.5 });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.4, 0.24, 32), metal);
    base.position.y = 0.12;
    mesh.add(base);
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.12, 0.12, 32), glow);
    plinth.position.y = 0.28;
    mesh.add(plinth);
    const frame = new THREE.Mesh(new THREE.TorusGeometry(1, 0.13, 12, 64), metal);
    frame.position.y = 1.4;
    mesh.add(frame);
    const ring = new THREE.Group();
    ring.position.y = 1.4;
    ring.add(new THREE.Mesh(new THREE.TorusGeometry(0.91, 0.035, 8, 64), glow));
    const segments = new THREE.InstancedMesh(new THREE.BoxGeometry(0.06, 0.12, 0.045), glow, 12);
    const segment = new THREE.Object3D();
    for (let i = 0; i < 12; i++) {
      const angle = i * Math.PI / 6;
      segment.position.set(Math.sin(angle) * 0.98, Math.cos(angle) * 0.98, 0.13);
      segment.rotation.z = -angle;
      segment.updateMatrix();
      segments.setMatrixAt(i, segment.matrix);
    }
    ring.add(segments);
    mesh.add(ring);
    const energy = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 } },
      vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `
        uniform float time;
        varying vec2 vUv;
        void main() {
          vec2 p = (vUv - 0.5) * 2.0;
          float r = length(p);
          float waves = sin(14.0 * r - time * 1.7 + sin(atan(p.y, p.x) * 4.0 + time) * 0.7);
          float mist = sin(p.x * 9.0 + time * 0.6) * sin(p.y * 11.0 - time * 0.8);
          float edge = 1.0 - smoothstep(0.7, 1.0, r);
          vec3 color = mix(vec3(0.02, 0.15, 0.13), vec3(0.24, 0.85, 0.7), 0.35 + 0.2 * waves + 0.12 * mist);
          gl_FragColor = vec4(color, edge * (0.62 + 0.12 * waves));
        }`,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const field = new THREE.Mesh(
      new THREE.CircleGeometry(0.9, 48),
      energy
    );
    field.position.y = 1.4;
    mesh.add(field);
    const light = new THREE.PointLight(0x60e4c4, 4, 6, 2);
    light.position.set(0, 1.4, 0.4);
    mesh.add(light);
    (map.portalEffects || (map.portalEffects = [])).push({ ring, energy });
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#061d1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'bold 25px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#b8fff0';
    ctx.fillText(info.label, 256, 58);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: true }));
    label.position.set(0, 2.9, 0);
    label.scale.set(4, 0.75, 1);
    label.raycast = () => {};
    mesh.add(label);
    map.group.add(mesh);
    Actions.register('map_' + info.target, () => {
      const p = mesh.getWorldPosition(new THREE.Vector3());
      if (Math.hypot(p.x - rig.pos.x, p.z - rig.pos.z) > 3.5 * sceneScale)
        return say('Approchez-vous du passage.', 2500);
      if (info.target === 'end') {
        if (townPopulation.length !== CONFIG.zombieTarget || !townPopulation.every((zombie) => zombie.dead))
          return say('Éliminez les infectés avant d’utiliser la sortie : ' +
          State.kills + ' / ' + CONFIG.zombieTarget + '.', 4000);
        if (Math.abs((rig.pos.y - 1.6) - y) > 0.7)
          return say('Montez les marches pour atteindre le passage.', 2500);
        document.getElementById('end').classList.add('on');
        modalOpen = true;
      } else if (info.target === 'complex') {
        api.leave();
        rig.pos.set(0, 1.6, -309.6);
        rig.yaw = Math.PI;
        rig.pitch = 0;
        hud();
        setObjective(objectiveNow());
      } else {
        enter(info.target, info.target === 'city');
      }
    });
  }
  api.animate = (time) => {
    if (!current) return;
    if (current.portalEffects) current.portalEffects.forEach(({ ring, energy }) => {
      ring.rotation.z = time * 0.12;
      energy.uniforms.time.value = time;
    });
  };
  const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));
  async function makePlan(map, progress) {
    const b = map.definition.bounds, canvas = document.createElement('canvas'), step = 2;
    canvas.width = Math.floor((b[1] - b[0]) / step) + 1;
    canvas.height = Math.floor((b[3] - b[2]) / step) + 1;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0c1b11';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#6f8e79';
    const walkable = new Uint8Array(canvas.width * canvas.height);
    for (let row = 0; row < canvas.height; row++) {
      const z = b[2] + row * step;
      for (let col = 0; col < canvas.width; col++) {
        const x = b[0] + col * step;
        const y = map.id === 'town' ? 0.7 * mapScale : floorAt(map.octree, x, z, 1.3 * mapScale);
        if (y === null || !clearAt(map.octree, x, z, y))
          ctx.fillRect((x - b[0]) / step, (z - b[2]) / step, 1, 1);
        else if (map.id !== 'town' || (x >= b[0] + zombieRadius && x <= b[1] - zombieRadius &&
          z >= b[2] + zombieRadius && z <= b[3] - zombieRadius &&
          clearAt(map.octree, x, z, y, zombieRadius)))
          walkable[((z - b[2]) / step) * canvas.width + (x - b[0]) / step] = 1;
      }
      if (row % 8 === 7) {
        progress('Analyse du terrain', row + 1, canvas.height);
        await nextFrame();
      }
    }
    if (map.id === 'town') {
      const edges = new Uint8Array(walkable.length);
      for (let row = 0; row < canvas.height; row++) {
        for (let col = 0; col < canvas.width; col++) {
          const i = row * canvas.width + col;
          if (!walkable[i]) continue;
          if (col + 1 < canvas.width && walkable[i + 1] &&
            clearAt(map.octree, b[0] + (col + 0.5) * step, b[2] + row * step, 0.7 * mapScale, zombieRadius)) {
            edges[i] |= 1; edges[i + 1] |= 2;
          }
          if (row + 1 < canvas.height && walkable[i + canvas.width] &&
            clearAt(map.octree, b[0] + col * step, b[2] + (row + 0.5) * step, 0.7 * mapScale, zombieRadius)) {
            edges[i] |= 4; edges[i + canvas.width] |= 8;
          }
        }
        if (row % 8 === 7) {
          progress('Préparation des déplacements des infectés', row + 1, canvas.height);
          await nextFrame();
        }
      }
      map.nav = { width: canvas.width, height: canvas.height, walkable, edges, b, step, field: null, target: -1, updated: 0 };
    }
    return canvas;
  }
  function nearestCell(nav, x, z) {
    const cx = Math.round((x - nav.b[0]) / nav.step), cz = Math.round((z - offset - nav.b[2]) / nav.step);
    let best = -1, distance = Infinity;
    for (let dz = -3; dz <= 3; dz++) for (let dx = -3; dx <= 3; dx++) {
      const col = cx + dx, row = cz + dz, d = dx * dx + dz * dz;
      if (col < 0 || col >= nav.width || row < 0 || row >= nav.height || d >= distance) continue;
      const index = row * nav.width + col;
      if (nav.walkable[index]) { best = index; distance = d; }
    }
    return best;
  }
  function cellPosition(nav, index) {
    return [nav.b[0] + (index % nav.width) * nav.step,
      nav.b[2] + Math.floor(index / nav.width) * nav.step + offset];
  }
  async function reachableTown(map, progress) {
    const b = map.definition.bounds, step = 0.5;
    const width = Math.floor((b[1] - b[0]) / step) + 1;
    const height = Math.floor((b[3] - b[2]) / step) + 1;
    const visited = new Uint8Array(width * height), passable = new Uint8Array(width * height);
    const queue = new Int32Array(visited.length), y = 0.7 * mapScale;
    const sx = Math.round((map.entry[0] - b[0]) / step), sz = Math.round((map.entry[1] - b[2]) / step);
    const start = sz * width + sx;
    visited[start] = 1;
    queue[0] = start;
    let head = 0, tail = 1;
    while (head < tail) {
      const i = queue[head++], col = i % width, row = Math.floor(i / width);
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const x = col + dx, z = row + dz;
        if (x < 1 || x >= width - 1 || z < 1 || z >= height - 1) continue;
        const next = z * width + x;
        if (visited[next]) continue;
        if (!passable[next])
          passable[next] = clearAt(map.octree, b[0] + x * step, b[2] + z * step, y) ? 1 : 2;
        if (passable[next] === 2 ||
          !clearAt(map.octree, b[0] + (col + dx * 0.5) * step, b[2] + (row + dz * 0.5) * step, y)) continue;
        visited[next] = 1;
        queue[tail++] = next;
      }
      if (head % 1024 === 0) {
        progress('Vérification des chemins accessibles');
        await nextFrame();
      }
    }
    return { visited, width, step, b };
  }
  function prepareTownPopulation(map, reachable) {
    const nav = map.nav, bins = Array.from({ length: 10 }, () => []);
    for (let i = 0; i < nav.walkable.length; i++) {
      if (!nav.walkable[i]) continue;
      const [x, z] = cellPosition(nav, i), localZ = z - offset;
      if (x >= townExit.start - zombieRadius && x <= townExit.end + zombieRadius &&
        Math.abs(localZ - townExit.z) <= townExit.width / 2 + zombieRadius) continue;
      const col = Math.round((x - reachable.b[0]) / reachable.step);
      const row = Math.round((localZ - reachable.b[2]) / reachable.step);
      if (!reachable.visited[row * reachable.width + col] ||
        Math.hypot(x - map.entry[0], localZ - map.entry[1]) < 12) continue;
      const bin = Math.min(9, Math.floor((x - nav.b[0]) / (nav.b[1] - nav.b[0]) * 10));
      bins[bin].push({ x, y: 0.7 * mapScale, z });
    }
    bins.forEach((bin) => {
      for (let i = bin.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bin[i], bin[j]] = [bin[j], bin[i]];
      }
    });
    const points = [];
    for (const separation of [4, 2]) {
      let added = true;
      while (points.length < CONFIG.zombieTarget && added) {
        added = false;
        for (const bin of bins) {
          const index = bin.findIndex((p) => points.every((q) => Math.hypot(p.x - q.x, p.z - q.z) >= separation));
          if (index < 0) continue;
          points.push(bin.splice(index, 1)[0]);
          added = true;
          if (points.length === CONFIG.zombieTarget) break;
        }
      }
      if (points.length === CONFIG.zombieTarget) break;
    }
    if (points.length !== CONFIG.zombieTarget)
      throw new Error('Pas assez d’emplacements accessibles pour les infectés : ' + points.length);
    points.forEach((point, id) => townPopulation.push({ ...point, id, health: 1, dead: false, root: null }));
  }
  function cageBlocked(map, x, z) {
    const dx = x - map.entry[0], dz = z - map.entry[1], r = 0.3;
    return (Math.abs(dz) >= 5 - r && Math.abs(dz) <= 5 + r && Math.abs(dx) <= 5 + r) ||
      (Math.abs(dx + 5) <= r && Math.abs(dz) <= 5 + r) ||
      (Math.abs(dx - 5) <= r && Math.abs(dz) <= 5 + r &&
        (!State.townGateOpen || Math.abs(dz) >= 1.7));
  }
  function townCage(map) {
    const cage = new THREE.Group();
    cage.position.set(map.entry[0], 0.7 * mapScale, map.entry[1]);
    const metal = new THREE.MeshStandardMaterial({ color: 0x414743, metalness: 0.7, roughness: 0.65 });
    const surface = document.createElement('canvas');
    surface.width = surface.height = 512;
    const paint = surface.getContext('2d');
    paint.fillStyle = '#60675d';
    paint.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 4500; i++) {
      const shade = Math.floor(Math.random() * 35);
      paint.fillStyle = `rgba(${35 + shade},${32 + shade},${24 + shade},0.16)`;
      paint.fillRect(Math.random() * 512, Math.random() * 512, 1 + Math.random() * 4, 1 + Math.random() * 14);
    }
    for (let x = 0; x <= 512; x += 128) {
      paint.fillStyle = '#30362f';
      paint.fillRect(x, 0, 4, 512);
      paint.fillStyle = 'rgba(126,74,40,0.55)';
      paint.fillRect(x + 4, 0, 3, 512);
      for (let y = 16; y < 512; y += 64) {
        paint.fillStyle = '#292f29';
        paint.beginPath();
        paint.arc(x + 10, y, 3, 0, Math.PI * 2);
        paint.fill();
      }
    }
    const texture = new THREE.CanvasTexture(surface);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 2);
    const panel = new THREE.MeshStandardMaterial({ map: texture, metalness: 0.45, roughness: 0.85 });
    const wall = (width, height, depth, x, y, z) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), panel);
      mesh.position.set(x, y, z);
      cage.add(mesh);
    };
    wall(10, 7, 0.1, 0, 3.5, -5);
    wall(10, 7, 0.1, 0, 3.5, 5);
    wall(0.1, 7, 10, -5, 3.5, 0);
    wall(0.1, 3, 3.3, 5, 1.5, -3.35);
    wall(0.1, 3, 3.3, 5, 1.5, 3.35);
    wall(0.1, 4, 10, 5, 5, 0);
    wall(10.1, 0.1, 10.1, 0, 7.05, 0);
    const light = new THREE.PointLight(0xffe6b0, 55, 18, 2);
    light.position.set(0, 4.5, 0);
    cage.add(light);
    const doors = [-1, 1].map((side) => {
      const hinge = new THREE.Group();
      hinge.position.set(5, 0, side * 1.7);
      const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3, 1.7), panel);
      leaf.position.set(0, 1.5, -side * 0.85);
      hinge.add(leaf);
      for (let n = 0; n < 4; n++) {
        const bar = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.9, 0.045), metal);
        bar.position.set(-0.02, 1.5, -side * (0.2 + n * 0.4));
        hinge.add(bar);
      }
      hinge.rotation.y = State.townGateOpen ? -side * Math.PI / 2 : 0;
      cage.add(hinge);
      return { hinge, side };
    });
    const positions = [];
    for (let n = -5; n <= 5; n += 0.5) {
      positions.push([n, -5], [n, 5], [-5, n]);
      if (Math.abs(n) >= 1.7) positions.push([5, n]);
    }
    const bars = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.035, 0.035, 2.8, 6), metal, positions.length);
    const transform = new THREE.Object3D();
    positions.forEach(([x, z], i) => {
      transform.position.set(x, 1.4, z);
      transform.updateMatrix();
      bars.setMatrixAt(i, transform.matrix);
    });
    cage.add(bars);
    const railX = new THREE.BoxGeometry(10.1, 0.08, 0.08);
    const railZ = new THREE.BoxGeometry(0.08, 0.08, 10.1);
    for (const h of [0.2, 2.8]) {
      for (const z of [-5, 5]) {
        const rail = new THREE.Mesh(railX, metal);
        rail.position.set(0, h, z);
        cage.add(rail);
      }
      const rail = new THREE.Mesh(railZ, metal);
      rail.position.set(-5, h, 0);
      cage.add(rail);
    }
    map.group.add(cage);
    return doors;
  }
  function townStairs(map) {
    const base = 0.7 * mapScale;
    const material = new THREE.MeshStandardMaterial({ color: 0x6a6e68, metalness: 0.3, roughness: 0.8 });
    for (let i = 0; i < townExit.steps; i++) {
      const height = (i + 1) * townExit.rise;
      const step = new THREE.Mesh(new THREE.BoxGeometry(townExit.depth, height, townExit.width), material);
      step.position.set(townExit.start + (i + 0.5) * townExit.depth, base + height / 2, townExit.z);
      map.group.add(step);
    }
    const start = townExit.start + townExit.steps * townExit.depth;
    const height = townExit.steps * townExit.rise;
    const platform = new THREE.Mesh(new THREE.BoxGeometry(townExit.end - start, height, townExit.width), material);
    platform.position.set((start + townExit.end) / 2, base + height / 2, townExit.z);
    map.group.add(platform);
    const light = new THREE.PointLight(0xffe3ae, 45, 16, 2);
    light.position.set(start, base + height + 4, townExit.z);
    map.group.add(light);
  }
  function townPadlock(parent, x, y, z) {
    const lock = padlock(parent, x, y, z);
    const brass = new THREE.MeshStandardMaterial({ color: 0x80683c, metalness: 0.8, roughness: 0.5 });
    const steel = new THREE.MeshStandardMaterial({ color: 0x89908a, metalness: 0.85, roughness: 0.4 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x141814, roughness: 0.9 });
    lock.traverse((object) => {
      if (object.isMesh)
        object.material = object.material === padMat ? brass : object.material === mats.steel ? steel : dark;
    });
    return lock;
  }
  function townChest(map, doors) {
    const pos = findClearPoint(map, map.entry[0] + 1.5, map.entry[1] - 1);
    if (!pos || Math.abs(pos[0] - map.entry[0]) > 4 || Math.abs(pos[2] - map.entry[1]) > 4)
      throw new Error('Aucun emplacement libre dans l’enclos pour le coffre.');
    const chest = new THREE.Group();
    chest.position.set(pos[0], pos[1], pos[2]);
    interactive(chest, 'town_chest', 'Ouvrir le coffre à code', 'use');
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x594a35, metalness: 0.55, roughness: 0.75 });
    const metal = new THREE.MeshStandardMaterial({ color: 0x262b29, metalness: 0.8, roughness: 0.5 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.48, 0.7), bodyMat);
    body.position.y = 0.24;
    chest.add(body);
    for (const x of [-0.43, 0.43]) {
      const band = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.49, 0.72), metal);
      band.position.set(x, 0.24, 0);
      chest.add(band);
      for (const y of [0.09, 0.38]) {
        const bolt = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), metal);
        bolt.position.set(x, y, 0.37);
        chest.add(bolt);
      }
    }
    const lid = new THREE.Group();
    lid.position.set(0, 0.48, -0.35);
    const lidMesh = new THREE.Mesh(new THREE.BoxGeometry(1.14, 0.16, 0.74), metal);
    lidMesh.position.set(0, 0.08, 0.35);
    lid.add(lidMesh);
    for (const x of [-0.43, 0.43]) {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.02, 0.75), bodyMat);
      strip.position.set(x, 0.17, 0.35);
      lid.add(strip);
    }
    lid.rotation.x = State.townGateOpen ? -Math.PI / 2 : 0;
    chest.add(lid);
    const latch = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.2, 0.04), metal);
    latch.position.set(0, 0.43, 0.37);
    chest.add(latch);
    const lock = townPadlock(chest, 0, 0.37, 0.41);
    lock.scale.setScalar(1.5);
    if (State.townGateOpen) hideObj(lock);
    map.group.add(chest);

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 192;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#222820';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffe6a0';
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText('CODE DU COFFRE', 256, 45);
    ctx.font = 'bold 105px monospace';
    ctx.fillText(CONFIG.townCode, 256, 155);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const clue = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.675),
      new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide }));
    clue.rotation.x = -Math.PI / 2;
    clue.position.set(map.entry[0] + 1, 0.7 * mapScale + 0.04, map.entry[1] + 1.3);
    clue.raycast = () => {};
    map.group.add(clue);

    Actions.register('town_chest', async () => {
      const p = chest.getWorldPosition(new THREE.Vector3());
      if (Math.hypot(p.x - rig.pos.x, p.z - rig.pos.z) > 3.5)
        return say('Approchez-vous du coffre.', 2500);
      if (State.townGateOpen) return say('Le coffre est ouvert et la porte est déverrouillée.', 2500);
      if (!await askCode('CADENAS DU COFFRE', CONFIG.townCode.length, CONFIG.townCode)) return;
      State.townGateOpen = true;
      hideObj(lock);
      SND.play('unlock');
      tween(1, (k) => {
        lid.rotation.x = -Math.PI / 2 * k;
        doors.forEach(({ hinge, side }) => { hinge.rotation.y = -side * Math.PI / 2 * k; });
      });
      setObjective(objectiveNow());
      say('Coffre ouvert : la porte et la carte sont déverrouillées.', 5000);
    });
  }
  function townMedkits(map) {
    if (!townKits.length) {
      const ordered = townPopulation.slice().sort((a, b) => a.x - b.x);
      for (let i = 0; i < 12; i++) {
        const p = ordered[Math.floor((i + 0.5) * ordered.length / 12)];
        townKits.push({ x: p.x, y: p.y, z: p.z - offset, taken: false });
      }
    }
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xd9e1d5, roughness: 0.65 });
    const crossMaterial = new THREE.MeshBasicMaterial({ color: 0xe23333 });
    townKits.forEach((kit, i) => {
      const group = new THREE.Group();
      group.position.set(kit.x, kit.y, kit.z);
      group.visible = !kit.taken;
      interactive(group, 'town_medkit_' + i, 'Prendre une trousse de soin', 'pickup');
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.45, 0.3), bodyMaterial);
      body.position.y = 0.35;
      group.add(body);
      const badge = new THREE.Group();
      badge.position.set(0, 0.36, 0.16);
      badge.add(new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.08, 0.02), crossMaterial));
      badge.add(new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.02), crossMaterial));
      group.add(badge);
      const icon = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0xff4a3d }));
      icon.position.y = 1.2;
      icon.scale.set(0.22, 0.22, 1);
      icon.raycast = () => {};
      group.add(icon);
      map.group.add(group);
      if (kit.taken) hideObj(group);
      Actions.register('town_medkit_' + i, () => {
        if (kit.taken) return;
        if (State.hp >= 100) return say('Votre vie est déjà au maximum.', 2500);
        if (healingRemaining > 0) return say('Un soin est déjà en cours.', 2500);
        healingRemaining = Math.min(40, 100 - State.hp);
        kit.taken = true;
        hideObj(group);
        SND.play('paper');
        say('Trousse utilisée : votre vie remonte progressivement.', 3000);
      });
    });
  }
  function navigation() {
    if (api.active !== 'town') return null;
    const nav = current.nav, target = nearestCell(nav, rig.pos.x, rig.pos.z), now = performance.now();
    if (target < 0) return null;
    if (nav.field && now - nav.updated < 1000) return nav;
    const field = new Int32Array(nav.walkable.length);
    field.fill(-1);
    const queue = new Int32Array(field.length);
    let head = 0, tail = 0;
    queue[tail++] = target;
    field[target] = 0;
    while (head < tail) {
      const i = queue[head++], col = i % nav.width, row = Math.floor(i / nav.width);
      for (const [dx, dz, bit] of [[1, 0, 1], [-1, 0, 2], [0, 1, 4], [0, -1, 8]]) {
        if (!(nav.edges[i] & bit)) continue;
        const x = col + dx, z = row + dz;
        if (x < 0 || x >= nav.width || z < 0 || z >= nav.height) continue;
        const next = z * nav.width + x;
        if (!nav.walkable[next] || field[next] !== -1) continue;
        field[next] = field[i] + 1;
        queue[tail++] = next;
      }
    }
    nav.field = field;
    nav.target = target;
    nav.updated = now;
    return nav;
  }
  api.zombieTarget = (x, z) => {
    const nav = navigation();
    if (!nav) return null;
    const i = nearestCell(nav, x, z);
    if (i < 0 || nav.field[i] < 0) return null;
    if (nav.field[i] <= 1) return [rig.pos.x, rig.pos.z];
    const col = i % nav.width, row = Math.floor(i / nav.width);
    let best = i;
    for (const [dx, dz, bit] of [[1, 0, 1], [-1, 0, 2], [0, 1, 4], [0, -1, 8]]) {
      if (!(nav.edges[i] & bit)) continue;
      const nx = col + dx, nz = row + dz;
      if (nx < 0 || nx >= nav.width || nz < 0 || nz >= nav.height) continue;
      const next = nz * nav.width + nx;
      if (nav.field[next] >= 0 && nav.field[next] < nav.field[best]) best = next;
    }
    return cellPosition(nav, best);
  };
  function townLocker(map) {
    const entry = map.entry;
    const pos = findClearPoint(map, entry[0] + 4, entry[1] + 4);
    if (!pos) throw new Error('Aucun emplacement libre pour le casier de Zombie Town.');
    const locker = new THREE.Group();
    locker.position.set(pos[0], pos[1], pos[2]);
    locker.rotation.y = Math.atan2(entry[0] - pos[0], entry[1] - pos[2]);
    interactive(locker, 'town_locker', 'Prendre son arme dans le casier', 'use');
    const cabinetMat = new THREE.MeshStandardMaterial({ color: 0x455b52, metalness: 0.55, roughness: 0.7 });
    const trimMat = new THREE.MeshStandardMaterial({ color: 0x202923, metalness: 0.65, roughness: 0.65 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 0.55), cabinetMat);
    body.position.y = 1;
    body.position.z = -0.275;
    locker.add(body);
    const door = new THREE.Group();
    door.position.set(-0.49, 0, 0.01);
    const face = new THREE.Mesh(new THREE.BoxGeometry(0.98, 1.96, 0.05), cabinetMat);
    face.position.set(0.49, 1, 0);
    door.add(face);
    for (let i = 0; i < 6; i++) {
      const vent = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.025, 0.02), trimMat);
      vent.position.set(0.45, 1.72 - i * 0.055, 0.035);
      door.add(vent);
    }
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.22, 0.05), trimMat);
    handle.position.set(0.85, 1.04, 0.05);
    door.add(handle);
    const lock = townPadlock(door, 0.85, 0.9, 0.09);
    door.rotation.y = State.armed ? -1.35 : 0;
    if (State.armed) hideObj(lock);
    locker.add(door);
    map.group.add(locker);
    Actions.register('town_locker', () => {
      const p = locker.getWorldPosition(new THREE.Vector3());
      if (Math.hypot(p.x - rig.pos.x, p.z - rig.pos.z) > 3.5 * sceneScale) return say('Approchez-vous du casier.', 2500);
      if (State.armed) {
        if (AV.stats && AV.stats.mag && State.ammo < AV.stats.mag) {
          State.ammo = AV.stats.mag;
          hud();
          SND.play('reload');
          return say('Chargeur rempli.', 2500);
        }
        return say('Votre arme et vos munitions sont prêtes.', 2500);
      }
      if (!equipWeapon()) return;
      hideObj(lock);
      tween(0.7, (k) => { door.rotation.y = -1.35 * k; });
      SND.play('locker');
      setObjective(objectiveNow());
      say('Arme équipée. Quittez la zone sûre pour affronter les infectés.', 5000);
    });
  }
  api.drawMap = (ctx, width, height) => {
    if (api.active === 'town' && !State.townGateOpen) {
      ctx.fillStyle = '#07100a';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#ffd070';
      ctx.font = 'bold 18px monospace';
      ctx.fillText('CARTE VERROUILLÉE', 15, 25);
      return;
    }
    const b = current.definition.bounds, top = 36;
    const scale = Math.min((width - 30) / current.plan.width, (height - top - 20) / current.plan.height);
    const left = (width - current.plan.width * scale) / 2;
    const y0 = top + (height - top - 20 - current.plan.height * scale) / 2;
    ctx.fillStyle = '#07100a';
    ctx.fillRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(current.plan, left, y0, current.plan.width * scale, current.plan.height * scale);
    ctx.imageSmoothingEnabled = true;
    const point = (x, z) => [left + ((x - b[0]) / 2) * scale, y0 + ((z - b[2]) / 2) * scale];
    current.definition.portals.forEach((p) => {
      const [x, y] = point(p.x, p.z);
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(x - 4, y - 4, 8, 8);
    });
    if (api.active === 'town') {
      ctx.fillStyle = '#ff3b2a';
      townPopulation.forEach((zombie) => {
        if (zombie.dead) return;
        const position = zombie.root ? zombie.root.position : zombie;
        const [x, y] = point(position.x, position.z - offset);
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    const [x, y] = point(rig.pos.x, rig.pos.z - offset);
    ctx.fillStyle = '#ffe078';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd070';
    ctx.font = 'bold 18px monospace';
    ctx.fillText(current.definition.name.toUpperCase(), 15, 25);
  };
  async function enter(id, returning = false) {
    if (busy) return;
    busy = true;
    rig.locked = true;
    const overlay = document.createElement('div');
    overlay.setAttribute('role', 'status');
    overlay.setAttribute('aria-live', 'polite');
    Object.assign(overlay.style, {
      position: 'fixed', inset: '0', zIndex: '9999', display: 'grid', placeItems: 'center', padding: '24px',
      boxSizing: 'border-box', color: '#d8fff1',
      background: 'radial-gradient(ellipse at center, #172b22, #07100a 70%)', font: '16px sans-serif'
    });
    const panel = document.createElement('div');
    Object.assign(panel.style, {
      width: 'min(480px, 100%)', padding: '28px', boxSizing: 'border-box',
      background: '#0a1712ed', border: '1px solid #396758', boxShadow: '0 20px 70px #000b'
    });
    const heading = document.createElement('div');
    heading.textContent = 'TRANSFERT EN COURS';
    Object.assign(heading.style, { color: '#89bfa9', fontSize: '12px', letterSpacing: '.18em', fontWeight: 'bold' });
    const title = document.createElement('h2');
    title.textContent = definitions[id].name;
    Object.assign(title.style, { margin: '12px 0 22px', fontSize: 'clamp(20px, 5vw, 28px)' });
    const status = document.createElement('div');
    Object.assign(status.style, { marginBottom: '12px', minHeight: '1.4em', color: '#b8d7c7' });
    const bar = document.createElement('progress');
    bar.max = 1;
    bar.setAttribute('aria-label', 'Progression de l’étape de chargement');
    Object.assign(bar.style, { width: '100%', height: '10px', accentColor: '#62d1ae' });
    const hint = document.createElement('p');
    hint.textContent = 'Préparation du terrain et des passages. Merci de patienter.';
    Object.assign(hint.style, { margin: '16px 0 0', color: '#829d8e', fontSize: '13px', lineHeight: '1.5' });
    panel.append(heading, title, status, bar, hint);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    const progress = (label, done, total) => {
      status.textContent = label;
      if (Number.isFinite(done) && Number.isFinite(total) && total > 0) bar.value = Math.min(1, done / total);
      else bar.removeAttribute('value');
    };
    let map;
    try {
      const definition = definitions[id];
      let prepared = preloaded.get(id);
      if (prepared) {
        preloaded.delete(id);
        progress('Installation de la carte préchargée…');
      } else {
        progress('Téléchargement de la carte…');
        await nextFrame();
        const gltf = await loader.loadAsync(new URL(definition.file, window.zombieMapBase).href, (event) => {
          const loaded = (event.loaded / 1048576).toFixed(1);
          const total = event.total > 0 ? (event.total / 1048576).toFixed(1) : null;
          progress('Téléchargement : ' + loaded + (total ? ' / ' + total : '') + ' Mo', event.loaded, event.total);
        });
        progress('Construction des collisions…');
        await nextFrame();
        gltf.scene.scale.multiplyScalar(mapScale);
        prepared = { gltf, octree: new Octree().fromGraphNode(gltf.scene) };
      }
      const { gltf, octree } = prepared;
      const group = new THREE.Group();
      group.position.z = offset;
      group.add(gltf.scene);
      map = { id, definition, octree, group };
      gltf.scene.traverse((object) => {
        if (object.isMesh) {
          object.castShadow = false;
          object.receiveShadow = false;
          object.raycast = () => {};
        }
        if (object.isLight) object.visible = false;
      });
      const proxy = new THREE.Object3D();
      proxy.raycast = (raycaster, intersects) => {
        const ray = raycaster.ray.clone();
        ray.origin.z -= offset;
        const hit = octree.rayIntersect(ray);
        if (hit && hit.distance >= raycaster.near && hit.distance <= raycaster.far) {
          hit.position.z += offset;
          intersects.push({ distance: hit.distance, point: hit.position, object: proxy });
        }
      };
      group.add(proxy);
      if (id === 'city') {
        const roof = new THREE.Mesh(
          new THREE.BoxGeometry(72 * mapScale, 0.3, 66 * mapScale),
          new THREE.MeshStandardMaterial({ color: 0x303636, roughness: 1 })
        );
        roof.position.set(-2 * mapScale, 18 * mapScale, 0);
        group.add(roof);
        for (const x of [-20, 20]) for (const z of [-20, 20]) {
          const light = new THREE.PointLight(0xcfe8ff, 220 * mapScale * mapScale, 38 * mapScale, 2);
          light.position.set(x * mapScale, 15 * mapScale, z * mapScale);
          group.add(light);
        }
      } else {
        const floor = new THREE.Mesh(
          new THREE.PlaneGeometry(110 * mapScale, 30 * mapScale),
          new THREE.MeshStandardMaterial({ color: 0x373a38, roughness: 1 })
        );
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(1.5 * mapScale, 0.66 * mapScale, 0);
        floor.raycast = () => {};
        group.add(floor);
      }
      const start = returning && definition.returnPoint ? definition.returnPoint : definition.entry;
      const entry = findClearPoint(map, start[0], start[1]);
      if (!entry) throw new Error('Point d’entrée inaccessible.');
      map.entry = [entry[0], entry[2]];
      if (id === 'town') townStairs(map);
      definition.portals.forEach((p) => portal(map, p));
      if (id === 'town') townLocker(map);
      progress('Analyse du terrain…', 0, 1);
      await nextFrame();
      map.plan = await makePlan(map, (stage, done, total) => progress(stage + '…', done, total));
      if (id === 'town') {
        progress('Chargement des infectés…');
        await ZombieAssets.loadZombies();
        if (!townPopulation.length) {
          progress('Vérification des chemins accessibles…');
          await nextFrame();
          const reachable = await reachableTown(map, (stage) => progress(stage + '…'));
          prepareTownPopulation(map, reachable);
        }
        townChest(map, townCage(map));
        townMedkits(map);
      }
      clearTownZombies();
      disposeMap(current);
      current = map;
      api.active = id;
      ground = entry[1];
      scene.fog.density = 0.01;
      scene.add(group);
      rig.pos.set(entry[0], entry[1] + 1.6, entry[2] + offset);
      rig.yaw = id === 'town' ? -Math.PI / 2 : returning ? 0 : Math.PI;
      rig.pitch = 0;
      rig.vy = rig.vp = 0;
      hud();
      setObjective(objectiveNow());
      say(id === 'town' && !State.townGateOpen ? 'Lisez le code au sol et ouvrez le coffre pour sortir.' :
        id === 'town' && !State.armed ? 'Prenez votre arme dans le casier près de l’entrée.' :
        'Carte chargée : ' + definition.name + '.', 5000);
    } catch (error) {
      disposeMap(map);
      console.error('Chargement de la carte impossible :', error);
      say('Impossible de charger la carte. Réessayez depuis le passage.', 7000);
    } finally {
      overlay.remove();
      rig.locked = false;
      busy = false;
    }
  }
  const originalDoor = Actions.handlers.door_exit3;
  Actions.register('door_exit3', (door) => {
    if (!State.doorExit3 || !State.breaker) return originalDoor(door);
    enter('city');
  });
  api.enter = enter;
  return api;
})();
