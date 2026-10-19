(async () => {
  document.documentElement.style.scrollBehavior = 'auto';
  for (let y = 0; y < document.documentElement.scrollHeight; y += 500) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
  await new Promise(r => setTimeout(r, 1500));
  document.querySelectorAll('[class*="pending"]').forEach(e => [...e.classList].forEach(c => c.includes('pending') && e.classList.remove(c)));
  const parse = s => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p[3] ?? 1 }; };
  const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const hue = c => { const r = c.r / 255, g = c.g / 255, b = c.b / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; if (d < 0.12) return null; let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; if (h < 0) h += 360; return h; };
  const offHue = c => { const h = hue(c); return h !== null && c.a > 0.15 && !(h >= 38 && h <= 62); };
  const bgOf = el => { for (let e = el; e; e = e.parentElement) { const s = getComputedStyle(e); if (s.backgroundImage !== 'none' && !s.backgroundImage.includes('linear-gradient(rgba(21') && !s.backgroundImage.includes('radial-gradient(circle at 4')) return { img: true, el: e }; const c = parse(s.backgroundColor); if (c && c.a > 0.85) return { c, el: e }; } return { c: { r: 255, g: 248, b: 214, a: 1 } }; };
  const low = [], off = new Map(), italic = new Set();
  document.querySelectorAll('main *, footer *, header *').forEach(el => {
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) return;
    const r = el.getBoundingClientRect(); if (!r.width || !r.height) return;
    for (const p of ['color', 'backgroundColor', 'borderTopColor']) { const c = parse(s[p]); if (c && offHue(c) && !(p === 'borderTopColor' && parseFloat(s.borderTopWidth) === 0)) off.set(`${el.tagName}.${[...el.classList].slice(0, 2).join('.')} ${p} ${s[p]}`, 1); }
    if (/gradient/.test(s.backgroundImage) && /rgb\((?!21|255, 2|227|201|246|255, 255)/.test(s.backgroundImage)) off.set(`${el.tagName}.${[...el.classList].slice(0, 2).join('.')} bgimg ${s.backgroundImage.slice(0, 90)}`, 1);
    const text = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    if (!text) return;
    if (s.fontStyle === 'italic') italic.add(`${el.tagName}.${el.className}`);
    const fg = parse(s.color); const bg = bgOf(el);
    if (bg.img || !fg) return;
    const ratio = contrast(fg, bg.c); const large = parseFloat(s.fontSize) >= 24 || (parseFloat(s.fontSize) >= 18.6 && +s.fontWeight >= 700);
    if (ratio < (large ? 3 : 4.5)) low.push(`${ratio.toFixed(2)} ${el.tagName}.${[...el.classList].slice(0, 2).join('.')} "${el.textContent.trim().slice(0, 30)}" ${s.color} on ${bg.el?.className?.toString().slice(0, 30)}`);
  });
  const fonts = new Set([...document.querySelectorAll('main *')].map(e => getComputedStyle(e).fontFamily.split(',')[0]));
  return { path: location.pathname, low: low.slice(0, 25), lowCount: low.length, off: [...off.keys()].slice(0, 30), offCount: off.size, italic: [...italic].slice(0, 10), fonts: [...fonts] };
})()
