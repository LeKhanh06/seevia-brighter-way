// Khung nhìn kính SeeVia: bảng trạng thái 4 bước, vùng nhận diện, hiệu ứng chụp/quét và radar vị trí tương đối.
// Mục đích: cho người xem thấy RÕ kính đang làm gì (camera chỉ bật khi được yêu cầu), thay cho một dấu chấm nhỏ.

import { directionPhrase, relativeAngle, distanceTo, normalizeAngle } from './recognition.js';

const $ = (id) => document.getElementById(id);
const STEP_ORDER = ['request', 'capture', 'detect', 'speak'];

export class Lens {
  constructor() {
    this.root = $('lens');
    this.status = $('status');
    this.stText = $('st-text');
    this.stSub = $('st-sub');
    this.steps = [...document.querySelectorAll('#steps li')];
    this.aim = $('aim');
    this.shutterEl = $('shutter');
    this.sweepEl = $('sweep');
    this._idleTimer = 0;
    this.radar = new Radar();
  }

  show() {
    this.root.hidden = false;
  }

  /** Bắt đầu một yêu cầu. camera = true: kính bật camera đúng một khung hình. */
  begin({ camera, label }) {
    clearTimeout(this._idleTimer);
    this.camera = !!camera;
    this.label = label;
    this.status.classList.add('busy');
    this.status.classList.toggle('cam', !!camera);
    this.status.classList.toggle('svc', !camera);
    this.root.classList.toggle('cam', !!camera);
    this.aim.classList.remove('quiet');
    this.steps[1].setAttribute('aria-label', camera ? 'Kính chụp 1 khung' : 'Kính xử lý lệnh');
    this.steps[2].setAttribute('aria-label', camera ? 'SeeVia xác định' : 'Có kết quả');
    this.step('request');
    if (camera) {
      this.shutterEl.classList.remove('go');
      void this.shutterEl.offsetWidth;
      this.shutterEl.classList.add('go');
      // chạy lại hiệu ứng quét
      this.root.classList.remove('cam');
      void this.root.offsetWidth;
      this.root.classList.add('cam');
    }
  }

  step(name) {
    const at = STEP_ORDER.indexOf(name);
    this.steps.forEach((li, i) => {
      li.classList.toggle('done', i < at);
      li.classList.toggle('now', i === at);
    });
    const cam = this.camera;
    this.stText.textContent = {
      request: cam ? 'Đã nhận yêu cầu' : (this.label || 'Đang xử lý'),
      capture: 'Camera chụp 1 khung',
      detect: cam ? 'Đang xác định' : 'Đang xử lý',
      speak: 'Đang đọc kết quả',
    }[name] || 'Camera tắt';
    if (name === 'capture' || name === 'detect') this.root.classList.remove('cam');
    if (name === 'detect') this.status.classList.remove('cam');
  }

  /** Kết thúc: camera tắt lại, về trạng thái chờ. */
  end(delay = 1400) {
    clearTimeout(this._idleTimer);
    this._idleTimer = setTimeout(() => {
      this.status.classList.remove('busy', 'cam', 'svc');
      this.root.classList.remove('cam');
      this.stText.textContent = 'Camera tắt';
      this.aim.classList.add('quiet');
      this.steps.forEach((li) => li.classList.remove('done', 'now'));
    }, delay);
  }

  sweep() {
    this.sweepEl.classList.remove('go');
    void this.sweepEl.offsetWidth;
    this.sweepEl.classList.add('go');
  }

  update(cam) {
    this.radar.update(cam);
  }
}

// ───────── Radar vị trí tương đối (nhìn từ trên xuống, hướng nhìn của bạn ở phía trên) ─────────
const R_MAX = 16;

export class Radar {
  constructor() {
    this.wrap = $('radar-wrap');
    this.canvas = $('radar');
    this.ctx = this.canvas.getContext('2d');
    this.legend = $('radar-legend');
    this.title = $('radar-title');
    this.items = [];
    this.live = false;
    this.snapshot = null;
    this._timer = 0;
    this.visible = false;
  }

  /**
   * items: [{ label, pos:[x,y,z], size:[dx,dy,dz], color? }]  toạ độ cảnh thật.
   * Chế độ chụp nhanh (không live) tự mờ sau ttl; chế độ live cập nhật theo vị trí người dùng cho tới khi gọi hide().
   */
  show({ title = 'Vị trí so với bạn', items, cam, live = false, ttl = 8000 }) {
    clearTimeout(this._timer);
    this.items = items;
    this.live = live;
    this.snapshot = { x: cam.x, z: cam.z, yaw: cam.yaw };
    this.title.textContent = title;
    this.wrap.hidden = false;
    this.wrap.classList.remove('fade');
    this.visible = true;
    this._legend(cam);
    this.draw(cam);
    if (!live) this._timer = setTimeout(() => this.hide(), ttl);
  }

  hide() {
    clearTimeout(this._timer);
    this.live = false;
    this.visible = false;
    this.wrap.classList.add('fade');
    this._timer = setTimeout(() => { this.wrap.hidden = true; }, 520);
  }

  _legend(cam) {
    this.legend.innerHTML = '';
    this.items.forEach((it, i) => {
      const li = document.createElement('li');
      const d = distanceTo(cam, it);
      const dir = directionPhrase(relativeAngle(cam, it));
      li.textContent = `${i + 1}. ${it.label} · ${d < 2 ? '<2' : Math.round(d)} m, ${dir}`;
      this.legend.appendChild(li);
    });
  }

  update(cam) {
    if (!this.visible || !this.live) return;
    this.draw(cam);
    // cập nhật chú thích khoảng 2 lần/giây
    const now = performance.now();
    if (!this._lt || now - this._lt > 500) {
      this._lt = now;
      this._legend(cam);
    }
  }

  draw(camLive) {
    const cam = this.live ? camLive : this.snapshot;
    const g = this.ctx;
    const S = this.canvas.width;
    const c = S / 2;
    const rad = c - 14;
    g.clearRect(0, 0, S, S);
    // nền
    const bg = g.createRadialGradient(c, c, 4, c, c, rad);
    bg.addColorStop(0, 'rgba(40,44,52,0.92)');
    bg.addColorStop(1, 'rgba(20,22,27,0.92)');
    g.fillStyle = bg;
    g.beginPath();
    g.arc(c, c, rad, 0, Math.PI * 2);
    g.fill();
    // vòng khoảng cách 5/10/15 m
    g.lineWidth = 1.5;
    g.font = '600 18px "Segoe UI", sans-serif';
    g.textAlign = 'center';
    for (const m of [5, 10, 15]) {
      const r = (m / R_MAX) * rad;
      g.strokeStyle = 'rgba(255,255,255,0.14)';
      g.beginPath();
      g.arc(c, c, r, 0, Math.PI * 2);
      g.stroke();
      g.fillStyle = 'rgba(255,255,255,0.38)';
      g.fillText(m + ' m', c, c - r + 16);
    }
    // nón nhìn của kính (±34°)
    const half = 0.6;
    g.fillStyle = 'rgba(255,214,150,0.16)';
    g.beginPath();
    g.moveTo(c, c);
    g.arc(c, c, rad, -Math.PI / 2 - half, -Math.PI / 2 + half);
    g.closePath();
    g.fill();
    g.strokeStyle = 'rgba(255,214,150,0.5)';
    g.lineWidth = 1.5;
    g.stroke();
    // chính bạn
    g.fillStyle = '#fff3d6';
    g.beginPath();
    g.moveTo(c, c - 11);
    g.lineTo(c + 8, c + 8);
    g.lineTo(c, c + 4);
    g.lineTo(c - 8, c + 8);
    g.closePath();
    g.fill();
    // vật thể: x phải = +, phía trước = lên
    this.items.forEach((it, i) => {
      const a = relativeAngle(cam, it); // dương = bên trái
      const d = distanceTo(cam, it);
      const clamped = Math.min(d, R_MAX - 0.8);
      const r = (clamped / R_MAX) * rad;
      const px = c - Math.sin(a) * r;
      const py = c - Math.cos(a) * r;
      const far = d > R_MAX;
      g.globalAlpha = far ? 0.55 : 1;
      g.fillStyle = it.color || '#7fd3de';
      g.beginPath();
      g.arc(px, py, 14, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = 'rgba(0,0,0,0.5)';
      g.lineWidth = 2;
      g.stroke();
      g.fillStyle = '#1b1408';
      g.font = '800 17px "Segoe UI", sans-serif';
      g.fillText(String(i + 1), px, py + 6);
      g.globalAlpha = 1;
    });
  }
}

export { normalizeAngle };
