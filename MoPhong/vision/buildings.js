// Nhà phố / cửa hàng kiểu Việt Nam.
// Hệ toạ độ cục bộ: mặt tiền nằm ở x = 0 và quay về +X; thân nhà lùi về phía -X; chiều rộng dọc trục Z.
// world.js xoay group 180° cho dãy nhà bên phải.

import * as THREE from 'three';
import { mat, mesh, box, cyl } from './materials.js';
import {
  makeFacade, makePlaster, makeShopInterior, makeSign, makeShutter, makeRailing, makeGrille, makeAwning, makeFlag, makeVerticalSign, rng,
} from './textures.js';

export const GF = 3.5;   // chiều cao tầng trệt
export const FH = 3.1;   // chiều cao mỗi tầng trên
const facadeCache = new Map();
const plasterCache = new Map();
const interiorCache = new Map();
const shutterCache = new Map();
let railMat = null;
let grilleMat = null;

function getFacade(opt, seed) {
  const key = [opt.width.toFixed(1), opt.floors, opt.color, opt.style].join('|');
  if (!facadeCache.has(key)) facadeCache.set(key, makeFacade(opt, seed));
  return facadeCache.get(key);
}
function getInterior(kind, seed) {
  const key = kind + (seed % 3);
  if (!interiorCache.has(key)) interiorCache.set(key, makeShopInterior(kind, seed));
  return interiorCache.get(key);
}
function shutterTex(rx, ry) {
  const key = rx + 'x' + ry;
  if (!shutterCache.has(key)) {
    const t = makeShutter().clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(rx, ry);
    t.needsUpdate = true;
    shutterCache.set(key, t);
  }
  return shutterCache.get(key);
}

/**
 * @param {{w:number,floors:number,kind:'shop'|'house'|'cafe',sign:object,interior:string,color:string,trim:string,
 *          style:string,shutter:string,awning?:string[]|null,flag?:boolean,seed:number,depth?:number}} lot
 */
export function buildShophouse(lot) {
  const { w, floors, kind, sign, interior, color, trim, style, seed, depth = 9 } = lot;
  const r = rng(seed * 53 + 11);
  const g = new THREE.Group();
  const H0 = GF + floors * FH;
  const pw = 0.45;
  const ow = w - pw * 2;
  const openH = GF - 0.5;

  const wall = new THREE.MeshStandardMaterial({ map: plasterCache.get(color) ?? (plasterCache.set(color, makePlaster(color, seed)), plasterCache.get(color)), roughness: 0.95 });
  const pierMat = mat(parseInt(trim.slice(1), 16), { roughness: 0.9 });

  // Thân phía trên (tầng 2 trở lên)
  g.add(mesh(new THREE.BoxGeometry(depth, floors * FH, w), wall, { x: -depth / 2, y: GF + (floors * FH) / 2 }));
  // Tầng trệt: hai trụ, dầm, sàn, trần
  for (const s of [-1, 1]) g.add(mesh(new THREE.BoxGeometry(depth, GF, pw), wall, { x: -depth / 2, y: GF / 2, z: s * (w / 2 - pw / 2) }));
  g.add(mesh(new THREE.BoxGeometry(depth, 0.5, ow), wall, { x: -depth / 2, y: GF - 0.25 })); // dầm trên cửa
  // trụ nhô ra một chút như thật
  for (const s of [-1, 1]) g.add(box(0.14, GF, pw + 0.06, pierMat, { x: 0.07, y: GF / 2, z: s * (w / 2 - pw / 2) }));

  // Mặt tiền các tầng trên
  const facadeTex = getFacade({ width: w, floors, color, trim, style, shutter: lot.shutter, sill: '#cfc7b6' }, seed);
  const facade = new THREE.Mesh(
    new THREE.PlaneGeometry(w, floors * FH),
    new THREE.MeshStandardMaterial({ map: facadeTex, roughness: 0.92 }),
  );
  facade.rotation.y = Math.PI / 2;
  facade.position.set(0.02, GF + (floors * FH) / 2, 0);
  facade.castShadow = false;
  facade.receiveShadow = true;
  g.add(facade);

  // Lan can mái + gờ mái
  g.add(box(0.34, 0.62, w + 0.08, pierMat, { x: 0.05, y: H0 + 0.31 }));
  g.add(box(0.5, 0.08, w + 0.2, mat(0xcfc7b6, { roughness: 0.85 }), { x: 0.1, y: H0 + 0.64 }));
  g.add(box(depth, 0.5, w, wall, { x: -depth / 2, y: H0 + 0.25 })); // phần lan can phía sau
  // bồn nước inox trên mái (nhìn thấy từ xa)
  if (r() < 0.6) g.add(cyl(0.62, 0.62, 1.3, 16, mat(0xd7dde0, { metalness: 0.7, roughness: 0.3 }), { x: -depth * 0.55, y: H0 + 1.1, z: (r() - 0.5) * (w - 1.4) }));

  // Ban công (3D) cho các tầng có cửa ban công
  if (!railMat) {
    const rt = makeRailing();
    railMat = new THREE.MeshStandardMaterial({ map: rt, alphaTest: 0.5, alphaToCoverage: true, side: THREE.DoubleSide, roughness: 0.6, metalness: 0.4 });
  }
  const slabMat = mat(0xcfc7b6, { roughness: 0.9 });
  const hasBalcony = style === 'balcony' || style === 'mixed';
  if (hasBalcony) {
    for (let f = 0; f < floors; f++) {
      if (style === 'mixed' && f % 2 !== 0) continue;
      const y = GF + f * FH + 0.07;
      g.add(box(0.75, 0.14, w - 0.5, slabMat, { x: 0.375, y }));
      const rail = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.55, 0.95), railMat);
      rail.rotation.y = Math.PI / 2;
      rail.position.set(0.72, y + 0.55, 0);
      rail.castShadow = true;
      g.add(rail);
      for (const s of [-1, 1]) g.add(box(0.75, 0.9, 0.04, mat(0x3a3d40), { x: 0.375, y: y + 0.55, z: s * (w / 2 - 0.27) }));
    }
  }

  // Máy lạnh ngoài tường (3D)
  if (!grilleMat) grilleMat = new THREE.MeshStandardMaterial({ map: makeGrille(), roughness: 0.6 });
  const nAC = floors > 2 ? 1 + ((r() * 2) | 0) : 1;
  for (let i = 0; i < nAC; i++) {
    const y = GF + FH * (1 + ((r() * (floors - 1)) | 0)) + 0.9 + r() * 0.4;
    const z = (r() - 0.5) * (w - 1.6);
    const ac = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.5, 0.78), [grilleMat, pierMat, pierMat, pierMat, pierMat, pierMat]);
    ac.position.set(0.17, y, z);
    ac.castShadow = true;
    g.add(ac);
  }

  // Đèn lồng đỏ treo trước quán (cà phê, quán ăn)
  if (kind === 'cafe' || (kind === 'shop' && r() < 0.18)) {
    const lm = new THREE.MeshStandardMaterial({ color: 0xc4261d, emissive: 0x5a0d08, emissiveIntensity: 0.5, roughness: 0.55 });
    const n = 3 + ((r() * 2) | 0);
    for (let i = 0; i < n; i++) {
      const z = -w / 2 + 0.9 + (i * (w - 1.8)) / Math.max(1, n - 1);
      const y = GF - 0.05;
      g.add(cyl(0.004, 0.004, 0.35, 4, mat(0x222222), { x: 0.75, y: y + 0.17, z }));
      const lan = mesh(new THREE.SphereGeometry(0.15, 12, 9), lm, { x: 0.75, y: y - 0.12, z, sy: 1.25 });
      g.add(lan);
      g.add(cyl(0.05, 0.05, 0.03, 8, mat(0xd9a620, { metalness: 0.4 }), { x: 0.75, y: y + 0.07, z }));
      g.add(cyl(0.05, 0.05, 0.03, 8, mat(0xd9a620, { metalness: 0.4 }), { x: 0.75, y: y - 0.34, z }));
    }
  }

  // Cờ Tổ quốc
  if (lot.flag) {
    const z = (r() < 0.5 ? -1 : 1) * (w / 2 - 0.5);
    const y = GF + FH + 1.4;
    g.add(cyl(0.02, 0.02, 1.7, 6, mat(0x777777, { metalness: 0.6 }), { x: 0.35, y, z, rz: -0.9 }));
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.63), new THREE.MeshStandardMaterial({ map: makeFlag(), side: THREE.DoubleSide, roughness: 0.9 }));
    flag.position.set(0.95, y + 0.1, z + 0.5 * (z < 0 ? 1 : -1));
    flag.rotation.y = 0.15;
    flag.castShadow = true;
    g.add(flag);
  }

  // ───── Tầng trệt ─────
  const isOpen = kind !== 'house';
  // hốc cửa: sàn + trần
  g.add(box(0.8, 0.05, ow, mat(0x6e675f, { roughness: 0.9 }), { x: -0.4, y: 0.03 }));
  g.add(box(0.8, 0.05, ow, mat(0xe8e0d0, { roughness: 0.9 }), { x: -0.4, y: openH + 0.02 }));

  if (isOpen) {
    const it = getInterior(interior, seed);
    const wallInt = new THREE.MeshStandardMaterial({
      map: it, emissive: new THREE.Color(0xffffff), emissiveMap: it, emissiveIntensity: 0.75, roughness: 0.9,
    });
    const back = new THREE.Mesh(new THREE.PlaneGeometry(ow, openH), wallInt);
    back.rotation.y = Math.PI / 2;
    back.position.set(-0.8, openH / 2, 0);
    g.add(back);
    // cuộn cửa kéo lên: hộp cuốn + vài nan thả xuống
    const rollTex = shutterTex(Math.max(1, Math.round(ow / 3)), 0.5);
    const box1 = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.42, ow + 0.06), [mat(0x70757b), mat(0x70757b), mat(0x70757b), mat(0x70757b), new THREE.MeshStandardMaterial({ map: rollTex, roughness: 0.6, metalness: 0.4 }), mat(0x70757b)]);
    box1.position.set(0.1, openH - 0.2, 0);
    box1.castShadow = true;
    g.add(box1);
  } else {
    // cửa cuốn đóng kín + cửa phụ
    const rt = shutterTex(Math.max(1, Math.round(ow / 3)), 3);
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(ow, openH), new THREE.MeshStandardMaterial({ map: rt, roughness: 0.55, metalness: 0.5 }));
    sh.rotation.y = Math.PI / 2;
    sh.position.set(0.12, openH / 2, 0);
    sh.castShadow = true;
    g.add(sh);
    g.add(box(0.12, 0.42, ow + 0.06, mat(0x60656b, { metalness: 0.5 }), { x: 0.14, y: openH - 0.2 }));
    const door = box(0.07, 2.25, 0.9, mat(0x6a3d28, { roughness: 0.7 }), { x: 0.2, y: 1.125 + 0.05, z: ow / 2 - 0.65 });
    g.add(door);
    g.add(cyl(0.015, 0.015, 0.14, 6, mat(0xd9b84a, { metalness: 0.8 }), { x: 0.26, y: 1.1, z: ow / 2 - 0.3, rz: Math.PI / 2 }));
  }

  // Biển hiệu cửa hàng — BoxGeometry: mặt +X là index 0 (hướng ra đường)
  const st = makeSign(sign.text, sign);
  const edge = mat(0x2b2b2b);
  const board = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.95, w - 0.34), [
    new THREE.MeshStandardMaterial({ map: st, roughness: 0.55, emissive: new THREE.Color(0xffffff), emissiveMap: st, emissiveIntensity: 0.18 }),
    edge, edge, edge, edge, edge,
  ]);
  board.position.set(0.17, GF + 0.02, 0);
  board.castShadow = true;
  board.receiveShadow = true;
  g.add(board);
  // biển dọc nhô ra khỏi mặt tiền (đặc trưng phố Việt Nam)
  if (isOpen && r() < 0.6) {
    const words = sign.text.split(' ');
    const lines = words.length <= 3 ? words : [words[0], words.slice(1, -1).join(' '), words[words.length - 1]];
    const pal = [{ bg: '#e2b21f', fg: '#b3261e' }, { bg: '#1c6fb5', fg: '#ffffff' }, { bg: '#f1ede0', fg: '#b3261e' }, { bg: '#2f8f4f', fg: '#ffffff' }];
    const p = pal[(r() * pal.length) | 0];
    const bt = makeVerticalSign(lines, p);
    const bface = new THREE.MeshStandardMaterial({ map: bt, roughness: 0.55 });
    const bedge = mat(0x303030);
    const banner = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.5, 0.06), [bedge, bedge, bedge, bedge, bface, bface]);
    banner.position.set(0.24, GF + 1.45, (r() < 0.5 ? -1 : 1) * (w / 2 - 0.5));
    banner.castShadow = true;
    g.add(banner);
  }
  // khung treo biển
  for (const s of [-1, 1]) g.add(box(0.05, 0.9, 0.05, mat(0x555a5e, { metalness: 0.6 }), { x: 0.05, y: GF + 0.02, z: s * (w / 2 - 0.3) }));

  // Mái hiên bạt
  if (lot.awning) {
    const tex = makeAwning(lot.awning[0], lot.awning[1]);
    const aw = new THREE.Mesh(
      new THREE.BoxGeometry(1.15, 0.04, ow + 0.1),
      [mat(0x333333), mat(0x333333), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 }), mat(0x333333), mat(0x333333), mat(0x333333)],
    );
    aw.position.set(0.7, openH - 0.55, 0);
    aw.rotation.z = -0.28;
    aw.castShadow = true;
    g.add(aw);
  }

  // Hộp công tơ điện
  g.add(box(0.1, 0.46, 0.34, mat(0xe9e9e4, { roughness: 0.5 }), { x: 0.19, y: 1.55, z: -(w / 2 - pw / 2) }));
  g.add(box(0.03, 0.16, 0.2, mat(0x2b3a44), { x: 0.255, y: 1.62, z: -(w / 2 - pw / 2) }));
  // đèn tường
  if (r() < 0.5) g.add(box(0.1, 0.1, 0.22, mat(0xfff4cf, { emissive: 0xffe9a8, emissiveIntensity: 0.5 }), { x: 0.2, y: GF - 0.9, z: (w / 2 - pw / 2) }));

  g.userData.height = H0 + 0.7;
  return g;
}

/** Khối nhà đơn giản cho dãy phố phía xa (ít chi tiết, chỉ 5 mesh). */
export function buildSimpleBlock(lot) {
  const { w, floors, color, trim, style, seed, depth = 9, sign } = lot;
  const g = new THREE.Group();
  const H0 = GF + floors * FH;
  const wall = mat(parseInt(color.slice(1), 16), { roughness: 0.95 });
  g.add(mesh(new THREE.BoxGeometry(depth, H0 + 0.6, w), wall, { x: -depth / 2, y: (H0 + 0.6) / 2, cast: true }));
  const facade = new THREE.Mesh(
    new THREE.PlaneGeometry(w, floors * FH),
    new THREE.MeshStandardMaterial({ map: getFacade({ width: w, floors, color, trim, style, shutter: lot.shutter, sill: '#cfc7b6' }, seed), roughness: 0.92 }),
  );
  facade.rotation.y = Math.PI / 2;
  facade.position.set(0.02, GF + (floors * FH) / 2, 0);
  g.add(facade);
  const front = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.9, GF - 0.5), new THREE.MeshStandardMaterial({ color: 0x5b4a3a, roughness: 0.9, emissive: 0x3a2a1a, emissiveIntensity: 0.5 }));
  front.rotation.y = Math.PI / 2;
  front.position.set(0.03, (GF - 0.5) / 2, 0);
  g.add(front);
  const sg = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.9, w - 0.4), mat(parseInt((sign?.bg ?? '#8a2b22').slice(1), 16), { roughness: 0.6 }));
  sg.position.set(0.12, GF, 0);
  g.add(sg);
  return g;
}
