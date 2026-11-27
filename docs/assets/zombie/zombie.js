import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone } from 'three/addons/utils/SkeletonUtils.js';

const definitions = [
  { file: 'animation_zombie.glb', walk: 'walk01', attack: 'attack01', death: 'death', height: 1.8 },
  { file: 'animated_zombie_cop_running_loop.glb', walk: 'Animation', height: 1.8 },
  { file: 'living_flesh_blob_-_free_organic_horror_asset.glb', walk: 'Armature|ArmatureAction', width: 1.4 }
];
const loader = new GLTFLoader();
loader.register((parser) => ({
  name: 'KHR_materials_pbrSpecularGlossiness',
  getMaterialType(index) {
    return parser.json.materials[index].extensions?.[this.name] ? THREE.MeshStandardMaterial : null;
  },
  async extendMaterialParams(index, params) {
    const extension = parser.json.materials[index].extensions?.[this.name];
    if (!extension) return;
    const factor = extension.diffuseFactor || [1, 1, 1, 1];
    params.color = new THREE.Color().fromArray(factor);
    params.opacity = factor[3];
    params.metalness = 0;
    params.roughness = 1 - (extension.glossinessFactor ?? 1);
    if (extension.diffuseTexture) {
      await parser.assignTexture(params, 'map', extension.diffuseTexture, THREE.SRGBColorSpace);
    }
  }
}));
const hitMaterial = new THREE.MeshBasicMaterial({ visible: false });
const hitGeometry = new THREE.BoxGeometry(1, 1, 1);
let models = null;
let loading = null;

export function loadZombies() {
  if (!loading) {
    loading = Promise.all(definitions.map(async (definition) => {
      const gltf = await loader.loadAsync(new URL(definition.file, import.meta.url).href);
      const walk = gltf.animations.find((clip) => clip.name === definition.walk);
      if (!walk) throw new Error('Animation absente : ' + definition.file);
      const mixer = new THREE.AnimationMixer(gltf.scene);
      mixer.clipAction(walk).play();
      mixer.update(0);
      gltf.scene.updateMatrixWorld(true);
      const bounds = new THREE.Box3().setFromObject(gltf.scene, true);
      mixer.stopAllAction();
      mixer.uncacheRoot(gltf.scene);
      const size = bounds.getSize(new THREE.Vector3());
      const dimension = definition.height ? size.y : Math.max(size.x, size.z);
      if (!Number.isFinite(dimension) || dimension <= 0) {
        throw new Error('Modèle ou animation invalide : ' + definition.file);
      }
      return { ...definition, gltf, bounds, scale: (definition.height || definition.width) / dimension };
    })).then((loaded) => { models = loaded; });
  }
  return loading;
}

export function zombiesReady() {
  return models !== null;
}

export function createZombie(variant) {
  if (!models) throw new Error('Les modèles des infectés ne sont pas encore chargés.');
  const model = models[variant % models.length];
  const root = new THREE.Group();
  const body = new THREE.Group();
  const visual = clone(model.gltf.scene);
  const center = model.bounds.getCenter(new THREE.Vector3());
  visual.scale.setScalar(model.scale);
  visual.position.set(-center.x * model.scale, -model.bounds.min.y * model.scale, -center.z * model.scale);
  visual.traverse((object) => {
    if (object.isMesh) {
      object.castShadow = false;
      object.receiveShadow = false;
      object.frustumCulled = false;
    }
  });
  body.add(visual);
  root.add(body);
  const height = (model.bounds.max.y - model.bounds.min.y) * model.scale;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 16;
  const texture = new THREE.CanvasTexture(canvas);
  const bar = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: true }));
  bar.position.y = height + 0.3;
  bar.scale.set(1.1, 0.14, 1);
  bar.visible = false;
  bar.raycast = () => {};
  root.add(bar);
  const width = model.height ? 0.65 : Math.max(0.5, (model.bounds.max.x - model.bounds.min.x) * model.scale);
  const hitboxes = [];
  function hitbox(y, h, head) {
    const box = new THREE.Mesh(hitGeometry, hitMaterial);
    box.position.y = y;
    box.scale.set(width, h, Math.max(0.5, width));
    box.userData.head = head;
    root.add(box);
    hitboxes.push(box);
  }
  if (model.height) {
    hitbox(height * 0.43, height * 0.86, false);
    hitbox(height * 0.93, height * 0.2, true);
  } else {
    hitbox(height * 0.5, Math.max(height, 0.4), false);
  }
  const mixer = new THREE.AnimationMixer(visual);
  const clips = new Map(model.gltf.animations.map((clip) => [clip.name, clip]));
  const walk = mixer.clipAction(clips.get(model.walk));
  walk.play();
  walk.time = Math.random() * walk.getClip().duration;
  const zombie = { root, body, hitboxes, mixer, clips, walk, attack: model.attack, death: model.death, dead: false, bar, canvas, texture };
  mixer.addEventListener('finished', (event) => {
    if (!zombie.dead && event.action.getClip().name === zombie.attack) {
      walk.reset().play().crossFadeFrom(event.action, 0.15, false);
    }
  });
  return zombie;
}

export function setZombieHealth(zombie, fraction) {
  const ctx = zombie.canvas.getContext('2d');
  ctx.fillStyle = '#160707';
  ctx.fillRect(0, 0, 128, 16);
  ctx.fillStyle = '#e83d32';
  ctx.fillRect(2, 2, 124 * THREE.MathUtils.clamp(fraction, 0, 1), 12);
  zombie.texture.needsUpdate = true;
  zombie.bar.visible = fraction > 0;
}

export function animateZombie(zombie, dt, speed) {
  zombie.walk.timeScale = Math.max(0.35, speed);
  zombie.mixer.update(dt);
  if (zombie.attackTime > 0) {
    zombie.attackTime = Math.max(0, zombie.attackTime - dt);
    const lunge = Math.sin(Math.PI * zombie.attackTime / 0.6);
    zombie.body.rotation.x = -0.3 * lunge;
    zombie.body.position.z = 0.18 * lunge;
  }
}

export function attackZombie(zombie) {
  if (!zombie.attack) {
    zombie.attackTime = 0.6;
    return;
  }
  const action = zombie.mixer.clipAction(zombie.clips.get(zombie.attack));
  action.reset().setLoop(THREE.LoopOnce, 1);
  action.setEffectiveTimeScale(action.getClip().duration / 0.8);
  action.clampWhenFinished = false;
  action.play();
  action.crossFadeFrom(zombie.walk, 0.15, false);
}

export function killZombieModel(zombie) {
  zombie.dead = true;
  zombie.bar.visible = false;
  zombie.body.position.z = 0;
  if (!zombie.death) return false;
  zombie.mixer.stopAllAction();
  const action = zombie.mixer.clipAction(zombie.clips.get(zombie.death));
  action.reset().setLoop(THREE.LoopOnce, 1);
  action.clampWhenFinished = true;
  action.play();
  return true;
}

export function disposeZombie(zombie) {
  zombie.texture.dispose();
  zombie.bar.material.dispose();
  zombie.mixer.stopAllAction();
  zombie.mixer.uncacheRoot(zombie.mixer.getRoot());
  zombie.root.traverse((object) => {
    if (object.isSkinnedMesh && object.skeleton) object.skeleton.dispose();
  });
}
