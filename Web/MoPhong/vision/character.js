// Nhân vật "Mai": cô gái 3D phong cách chibi / designer toy.
// Tóc đen búi hai bên, cardigan lavender, chân váy denim, giày sneaker trắng, túi tote màu kem.
//
// Đây là mô hình dựng bằng code (không phải file glTF có rig từ phần mềm 3D): các khớp là nhóm Three.js
// nên vẫn có "bộ xương" đủ để idle, đi bộ, quay người, nhìn quanh. Da dùng sheen ấm để gợi cảm giác
// tán xạ dưới da; đây KHÔNG phải subsurface scattering thật.
//
// Giao diện khớp với people.js: userData.parts = {root, torso, head, armL, armR, hipL, hipR, kneeL, kneeR}.

import * as THREE from 'three';

const hasDoc = typeof document !== 'undefined';

function canvasTex(w, h, draw, repeat = [1, 1]) {
  if (!hasDoc) return null;
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  draw(cv.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

let cache = null;
function materials() {
  if (cache) return cache;
  // denim: sợi chéo + đường chỉ
  const denimMap = canvasTex(128, 128, (c, w, h) => {
    c.fillStyle = '#4d74a3'; c.fillRect(0, 0, w, h);
    for (let i = -h; i < w; i += 3) {
      c.strokeStyle = i % 6 ? 'rgba(255,255,255,0.10)' : 'rgba(20,35,70,0.16)';
      c.beginPath(); c.moveTo(i, 0); c.lineTo(i + h, h); c.stroke();
    }
    for (let k = 0; k < 500; k++) { c.fillStyle = `rgba(255,255,255,${Math.random() * 0.05})`; c.fillRect(Math.random() * w, Math.random() * h, 2, 1); }
  }, [3, 1.5]);
  // len cardigan: sọc gân dọc
  const knitMap = canvasTex(64, 64, (c, w, h) => {
    c.fillStyle = '#b7a2e2'; c.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 4) { c.fillStyle = 'rgba(255,255,255,0.13)'; c.fillRect(x, 0, 2, h); c.fillStyle = 'rgba(70,50,130,0.12)'; c.fillRect(x + 2, 0, 1, h); }
  }, [3, 2]);
  // vải tote: dệt thô
  const canvasMap = canvasTex(64, 64, (c, w, h) => {
    c.fillStyle = '#dfd0b0'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < w; i += 2) { c.fillStyle = 'rgba(120,95,60,0.07)'; c.fillRect(i, 0, 1, h); c.fillRect(0, i, w, 1); }
  }, [2, 2]);

  cache = {
    skin: new THREE.MeshPhysicalMaterial({ color: 0xf3c7a8, roughness: 0.52, sheen: 1, sheenColor: new THREE.Color(0xff9a86), sheenRoughness: 0.45 }),
    blush: new THREE.MeshBasicMaterial({ color: 0xff8f8a, transparent: true, opacity: 0.38, depthWrite: false }),
    hair: new THREE.MeshPhysicalMaterial({ color: 0x15110f, roughness: 0.34, clearcoat: 0.55, clearcoatRoughness: 0.35, sheen: 0.6, sheenColor: new THREE.Color(0x4a4a66) }),
    eye: new THREE.MeshStandardMaterial({ color: 0x1a1210, roughness: 0.25 }),
    eyeHi: new THREE.MeshBasicMaterial({ color: 0xffffff }),
    brow: new THREE.MeshStandardMaterial({ color: 0x1d1512, roughness: 0.8 }),
    lip: new THREE.MeshStandardMaterial({ color: 0xd3646a, roughness: 0.5 }),
    cardigan: new THREE.MeshPhysicalMaterial({ color: 0xffffff, map: knitMap, roughness: 0.95, sheen: 0.8, sheenColor: new THREE.Color(0xe6dcff), sheenRoughness: 0.8 }),
    cardiganTrim: new THREE.MeshStandardMaterial({ color: 0x9d86d4, roughness: 0.95 }),
    tee: new THREE.MeshStandardMaterial({ color: 0xfaf6ee, roughness: 0.9 }),
    button: new THREE.MeshStandardMaterial({ color: 0xf3ead7, roughness: 0.4 }),
    denim: new THREE.MeshStandardMaterial({ color: 0xffffff, map: denimMap, roughness: 0.86 }),
    stitch: new THREE.MeshStandardMaterial({ color: 0xe0b45a, roughness: 0.8 }),
    sock: new THREE.MeshStandardMaterial({ color: 0xeceae4, roughness: 0.95 }),
    shoe: new THREE.MeshPhysicalMaterial({ color: 0xf1f0ec, roughness: 0.5, clearcoat: 0.2 }),
    sole: new THREE.MeshStandardMaterial({ color: 0xcfcabc, roughness: 0.7 }),
    lace: new THREE.MeshStandardMaterial({ color: 0xd9d4c6, roughness: 0.9 }),
    tote: new THREE.MeshStandardMaterial({ color: 0xffffff, map: canvasMap, roughness: 0.95, side: THREE.DoubleSide }),
    strap: new THREE.MeshStandardMaterial({ color: 0xbfae88, roughness: 0.9 }),
    tie: new THREE.MeshStandardMaterial({ color: 0xc6b3f0, roughness: 0.85 }),
  };
  return cache;
}

const add = (parent, geo, m, o = {}) => {
  const x = new THREE.Mesh(geo, m);
  x.position.set(o.x ?? 0, o.y ?? 0, o.z ?? 0);
  if (o.rx || o.ry || o.rz) x.rotation.set(o.rx ?? 0, o.ry ?? 0, o.rz ?? 0);
  if (o.sx !== undefined || o.sy !== undefined || o.sz !== undefined) x.scale.set(o.sx ?? 1, o.sy ?? 1, o.sz ?? 1);
  x.castShadow = o.cast ?? true;
  x.receiveShadow = o.receive ?? true;
  parent.add(x);
  return x;
};
const SPH = (r, w = 20, h = 14) => new THREE.SphereGeometry(r, w, h);
const CAP = (r, l) => new THREE.CapsuleGeometry(r, l, 6, 14);

/** Dựng nhân vật. Cao khoảng 1,5 m (đầu to, chân ngắn). */
export function buildChibi(o = {}) {
  const M = materials();
  const g = new THREE.Group();
  const root = new THREE.Group();
  g.add(root);

  // ── thân: cardigan ──
  const torso = new THREE.Group();
  torso.position.y = 0.72;           // pivot ở ngang eo
  root.add(torso);
  add(torso, CAP(0.135, 0.15), M.cardigan, { y: 0.1, sz: 0.82 });
  add(torso, new THREE.CylinderGeometry(0.152, 0.158, 0.05, 22), M.cardiganTrim, { y: -0.03, sz: 0.84 });   // gấu áo bo
  add(torso, new THREE.BoxGeometry(0.1, 0.17, 0.03), M.tee, { y: 0.14, z: 0.105 });                         // áo thun trắng bên trong
  add(torso, new THREE.TorusGeometry(0.06, 0.012, 6, 14, Math.PI), M.tee, { y: 0.215, z: 0.085, rx: -0.5 }); // cổ áo
  for (let i = 0; i < 3; i++) add(torso, SPH(0.012, 10, 8), M.button, { x: 0.035, y: 0.03 + i * 0.065, z: 0.12 - i * 0.004 });
  // cổ
  add(torso, new THREE.CylinderGeometry(0.04, 0.045, 0.07, 12), M.skin, { y: 0.27 });

  // ── váy denim (đứng yên theo hông, đung đưa nhẹ khi đi) ──
  const skirt = new THREE.Group();
  skirt.position.y = 0.66;
  root.add(skirt);
  add(skirt, new THREE.CylinderGeometry(0.155, 0.235, 0.2, 28, 1, true), M.denim, { y: -0.08 });
  add(skirt, new THREE.CylinderGeometry(0.155, 0.155, 0.2, 28, 1, false), M.denim, { y: -0.08, cast: false, sy: 0.02, sz: 1 });
  add(skirt, new THREE.TorusGeometry(0.157, 0.008, 6, 30), M.stitch, { y: 0.015, rx: Math.PI / 2 });          // chỉ vàng ở cạp
  add(skirt, new THREE.TorusGeometry(0.234, 0.007, 6, 36), M.stitch, { y: -0.175, rx: Math.PI / 2 });         // chỉ gấu
  for (let i = 0; i < 8; i++) {                                                                                // nếp gấp
    const a = (i / 8) * Math.PI * 2;
    add(skirt, new THREE.BoxGeometry(0.008, 0.19, 0.006), M.stitch, { x: Math.sin(a) * 0.2, z: Math.cos(a) * 0.2, y: -0.08, ry: a, rx: -0.2, cast: false });
  }
  // túi váy
  add(skirt, new THREE.BoxGeometry(0.06, 0.05, 0.006), M.stitch, { x: 0.075, y: -0.07, z: 0.205, ry: 0.35, rx: -0.2, cast: false });

  // ── đầu ──
  const head = new THREE.Group();
  head.position.y = 1.0;
  root.add(head);
  const skull = add(head, SPH(0.235, 32, 22), M.skin, { y: 0.13, sx: 1.04, sy: 0.93, sz: 0.98 });
  skull.name = 'skull';
  // tai
  for (const s of [-1, 1]) add(head, SPH(0.035, 10, 8), M.skin, { x: s * 0.235, y: 0.12, z: 0.0, sz: 0.6 });
  // mắt nhỏ, hơi dài, có điểm sáng; chớp mắt qua scale y
  const eyes = [];
  for (const s of [-1, 1]) {
    const eg = new THREE.Group();
    eg.position.set(s * 0.082, 0.115, 0.218);
    add(eg, SPH(0.03, 14, 10), M.eye, { sx: 0.9, sy: 1.15, sz: 0.5, cast: false });
    add(eg, SPH(0.008, 8, 6), M.eyeHi, { x: s * -0.006, y: 0.012, z: 0.011, cast: false });
    head.add(eg);
    eyes.push(eg);
    add(head, CAP(0.004, 0.032), M.brow, { x: s * 0.085, y: 0.168, z: 0.215, rz: Math.PI / 2 + s * -0.12, cast: false });
    add(head, new THREE.CircleGeometry(0.03, 16), M.blush, { x: s * 0.133, y: 0.065, z: 0.19, ry: s * 0.55, cast: false });
  }
  // miệng cười nhỏ
  add(head, new THREE.TorusGeometry(0.022, 0.0038, 6, 14, Math.PI), M.lip, { y: 0.058, z: 0.226, rz: Math.PI, cast: false });
  add(head, SPH(0.007, 6, 5), M.skin, { y: 0.095, z: 0.235, cast: false });   // mũi

  // tóc: chỏm đầu + vành tóc ôm sau gáy/hai bên (chừa hẳn mặt trước), mái thưa, hai búi nhỏ
  const hairGroup = new THREE.Group();
  head.add(hairGroup);
  const HR = 0.245;
  // chỏm: chỉ phủ phần đỉnh, đường chân tóc nằm trên lông mày
  add(hairGroup, new THREE.SphereGeometry(HR, 36, 20, 0, Math.PI * 2, 0, Math.PI * 0.4), M.hair, { y: 0.135, z: -0.012, sx: 1.04, sy: 0.97 });
  // vành sau: phi 0 là hướng -X, phi = π/2 là phía trước → chỉ lấy cung sau/hai bên
  add(hairGroup, new THREE.SphereGeometry(HR, 36, 22, Math.PI * 0.9, Math.PI * 1.2, 0, Math.PI * 0.74), M.hair, { y: 0.135, z: -0.012, sx: 1.04, sy: 0.97 });
  // mái ngố thưa: các lọn mảnh xếp theo cung trán, buông tới ngang chân mày, không che mắt
  for (let i = 0; i < 9; i++) {
    const a = (i - 4) * 0.26;
    const h = 0.05 + (i % 2) * 0.008;
    add(hairGroup, CAP(0.021, h), M.hair, { x: Math.sin(a) * 0.205, y: 0.212 - Math.abs(i - 4) * 0.01, z: Math.cos(a) * 0.19 + 0.01, ry: a, rx: 0.12, sz: 0.75 });
  }
  // lọn mai rủ sát tai (mảnh, không thành "tai" đen)
  for (const s2 of [-1, 1]) {
    add(hairGroup, CAP(0.017, 0.085), M.hair, { x: s2 * 0.222, y: 0.085, z: 0.045, rz: s2 * 0.05, rx: -0.06 });
  }
  const buns = [];
  for (const s2 of [-1, 1]) {
    const b = new THREE.Group();
    b.position.set(s2 * 0.145, 0.335, -0.035);
    b.rotation.z = -s2 * 0.35;
    add(b, SPH(0.066, 18, 14), M.hair, { y: 0.05, sy: 0.95 });
    add(b, new THREE.CylinderGeometry(0.03, 0.045, 0.05, 12), M.hair, { y: -0.005 });                   // chân búi nối vào đầu
    add(b, new THREE.TorusGeometry(0.043, 0.01, 8, 18), M.tie, { rx: Math.PI / 2, y: 0.012 });            // chun buộc tóc
    head.add(b);
    buns.push(b);
  }
  add(head, SPH(0.07, 14, 10), M.hair, { y: 0.06, z: -0.205, sy: 1.1 });                                  // gáy

  // ── tay ──
  const mkArm = (sx) => {
    const a = new THREE.Group();
    a.position.set(sx * 0.175, 0.86, 0);
    add(a, CAP(0.042, 0.13), M.cardigan, { y: -0.1 });
    add(a, new THREE.CylinderGeometry(0.047, 0.047, 0.03, 12), M.cardiganTrim, { y: -0.2 });  // bo tay áo
    add(a, SPH(0.036, 12, 9), M.skin, { y: -0.245 });
    root.add(a);
    return a;
  };
  const armL = mkArm(-1);
  const armR = mkArm(1);

  // túi tote: quai treo trên cẳng tay phải, thân túi đung đưa theo bước đi
  const tote = new THREE.Group();
  tote.position.set(0.02, -0.17, 0);
  armR.add(tote);
  add(tote, new THREE.TorusGeometry(0.07, 0.007, 6, 18, Math.PI), M.strap, { y: -0.01, rz: 0, cast: false });
  add(tote, new THREE.BoxGeometry(0.2, 0.22, 0.08), M.tote, { y: -0.18, x: 0.02 });
  add(tote, new THREE.BoxGeometry(0.2, 0.012, 0.072), M.strap, { y: -0.072, x: 0.02, cast: false });
  add(tote, new THREE.CircleGeometry(0.035, 14), new THREE.MeshStandardMaterial({ color: 0xb8a4e0, roughness: 0.9 }), { x: 0.02, y: -0.18, z: 0.037, cast: false });
  tote.rotation.z = 0.05;

  // ── chân: đùi (da) + cẳng (tất trắng) + giày sneaker ──
  const mkLeg = (sx) => {
    const hip = new THREE.Group();
    hip.position.set(sx * 0.075, 0.52, 0);
    add(hip, CAP(0.042, 0.13), M.skin, { y: -0.1 });
    const knee = new THREE.Group();
    knee.position.y = -0.2;
    add(knee, CAP(0.04, 0.15), M.sock, { y: -0.12 });
    add(knee, SPH(0.044, 12, 9), M.skin, { y: 0.0 });   // đầu gối, che khớp nối đùi–cẳng
    const shoe = new THREE.Group();
    shoe.position.set(0, -0.27, 0.025);
    add(shoe, SPH(0.062, 16, 10), M.shoe, { sx: 0.85, sy: 0.7, sz: 1.55, y: 0.01 });
    add(shoe, new THREE.BoxGeometry(0.1, 0.022, 0.2), M.sole, { y: -0.04, z: 0.005 });
    add(shoe, new THREE.BoxGeometry(0.05, 0.004, 0.06), M.lace, { y: 0.045, z: 0.03, cast: false });
    knee.add(shoe);
    hip.add(knee);
    root.add(hip);
    return { hip, knee };
  };
  const L = mkLeg(-1);
  const R = mkLeg(1);

  g.userData.parts = { root, torso, head, armL, armR, hipL: L.hip, hipR: R.hip, kneeL: L.knee, kneeR: R.knee };
  g.userData.chibi = { skirt, tote, buns, eyes, hairGroup };
  g.userData.pose = 'stand';
  g.userData.state = { amp: 0, phase: Math.random() * 6, lookY: 0, lookTo: 0, lookT: 1 + Math.random() * 2, blinkT: 2 + Math.random() * 3, prevYaw: null, lean: 0, gestureW: 0 };
  g.scale.setScalar(o.scale ?? 1);
  return g;
}

const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));

/**
 * Cập nhật tư thế. Gọi mỗi khung hình.
 * @param g       nhân vật từ buildChibi
 * @param dt      giây
 * @param o       {moving:boolean, speed:number (m/s thực), yaw:number, gesture?:'phone'|'look'|'wave'|null, lookAt?:number}
 * Chuyển đổi idle ⇄ đi bộ được trộn bằng `amp` (làm mượt), pha bước chân tỉ lệ với vận tốc nên chân không trượt.
 */
export function animateChibi(g, dt, o) {
  const P = g.userData.parts;
  const C = g.userData.chibi;
  const S = g.userData.state;
  const { moving, speed = 1.1, yaw = 0, gesture = null } = o;

  S.amp = damp(S.amp, moving ? 1 : 0, moving ? 5 : 7, dt);
  // chân ngắn: 1 nửa chu kỳ (π rad) ứng với ~0,47 m dưới đất → 6,6 rad/s cho mỗi m/s
  S.phase += dt * speed * 7.0 * (moving ? 1 : 0.0) * Math.min(1, S.amp * 1.6);
  const amp = S.amp;
  const t = S.phase;
  const now = (S.clock = (S.clock || 0) + dt);

  // quay người: nghiêng thân nhẹ theo tốc độ quay
  if (S.prevYaw === null) S.prevYaw = yaw;
  let dy = yaw - S.prevYaw;
  while (dy > Math.PI) dy -= 2 * Math.PI;
  while (dy < -Math.PI) dy += 2 * Math.PI;
  S.prevYaw = yaw;
  const turnRate = dt > 0 ? dy / dt : 0;
  S.lean = damp(S.lean, Math.max(-0.12, Math.min(0.12, -turnRate * 0.05)), 8, dt);

  // bước chân
  const s = Math.sin(t);
  const sw = 0.5 * amp;
  const idleBreath = Math.sin(now * 1.9);
  P.hipL.rotation.x = s * sw;
  P.hipR.rotation.x = -s * sw;
  P.kneeL.rotation.x = (Math.max(0, -s) * 0.85) * amp + 0.03;
  P.kneeR.rotation.x = (Math.max(0, s) * 0.85) * amp + 0.03;
  // vai: tay trái đánh nhẹ, tay phải giữ túi nên đánh ít
  P.armL.rotation.x = -s * 0.5 * amp + Math.sin(now * 0.9) * 0.03 * (1 - amp);
  P.armR.rotation.x = s * 0.22 * amp - 0.04 * (1 - amp) + Math.sin(now * 0.9) * 0.02;
  P.armL.rotation.z = 0.07 + 0.02 * idleBreath;
  P.armR.rotation.z = -0.07;
  // nhún người theo bước, thở khi đứng
  P.root.position.y = -0.46 * (1 - Math.cos(sw * Math.abs(s)));   // hông hạ khi dạng chân: bàn chân không lơ lửng
  P.torso.rotation.y = s * 0.09 * amp;
  P.torso.rotation.z = S.lean;
  P.torso.scale.set(1 + 0.012 * idleBreath * (1 - amp), 1 + 0.018 * idleBreath * (1 - amp), 1 + 0.012 * idleBreath * (1 - amp));
  // váy và túi đung đưa chậm hơn một nhịp
  C.skirt.rotation.z = Math.sin(t - 0.8) * 0.04 * amp;
  C.skirt.rotation.x = Math.abs(Math.sin(t)) * 0.03 * amp;
  C.tote.rotation.z = 0.05 + Math.sin(t - 0.6) * 0.16 * amp + Math.sin(now * 1.1) * 0.015;
  // búi tóc nảy nhẹ
  C.buns.forEach((b, i) => { b.position.y = 0.335 + Math.sin(t * 2 - 0.9 + i) * 0.01 * amp; b.rotation.z = (i ? -0.35 : 0.35) + (i ? 1 : -1) * Math.sin(t - 1.2) * 0.05 * amp; });

  // đầu: thỉnh thoảng nhìn quanh, khi đi thì nhìn theo hướng đi, có độ trễ
  S.lookT -= dt;
  if (S.lookT <= 0) {
    S.lookTo = o.lookAt !== undefined ? o.lookAt : (Math.random() - 0.5) * (moving ? 0.7 : 1.5);
    S.lookT = (moving ? 1.6 : 1.2) + Math.random() * 2.4;
  }
  S.lookY = damp(S.lookY, S.lookTo, 4, dt);
  P.head.rotation.y = S.lookY;
  P.head.rotation.x = Math.sin(t * 2) * 0.025 * amp + (gesture === 'phone' ? 0.35 : 0);
  P.head.rotation.z = -S.lean * 0.6 + Math.sin(now * 0.7) * 0.02;

  // chớp mắt
  S.blinkT -= dt;
  const blink = S.blinkT < 0.12 && S.blinkT > 0 ? 0.1 : 1;
  if (S.blinkT <= 0) S.blinkT = 2 + Math.random() * 3.5;
  for (const e of C.eyes) e.scale.y = blink;

  // cử chỉ (tay trái): xem điện thoại, vẫy, chỉ nhìn cửa hàng
  S.gestureW = damp(S.gestureW, gesture ? 1 : 0, 6, dt);
  const w = S.gestureW;
  if (w > 0.01) {
    if (gesture === 'phone') { P.armL.rotation.x += (-1.25 - P.armL.rotation.x) * w; P.armL.rotation.z += (-0.35 - P.armL.rotation.z) * w; }
    else if (gesture === 'wave') { P.armL.rotation.x += (-2.5 + Math.sin(now * 9) * 0.25 - P.armL.rotation.x) * w; }
    else if (gesture === 'look') { P.armL.rotation.x += (-0.5 - P.armL.rotation.x) * w; }
  }
}
