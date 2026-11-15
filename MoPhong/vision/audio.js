// Âm thanh tạo ngay trong trình duyệt bằng Web Audio (không tải tệp, không dịch vụ ngoài).
// Chỉ được khởi tạo sau thao tác của người dùng (nút "Bắt đầu").

export class Sfx {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.enabled = true;
  }

  unlock() {
    if (!this.ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.8;
        this.master.connect(this.ctx.destination);
      } catch {
        this.ctx = null;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
  }

  get ready() {
    return !!this.ctx && this.enabled;
  }

  setEnabled(v) {
    this.enabled = !!v;
  }

  /** Một âm đơn có bao âm mềm. pan: -1 (trái) … 1 (phải). */
  tone({ freq = 880, to = null, dur = 0.12, type = 'sine', gain = 0.12, when = 0, pan = 0, dest = null } = {}) {
    if (!this.ready) return;
    const c = this.ctx;
    const t0 = c.currentTime + when;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + Math.min(0.02, dur / 3));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    let out = g;
    if (c.createStereoPanner && pan) {
      const p = c.createStereoPanner();
      p.pan.value = Math.max(-1, Math.min(1, pan));
      g.connect(p);
      out = p;
    }
    out.connect(dest || this.master);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  }

  /** Tiếng "tách" nhẹ khi kính chụp một khung hình. */
  shutter() {
    this.tone({ freq: 2200, to: 900, dur: 0.045, type: 'square', gain: 0.035 });
    this.tone({ freq: 1500, to: 700, dur: 0.06, type: 'square', gain: 0.03, when: 0.07 });
  }

  /** Báo đã xử lý xong. */
  done() {
    this.tone({ freq: 740, dur: 0.09, gain: 0.07 });
    this.tone({ freq: 988, dur: 0.13, gain: 0.07, when: 0.09 });
  }

  /** Âm dẫn hướng tới đồ vật: pan theo hướng, cao độ theo độ gần (closeness 0…1). */
  ping(pan = 0, closeness = 0.3) {
    this.tone({ freq: 520 + closeness * 700, dur: 0.16, gain: 0.16, pan, type: 'triangle' });
  }

  ring() {
    for (const w of [0, 0.5]) {
      this.tone({ freq: 440, dur: 0.38, gain: 0.06, when: w, type: 'sine' });
      this.tone({ freq: 480, dur: 0.38, gain: 0.06, when: w, type: 'sine' });
    }
  }

  connected() {
    this.tone({ freq: 660, dur: 0.1, gain: 0.07 });
    this.tone({ freq: 880, dur: 0.14, gain: 0.07, when: 0.1 });
  }

  hangup() {
    this.tone({ freq: 520, to: 300, dur: 0.25, gain: 0.07 });
  }

  sos() {
    for (let i = 0; i < 4; i++) this.tone({ freq: i % 2 ? 660 : 920, dur: 0.22, gain: 0.09, when: i * 0.24, type: 'triangle' });
  }

  notify() {
    this.tone({ freq: 880, dur: 0.09, gain: 0.06 });
    this.tone({ freq: 1175, dur: 0.14, gain: 0.06, when: 0.1 });
  }
}

// ───────── Nhạc tạo tự động (mô phỏng "phát nhạc") ─────────
const TRACKS = [
  { title: 'Nhạc nhẹ buổi sáng', bpm: 72, scale: [261.6, 293.7, 329.6, 392.0, 440.0, 523.3], pads: [[130.8, 196.0], [110.0, 164.8], [87.3, 130.8], [98.0, 146.8]] },
  { title: 'Giai điệu phố nhỏ', bpm: 88, scale: [220.0, 246.9, 293.7, 329.6, 392.0, 440.0], pads: [[110.0, 164.8], [98.0, 146.8], [82.4, 123.5], [98.0, 146.8]] },
  { title: 'Gió chiều', bpm: 60, scale: [196.0, 220.0, 261.6, 293.7, 329.6, 392.0], pads: [[98.0, 146.8], [87.3, 130.8], [110.0, 164.8], [73.4, 110.0]] },
];

export class Music {
  constructor(sfx) {
    this.sfx = sfx;
    this.index = 0;
    this.playing = false;
    this.volume = 0.6;
    this._timer = 0;
    this._beat = 0;
    this._nextT = 0;
    this._seed = 7;
    this._gain = null;
  }

  get track() {
    return TRACKS[this.index % TRACKS.length];
  }

  get title() {
    return this.track.title;
  }

  _rand() {
    this._seed = (this._seed * 16807) % 2147483647;
    return this._seed / 2147483647;
  }

  play(index = this.index) {
    this.sfx.unlock();
    this.index = (index + TRACKS.length) % TRACKS.length;
    this.stop(false);
    this.playing = true;
    const c = this.sfx.ctx;
    if (c) {
      this._gain = c.createGain();
      this._gain.gain.value = this.volume * 0.6;
      this._gain.connect(this.sfx.master);
      this._beat = 0;
      this._nextT = c.currentTime + 0.1;
      this._timer = setInterval(() => this._schedule(), 120);
      this._schedule();
    }
  }

  stop(clear = true) {
    clearInterval(this._timer);
    this._timer = 0;
    if (clear) this.playing = false;
    if (this._gain) {
      try { this._gain.disconnect(); } catch { /* đã ngắt */ }
      this._gain = null;
    }
  }

  next() {
    this.play(this.index + 1);
  }

  setVolume(v) {
    this.volume = Math.max(0.1, Math.min(1, v));
    if (this._gain) this._gain.gain.value = this.volume * 0.6;
  }

  _schedule() {
    const c = this.sfx.ctx;
    if (!c || !this._gain) return;
    const tr = this.track;
    const beatLen = 60 / tr.bpm;
    while (this._nextT < c.currentTime + 0.4) {
      const when = Math.max(0, this._nextT - c.currentTime);
      if (this._beat % 4 === 0) {
        const chord = tr.pads[(this._beat / 4) % tr.pads.length | 0];
        for (const f of chord) this.sfx.tone({ freq: f, dur: beatLen * 4, type: 'triangle', gain: 0.05, when, dest: this._gain });
      }
      if (this._rand() < 0.78) {
        const f = tr.scale[(this._rand() * tr.scale.length) | 0] * (this._rand() < 0.2 ? 2 : 1);
        this.sfx.tone({ freq: f, dur: beatLen * 1.6, type: 'sine', gain: 0.075, when, pan: (this._rand() - 0.5) * 0.6, dest: this._gain });
      }
      this._beat++;
      this._nextT += beatLen;
    }
  }
}
