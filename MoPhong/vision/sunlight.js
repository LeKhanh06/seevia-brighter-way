// Ánh nắng buổi sáng: tia nắng xuyên tán cây, hạt bụi bay trong nắng và quầng chói mặt trời (lớp phủ CSS có kiểm tra bị nhà che).
// Tất cả là hiệu ứng thị giác nhẹ, tự tắt khi chọn ?quality=low.

import * as THREE from 'three';
import { SUN_DIR } from './environment.js';

// Hạt bụi/ánh sáng mềm: sprite tròn mờ dần ra rìa, đủ lớn để không bị nhấp nháy khi nhỏ hơn một điểm ảnh.
function moteTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,248,230,1)');
  gr.addColorStop(0.35, 'rgba(255,240,205,0.55)');
  gr.addColorStop(1, 'rgba(255,235,190,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ───────── Tia nắng (light shafts) ─────────
function shaftTexture() {
  const W = 64;
  const H = 256;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d');
  const img = g.createImageData(W, H);
  for (let y = 0; y < H; y++) {
    const v = y / (H - 1);
    const along = Math.pow(Math.sin(Math.PI * v), 0.8); // mờ ở hai đầu
    for (let x = 0; x < W; x++) {
      const u = (x / (W - 1)) * 2 - 1;
      const across = Math.exp(-u * u * 3.4); // mờ dần ra hai mép
      const a = Math.max(0, Math.min(1, along * across));
      const i = (y * W + x) * 4;
      img.data[i] = 255;
      img.data[i + 1] = 226;
      img.data[i + 2] = 170;
      img.data[i + 3] = Math.round(a * 255);
    }
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * @param {THREE.Scene} scene
 * @param {{x:number,z:number,h:number}[]} sources  điểm nắng lọt qua (ngọn cây, đầu hẻm...), h = độ cao điểm bắt đầu
 */
export function createSunlight(scene, sources, { low = false } = {}) {
  const group = new THREE.Group();
  group.name = 'sunlight';
  scene.add(group);
  const lightDir = SUN_DIR.clone().negate(); // hướng ánh sáng đi tới mặt đất
  const tex = shaftTexture();
  const shafts = [];

  if (!low) {
    sources.forEach((s, i) => {
      const len = Math.min(26, s.h / Math.max(0.2, -lightDir.y) * 1.0);
      const mid = new THREE.Vector3(s.x, s.h, s.z).addScaledVector(lightDir, len / 2);
      const width = 1.6 + (i % 3) * 0.5;
      const mat = new THREE.MeshBasicMaterial({
        map: tex, transparent: true, opacity: 0.0, depthWrite: false, blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide, fog: false, toneMapped: false,
      });
      const base = 0.075 + ((i * 37) % 5) * 0.012;
      // hai mặt phẳng cắt chéo nhau để thấy từ nhiều hướng
      for (const rot of [0, Math.PI / 2]) {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(width, len), mat);
        m.position.copy(mid);
        // trục dài (Y của plane) hướng theo tia sáng
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), lightDir);
        const spin = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rot);
        m.quaternion.copy(q).multiply(spin);
        m.renderOrder = 5;
        m.frustumCulled = true;
        group.add(m);
      }
      shafts.push({ mat, base, pos: mid, phase: i * 1.7 });
    });
  }

  // ───── Hạt bụi trong nắng ─────
  let dust = null;
  const N = low ? 0 : 90;
  const SPAN = { x: 26, y: 7, z: 40 };
  const pos = new Float32Array(N * 3);
  const seed = new Float32Array(N * 3);
  if (N) {
    for (let i = 0; i < N; i++) {
      seed[i * 3] = Math.random();
      seed[i * 3 + 1] = Math.random();
      seed[i * 3 + 2] = Math.random();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const dm = new THREE.PointsMaterial({
      map: moteTexture(), color: 0xfff1d0, size: 0.16, sizeAttenuation: true, transparent: true, opacity: 0.32,
      depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    });
    dust = new THREE.Points(geo, dm);
    dust.frustumCulled = false;
    dust.renderOrder = 6;
    group.add(dust);
  }

  let time = 0;
  const wrap = (v, size) => ((v % size) + size) % size;

  return {
    group,
    update(dt, camera) {
      time += dt;
      const cp = camera.position;
      for (const s of shafts) {
        const d = cp.distanceTo(s.pos);
        // mờ khi ở rất gần (tránh che tầm nhìn) và khi ở quá xa; lung linh rất nhẹ
        const near = Math.min(1, Math.max(0, (d - 3) / 9));
        const far = Math.min(1, Math.max(0, (60 - d) / 25));
        const flick = 0.88 + 0.12 * Math.sin(time * 0.6 + s.phase);
        s.mat.opacity = s.base * near * far * flick;
      }
      if (dust) {
        const arr = dust.geometry.attributes.position.array;
        for (let i = 0; i < N; i++) {
          const sx = seed[i * 3];
          const sy = seed[i * 3 + 1];
          const sz = seed[i * 3 + 2];
          const dx = Math.sin(time * 0.11 + sx * 40) * 1.2;
          const dy = Math.sin(time * 0.17 + sy * 30) * 0.6 + time * 0.03;
          const dz = Math.cos(time * 0.09 + sz * 50) * 1.4;
          arr[i * 3] = cp.x + (wrap(sx * SPAN.x + dx - cp.x, SPAN.x) - SPAN.x / 2);
          arr[i * 3 + 1] = 0.4 + wrap(sy * SPAN.y + dy, SPAN.y);
          arr[i * 3 + 2] = cp.z + (wrap(sz * SPAN.z + dz - cp.z, SPAN.z) - SPAN.z / 2);
        }
        dust.geometry.attributes.position.needsUpdate = true;
      }
    },
  };
}

// ───────── Quầng chói mặt trời trên màn hình (CSS), kiểm tra bị nhà che ─────────
const _v = new THREE.Vector3();
const _fwd = new THREE.Vector3();
const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function rayHitsBox(o, d, b) {
  let tmin = 0;
  let tmax = Infinity;
  for (const k of ['x', 'y', 'z']) {
    const lo = b.min[k];
    const hi = b.max[k];
    if (Math.abs(d[k]) < 1e-9) {
      if (o[k] < lo || o[k] > hi) return false;
    } else {
      let t1 = (lo - o[k]) / d[k];
      let t2 = (hi - o[k]) / d[k];
      if (t1 > t2) [t1, t2] = [t2, t1];
      tmin = Math.max(tmin, t1);
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) return false;
    }
  }
  return true;
}

export class SunFlare {
  /** @param {{pos:number[],size:number[]}[]} blockers  hộp bao các toà nhà (toạ độ thế giới) */
  constructor(blockers) {
    this.root = document.getElementById('sunflare');
    this.core = this.root.querySelector('.core');
    this.ghosts = [...this.root.querySelectorAll('.g')];
    this.boxes = blockers.map((o) => ({
      min: { x: o.pos[0] - o.size[0] / 2, y: o.pos[1] - o.size[1] / 2, z: o.pos[2] - o.size[2] / 2 },
      max: { x: o.pos[0] + o.size[0] / 2, y: o.pos[1] + o.size[1] / 2, z: o.pos[2] + o.size[2] / 2 },
    }));
    this.vis = 0;
    this._t = 0;
    this._k = 0;
    this.enabled = true;
    const specs = [
      { size: 70, color: 'rgba(255,214,150,0.22)', at: -0.55 },
      { size: 150, color: 'rgba(255,190,120,0.12)', at: -1.05 },
      { size: 40, color: 'rgba(200,225,255,0.16)', at: -1.6 },
    ];
    this.ghosts.forEach((g, i) => {
      const sp = specs[i];
      if (!sp) return;
      g.style.width = g.style.height = sp.size + 'px';
      g.style.marginLeft = g.style.marginTop = -sp.size / 2 + 'px';
      g.style.background = `radial-gradient(circle, ${sp.color} 0, rgba(255,200,140,0) 70%)`;
      g.dataset.at = sp.at;
    });
  }

  _visibility(camera) {
    // 5 tia lệch nhẹ quanh hướng mặt trời → độ che mượt thay vì bật/tắt đột ngột
    const o = camera.position;
    let free = 0;
    const offs = [[0, 0], [0.02, 0], [-0.02, 0], [0, 0.02], [0, -0.02]];
    const d = new THREE.Vector3();
    for (const [ax, ay] of offs) {
      d.copy(SUN_DIR);
      d.x += ax;
      d.y += ay;
      d.normalize();
      let hit = false;
      for (const b of this.boxes) {
        if (Math.abs(b.min.x - o.x) > 200 || Math.abs(b.min.z - o.z) > 300) continue;
        if (rayHitsBox(o, d, b)) { hit = true; break; }
      }
      if (!hit) free++;
    }
    return free / offs.length;
  }

  update(dt, camera) {
    if (!this.enabled) {
      this.root.style.opacity = '0';
      return;
    }
    camera.getWorldDirection(_fwd);
    const facing = _fwd.dot(SUN_DIR);
    const target = smooth(0.28, 0.72, facing);
    // tính độ che mỗi ~0,12 giây để tiết kiệm CPU
    this._t += dt;
    if (this._t > 0.12) {
      this._t = 0;
      this._k = target > 0.001 ? this._visibility(camera) : 0;
    }
    this.vis += (this._k * target - this.vis) * Math.min(1, dt * 2.2);
    // vị trí mặt trời trên màn hình
    _v.copy(camera.position).addScaledVector(SUN_DIR, 400).project(camera);
    const W = window.innerWidth;
    const H = window.innerHeight;
    const x = (_v.x * 0.5 + 0.5) * W;
    const y = (-_v.y * 0.5 + 0.5) * H;
    this.root.style.opacity = this.vis.toFixed(3);
    this.core.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    const cx = W / 2;
    const cy = H / 2;
    for (const g of this.ghosts) {
      const k = +g.dataset.at || 0;
      g.style.transform = `translate(${(cx + (x - cx) * k).toFixed(1)}px, ${(cy + (y - cy) * k).toFixed(1)}px)`;
    }
  }
}
