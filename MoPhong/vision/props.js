// Đồ vật đường phố: cây xanh, cột điện, dây điện, thùng rác, chậu cây, bàn ghế, xe đẩy, đèn giao thông...

import * as THREE from 'three';
import { mat, mesh, box, cyl, sph } from './materials.js';
import {
  rng, makeBark, makeLeafCluster, makeConcrete, makeBoardTexture, makeCabinetTexture, makeStripeTexture, makeRoadSign, makeBusStopSign,
} from './textures.js';
import { buildPerson } from './people.js';

let leafMaterialCache = null;
function leafMaterial() {
  if (!leafMaterialCache) {
    const map = makeLeafCluster();
    leafMaterialCache = new THREE.MeshStandardMaterial({
      map, alphaTest: 0.5, alphaToCoverage: true, side: THREE.DoubleSide, roughness: 0.85,
      emissive: new THREE.Color(0x1d3d14), emissiveMap: map, emissiveIntensity: 0.4,
    });
  }
  return leafMaterialCache;
}

function leafCloud(count, radii, center, size, r, baseV = 0.9, tint = null) {
  const inst = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), leafMaterial(), count);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const p = new THREE.Vector3();
  const s = new THREE.Vector3();
  const c = new THREE.Color();
  for (let i = 0; i < count; i++) {
    // điểm trong ellipsoid, thiên về phía ngoài để tán cây có "vỏ"
    let x, y, z;
    do {
      x = r() * 2 - 1;
      y = r() * 2 - 1;
      z = r() * 2 - 1;
    } while (x * x + y * y + z * z > 1);
    const k = 0.45 + 0.55 * Math.cbrt(r());
    const len = Math.hypot(x, y, z) || 1;
    p.set(center[0] + (x / len) * k * radii[0] * Math.min(1, len + 0.3), center[1] + (y / len) * k * radii[1] * Math.min(1, len + 0.3), center[2] + (z / len) * k * radii[2] * Math.min(1, len + 0.3));
    e.set(r() * 6.28, r() * 6.28, r() * 6.28);
    q.setFromEuler(e);
    const sc = size * (0.75 + r() * 0.7);
    s.set(sc, sc, sc);
    m.compose(p, q, s);
    inst.setMatrixAt(i, m);
    const v = baseV * (0.72 + r() * 0.4);
    if (tint) c.setRGB(tint[0] * (0.85 + r() * 0.3), tint[1] * (0.85 + r() * 0.3), tint[2] * (0.85 + r() * 0.3));
    else c.setRGB(v * (0.92 + r() * 0.1), v, v * (0.82 + r() * 0.1));
    inst.setColorAt(i, c);
  }
  inst.instanceMatrix.needsUpdate = true;
  if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
  inst.castShadow = true;
  inst.receiveShadow = true;
  return inst;
}

/** Cây xà cừ / bàng ven đường: thân sơn vôi trắng ở gốc, hố cây gạch, tán lá dày. */
export function buildTree(seed = 1, scale = 1) {
  const r = rng(seed * 131 + 7);
  const g = new THREE.Group();
  const bark = new THREE.MeshStandardMaterial({ map: makeBark(), roughness: 0.95 });
  const lean = (r() - 0.5) * 0.06;

  // hố cây
  const brick = mat(0x9b5b46, { roughness: 0.9 });
  g.add(box(1.0, 0.14, 0.14, brick, { z: 0.43, y: 0.07 }));
  g.add(box(1.0, 0.14, 0.14, brick, { z: -0.43, y: 0.07 }));
  g.add(box(0.14, 0.14, 0.72, brick, { x: 0.43, y: 0.07 }));
  g.add(box(0.14, 0.14, 0.72, brick, { x: -0.43, y: 0.07 }));
  g.add(cyl(0.4, 0.4, 0.06, 14, mat(0x4a3c2c, { roughness: 1 }), { y: 0.06, cast: false }));

  const trunk = mesh(new THREE.CylinderGeometry(0.17, 0.25, 3.8, 14), bark, { y: 1.9, rz: lean });
  g.add(trunk);
  g.add(cyl(0.255, 0.262, 0.95, 14, mat(0xe3e0d4, { roughness: 0.95 }), { y: 0.5 })); // vôi trắng
  g.add(cyl(0.262, 0.262, 0.05, 14, mat(0xc7bfa8, { roughness: 1 }), { y: 1.0 }));

  // cành chính
  const branchMat = bark;
  const nb = 5;
  for (let i = 0; i < nb; i++) {
    const a = (i / nb) * Math.PI * 2 + r() * 0.6;
    const tilt = 0.7 + r() * 0.4;
    const len = 2.0 + r() * 0.8;
    const b = mesh(new THREE.CylinderGeometry(0.05, 0.11, len, 8), branchMat, { y: 3.6 });
    b.rotation.set(0, 0, 0);
    b.position.set(Math.sin(a) * len * 0.5 * Math.sin(tilt), 3.6 + Math.cos(tilt) * len * 0.5, Math.cos(a) * len * 0.5 * Math.sin(tilt));
    b.rotation.order = 'YXZ';
    b.rotation.y = a;
    b.rotation.x = tilt;
    g.add(b);
  }

  // tán thoáng: lá nhỏ hơn, nâng cao để không che tầm nhìn ngang mắt; vẫn vươn ra phía đường
  g.add(leafCloud(300, [3.2, 1.6, 3.2], [0, 6.2, 0], 1.0, r, 0.95));
  g.add(leafCloud(150, [2.0, 1.1, 2.0], [0, 7.2, 0], 0.9, r, 1.0));
  for (let k = 0; k < 3; k++) {
    const a = r() * 6.28;
    g.add(leafCloud(70, [1.4, 0.8, 1.4], [Math.sin(a) * 2.5, 5.7 + r() * 0.7, Math.cos(a) * 2.5], 0.9, r, 0.92));
  }
  // vài chùm hoa bằng lăng (tím) hoặc phượng (đỏ cam) tuỳ cây, rất thưa
  if (seed % 3 === 0) g.add(leafCloud(34, [3.0, 1.5, 3.0], [0, 6.3, 0], 0.4, r, 1, [0.62, 0.38, 0.72]));
  else if (seed % 5 === 0) g.add(leafCloud(30, [2.9, 1.5, 2.9], [0, 6.4, 0], 0.4, r, 1, [0.85, 0.22, 0.12]));
  g.scale.setScalar(scale);
  g.userData.isTree = true;
  return g;
}

let concreteMat = null;
export function buildUtilityPole(seed = 1) {
  const r = rng(seed * 17 + 3);
  const g = new THREE.Group();
  concreteMat = concreteMat || new THREE.MeshStandardMaterial({ map: makeConcrete(), roughness: 0.95 });
  g.add(mesh(new THREE.CylinderGeometry(0.1, 0.16, 8.8, 12), concreteMat, { y: 4.4 }));
  const steel = mat(0x4b4f52, { metalness: 0.6, roughness: 0.5 });
  const ins = mat(0xcfc4a6, { roughness: 0.4 });
  for (const [y, w] of [[8.2, 1.7], [7.4, 1.3]]) {
    g.add(box(w, 0.07, 0.09, steel, { y }));
    for (const x of [-w * 0.42, -w * 0.14, w * 0.14, w * 0.42]) g.add(cyl(0.03, 0.04, 0.14, 8, ins, { x, y: y + 0.1 }));
  }
  if (r() < 0.6) g.add(cyl(0.3, 0.3, 0.85, 14, mat(0x7c8587, { metalness: 0.4, roughness: 0.55 }), { x: 0.45, y: 6.7 })); // máy biến áp
  g.add(box(0.34, 0.55, 0.2, mat(0x6e7476, { metalness: 0.3 }), { y: 1.7, x: 0.0, z: 0.0 })); // hộp điện
  g.add(box(0.3, 0.12, 0.012, mat(0xd9a620), { y: 1.95, x: 0, z: 0.11 }));
  return g;
}

/**
 * Dây điện võng giữa các cột + cụm dây rối đặc trưng phố Việt Nam.
 * poles: [{x,z}] — dùng để nối các cột cùng phía và vắt ngang đường.
 */
export function buildCables(poles, seed = 3) {
  const r = rng(seed);
  const g = new THREE.Group();
  const cableMat = mat(0x151517, { roughness: 0.55 });
  const tube = (pts, rad = 0.014) => {
    const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(p[0], p[1], p[2])));
    const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 22, rad, 5, false), cableMat);
    m.castShadow = true;
    g.add(m);
  };
  const sag = (a, b, drop) => [a, [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - drop, (a[2] + b[2]) / 2], b];
  const offsets = [[-0.7, 8.3], [-0.24, 8.3], [0.24, 8.3], [0.7, 8.3], [-0.55, 7.5], [-0.2, 7.5], [0.2, 7.5], [0.55, 7.5]];
  const sides = { left: poles.filter((p) => p.x < 0).sort((a, b) => a.z - b.z), right: poles.filter((p) => p.x > 0).sort((a, b) => a.z - b.z) };
  for (const list of Object.values(sides)) {
    for (let i = 0; i < list.length - 1; i++) {
      const a = list[i];
      const b = list[i + 1];
      for (const [ox, oy] of offsets) {
        const jitter = (r() - 0.5) * 0.06;
        const p0 = [a.x + ox, oy + jitter, a.z];
        const p1 = [b.x + ox, oy + jitter, b.z];
        const pts = sag(p0, p1, 0.5 + r() * 0.45);
        tube([pts[0], [pts[1][0], pts[1][1] + 0.35, (p0[2] * 3 + p1[2]) / 4], pts[1], [pts[1][0], pts[1][1] + 0.35, (p0[2] + p1[2] * 3) / 4], pts[2]]);
      }
    }
  }
  // dây vắt ngang đường
  for (const a of sides.left) {
    const b = sides.right.reduce((best, p) => (Math.abs(p.z - a.z) < Math.abs(best.z - a.z) ? p : best), sides.right[0]);
    if (!b || Math.abs(b.z - a.z) > 9) continue;
    for (let k = 0; k < 4; k++) {
      const p0 = [a.x + 0.3, 8.0 - k * 0.12, a.z + (r() - 0.5) * 0.3];
      const p1 = [b.x - 0.3, 7.8 - k * 0.1, b.z + (r() - 0.5) * 0.3];
      const mid = [(p0[0] + p1[0]) / 2, Math.min(p0[1], p1[1]) - 0.8 - r() * 0.3, (p0[2] + p1[2]) / 2];
      tube([p0, [(p0[0] + mid[0]) / 2, (p0[1] + mid[1]) / 2 - 0.08, (p0[2] + mid[2]) / 2], mid, [(mid[0] + p1[0]) / 2, (mid[1] + p1[1]) / 2 - 0.08, (mid[2] + p1[2]) / 2], p1], 0.012);
    }
  }
  // cụm dây rối quanh cột
  for (const p of poles) {
    for (let k = 0; k < 4; k++) {
      const pts = [];
      let x = p.x + (r() - 0.5) * 0.5;
      let y = 6.4 + r() * 1.4;
      let z = p.z + (r() - 0.5) * 0.5;
      for (let i = 0; i < 7; i++) {
        pts.push([x, y, z]);
        x += (r() - 0.5) * 0.7;
        y += (r() - 0.65) * 0.6;
        z += (r() - 0.5) * 0.9;
      }
      tube(pts, 0.012);
    }
  }
  return g;
}

export function buildTrashBin() {
  const g = new THREE.Group();
  const body = mat(0x2f7d55, { roughness: 0.6 });
  g.add(box(0.46, 0.78, 0.5, body, { y: 0.45 }));
  g.add(box(0.5, 0.06, 0.54, mat(0x1f5c3d, { roughness: 0.6 }), { y: 0.87 }));
  g.add(box(0.22, 0.03, 0.02, mat(0x111111), { y: 0.89, z: 0.28 }));
  for (const s of [-1, 1]) g.add(cyl(0.06, 0.06, 0.05, 10, mat(0x1b1b1c), { x: s * 0.2, y: 0.06, z: -0.2, rz: Math.PI / 2 }));
  g.add(box(0.3, 0.05, 0.01, mat(0xf2f2ee), { y: 0.62, z: 0.255 }));
  return g;
}

export function buildPlantPot(seed = 1) {
  const r = rng(seed * 29 + 5);
  const g = new THREE.Group();
  const prof = [new THREE.Vector2(0.001, 0), new THREE.Vector2(0.17, 0), new THREE.Vector2(0.24, 0.35), new THREE.Vector2(0.27, 0.4), new THREE.Vector2(0.25, 0.4)];
  const potColor = [0xa4573a, 0xd7d2c4, 0x3b6f8a, 0x8f3f35][(r() * 4) | 0];
  g.add(mesh(new THREE.LatheGeometry(prof, 16), mat(potColor, { roughness: 0.7, side: THREE.DoubleSide })));
  g.add(cyl(0.24, 0.24, 0.03, 14, mat(0x3a2e22, { roughness: 1 }), { y: 0.36 }));
  g.add(leafCloud(28, [0.34, 0.34, 0.34], [0, 0.72, 0], 0.42, r, 1.0));
  return g;
}

/** Bộ bàn ghế nhựa thấp + dù che, đặc trưng quán cà phê vỉa hè. */
export function buildCafeSet(seed = 1) {
  const r = rng(seed * 7 + 1);
  const g = new THREE.Group();
  g.add(cyl(0.33, 0.33, 0.035, 18, mat(0xcaa270, { roughness: 0.6 }), { y: 0.5 }));
  g.add(cyl(0.035, 0.05, 0.48, 8, mat(0x55585b, { metalness: 0.6 }), { y: 0.25 }));
  g.add(cyl(0.2, 0.2, 0.02, 12, mat(0x55585b, { metalness: 0.6 }), { y: 0.01 }));
  g.add(cyl(0.035, 0.035, 0.07, 10, mat(0xf3f3ee, { roughness: 0.2 }), { x: 0.07, y: 0.56 })); // ly
  const colors = [0xc62828, 0x1565c0, 0xe0a100, 0x2e7d32];
  const sc = colors[(r() * 4) | 0];
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.5;
    const stool = new THREE.Group();
    stool.add(cyl(0.16, 0.2, 0.36, 14, mat(sc, { roughness: 0.5 }), { y: 0.2 }));
    stool.add(cyl(0.2, 0.2, 0.03, 14, mat(sc, { roughness: 0.4 }), { y: 0.39 }));
    stool.position.set(Math.cos(a) * 0.58, 0, Math.sin(a) * 0.58);
    g.add(stool);
  }
  // dù
  g.add(cyl(0.025, 0.025, 2.3, 8, mat(0xd8d8d2, { metalness: 0.5 }), { x: 0.0, y: 1.15, z: 0.0 }));
  const canopy = mesh(new THREE.ConeGeometry(1.5, 0.5, 16, 1, true), mat(0xe9e0c6, { roughness: 0.9, side: THREE.DoubleSide }), { y: 2.3 });
  g.add(canopy);
  g.add(mesh(new THREE.TorusGeometry(1.5, 0.018, 6, 24), mat(0xb3261e), { y: 2.05, rx: Math.PI / 2, sz: 1 }));
  return g;
}

export function buildFoodCart() {
  const g = new THREE.Group();
  const red = mat(0xa8322a, { roughness: 0.5 });
  const steel = mat(0xc4c7c9, { metalness: 0.7, roughness: 0.35 });
  g.add(box(1.25, 0.65, 0.62, red, { y: 0.75 }));
  const glass = mat(0xbfdce6, { roughness: 0.05, opacity: 0.32, metalness: 0.2 });
  g.add(box(1.22, 0.58, 0.58, glass, { y: 1.35, cast: false }));
  for (const [x, z] of [[-0.61, -0.29], [0.61, -0.29], [-0.61, 0.29], [0.61, 0.29]]) g.add(cyl(0.012, 0.012, 0.6, 6, steel, { x, y: 1.35, z }));
  g.add(box(1.25, 0.03, 0.62, steel, { y: 1.66 }));
  // bánh mì
  const bread = mat(0xd9a45a, { roughness: 0.8 });
  for (let i = 0; i < 9; i++) g.add(mesh(new THREE.CapsuleGeometry(0.045, 0.28, 4, 8), bread, { x: -0.5 + i * 0.12, y: 1.15, z: -0.1 + (i % 2) * 0.16, rz: Math.PI / 2 + (i % 3) * 0.08 }));
  for (const s of [-1, 1]) {
    g.add(cyl(0.3, 0.3, 0.05, 18, mat(0x1b1b1c), { x: s * 0.52, y: 0.3, z: 0.0, rz: Math.PI / 2 }));
    g.add(cyl(0.1, 0.1, 0.06, 12, steel, { x: s * 0.52, y: 0.3, rz: Math.PI / 2 }));
  }
  g.add(cyl(0.02, 0.02, 1.0, 6, steel, { x: -0.7, y: 0.85, z: 0.0, rz: 0.3 }));
  // dù lớn
  g.add(cyl(0.02, 0.02, 1.6, 8, steel, { x: 0.45, y: 2.3, z: 0.0 }));
  g.add(mesh(new THREE.ConeGeometry(1.35, 0.42, 14, 1, true), mat(0x2f6f4e, { roughness: 0.9, side: THREE.DoubleSide }), { x: 0.45, y: 3.0 }));
  // biển
  const tex = makeBoardTexture([{ t: 'BÁNH MÌ', size: 44, bold: true, y: 110 }, { t: 'NÓNG GIÒN', size: 30, y: 180 }], '#8a2b22');
  const board = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.3), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 }));
  board.position.set(0, 0.75, 0.32);
  g.add(board);
  return g;
}

export function buildAFrameSign(lines) {
  const g = new THREE.Group();
  const tex = makeBoardTexture(lines);
  const face = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 });
  const edge = mat(0x2a2623);
  for (const s of [-1, 1]) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.85, 0.025), [edge, edge, edge, edge, face, face]);
    p.position.set(0, 0.45, s * 0.17);
    p.rotation.x = -s * 0.2;
    p.rotation.y = s < 0 ? Math.PI : 0;
    p.castShadow = true;
    g.add(p);
  }
  return g;
}

export function buildGoods(kind, seed = 1) {
  const r = rng(seed * 11 + 2);
  const g = new THREE.Group();
  if (kind === 'fruit') {
    g.add(box(1.2, 0.5, 0.6, mat(0x7b5b3a), { y: 0.25 }));
    const cols = [0xe67e22, 0xd62828, 0x2e7d32, 0xf1c40f, 0x8e2c6a];
    for (let i = 0; i < 4; i++) {
      const c = cols[(r() * cols.length) | 0];
      for (let k = 0; k < 8; k++) g.add(sph(0.075, mat(c, { roughness: 0.6 }), { x: -0.45 + i * 0.3 + (r() - 0.5) * 0.14, y: 0.55 + r() * 0.04, z: (r() - 0.5) * 0.35 }, 8, 6));
    }
    g.add(box(1.3, 0.04, 0.7, mat(0x2e7d32), { y: 1.7, cast: true })); // tấm che
    for (const x of [-0.6, 0.6]) g.add(cyl(0.015, 0.015, 1.2, 6, mat(0x555), { x, y: 1.1, z: 0.3 }));
  } else if (kind === 'baskets') {
    const cols = [0xd23b2d, 0x2c6fb7, 0xf0a30a, 0x3a9a4b];
    for (let i = 0; i < 6; i++) g.add(box(0.5, 0.28, 0.38, mat(cols[i % 4], { roughness: 0.5 }), { x: (i % 3) * 0.55 - 0.55, y: 0.14 + Math.floor(i / 3) * 0.29, z: 0 }));
  } else {
    g.add(box(0.9, 0.7, 0.5, mat(0xe8eef2, { roughness: 0.4 }), { y: 0.35 }));
    g.add(box(0.92, 0.06, 0.52, mat(0x2a6fb5), { y: 0.73 }));
  }
  return g;
}

/** Cột đèn giao thông. Trả về group có userData.lights = {red,yellow,green} (vật liệu riêng để đổi màu). */
export function buildTrafficLight(faceZ = 1) {
  const g = new THREE.Group();
  const steel = mat(0x7b8083, { metalness: 0.6, roughness: 0.45 });
  g.add(cyl(0.055, 0.075, 3.4, 12, steel, { y: 1.7 }));
  const head = new THREE.Group();
  head.position.set(0, 3.0, 0.14 * faceZ);
  head.add(box(0.3, 0.86, 0.2, mat(0x151617, { roughness: 0.5 })));
  const lights = {};
  const defs = [['red', 0.28, 0xe02424], ['yellow', 0, 0xf2b705], ['green', -0.28, 0x16c060]];
  for (const [name, y, col] of defs) {
    const m = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, emissive: col, emissiveIntensity: 0, roughness: 0.3 });
    m.userData.on = col;
    const disc = cyl(0.095, 0.095, 0.04, 16, m, { y, z: 0.11 * faceZ, rx: Math.PI / 2, cast: false });
    head.add(disc);
    head.add(box(0.2, 0.025, 0.09, mat(0x0d0d0e), { y: y + 0.105, z: 0.14 * faceZ }));
    lights[name] = m;
  }
  g.add(head);
  g.userData.lights = lights;
  g.userData.faceZ = faceZ;
  return g;
}

export function setTrafficLight(g, state) {
  const L = g.userData.lights;
  for (const k of Object.keys(L)) L[k].emissiveIntensity = k === state ? 2.2 : 0;
}

/** Người đứng (bán hàng, đứng đợi...). */
export function buildStander(look) {
  return buildPerson({ ...look, pose: 'stand' });
}


// ───────────────── Vật thể đường phố theo ảnh thực tế ─────────────────

/** Tủ điện / tủ kỹ thuật xám trên vỉa hè. Mặt lớn quay về ±X; cạnh dài dọc trục Z (song song đường). */
export function buildCabinet() {
  const g = new THREE.Group();
  const face = new THREE.MeshStandardMaterial({ map: makeCabinetTexture(), roughness: 0.82 });
  const body = mat(0xb1b7a8, { roughness: 0.85 });
  g.add(mesh(new THREE.BoxGeometry(0.5, 1.45, 0.95), [face, face, body, body, body, body], { y: 0.2 + 0.725 }));
  g.add(box(0.62, 0.2, 1.07, mat(0x77746c, { roughness: 0.95 }), { y: 0.1 }));
  g.add(box(0.56, 0.05, 1.01, mat(0x9fa496, { roughness: 0.8 }), { y: 0.2 + 1.45 + 0.025 }));
  return g;
}

/** Cột biển báo sơn đỏ – trắng: kind 'nopark' (cấm dừng, đỗ) hoặc 'crossing' (người đi bộ sang ngang). */
export function buildSignPole(kind = 'nopark') {
  const g = new THREE.Group();
  const stripe = makeStripeTexture();
  stripe.repeat.set(1, 3.0 / 1.2);
  g.add(mesh(new THREE.CylinderGeometry(0.045, 0.05, 3.0, 12), new THREE.MeshStandardMaterial({ map: stripe, roughness: 0.6 }), { y: 1.5 }));
  g.add(cyl(0.05, 0.05, 0.04, 12, mat(0x4a4d50, { metalness: 0.5 }), { y: 3.02 }));
  const tex = makeRoadSign(kind);
  const face = new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.05, roughness: 0.45, side: THREE.DoubleSide });
  if (kind === 'nopark') {
    const s = new THREE.Mesh(new THREE.CircleGeometry(0.32, 36), face);
    s.position.set(0, 3.38, 0.03);
    s.castShadow = true;
    g.add(s);
    g.add(cyl(0.325, 0.325, 0.02, 36, mat(0x8a8d90, { metalness: 0.5 }), { y: 3.38, z: 0.0, rx: Math.PI / 2 }));
  } else {
    const s = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.62), face);
    s.position.set(0, 3.36, 0.03);
    s.castShadow = true;
    g.add(s);
    g.add(box(0.64, 0.64, 0.02, mat(0x8a8d90, { metalness: 0.5 }), { y: 3.36, z: 0.0 }));
  }
  return g;
}

/** Trạm dừng xe buýt: cột thép, biển xanh, hộp đèn thông tin lộ trình. Mặt biển quay dọc theo đường (±Z). */
export function buildBusStop() {
  const g = new THREE.Group();
  const steel = mat(0x6b7075, { metalness: 0.6, roughness: 0.45 });
  g.add(cyl(0.05, 0.055, 3.5, 12, steel, { y: 1.75 }));
  g.add(cyl(0.13, 0.15, 0.12, 12, steel, { y: 0.06 }));
  const sign = new THREE.MeshStandardMaterial({ map: makeBusStopSign(), roughness: 0.5 });
  const edge = mat(0x8e949a, { metalness: 0.5 });
  const board = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.76, 0.05), [edge, edge, edge, edge, sign, sign]);
  board.position.set(0, 3.0, 0);
  board.castShadow = true;
  g.add(board);
  const info = makeBoardTexture([{ t: 'TUYẾN XE BUÝT', size: 30, bold: true, y: 70 }, { t: '03 · 18 · 27', size: 46, bold: true, y: 160 }, { t: 'Quét mã QR', size: 24, y: 240 }], '#f1efe6', '#1d3557');
  const iface = new THREE.MeshStandardMaterial({ map: info, roughness: 0.5, emissive: new THREE.Color(0xffffff), emissiveMap: info, emissiveIntensity: 0.25 });
  const red = mat(0xd24a2a, { roughness: 0.5 });
  const lb = new THREE.Mesh(new THREE.BoxGeometry(0.11, 1.15, 0.58), [red, red, red, red, iface, iface]);
  lb.position.set(0.0, 1.75, 0.34);
  lb.castShadow = true;
  g.add(lb);
  return g;
}

/** Đống túi rác nhựa nhiều màu. */
export function buildTrashBags(seed = 1) {
  const r = rng(seed * 19 + 4);
  const g = new THREE.Group();
  const cols = [0x1f6fb5, 0xe8e6dc, 0x3b8a4b, 0x222326, 0xd8d3c4, 0x2b5fa8];
  for (let i = 0; i < 6; i++) {
    const rad = 0.22 + r() * 0.12;
    const m = mesh(new THREE.SphereGeometry(rad, 14, 10), mat(cols[(r() * cols.length) | 0], { roughness: 0.45 }), {
      x: (r() - 0.5) * 0.7, y: rad * 0.78 + (i > 3 ? 0.28 : 0), z: (r() - 0.5) * 0.7, sx: 1, sy: 0.82, sz: 0.95, ry: r() * 3,
    });
    g.add(m);
  }
  g.add(box(0.34, 0.05, 0.24, mat(0xa07a4a, { roughness: 0.95 }), { x: 0.4, y: 0.025, z: -0.3, ry: 0.5 }));
  return g;
}

/**
 * Quán ăn vỉa hè: bếp, dù lớn, ghế nhựa thấp, xô, rổ. Hệ toạ độ cục bộ: dựa lưng vào tường tại x≈-0.8, mặt quay về +X.
 * userData.stools: toạ độ cục bộ mặt ghế (để đặt đồ lên).
 */
export function buildStall() {
  const g = new THREE.Group();
  const steel = mat(0xc4c7c9, { metalness: 0.7, roughness: 0.35 });
  const dark = mat(0x3a3d40, { metalness: 0.4, roughness: 0.6 });
  g.add(box(0.7, 0.8, 1.1, mat(0xb9bcbe, { metalness: 0.6, roughness: 0.4 }), { x: -0.55, y: 0.4 }));
  g.add(box(0.74, 0.04, 1.14, steel, { x: -0.55, y: 0.82 }));
  g.add(box(0.5, 0.18, 0.7, dark, { x: -0.55, y: 0.93 })); // vỉ nướng
  g.add(cyl(0.09, 0.09, 1.2, 12, mat(0x8a8d90, { metalness: 0.6, roughness: 0.4 }), { x: -0.72, y: 1.45, z: 0.32 }));
  // dù lớn
  g.add(cyl(0.022, 0.022, 2.4, 8, steel, { x: 0.15, y: 1.2 }));
  g.add(mesh(new THREE.ConeGeometry(1.45, 0.46, 18, 1, true), mat(0x7a2230, { roughness: 0.9, side: THREE.DoubleSide }), { x: 0.15, y: 2.5 }));
  g.add(mesh(new THREE.TorusGeometry(1.44, 0.02, 6, 28), mat(0xe9e2d0), { x: 0.15, y: 2.28, rx: Math.PI / 2 }));
  // ghế nhựa thấp
  const stools = [];
  const cols = [0xd23b2d, 0x2c6fb7, 0xd23b2d];
  [[0.55, -0.72], [0.95, 0.05], [0.55, 0.82]].forEach(([x, z], i) => {
    g.add(cyl(0.15, 0.2, 0.32, 12, mat(cols[i], { roughness: 0.5 }), { x, y: 0.17, z }));
    g.add(cyl(0.2, 0.2, 0.03, 12, mat(cols[i], { roughness: 0.45 }), { x, y: 0.335, z }));
    stools.push([x, 0.35, z]);
  });
  g.add(cyl(0.17, 0.15, 0.32, 12, mat(0xf1f1ec, { roughness: 0.5 }), { x: -0.1, y: 0.16, z: -0.95 })); // xô
  g.add(cyl(0.2, 0.15, 0.2, 12, mat(0xd23b2d, { roughness: 0.5 }), { x: -0.15, y: 0.1, z: 0.95 }));   // rổ
  // cây chổi dựa tường
  g.add(cyl(0.012, 0.012, 1.1, 6, mat(0x7a5a34), { x: -0.8, y: 0.55, z: -0.7, rz: -0.12 }));
  g.add(mesh(new THREE.ConeGeometry(0.1, 0.32, 8), mat(0xb79c5a, { roughness: 1 }), { x: -0.74, y: 0.1, z: -0.7, rz: 0.12 }));
  g.userData.stools = stools;
  return g;
}

/** Đồ cá nhân của người dùng (chỉ phục vụ chức năng Tìm đồ): keys | wallet | phone. */
export function buildPersonalItem(kind) {
  const g = new THREE.Group();
  if (kind === 'keys') {
    const silver = mat(0xcfd2d6, { metalness: 0.9, roughness: 0.25 });
    g.add(mesh(new THREE.TorusGeometry(0.03, 0.005, 6, 16), silver, { y: 0.008, rx: Math.PI / 2, cast: false }));
    for (let i = 0; i < 3; i++) g.add(box(0.014, 0.003, 0.05, silver, { x: 0.01 * (i - 1), y: 0.01, z: 0.05 + i * 0.004, ry: (i - 1) * 0.35, cast: false }));
    g.add(box(0.03, 0.008, 0.045, mat(0xd23b2d, { roughness: 0.5 }), { x: -0.05, y: 0.006, z: -0.01, cast: false }));
  } else if (kind === 'wallet') {
    g.add(box(0.11, 0.024, 0.085, mat(0x4a2c1a, { roughness: 0.7 }), { y: 0.012, cast: false }));
    g.add(box(0.112, 0.004, 0.087, mat(0x6a4129, { roughness: 0.7 }), { y: 0.025, cast: false }));
  } else {
    g.add(box(0.075, 0.009, 0.152, mat(0x16181b, { roughness: 0.3, metalness: 0.5 }), { y: 0.0045, cast: false }));
    g.add(mesh(new THREE.PlaneGeometry(0.067, 0.142), new THREE.MeshStandardMaterial({ color: 0x10151c, emissive: 0x28405a, emissiveIntensity: 0.6, roughness: 0.2 }), { y: 0.0095, rx: -Math.PI / 2, cast: false }));
  }
  g.scale.setScalar(1.25);
  return g;
}
