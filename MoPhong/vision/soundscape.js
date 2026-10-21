// Âm thanh phố thật (file trong MoPhong/audio, nguồn ghi ở audio/NGUON.txt):
//  • Nền: ban ngày "pho-ngay", ban đêm luân phiên "pho-dem-hang-rong" và "pho-dem-cebu" (trộn dần theo độ tối).
//  • Nhạc buổi tối phát từ các quán cà phê: to dần khi Đăng đi ngang, nhỏ dần khi đi xa; hai bài luân phiên.
//  • Xe máy/ô tô chạy ngang gần Đăng: tiếng xe máy, thỉnh thoảng bóp còi (giờ cao điểm bóp nhiều hơn).
// Dùng chung AudioContext của Sfx nên nút tắt âm thanh của trang vẫn tắt được mọi thứ.

const URL_OF = (f) => new URL(`../audio/${f}`, import.meta.url).href;

async function loadBuffer(ctx, file) {
  const res = await fetch(URL_OF(file));
  if (!res.ok) throw new Error(file);
  return ctx.decodeAudioData(await res.arrayBuffer());
}

/** Một rãnh phát vòng một danh sách bài, có gain riêng. */
function playlist(ctx, dest, buffers) {
  const gain = ctx.createGain();
  gain.gain.value = 0;
  gain.connect(dest);
  let i = 0;
  let src = null;
  const next = () => {
    if (!buffers.length) return;
    src = ctx.createBufferSource();
    src.buffer = buffers[i % buffers.length];
    i++;
    src.connect(gain);
    src.onended = next;
    src.start();
  };
  return { gain, start: next, stop: () => { if (src) { src.onended = null; try { src.stop(); } catch { /* đã dừng */ } } } };
}

export function createSoundscape(sfx, reg) {
  let ready = false;
  let day = null, night = null, music = null;
  let bikes = [], horn = null;
  let nightLevel = 0;
  const cafes = reg.list.filter((o) => o.type === 'cafe').map((o) => ({ x: o.pos[0], z: o.pos[2] }));
  const passed = new Map();   // id xe -> thời điểm phát tiếng gần nhất

  async function init() {
    const ctx = sfx.ctx;
    if (!ctx || ready) return;
    ready = true;
    const bus = ctx.createGain();
    bus.gain.value = 1;
    bus.connect(sfx.master);
    const load = (f) => loadBuffer(ctx, f).catch((e) => { console.warn('Không tải được âm thanh', e.message); return null; });
    const [d, n1, n2, m1, m2, b1, b2, h] = await Promise.all([
      load('pho-ngay.mp3'), load('pho-dem-hang-rong.ogg'), load('pho-dem-cebu.ogg'),
      load('nhac-street-of-love.ogg'), load('nhac-monarch-of-the-street.ogg'),
      load('xe-may-1.ogg'), load('xe-may-2.ogg'), load('coi-oto.wav'),
    ]);
    day = playlist(ctx, bus, [d].filter(Boolean));
    night = playlist(ctx, bus, [n1, n2].filter(Boolean));
    music = playlist(ctx, bus, [m1, m2].filter(Boolean));
    bikes = [b1, b2].filter(Boolean);
    horn = h;
    day.start(); night.start(); music.start();
  }

  function oneShot(buffer, gain, pan, rate = 1) {
    const ctx = sfx.ctx;
    if (!ctx || !buffer) return;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.playbackRate.value = rate;
    const g = ctx.createGain();
    g.gain.value = gain;
    const p = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    if (p) { p.pan.value = Math.max(-1, Math.min(1, pan)); src.connect(g).connect(p).connect(sfx.master); }
    else src.connect(g).connect(sfx.master);
    src.start();
  }

  const rushHour = () => {
    const h = new Date().getHours();
    return (h >= 7 && h < 9) || (h >= 17 && h < 19);
  };

  return {
    start() { init(); },
    setNight(n) { nightLevel = n; },
    /** @param player {x,z,yaw}  vehicles: danh sách xe từ entities.js */
    update(player, vehicles) {
      if (!ready || !day || !sfx.ctx) return;
      const t = sfx.ctx.currentTime;
      const on = sfx.enabled ? 1 : 0;
      // nền: ban ngày to, ban đêm chuyển sang tiếng phố đêm
      day.gain.gain.setTargetAtTime(on * 0.22 * (1 - nightLevel), t, 0.6);
      night.gain.gain.setTargetAtTime(on * 0.3 * nightLevel, t, 0.6);
      // nhạc quán cà phê gần nhất (chỉ khi trời đã tối dần)
      let near = Infinity;
      for (const c of cafes) near = Math.min(near, Math.hypot(c.x - player.x, c.z - player.z));
      const closeness = Math.max(0, 1 - near / 18);
      music.gain.gain.setTargetAtTime(on * 0.32 * closeness * closeness * Math.min(1, nightLevel * 1.4), t, 0.4);

      // xe chạy ngang gần: tiếng xe máy; ô tô và (giờ cao điểm) xe máy thỉnh thoảng bóp còi
      if (!on) return;
      const now = performance.now();
      const rx = Math.cos(player.yaw), rz = -Math.sin(player.yaw);
      for (const v of vehicles) {
        if (!v.speed || v.type === 'bicycle') continue;
        const dx = v.x - player.x, dz = v.z - player.z;
        const d = Math.hypot(dx, dz);
        if (d > 7) continue;
        const last = passed.get(v.id) || 0;
        if (now - last < 9000) continue;
        passed.set(v.id, now);
        const pan = (dx * rx + dz * rz) / Math.max(1, d);
        const loud = 0.5 * (1 - d / 8);
        if (v.type === 'motorbike') oneShot(bikes[(Math.random() * bikes.length) | 0], loud, pan, 0.9 + Math.random() * 0.25);
        const hornChance = (v.type === 'car' ? 0.35 : 0.12) * (rushHour() ? 2.2 : 1);
        if (horn && Math.random() < hornChance) setTimeout(() => oneShot(horn, loud * 0.8, pan, v.type === 'car' ? 1 : 1.35), 250 + Math.random() * 600);
      }
    },
  };
}
