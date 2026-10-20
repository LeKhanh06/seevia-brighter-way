// Xe máy, ô tô, xe đạp. Mọi mô hình quay mũi xe về +Z.
// userData.wheels: các nhóm bánh xe để quay khi xe chạy (trục X).

import * as THREE from 'three';
import { mat, mesh, box, cyl, sph, caps, glassMat, rubberMat, chromeMat, plasticBlack } from './materials.js';
import { buildPerson } from './people.js';

function wheel(radius, width, tireR) {
  const w = new THREE.Group();
  const tire = mesh(new THREE.TorusGeometry(radius - tireR, tireR, 10, 28), rubberMat(), { ry: Math.PI / 2 });
  w.add(tire);
  const rim = cyl(radius - tireR - 0.01, radius - tireR - 0.01, width * 0.6, 20, chromeMat(), { rz: Math.PI / 2 });
  w.add(rim);
  w.add(cyl(0.05, 0.05, width * 0.9, 10, mat(0x555a5e, { metalness: 0.8 }), { rz: Math.PI / 2 }));
  // nan hoa đơn giản
  for (let i = 0; i < 5; i++) {
    const spoke = box(width * 0.2, radius * 1.5, 0.012, mat(0x8d9296, { metalness: 0.8, roughness: 0.4 }), { rx: (i * Math.PI) / 5 });
    spoke.rotation.x = (i * Math.PI) / 5;
    w.add(spoke);
  }
  return w;
}

/**
 * Xe tay ga kiểu Việt Nam.
 * @param {{color?:number, rider?:boolean, passenger?:boolean, delivery?:boolean, helmet?:number, shirt?:number, parked?:boolean, seed?:number}} o
 */
export function buildMotorbike(o = {}) {
  const { color = 0xc62828, rider = true, passenger = false, delivery = false, helmet = 0xe9e9e4, shirt = 0x3a6ea5, parked = false } = o;
  const g = new THREE.Group();
  const body = new THREE.Group();
  g.add(body);
  const paint = mat(color, { roughness: 0.3, metalness: 0.35 });
  const dark = plasticBlack();

  // bánh xe
  const wf = wheel(0.27, 0.1, 0.065);
  wf.position.set(0, 0.27, 0.62);
  const wr = wheel(0.27, 0.12, 0.07);
  wr.position.set(0, 0.27, -0.62);
  body.add(wf, wr);

  // thân xe
  body.add(box(0.36, 0.06, 0.75, dark, { y: 0.2, z: 0.02 })); // sàn để chân
  body.add(box(0.34, 0.5, 0.07, paint, { y: 0.6, z: 0.36, rx: -0.28 })); // yếm
  body.add(mesh(new THREE.CapsuleGeometry(0.15, 0.3, 4, 12), paint, { y: 0.98, z: 0.4, rz: Math.PI / 2, sx: 1, sy: 1, sz: 0.85 })); // đầu xe
  body.add(sph(0.075, mat(0xfff4cf, { emissive: 0xffe6a0, emissiveIntensity: 0.6, roughness: 0.2 }), { y: 0.97, z: 0.56, sz: 0.5 })); // đèn pha
  body.add(box(0.32, 0.26, 0.62, paint, { y: 0.5, z: -0.22 })); // thân dưới yên
  body.add(box(0.31, 0.09, 0.66, mat(0x1d1d1f, { roughness: 0.85 }), { y: 0.68, z: -0.2 })); // yên
  body.add(mesh(new THREE.CapsuleGeometry(0.15, 0.22, 4, 10), paint, { y: 0.6, z: -0.62, rz: Math.PI / 2, sz: 0.7 })); // đuôi
  body.add(box(0.12, 0.03, 0.05, mat(0xd01818, { emissive: 0xff2020, emissiveIntensity: 0.5 }), { y: 0.62, z: -0.82 })); // đèn hậu
  body.add(box(0.16, 0.035, 0.42, paint, { y: 0.5, z: 0.62 })); // chắn bùn trước
  body.add(box(0.2, 0.035, 0.4, paint, { y: 0.5, z: -0.66 })); // chắn bùn sau
  // phuộc + ghi đông
  for (const s of [-1, 1]) body.add(cyl(0.017, 0.017, 0.62, 8, chromeMat(), { x: s * 0.08, y: 0.62, z: 0.55, rx: 0.2 }));
  body.add(cyl(0.013, 0.013, 0.64, 8, dark, { y: 1.07, z: 0.37, rz: Math.PI / 2 }));
  for (const s of [-1, 1]) {
    body.add(cyl(0.011, 0.011, 0.14, 6, chromeMat(), { x: s * 0.26, y: 1.15, z: 0.36 }));
    body.add(sph(0.032, dark, { x: s * 0.26, y: 1.23, z: 0.36, sz: 0.5 }, 8, 6));
  }
  body.add(cyl(0.04, 0.045, 0.5, 10, mat(0x8b8f93, { metalness: 0.8, roughness: 0.35 }), { x: 0.2, y: 0.28, z: -0.3, rx: Math.PI / 2 })); // ống xả
  body.add(box(0.17, 0.11, 0.015, mat(0xf2f2ee, { roughness: 0.5 }), { y: 0.45, z: -0.84 })); // biển số

  if (delivery) {
    body.add(box(0.46, 0.44, 0.46, mat(0x2f9e44, { roughness: 0.5 }), { y: 1.0, z: -0.62 }));
    body.add(box(0.47, 0.05, 0.47, mat(0xe8f5e9, { roughness: 0.5 }), { y: 1.22, z: -0.62 }));
  }

  if (rider && !parked) {
    const r1 = buildPerson({ shirt: delivery ? 0x2f9e44 : shirt, pants: 0x2c3d57, pose: 'ride', hat: 'helmet', helmet, height: 0.97, sleeves: true });
    r1.position.set(0, 0.725 - 0.73 * 0.97, -0.08);
    body.add(r1);
    if (passenger) {
      const p2 = buildPerson({ shirt: 0xc86b8e, pants: 0x3b3f4b, pose: 'ride', hat: 'helmet', helmet: 0x3a6ea5, height: 0.9, female: true, sleeves: true });
      p2.position.set(0, 0.725 - 0.73 * 0.9, -0.42);
      p2.userData.parts.torso.rotation.x = 0.05;
      p2.userData.parts.armL.rotation.x = p2.userData.parts.armR.rotation.x = -0.5;
      body.add(p2);
    }
  }
  if (parked) {
    body.rotation.z = 0.1; // đổ nhẹ trên chân chống
    body.position.y = -0.01;
    body.add(cyl(0.012, 0.012, 0.3, 6, dark, { x: -0.1, y: 0.1, z: -0.1, rz: 0.5 }));
    // mũ bảo hiểm treo gương + áo mưa trên yên
    body.add(mesh(new THREE.SphereGeometry(0.12, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.6), mat(helmet, { roughness: 0.35 }), { x: 0.26, y: 1.28, z: 0.36 }));
    if (o.seed && o.seed % 3 === 0) body.add(box(0.3, 0.08, 0.5, mat(0x264d8c, { roughness: 0.6 }), { y: 0.76, z: -0.2 }));
  }

  g.userData.wheels = [wf, wr];
  g.userData.wheelRadius = 0.27;
  g.userData.kind = 'motorbike';
  return g;
}

/** Ô tô sedan dựng từ mặt cắt bên (ExtrudeGeometry) để có đường cong thật. */
export function buildCar(o = {}) {
  const { color = 0xe8e8e6, taxi = false, suv = false } = o;
  const g = new THREE.Group();
  const W = 1.78;
  const paint = mat(color, { roughness: 0.22, metalness: 0.55 });

  const sideShape = (pts) => {
    const s = new THREE.Shape();
    s.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
    s.closePath();
    return s;
  };
  const extrude = (shape, width, bevel = 0.05) => {
    const geo = new THREE.ExtrudeGeometry(shape, { depth: width - bevel * 2, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 8 });
    geo.translate(0, 0, -(width - bevel * 2) / 2);
    geo.rotateY(-Math.PI / 2); // chiều dài xe -> trục +Z
    return geo;
  };

  const hoodY = suv ? 1.04 : 0.98;
  const lower = sideShape([
    [-2.2, 0.36], [-2.2, 0.84], [-1.72, 0.95], [-0.95, hoodY], [1.0, hoodY], [1.95, 0.88], [2.2, 0.74], [2.2, 0.36],
  ]);
  g.add(mesh(extrude(lower, W), paint));

  const cabinTop = suv ? 1.6 : 1.45;
  const cabin = sideShape(suv
    ? [[-1.9, hoodY], [-1.85, cabinTop], [0.55, cabinTop], [1.0, hoodY]]
    : [[-1.05, hoodY], [-0.72, cabinTop], [0.5, cabinTop], [1.05, hoodY]]);
  g.add(mesh(extrude(cabin, W * 0.9, 0.03), glassMat(), { y: 0.0 }));
  // mui xe
  const roofL = suv ? 2.4 : 1.25;
  g.add(box(W * 0.84, 0.05, roofL, paint, { y: cabinTop + 0.02, z: suv ? -0.65 : -0.1 }));

  // bánh xe
  const wheelPos = [[-1, 1.38], [1, 1.38], [-1, -1.35], [1, -1.35]];
  g.userData.wheels = [];
  for (const [sx, z] of wheelPos) {
    const w = new THREE.Group();
    w.add(cyl(0.32, 0.32, 0.23, 24, rubberMat(), { rz: Math.PI / 2 }));
    w.add(cyl(0.21, 0.21, 0.24, 18, chromeMat(), { rz: Math.PI / 2 }));
    for (let i = 0; i < 5; i++) w.add(box(0.25, 0.3, 0.02, mat(0x6e7378, { metalness: 0.8, roughness: 0.4 }), { rx: (i * Math.PI) / 5 }));
    w.position.set(sx * (W / 2 - 0.1), 0.32, z);
    g.add(w);
    g.userData.wheels.push(w);
    // hốc bánh tối
    g.add(cyl(0.38, 0.38, 0.1, 20, mat(0x0c0c0d, { roughness: 1 }), { x: sx * (W / 2 - 0.02), y: 0.34, z, rz: Math.PI / 2, cast: false }));
  }

  // đèn pha, đèn hậu, lưới tản nhiệt, cản
  const head = mat(0xfff7e0, { emissive: 0xfff0c0, emissiveIntensity: 0.55, roughness: 0.2 });
  const tail = mat(0xb01515, { emissive: 0xff1a1a, emissiveIntensity: 0.45, roughness: 0.3 });
  for (const s of [-1, 1]) {
    g.add(box(0.42, 0.13, 0.08, head, { x: s * 0.62, y: 0.82, z: 2.16, rx: -0.1 }));
    g.add(box(0.4, 0.12, 0.08, tail, { x: s * 0.64, y: 0.86, z: -2.18 }));
    g.add(cyl(0.05, 0.05, 0.12, 8, paint, { x: s * (W / 2 + 0.06), y: 1.02, z: 0.62, rz: Math.PI / 2 })); // chân gương
    g.add(box(0.07, 0.11, 0.17, paint, { x: s * (W / 2 + 0.14), y: 1.03, z: 0.6 }));
  }
  g.add(box(0.9, 0.18, 0.05, plasticBlack(), { y: 0.62, z: 2.2 })); // lưới
  g.add(box(W * 0.98, 0.14, 0.12, plasticBlack(), { y: 0.42, z: 2.16 })); // cản trước
  g.add(box(W * 0.98, 0.14, 0.12, plasticBlack(), { y: 0.42, z: -2.16 })); // cản sau
  g.add(box(0.5, 0.11, 0.015, mat(0xf4f4f0), { y: 0.55, z: -2.23 })); // biển số

  if (taxi) {
    g.add(box(0.62, 0.15, 0.2, mat(0xf2f2ee, { emissive: 0xffffff, emissiveIntensity: 0.25 }), { y: cabinTop + 0.15, z: -0.1 }));
    g.add(box(W * 0.995, 0.08, 4.0, mat(0x1c8c4a, { roughness: 0.3 }), { y: 0.62, z: 0, cast: false }));
  }
  g.userData.wheelRadius = 0.32;
  g.userData.kind = 'car';
  return g;
}

export function buildBicycle(o = {}) {
  const g = new THREE.Group();
  const frame = mat(o.color ?? 0x2b5d8a, { roughness: 0.4, metalness: 0.5 });
  const wf = wheel(0.34, 0.03, 0.02);
  wf.position.set(0, 0.34, 0.55);
  const wr = wheel(0.34, 0.03, 0.02);
  wr.position.set(0, 0.34, -0.55);
  g.add(wf, wr);
  g.add(cyl(0.015, 0.015, 0.85, 6, frame, { y: 0.62, z: 0.05, rx: 1.3 }));
  g.add(cyl(0.015, 0.015, 0.55, 6, frame, { y: 0.55, z: -0.28, rx: -0.5 }));
  g.add(cyl(0.015, 0.015, 0.5, 6, frame, { y: 0.7, z: 0.5, rx: 0.25 }));
  g.add(cyl(0.012, 0.012, 0.5, 6, plasticBlack(), { y: 1.0, z: 0.5, rz: Math.PI / 2 }));
  g.add(box(0.1, 0.03, 0.22, plasticBlack(), { y: 0.88, z: -0.32 }));
  const r = buildPerson({ shirt: 0xd9a441, pants: 0x3b3f4b, pose: 'ride', hat: 'nonla', height: 0.98 });
  r.position.set(0, 0.9 - 0.73 * 0.98, -0.32);
  r.userData.parts.hipL.rotation.x = -0.9;
  r.userData.parts.hipR.rotation.x = -0.4;
  r.userData.parts.kneeL.rotation.x = 1.0;
  r.userData.parts.kneeR.rotation.x = 1.6;
  r.userData.parts.armL.rotation.x = r.userData.parts.armR.rotation.x = -1.0;
  g.add(r);
  g.userData.wheels = [wf, wr];
  g.userData.wheelRadius = 0.34;
  g.userData.kind = 'bicycle';
  return g;
}
