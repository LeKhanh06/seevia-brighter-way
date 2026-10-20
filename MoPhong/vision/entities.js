// Giao thông và người đi bộ chuyển động. Trạng thái nằm trong số liệu thuần (x, z, tốc độ...),
// mesh chỉ là bản thể hiện — nên có thể kiểm thử logic mà không cần WebGL.

import * as THREE from 'three';
import { STREET } from './data.js';
import { tagObject } from './materials.js';
import { buildMotorbike, buildCar, buildBicycle } from './vehicles.js';
import { buildPerson, animateWalk, animateIdle, randomLook } from './people.js';
import { setTrafficLight } from './props.js';
import { rng } from './textures.js';

const SW = STREET.curbHeight;
const LIMIT = 90;                  // xe chạy vòng trong khoảng |z| <= LIMIT (ẩn trong sương mù)
const STOP_Z = STREET.crossHalf + 1.15; // vạch dừng cách mép vạch sang đường ~1 m

export const SIGNAL = { go: 18, yellow: 2.5, stop: 12 };

const norm = (a) => {
  while (a > Math.PI) a -= 2 * Math.PI;
  while (a < -Math.PI) a += 2 * Math.PI;
  return a;
};

/** Pha đèn giao thông — thuần số liệu. */
export function advanceSignal(sig, dt) {
  sig.t += dt;
  if (sig.state === 'go' && sig.t >= SIGNAL.go) { sig.state = 'yellow'; sig.t = 0; }
  else if (sig.state === 'yellow' && sig.t >= SIGNAL.yellow) { sig.state = 'stop'; sig.t = 0; }
  else if (sig.state === 'stop' && sig.t >= SIGNAL.stop) { sig.state = 'go'; sig.t = 0; sig.cycle++; }
}

/** Tốc độ mục tiêu của một xe (phanh trước vạch dừng, giữ khoảng cách, nhường người). Hàm thuần để kiểm thử. */
export function targetSpeed(v, others, sig, player) {
  let target = v.vmax;
  const half = v.half;
  // đèn tín hiệu
  if (sig.state !== 'go') {
    const lineZ = v.dir < 0 ? STOP_Z : -STOP_Z;
    const dist = v.dir < 0 ? v.z - half - lineZ : lineZ - (v.z + half);
    const runYellow = sig.state === 'yellow' && dist < 3.5;
    if (dist > -0.2 && !runYellow) target = Math.min(target, Math.sqrt(2 * 3.2 * Math.max(0, dist - 0.2)));
  }
  // xe phía trước cùng làn
  for (const o of others) {
    if (o === v || o.dir !== v.dir || Math.abs(o.baseX - v.baseX) > 0.7) continue;
    const ahead = (o.z - v.z) * v.dir;
    if (ahead <= 0) continue;
    const gap = ahead - half - o.half;
    target = Math.min(target, Math.sqrt(2 * 4.5 * Math.max(0, gap - 1.1)));
  }
  // nhường người dùng
  if (player) {
    const ahead = (player.z - v.z) * v.dir;
    if (ahead > 0 && ahead < 14 && Math.abs(player.x - v.x) < 0.9 + v.halfW) {
      target = Math.min(target, Math.sqrt(2 * 5 * Math.max(0, ahead - half - 0.9)));
    }
  }
  return target;
}

export function createEntities(scene, reg, world) {
  const R = rng(4242);
  const vehicles = [];
  const people = [];
  const signal = { state: 'go', t: 4, cycle: 0 };

  const tag = (g, id) => {
    tagObject(g, id);
    world.pickables.push(g);
    reg.get(id).mesh = g;
  };

  // ───── Xe cộ ─────
  const V = [
    // [id, kiểu, làn x, hướng (-1: chạy về -Z), vmax (m/s), z0, tuỳ chọn]
    ['car-1', 'car', 2.3, -1, 7.5, 46, { color: 0xe8e8e6 }],
    ['car-2', 'car', 2.3, -1, 6.8, -28, { color: 0x1c8c4a, taxi: true }],
    ['car-3', 'car', -2.3, 1, 7.0, -42, { color: 0x24282d, suv: true }],
    ['moto-1', 'motorbike', 0.9, -1, 9.0, 18, { color: 0xc62828, shirt: 0x3a6ea5 }],
    ['moto-2', 'motorbike', 3.6, -1, 8.0, -10, { color: 0x1e4aa8, shirt: 0xe3dccb, helmet: 0xd9433a }],
    ['moto-3', 'motorbike', 0.9, -1, 8.6, -55, { color: 0x222428, shirt: 0x7a5aa6 }],
    ['moto-4', 'motorbike', 3.6, -1, 8.2, 62, { color: 0xe9e6dc, delivery: true }],
    ['moto-5', 'motorbike', -0.9, 1, 8.8, -14, { color: 0xb08a1a, passenger: true, shirt: 0x4e8a59 }],
    ['moto-6', 'motorbike', -0.9, 1, 7.8, 24, { color: 0x2e7d32, shirt: 0xb5473b, helmet: 0x3a6ea5 }],
    ['moto-7', 'motorbike', -0.9, 1, 9.2, -62, { color: 0x7b1fa2, shirt: 0x2f3b4f }],
    ['moto-8', 'motorbike', -0.9, 1, 8.0, 52, { color: 0xc62828, delivery: true }],
    ['moto-9', 'motorbike', 3.6, -1, 8.4, 6, { color: 0x1e4aa8, passenger: true, shirt: 0xd9a441 }],
    ['bike-1', 'bicycle', -3.7, 1, 3.2, -20, { color: 0x2b5d8a }],
  ];
  const dims = {
    car: { size: [1.9, 1.55, 4.5], half: 2.25, halfW: 0.95 },
    motorbike: { size: [0.65, 1.7, 1.95], half: 0.98, halfW: 0.35 },
    bicycle: { size: [0.55, 1.75, 1.85], half: 0.92, halfW: 0.3 },
  };
  for (const [id, type, x, dir, vmax, z0, opt] of V) {
    const model = type === 'car' ? buildCar(opt) : type === 'bicycle' ? buildBicycle(opt) : buildMotorbike(opt);
    model.rotation.y = dir < 0 ? Math.PI : 0;
    scene.add(model);
    const d = dims[type];
    reg.add({
      id, type, pos: [x, d.size[1] / 2, z0], size: d.size.slice(), moving: true,
      name: opt.taxi ? 'xe taxi' : undefined, label: opt.taxi ? 'một chiếc xe taxi' : undefined,
    });
    tag(model, id);
    vehicles.push({ id, type, model, rec: reg.get(id), x, baseX: x, dir, vmax, z: z0, speed: dir === 0 ? 0 : vmax * 0.8, half: d.half, halfW: d.halfW, phase: R() * 6.28, wobble: type === 'motorbike' ? 0.14 : type === 'bicycle' ? 0.05 : 0.03 });
  }

  // ───── Người ─────
  const addPerson = (id, type, look, x, z, yaw, extra = {}) => {
    const g = buildPerson({ ...look, pose: extra.pose || 'stand' });
    g.position.set(x, extra.y ?? SW, z);
    g.rotation.y = yaw;
    scene.add(g);
    reg.add({ id, type, pos: [x, 0.85, z], size: [0.5, 1.7, 0.5], moving: type === 'pedestrian' });
    tag(g, id);
    const p = { id, type, g, rec: reg.get(id), x, z, yaw, tYaw: yaw, walkT: R() * 6, idleT: R() * 6, speedMul: 1, amp: 0, pause: 0, stopZ: null, gesture: null, gT: 0, ...extra };
    people.push(p);
    return p;
  };

  // đi dọc vỉa hè (qua lại giữa hai đầu)
  const patrols = [
    { x: -5.75, a: 31, b: -30, v: 1.25 }, { x: -5.45, a: -28, b: 29, v: 1.05 }, { x: -6.1, a: 12, b: -22, v: 0.9 },
    { x: 5.75, a: 30, b: -31, v: 1.2 }, { x: 5.45, a: -26, b: 28, v: 1.0 }, { x: 6.1, a: 10, b: -24, v: 1.1 },
    { x: -6.3, a: 26, b: -60, v: 1.0 }, { x: 6.4, a: -8, b: -70, v: 0.95 },
    { x: -5.8, a: -36, b: -100, v: 1.1 }, { x: 5.6, a: -40, b: -102, v: 1.0 }, { x: -5.4, a: -58, b: -96, v: 0.9 }, { x: 6.0, a: -34, b: -82, v: 1.15 },
  ];
  patrols.forEach((pt, i) => {
    const look = randomLook(R);
    const z0 = pt.b + (pt.a - pt.b) * R();
    addPerson(`ped-${i}`, 'pedestrian', look, pt.x, z0, 0, { kind: 'patrol', a: pt.a, b: pt.b, v: pt.v, dirSign: i % 2 === 0 ? 1 : -1, laneX: pt.x, offset: 0 });
  });
  // người qua đường: chờ ở mép vỉa hè, chỉ bước xuống khi xe đã dừng
  [[-1, -0.6], [1, 0.7], [-1, 0.9], [1, -0.9]].forEach(([side, zo], i) => {
    const look = randomLook(R);
    addPerson(`cross-${i}`, 'pedestrian', look, side * 4.85, zo, side < 0 ? -Math.PI / 2 : Math.PI / 2, {
      kind: 'cross', side, zo, v: 1.45, state: 'wait', lastCycle: -1, delay: 0.5 + R() * 4, gesture: i % 2 ? 'phone' : null,
    });
  });
  // người đứng
  for (const s of world.standers) {
    addPerson(s.id, 'standing_person', s.look, s.x, s.z, s.yaw, { kind: 'stand', serve: s.id === 'vendor' });
  }
  // khách ngồi ở quán cà phê
  for (const s of world.seated) {
    addPerson(s.id, 'seated_person', s.look, s.x, s.z, s.yaw, { kind: 'sit', pose: 'sit' });
    reg.get(s.id).collide = false;
  }

  function updatePeople(dt, player) {
    for (const p of people) {
      if (p.kind === 'patrol') {
        const target = p.dirSign > 0 ? p.a : p.b;
        const dz = target - p.z;
        if (Math.abs(dz) < 0.3) { p.dirSign *= -1; p.stopZ = null; }
        const dir = Math.sign(target - p.z) || 1;
        // ghé xem một cửa hàng: dừng ngắn, quay mặt vào nhà, xem điện thoại / nhìn biển, rồi đi tiếp
        if (p.stopZ === null) p.stopZ = p.z + dir * (7 + R() * 16);
        if (p.pause > 0) {
          p.pause -= dt;
          if (p.pause <= 0) { p.gesture = null; p.stopZ = null; }
        } else if ((p.z - p.stopZ) * dir >= 0 && Math.abs(p.stopZ - target) > 3) {
          p.pause = 2.2 + R() * 3.2;
          p.gesture = R() < 0.4 ? 'phone' : R() < 0.5 ? 'look' : null;
          p.faceYaw = (p.laneX < 0 ? 1 : -1) * Math.PI / 2;
        } else if ((p.z - p.stopZ) * dir >= 0) p.stopZ = null;
        // tránh người dùng: nhích sang bên, dừng nếu vẫn chắn đường
        let want = 0;
        let mul = 1;
        if (player) {
          const ahead = (player.z - p.z) * dir;
          const lat = player.x - (p.laneX + p.offset);
          if (ahead > 0 && ahead < 2.4 && Math.abs(lat) < 0.8) {
            want = lat > 0 ? -0.8 : 0.8;
            if (ahead < 1.0 && Math.abs(lat) < 0.55) mul = 0;
          }
        }
        p.offset += (want - p.offset) * Math.min(1, dt * 3);
        if (p.pause > 0) mul = 0;
        p.speedMul += (mul - p.speedMul) * Math.min(1, dt * 6);
        p.z += dir * p.v * p.speedMul * dt;
        p.x = p.laneX + p.offset;
        p.tYaw = p.pause > 0 ? p.faceYaw : dir > 0 ? 0 : Math.PI;
        p.moving = p.speedMul > 0.1;
      } else if (p.kind === 'cross') {
        if (p.state === 'wait') {
          p.delay -= dt;
          p.moving = false;
          const canGo = signal.state === 'stop' && signal.t > 2.2 && p.delay <= 0 && signal.cycle !== p.lastCycle;
          if (canGo) { p.state = 'cross'; p.lastCycle = signal.cycle; }
        } else if (p.state === 'cross') {
          const goal = -p.side * 4.85;
          const dir = Math.sign(goal - p.x);
          p.x += dir * p.v * dt;
          p.tYaw = dir > 0 ? Math.PI / 2 : -Math.PI / 2;
          p.moving = true;
          if ((goal - p.x) * dir <= 0) {
            p.x = goal;
            p.side = -p.side;
            p.state = 'wait';
            p.delay = 1 + R() * 5;
            p.moving = false;
            p.tYaw = p.side < 0 ? -Math.PI / 2 : Math.PI / 2;
          }
        }
      }
      // quay mặt mượt
      if (p.kind === 'patrol' || p.kind === 'cross') p.yaw += norm(p.tYaw - p.yaw) * Math.min(1, dt * 6);
      p.g.position.x = p.x;
      p.g.position.z = p.z;
      p.g.position.y = p.kind === 'cross' && Math.abs(p.x) < STREET.roadHalf - 0.2 ? 0 : SW;
      p.g.rotation.y = p.yaw;
      const walker = p.kind === 'patrol' || p.kind === 'cross';
      if (walker) {
        p.amp += ((p.moving ? 1 : 0) - p.amp) * Math.min(1, dt * 6);
        p.walkT += dt * (p.v ?? 1.2) * (p.kind === 'patrol' ? p.speedMul : 1) * 4.3 * (p.moving ? 1 : 0);
        animateWalk(p.g, p.walkT, p.amp);
        if (!p.moving) animateIdle(p.g, (p.idleT += dt));
        if (p.gesture === 'phone' && !p.moving) { const pp = p.g.userData.parts; pp.armR.rotation.x = -1.2; pp.head.rotation.x = 0.35; pp.head.rotation.y = 0; }
      } else if (p.serve) {
        // người bán bánh mì: quay sang xe, với tay lấy bánh, đưa cho khách, rồi nhìn ra đường
        const pp = p.g.userData.parts;
        const ph = (p.idleT += dt) % 9;
        animateIdle(p.g, p.idleT);
        const reach = ph < 3 ? Math.sin((ph / 3) * Math.PI) : 0;
        const hand = ph > 4.5 && ph < 7 ? Math.sin(((ph - 4.5) / 2.5) * Math.PI) : 0;
        pp.armR.rotation.x = -0.9 * reach - 1.1 * hand;
        pp.armL.rotation.x = -0.5 * reach;
        pp.torso.rotation.y = -0.5 * reach + 0.25 * hand;
        pp.head.rotation.x = 0.2 * reach;
      } else if (p.pose === 'sit') {
        // khách quán: nhấp ngụm cà phê, nhìn quanh, xoay người nói chuyện
        const pp = p.g.userData.parts;
        animateIdle(p.g, (p.idleT += dt));
        const ph = (p.idleT + p.walkT) % 10;
        const sip = ph > 2 && ph < 4.2 ? Math.sin(((ph - 2) / 2.2) * Math.PI) : 0;
        pp.armR.rotation.x = -0.55 - 0.95 * sip;
        pp.head.rotation.x = -0.15 * sip;
        pp.torso.rotation.y = Math.sin(p.idleT * 0.35 + p.walkT) * 0.18;
      } else {
        animateIdle(p.g, (p.idleT += dt));
      }
      p.rec.pos[0] = p.x;
      p.rec.pos[1] = 0.85;
      p.rec.pos[2] = p.z;
    }
  }

  function updateVehicles(dt, player, time) {
    for (const v of vehicles) {
      const tgt = targetSpeed(v, vehicles, signal, player);
      const acc = tgt > v.speed ? 2.6 : 6.5;
      v.speed += Math.sign(tgt - v.speed) * Math.min(Math.abs(tgt - v.speed), acc * dt);
      v.z += v.dir * v.speed * dt;
      if (v.z > LIMIT) v.z -= LIMIT * 2;
      if (v.z < -LIMIT) v.z += LIMIT * 2;
      const lateral = Math.sin(time * 0.8 + v.phase) * v.wobble * Math.min(1, v.speed / 6);
      v.x = v.baseX + lateral;
      v.model.position.set(v.x, 0, v.z);
      v.model.rotation.y = (v.dir < 0 ? Math.PI : 0) + lateral * 0.4 * v.dir;
      const spin = (v.speed * dt) / (v.model.userData.wheelRadius || 0.3);
      const wheels = v.model.userData.wheels;
      if (wheels) for (const w of wheels) w.rotation.x += spin;
      v.rec.pos[0] = v.x;
      v.rec.pos[2] = v.z;
    }
  }

  function updateLights() {
    const state = signal.state === 'go' ? 'green' : signal.state === 'yellow' ? 'yellow' : 'red';
    // đèn quay về phía xe: bật theo pha
    for (const tl of world.trafficLights) setTrafficLight(tl, state);
  }

  let clock = 0;
  return {
    vehicles, people, signal,
    update(dt, player) {
      clock += dt;
      advanceSignal(signal, dt);
      updateLights();
      updateVehicles(dt, player, clock);
      updatePeople(dt, player);
    },
  };
}
