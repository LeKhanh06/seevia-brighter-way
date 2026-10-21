// Điều khiển góc nhìn thứ nhất: WASD, chuột (pointer lock sau khi người dùng bấm), Shift, cảm ứng, va chạm.

import * as THREE from 'three';
import { STREET } from './data.js';

const WALK = 1.7;     // m/s
const FAST = 2.7;     // "đi nhanh vừa phải"
const RADIUS = 0.28;
const PITCH_LIMIT = 1.15;

const smooth = (e0, e1, x) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

export class PlayerControls {
  constructor(camera, dom, registry) {
    this.camera = camera;
    this.dom = dom;
    this.registry = registry;
    this.x = -STREET.tactileX;
    this.z = 27;
    this.yaw = 0;           // hướng nhìn mong muốn
    this.pitch = -0.04;
    this.viewYaw = 0;       // hướng nhìn thực tế của camera (làm mượt)
    this.viewPitch = -0.04;
    this.hotkeys = false;   // phím tắt hoạt động sau khi bắt đầu (kể cả khi tạm dừng)
    this.run = 0;           // 0…1: mức "đi nhanh" đã làm mượt, dùng cho hiệu ứng FOV
    this.vx = 0;
    this.vz = 0;
    this.eyeY = STREET.curbHeight + STREET.eyeHeight;
    this.bob = 0;
    this.keys = new Set();
    this.enabled = false;
    this.locked = false;
    this.moveStick = { x: 0, y: 0 };
    this.on = {}; // callbacks: identify, scan, pause, lockchange, repeat, voice
    this._drag = null;
    this._bind();
  }

  _bind() {
    const dom = this.dom;
    window.addEventListener('keydown', (e) => {
      if (!this.hotkeys) return;
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const code = e.code;
      // Space/Enter trên một nút đang được focus là để kích hoạt nút đó (trợ năng bàn phím)
      if (t && t.tagName === 'BUTTON' && (code === 'Space' || code === 'Enter')) return;
      if (this.enabled && ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight'].includes(code)) {
        this.keys.add(code);
        e.preventDefault();
        return;
      }
      if (e.repeat) return;
      const digit = /^(?:Digit|Numpad)([1-9])$/.exec(code);
      if (digit) { if (this.on.digit?.(+digit[1])) e.preventDefault(); return; }
      if (code === 'KeyE') { e.preventDefault(); this.on.identify?.(); }
      else if (code === 'Space') { e.preventDefault(); this.on.scan?.(); }
      else if (code === 'KeyQ') { this.on.read?.(); }
      else if (code === 'KeyR') { this.on.repeat?.(); }
      else if (code === 'KeyV') { this.on.voice?.(); }
      else if (code === 'KeyM') { e.preventDefault(); this.on.command?.(); }
      else if (code === 'KeyH') { this.on.guide?.(); }
      else if (code === 'KeyC') { this.on.view?.(); }
      else if (code === 'Tab') { if (this.on.tab?.(e.shiftKey ? -1 : 1)) e.preventDefault(); }
      else if (code === 'Escape') { this.on.pause?.(); }
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => this.keys.clear());

    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement === dom;
      this.on.lockchange?.(this.locked);
    });
    document.addEventListener('mousemove', (e) => {
      if (!this.enabled || !this.locked) return;
      this._look(e.movementX, e.movementY, 0.0022);
    });

    // Khi đang khoá chuột, bấm chuột trái = nhận diện (giống nút "tương tác" trong game): không cần nhớ phím nào.
    dom.addEventListener('mousedown', (e) => {
      if (this.enabled && this.locked && e.button === 0) this.on.identify?.();
    });

    // Kéo để nhìn quanh (chuột khi không có pointer lock, hoặc ngón tay trên màn hình cảm ứng)
    dom.addEventListener('pointerdown', (e) => {
      if (!this.enabled || this.locked) return;
      this._drag = { id: e.pointerId, x: e.clientX, y: e.clientY, touch: e.pointerType === 'touch' };
      dom.setPointerCapture?.(e.pointerId);
    });
    dom.addEventListener('pointermove', (e) => {
      if (!this._drag || e.pointerId !== this._drag.id) return;
      this._look(e.clientX - this._drag.x, e.clientY - this._drag.y, this._drag.touch ? 0.0045 : 0.0030);
      this._drag.x = e.clientX;
      this._drag.y = e.clientY;
    });
    const end = (e) => {
      if (this._drag && e.pointerId === this._drag.id) this._drag = null;
    };
    dom.addEventListener('pointerup', end);
    dom.addEventListener('pointercancel', end);
  }

  _look(dx, dy, k) {
    this.yaw -= dx * k;
    this.pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, this.pitch - dy * k));
  }

  /** Đặt ngay hướng nhìn (không làm mượt) — dùng khi bắt đầu hoặc khi kiểm thử. */
  lookAt(yaw, pitch = this.pitch) {
    this.yaw = this.viewYaw = yaw;
    this.pitch = this.viewPitch = pitch;
  }

  /** Phải gọi từ một thao tác của người dùng (bấm/chạm) — không bao giờ tự khoá chuột. */
  requestLock() {
    try {
      const p = this.dom.requestPointerLock?.();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } catch {
      /* không hỗ trợ: vẫn dùng kéo-để-nhìn */
    }
  }

  releaseLock() {
    if (document.pointerLockElement === this.dom) document.exitPointerLock?.();
  }

  setEnabled(v) {
    this.enabled = v;
    if (!v) {
      this.keys.clear();
      this.vx = this.vz = 0;
    }
  }

  get state() {
    return { x: this.x, z: this.z, yaw: this.viewYaw };
  }

  _resolve(x, z) {
    for (const o of this.registry.list) {
      if (!o.collide) continue;
      const dx = x - o.pos[0];
      const dz = z - o.pos[2];
      const hx = o.size[0] / 2 + RADIUS;
      const hz = o.size[2] / 2 + RADIUS;
      if (Math.abs(dx) >= hx || Math.abs(dz) >= hz) continue;
      const px = hx - Math.abs(dx);
      const pz = hz - Math.abs(dz);
      if (px < pz) x += (dx >= 0 ? 1 : -1) * px;
      else z += (dz >= 0 ? 1 : -1) * pz;
    }
    return [x, z];
  }

  update(dt) {
    if (this.enabled) {
      const k = this.keys;
      let f = (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0) - (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0);
      let s = (k.has('KeyD') ? 1 : 0) - (k.has('KeyA') ? 1 : 0);
      if (k.has('ArrowLeft')) this.yaw += 1.6 * dt;
      if (k.has('ArrowRight')) this.yaw -= 1.6 * dt;
      f += -this.moveStick.y;
      s += this.moveStick.x;
      const len = Math.hypot(f, s);
      if (len > 1) { f /= len; s /= len; }
      const speed = k.has('ShiftLeft') || k.has('ShiftRight') ? FAST : WALK;
      const fx = -Math.sin(this.yaw);
      const fz = -Math.cos(this.yaw);
      const rx = Math.cos(this.yaw);
      const rz = -Math.sin(this.yaw);
      const tvx = (fx * f + rx * s) * speed;
      const tvz = (fz * f + rz * s) * speed;
      const a = Math.min(1, dt * 9);
      this.vx += (tvx - this.vx) * a;
      this.vz += (tvz - this.vz) * a;

      let nx = this.x + this.vx * dt;
      let nz = this.z + this.vz * dt;
      [nx, nz] = this._resolve(nx, nz);
      nx = Math.max(-16.2, Math.min(16.2, nx));
      nz = Math.max(STREET.playerZMin, Math.min(STREET.playerZMax, nz));
      this.x = nx;
      this.z = nz;
      this.bob += Math.hypot(this.vx, this.vz) * dt * 5.2;
    }
    // làm mượt góc nhìn (chuột/cảm ứng/phím mũi tên) — giữ độ nhạy nhưng bỏ giật
    const sk = 1 - Math.exp(-dt * 26);
    this.viewYaw += (this.yaw - this.viewYaw) * sk;
    this.viewPitch += (this.pitch - this.viewPitch) * sk;
    const wantRun = this.enabled && (this.keys.has('ShiftLeft') || this.keys.has('ShiftRight')) && Math.hypot(this.vx, this.vz) > 1.2 ? 1 : 0;
    this.run += (wantRun - this.run) * (1 - Math.exp(-dt * 5));
    const targetY = (Math.abs(this.x) > STREET.roadHalf + 0.2 ? STREET.curbHeight : 0) + STREET.eyeHeight;
    this.eyeY += (targetY - this.eyeY) * Math.min(1, dt * 12);
    const moving = Math.min(1, Math.hypot(this.vx, this.vz) / WALK);
    const bobY = Math.sin(this.bob) * 0.012 * moving;
    this.camera.position.set(this.x, this.eyeY + bobY, this.z);
    this.camera.rotation.set(this.viewPitch, this.viewYaw, 0, 'YXZ');
    void smooth;
  }
}

/** Joystick ảo cho màn hình cảm ứng (điều khiển di chuyển). */
export function bindStick(el, knob, out) {
  let id = null;
  const R = 44;
  const set = (e) => {
    const r = el.getBoundingClientRect();
    let dx = e.clientX - (r.left + r.width / 2);
    let dy = e.clientY - (r.top + r.height / 2);
    const l = Math.hypot(dx, dy);
    if (l > R) { dx = (dx / l) * R; dy = (dy / l) * R; }
    out.x = dx / R;
    out.y = dy / R;
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
  };
  el.addEventListener('pointerdown', (e) => { id = e.pointerId; el.setPointerCapture?.(id); set(e); e.preventDefault(); });
  el.addEventListener('pointermove', (e) => { if (e.pointerId === id) set(e); });
  const end = (e) => {
    if (e.pointerId !== id) return;
    id = null;
    out.x = out.y = 0;
    knob.style.transform = 'translate(0,0)';
  };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);
}
