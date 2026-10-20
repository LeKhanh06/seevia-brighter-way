// Nhận diện theo yêu cầu: Raycast từ camera ảo + nón nhìn + dữ liệu không gian có cấu trúc.
// Không có webcam, không nhận diện liên tục, không gọi dịch vụ ngoài.

import * as THREE from 'three';
import { NOT_FOUND, GROUPS } from './data.js';
import { pickTarget, identifyText, describeSurroundings } from './recognition.js';

const MAX_DISTANCE = 30;

// Chùm tia quanh tâm màn hình (toạ độ NDC): giúp người dùng ngắm không cần chính xác tuyệt đối.
const RINGS = [
  { r: 0, n: 1, angle: 0 },
  { r: 0.07, n: 8, angle: 0.043 },
  { r: 0.15, n: 8, angle: 0.092 },
  { r: 0.28, n: 12, angle: 0.17 },
];

export class Recognizer {
  constructor(camera, scene, registry, pickables, zones) {
    this.camera = camera;
    this.scene = scene;
    this.registry = registry;
    this.pickables = pickables;
    this.zones = zones;
    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = MAX_DISTANCE;
    this._v = new THREE.Vector2();
  }

  _objectId(o) {
    while (o) {
      if (o.userData && o.userData.objectId) return o.userData.objectId;
      o = o.parent;
    }
    return null;
  }

  /** Nhấn E: chỉ một vật thể được chọn. */
  identify(cam, aspect = 1.6) {
    this.scene.updateMatrixWorld(true);
    const hits = [];
    const best = new Map();
    for (const ring of RINGS) {
      for (let k = 0; k < ring.n; k++) {
        const a = (k / ring.n) * Math.PI * 2;
        this._v.set((Math.cos(a) * ring.r) / aspect, Math.sin(a) * ring.r);
        this.raycaster.setFromCamera(this._v, this.camera);
        const res = this.raycaster.intersectObjects(this.pickables, true);
        for (const h of res) {
          const id = this._objectId(h.object);
          if (!id) continue;
          const obj = this.registry.get(id);
          if (!obj) continue;
          const prev = best.get(id);
          if (!prev || ring.angle < prev.angle) {
            const rec = { obj, angle: ring.angle, distance: h.distance, point: h.point.clone() };
            best.set(id, rec);
          }
          break; // chỉ vật thể đầu tiên trên tia (bị che khuất thì bỏ qua)
        }
      }
    }
    hits.push(...best.values());
    const target = pickTarget(hits);
    if (!target) return { obj: null, text: NOT_FOUND, point: null };
    const rec = best.get(target.id);
    return { obj: target, text: identifyText(cam, target), point: rec.point };
  }

  /** Nhấn Space: mô tả ngắn xung quanh (tối đa 3 ý). */
  scan(cam) {
    const res = describeSurroundings(cam, this.registry.list, { zones: this.zones, radius: 14 });
    return { text: res.text, mentioned: res.mentioned };
  }
}

export { GROUPS };
