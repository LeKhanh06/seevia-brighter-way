import type * as THREE from "three";

/*
 * Mô hình 3D kính SeeVia dựng theo bản vẽ kỹ thuật bpk3 (13 góc nhìn) và ảnh sản phẩm mausac1, kinh.
 * - Mặt trước ôm cong; thanh mày mảnh, mặt trên phẳng, sâu ~1cm, võng nhẹ ở cầu mũi.
 * - Tròng khói liền khối không viền dưới, cong và nghiêng về phía mặt; đáy thấp nhất giữa mắt,
 *   vòm mũi hình ∩ rộng có viền đen.
 * - 2 hộp camera ở góc: khung bezel mảnh, ô xám kim loại, vòng ống kính đen lớn, mặt kính ánh xanh;
 *   đường ron chia khối với thanh mày.
 * - Mặt dưới: thanh ray đen dọc mép sau thanh mày nối vào 2 khối bản lề đen có núm tròn ở góc trong,
 *   đường ron răng ghép chỗ thanh mày nối khối góc.
 * - Cầu mũi: 2 tay kim loại mờ từ trong vòm xuống đệm silicon mờ hình giọt nước có lõi viên thuốc.
 * - Gọng dài bản dẹt nối liền mượt từ hộp camera, mở nhẹ ra ngoài, đuôi cong xuống thành chóp tròn.
 * - Gọng phải: nút điều khiển chữ nhật gần camera, nút đa năng tròn phía sau; cổng USB-C ở dưới (khung chrome
 *   bo tròn trong rãnh tối, lưỡi tiếp xúc chrome) giữa 2 đường ron, không có nắp đậy.
 * - Gọng trái: công tắc trượt nguồn (rãnh tối, núm có gờ) ở mặt dưới gọng, chữ ON/OFF ở hai đầu rãnh.
 * - Loa (≡) ở mặt dưới thanh mày hai bên, micro ở mặt dưới gọng, LED trên mặt gọng.
 * Toạ độ kiểu Blender (mét, Z hướng lên, mặt trước hướng -Y, -X là bên phải người đeo)
 * trong group xoay -90° quanh X để khớp hệ trục Three.js.
 */

type Vec3 = [number, number, number];
type Three = typeof THREE;

// Độ ôm mặt trước: giữa gần phẳng, hai đầu cong vòng mạnh về phía camera (y = K·x² + K4·x⁴).
const K = 1.8;
const K4 = 440;
const fy = (x: number) => K * x * x + K4 * x ** 4;
const TOP_Z = 0.012; // đỉnh mặt trên thanh mày (ở giữa)
// Mặt trên vồng nhẹ: thấp dần ~2.5mm từ giữa ra hai camera, nhìn trước hay sau đều thấy kính bầu.
const topZ = (x: number) => TOP_Z - 0.55 * x * x;
const BAR_D = 0.0095;
const barH = (x: number) => 0.003 + 0.0032 * Math.exp(-((x / 0.026) ** 2));
const barY = (x: number) => fy(x) + 0.003;

const LENS_TOP = 0.0085;
const LENS_HALF = 0.0641;
// Tròng bầu theo chiều dọc: phồng nhẹ ra trước ở giữa chiều cao rồi cong lùi về phía mặt ở mép dưới.
const lensY = (x: number, z: number) => {
  const dz = LENS_TOP - z;
  return fy(x) + 0.0012 - 0.2 * dz + 9.5 * dz * dz;
};

const CAM_X = 0.0685;
const CAM = { w: 0.0122, d: 0.0145, h: 0.0148 };
// mặt trước hộp camera ngang/nhô hơn đầu thanh mày (thanh mày ôm cong mạnh ở hai đầu nên phải đưa hộp lên trước)
const CAM_Y = fy(CAM_X) + 0.001;
// Hộp camera chỉ xoay nhẹ ra ngoài để mặt ngoài và mặt trên chạy thẳng liền vào gọng (ảnh cận ô 8).
const CAM_TURN = 0.1;

// Gọng: mặt ngoài phẳng với hộp camera; đầu gọng rộng và cao bằng hộp camera rồi thon nhanh,
// mép trên hạ nhẹ về sau, mở nhẹ ra ngoài theo bề ngang đầu, đuôi cong xuống và dày lại ở chóp.
// T_Y0: ngang góc sau-ngoài của hộp camera đã xoay (mặt ngoài gọng liền mạch với hộp từ đây).
// T_IN: gọng thật sự bắt đầu sâu bên trong hộp camera, hẹp hơn, để đầu gọng không lộ ra thành khối rời.
const T_Y0 = CAM_Y + (CAM.w / 2) * Math.sin(CAM_TURN) + (CAM.d / 2) * Math.cos(CAM_TURN) - 0.002;
const T_IN = CAM_Y + 0.001;
const T_OUT0 = CAM_X + (CAM.w / 2) * Math.cos(CAM_TURN) - (CAM.d / 2) * Math.sin(CAM_TURN) + 0.0004;
const T_BEND = 0.125;
const T_END = 0.19;
const ease = (y: number, len: number) => {
  const t = Math.min(1, Math.max(0, (y - T_Y0) / len));
  return t * t * (3 - 2 * t);
};
const templeOuter = (y: number) => T_OUT0 + 0.006 * Math.max(0, (y - T_Y0) / (T_END - T_Y0)) ** 1.4;
const templeW = (y: number) => {
  // đầu gọng rộng gần bằng hộp camera, thon dần về sau
  const w0 = CAM.w - 0.001;
  if (y < T_Y0) return w0;
  const w = w0 + (0.0066 - w0) * ease(y, 0.022);
  return y > 0.15 ? w + 0.001 * ((y - 0.15) / (T_END - 0.15)) : w;
};
const templeHalf = (y: number) => {
  const base = y < 0.13 ? 0.0047 - Math.max(0, y - 0.035) * 0.0147 : 0.0033 + (y - 0.13) * 0.015;
  // đầu gọng thấp hơn hộp camera một chút để nằm gọn trong hộp, mép dưới hộp camera nhô thấp hơn gọng
  const h0 = CAM.h / 2 - 0.0007;
  return h0 + (base - h0) * ease(y, 0.018);
};
// mặt trên gọng ngang mặt trên hộp camera (hộp cao hơn thanh mày 0.5mm để giấu đầu thanh mày)
const CAM_TOP = topZ(CAM_X) + 0.0005;
const templeTop = (y: number) => CAM_TOP - 0.00015 - 0.03 * Math.max(0, y - T_Y0);
const templeDrop = (y: number) => (y < T_BEND ? 0 : 0.027 * ((y - T_BEND) / (T_END - T_BEND)) ** 2.2);
const templeZ = (y: number) => templeTop(y) - templeHalf(y) - templeDrop(y);
const templeCX = (y: number) => templeOuter(y) - templeW(y) / 2;

// Mép dưới tròng (|x|, z): đỉnh vòm mũi -> hai chân vòm gần đứng -> vai bo tròn -> điểm thấp nhất
// giữa mắt -> cong tròn lên góc ngoài -> mép đứng ngay dưới camera.
const LENS_EDGE: [number, number][] = [
  [0, -0.006], [0.0045, -0.0068], [0.0085, -0.0098], [0.0118, -0.0145], [0.0145, -0.0205],
  [0.0165, -0.0255], [0.019, -0.0283], [0.024, -0.0293], [0.031, -0.0296], [0.04, -0.0283],
  [0.0494, -0.0245], [0.056, -0.0195], [0.0605, -0.014], [0.0632, -0.0098], [0.0641, -0.0076],
];

export function buildGlasses(T: Three) {
  const root = new T.Group();
  root.rotation.x = -Math.PI / 2;

  // Nội suy mép tròng bằng spline rồi tra theo |x|.
  const edge = new T.SplineCurve(LENS_EDGE.map(([u, z]) => new T.Vector2(u, z))).getSpacedPoints(400);
  const lensBottom = (x: number) => {
    const u = Math.min(Math.abs(x), LENS_HALF);
    let i = 1;
    while (i < edge.length - 1 && edge[i].x < u) i++;
    const a = edge[i - 1], b = edge[i];
    return a.y + ((b.y - a.y) * (u - a.x)) / (b.x - a.x || 1);
  };

  const mat = (o: THREE.MeshPhysicalMaterialParameters) => new T.MeshPhysicalMaterial(o);
  const M_BODY = mat({ color: 0xc9c9c5, metalness: 0.8, roughness: 0.27, clearcoat: 0.5, clearcoatRoughness: 0.2, side: T.DoubleSide });
  const M_BEZEL = mat({ color: 0xe2e2df, metalness: 0.9, roughness: 0.18, clearcoat: 1 });
  const M_PADARM = mat({ color: 0x9a9b9e, metalness: 0.85, roughness: 0.4 });
  const M_LENS = mat({ color: 0x1a1d22, metalness: 0.3, roughness: 0.03, clearcoat: 1, envMapIntensity: 1.5, transparent: true, opacity: 0.87, side: T.DoubleSide });
  const M_INSET = mat({ color: 0x77797d, metalness: 0.75, roughness: 0.3 });
  const M_BLACK = mat({ color: 0x050506, roughness: 0.55 });
  const M_RINGBLK = mat({ color: 0x0a0b0d, roughness: 0.3, clearcoat: 0.6 });
  const M_DARK = mat({ color: 0x141518, roughness: 0.45 });
  const M_BARREL = mat({ color: 0x2e3034, metalness: 0.9, roughness: 0.3 });
  const M_SEAM = mat({ color: 0x8a8985, metalness: 0.6, roughness: 0.4 });
  const M_GROOVE = mat({ color: 0x4a4b4f, roughness: 0.6 });
  const M_HINGE = mat({ color: 0x17181b, metalness: 0.35, roughness: 0.4, clearcoat: 0.5 });
  const M_KNOB = mat({ color: 0x2a2c30, metalness: 0.45, roughness: 0.35, clearcoat: 0.6 });
  const M_CAMG = mat({ color: 0x0a1426, metalness: 0.6, roughness: 0.04, clearcoat: 1, envMapIntensity: 2.2 });
  const M_GLINT = mat({ color: 0x7fa6d0, roughness: 0.2, emissive: 0x2a4a70, emissiveIntensity: 0.6 });
  const M_PAD = mat({ color: 0xdfe4ea, roughness: 0.22, clearcoat: 0.6, transparent: true, opacity: 0.78, envMapIntensity: 0.9 });
  const M_PADCORE = mat({ color: 0xc4cad2, roughness: 0.3, transparent: true, opacity: 0.6 });
  const M_LED = mat({ color: 0xffffff, emissive: 0xe6f3ff, emissiveIntensity: 5, roughness: 0.3 });
  const M_CHROME = mat({ color: 0xf2f2f0, metalness: 1, roughness: 0.1 });

  const add = (
    geo: THREE.BufferGeometry,
    m: THREE.Material,
    loc: Vec3 = [0, 0, 0],
    rot: Vec3 = [0, 0, 0],
    parent: THREE.Object3D = root,
  ) => {
    const mesh = new T.Mesh(geo, m);
    mesh.position.set(...loc);
    mesh.rotation.set(...rot);
    parent.add(mesh);
    return mesh;
  };

  // Hộp bo góc (superellipsoid); round càng lớn càng vuông.
  const rbox = (
    size: Vec3,
    loc: Vec3,
    m: THREE.Material,
    rot: Vec3 = [0, 0, 0],
    round = 4,
    parent: THREE.Object3D = root,
  ) => {
    const geo = new T.SphereGeometry(1, 40, 24);
    const pos = geo.attributes.position;
    const e = 2 / round;
    const f = (v: number) => Math.sign(v) * Math.abs(v) ** e;
    for (let i = 0; i < pos.count; i++) {
      pos.setXYZ(i, (f(pos.getX(i)) * size[0]) / 2, (f(pos.getY(i)) * size[1]) / 2, (f(pos.getZ(i)) * size[2]) / 2);
    }
    geo.computeVertexNormals();
    return add(geo, m, loc, rot, parent);
  };

  // Trụ dọc theo Y cục bộ (hướng ra mặt trước của hộp camera là -Y).
  const cylinderY = (r0: number, r1: number, depth: number, loc: Vec3, m: THREE.Material, parent: THREE.Object3D) =>
    add(new T.CylinderGeometry(r0, r1, depth, 48), m, loc, [0, 0, 0], parent);

  const ellipsoid = (radii: Vec3, loc: Vec3, rot: Vec3, m: THREE.Material, parent: THREE.Object3D = root) => {
    const geo = new T.SphereGeometry(1, 32, 20);
    geo.scale(...radii);
    return add(geo, m, loc, rot, parent);
  };

  // Hình chữ nhật bo góc trong mặt phẳng XY, tâm ở gốc.
  const roundedRect = <P extends THREE.Path>(path: P, w: number, h: number, r: number) => {
    const x = -w / 2, y = -h / 2;
    path.moveTo(x + r, y);
    path.lineTo(x + w - r, y);
    path.quadraticCurveTo(x + w, y, x + w, y + r);
    path.lineTo(x + w, y + h - r);
    path.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    path.lineTo(x + r, y + h);
    path.quadraticCurveTo(x, y + h, x, y + h - r);
    path.lineTo(x, y + r);
    path.quadraticCurveTo(x, y, x + r, y);
    return path;
  };

  // Quét tiết diện chữ nhật bo tròn dọc một đường cong; ref chọn hướng cạnh "a" của tiết diện.
  // endRound > 0: thu nhỏ tiết diện theo cung tròn trong đoạn cuối dài endRound (m) để đầu mút bo tròn liền khối.
  const sweep = (
    pts: Vec3[],
    ref: Vec3,
    size: (p: THREE.Vector3) => [number, number],
    m: THREE.Material,
    segs = 140,
    round = 6,
    endRound = 0,
  ) => {
    const curve = new T.CatmullRomCurve3(pts.map((q) => new T.Vector3(...q)), false, "centripetal");
    const len = curve.getLength();
    const R = new T.Vector3(...ref);
    const ring = 32, e = 2 / round;
    const verts: number[] = [], idx: number[] = [];
    const centers: THREE.Vector3[] = [];
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      const p = curve.getPointAt(t), tg = curve.getTangentAt(t);
      const n = R.clone().sub(tg.clone().multiplyScalar(R.dot(tg))).normalize();
      const b = new T.Vector3().crossVectors(tg, n);
      let [a, h] = size(p);
      const d = (1 - t) * len;
      if (endRound > 0 && d < endRound) {
        const k = Math.max(0.06, Math.sqrt(1 - (1 - d / endRound) ** 2));
        a *= k;
        h *= k;
      }
      centers.push(p);
      for (let j = 0; j < ring; j++) {
        const th = (j / ring) * Math.PI * 2;
        const c = Math.cos(th), s = Math.sin(th);
        const u = (Math.sign(c) * Math.abs(c) ** e * a) / 2;
        const v = (Math.sign(s) * Math.abs(s) ** e * h) / 2;
        verts.push(p.x + n.x * u + b.x * v, p.y + n.y * u + b.y * v, p.z + n.z * u + b.z * v);
      }
    }
    for (let i = 0; i < segs; i++) {
      for (let j = 0; j < ring; j++) {
        const a = i * ring + j, b = i * ring + ((j + 1) % ring), c = a + ring, d = b + ring;
        idx.push(a, c, b, b, c, d);
      }
    }
    // nắp hai đầu có vòng đỉnh riêng để pháp tuyến phẳng
    for (const [ri, flip] of [[0, true], [segs, false]] as const) {
      const base = verts.length / 3;
      const cp = centers[ri];
      verts.push(cp.x, cp.y, cp.z);
      for (let j = 0; j < ring; j++) {
        const k = (ri * ring + j) * 3;
        verts.push(verts[k], verts[k + 1], verts[k + 2]);
      }
      for (let j = 0; j < ring; j++) {
        const a = base + 1 + j, b = base + 1 + ((j + 1) % ring);
        if (flip) idx.push(base, b, a);
        else idx.push(base, a, b);
      }
    }
    const geo = new T.BufferGeometry();
    geo.setAttribute("position", new T.Float32BufferAttribute(verts, 3));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    return add(geo, m);
  };

  // --- tròng liền khối không viền dưới: lưới theo cột, dày đặc quanh vòm mũi để mép mượt
  {
    const nx = 320, nz = 24;
    const pts: number[] = [], idx: number[] = [];
    for (let i = 0; i <= nx; i++) {
      const t = (i / nx) * 2 - 1;
      const x = Math.sign(t) * Math.abs(t) ** 1.25 * LENS_HALF;
      const zb = lensBottom(x);
      for (let j = 0; j <= nz; j++) {
        const zt = LENS_TOP - (TOP_Z - topZ(x));
        const z = zb + (j / nz) * (zt - zb);
        pts.push(x, lensY(x, z), z);
      }
    }
    for (let i = 0; i < nx; i++) {
      for (let j = 0; j < nz; j++) {
        const a = i * (nz + 1) + j, b = a + nz + 1;
        idx.push(a, b, a + 1, a + 1, b, b + 1);
      }
    }
    const geo = new T.BufferGeometry();
    geo.setAttribute("position", new T.Float32BufferAttribute(pts, 3));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    add(geo, M_LENS).renderOrder = 2;
  }

  // --- thanh mày: mặt trên phẳng, sâu, võng nhẹ ở cầu mũi
  // hai đầu nâng dần lên ngang mặt trên hộp camera để nối phẳng
  const barTop = (x: number) => topZ(x) + (CAM_TOP - topZ(x)) * Math.min(1, Math.max(0, (Math.abs(x) - 0.052) / 0.012)) ** 2;
  const barBottom = (x: number) => barTop(x) - barH(x);
  {
    const pts: Vec3[] = [];
    // hai đầu thanh mày cắm sâu vào trong hộp camera
    for (let i = 0; i <= 24; i++) {
      const x = (i / 24 - 0.5) * 0.134;
      pts.push([x, barY(x), barTop(x) - barH(x) / 2]);
    }
    sweep(pts, [0, 0, 1], (p) => [barH(p.x), BAR_D], M_BODY, 160, 10);
  }
  // loa: lưới 2×2 khe hình viên thuốc ở mặt dưới thanh mày hai bên, giữa mép tròng và thanh ray; cảm biến nhỏ ở giữa
  for (const sx of [-1, 1]) {
    for (const [dx, dy] of [[-0.0016, -0.0004], [0.0016, -0.0004], [-0.0016, 0.001], [0.0016, 0.001]]) {
      const x = sx * (0.05 + dx);
      rbox([0.0028, 0.0009, 0.0004], [x, barY(x) + dy, topZ(x) - barH(x) - 0.0001], M_BLACK, [0, 0, sx * 0.26], 3);
    }
  }
  rbox([0.0028, 0.0014, 0.0005], [0, barY(0) + 0.0002, TOP_Z - barH(0) - 0.0001], M_BLACK, [0, 0, 0], 6);

  // --- mặt dưới (ô 6): thanh ray đen dọc mép sau dưới thanh mày (giữ mép trên tròng), có bậc nhô gần hai góc,
  // hai đầu cong vào khối bản lề đen ở góc trong
  const RAIL_Y = BAR_D / 2 - 0.0016;
  {
    const pts: Vec3[] = [];
    const hinge = (sx: number): Vec3 => [sx * (CAM_X - CAM.w / 2 - 0.0011), CAM_Y + 0.0006, barBottom(0.06) - 0.0008];
    pts.push(hinge(-1));
    for (let i = 0; i <= 24; i++) {
      const x = (i / 24 - 0.5) * 0.114;
      pts.push([x, barY(x) + RAIL_Y, barBottom(x) - 0.0005]);
    }
    pts.push(hinge(1));
    sweep(pts, [0, 0, 1], () => [0.001, 0.0028], M_HINGE, 200, 6);
    for (const sx of [-1, 1]) {
      const x = sx * 0.049;
      const slope = 2 * K * Math.abs(x) + 4 * K4 * Math.abs(x) ** 3;
      rbox([0.0115, 0.003, 0.0016], [x, barY(x) + RAIL_Y, barBottom(x) - 0.0009], M_HINGE, [0, 0, sx * Math.atan(slope)], 6);
    }
  }

  for (const side of [1, -1]) {
    // đường ron răng ghép cắt ngang mặt dưới, chỗ thanh mày nối khối góc: đoạn thẳng, tai tròn lồi về phía camera,
    // đoạn thẳng (dựng cho bên +X theo hệ tiếp tuyến/pháp tuyến của thanh mày rồi lật theo side)
    const X0 = 0.0578, R = 0.0011;
    const slope = 2 * K * X0 + 4 * K4 * X0 ** 3;
    const tn = Math.hypot(1, slope);
    const t = [1 / tn, slope / tn], across = [-slope / tn, 1 / tn];
    const c = [X0, barY(X0) - 0.0004];
    const L = BAR_D / 2 - 0.0003;
    const at = (u: number, v: number): Vec3 => {
      const x = c[0] + t[0] * u + across[0] * v;
      return [side * x, c[1] + t[1] * u + across[1] * v, barBottom(x) - 0.00006];
    };
    const pts: Vec3[] = [];
    for (let i = 0; i <= 5; i++) pts.push(at(0, -L + ((L - 0.6 * R) * i) / 5));
    for (let i = 0; i <= 20; i++) {
      const th = -Math.PI + 0.62 + ((2 * Math.PI - 1.24) * i) / 20;
      pts.push(at(1.25 * R + R * Math.cos(th), R * Math.sin(th)));
    }
    for (let i = 0; i <= 5; i++) pts.push(at(0, 0.6 * R + ((L - 0.6 * R) * i) / 5));
    sweep(pts, [0, 0, 1], () => [0.0003, 0.0003], M_GROOVE, 160, 2);

    // khối bản lề đen ở góc trong, núm tròn (chốt xoay) quay vào trong, viền kim loại và lỗ vít ở tâm
    const hx = side * (CAM_X - CAM.w / 2 - 0.0011), hy = CAM_Y + 0.0042, hz = CAM_TOP - 0.0086;
    rbox([0.003, 0.0082, 0.0088], [hx, hy, hz], M_HINGE, [0, 0, side * CAM_TURN], 6);
    const face = hx - side * 0.0015;
    const disc = new T.CylinderGeometry(0.0022, 0.0023, 0.0007, 40);
    disc.rotateZ(Math.PI / 2);
    add(disc, M_HINGE, [face - side * 0.0003, hy + 0.0004, hz - 0.0007]);
    add(new T.TorusGeometry(0.0018, 0.00012, 8, 40), M_BARREL, [face - side * 0.00068, hy + 0.0004, hz - 0.0007], [0, Math.PI / 2, 0]);
    const screw = new T.CylinderGeometry(0.00045, 0.00045, 0.0003, 16);
    screw.rotateZ(Math.PI / 2);
    add(screw, M_SEAM, [face - side * 0.0007, hy + 0.0004, hz - 0.0007]);
  }

  // cảm biến nhỏ màu đen sau tròng, sát mép thanh mày
  for (const sx of [-1, 1]) {
    const z = topZ(0.052) - barH(0.052) - 0.0016;
    rbox([0.0042, 0.0012, 0.0024], [sx * 0.052, lensY(0.052, z) + 0.0014, z], M_DARK, [0, 0, sx * 0.27], 8);
  }

  // --- vòm mũi: viền đen chạy theo mép tròng
  {
    const pts: Vec3[] = [];
    for (let i = 0; i <= 28; i++) {
      const x = (i / 28 - 0.5) * 0.0318;
      const z = lensBottom(x) - 0.0002;
      pts.push([x, lensY(x, z) + 0.0002, z]);
    }
    sweep(pts, [0, 1, 0], (p) => [0.0026, 0.0022 + 0.0016 * Math.exp(-((p.x / 0.007) ** 2))], M_BLACK, 120, 4);
  }

  for (const side of [1, -1]) {
    // đệm mũi: thân silicon mờ hình giọt nước, lõi viên thuốc
    const pz = -0.0168;
    const pad = new T.Group();
    pad.position.set(side * 0.0102, lensY(0.0102, pz) + 0.0042, pz);
    pad.rotation.set(0, -side * 0.6, -side * 0.35);
    root.add(pad);
    ellipsoid([0.0038, 0.0014, 0.0088], [0, 0, 0], [0, 0, 0], M_PAD, pad);
    rbox([0.0015, 0.0006, 0.0074], [0, -0.0012, 0], M_PADCORE, [0, 0, 0], 2, pad);
    // tay đỡ kim loại mờ, cong nhẹ từ trong đỉnh vòm xuống đầu đệm
    pad.updateMatrix();
    const top = new T.Vector3(0, 0, 0.0085).applyMatrix4(pad.matrix);
    const z0 = -0.0098;
    sweep(
      [
        [side * 0.0046, lensY(0.0046, z0) + 0.0028, z0],
        [(side * 0.0046 + top.x) / 2 + side * 0.0006, (lensY(0.0046, z0) + 0.0028 + top.y) / 2, (z0 + top.z) / 2],
        [top.x, top.y, top.z],
      ],
      [0, 1, 0],
      () => [0.0008, 0.0008],
      M_PADARM,
      24,
      2,
    );
  }

  for (const side of [1, -1]) {
    // --- hộp camera ở góc
    const block = rbox([CAM.w, CAM.d, CAM.h], [side * CAM_X, CAM_Y, CAM_TOP - CAM.h / 2], M_BODY, [0, 0, side * CAM_TURN], 10);
    const face = -CAM.d / 2;
    // khung bezel mảnh nhô ra (khối ép đùn có lỗ), ô xám kim loại lõm vào trong
    const ring = roundedRect(new T.Shape(), 0.0112, 0.0126, 0.0024);
    ring.holes.push(roundedRect(new T.Path(), 0.0094, 0.0108, 0.0016));
    const bezel = new T.ExtrudeGeometry(ring, {
      depth: 0.001,
      bevelEnabled: true,
      bevelThickness: 0.0003,
      bevelSize: 0.00025,
      bevelSegments: 4,
      curveSegments: 12,
    });
    bezel.rotateX(Math.PI / 2); // đùn theo -Y cục bộ, mặt hình nằm trong XZ
    add(bezel, M_BEZEL, [0, face + 0.0003, 0], [0, 0, 0], block);
    rbox([0.0096, 0.0008, 0.011], [0, face - 0.0002, 0], M_INSET, [0, 0, 0], 8, block);
    // ống kính: vòng đen lớn gần kín ô, vòng kim loại, mặt kính ánh xanh
    cylinderY(0.0039, 0.0042, 0.0012, [0, face - 0.0008, 0], M_RINGBLK, block);
    cylinderY(0.0026, 0.0027, 0.0004, [0, face - 0.0015, 0], M_BARREL, block);
    ellipsoid([0.0021, 0.00035, 0.0021], [0, face - 0.0015, 0], [0, 0, 0], M_CAMG, block);
    ellipsoid([0.00045, 0.0001, 0.00035], [-0.0006, face - 0.0018, 0.0006], [0, 0, 0], M_GLINT, block);
    ellipsoid([0.00025, 0.0001, 0.00025], [0.0001, face - 0.0018, 0.0007], [0, 0, 0], M_GLINT, block);
    // đường ron chia khối giữa hộp camera và thanh mày
    rbox([0.00025, CAM.d + 0.0001, CAM.h + 0.0001], [-side * (CAM.w / 2 - 0.0016), 0, 0], M_SEAM, [0, 0, 0], 7, block);
    // lỗ nhỏ trên mặt trên hộp camera
    add(new T.CylinderGeometry(0.0003, 0.0003, 0.0004, 12), M_DARK, [0.001, 0.003, CAM.h / 2], [Math.PI / 2, 0, 0], block);


    // --- gọng: lấy mẫu dọc theo y, nối liền mượt từ hộp camera tới chóp tai
    const pts: Vec3[] = [];
    pts.push([side * templeCX(T_IN), T_IN, templeZ(T_IN)]);
    for (let y = T_Y0; y < T_END; y += 0.005) pts.push([side * templeCX(y), y, templeZ(y)]);
    pts.push([side * templeCX(T_END), T_END, templeZ(T_END)]);
    // chóp tai bo tròn liền với thân gọng
    sweep(pts, [1, 0, 0], (p) => [templeW(p.y), templeHalf(p.y) * 2], M_BODY, 360, 7, templeHalf(T_END));

    const tx = (y: number) => side * templeCX(y);
    // đường ron khớp hình chữ S ngay sau hộp camera: bám đúng tiết diện bo tròn của gọng; chạy chéo cong
    // qua mặt trên và mặt dưới (trong -> ngoài), lồi ra trước ở mặt ngoài, thẳng ở mặt trong
    {
      const Y_IN = T_Y0 + 0.0017, Y_OUT = T_Y0 + 0.0057, e = 2 / 7, gap = 0.00008;
      const S = (t: number) => t - Math.sin(2 * Math.PI * t) / (2 * Math.PI);
      const loop: Vec3[] = [];
      for (let i = 0; i <= 96; i++) {
        const th = (i / 96) * Math.PI * 2;
        const c = Math.cos(th), sn = Math.sin(th);
        const cu = Math.sign(c) * Math.abs(c) ** e, sv = Math.sign(sn) * Math.abs(sn) ** e;
        const o = side * cu; // 1 = mặt ngoài, -1 = mặt trong
        const y = Y_IN + (Y_OUT - Y_IN) * S((o + 1) / 2) - 0.0012 * Math.max(0, o) ** 8 * Math.cos((Math.PI * sv) / 2);
        const a = templeW(y) / 2 + gap, h = templeHalf(y) + gap;
        loop.push([side * templeCX(y) + cu * a, y, templeZ(y) + sv * h]);
      }
      sweep(loop, [0, 1, 0], () => [0.0003, 0.0003], M_SEAM, 300, 2);
    }

    // đường ron thứ hai trên gọng, nơi vỏ pin tách khỏi phần đầu gọng
    const seam2 = 0.083;
    rbox([templeW(seam2) + 0.00005, 0.0002, templeHalf(seam2) * 2 + 0.00005], [tx(seam2), seam2, templeZ(seam2)], M_SEAM, [0, 0, 0], 8);

    // đèn LED (gần đường ron) và micro nằm cùng một độ cao, trên đường giữa của mặt ngoài gọng
    const ledY = 0.04, micY = 0.05;
    const midZ = (templeZ(ledY) + templeZ(micY)) / 2;
    // đèn LED báo hoạt động: vạch sáng chữ nhật
    rbox([0.0003, 0.0028, 0.0011], [side * templeOuter(ledY), ledY, midZ], M_LED, [0, 0, 0], 6);
    // micro: khe dài hình viên thuốc có viền
    rbox([0.0004, 0.0068, 0.0016], [side * (templeOuter(micY) + 0.00005), micY, midZ], M_SEAM, [0, 0, 0], 3);
    rbox([0.0004, 0.0058, 0.0009], [side * (templeOuter(micY) + 0.0001), micY, midZ], M_BLACK, [0, 0, 0], 3);
  }

  // --- gọng PHẢI (-X): nút điều khiển chữ nhật bo tròn gần camera, nút đa năng tròn phía sau
  const xr = (y: number) => -templeCX(y);
  const PILL_Y = 0.042, KNOB_Y = 0.062, USB_Y = 0.07;
  rbox([0.0034, 0.0115, 0.0016], [xr(PILL_Y), PILL_Y, templeTop(PILL_Y) + 0.0004], M_BEZEL, [0, 0, 0], 6);
  add(new T.TorusGeometry(0.0024, 0.0002, 8, 40), M_SEAM, [xr(KNOB_Y), KNOB_Y, templeTop(KNOB_Y) + 0.0001]);
  const knob = new T.CylinderGeometry(0.0022, 0.0022, 0.0012, 40);
  knob.rotateX(Math.PI / 2);
  add(knob, M_BEZEL, [xr(KNOB_Y), KNOB_Y, templeTop(KNOB_Y) + 0.0005]);
  ellipsoid([0.0022, 0.0022, 0.0004], [xr(KNOB_Y), KNOB_Y, templeTop(KNOB_Y) + 0.0011], [0, 0, 0], M_BEZEL);
  // --- gọng TRÁI (+X): công tắc trượt nguồn ở mặt dưới gọng, trên đoạn đáy phẳng (đối xứng với cổng sạc bên phải),
  // chữ ON/OFF ở hai đầu rãnh
  {
    const xl = (y: number) => templeCX(y);
    const under = (y: number) => templeZ(y) - templeHalf(y);
    const SW_Y = 0.058, SW_L = 0.0118;
    // viền rãnh + rãnh trượt tối hình viên thuốc
    rbox([0.0044, SW_L + 0.0007, 0.0004], [xl(SW_Y), SW_Y, under(SW_Y) - 0.00008], M_SEAM, [0, 0, 0], 3);
    rbox([0.0036, SW_L, 0.0006], [xl(SW_Y), SW_Y, under(SW_Y) - 0.00012], M_BLACK, [0, 0, 0], 3);
    // núm trượt nhô xuống, đang ở vị trí bật (phía trước), mặt núm có 3 gờ chống trượt
    const KNOB_Y = SW_Y - SW_L / 2 + 0.003;
    const kz = under(KNOB_Y) - 0.0004;
    rbox([0.0029, 0.0048, 0.001], [xl(KNOB_Y), KNOB_Y, kz], M_KNOB, [0, 0, 0], 4);
    for (const dy of [-0.0011, 0, 0.0011]) {
      rbox([0.0022, 0.0003, 0.0003], [xl(KNOB_Y + dy), KNOB_Y + dy, kz - 0.0005], M_SEAM, [0, 0, 0], 4);
    }
    // chữ ON (đầu trước, phía núm đang gạt tới) và OFF (đầu sau) in ở hai đầu rãnh;
    // mặt chữ quay xuống dưới, đọc xuôi khi lật kính nhìn mặt dưới từ phía trước (phía trước kính ở trên)
    const label = (text: string, y: number) => {
      const c = document.createElement("canvas");
      c.width = 256;
      c.height = 96;
      const g = c.getContext("2d")!;
      g.fillStyle = "#fff";
      g.font = "700 78px Arial, Helvetica, sans-serif";
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(text, 128, 52);
      const tex = new T.CanvasTexture(c);
      tex.colorSpace = T.SRGBColorSpace;
      tex.anisotropy = 4;
      const m = new T.MeshStandardMaterial({ map: tex, color: 0x3c3d41, roughness: 0.6, transparent: true, alphaTest: 0.2 });
      add(new T.PlaneGeometry(0.0034, 0.00128), m, [xl(y), y, under(y) - 0.00006], [Math.PI, 0, 0]);
    };
    label("ON", SW_Y - SW_L / 2 - 0.0011);
    label("OFF", SW_Y + SW_L / 2 + 0.0011);
  }

  // --- cổng sạc USB-C ở mặt dưới gọng phải: viền chrome bo tròn như vòng xuyến trong một rãnh tối mảnh,
  // lòng cổng đen sâu, lưỡi tiếp xúc chrome hai đầu bo tròn
  {
    const bot = (y: number) => templeZ(y) - templeHalf(y);
    const cx = xr(USB_Y), cz = bot(USB_Y);
    // hình viên thuốc thật (2 nửa tròn + 2 cạnh thẳng) trên mặt phẳng XY: x ngang gọng, y dọc gọng
    const stadium = <P extends THREE.Path>(path: P, w: number, h: number) => {
      const r = w / 2;
      path.absarc(0, h / 2 - r, r, 0, Math.PI, false);
      path.absarc(0, -h / 2 + r, r, Math.PI, Math.PI * 2, false);
      path.closePath();
      return path;
    };
    // vòng ống khép kín chạy theo đường viên thuốc, tiết diện tròn rồi ép dẹt theo độ dày (z)
    const stadiumTube = (w: number, h: number, r: number, flatten: number, z: number, m: THREE.Material) => {
      const pts = stadium(new T.Path(), w, h).getSpacedPoints(96).slice(0, -1);
      const curve = new T.CatmullRomCurve3(pts.map((p) => new T.Vector3(p.x, p.y, 0)), true);
      const g = new T.TubeGeometry(curve, 160, r, 20, true);
      g.scale(1, 1, flatten);
      return add(g, m, [cx, USB_Y, z]);
    };
    // đường ron chia khối trên mặt dưới, hai bên ô cổng
    const seam = (y: number) =>
      rbox([templeW(y) - 0.0018, 0.0002, 0.0003], [xr(y), y, bot(y) + 0.00004], M_SEAM, [0, 0, 0], 8);
    seam(USB_Y - 0.0072);
    seam(USB_Y + 0.0072);

    // rãnh tối mảnh bao ngoài viền
    stadiumTube(0.0043, 0.0108, 0.00013, 0.6, cz + 0.00004, M_BLACK);
    // viền chrome bo tròn, nhô khỏi mặt gọng
    stadiumTube(0.00335, 0.0097, 0.00038, 0.75, cz - 0.00008, M_CHROME);
    // lòng cổng đen sâu (mặt phẳng ngay ngoài mặt gọng, quay ra ngoài)
    add(new T.ShapeGeometry(stadium(new T.Shape(), 0.0028, 0.0092), 24), M_BLACK, [cx, USB_Y, cz - 0.00004], [Math.PI, 0, 0]);
    // lưỡi tiếp xúc: thanh chrome hai đầu bo tròn, nằm giữa lòng cổng, thụt vào so với viền
    const tongue = new T.CapsuleGeometry(0.00028, 0.0056, 6, 16);
    tongue.scale(1.25, 1, 0.75);
    add(tongue, M_CHROME, [cx, USB_Y, cz - 0.00006]);
  }

  // đưa tâm xoay về giữa kính
  const pivot = new T.Group();
  root.position.set(0, 0.009, 0.09);
  pivot.add(root);
  return pivot;
}
