// Vật liệu dùng chung + tiện ích dựng mesh.

import * as THREE from 'three';

const store = new Map();

/** Vật liệu PBR đơn giản, được chia sẻ giữa các mesh có cùng thông số (không dùng cho texture). */
export function mat(color, o = {}) {
  const key = color + '|' + (o.roughness ?? '') + '|' + (o.metalness ?? '') + '|' + (o.emissive ?? '') + '|' + (o.opacity ?? '') + '|' + (o.side ?? '');
  let m = store.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness: o.roughness ?? 0.82, metalness: o.metalness ?? 0 });
    if (o.emissive !== undefined) {
      m.emissive = new THREE.Color(o.emissive);
      m.emissiveIntensity = o.emissiveIntensity ?? 1;
    }
    if (o.opacity !== undefined && o.opacity < 1) {
      m.transparent = true;
      m.opacity = o.opacity;
    }
    if (o.side !== undefined) m.side = o.side;
    store.set(key, m);
  }
  return m;
}

export const glassMat = () => mat(0x22313c, { roughness: 0.08, metalness: 0.85 });
export const rubberMat = () => mat(0x1b1b1c, { roughness: 0.95 });
export const chromeMat = () => mat(0xc9ccd0, { roughness: 0.25, metalness: 0.9 });
export const plasticBlack = () => mat(0x202124, { roughness: 0.55 });

/** Tạo mesh nhanh. o: {x,y,z, rx,ry,rz, sx,sy,sz, cast, receive} */
export function mesh(geo, material, o = {}) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(o.x ?? 0, o.y ?? 0, o.z ?? 0);
  if (o.rx || o.ry || o.rz) m.rotation.set(o.rx ?? 0, o.ry ?? 0, o.rz ?? 0);
  if (o.sx !== undefined || o.sy !== undefined || o.sz !== undefined) m.scale.set(o.sx ?? 1, o.sy ?? 1, o.sz ?? 1);
  m.castShadow = o.cast ?? true;
  m.receiveShadow = o.receive ?? true;
  return m;
}

export const box = (w, h, d, material, o) => mesh(new THREE.BoxGeometry(w, h, d), material, o);
export const cyl = (rt, rb, h, seg, material, o) => mesh(new THREE.CylinderGeometry(rt, rb, h, seg), material, o);
export const sph = (r, material, o, ws = 14, hs = 10) => mesh(new THREE.SphereGeometry(r, ws, hs), material, o);
export const caps = (r, len, material, o) => mesh(new THREE.CapsuleGeometry(r, len, 4, 10), material, o);

/** Gắn id vật thể lên group gốc (dùng khi raycast tìm ngược lại dữ liệu). */
export function tagObject(group, id) {
  group.userData.objectId = id;
  return group;
}
