// Cánh hoa bằng lăng rơi chậm quanh người chơi: chi tiết nhỏ cho cảm giác thơ mộng, không che tầm nhìn.
// Chỉ vẽ trong vòng ~9 m quanh camera và thu nhỏ dần về 0 ở rìa vùng, nên không bị "bật ra – biến mất" đột ngột.

import * as THREE from 'three';

const COLORS = [0xd9a7d8, 0xe6b4d6, 0xf2c6dc, 0xc9a2e0, 0xfff0cf];
const SPAN = { x: 15, y: 6.2, z: 20 };

export function createPetals(scene, { low = false } = {}) {
  if (low) return { update() {}, group: null };
  const N = 64;
  const geo = new THREE.CircleGeometry(0.5, 10);
  geo.scale(0.075, 0.048, 1);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  const inst = new THREE.InstancedMesh(geo, mat, N);
  inst.frustumCulled = false;
  const col = new THREE.Color();
  const seed = [];
  for (let i = 0; i < N; i++) {
    seed.push({ x: Math.random(), y: Math.random(), z: Math.random(), v: 0.18 + Math.random() * 0.22, ph: Math.random() * 6.28, sp: 0.4 + Math.random() * 0.8 });
    inst.setColorAt(i, col.setHex(COLORS[i % COLORS.length]));
  }
  if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
  scene.add(inst);

  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const p = new THREE.Vector3();
  const s = new THREE.Vector3();
  const wrap = (v, size) => ((v % size) + size) % size;
  let time = 0;
  return {
    group: inst,
    update(dt, camera) {
      time += dt;
      const cp = camera.position;
      for (let i = 0; i < N; i++) {
        const k = seed[i];
        const lx = wrap(k.x * SPAN.x + Math.sin(time * 0.3 * k.sp + k.ph) * 0.8 - cp.x, SPAN.x);
        const lz = wrap(k.z * SPAN.z + Math.cos(time * 0.25 * k.sp + k.ph) * 0.9 - cp.z, SPAN.z);
        const ly = wrap(k.y * SPAN.y - time * k.v, SPAN.y);
        // thu nhỏ dần về 0 ở rìa vùng và sát mặt đất để không "bật" ra
        const edge = Math.min(lx, SPAN.x - lx, lz, SPAN.z - lz) / 2.2;
        const base = Math.min(1, edge, ly / 0.4, (SPAN.y - ly) / 0.8);
        const sc = Math.max(0, base);
        p.set(cp.x + lx - SPAN.x / 2, 0.15 + ly, cp.z + lz - SPAN.z / 2);
        e.set(time * k.sp + k.ph, time * 0.7 * k.sp, k.ph + Math.sin(time * 0.5 + k.ph));
        q.setFromEuler(e);
        s.set(sc, sc, sc);
        m.compose(p, q, s);
        inst.setMatrixAt(i, m);
      }
      inst.instanceMatrix.needsUpdate = true;
    },
  };
}
