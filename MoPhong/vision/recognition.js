// Logic nhận diện thuần tuý (không phụ thuộc Three.js) để có thể kiểm thử độc lập.
// Camera/người dùng: { x, z, yaw }.  yaw = 0 nhìn về -Z, yaw dương = quay sang trái.

import { STREET, NOT_FOUND, GROUPS } from './data.js';

const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export function normalizeAngle(a) {
  a = a % TAU;
  if (a > Math.PI) a -= TAU;
  if (a < -Math.PI) a += TAU;
  return a;
}

export function forwardVector(yaw) {
  return { x: -Math.sin(yaw), z: -Math.cos(yaw) };
}

/** Điểm gần nhất của hộp bao (theo mặt phẳng XZ) tới người dùng. */
export function nearestPoint(cam, obj) {
  const [x, , z] = obj.pos;
  const [sx, , sz] = obj.size;
  return {
    x: clamp(cam.x, x - sx / 2, x + sx / 2),
    z: clamp(cam.z, z - sz / 2, z + sz / 2),
  };
}

/** Khoảng cách ngang từ người dùng tới mép gần nhất của vật thể (mét, tính từ toạ độ cảnh). */
export function distanceTo(cam, obj) {
  const p = nearestPoint(cam, obj);
  return Math.hypot(p.x - cam.x, p.z - cam.z);
}

/** Hướng tuyệt đối tới vật thể. Dương = bên trái (cùng quy ước với yaw). */
export function bearingTo(cam, obj) {
  const p = nearestPoint(cam, obj);
  const dx = p.x - cam.x;
  const dz = p.z - cam.z;
  if (dx === 0 && dz === 0) return cam.yaw;
  return Math.atan2(-dx, -dz);
}

/** Góc lệch so với hướng nhìn, (-π, π]. Dương = vật ở bên trái. */
export function relativeAngle(cam, obj) {
  return normalizeAngle(bearingTo(cam, obj) - cam.yaw);
}

export function directionPhrase(diff) {
  const a = Math.abs(diff);
  const left = diff > 0;
  if (a < 0.21) return 'phía trước';
  if (a < 0.61) return left ? 'phía trước, hơi lệch bên trái' : 'phía trước, hơi lệch bên phải';
  if (a < 1.75) return left ? 'bên trái' : 'bên phải';
  if (a < 2.62) return left ? 'phía sau bên trái' : 'phía sau bên phải';
  return 'phía sau';
}

export const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** Thêm dấu phẩy sau cụm hướng nếu cụm đó đã có dấu phẩy ("phía trước, hơi lệch bên phải,"). */
export const lead = (dir) => (dir.includes(',') ? dir + ',' : dir);

export function formatDistance(d) {
  if (d < 2) return 'cách chưa đến 2 mét';
  return 'cách khoảng ' + Math.round(d) + ' mét';
}

/** Câu trả lời khi người dùng nhấn E và đã xác định được một vật thể. */
export function identifyText(cam, obj) {
  const dir = directionPhrase(relativeAngle(cam, obj));
  if (obj.group === GROUPS.SPACE) return `${cap(dir)} là ${obj.label}.`;
  const move = obj.moving ? ' đang di chuyển' : '';
  return `${cap(lead(dir))} có ${obj.label}${move}, ${formatDistance(distanceTo(cam, obj))}.`;
}

/**
 * Chọn đúng MỘT vật thể từ danh sách va chạm của các tia (raycast).
 * hits: [{ obj, angle (rad, lệch khỏi tâm), distance (m) }]
 * Vật thể rắn luôn được ưu tiên hơn mặt đường/vỉa hè; mặt phẳng chỉ được chọn nếu
 * chính tia ở tâm chạm vào nó.
 */
export function pickTarget(hits) {
  const solid = hits.filter((h) => h.obj.group !== GROUPS.SPACE);
  let pool = solid;
  if (!pool.length) pool = hits.filter((h) => h.angle < 0.02 && h.distance <= 14);
  if (!pool.length) return null;
  const score = (h) => h.angle * 14 + h.distance * 0.3;
  return pool.slice().sort((a, b) => score(a) - score(b))[0].obj;
}

// ───────── Mặt đất ─────────
export const GROUND_LABEL = {
  sidewalk: 'một đoạn vỉa hè',
  tactile: 'dải gạch dẫn hướng dành cho người khiếm thị',
  road: 'lòng đường',
  crosswalk: 'vạch sang đường',
  alley: 'lối rẽ vào hẻm',
};

/** Loại mặt đất tại (x,z) — suy ra từ toạ độ. zones: các vùng đặc biệt (hẻm...) dạng obj có pos/size. */
export function groundAt(x, z, zones = []) {
  for (const zn of zones) {
    if (Math.abs(x - zn.pos[0]) <= zn.size[0] / 2 && Math.abs(z - zn.pos[2]) <= zn.size[2] / 2) return 'alley';
  }
  const ax = Math.abs(x);
  if (ax >= STREET.sideOuter) return null;
  if (ax <= STREET.roadHalf) {
    return Math.abs(z - STREET.crossZ) <= STREET.crossHalf ? 'crosswalk' : 'road';
  }
  return Math.abs(ax - STREET.tactileX) <= 0.2 ? 'tactile' : 'sidewalk';
}

/**
 * Space: mô tả ngắn xung quanh — tối đa 3 ý hữu ích trong bán kính giới hạn.
 *  1) mặt đất phía trước, 2) vật cần chú ý nhất, 3) công trình gần nhất ở bên cạnh.
 */
export function describeSurroundings(cam, objects, opts = {}) {
  const radius = opts.radius ?? 14;
  const zones = opts.zones ?? [];
  const fwd = forwardVector(cam.yaw);
  const sentences = [];
  const mentioned = [];

  const g = groundAt(cam.x + fwd.x * 2.5, cam.z + fwd.z * 2.5, zones);
  if (g) sentences.push(`Phía trước là ${GROUND_LABEL[g]}.`);

  const FOV = Math.PI * 0.62;
  const cands = objects
    .filter((o) => o.group !== GROUPS.SPACE && !o.personal)
    .map((o) => ({ o, d: distanceTo(cam, o), a: relativeAngle(cam, o) }))
    .filter((c) => c.d <= radius && c.d > 0.25 && Math.abs(c.a) <= FOV);

  const sc = (c) => (c.o.priority * (1.6 - Math.abs(c.a) / FOV)) / (1 + c.d / 3);
  const hazards = cands.filter((c) => c.o.group !== GROUPS.BUILDINGS).sort((a, b) => sc(b) - sc(a));
  const buildings = cands.filter((c) => c.o.group === GROUPS.BUILDINGS).sort((a, b) => a.d - b.d);

  const phrase = (c) => {
    let dir = directionPhrase(c.a);
    // "gần" chỉ dùng cho vật nhỏ ở sát phía trước; công trình thì chỉ nói hướng
    if (c.d < 4 && dir.startsWith('phía trước') && c.o.group !== GROUPS.BUILDINGS) dir = 'gần ' + dir;
    return `${cap(lead(dir))} có ${c.o.label}${c.o.moving ? ' đang di chuyển' : ''}.`;
  };

  const room = () => 3 - sentences.length;
  const take = (c) => {
    sentences.push(phrase(c));
    mentioned.push(c.o);
  };

  if (hazards[0] && room() > (buildings[0] ? 1 : 0)) take(hazards[0]);
  if (buildings[0] && room() > 0) take(buildings[0]);
  const firstType = mentioned.length ? mentioned[0].type : null;
  const second = hazards.slice(1).find((c) => c.o.type !== firstType && (c.o.group !== GROUPS.OBSTACLES || c.o.priority >= 3));
  if (second && room() > 0) take(second);

  if (!sentences.length) return { text: NOT_FOUND, mentioned: [] };
  return { text: sentences.join(' '), mentioned };
}
