// Texture thủ tục (vẽ bằng canvas 2D) — không cần tải ảnh bên ngoài.
// Mọi texture dùng hạt giống cố định nên cảnh luôn giống nhau giữa các lần chạy.

import * as THREE from 'three';

let ANISO = 8;
export function setAnisotropy(n) {
  ANISO = Math.max(1, n | 0);
}

export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const mk = (w, h) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')];
};

function finish(c, { srgb = true, repeat = null } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = ANISO;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
  }
  return t;
}

function addNoise(g, w, h, amount, r) {
  const id = g.getImageData(0, 0, w, h);
  const d = id.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (r() - 0.5) * amount;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
  g.putImageData(id, 0, 0);
}

function speckle(g, w, h, r, count, colors, minS, maxS, alpha) {
  for (let i = 0; i < count; i++) {
    g.globalAlpha = alpha * (0.4 + r() * 0.6);
    g.fillStyle = colors[(r() * colors.length) | 0];
    const s = minS + r() * (maxS - minS);
    g.fillRect(r() * w, r() * h, s, s);
  }
  g.globalAlpha = 1;
}

function blobs(g, w, h, r, count, minR, maxR, dark, light) {
  for (let i = 0; i < count; i++) {
    const x = r() * w;
    const y = r() * h;
    const rad = minR + r() * (maxR - minR);
    const gr = g.createRadialGradient(x, y, 0, x, y, rad);
    gr.addColorStop(0, r() < 0.55 ? dark : light);
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr;
    g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const cl = (v) => Math.max(0, Math.min(255, v));
  return `rgb(${cl((n >> 16) + amt)},${cl(((n >> 8) & 255) + amt)},${cl((n & 255) + amt)})`;
}

const cache = new Map();
const once = (key, fn) => {
  if (!cache.has(key)) cache.set(key, fn());
  return cache.get(key);
};

// ───────────────── Mặt đường ─────────────────

export function makeAsphalt() {
  return once('asphalt', () => {
    const S = 512;
    const [c, g] = mk(S, S);
    const r = rng(11);
    g.fillStyle = '#48494c';
    g.fillRect(0, 0, S, S);
    blobs(g, S, S, r, 70, 30, 120, 'rgba(18,18,20,.20)', 'rgba(130,130,135,.13)');
    addNoise(g, S, S, 40, r);
    speckle(g, S, S, r, 4200, ['#9a9a9d', '#6d6d70', '#2b2b2d', '#b0aea8'], 1, 2.6, 0.55);
    // vệt bánh xe
    for (const u of [0.25, 0.75]) {
      const gr = g.createLinearGradient(S * u - 34, 0, S * u + 34, 0);
      gr.addColorStop(0, 'rgba(10,10,12,0)');
      gr.addColorStop(0.5, 'rgba(10,10,12,.20)');
      gr.addColorStop(1, 'rgba(10,10,12,0)');
      g.fillStyle = gr;
      g.fillRect(S * u - 34, 0, 68, S);
    }
    // mảng vá nhựa
    for (let i = 0; i < 4; i++) {
      const x = r() * (S - 140);
      const y = r() * (S - 140);
      const w = 60 + r() * 90;
      const h = 50 + r() * 90;
      g.fillStyle = 'rgba(30,30,32,.35)';
      g.fillRect(x, y, w, h);
      g.strokeStyle = 'rgba(15,15,15,.55)';
      g.lineWidth = 1.5;
      g.strokeRect(x, y, w, h);
    }
    // vết nứt
    g.lineCap = 'round';
    for (let i = 0; i < 8; i++) {
      let x = r() * S;
      let y = r() * S;
      g.strokeStyle = 'rgba(12,12,12,.7)';
      g.lineWidth = 0.8 + r() * 1.2;
      g.beginPath();
      g.moveTo(x, y);
      const n = 6 + ((r() * 8) | 0);
      for (let k = 0; k < n; k++) {
        x += (r() - 0.5) * 50;
        y += (r() - 0.2) * 38;
        g.lineTo(x, y);
      }
      g.stroke();
    }
    // vệt dầu
    blobs(g, S, S, r, 6, 14, 34, 'rgba(5,5,8,.4)', 'rgba(5,5,8,.4)');
    return finish(c, { repeat: [2.1, 20] });
  });
}

export function makePavement() {
  return once('pavement', () => {
    const S = 512;
    const n = 5;
    const t = S / n;
    const [c, g] = mk(S, S);
    const r = rng(23);
    g.fillStyle = '#5f5a53';
    g.fillRect(0, 0, S, S);
    const pal = ['#a9a095', '#b4aa9d', '#9f968b', '#bdb3a4', '#a39a8e', '#ada296'];
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const px = x * t + 1.5;
        const py = y * t + 1.5;
        const w = t - 3;
        g.fillStyle = pal[(r() * pal.length) | 0];
        g.fillRect(px, py, w, w);
        const gr = g.createLinearGradient(px, py, px + w, py + w);
        gr.addColorStop(0, 'rgba(255,255,255,.10)');
        gr.addColorStop(1, 'rgba(0,0,0,.10)');
        g.fillStyle = gr;
        g.fillRect(px, py, w, w);
        g.fillStyle = 'rgba(255,255,255,.22)';
        g.fillRect(px, py, w, 1.5);
        g.fillRect(px, py, 1.5, w);
        g.fillStyle = 'rgba(0,0,0,.18)';
        g.fillRect(px, py + w - 1.5, w, 1.5);
        g.fillRect(px + w - 1.5, py, 1.5, w);
        // hoa văn vòng tròn chìm ở bốn góc ô gạch (gạch lát vỉa hè đô thị)
        g.lineWidth = 1.4;
        for (const [ox, oy] of [[0.27, 0.27], [0.73, 0.27], [0.27, 0.73], [0.73, 0.73]]) {
          g.strokeStyle = 'rgba(0,0,0,.20)';
          g.beginPath();
          g.arc(px + w * ox, py + w * oy, w * 0.1, 0, 6.3);
          g.stroke();
          g.strokeStyle = 'rgba(255,255,255,.16)';
          g.beginPath();
          g.arc(px + w * ox + 0.8, py + w * oy + 0.8, w * 0.1, 0, 6.3);
          g.stroke();
        }
        if (r() < 0.12) {
          g.strokeStyle = 'rgba(40,36,30,.7)';
          g.lineWidth = 1;
          g.beginPath();
          g.moveTo(px + r() * w, py);
          g.lineTo(px + r() * w, py + w);
          g.stroke();
        }
      }
    }
    addNoise(g, S, S, 26, r);
    blobs(g, S, S, r, 26, 14, 60, 'rgba(40,32,22,.16)', 'rgba(255,245,230,.08)');
    // kẹo cao su, vết bẩn
    for (let i = 0; i < 14; i++) {
      g.fillStyle = 'rgba(48,44,40,.45)';
      g.beginPath();
      g.ellipse(r() * S, r() * S, 2 + r() * 3, 2 + r() * 3, r() * 3, 0, 6.3);
      g.fill();
    }
    return finish(c, { repeat: [1.5, 40] });
  });
}

/** Gạch dẫn hướng cho người khiếm thị: 'bars' (đi thẳng) hoặc 'dots' (cảnh báo). */
export function makeTactile(kind = 'bars') {
  return once('tactile-' + kind, () => {
    const W = 128;
    const H = 256;
    const [c, g] = mk(W, H);
    const r = rng(kind === 'bars' ? 5 : 6);
    g.fillStyle = '#dbb716';
    g.fillRect(0, 0, W, H);
    addNoise(g, W, H, 18, r);
    if (kind === 'bars') {
      for (let i = 0; i < 4; i++) {
        const x = 12 + i * 29;
        for (let y = 8; y < H; y += 128) {
          const grad = g.createLinearGradient(x, 0, x + 15, 0);
          grad.addColorStop(0, '#f1d33a');
          grad.addColorStop(0.5, '#e6c524');
          grad.addColorStop(1, '#a98a0b');
          g.fillStyle = grad;
          g.fillRect(x, y, 15, 112);
          g.fillStyle = 'rgba(0,0,0,.25)';
          g.fillRect(x + 15, y + 2, 3, 112);
        }
      }
    } else {
      for (let yy = 0; yy < 8; yy++) {
        for (let xx = 0; xx < 4; xx++) {
          const cx = 16 + xx * 32;
          const cy = 16 + yy * 32;
          const gr = g.createRadialGradient(cx - 3, cy - 3, 1, cx, cy, 11);
          gr.addColorStop(0, '#f6dc4a');
          gr.addColorStop(1, '#a98a0b');
          g.fillStyle = gr;
          g.beginPath();
          g.arc(cx, cy, 10, 0, 6.3);
          g.fill();
        }
      }
    }
    g.strokeStyle = 'rgba(70,55,0,.5)';
    g.lineWidth = 3;
    g.strokeRect(0, 0, W, H);
    blobs(g, W, H, r, 6, 10, 30, 'rgba(50,40,20,.25)', 'rgba(255,255,255,.08)');
    return finish(c, { repeat: [1, 1] });
  });
}

// ───────────────── Mặt tiền nhà phố ─────────────────

function drawWindow(g, cx, cy, w, h, kind, r, o) {
  const x = cx - w / 2;
  const y = cy - h / 2;
  // ô tường lõm
  g.fillStyle = 'rgba(0,0,0,.22)';
  g.fillRect(x - 8, y - 8, w + 16, h + 16);
  // kính + phòng bên trong
  const gl = g.createLinearGradient(x, y, x, y + h);
  gl.addColorStop(0, '#7f9aaa');
  gl.addColorStop(0.45, '#4d6270');
  gl.addColorStop(1, '#27323b');
  g.fillStyle = gl;
  g.fillRect(x, y, w, h);
  // rèm
  if (r() < 0.65) {
    g.fillStyle = ['rgba(236,226,206,.78)', 'rgba(205,120,100,.7)', 'rgba(130,160,185,.7)', 'rgba(240,240,236,.8)'][(r() * 4) | 0];
    const cw = w * (0.3 + r() * 0.5);
    g.fillRect(x, y, cw, h * (0.5 + r() * 0.5));
  }
  // phản chiếu bầu trời
  g.fillStyle = 'rgba(255,255,255,.13)';
  g.beginPath();
  g.moveTo(x, y + h * 0.7);
  g.lineTo(x + w * 0.6, y);
  g.lineTo(x + w * 0.85, y);
  g.lineTo(x, y + h);
  g.fill();
  // bóng đổ phía trên
  const sh = g.createLinearGradient(x, y, x, y + 26);
  sh.addColorStop(0, 'rgba(0,0,0,.45)');
  sh.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = sh;
  g.fillRect(x, y, w, 26);
  // khung
  g.strokeStyle = o.frame;
  g.lineWidth = 7;
  g.strokeRect(x, y, w, h);
  g.lineWidth = 4;
  g.beginPath();
  g.moveTo(cx, y);
  g.lineTo(cx, y + h);
  g.moveTo(x, y + h * 0.42);
  g.lineTo(x + w, y + h * 0.42);
  g.stroke();

  if (kind === 'shutters') {
    const sw = w * 0.5;
    for (const side of [-1, 1]) {
      const sx = side < 0 ? x - sw + 4 : x + w - 4;
      g.fillStyle = o.shutter;
      g.fillRect(sx, y - 4, sw, h + 8);
      g.strokeStyle = 'rgba(0,0,0,.35)';
      g.lineWidth = 1.6;
      for (let ly = y; ly < y + h + 6; ly += 7) {
        g.beginPath();
        g.moveTo(sx, ly);
        g.lineTo(sx + sw, ly);
        g.stroke();
      }
      g.strokeStyle = 'rgba(0,0,0,.5)';
      g.lineWidth = 3;
      g.strokeRect(sx, y - 4, sw, h + 8);
    }
  } else if (kind === 'cage') {
    // chuồng cọp — lưới sắt chống trộm
    g.strokeStyle = '#2b2c2e';
    g.lineWidth = 3.2;
    for (let bx = x - 10; bx <= x + w + 10; bx += 13) {
      g.beginPath();
      g.moveTo(bx, y - 12);
      g.lineTo(bx, y + h + 14);
      g.stroke();
    }
    g.lineWidth = 4;
    for (const by of [y - 12, y + h * 0.5, y + h + 14]) {
      g.beginPath();
      g.moveTo(x - 10, by);
      g.lineTo(x + w + 10, by);
      g.stroke();
    }
    g.fillStyle = 'rgba(255,255,255,.08)';
    g.fillRect(x - 10, y - 12, 6, h + 26);
  }
  // bệ cửa sổ
  g.fillStyle = o.sill;
  g.fillRect(x - 12, y + h + 6, w + 24, 10);
  g.fillStyle = 'rgba(0,0,0,.3)';
  g.fillRect(x - 12, y + h + 16, w + 24, 4);
  // vệt nước mưa
  const st = g.createLinearGradient(0, y + h + 16, 0, y + h + 150);
  st.addColorStop(0, 'rgba(40,32,20,.20)');
  st.addColorStop(1, 'rgba(40,32,20,0)');
  g.fillStyle = st;
  g.fillRect(x - 4, y + h + 16, w + 8, 134);
  // máy lạnh
  if (r() < 0.4) {
    const ax = r() < 0.5 ? x - 70 : x + w + 14;
    const ay = y + 12;
    g.fillStyle = '#e8e8e4';
    g.fillRect(ax, ay, 58, 38);
    g.fillStyle = '#9fa4a6';
    for (let k = 0; k < 4; k++) g.fillRect(ax + 6, ay + 8 + k * 7, 34, 2.2);
    g.fillStyle = 'rgba(0,0,0,.35)';
    g.fillRect(ax, ay + 38, 58, 4);
    g.fillStyle = 'rgba(30,30,25,.30)';
    g.fillRect(ax + 12, ay + 42, 8, 90);
  }
}

function drawBalconyDoor(g, cx, cy, w, h, r, o) {
  const x = cx - w / 2;
  const y = cy - h / 2;
  g.fillStyle = 'rgba(0,0,0,.25)';
  g.fillRect(x - 8, y - 8, w + 16, h + 16);
  const gl = g.createLinearGradient(x, y, x, y + h);
  gl.addColorStop(0, '#85a1b1');
  gl.addColorStop(1, '#2b3943');
  g.fillStyle = gl;
  g.fillRect(x, y, w, h);
  if (r() < 0.6) {
    g.fillStyle = 'rgba(232,222,200,.72)';
    g.fillRect(x, y, w * (0.35 + r() * 0.45), h);
  }
  g.strokeStyle = o.frame;
  g.lineWidth = 7;
  g.strokeRect(x, y, w, h);
  g.beginPath();
  g.moveTo(cx, y);
  g.lineTo(cx, y + h);
  g.stroke();
  // lan can
  const ry = y + h * 0.5;
  g.fillStyle = 'rgba(0,0,0,.18)';
  g.fillRect(x - 40, ry, w + 80, h * 0.5 + 18);
  g.strokeStyle = o.rail;
  g.lineWidth = 3;
  for (let bx = x - 38; bx <= x + w + 38; bx += 11) {
    g.beginPath();
    g.moveTo(bx, ry);
    g.lineTo(bx, y + h + 14);
    g.stroke();
  }
  g.lineWidth = 6;
  g.beginPath();
  g.moveTo(x - 42, ry);
  g.lineTo(x + w + 42, ry);
  g.moveTo(x - 42, y + h + 14);
  g.lineTo(x + w + 42, y + h + 14);
  g.stroke();
  // chậu cây
  if (r() < 0.7) {
    const px = x - 22 + r() * (w + 44);
    g.fillStyle = '#9a5a36';
    g.fillRect(px - 14, ry - 12, 28, 14);
    for (let k = 0; k < 9; k++) {
      g.fillStyle = ['#2d6a2c', '#3b7d33', '#4c9140'][(r() * 3) | 0];
      g.beginPath();
      g.arc(px + (r() - 0.5) * 34, ry - 22 - r() * 24, 7 + r() * 8, 0, 6.3);
      g.fill();
    }
  }
  // quần áo phơi
  if (r() < 0.45) {
    g.strokeStyle = '#555';
    g.lineWidth = 1.5;
    const ly = y + 6;
    g.beginPath();
    g.moveTo(x - 36, ly);
    g.lineTo(x + w + 36, ly);
    g.stroke();
    let px = x - 28;
    while (px < x + w + 20) {
      g.fillStyle = ['#e9e4d8', '#c2483d', '#3a6ea5', '#e8c34a', '#79a56b'][(r() * 5) | 0];
      const cw = 14 + r() * 14;
      g.fillRect(px, ly, cw, 30 + r() * 26);
      px += cw + 6;
    }
  }
}

/** Mặt tiền các tầng trên: texture cao `floors * 3.1 m`. */
export function makeFacade(opt, seed) {
  const { floors = 3, color = '#e6d7b4', trim = '#f0eadc', style = 'shutters', shutter = '#35603f', rail = '#343639', sill = '#cfc7b6', width = 4.2 } = opt;
  const cols = opt.cols ?? Math.max(2, Math.round(width / 2.1));
  const K = 0.75; // độ phân giải: 0.75 * 122 px/m
  const W = Math.round(width * 122); // toạ độ thiết kế (122 px / mét)
  const FH = 380;
  const H = FH * floors;
  const [c, g] = mk(Math.round(W * K), Math.round(H * K));
  g.scale(K, K);
  const r = rng(seed);
  g.fillStyle = color;
  g.fillRect(0, 0, W, H);
  addNoise(g, c.width, c.height, 14, r);
  blobs(g, W, H, r, 46, 30, 130, 'rgba(60,50,35,.10)', 'rgba(255,250,235,.07)');
  const o = { frame: trim, shutter, rail, sill };

  for (let f = 0; f < floors; f++) {
    const y0 = H - (f + 1) * FH;
    // gờ chỉ ngăn tầng
    g.fillStyle = shade(color, -16);
    g.fillRect(0, y0 + FH - 20, W, 12);
    g.fillStyle = 'rgba(255,255,255,.18)';
    g.fillRect(0, y0 + FH - 20, W, 2);
    g.fillStyle = 'rgba(0,0,0,.30)';
    g.fillRect(0, y0 + FH - 8, W, 8);
    const cw = W / cols;
    for (let i = 0; i < cols; i++) {
      const cx = i * cw + cw / 2;
      const cy = y0 + FH * 0.48;
      const useBalcony = style === 'balcony' || (style === 'mixed' && f % 2 === 0 && i === 0);
      if (useBalcony) drawBalconyDoor(g, cx, cy, 124, 232, r, o);
      else drawWindow(g, cx, cy, 124, 196, style === 'mixed' ? (i % 2 ? 'cage' : 'shutters') : style, r, o);
    }
  }
  // mái đua / lan can mái
  g.fillStyle = shade(color, -12);
  g.fillRect(0, 0, W, 34);
  g.fillStyle = trim;
  g.fillRect(0, 34, W, 8);
  g.fillStyle = 'rgba(0,0,0,.28)';
  g.fillRect(0, 42, W, 10);
  // bám bẩn phía dưới
  const gr = g.createLinearGradient(0, H - 190, 0, H);
  gr.addColorStop(0, 'rgba(50,38,22,0)');
  gr.addColorStop(1, 'rgba(50,38,22,.30)');
  g.fillStyle = gr;
  g.fillRect(0, H - 190, W, 190);
  // rêu / vệt ố loang
  for (let i = 0; i < 16; i++) {
    const x = r() * W;
    const y = r() * H;
    const gg = g.createLinearGradient(x, y, x, y + 200 + r() * 200);
    gg.addColorStop(0, 'rgba(45,40,28,.12)');
    gg.addColorStop(1, 'rgba(45,40,28,0)');
    g.fillStyle = gg;
    g.fillRect(x, y, 10 + r() * 24, 400);
  }
  return finish(c);
}

/** Bên trong cửa hàng (thấy qua cửa mở). */
export function makeShopInterior(kind, seed) {
  const W = 512;
  const H = 384;
  const [c, g] = mk(W, H);
  const r = rng(seed);
  const pal = {
    grocery: ['#d94f3d', '#f2c230', '#3f8f4a', '#3b6fb6', '#e8e2d0', '#e07a2f'],
    pho: ['#c8b79a', '#a85a32', '#e8e2d0', '#6a8f4a'],
    cafe: ['#6b4a2f', '#c9a36a', '#e8e2d0', '#3f7c85'],
    pharmacy: ['#f1f3f2', '#2f9e5a', '#d6e8de', '#9ec9b2'],
    clothes: ['#d95078', '#4a7bd0', '#f2d24a', '#2f2f35', '#e8e2d0', '#62a35a'],
    phone: ['#2a6df4', '#f4f4f6', '#25252a', '#7a8bb5'],
    bakery: ['#d9a066', '#f2d4a0', '#8a5a2b', '#f6e6c8'],
    stationery: ['#e4572e', '#17bebb', '#ffc914', '#76b041', '#f4f4f6'],
    hair: ['#e7dfd3', '#2c2c32', '#b3485f', '#e8e2d0'],
    house: ['#7c6a58', '#5d4d3e', '#a8957f'],
  }[kind] || ['#bbb'];
  const wall = g.createLinearGradient(0, 0, 0, H);
  wall.addColorStop(0, '#3b3228');
  wall.addColorStop(1, '#6b5a47');
  g.fillStyle = wall;
  g.fillRect(0, 0, W, H);
  // đèn huỳnh quang
  for (const lx of [90, 300]) {
    const gl = g.createRadialGradient(lx + 50, 26, 4, lx + 50, 26, 170);
    gl.addColorStop(0, 'rgba(255,248,225,.60)');
    gl.addColorStop(1, 'rgba(255,248,225,0)');
    g.fillStyle = gl;
    g.fillRect(lx - 120, 0, 340, 230);
    g.fillStyle = '#fffdf2';
    g.fillRect(lx, 20, 100, 8);
  }
  // kệ hàng
  const rows = kind === 'pho' || kind === 'cafe' ? 2 : 4;
  for (let rr = 0; rr < rows; rr++) {
    const y = 56 + rr * 62;
    g.fillStyle = '#2a2420';
    g.fillRect(14, y + 48, W - 28, 6);
    let x = 20;
    while (x < W - 40) {
      const w = 14 + r() * 24;
      const h = 22 + r() * 30;
      g.fillStyle = pal[(r() * pal.length) | 0];
      g.fillRect(x, y + 48 - h, w, h);
      g.fillStyle = 'rgba(255,255,255,.22)';
      g.fillRect(x, y + 48 - h, 3, h);
      g.fillStyle = 'rgba(0,0,0,.2)';
      g.fillRect(x + w - 3, y + 48 - h, 3, h);
      x += w + 3 + r() * 5;
    }
  }
  // quầy
  const cy = H * 0.7;
  g.fillStyle = '#7b5a3a';
  g.fillRect(0, cy, W, H - cy);
  g.fillStyle = '#a07a52';
  g.fillRect(0, cy, W, 10);
  g.fillStyle = 'rgba(0,0,0,.28)';
  g.fillRect(0, cy + 10, W, 12);
  g.save();
  g.translate(0, cy + 14);
  speckle(g, W, 40, r, 40, pal, 5, 14, 0.9);
  g.restore();
  // chủ quán
  if (r() < 0.6) {
    const px = 120 + r() * 260;
    g.fillStyle = '#2d2a28';
    g.fillRect(px - 22, cy - 62, 44, 70);
    g.fillStyle = '#d8b090';
    g.beginPath();
    g.arc(px, cy - 78, 14, 0, 6.3);
    g.fill();
    g.fillStyle = '#1a1512';
    g.beginPath();
    g.arc(px, cy - 83, 14, 3.1, 6.3);
    g.fill();
  }
  if (kind === 'pho' || kind === 'cafe') {
    for (let k = 0; k < 3; k++) {
      g.fillStyle = k % 2 ? '#2b6cb0' : '#c0392b';
      g.fillRect(40 + k * 150, H - 54, 34, 26);
    }
  }
  addNoise(g, W, H, 16, r);
  const vg = g.createRadialGradient(W / 2, H / 2, 60, W / 2, H / 2, 330);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,.55)');
  g.fillStyle = vg;
  g.fillRect(0, 0, W, H);
  return finish(c);
}

export function makeSign(text, opt = {}) {
  const { bg = '#b3261e', fg = '#ffffff', accent = '#ffd23f', sub = '', pattern = 'none', w = 1024, h = 192 } = opt;
  const [c, g] = mk(w, h);
  const r = rng(text.length * 97 + 3);
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, shade(bg, 22));
  gr.addColorStop(1, shade(bg, -22));
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  if (pattern === 'stripes') {
    g.fillStyle = 'rgba(255,255,255,.07)';
    for (let x = -h; x < w; x += 44) {
      g.beginPath();
      g.moveTo(x, h);
      g.lineTo(x + 22, h);
      g.lineTo(x + 22 + h, 0);
      g.lineTo(x + h, 0);
      g.fill();
    }
  }
  g.strokeStyle = accent;
  g.lineWidth = 8;
  g.strokeRect(10, 10, w - 20, h - 20);
  g.strokeStyle = 'rgba(0,0,0,.35)';
  g.lineWidth = 2;
  g.strokeRect(20, 20, w - 40, h - 40);
  const hasSub = !!sub;
  let size = hasSub ? 92 : 110;
  const font = (s) => `800 ${s}px "Segoe UI", "Helvetica Neue", Roboto, Arial, "Noto Sans", sans-serif`;
  g.font = font(size);
  while (g.measureText(text).width > w - 120 && size > 30) {
    size -= 4;
    g.font = font(size);
  }
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  const ty = hasSub ? h * 0.42 : h * 0.52;
  g.fillStyle = 'rgba(0,0,0,.45)';
  g.fillText(text, w / 2 + 3, ty + 4);
  g.fillStyle = fg;
  g.fillText(text, w / 2, ty);
  if (hasSub) {
    g.font = `600 ${Math.round(size * 0.38)}px "Segoe UI", Roboto, Arial, sans-serif`;
    g.fillStyle = accent;
    g.fillText(sub, w / 2, h * 0.78);
  }
  // bụi, vệt ố theo năm tháng
  const id = g.getImageData(0, 0, w, h);
  const d = id.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (r() - 0.5) * 16;
    d[i] += n;
    d[i + 1] += n;
    d[i + 2] += n;
  }
  g.putImageData(id, 0, 0);
  const st = g.createLinearGradient(0, h * 0.6, 0, h);
  st.addColorStop(0, 'rgba(30,24,16,0)');
  st.addColorStop(1, 'rgba(30,24,16,.22)');
  g.fillStyle = st;
  g.fillRect(0, 0, w, h);
  return finish(c);
}

export function makeShutter() {
  return once('shutter', () => {
    const S = 256;
    const [c, g] = mk(S, S);
    const r = rng(41);
    g.fillStyle = '#8b8f95';
    g.fillRect(0, 0, S, S);
    for (let y = 0; y < S; y += 10) {
      const gr = g.createLinearGradient(0, y, 0, y + 10);
      gr.addColorStop(0, 'rgba(255,255,255,.28)');
      gr.addColorStop(0.55, 'rgba(0,0,0,0)');
      gr.addColorStop(1, 'rgba(0,0,0,.40)');
      g.fillStyle = gr;
      g.fillRect(0, y, S, 10);
    }
    addNoise(g, S, S, 22, r);
    blobs(g, S, S, r, 14, 12, 50, 'rgba(60,40,20,.20)', 'rgba(255,255,255,.07)');
    // viền trượt
    g.fillStyle = '#5a5e63';
    g.fillRect(0, 0, 10, S);
    g.fillRect(S - 10, 0, 10, S);
    return finish(c, { repeat: [1, 1] });
  });
}

export function makeBark() {
  return once('bark', () => {
    const W = 256;
    const H = 512;
    const [c, g] = mk(W, H);
    const r = rng(77);
    g.fillStyle = '#5d4a3b';
    g.fillRect(0, 0, W, H);
    for (let i = 0; i < 160; i++) {
      const x = r() * W;
      g.strokeStyle = r() < 0.5 ? 'rgba(25,18,12,.45)' : 'rgba(150,125,100,.22)';
      g.lineWidth = 1 + r() * 3;
      g.beginPath();
      g.moveTo(x, r() * H);
      let cx = x;
      let cy = r() * H;
      g.moveTo(cx, cy);
      for (let k = 0; k < 5; k++) {
        cx += (r() - 0.5) * 6;
        cy += 30 + r() * 50;
        g.lineTo(cx, cy);
      }
      g.stroke();
    }
    blobs(g, W, H, r, 12, 10, 40, 'rgba(70,95,50,.30)', 'rgba(255,255,255,.04)');
    addNoise(g, W, H, 26, r);
    return finish(c, { repeat: [2, 2] });
  });
}

/** Cụm lá có kênh alpha — dùng làm "billboard" lá cây. */
export function makeLeafCluster() {
  return once('leaf', () => {
    const S = 256;
    const [c, g] = mk(S, S);
    const r = rng(99);
    const greens = ['#2c5a26', '#35692b', '#427a31', '#4f8c38', '#5d9a40', '#2a4f24'];
    for (let i = 0; i < 46; i++) {
      const a = r() * 6.3;
      const dist = r() * 88;
      const x = S / 2 + Math.cos(a) * dist;
      const y = S / 2 + Math.sin(a) * dist;
      const len = 54 + r() * 34;
      const wid = 20 + r() * 12;
      g.save();
      g.translate(x, y);
      g.rotate(r() * 6.3);
      const col = greens[(r() * greens.length) | 0];
      const gr = g.createLinearGradient(0, -wid, 0, wid);
      gr.addColorStop(0, shade(col, 20));
      gr.addColorStop(1, shade(col, -18));
      g.fillStyle = gr;
      g.beginPath();
      g.moveTo(-len / 2, 0);
      g.quadraticCurveTo(0, -wid, len / 2, 0);
      g.quadraticCurveTo(0, wid, -len / 2, 0);
      g.fill();
      g.strokeStyle = 'rgba(190,220,140,.40)';
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(-len / 2, 0);
      g.lineTo(len / 2, 0);
      g.stroke();
      g.restore();
    }
    return finish(c);
  });
}

export function makeConcrete() {
  return once('concrete', () => {
    const W = 128;
    const H = 256;
    const [c, g] = mk(W, H);
    const r = rng(5);
    g.fillStyle = '#9a9892';
    g.fillRect(0, 0, W, H);
    addNoise(g, W, H, 34, r);
    blobs(g, W, H, r, 14, 10, 40, 'rgba(40,35,25,.25)', 'rgba(255,255,255,.08)');
    for (let i = 0; i < 10; i++) {
      g.fillStyle = 'rgba(70,60,45,.25)';
      g.fillRect(r() * W, 0, 2 + r() * 4, H);
    }
    // bảng dán quảng cáo cũ trên cột điện
    for (let i = 0; i < 4; i++) {
      g.fillStyle = ['#d9d4c3', '#c9c28a', '#a9c3d0'][(r() * 3) | 0];
      g.fillRect(8 + r() * 70, 90 + r() * 120, 24 + r() * 22, 20 + r() * 26);
    }
    return finish(c, { repeat: [1, 1] });
  });
}

export function makePlaster(color, seed) {
  const S = 256;
  const [c, g] = mk(S, S);
  const r = rng(seed);
  g.fillStyle = color;
  g.fillRect(0, 0, S, S);
  addNoise(g, S, S, 16, r);
  blobs(g, S, S, r, 22, 20, 90, 'rgba(60,50,35,.12)', 'rgba(255,250,235,.07)');
  return finish(c, { repeat: [3, 3] });
}

/** Lan can ban công: nền trong suốt (alphaTest). */
export function makeRailing() {
  return once('railing', () => {
    const W = 256;
    const H = 64;
    const [c, g] = mk(W, H);
    g.clearRect(0, 0, W, H);
    g.fillStyle = '#3a3d40';
    g.fillRect(0, 2, W, 7);
    g.fillRect(0, H - 9, W, 7);
    for (let x = 6; x < W; x += 14) g.fillRect(x, 6, 4, H - 10);
    for (let x = 6; x < W; x += 14 * 4) {
      g.beginPath();
      g.arc(x + 2, H / 2, 6, 0, 6.3);
      g.fill();
    }
    return finish(c);
  });
}

export function makeGrille() {
  return once('grille', () => {
    const [c, g] = mk(128, 96);
    g.fillStyle = '#e4e4df';
    g.fillRect(0, 0, 128, 96);
    g.fillStyle = '#a8adaf';
    for (let y = 14; y < 90; y += 11) g.fillRect(8, y, 112, 3.5);
    g.fillStyle = 'rgba(0,0,0,.18)';
    g.fillRect(0, 88, 128, 8);
    g.fillStyle = '#7ac27a';
    g.fillRect(104, 6, 8, 4);
    return finish(c);
  });
}

/** Hoạ tiết xe đẩy bánh mì / biển quảng cáo A-frame. */
export function makeBoardTexture(lines, bg = '#1f3b2d', fg = '#f6f1de') {
  const w = 256;
  const h = 384;
  const [c, g] = mk(w, h);
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(255,255,255,.55)';
  g.lineWidth = 6;
  g.strokeRect(10, 10, w - 20, h - 20);
  g.fillStyle = fg;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  lines.forEach((ln, i) => {
    g.font = `${ln.bold ? 800 : 600} ${ln.size}px "Segoe UI", Roboto, Arial, sans-serif`;
    g.fillText(ln.t, w / 2, ln.y ?? 60 + i * 70);
  });
  return finish(c);
}

/** Mái hiên bạt sọc. */
export function makeAwning(c1 = '#c0392b', c2 = '#f3ece0') {
  const [c, g] = mk(128, 128);
  for (let i = 0; i < 8; i++) {
    g.fillStyle = i % 2 ? c2 : c1;
    g.fillRect(i * 16, 0, 16, 128);
  }
  const sh = g.createLinearGradient(0, 0, 0, 128);
  sh.addColorStop(0, 'rgba(255,255,255,.12)');
  sh.addColorStop(1, 'rgba(0,0,0,.22)');
  g.fillStyle = sh;
  g.fillRect(0, 0, 128, 128);
  addNoise(g, 128, 128, 14, rng(8));
  return finish(c);
}

/** Cờ đỏ sao vàng. */
export function makeFlag() {
  return once('flag', () => {
    const [c, g] = mk(192, 128);
    g.fillStyle = '#da251d';
    g.fillRect(0, 0, 192, 128);
    g.fillStyle = '#ffde00';
    g.beginPath();
    const cx = 96;
    const cy = 66;
    for (let i = 0; i < 10; i++) {
      const rad = i % 2 ? 15 : 38;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      g.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad);
    }
    g.closePath();
    g.fill();
    const sh = g.createLinearGradient(0, 0, 192, 0);
    sh.addColorStop(0, 'rgba(0,0,0,.18)');
    sh.addColorStop(0.5, 'rgba(255,255,255,.08)');
    sh.addColorStop(1, 'rgba(0,0,0,.2)');
    g.fillStyle = sh;
    g.fillRect(0, 0, 192, 128);
    return finish(c);
  });
}


// ───────────────── Vật thể đường phố theo ảnh thực tế ─────────────────

/** Tủ điện / tủ kỹ thuật xám đặt trên vỉa hè, có nhãn dán và vết bẩn. */
export function makeCabinetTexture() {
  return once('cabinet', () => {
    const w = 256;
    const h = 384;
    const [c, g] = mk(w, h);
    const r = rng(404);
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#c4cabb');
    gr.addColorStop(1, '#a9afa0');
    g.fillStyle = gr;
    g.fillRect(0, 0, w, h);
    // khe cửa + tay nắm
    g.strokeStyle = 'rgba(40,44,38,.55)';
    g.lineWidth = 3;
    g.strokeRect(10, 12, w - 20, h - 26);
    g.beginPath();
    g.moveTo(w / 2, 12);
    g.lineTo(w / 2, h - 14);
    g.stroke();
    g.fillStyle = '#4a4d48';
    g.fillRect(w / 2 - 16, h * 0.5, 7, 34);
    g.fillRect(w / 2 + 9, h * 0.5, 7, 34);
    // nhãn cảnh báo
    g.fillStyle = '#f4f2e6';
    g.fillRect(34, 56, 80, 54);
    g.fillStyle = '#2b2b2b';
    g.font = '700 11px "Segoe UI", Arial, sans-serif';
    g.textAlign = 'left';
    g.fillText('TỦ ĐIỆN', 40, 74);
    g.font = '500 9px "Segoe UI", Arial, sans-serif';
    g.fillText('Không tự ý mở', 40, 88);
    g.fillText('Liên hệ: 1900 xxxx', 40, 100);
    g.fillStyle = '#e3b400';
    g.beginPath();
    g.moveTo(166, 62);
    g.lineTo(196, 112);
    g.lineTo(136, 112);
    g.closePath();
    g.fill();
    g.fillStyle = '#1b1b1b';
    g.font = '800 26px "Segoe UI", Arial, sans-serif';
    g.textAlign = 'center';
    g.fillText('!', 166, 106);
    // tờ rơi dán, vết bẩn, gỉ chân tủ
    for (let i = 0; i < 4; i++) {
      g.fillStyle = ['#e9e6dc', '#d9d6ca', '#e3dcc0'][i % 3];
      g.fillRect(24 + r() * 160, 150 + r() * 160, 26 + r() * 30, 22 + r() * 30);
    }
    blobs(g, w, h, r, 22, 14, 52, 'rgba(60,52,40,.22)', 'rgba(255,255,255,.08)');
    const rust = g.createLinearGradient(0, h * 0.82, 0, h);
    rust.addColorStop(0, 'rgba(110,70,40,0)');
    rust.addColorStop(1, 'rgba(110,70,40,.38)');
    g.fillStyle = rust;
    g.fillRect(0, h * 0.8, w, h * 0.2);
    addNoise(g, w, h, 14, r);
    return finish(c);
  });
}

/** Cọc tiêu sơn đỏ – trắng (lặp theo chiều dọc). */
export function makeStripeTexture() {
  return once('stripes', () => {
    const [c, g] = mk(32, 128);
    for (let i = 0; i < 4; i++) {
      g.fillStyle = i % 2 ? '#f1eee6' : '#c8261f';
      g.fillRect(0, i * 32, 32, 32);
    }
    addNoise(g, 32, 128, 16, rng(31));
    const t = finish(c, { repeat: [1, 1] });
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  });
}

/** Biển báo giao thông: 'nopark' (cấm dừng, đỗ — tròn xanh viền đỏ gạch chéo) hoặc 'crossing' (người đi bộ sang ngang). */
export function makeRoadSign(kind) {
  return once('roadsign-' + kind, () => {
    const S = 256;
    const [c, g] = mk(S, S);
    g.clearRect(0, 0, S, S);
    if (kind === 'nopark') {
      g.fillStyle = '#e9e7de';
      g.beginPath();
      g.arc(S / 2, S / 2, 124, 0, 6.3);
      g.fill();
      g.fillStyle = '#d4231d';
      g.beginPath();
      g.arc(S / 2, S / 2, 118, 0, 6.3);
      g.fill();
      g.fillStyle = '#1560bd';
      g.beginPath();
      g.arc(S / 2, S / 2, 92, 0, 6.3);
      g.fill();
      g.strokeStyle = '#d4231d';
      g.lineWidth = 18;
      g.lineCap = 'butt';
      g.beginPath();
      g.moveTo(S / 2 - 66, S / 2 - 66);
      g.lineTo(S / 2 + 66, S / 2 + 66);
      g.moveTo(S / 2 + 66, S / 2 - 66);
      g.lineTo(S / 2 - 66, S / 2 + 66);
      g.stroke();
    } else {
      g.fillStyle = '#e9e7de';
      g.fillRect(6, 6, S - 12, S - 12);
      g.fillStyle = '#1560bd';
      g.fillRect(16, 16, S - 32, S - 32);
      g.fillStyle = '#f4f2e8';
      g.beginPath();
      g.moveTo(S / 2, 44);
      g.lineTo(S - 44, S - 54);
      g.lineTo(44, S - 54);
      g.closePath();
      g.fill();
      g.fillStyle = '#16233d';
      // người đi bộ đơn giản
      g.beginPath();
      g.arc(S / 2 + 2, 98, 10, 0, 6.3);
      g.fill();
      g.lineWidth = 9;
      g.lineCap = 'round';
      g.strokeStyle = '#16233d';
      g.beginPath();
      g.moveTo(S / 2 + 2, 110);
      g.lineTo(S / 2, 150);
      g.lineTo(S / 2 - 16, 184);
      g.moveTo(S / 2, 150);
      g.lineTo(S / 2 + 16, 184);
      g.moveTo(S / 2 + 2, 124);
      g.lineTo(S / 2 - 18, 142);
      g.moveTo(S / 2 + 2, 124);
      g.lineTo(S / 2 + 20, 140);
      g.stroke();
    }
    addNoise(g, S, S, 8, rng(77));
    return finish(c);
  });
}

/** Biển trạm dừng xe buýt (xanh dương, biểu tượng xe buýt). */
export function makeBusStopSign() {
  return once('busstop', () => {
    const w = 256;
    const h = 320;
    const [c, g] = mk(w, h);
    g.fillStyle = '#e7eaee';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#1456b0';
    g.fillRect(10, 10, w - 20, h - 20);
    g.fillStyle = '#f4f6f8';
    g.fillRect(24, 24, w - 48, 120);
    // xe buýt
    g.fillStyle = '#1456b0';
    g.beginPath();
    g.moveTo(52, 118);
    g.lineTo(52, 62);
    g.quadraticCurveTo(52, 48, 66, 48);
    g.lineTo(190, 48);
    g.quadraticCurveTo(204, 48, 204, 62);
    g.lineTo(204, 118);
    g.closePath();
    g.fill();
    g.fillStyle = '#f4f6f8';
    for (let i = 0; i < 4; i++) g.fillRect(62 + i * 34, 58, 28, 26);
    g.fillRect(62, 92, 132, 8);
    g.fillStyle = '#1456b0';
    for (const x of [82, 174]) {
      g.beginPath();
      g.arc(x, 122, 14, 0, 6.3);
      g.fill();
      g.fillStyle = '#f4f6f8';
      g.beginPath();
      g.arc(x, 122, 6, 0, 6.3);
      g.fill();
      g.fillStyle = '#1456b0';
    }
    g.fillStyle = '#f4f6f8';
    g.textAlign = 'center';
    g.font = '800 27px "Segoe UI", Arial, sans-serif';
    g.fillText('ĐIỂM DỪNG', w / 2, 192);
    g.fillText('XE BUÝT', w / 2, 224);
    g.font = '700 22px "Segoe UI", Arial, sans-serif';
    g.fillStyle = '#cfe0f7';
    g.fillText('BUS STOP', w / 2, 262);
    addNoise(g, w, h, 10, rng(88));
    return finish(c);
  });
}

/** Biển hiệu dọc nhô ra khỏi mặt tiền (mỗi dòng một từ). */
export function makeVerticalSign(words, { bg = '#d4a017', fg = '#b3261e', accent = '#ffffff' } = {}) {
  const w = 128;
  const h = 384;
  const [c, g] = mk(w, h);
  const r = rng(words.join('').length * 31 + 5);
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, shade(bg, 18));
  gr.addColorStop(1, shade(bg, -14));
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  g.strokeStyle = accent;
  g.lineWidth = 6;
  g.strokeRect(6, 6, w - 12, h - 12);
  const lines = words.slice(0, 4);
  const lh = (h - 40) / lines.length;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  lines.forEach((t, i) => {
    let size = 64;
    g.font = `800 ${size}px "Segoe UI", Arial, sans-serif`;
    while (g.measureText(t).width > w - 26 && size > 18) {
      size -= 3;
      g.font = `800 ${size}px "Segoe UI", Arial, sans-serif`;
    }
    g.fillStyle = 'rgba(0,0,0,.25)';
    g.fillText(t, w / 2 + 2, 20 + lh * (i + 0.5) + 2);
    g.fillStyle = fg;
    g.fillText(t, w / 2, 20 + lh * (i + 0.5));
  });
  addNoise(g, w, h, 12, r);
  return finish(c);
}

/** Vách tôn công trình sơn xanh – vàng (như ảnh trạm xe buýt). */
export function makeHoarding() {
  return once('hoarding', () => {
    const w = 512;
    const h = 256;
    const [c, g] = mk(w, h);
    const r = rng(612);
    g.fillStyle = '#a9bccc';
    g.fillRect(0, 0, w, h);
    // khối màu hình học
    g.fillStyle = '#7fb6cf';
    g.fillRect(150, 0, 200, 150);
    g.fillStyle = '#e6b43a';
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(190, 0);
    g.lineTo(0, 120);
    g.closePath();
    g.fill();
    g.fillStyle = '#d98f2f';
    g.fillRect(300, 150, 212, 38);
    g.fillStyle = '#e9e4d6';
    g.fillRect(0, 176, w, 80);
    // tấm tôn dựng đứng
    g.strokeStyle = 'rgba(30,40,50,.28)';
    g.lineWidth = 2;
    for (let x = 0; x <= w; x += 32) {
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x, h);
      g.stroke();
      g.strokeStyle = 'rgba(255,255,255,.18)';
      g.beginPath();
      g.moveTo(x + 3, 0);
      g.lineTo(x + 3, h);
      g.stroke();
      g.strokeStyle = 'rgba(30,40,50,.28)';
    }
    // bụi bẩn chân tường, vết dán
    const dirt = g.createLinearGradient(0, h * 0.7, 0, h);
    dirt.addColorStop(0, 'rgba(70,60,50,0)');
    dirt.addColorStop(1, 'rgba(70,60,50,.35)');
    g.fillStyle = dirt;
    g.fillRect(0, h * 0.7, w, h * 0.3);
    for (let i = 0; i < 9; i++) {
      g.fillStyle = ['#ece8da', '#dcd6c4', '#c9c4b2'][i % 3];
      g.fillRect(r() * w, r() * h * 0.7, 20 + r() * 40, 24 + r() * 50);
    }
    blobs(g, w, h, r, 18, 20, 70, 'rgba(60,52,40,.18)', 'rgba(255,255,255,.1)');
    addNoise(g, w, h, 12, r);
    return finish(c);
  });
}
