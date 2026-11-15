// Mô hình thật (Poly Haven, CC0) thay cho đồ vật dựng bằng code: chậu cây, ghế nhựa quán vỉa hè.
// Đồ dựng bằng code hiện ngay; tải xong mô hình thì đổi sang mô hình thật (giữ vị trí, id nhận diện).

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const MODELS = {
  pot: { url: 'potted_plant_02/potted_plant_02_1k.gltf', height: 0.95 },
  chair: { url: 'plastic_monobloc_chair_01/plastic_monobloc_chair_01_1k.gltf', height: 0.82 },
};

const loader = new GLTFLoader();
const cache = new Map();

function loadModel(key) {
  if (!cache.has(key)) {
    const m = MODELS[key];
    cache.set(key, loader.loadAsync(new URL(`../models/${m.url}`, import.meta.url).href).then((g) => {
      const root = g.scene;
      root.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
      // chuẩn hoá: đáy chạm đất, cao đúng `height`, tâm ở gốc
      const box = new THREE.Box3().setFromObject(root);
      const size = box.getSize(new THREE.Vector3());
      const s = m.height / Math.max(0.001, size.y);
      root.scale.setScalar(s);
      const c = box.getCenter(new THREE.Vector3());
      root.position.set(-c.x * s, -box.min.y * s, -c.z * s);
      const wrap = new THREE.Group();
      wrap.add(root);
      return wrap;
    }));
  }
  return cache.get(key);
}

/** Thay toàn bộ con của `group` (đồ dựng bằng code) bằng một bản sao mô hình thật khi tải xong. */
export function swapToReal(group, key, { yaw = 0 } = {}) {
  loadModel(key).then((model) => {
    const clone = model.clone(true);
    clone.rotation.y = yaw;
    for (const c of [...group.children]) c.visible = false;
    group.add(clone);
  }).catch((err) => console.warn(`Không tải được mô hình ${key}, giữ đồ dựng bằng code.`, err));
}

/** Đặt thêm một mô hình thật (không có bản dựng bằng code). */
export function placeReal(scene, key, x, y, z, yaw = 0) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  scene.add(g);
  swapToReal(g, key, { yaw });
  return g;
}
