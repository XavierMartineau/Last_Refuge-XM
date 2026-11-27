/* LAST REFUGE · XM — Cartes de fin : chargement à la demande et exploration. */
'use strict';
const MapScenes = (() => {
  const offset = -1000;
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
        { x: 25, z: 0, label: 'FIN DE L’EXPLORATION', target: 'end' }
      ]
    }
  };
  const loader = new GLTFLoader();
  const down = new THREE.Vector3(0, -1, 0);
  const api = { active: null, height: () => ground };
  let current = null, ground = 0, busy = false;

  function floorAt(octree, x, z, from) {
    const hit = octree.rayIntersect(new THREE.Ray(new THREE.Vector3(x, from, z), down));
    return hit && hit.distance <= 2 ? hit.position.y : null;
  }
  function clearAt(octree, x, z, y) {
    const capsule = new Capsule(
      new THREE.Vector3(x, y + 0.4, z),
      new THREE.Vector3(x, y + 1.3, z),
      0.3
    );
    const hit = octree.capsuleIntersect(capsule);
    return !hit || hit.depth < 0.04;
  }
  function pointHeight(map, x, z, previous) {
    if (map.id === 'town') return 0.7;
    return floorAt(map.octree, x, z, previous + 0.65);
  }
  api.blocked = (x, z) => {
    const localZ = z - offset, b = current.definition.bounds;
    if (x < b[0] + 0.3 || x > b[1] - 0.3 || localZ < b[2] + 0.3 || localZ > b[3] - 0.3)
      return true;
    const y = pointHeight(current, x, localZ, ground);
    if (y === null || Math.abs(y - ground) > 0.45 || !clearAt(current.octree, x, localZ, y)) return true;
    ground = y;
    return false;
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
  function portal(map, info) {
    const y = map.id === 'town' ? 0.7 : floorAt(map.octree, info.x, info.z, 1.3);
    if (y === null || !clearAt(map.octree, info.x, info.z, y))
      throw new Error('Passage inaccessible : ' + info.label);
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 2.2, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x13443e, emissive: 0x1fcdb3, emissiveIntensity: 0.7 })
    );
    mesh.position.set(info.x, y + 1.1, info.z);
    interactive(mesh, 'map_' + info.target, info.label, 'use');
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
    label.position.set(0, 1.45, 0);
    label.scale.set(4, 0.75, 1);
    label.raycast = () => {};
    mesh.add(label);
    map.group.add(mesh);
    Actions.register('map_' + info.target, () => {
      const p = mesh.getWorldPosition(new THREE.Vector3());
      if (Math.hypot(p.x - rig.pos.x, p.z - rig.pos.z) > 3.5)
        return say('Approchez-vous du passage.', 2500);
      if (info.target === 'end') {
        document.getElementById('end').classList.add('on');
        modalOpen = true;
      } else if (info.target === 'complex') {
        disposeMap(current);
        current = null;
        api.active = null;
        rig.pos.set(0, 1.6, -309.6);
        rig.yaw = Math.PI;
        rig.pitch = 0;
        setObjective(objectiveNow());
      } else {
        enter(info.target, info.target === 'city');
      }
    });
  }
  function makePlan(map) {
    const b = map.definition.bounds, canvas = document.createElement('canvas');
    canvas.width = b[1] - b[0] + 1;
    canvas.height = b[3] - b[2] + 1;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0c1b11';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#6f8e79';
    for (let z = b[2]; z <= b[3]; z++) {
      for (let x = b[0]; x <= b[1]; x++) {
        const y = map.id === 'town' ? 0.7 : floorAt(map.octree, x, z, 1.3);
        if (y === null || !clearAt(map.octree, x, z, y)) ctx.fillRect(x - b[0], z - b[2], 1, 1);
      }
    }
    return canvas;
  }
  api.drawMap = (ctx, width, height) => {
    const b = current.definition.bounds, top = 36;
    const scale = Math.min((width - 30) / current.plan.width, (height - top - 20) / current.plan.height);
    const left = (width - current.plan.width * scale) / 2;
    const y0 = top + (height - top - 20 - current.plan.height * scale) / 2;
    ctx.fillStyle = '#07100a';
    ctx.fillRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(current.plan, left, y0, current.plan.width * scale, current.plan.height * scale);
    ctx.imageSmoothingEnabled = true;
    const point = (x, z) => [left + (x - b[0]) * scale, y0 + (z - b[2]) * scale];
    current.definition.portals.forEach((p) => {
      const [x, y] = point(p.x, p.z);
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(x - 4, y - 4, 8, 8);
    });
    const [x, y] = point(rig.pos.x, rig.pos.z - offset);
    ctx.fillStyle = '#ff3b2a';
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
    overlay.textContent = 'Chargement de la carte : ' + definitions[id].name + '…';
    Object.assign(overlay.style, {
      position: 'fixed', inset: '0', zIndex: '9999', display: 'grid', placeItems: 'center',
      color: '#d8fff1', background: '#07100a', font: 'bold 20px sans-serif'
    });
    document.body.appendChild(overlay);
    let map;
    try {
      await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));
      const definition = definitions[id];
      const gltf = await loader.loadAsync(new URL(definition.file, window.zombieMapBase).href);
      const octree = new Octree().fromGraphNode(gltf.scene);
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
          new THREE.BoxGeometry(72, 0.3, 66),
          new THREE.MeshStandardMaterial({ color: 0x303636, roughness: 1 })
        );
        roof.position.set(-2, 18, 0);
        group.add(roof);
        for (const x of [-20, 20]) for (const z of [-20, 20]) {
          const light = new THREE.PointLight(0xcfe8ff, 220, 38, 2);
          light.position.set(x, 15, z);
          group.add(light);
        }
      } else {
        const floor = new THREE.Mesh(
          new THREE.PlaneGeometry(110, 30),
          new THREE.MeshStandardMaterial({ color: 0x373a38, roughness: 1 })
        );
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(1.5, 0.66, 0);
        floor.raycast = () => {};
        group.add(floor);
      }
      definition.portals.forEach((p) => portal(map, p));
      map.plan = makePlan(map);
      const start = returning && definition.returnPoint ? definition.returnPoint : definition.entry;
      const y = id === 'town' ? 0.7 : floorAt(octree, start[0], start[1], 1.3);
      if (y === null || !clearAt(octree, start[0], start[1], y)) throw new Error('Point d’entrée inaccessible.');
      disposeMap(current);
      current = map;
      api.active = id;
      ground = y;
      scene.add(group);
      rig.pos.set(start[0], y + 1.6, start[1] + offset);
      rig.yaw = id === 'town' ? -Math.PI / 2 : returning ? 0 : Math.PI;
      rig.pitch = 0;
      rig.vy = rig.vp = 0;
      setObjective(objectiveNow());
      say('Carte chargée : ' + definition.name + '. Les infectés ne sont pas encore activés.', 5000);
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
  return api;
})();
