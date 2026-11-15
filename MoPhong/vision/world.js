// Dựng con phố: mặt đường, vỉa hè, dãy nhà phố, cây, cột điện, đồ vật; đăng ký mọi vật thể vào registry.

import * as THREE from 'three';
import { STREET, GROUPS } from './data.js';
import { mat, mesh, box, cyl, tagObject } from './materials.js';
import { makeAsphalt, makePavement, makeTactile, makePlaster, makeHoarding, rng } from './textures.js';
import { applyPhoto } from './phototex.js';
import { swapToReal, placeReal } from './realprops.js';
import { buildShophouse, buildSimpleBlock } from './buildings.js';
import { buildMotorbike } from './vehicles.js';
import { buildPerson, randomLook } from './people.js';
import {
  buildTree, buildUtilityPole, buildCables, buildTrashBin, buildPlantPot, buildCafeSet, buildFoodCart,
  buildAFrameSign, buildGoods, buildTrafficLight, buildCabinet, buildSignPole, buildBusStop, buildTrashBags, buildStall, buildPersonalItem,
} from './props.js';

/** Cột điện (x, z): cũng là nơi gắn đèn đường buổi tối (nightlights.js). */
export const POLES = [
  [-4.5, 20], [-4.5, -6], [-4.5, -26], [4.5, 12], [4.5, -14], [4.5, 32],
  [-4.5, -50], [4.5, -40], [4.5, -66], [-4.5, -76], [4.5, -92],
];
export const DECOR_POLES = [[-4.5, 46], [-4.5, 72], [4.5, 56], [4.5, 82], [-4.5, -102], [4.5, -118], [-4.5, -126]];
const SW = STREET.curbHeight;          // cao độ mặt vỉa hè
const FRONT = STREET.sideOuter;        // mặt tiền nhà
const DEPTH = STREET.buildingDepth;
const LEN = 340;                       // chiều dài mặt đường dựng sẵn

// ───────────── Bảng cửa hàng ─────────────
const SHOP = {
  grocery:  { name: 'tiệm tạp hoá',            label: 'một tiệm tạp hoá',            interior: 'grocery',    sign: { text: 'TẠP HOÁ BÀ NĂM',        bg: '#b3261e', accent: '#ffd23f', sub: 'Mở cửa từ 6h đến 21h', pattern: 'stripes' } },
  pharmacy: { name: 'nhà thuốc',               label: 'một nhà thuốc',               interior: 'pharmacy',   sign: { text: 'NHÀ THUỐC AN KHANG',    bg: '#1f7a4d', accent: '#ffffff', sub: 'Tư vấn miễn phí' } },
  pho:      { name: 'quán phở',                label: 'một quán phở',                interior: 'pho',        sign: { text: 'PHỞ BÒ GIA TRUYỀN',     bg: '#8a1c1c', accent: '#f5c542', sub: 'Phục vụ từ 5h30 sáng' } },
  tailor:   { name: 'tiệm may',                label: 'một tiệm may',                interior: 'clothes',    sign: { text: 'TIỆM MAY THU HƯƠNG',    bg: '#2c3e7a', accent: '#f0d58a', sub: 'May đo – sửa quần áo' } },
  phone:    { name: 'cửa hàng điện thoại',     label: 'một cửa hàng điện thoại',     interior: 'phone',      sign: { text: 'ĐIỆN THOẠI MINH QUÂN',  bg: '#0b5fa5', accent: '#ffffff', sub: 'Sửa chữa – phụ kiện' } },
  bakery:   { name: 'tiệm bánh mì',            label: 'một tiệm bánh mì',            interior: 'bakery',     sign: { text: 'BÁNH MÌ NÓNG GIÒN',     bg: '#c77d1a', accent: '#fff3d6', sub: 'Mỗi sáng ra lò' } },
  hair:     { name: 'tiệm cắt tóc',           label: 'một tiệm cắt tóc',            interior: 'hair',       sign: { text: 'SALON TÓC XINH',        bg: '#6a2d6e', accent: '#ffe08a', sub: 'Cắt – uốn – nhuộm' } },
  stationery: { name: 'cửa hàng văn phòng phẩm', label: 'một cửa hàng văn phòng phẩm', interior: 'stationery', sign: { text: 'VĂN PHÒNG PHẨM TRÍ ĐỨC', bg: '#0e6b72', accent: '#ffe27a', sub: 'Sách – vở – dụng cụ học tập' } },
  bun:      { name: 'quán bún',                label: 'một quán bún',                interior: 'pho',        sign: { text: 'BÚN CHẢ – BÚN RIÊU',    bg: '#a83232', accent: '#fff0b8', sub: 'Ăn sáng – ăn trưa' } },
  clothes:  { name: 'cửa hàng quần áo',       label: 'một cửa hàng quần áo',       interior: 'clothes',    sign: { text: 'THỜI TRANG MINH ANH',   bg: '#222428', accent: '#e0b84a', sub: 'Hàng mới về mỗi tuần' } },
  tea:      { name: 'tiệm trà sữa',            label: 'một tiệm trà sữa',            interior: 'cafe',       sign: { text: 'TRÀ SỮA HẠT DẺ',        bg: '#e07b8f', accent: '#ffffff', sub: 'Trà – cà phê – đồ ăn vặt' } },
  cafe:     { name: 'quán cà phê',             label: 'một quán cà phê',             interior: 'cafe',       sign: { text: 'CÀ PHÊ GÓC PHỐ',        bg: '#3b2a20', accent: '#e8c07a', sub: 'Cà phê phin – Trà đá' } },
};

// Hà Nội buổi sáng: nhiều vàng ocher / vàng kem kiểu nhà Pháp cũ, xen vài màu sơn dân dụng đã bạc
const COLORS = ['#e2c27a', '#d9b25f', '#e8d39a', '#cfa75a', '#e6cf8f', '#d8b777', '#e7c8bd', '#c8d8c0', '#bfa88e', '#e9e0cf', '#c7765a', '#d4bf8c'];
const TRIMS = ['#f0eadc', '#f6f1e6', '#e9e2d2'];
const STYLES = ['shutters', 'mixed', 'balcony', 'shutters', 'mixed'];
const SHUTTER = ['#35603f', '#5a3b2a', '#2f4a63', '#4b5a30'];
const AWN = [['#c0392b', '#f3ece0'], ['#1f6f9f', '#f3ece0'], ['#2e8b57', '#f3ece0'], null, null];

// [kiểu, bề rộng (m) theo trục Z, số tầng]. Duyệt từ z = +34 xuống -34.
const LEFT = [
  ['grocery', 4.2, 3], ['house', 3.6, 3], ['pharmacy', 4.0, 4], ['cafe', 6.4, 2], ['pho', 4.4, 3], ['house', 3.8, 3],
  ['bakery', 5.0, 3], ['phone', 3.5, 4], ['clothes', 4.6, 3], ['house', 4.0, 3], ['hair', 3.6, 3], ['stationery', 4.8, 2],
  ['bun', 4.4, 3], ['house', 4.2, 3], ['tailor', 3.8, 3], ['house', 3.9, 3],
];
const RIGHT = [
  ['bun', 4.0, 3], ['house', 4.2, 3], ['phone', 3.6, 4], ['grocery', 4.8, 3], ['house', 3.4, 3], ['hair', 3.8, 3],
  ['pharmacy', 4.2, 3], ['ALLEY', 2.6, 0], ['tea', 5.0, 3], ['house', 4.0, 3], ['bakery', 4.4, 3], ['clothes', 4.0, 3],
  ['house', 3.6, 3], ['pho', 5.0, 3], ['HOARD', 7.0, 0], ['house', 4.0, 3], ['grocery', 4.0, 3],
];

// Khu phố thứ hai (z từ -34 đến khoảng -104): sinh theo hạt giống cố định để mỗi lần chạy giống nhau.
const EXTRA_KINDS = ['grocery', 'house', 'pharmacy', 'pho', 'house', 'tailor', 'phone', 'bakery', 'house', 'hair', 'stationery', 'bun', 'clothes', 'tea', 'house'];
function genRow(seed, total, inserts) {
  const r = rng(seed);
  const out = [];
  let sum = 0;
  let prev = '';
  while (sum < total) {
    let k = EXTRA_KINDS[(r() * EXTRA_KINDS.length) | 0];
    if (k === prev && k !== 'house') k = 'house';
    const w = Math.round((3.4 + r() * 2.2) * 10) / 10;
    out.push([k, w, 2 + ((r() * 3) | 0)]);
    sum += w;
    prev = k;
  }
  for (const [at, entry] of inserts) {
    out.splice(at, 0, entry);
  }
  return out;
}
LEFT.push(...genRow(31, 66, [[3, ['ALLEY', 2.6, 0]], [7, ['cafe', 6.4, 2]], [12, ['HOARD', 6.0, 0]]]));
RIGHT.push(...genRow(47, 56, [[2, ['PARK', 14, 0]], [9, ['ALLEY', 2.6, 0]]]));

/**
 * @param {THREE.Scene} scene
 * @param {import('./data.js').ObjectRegistry} reg
 */
export function buildWorld(scene, reg) {
  const pickables = [];
  const world = { pickables, zones: [], trafficLights: [], seated: [], standers: [], cableGroup: null, sunSources: [] };

  const tag = (group, id) => {
    tagObject(group, id);
    pickables.push(group);
    reg.get(id).mesh = group;
  };

  // ───── Nền đất, mặt đường, vỉa hè ─────
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), new THREE.MeshStandardMaterial({ color: 0x6b6252, roughness: 1 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.02;
  ground.receiveShadow = true;
  scene.add(ground);

  const asphalt = makeAsphalt();
  asphalt.repeat.set(2.1, LEN / 4);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(STREET.roadHalf * 2, LEN), new THREE.MeshStandardMaterial({ map: asphalt, roughness: 0.93 }));
  road.rotation.x = -Math.PI / 2;
  road.receiveShadow = true;
  applyPhoto(road.material, 'duong', [STREET.roadHalf * 2 / 2.6, LEN / 2.6], { normalScale: 0.8 });
  road.material.color.setHex(0xb8b8bc);   // ảnh nhựa đường hơi sáng: hạ xuống cho giống nhựa Sài Gòn
  scene.add(road);
  reg.add({ id: 'road', type: 'road', pos: [0, 0, 0], size: [STREET.roadHalf * 2, 0.05, LEN] });
  tag(road, 'road');

  const pave = makePavement();
  pave.repeat.set(1.8, LEN / 2.0);
  const sideTop = new THREE.MeshStandardMaterial({ map: pave, roughness: 0.88 });
  applyPhoto(sideTop, 'viahe', [(FRONT - STREET.roadHalf) / 1.4, LEN / 1.4]);
  const sideEdge = mat(0xb9b4aa, { roughness: 0.9 });
  for (const s of [-1, 1]) {
    const w = FRONT - STREET.roadHalf;
    const sw = new THREE.Mesh(new THREE.BoxGeometry(w, SW, LEN), [sideEdge, sideEdge, sideTop, sideEdge, sideEdge, sideEdge]);
    sw.position.set(s * (STREET.roadHalf + w / 2), SW / 2, 0);
    sw.receiveShadow = true;
    sw.castShadow = false;
    scene.add(sw);
    const id = s < 0 ? 'walk-left' : 'walk-right';
    reg.add({ id, type: 'sidewalk', pos: [s * (STREET.roadHalf + w / 2), SW / 2, 0], size: [w, SW, LEN], name: s < 0 ? 'vỉa hè bên trái' : 'vỉa hè bên phải' });
    tag(sw, id);

    // máng thoát nước sẫm màu sát vỉa hè
    const gut = new THREE.Mesh(new THREE.PlaneGeometry(0.45, LEN), mat(0x2e2f31, { roughness: 1 }));
    gut.rotation.x = -Math.PI / 2;
    gut.position.set(s * (STREET.roadHalf - 0.22), 0.006, 0);
    scene.add(gut);

    // dải gạch dẫn hướng cho người khiếm thị
    const bars = makeTactile('bars');
    bars.repeat.set(1, LEN / 0.8);
    const strip = new THREE.Mesh(new THREE.PlaneGeometry(0.4, LEN), new THREE.MeshStandardMaterial({ map: bars, roughness: 0.55, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    strip.rotation.x = -Math.PI / 2;
    strip.position.set(s * STREET.tactileX, SW + 0.008, 0);
    strip.receiveShadow = true;
    scene.add(strip);
    const tid = s < 0 ? 'tactile-left' : 'tactile-right';
    reg.add({ id: tid, type: 'tactile', pos: [s * STREET.tactileX, SW, 0], size: [0.4, 0.02, LEN] });
    tag(strip, tid);

    // gạch cảnh báo (chấm tròn) hai đầu vạch sang đường
    const dots = makeTactile('dots');
    dots.repeat.set(1, 1);
    for (const dz of [-1, 1]) {
      const patch = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.8), new THREE.MeshStandardMaterial({ map: dots, roughness: 0.55, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 }));
      patch.rotation.x = -Math.PI / 2;
      patch.position.set(s * STREET.tactileX, SW + 0.01, dz * (STREET.crossHalf + 0.5));
      scene.add(patch);
    }
  }

  // ───── Vạch kẻ đường ─────
  const paint = new THREE.MeshStandardMaterial({ color: 0xe9e6dc, roughness: 0.85, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  const yellow = new THREE.MeshStandardMaterial({ color: 0xe0b429, roughness: 0.85, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  const flat = (geo, material, x, y, z) => {
    const m = new THREE.Mesh(geo, material);
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, y, z);
    m.receiveShadow = true;
    scene.add(m);
    return m;
  };
  // vạch giữa đường (đứt đoạn)
  const dashCount = Math.floor(LEN / 4);
  const dashes = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.14, 2.0), yellow, dashCount);
  const dm = new THREE.Matrix4();
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
  for (let i = 0; i < dashCount; i++) {
    const z = -LEN / 2 + 2 + i * 4;
    if (Math.abs(z) < STREET.crossHalf + 3.2) {
      dm.compose(new THREE.Vector3(0, -5, 0), q, new THREE.Vector3(1, 1, 1));
    } else {
      dm.compose(new THREE.Vector3(0, 0.008, z), q, new THREE.Vector3(1, 1, 1));
    }
    dashes.setMatrixAt(i, dm);
  }
  dashes.receiveShadow = true;
  scene.add(dashes);
  // vạch mép đường
  for (const s of [-1, 1]) flat(new THREE.PlaneGeometry(0.12, LEN), paint, s * 3.55, 0.008, 0);
  // vạch sang đường (zebra)
  const zebra = new THREE.Group();
  for (let x = -3.6; x <= 3.61; x += 0.9) {
    const bar = new THREE.Mesh(new THREE.PlaneGeometry(0.46, STREET.crossHalf * 2), paint);
    bar.rotation.x = -Math.PI / 2;
    bar.position.set(x, 0.009, 0);
    bar.receiveShadow = true;
    zebra.add(bar);
  }
  scene.add(zebra);
  reg.add({ id: 'crosswalk', type: 'crosswalk', pos: [0, 0.01, STREET.crossZ], size: [STREET.roadHalf * 2, 0.02, STREET.crossHalf * 2] });
  tag(zebra, 'crosswalk');
  // vạch dừng xe
  flat(new THREE.PlaneGeometry(4.0, 0.35), paint, 2.05, 0.009, STREET.crossHalf + 1.0);
  flat(new THREE.PlaneGeometry(4.0, 0.35), paint, -2.05, 0.009, -(STREET.crossHalf + 1.0));
  // nắp cống
  for (const [x, z] of [[3.1, 13], [-3.0, -17], [2.8, -26], [-3.3, 24]]) {
    const mh = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.02, 20), mat(0x3a3b3d, { roughness: 0.6, metalness: 0.5 }));
    mh.position.set(x, 0.012, z);
    mh.receiveShadow = true;
    scene.add(mh);
  }

  // ───── Dãy nhà phố ─────
  const lotRand = rng(2026);
  const lots = { left: [], right: [] };
  const buildRow = (side, list) => {
    const sgn = side === 'left' ? -1 : 1;
    let z = 34;
    list.forEach(([kind, w, floors], i) => {
      const zc = z - w / 2;
      z -= w;
      if (kind === 'ALLEY') {
        buildAlley(sgn, zc, w, i);
        return;
      }
      if (kind === 'HOARD') {
        buildHoarding(sgn, zc, w, i);
        return;
      }
      if (kind === 'PARK') {
        buildPark(sgn, zc, w, i);
        return;
      }
      const spec = SHOP[kind] ?? null;
      const open = kind !== 'house';
      const seed = (side === 'left' ? 100 : 300) + i;
      const lot = {
        w, floors, kind: open ? (kind === 'cafe' ? 'cafe' : 'shop') : 'house',
        sign: spec ? spec.sign : { text: 'NHÀ SỐ ' + (10 + i * 2), bg: '#2b3a55', accent: '#ffffff' },
        interior: spec ? spec.interior : 'house',
        color: COLORS[(lotRand() * COLORS.length) | 0],
        trim: TRIMS[(lotRand() * TRIMS.length) | 0],
        style: STYLES[(lotRand() * STYLES.length) | 0],
        shutter: SHUTTER[(lotRand() * SHUTTER.length) | 0],
        awning: open ? AWN[(lotRand() * AWN.length) | 0] : null,
        flag: lotRand() < 0.22,
        seed, depth: DEPTH,
      };
      const g = buildShophouse(lot);
      g.position.set(sgn * FRONT, SW, zc);
      if (sgn > 0) g.rotation.y = Math.PI;
      scene.add(g);
      const H = g.userData.height;
      const type = lot.kind === 'cafe' ? 'cafe' : lot.kind === 'shop' ? 'shop' : 'shophouse';
      const id = `bld-${side[0]}${i}`;
      reg.add({
        id, type, pos: [sgn * (FRONT + DEPTH / 2), SW + H / 2, zc], size: [DEPTH, H, w],
        name: spec ? spec.name : undefined, label: spec ? spec.label : undefined,
        read: { text: lot.sign.text, sub: lot.sign.sub, bg: lot.sign.bg, fg: lot.sign.fg ?? '#ffffff' },
      });
      tag(g, id);
      lots[side].push({ id, kind, zc, w, sgn, i, lot });
    });
    // dãy nhà phía xa (ít chi tiết)
    for (const dir of [1, -1]) {
      let cur = dir > 0 ? 34 : z;
      for (let k = 0; k < 22; k++) {
        const w = 3.6 + lotRand() * 2.2;
        const zc = dir > 0 ? cur + w / 2 : cur - w / 2;
        cur += dir * w;
        const lot = {
          w, floors: 2 + ((lotRand() * 3) | 0), color: COLORS[(lotRand() * COLORS.length) | 0], trim: TRIMS[0],
          style: STYLES[(lotRand() * STYLES.length) | 0], shutter: SHUTTER[0], seed: 500 + k + (dir > 0 ? 0 : 50) + (sgn > 0 ? 100 : 0),
          depth: DEPTH, sign: Object.values(SHOP)[(lotRand() * 12) | 0].sign,
        };
        const g = buildSimpleBlock(lot);
        g.position.set(sgn * FRONT, SW, zc);
        if (sgn > 0) g.rotation.y = Math.PI;
        scene.add(g);
      }
    }
  };

  /** Vách tôn công trình đang xây, sơn xanh – vàng (theo ảnh trạm xe buýt). */
  function buildHoarding(sgn, zc, w, i) {
    const H = 4.6;
    const g = new THREE.Group();
    const face = new THREE.MeshStandardMaterial({ map: makeHoarding(), roughness: 0.6, metalness: 0.2 });
    const side = mat(0x8e9aa6, { roughness: 0.7, metalness: 0.2 });
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.16, H, w), [face, side, side, side, side, side]);
    panel.position.set(0.1, H / 2, 0);
    panel.castShadow = true;
    panel.receiveShadow = true;
    g.add(panel);
    const steel = mat(0x5b636b, { metalness: 0.5, roughness: 0.5 });
    for (const dz of [-w / 2 + 0.2, 0, w / 2 - 0.2]) g.add(box(0.12, H + 0.1, 0.1, steel, { x: 0.2, y: H / 2, z: dz }));
    g.add(box(0.14, 0.08, w + 0.1, steel, { x: 0.1, y: H + 0.04 }));
    g.position.set(sgn * FRONT, SW, zc);
    if (sgn > 0) g.rotation.y = Math.PI;
    scene.add(g);
    const id = `hoard-${i}`;
    reg.add({ id, type: 'hoarding', pos: [sgn * (FRONT + 0.1), SW + H / 2, zc], size: [0.2, H, w] });
    tag(g, id);
    world.sunSources.push({ x: sgn * (FRONT - 0.2), z: zc, h: H + 0.3 });
  }

  /** Công viên nhỏ ven phố: bãi cỏ, lối đi lát gạch, ghế đá, cây, đèn và hàng rào cây thấp. */
  function buildPark(sgn, zc, w, i) {
    const g = new THREE.Group();
    g.position.set(sgn * FRONT, SW, zc);
    if (sgn > 0) g.rotation.y = Math.PI;
    scene.add(g);
    const W = (lx, lz) => [sgn * (FRONT - lx), zc + (sgn > 0 ? -lz : lz)]; // toạ độ cục bộ -> toạ độ cảnh
    const grass = new THREE.Mesh(new THREE.PlaneGeometry(DEPTH, w), new THREE.MeshStandardMaterial({ color: 0x5f8a43, roughness: 1 }));
    grass.rotation.x = -Math.PI / 2;
    grass.position.set(-DEPTH / 2, 0.012, 0);
    grass.receiveShadow = true;
    g.add(grass);
    const pt = makePavement().clone();
    pt.wrapS = pt.wrapT = THREE.RepeatWrapping;
    pt.repeat.set(DEPTH / 2.4, 1.2);
    pt.needsUpdate = true;
    const path = new THREE.Mesh(new THREE.PlaneGeometry(DEPTH - 0.6, 2.4), new THREE.MeshStandardMaterial({ map: pt, roughness: 0.9 }));
    path.rotation.x = -Math.PI / 2;
    path.position.set(-(DEPTH - 0.6) / 2, 0.02, 0);
    path.receiveShadow = true;
    g.add(path);
    const loop = new THREE.Mesh(new THREE.CircleGeometry(2.6, 28), new THREE.MeshStandardMaterial({ map: pt, roughness: 0.9 }));
    loop.rotation.x = -Math.PI / 2;
    loop.position.set(-6.2, 0.022, 0);
    loop.receiveShadow = true;
    g.add(loop);
    // tường sau
    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.2, w), new THREE.MeshStandardMaterial({ map: makePlaster('#d4c8ae', 91), roughness: 0.95 }));
    wall.position.set(-DEPTH - 0.15, 1.6, 0);
    wall.castShadow = true;
    wall.receiveShadow = true;
    g.add(wall);
    // hàng rào cây thấp sát vỉa hè, chừa lối vào giữa
    const hedgeMat = new THREE.MeshStandardMaterial({ color: 0x3f6b32, roughness: 1 });
    [[-1, -(w / 2 - 0.2), -1.6], [1, 1.6, w / 2 - 0.2]].forEach(([k, a, b], n) => {
      const len = Math.abs(b - a);
      const zl = (a + b) / 2;
      const hg = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, len), hedgeMat);
      hg.position.set(-0.7, 0.4, zl);
      hg.castShadow = true;
      hg.receiveShadow = true;
      g.add(hg);
      const [hx, hz] = W(-0.7, zl);
      reg.add({ id: `hedge-${i}-${n}`, type: 'hedge', pos: [hx, SW + 0.4, hz], size: [0.8, 0.8, len] });
      tag(hg, `hedge-${i}-${n}`);
    });
    // cây
    [[-3.2, -4.2, 70], [-5.4, 4.6, 71], [-7.2, -3.0, 72], [-2.8, 4.9, 73]].forEach(([lx, lz, seed], n) => {
      const t = buildTree(seed, 0.92 + n * 0.05);
      t.position.set(lx, 0, lz);
      g.add(t);
      const [tx, tz] = W(lx, lz);
      reg.add({ id: `ptree-${i}-${n}`, type: 'tree', pos: [tx, SW + 3.5, tz], size: [0.8, 7, 0.8] });
      tag(t, `ptree-${i}-${n}`);
      world.sunSources.push({ x: tx, z: tz, h: 6.4 });
    });
    // ghế đá hướng vào lối đi
    const stone = mat(0x9a968c, { roughness: 0.95 });
    const wood = mat(0x7a5232, { roughness: 0.8 });
    [[-3.4, -1.9, -Math.PI / 2], [-3.4, 1.9, Math.PI / 2], [-8.0, 0, 0]].forEach(([lx, lz, ry], n) => {
      const b = new THREE.Group();
      b.add(box(0.55, 0.38, 1.7, stone, { y: 0.19, x: -0.0 }));
      b.add(box(0.5, 0.06, 1.6, wood, { y: 0.41, x: -0.03 }));
      b.add(box(0.06, 0.44, 1.6, wood, { y: 0.66, x: -0.27, rz: -0.12 }));
      b.position.set(lx, 0, lz);
      b.rotation.y = ry;
      g.add(b);
      const [bx, bz] = W(lx, lz);
      reg.add({ id: `bench-${i}-${n}`, type: 'bench', pos: [bx, SW + 0.4, bz], size: [0.6, 0.8, 1.7] });
      tag(b, `bench-${i}-${n}`);
    });
    // đèn công viên
    const [lpx, lpz] = W(-1.4, 2.0);
    const lamp = new THREE.Group();
    const metal = mat(0x2b3036, { metalness: 0.6, roughness: 0.5 });
    lamp.add(cyl(0.05, 0.07, 3.4, 10, metal, { y: 1.7 }));
    lamp.add(cyl(0.15, 0.15, 0.08, 12, metal, { y: 3.4 }));
    lamp.add(new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 10), new THREE.MeshStandardMaterial({ color: 0xfff3d4, emissive: 0xffe6a8, emissiveIntensity: 0.7 })));
    lamp.children[2].position.y = 3.58;
    lamp.position.set(-1.4, 0, 2.0);
    g.add(lamp);
    reg.add({ id: `lamp-${i}`, type: 'lamp_post', pos: [lpx, SW + 1.7, lpz], size: [0.2, 3.4, 0.2] });
    tag(lamp, `lamp-${i}`);
  }

  function buildAlley(sgn, zc, w, i) {
    const len = DEPTH;
    const aTex = makePavement().clone();
    aTex.wrapS = aTex.wrapT = THREE.RepeatWrapping;
    aTex.repeat.set(len / 2, w / 2);
    aTex.needsUpdate = true;
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(len, w), new THREE.MeshStandardMaterial({ map: aTex, roughness: 0.95 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(sgn * (FRONT + len / 2), SW + 0.004, zc);
    floor.receiveShadow = true;
    scene.add(floor);
    const wallMat = new THREE.MeshStandardMaterial({ map: makePlaster('#cbbfa6', 77), roughness: 0.95 });
    const end = new THREE.Mesh(new THREE.BoxGeometry(0.3, 10, w + 0.4), wallMat);
    end.position.set(sgn * (FRONT + len + 0.15), 5, zc);
    end.castShadow = true;
    end.receiveShadow = true;
    scene.add(end);
    // ánh sáng cuối hẻm + dây phơi quần áo
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.1), new THREE.MeshStandardMaterial({ color: 0xffe9c0, emissive: 0xffd9a0, emissiveIntensity: 1.1 }));
    glow.rotation.y = -sgn * Math.PI / 2;
    glow.position.set(sgn * (FRONT + len - 0.02), SW + 1.1, zc);
    scene.add(glow);
    const rec = reg.add({ id: `alley-${i}`, type: 'alley', pos: [sgn * (FRONT + len / 2), SW, zc], size: [len, 0.1, w] });
    const hit = new THREE.Mesh(new THREE.PlaneGeometry(len, w), new THREE.MeshBasicMaterial({ visible: false }));
    hit.rotation.x = -Math.PI / 2;
    hit.position.set(sgn * (FRONT + len / 2), SW + 0.02, zc);
    scene.add(hit);
    tag(hit, rec.id);
    world.zones.push(rec);
  }

  buildRow('left', LEFT);
  buildRow('right', RIGHT);

  // ───── Cây xanh ─────
  const trees = [];
  [26, 9, -9, -21, -31].forEach((z, i) => trees.push([-4.65, z, 10 + i]));
  [30, 14, -5, -17, -28].forEach((z, i) => trees.push([4.65, z, 20 + i]));
  trees.forEach(([x, z, seed], i) => {
    const t = buildTree(seed, 0.95 + (i % 3) * 0.06);
    t.position.set(x, SW, z);
    scene.add(t);
    if (x < 0) world.sunSources.push({ x, z, h: 6.6 });
    reg.add({ id: `tree-${i}`, type: 'tree', pos: [x, SW + 3.5, z], size: [0.8, 7, 0.8] });
    tag(t, `tree-${i}`);
  });
  // khu phố thứ hai: cây thật, có đăng ký để nhận diện được
  let nt = trees.length;
  for (const s of [-1, 1]) for (let k = 0; k < 6; k++) {
    const z = -42 - k * 10.5 - (s > 0 ? 4 : 0);
    const t2 = buildTree(60 + k + (s > 0 ? 10 : 0), 0.95 + (k % 3) * 0.05);
    t2.position.set(s * 4.65, SW, z);
    scene.add(t2);
    const id = `tree-${nt++}`;
    reg.add({ id, type: 'tree', pos: [s * 4.65, SW + 3.5, z], size: [0.8, 7, 0.8] });
    tag(t2, id);
    if (s < 0) world.sunSources.push({ x: s * 4.65, z, h: 6.6 });
  }
  // cây ở xa phía đầu phố (trang trí)
  for (const s of [-1, 1]) for (let k = 0; k < 6; k++) {
    const t = buildTree(40 + k + (s > 0 ? 10 : 0), 1);
    t.position.set(s * 4.65, SW, 44 + k * 11);
    scene.add(t);
    const t3 = buildTree(80 + k + (s > 0 ? 10 : 0), 1);
    t3.position.set(s * 4.65, SW, -112 - k * 11);
    scene.add(t3);
  }

  // ───── Toà nhà kính ở cuối phố (hậu cảnh, nằm trong sương mù buổi sáng) ─────
  {
    const cv = document.createElement('canvas');
    cv.width = 256; cv.height = 512;
    const x = cv.getContext('2d');
    const gr = x.createLinearGradient(0, 0, 0, 512);
    gr.addColorStop(0, '#9fc3dd'); gr.addColorStop(0.5, '#5f8fb3'); gr.addColorStop(1, '#7ea3bd');
    x.fillStyle = gr; x.fillRect(0, 0, 256, 512);
    x.strokeStyle = 'rgba(255,255,255,0.28)'; x.lineWidth = 1;
    for (let i = 0; i <= 16; i++) { x.beginPath(); x.moveTo(i * 16, 0); x.lineTo(i * 16, 512); x.stroke(); }
    for (let j = 0; j <= 48; j++) { x.beginPath(); x.moveTo(0, j * 10.6); x.lineTo(256, j * 10.6); x.stroke(); }
    x.fillStyle = 'rgba(255,255,255,0.22)';
    for (let k = 0; k < 40; k++) x.fillRect(((k * 53) % 16) * 16, ((k * 97) % 48) * 10.6, 16, 10.6);
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    const gm = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.18, metalness: 0.55, envMapIntensity: 1.4 });
    for (const [tx, tz, tw, th] of [[10, -176, 26, 92], [-26, -190, 22, 66], [34, -200, 20, 54]]) {
      const tw1 = new THREE.Mesh(new THREE.BoxGeometry(tw, th, tw), gm);
      tw1.position.set(tx, th / 2, tz);
      scene.add(tw1);
    }
  }

  // ───── Cột điện + dây điện ─────
  const poleList = POLES;
  const decorPoles = DECOR_POLES;
  poleList.forEach(([x, z], i) => {
    const p = buildUtilityPole(i + 1);
    p.position.set(x, SW, z);
    scene.add(p);
    reg.add({ id: `pole-${i}`, type: 'utility_pole', pos: [x, SW + 4.4, z], size: [0.42, 8.8, 0.42] });
    tag(p, `pole-${i}`);
  });
  decorPoles.forEach(([x, z], i) => {
    const p = buildUtilityPole(30 + i);
    p.position.set(x, SW, z);
    scene.add(p);
  });
  world.cableGroup = buildCables([...poleList, ...decorPoles].map(([x, z]) => ({ x, z })), 5);
  world.cableGroup.position.y = SW;
  scene.add(world.cableGroup);

  // ───── Đèn giao thông ─────
  [[-4.55, 2.9, -1], [4.55, -2.9, 1]].forEach(([x, z, face], i) => {
    const tl = buildTrafficLight(face);
    tl.position.set(x, SW, z);
    scene.add(tl);
    reg.add({ id: `tlight-${i}`, type: 'traffic_light', pos: [x, SW + 1.7, z], size: [0.4, 3.4, 0.4] });
    tag(tl, `tlight-${i}`);
    world.trafficLights.push(tl);
  });

  // ───── Thùng rác ─────
  [[-4.5, 23.5], [-4.5, 4.5], [4.5, -9.5], [4.5, 17.5]].forEach(([x, z], i) => {
    const b = buildTrashBin();
    b.position.set(x, SW, z);
    b.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2;
    scene.add(b);
    reg.add({ id: `bin-${i}`, type: 'trash_bin', pos: [x, SW + 0.45, z], size: [0.55, 0.9, 0.6] });
    tag(b, `bin-${i}`);
  });

  // ───── Trước từng cửa hàng: xe đỗ, hàng hoá, chậu cây, biển, bàn ghế ─────
  const pr = rng(909);
  let nMoto = 0, nGoods = 0, nPot = 0, nSign = 0, nCafe = 0;
  const sidewalkProps = (side) => {
    for (const L of lots[side]) {
      const sgn = L.sgn;
      const faceYaw = sgn < 0 ? Math.PI / 2 : -Math.PI / 2; // đầu xe hướng ra đường
      const frontX = sgn * (FRONT - 0.12);
      if (L.kind === 'cafe') {
        // quán cà phê vỉa hè: 3 bộ bàn ghế + khách ngồi
        for (let k = 0; k < 3; k++) {
          const z = L.zc + (k - 1) * 2.0;
          const x = sgn * 6.9;
          const set = buildCafeSet(k + L.i);
          set.position.set(x, SW, z);
          scene.add(set);
          const id = `cafeset-${nCafe++}`;
          reg.add({ id, type: 'cafe_table', pos: [x, SW + 0.6, z], size: [1.5, 1.2, 1.5] });
          tag(set, id);
          // bộ giữa: thêm một ghế nhựa trống quay vào bàn, phía ngoài đường
          if (k === 1) {
            // ghế đẩu phía lòng đường đổi thành ghế nhựa tựa lưng, quay mặt vào bàn
            const stool = set.children.find((c) => c.isGroup && Math.abs(c.position.length() - 0.58) < 0.02 && Math.sign(c.position.x) === -sgn);
            if (stool) {
              stool.visible = false;
              const { x: sx, z: sz } = stool.position;
              placeReal(scene, 'chair', x + sx, SW, z + sz, Math.atan2(-sx, -sz));
            }
          }
          if (k !== 1) {
            const a = 0.5 + (k === 0 ? 0 : (2 * Math.PI) / 3);
            const ox = Math.cos(a) * 0.58;
            const oz = Math.sin(a) * 0.58;
            world.seated.push({ x: x + ox, z: z + oz, yaw: Math.atan2(-ox, -oz), look: randomLook(pr), id: `seated-${world.seated.length}` });
          }
        }
        continue;
      }
      if (L.kind === 'house') {
        if (pr() < 0.7) addBikes(L, faceYaw, frontX, sgn, 2);
        continue;
      }
      const roll = pr();
      if (roll < 0.42) addBikes(L, faceYaw, frontX, sgn, 1 + ((pr() * 2) | 0));
      else if (roll < 0.72) addGoods(L, sgn);
      if (pr() < 0.4) addPot(L, sgn);
      if (pr() < 0.3 && L.kind !== 'house') addSign(L, sgn);
    }
  };
  function addBikes(L, faceYaw, frontX, sgn, n) {
    const palette = [0xc62828, 0x1e4aa8, 0x222428, 0xe9e6dc, 0x2e7d32, 0xb08a1a, 0x7b1fa2];
    const span = L.w - 1.4;
    const gap = Math.min(0.78, span / Math.max(1, n));
    for (let k = 0; k < n; k++) {
      const z = L.zc + (k - (n - 1) / 2) * gap;
      const x = sgn * 6.77;
      const bike = buildMotorbike({ color: palette[(pr() * palette.length) | 0], rider: false, parked: true, helmet: [0xe9e9e4, 0xd9433a, 0x3a6ea5][(pr() * 3) | 0], seed: nMoto });
      bike.position.set(x, SW, z);
      bike.rotation.y = faceYaw + (pr() - 0.5) * 0.18;
      scene.add(bike);
      const id = `parked-${nMoto++}`;
      reg.add({ id, type: 'parked_motorbike', pos: [x, SW + 0.55, z], size: [1.85, 1.1, 0.62] });
      tag(bike, id);
    }
  }
  function addGoods(L, sgn) {
    const kinds = ['fruit', 'baskets', 'drinks'];
    const kind = kinds[(pr() * 3) | 0];
    const g = buildGoods(kind, nGoods + 1);
    const z = L.zc + (pr() - 0.5) * (L.w - 2.2);
    const x = sgn * 7.15;
    g.position.set(x, SW, z);
    g.rotation.y = sgn < 0 ? Math.PI / 2 : -Math.PI / 2;
    scene.add(g);
    const id = `goods-${nGoods++}`;
    const names = { fruit: ['sạp trái cây', 'một sạp trái cây'], baskets: ['chồng rổ nhựa', 'một chồng rổ nhựa'], drinks: ['thùng nước giải khát', 'một thùng nước giải khát'] }[kind];
    reg.add({ id, type: 'goods', pos: [x, SW + 0.5, z], size: [0.75, 1.0, 1.3], name: names[0], label: names[1] });
    tag(g, id);
  }
  function addPot(L, sgn) {
    const z = L.zc + (pr() < 0.5 ? -1 : 1) * (L.w / 2 - 0.45);
    const x = sgn * 7.5;
    const p = buildPlantPot(nPot + 3);
    p.position.set(x, SW, z);
    scene.add(p);
    swapToReal(p, 'pot', { yaw: pr() * Math.PI * 2 });
    const id = `pot-${nPot++}`;
    reg.add({ id, type: 'plant_pot', pos: [x, SW + 0.4, z], size: [0.6, 0.8, 0.6] });
    tag(p, id);
  }
  function addSign(L, sgn) {
    const z = L.zc + (pr() - 0.5) * (L.w - 1.6);
    const x = sgn * 6.55;
    const s = buildAFrameSign([{ t: 'MỜI VÀO', size: 40, bold: true, y: 100 }, { t: 'Giá tốt mỗi ngày', size: 26, y: 180 }]);
    s.position.set(x, SW, z);
    s.rotation.y = sgn < 0 ? Math.PI / 2 : -Math.PI / 2;
    scene.add(s);
    const id = `asign-${nSign++}`;
    reg.add({ id, type: 'sign', pos: [x, SW + 0.45, z], size: [0.7, 0.9, 0.6], read: { text: 'MỜI VÀO', sub: 'Giá tốt mỗi ngày' } });
    tag(s, id);
  }
  sidewalkProps('left');
  sidewalkProps('right');

  // bậc thềm trước hai cửa hàng
  [[-1, 'bakery'], [1, 'pho']].forEach(([sgn, kind], i) => {
    const L = lots[sgn < 0 ? 'left' : 'right'].find((l) => l.kind === kind);
    if (!L) return;
    const x = sgn * (FRONT - 0.3);
    const st = box(0.6, 0.12, L.w - 1.0, mat(0xa9a398, { roughness: 0.95 }), { x, y: SW + 0.06, z: L.zc });
    scene.add(st);
    const id = `step-${i}`;
    reg.add({ id, type: 'step', pos: [x, SW + 0.06, L.zc], size: [0.6, 0.12, L.w - 1.0] });
    tag(st, id);
  });

  // xe bánh mì bên phải
  {
    const cart = buildFoodCart();
    cart.position.set(6.55, SW, -12);
    cart.rotation.y = Math.PI / 2;
    scene.add(cart);
    reg.add({ id: 'cart-0', type: 'food_cart', pos: [6.55, SW + 0.9, -12], size: [0.7, 1.8, 1.3], read: { text: 'BÁNH MÌ', sub: 'Nóng giòn' } });
    tag(cart, 'cart-0');
    world.standers.push({ x: 6.45, z: -13.1, yaw: Math.PI, look: { ...randomLook(pr), hat: 'nonla', female: true, shirt: 0xe3dccb }, id: 'vendor' });
  }

  // ───── Vật thể theo ảnh phố thật: tủ điện, cột biển báo, trạm xe buýt, túi rác, quán ăn vỉa hè ─────
  [[-4.78, 15.4], [-4.78, -14.6], [4.78, 24.2], [4.78, 4.4]].forEach(([x, z], i) => {
    const cab = buildCabinet();
    cab.position.set(x, SW, z);
    scene.add(cab);
    reg.add({ id: `cab-${i}`, type: 'utility_cabinet', pos: [x, SW + 0.9, z], size: [0.55, 1.8, 1.05] });
    tag(cab, `cab-${i}`);
  });
  [
    ['nopark', -4.4, 11.8, 'cấm dừng và đỗ xe'],
    ['nopark', 4.4, -21.6, 'cấm dừng và đỗ xe'],
    ['crossing', -4.4, -2.5, 'người đi bộ sang ngang'],
    ['crossing', 4.4, 2.5, 'người đi bộ sang ngang'],
  ].forEach(([kind, x, z, meaning], i) => {
    const sp = buildSignPole(kind);
    sp.position.set(x, SW, z);
    scene.add(sp);
    reg.add({ id: `spole-${i}`, type: 'sign_pole', pos: [x, SW + 1.7, z], size: [0.14, 3.4, 0.14], read: { kind: 'traffic', text: meaning } });
    tag(sp, `spole-${i}`);
  });
  {
    const bz = -24.9;
    const bs = buildBusStop();
    bs.position.set(4.95, SW, bz);
    scene.add(bs);
    reg.add({ id: 'busstop-0', type: 'bus_stop', pos: [4.95, SW + 1.75, bz], size: [0.7, 3.5, 0.9], read: { text: 'ĐIỂM DỪNG XE BUÝT', sub: 'Bus stop', bg: '#1456b0', fg: '#f4f6f8' } });
    tag(bs, 'busstop-0');
  }
  [[7.15, 6.9, 1], [-7.2, -18.7, 2]].forEach(([x, z, seed], i) => {
    const b = buildTrashBags(seed);
    b.position.set(x, SW, z);
    scene.add(b);
    reg.add({ id: `bags-${i}`, type: 'trash_bags', pos: [x, SW + 0.35, z], size: [0.9, 0.7, 0.9] });
    tag(b, `bags-${i}`);
  });
  let stool0 = null;
  {
    const sx = -7.25;
    const sz = -27.6;
    const stall = buildStall();
    stall.position.set(sx, SW, sz);
    scene.add(stall);
    reg.add({ id: 'stall-0', type: 'street_stall', pos: [sx + 0.1, SW + 0.75, sz], size: [1.5, 1.5, 1.5] });
    tag(stall, 'stall-0');
    const [lx, ly, lz] = stall.userData.stools[0];
    stool0 = [sx + lx, SW + ly, sz + lz];
    world.seated.push({ x: sx + 0.95 + 0.4, z: sz + 0.05 + 0.0, yaw: Math.PI / 2, look: { ...randomLook(pr), hat: 'nonla' }, id: `seated-${world.seated.length}` });
  }

  // ───── Đồ cá nhân của người dùng (chức năng "Tìm đồ") ─────
  {
    const cafe = lots.left.find((l) => l.kind === 'cafe');
    const step = reg.get('step-0');
    const items = [];
    if (cafe) items.push(['keys', [-6.9 + 0.08, SW + 0.52, cafe.zc - 2.0 - 0.06], 'chùm chìa khoá của bạn', 'trên chiếc bàn ngoài cùng của quán cà phê']);
    if (step) items.push(['phone', [step.pos[0] + 0.05, SW + 0.12, step.pos[2] + 0.4], 'chiếc điện thoại của bạn', 'trên bậc thềm trước tiệm bánh mì']);
    if (stool0) items.push(['wallet', [stool0[0], stool0[1], stool0[2]], 'chiếc ví của bạn', 'trên chiếc ghế nhựa ở quán ăn vỉa hè']);
    for (const [kind, p, name, where] of items) {
      const it = buildPersonalItem(kind);
      it.position.set(p[0], p[1], p[2]);
      it.rotation.y = 0.6;
      scene.add(it);
      const id = `item-${kind}`;
      reg.add({ id, type: 'personal_item', pos: [p[0], p[1] + 0.02, p[2]], size: [0.16, 0.06, 0.16], name, label: name, desc: where });
      tag(it, id);
    }
  }

  return world;
}
