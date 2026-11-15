// Gọi tên màu bằng tiếng Việt từ mã màu — dùng cho "Nhận diện màu sắc" và mô tả biển hiệu.

function hexToHsl(hex) {
  const n = parseInt(String(hex).replace('#', '').padStart(6, '0').slice(-6), 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d > 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s, l };
}

export function colorName(hex) {
  const { h, s, l } = hexToHsl(hex);
  if (l < 0.1) return 'đen';
  if (l > 0.93 && s < 0.3) return 'trắng';
  if (s < 0.1) {
    if (l < 0.3) return 'xám đậm';
    if (l < 0.72) return 'xám';
    return 'xám nhạt';
  }
  let base;
  if (h < 15 || h >= 345) base = 'đỏ';
  else if (h < 42) base = l < 0.42 && s > 0.25 ? 'nâu' : 'cam';
  else if (h < 68) base = l < 0.38 ? 'nâu vàng' : 'vàng';
  else if (h < 160) base = 'xanh lá';
  else if (h < 200) base = 'xanh ngọc';
  else if (h < 255) base = 'xanh dương';
  else if (h < 295) base = 'tím';
  else base = l > 0.5 ? 'hồng' : 'tím đậm';
  if (base === 'nâu' || base === 'nâu vàng') return base;
  if (l < 0.3) return base + ' đậm';
  if (l > 0.78) return base + ' nhạt';
  return base;
}
