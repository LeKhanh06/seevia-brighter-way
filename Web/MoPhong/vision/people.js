// Người: có khớp hông/gối/vai để đi bộ, ngồi, đứng, lái xe.

import * as THREE from 'three';
import { mat, mesh, box, sph, caps, cyl } from './materials.js';

export const SKIN = [0xe2b793, 0xd6a47c, 0xc68e68, 0xe8c3a0, 0xb97d58];
export const SHIRTS = [0x3a6ea5, 0xb5473b, 0x4e8a59, 0xe3dccb, 0x7a5aa6, 0xd9a441, 0x2f3b4f, 0xc86b8e, 0x6a7f8e];
export const PANTS = [0x23262e, 0x3b3f4b, 0x5a4a3a, 0x2c3d57, 0x1b1b1d];

/**
 * @param {{shirt?:number,pants?:number,skin?:number,hair?:number,hat?:string|null,bag?:boolean,
 *          height?:number,pose?:'stand'|'sit'|'ride',female?:boolean,helmet?:number,sleeves?:boolean,
 *          hairStyle?:'short'|'long'|'ponytail'|'bun'}} o
 * Khớp (pivot) giữ nguyên để các tư thế đứng/ngồi/lái xe và hoạt ảnh đi bộ dùng chung.
 */
export function buildPerson(o = {}) {
  const {
    shirt = 0x3a6ea5, pants = 0x23262e, skin = 0xd6a47c, hair = 0x16110e, hat = null,
    bag = false, height = 1, pose = 'stand', female = false, helmet = 0xd9433a, sleeves = false,
    hairStyle = female ? 'long' : 'short',
  } = o;
  const g = new THREE.Group();
  const root = new THREE.Group();
  g.add(root);

  const mShirt = mat(shirt, { roughness: 0.92 });
  const mPants = mat(pants, { roughness: 0.9 });
  const mSkin = new THREE.MeshPhysicalMaterial({ color: skin, roughness: 0.62, sheen: 0.6, sheenColor: new THREE.Color(0xff9a80), sheenRoughness: 0.6 });
  const mHair = new THREE.MeshPhysicalMaterial({ color: hair, roughness: 0.42, clearcoat: 0.3, clearcoatRoughness: 0.5 });
  const mShoe = mat(0x2a2624, { roughness: 0.65 });
  const mSole = mat(0x8a837a, { roughness: 0.8 });
  const mDark = mat(0x1b1412, { roughness: 0.4 });
  const mLip = mat(new THREE.Color(skin).multiplyScalar(0.72).getHex(), { roughness: 0.6 });

  // thân: ngực – eo, cổ áo, vai tròn
  const torso = new THREE.Group();
  torso.position.y = 1.2;   // pivot ở giữa ngực như bản cũ (tư thế ngồi/lái xe nghiêng quanh điểm này)
  root.add(torso);
  torso.add(caps(0.148, 0.3, mShirt, { y: 0.02, sz: 0.74 }));
  torso.add(mesh(new THREE.CylinderGeometry(0.135, 0.15, 0.16, 16), mShirt, { y: -0.15, sz: 0.76 }));         // eo
  for (const sx of [-1, 1]) torso.add(sph(0.056, mShirt, { x: sx * 0.192, y: 0.19 }, 12, 9));                    // vai
  torso.add(mesh(new THREE.TorusGeometry(0.058, 0.014, 6, 16), mShirt, { y: 0.3, rx: Math.PI / 2 }));            // cổ áo
  root.add(mesh(new THREE.SphereGeometry(0.15, 14, 10), mPants, { y: 0.97, sz: 0.76 }));                         // hông
  root.add(mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.03, 16), mat(0x2b2118, { roughness: 0.6 }), { y: 1.0, sz: 0.76 })); // thắt lưng
  root.add(mesh(new THREE.CylinderGeometry(0.05, 0.058, 0.12, 10), mSkin, { y: 1.55 }));                         // cổ

  // đầu
  const head = new THREE.Group();
  head.position.y = 1.67;
  root.add(head);
  head.add(sph(0.105, mSkin, { sy: 1.12 }, 20, 14));
  for (const sx of [-1, 1]) head.add(sph(0.022, mSkin, { x: sx * 0.103, y: 0.0, sz: 0.55 }, 8, 6));              // tai
  // mặt: mắt, lông mày, mũi, miệng — nhỏ nhưng nhìn thấy khi lại gần
  // mắt/lông mày nằm sát bề mặt mặt (z ≈ 0.096 / 0.09 ở các điểm này), không lồi ra như đeo kính
  for (const sx of [-1, 1]) {
    head.add(sph(0.011, mDark, { x: sx * 0.04, y: 0.014, z: 0.092, sz: 0.5 }, 8, 6));
    head.add(box(0.034, 0.005, 0.004, mHair, { x: sx * 0.04, y: 0.038, z: 0.09, rz: sx * -0.1, cast: false }));
  }
  head.add(sph(0.014, mSkin, { y: -0.008, z: 0.105 }, 8, 6));
  head.add(box(0.034, 0.006, 0.006, mLip, { y: -0.04, z: 0.099, cast: false }));

  // tóc: chỏm đỉnh đầu + vành sau/hai bên, chừa hẳn mặt trước (không che mắt)
  const HR = 0.112;
  head.add(mesh(new THREE.SphereGeometry(HR, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.42), mHair, { sy: 1.13, z: -0.004 }));
  head.add(mesh(new THREE.SphereGeometry(HR, 24, 16, Math.PI * 0.88, Math.PI * 1.24, 0, Math.PI * 0.62), mHair, { sy: 1.13, z: -0.004 }));
  if (hairStyle === 'long') {
    head.add(caps(0.085, 0.2, mHair, { y: -0.15, z: -0.075, sz: 0.7 }));
    for (const sx of [-1, 1]) head.add(caps(0.03, 0.14, mHair, { x: sx * 0.095, y: -0.08, z: -0.03 }));
  } else if (hairStyle === 'ponytail') {
    // buộc sát gáy, đuôi tóc rủ dọc sau đầu (không lơ lửng)
    head.add(sph(0.026, mat(0xc86b8e), { y: 0.01, z: -0.108 }, 8, 6));
    head.add(caps(0.028, 0.16, mHair, { y: -0.09, z: -0.118, rx: 0.12 }));
  } else if (hairStyle === 'bun') {
    head.add(sph(0.05, mHair, { y: 0.1, z: -0.07 }, 12, 9));
  }

  // mũ
  if (hat === 'nonla') {
    const cone = mesh(new THREE.ConeGeometry(0.265, 0.13, 28, 1, true), mat(0xdcc88f, { roughness: 0.85, side: THREE.DoubleSide }), { y: 0.14 });
    head.add(cone);
    head.add(mesh(new THREE.TorusGeometry(0.265, 0.004, 4, 28), mat(0xb89c58), { y: 0.075, rx: Math.PI / 2 }));        // viền nón
    for (const sx of [-1, 1]) head.add(box(0.006, 0.12, 0.004, mat(0xc6465a), { x: sx * 0.092, y: -0.04, z: 0.04 }));   // quai nón
  } else if (hat === 'cap') {
    head.add(mesh(new THREE.SphereGeometry(0.116, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), mat(0x2b3a55), { y: 0.025, sy: 1.1 }));
    head.add(box(0.16, 0.012, 0.1, mat(0x2b3a55), { y: 0.02, z: 0.12 }));
  } else if (hat === 'helmet') {
    const hm = mat(helmet, { roughness: 0.3 });
    head.add(mesh(new THREE.SphereGeometry(0.135, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.58), hm, { y: 0.02 }));
    head.add(box(0.2, 0.012, 0.06, hm, { y: -0.01, z: 0.115 }));
  }

  // tay: tay áo + khuỷu (khớp) + cẳng tay (da hoặc tay áo dài) + bàn tay
  const mkArm = (sx) => {
    const a = new THREE.Group();
    a.position.set(sx * 0.205, 1.4, 0);
    a.add(caps(0.047, 0.2, mShirt, { y: -0.14 }));
    const elbow = new THREE.Group();
    elbow.position.y = -0.27;
    elbow.add(sph(0.041, sleeves ? mShirt : mSkin, {}, 10, 8));
    elbow.add(caps(0.04, 0.2, sleeves ? mShirt : mSkin, { y: -0.11 }));
    elbow.add(sph(0.043, mSkin, { y: -0.25, sy: 1.15, sz: 0.8 }, 10, 8));
    elbow.add(sph(0.017, mSkin, { x: -sx * 0.035, y: -0.23, z: 0.02 }, 6, 5));                                      // ngón cái
    a.add(elbow);
    root.add(a);
    return { a, elbow };
  };
  const AL = mkArm(-1);
  const AR = mkArm(1);
  const armL = AL.a;
  const armR = AR.a;
  // điện thoại trong tay phải, chỉ hiện khi đang xem điện thoại
  const phone = new THREE.Group();
  phone.position.set(-0.02, -0.27, 0.035);
  phone.add(box(0.075, 0.15, 0.011, mat(0x1c1d22, { roughness: 0.35 })));
  phone.add(box(0.066, 0.135, 0.002, mat(0x9fc4e8, { roughness: 0.2, emissive: 0x6d93bd, emissiveIntensity: 0.5 }), { z: 0.0065, cast: false }));
  phone.visible = false;
  AR.elbow.add(phone);

  // chân: đùi + cẳng thon dần, giày có đế
  const mkLeg = (sx) => {
    const hip = new THREE.Group();
    hip.position.set(sx * 0.085, 0.93, 0);
    hip.add(mesh(new THREE.CylinderGeometry(0.08, 0.062, 0.46, 12), mPants, { y: -0.22 }));
    const knee = new THREE.Group();
    knee.position.y = -0.44;
    knee.add(sph(0.063, mPants, {}, 10, 8));
    knee.add(mesh(new THREE.CylinderGeometry(0.062, 0.05, 0.4, 12), mPants, { y: -0.2 }));
    knee.add(sph(0.058, mShoe, { y: -0.43, z: 0.055, sx: 0.95, sy: 0.62, sz: 1.9 }, 12, 8));
    knee.add(box(0.092, 0.022, 0.2, mSole, { y: -0.46, z: 0.055 }));                                           // đế gọn trong lòng giày
    hip.add(knee);
    root.add(hip);
    return { hip, knee };
  };
  const L = mkLeg(-1);
  const R = mkLeg(1);

  if (bag) {
    root.add(box(0.24, 0.26, 0.11, mat(0x3b2f2a, { roughness: 0.8 }), { x: 0.14, y: 0.98, z: -0.02, rz: 0.1 }));
    root.add(box(0.012, 0.52, 0.012, mat(0x2a211c), { x: 0.06, y: 1.2, z: 0.0, rz: -0.12 }));
  }

  g.scale.setScalar(height);
  g.userData.parts = { root, torso, head, armL, armR, elbowL: AL.elbow, elbowR: AR.elbow, phone, hipL: L.hip, hipR: R.hip, kneeL: L.knee, kneeR: R.knee };
  setPose(g, pose);
  return g;
}

export function setPose(g, pose) {
  const p = g.userData.parts;
  g.userData.pose = pose;
  if (pose === 'sit') {
    p.root.position.y = -0.47;
    p.hipL.rotation.x = p.hipR.rotation.x = -1.5;
    p.kneeL.rotation.x = p.kneeR.rotation.x = 1.5;
    p.armL.rotation.x = p.armR.rotation.x = -0.55;
    p.torso.rotation.x = 0.06;
  } else if (pose === 'ride') {
    p.root.position.y = -0.2;
    p.hipL.rotation.x = p.hipR.rotation.x = -1.45;
    p.kneeL.rotation.x = p.kneeR.rotation.x = 2.0;
    p.armL.rotation.x = p.armR.rotation.x = -1.2;
    p.torso.rotation.x = 0.17;
    p.head.rotation.x = -0.1;
  }
}

/** Chu kỳ bước chân. t: pha (rad), amp: 0..1 (0 = đứng yên). */
export function animateWalk(g, t, amp) {
  const p = g.userData.parts;
  if (g.userData.pose !== 'stand') return;
  const s = Math.sin(t);
  const sw = 0.42 * amp;                       // biên độ hông ~24°: sải bước ≈ 0,7 m, khớp tốc độ đi bộ
  p.hipL.rotation.x = s * sw;
  p.hipR.rotation.x = -s * sw;
  // gối gập khi chân đưa lên, duỗi khi chạm đất
  p.kneeL.rotation.x = Math.max(0, -Math.cos(t + 0.4)) * 0.75 * amp * (s > 0 ? 0.25 : 1) + 0.04;
  p.kneeR.rotation.x = Math.max(0, Math.cos(t + 0.4)) * 0.75 * amp * (s < 0 ? 0.25 : 1) + 0.04;
  p.armL.rotation.x = -s * 0.42 * amp;
  p.armR.rotation.x = s * 0.42 * amp;
  p.armR.rotation.z = 0;
  // khuỷu hơi gập, gập thêm khi tay đánh ra trước
  p.elbowL.rotation.x = -0.12 - Math.max(0, s) * 0.35 * amp;
  p.elbowR.rotation.x = -0.12 - Math.max(0, -s) * 0.35 * amp;
  p.phone.visible = false;
  p.torso.rotation.y = s * 0.05 * amp;
  // hông hạ xuống khi hai chân dạng ra nên bàn chân luôn chạm đất, không lơ lửng
  const legLen = 0.9;
  p.root.position.y = -legLen * (1 - Math.cos(sw * Math.abs(s)));
}

/** Dáng đứng yên: hơi nhún vai, đổi chân. */
export function animateIdle(g, t) {
  const p = g.userData.parts;
  if (g.userData.pose === 'ride') return;
  const b = Math.sin(t * 1.3) * 0.012;
  p.torso.rotation.z = b;
  p.head.rotation.y = Math.sin(t * 0.5) * 0.35;
  if (g.userData.pose === 'stand') {
    p.armL.rotation.x = Math.sin(t * 0.9) * 0.04;
    p.armR.rotation.x = -Math.sin(t * 0.9) * 0.04;
    p.armR.rotation.z = 0;
    p.elbowL.rotation.x = p.elbowR.rotation.x = -0.12;
    p.phone.visible = false;
  }
}

/** Cầm điện thoại tay phải trước ngực, cúi đầu nhìn màn hình. Gọi sau animateWalk/animateIdle. */
export function holdPhone(g) {
  const p = g.userData.parts;
  p.armR.rotation.x = -0.15;
  p.armR.rotation.z = -0.22;
  p.elbowR.rotation.x = -1.85;   // cẳng tay chếch lên, màn hình nghiêng về phía mặt
  p.phone.visible = true;
  p.head.rotation.x = 0.38;
  p.head.rotation.y = 0;
}

export function randomLook(r) {
  const female = r() < 0.5;
  return {
    shirt: SHIRTS[(r() * SHIRTS.length) | 0],
    pants: PANTS[(r() * PANTS.length) | 0],
    skin: SKIN[(r() * SKIN.length) | 0],
    hair: r() < 0.9 ? 0x16110e : 0x4a3a2a,
    female,
    height: 0.94 + r() * 0.12,
    hat: r() < 0.28 ? 'nonla' : r() < 0.3 ? 'cap' : null,
    bag: r() < 0.4,
    sleeves: r() < 0.3,
    hairStyle: female ? ['long', 'ponytail', 'bun', 'long'][(r() * 4) | 0] : 'short',
  };
}
