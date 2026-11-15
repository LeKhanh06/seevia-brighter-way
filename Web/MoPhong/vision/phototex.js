// Texture ảnh thật (Poly Haven, CC0 — nguồn trong MoPhong/textures/NGUON.txt): màu + gồ ghề (normal) + độ nhám.
// Ảnh nạp không đồng bộ: vật liệu hiện ngay với texture vẽ bằng code, rồi tự đổi sang ảnh khi tải xong.

import * as THREE from 'three';

const loader = new THREE.TextureLoader();
const base = new Map();
let anisotropy = 4;
export function setPhotoAnisotropy(n) { anisotropy = n; }

function load(file, srgb) {
  if (!base.has(file)) {
    const t = loader.load(new URL(`../textures/${file}`, import.meta.url).href);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    t.anisotropy = anisotropy;
    base.set(file, t);
  }
  return base.get(file);
}

/**
 * Gắn bộ texture `key` (duong | viahe | tuong) vào vật liệu, lặp theo `repeat`.
 * Ảnh màu được nhân với `material.color`, nên tường vẫn giữ màu sơn riêng từng căn.
 */
export function applyPhoto(material, key, repeat = [1, 1], { normalScale = 1 } = {}) {
  const pick = (suffix, srgb) => {
    const t = load(`${key}-${suffix}.jpg`, srgb).clone();
    t.repeat.set(repeat[0], repeat[1]);
    t.needsUpdate = true;
    return t;
  };
  material.map = pick('color', true);
  material.normalMap = pick('normal', false);
  material.normalScale = new THREE.Vector2(normalScale, normalScale);
  material.roughnessMap = pick('rough', false);
  material.roughness = 1;
  material.needsUpdate = true;
  return material;
}
