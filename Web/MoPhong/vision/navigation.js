// Chỉ đường mô phỏng (KHÔNG dùng Google Maps thật): lộ trình tính từ toạ độ trong cảnh.
// Là công cụ hỗ trợ bổ sung — không thay thế gậy hoặc kỹ năng định hướng truyền thống.
// Mô-đun thuần (không phụ thuộc Three.js) để kiểm thử độc lập.

import { STREET, GROUPS } from './data.js';
import { normalizeAngle, relativeAngle, directionPhrase } from './recognition.js';

const WALK_X = STREET.tactileX;   // đi dọc dải gạch dẫn hướng
const CURB_X = STREET.roadHalf + 0.35;
const sign = (x) => (x < 0 ? -1 : 1);

export function titleCase(s) {
  return String(s ?? '')
    .toLocaleLowerCase('vi-VN')
    .replace(/(^|\s)(\S)/g, (_, a, b) => a + b.toLocaleUpperCase('vi-VN'));
}

const meters = (d) => (d < 10 ? Math.max(1, Math.round(d)) : Math.round(d / 5) * 5);
export const metersText = (d) => `${meters(d)} mét`;

/** Gom điểm đến (cửa hàng, quán, trạm xe buýt) từ registry, kèm khoảng cách từ vị trí hiện tại. */
export function buildDestinations(registry, from) {
  const out = [];
  for (const o of registry.list) {
    const isShop = o.type === 'shop' || o.type === 'cafe';
    if (!isShop && o.type !== 'bus_stop') continue;
    const side = sign(o.pos[0]);
    const z = o.pos[2];
    const title = o.read?.text ? titleCase(o.read.text) : o.name;
    const words = [o.name, o.read?.text ?? ''].filter(Boolean);
    out.push({
      key: o.id, id: o.id, name: o.name, title, side, x: side * WALK_X, z, obj: o, words,
      dist: Math.hypot(side * WALK_X - from.x, z - from.z),
    });
  }
  return out;
}

/** Với mỗi loại tên (ví dụ "nhà thuốc"), giữ lại điểm gần nhất; trả về tối đa `limit` điểm, gần trước. */
export function nearestPerName(dests, limit = 6) {
  const best = new Map();
  for (const d of dests) {
    const cur = best.get(d.name);
    if (!cur || d.dist < cur.dist) best.set(d.name, d);
  }
  return [...best.values()].sort((a, b) => a.dist - b.dist).slice(0, limit);
}

/** Lộ trình: danh sách điểm dừng. kind: walk | curb | cross | arrive. */
export function planRoute(from, dest) {
  const onSidewalk = Math.abs(from.x) > STREET.roadHalf + 0.2;
  const sp = onSidewalk ? sign(from.x) : sign(from.x || dest.side);
  const sd = dest.side;
  const legs = [];
  if (sp === sd) {
    legs.push({ x: sd * WALK_X, z: dest.z, kind: 'walk', side: sd, label: dest.title });
  } else {
    legs.push({ x: sp * WALK_X, z: STREET.crossZ, kind: 'walk', side: sp, label: 'vạch sang đường' });
    legs.push({ x: sp * CURB_X, z: STREET.crossZ, kind: 'curb', side: sp, label: 'mép vỉa hè' });
    legs.push({ x: sd * CURB_X, z: STREET.crossZ, kind: 'cross', side: 0, label: 'bên kia đường' });
    legs.push({ x: sd * WALK_X, z: dest.z, kind: 'walk', side: sd, label: dest.title });
  }
  legs.push({ x: sd * WALK_X, z: dest.z, kind: 'arrive', side: sd, label: dest.title });
  return legs;
}

export function routeLength(from, legs) {
  let d = 0;
  let x = from.x;
  let z = from.z;
  for (const l of legs) {
    if (l.kind === 'arrive') break;
    d += Math.hypot(l.x - x, l.z - z);
    x = l.x;
    z = l.z;
  }
  return d;
}

/** Hướng quay: err > 0 = đích ở bên TRÁI (cùng quy ước yaw). */
export function turnPhrase(err) {
  const a = Math.abs(err);
  const side = err > 0 ? 'trái' : 'phải';
  if (a < 0.45) return null;
  if (a < 0.95) return `Quay hơi sang ${side}.`;
  if (a < 2.0) return `Quay sang ${side}.`;
  return 'Quay người lại.';
}

export const NAV_DISCLAIMER = 'Đây chỉ là chỉ đường mô phỏng, không đảm bảo an toàn khi sang đường và không thay thế gậy trắng.';

export class Navigator {
  /**
   * @param {{x:number,z:number}} from
   * @param {object} dest  phần tử của buildDestinations()
   */
  constructor(from, dest) {
    this.dest = dest;
    this.legs = planRoute(from, dest);
    this.i = 0;
    this.done = false;
    this.started = false;
    this.lastTurnT = -99;
    this.lastProgressT = -99;
    this.lastWaitT = -99;
    this.lastReplanT = -99;
    this.nearWarned = false;
    this.disclaimerSaid = false;
    this.progressAnchor = null;
    this.phase = 'walk';
  }

  get leg() {
    return this.legs[this.i];
  }

  remaining(p) {
    const rest = this.legs.slice(this.i);
    return routeLength(p, rest);
  }

  /** Dòng ngắn cho HUD. */
  status(p) {
    if (this.done) return `Đã đến ${this.dest.title}`;
    return `${this.dest.title} · còn ${metersText(this.remaining(p))}`;
  }

  /**
   * @param {{x:number,z:number,yaw:number}} p
   * @param {number} t  thời gian (giây)
   * @param {{ped?:{go:boolean, remaining:number}}} ctx
   * @returns {{text:string, kind:string}[]}
   */
  update(p, t, ctx = {}) {
    const ev = [];
    if (this.done) return ev;
    const say = (text, kind) => ev.push({ text, kind });

    if (!this.started) {
      this.started = true;
      this.progressAnchor = { x: p.x, z: p.z };
      let s = `Bắt đầu chỉ đường đến ${this.dest.title}, còn khoảng ${metersText(this.remaining(p))}.`;
      const tp = this._turn(p);
      s += ' ' + (tp ?? 'Hãy đi thẳng.');
      if (this.legs.some((l) => l.kind === 'cross')) s += ' Đường này cần sang đường ở vạch dành cho người đi bộ.';
      this.lastTurnT = t;
      this.lastProgressT = t;
      say(s, 'start');
      return ev;
    }

    // Đi lệch sang phía khác của đường khi đang đi bộ dọc vỉa hè → tính lại
    const leg = this.leg;
    if (leg.kind === 'walk' && Math.abs(p.x) > STREET.roadHalf + 0.6 && sign(p.x) !== leg.side && t - this.lastReplanT > 6) {
      this.legs = planRoute(p, this.dest);
      this.i = 0;
      this.lastReplanT = t;
      this.progressAnchor = { x: p.x, z: p.z };
      say('Bạn đã đi lệch hướng, SeeVia tính lại lộ trình.', 'replan');
      return ev;
    }

    const cur = this.leg;
    const dist = Math.hypot(cur.x - p.x, cur.z - p.z);

    if (cur.kind === 'arrive') {
      if (Math.abs(p.z - cur.z) < 1.8 && Math.abs(p.x) > STREET.roadHalf) {
        this.done = true;
        const a = relativeAngle(p, this.dest.obj);
        const where = directionPhrase(a);
        say(`Bạn đã đến ${this.dest.title}. ${this.dest.name === 'trạm dừng xe buýt' ? 'Trạm' : 'Cửa hàng'} ở ${where}.`, 'arrive');
      }
      return ev;
    }

    if (cur.kind === 'curb') {
      if (dist < 3 && !this.nearWarned) {
        this.nearWarned = true;
        say('Sắp tới mép vỉa hè, nơi sang đường. Hãy đi chậm lại.', 'warn');
        this.lastTurnT = t;
      }
      if (dist < 0.9) {
        const ped = ctx.ped;
        if (ped && ped.go && ped.remaining >= 6) {
          const s = 'Đèn dành cho người đi bộ đang xanh. Hãy lắng nghe xe cộ và chỉ sang đường khi thấy an toàn.';
          say(this.disclaimerSaid ? s : `${s} ${NAV_DISCLAIMER}`, 'cross');
          this.disclaimerSaid = true;
          this.i++;
          this.lastTurnT = t;
        } else if (t - this.lastWaitT > 8) {
          this.lastWaitT = t;
          say(ped && ped.go ? 'Đèn sắp đổi, hãy đợi lượt sau.' : 'Đèn dành cho người đi bộ đang đỏ. Hãy đợi tại vỉa hè.', 'wait');
        }
        return ev;
      }
    }

    if (cur.kind === 'cross') {
      if (dist < 1.2) {
        this.i++;
        this.progressAnchor = { x: p.x, z: p.z };
        const nx = this.leg;
        const tp = this._turn(p);
        say(`Bạn đã sang bên kia đường. ${tp ?? 'Hãy đi thẳng.'}`, 'cross');
        this.lastTurnT = t;
        this.lastProgressT = t;
        void nx;
        return ev;
      }
    }

    if (cur.kind === 'walk' && dist < 1.2) {
      this.i++;
      this.progressAnchor = { x: p.x, z: p.z };
      return this.update(p, t, ctx);
    }

    // chỉnh hướng
    if (!(cur.kind === 'curb' && dist < 0.9)) {
      const tp = this._turn(p);
      if (tp && t - this.lastTurnT > 4) {
        this.lastTurnT = t;
        say(tp, 'turn');
        return ev;
      }
    }

    // tiến độ
    const moved = Math.hypot(p.x - this.progressAnchor.x, p.z - this.progressAnchor.z);
    if (cur.kind === 'walk' && moved >= 10 && t - this.lastProgressT > 6 && dist > 3) {
      this.progressAnchor = { x: p.x, z: p.z };
      this.lastProgressT = t;
      say(`Tiếp tục đi thẳng, còn khoảng ${metersText(dist)} đến ${cur.label}.`, 'progress');
    }
    return ev;
  }

  _turn(p) {
    const cur = this.leg;
    const dx = cur.x - p.x;
    const dz = cur.z - p.z;
    if (Math.hypot(dx, dz) < 0.6) return null;
    const bearing = Math.atan2(-dx, -dz);
    return turnPhrase(normalizeAngle(bearing - p.yaw));
  }
}

export { GROUPS };
