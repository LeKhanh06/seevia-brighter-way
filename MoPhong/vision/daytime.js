// Bầu trời và ánh sáng theo giờ thật của máy: sáng / trưa / chiều / tối.
// Ảnh trời 360° (HDRI) từ Poly Haven, giấy phép CC0: polyhaven.com
//   sáng  rustig_koppie_puresky · trưa kloofendal_48d_partly_cloudy_puresky
//   chiều belfast_sunset_puresky · tối  qwantani_night_puresky
// Mỗi lần chỉ tải ảnh của buổi đang dùng. Đổi buổi thì ánh sáng chuyển dần trong ~2 giây.

import * as THREE from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { SUN_DIR } from './environment.js';

const SKY = (name) => new URL(`../sky/${name}.hdr`, import.meta.url).href;

/** Thông số ánh sáng mỗi buổi. sun/hemi: cường độ; fog: mật độ sương; exposure: phơi sáng của renderer. */
export const PERIODS = {
  sang: { label: 'Buổi sáng', file: 'sang', sun: 4.6, sunColor: '#ffe2b8', hemi: 0.95, hemiSky: '#d6e6fa', hemiGround: '#9a8468', bounce: 0.8, fog: '#dbe6f2', fogDensity: 0.0078, exposure: 0.92, env: 0.6, bg: 1.0, night: 0 },
  trua: { label: 'Buổi trưa', file: 'trua', sun: 5.6, sunColor: '#fff4e2', hemi: 1.1, hemiSky: '#e2eefc', hemiGround: '#a08d72', bounce: 0.95, fog: '#e4ecf4', fogDensity: 0.0068, exposure: 0.88, env: 0.65, bg: 1.0, night: 0 },
  chieu: { label: 'Buổi chiều', file: 'chieu', sun: 3.4, sunColor: '#ffb27a', hemi: 0.75, hemiSky: '#d9c6dc', hemiGround: '#8a6a58', bounce: 0.7, fog: '#d8c4cc', fogDensity: 0.0085, exposure: 0.95, env: 0.55, bg: 1.0, night: 0.25 },
  toi: { label: 'Buổi tối', file: 'toi', sun: 0.0, sunColor: '#9fb4ff', hemi: 0.16, hemiSky: '#34406e', hemiGround: '#1e1a24', bounce: 0.06, fog: '#141829', fogDensity: 0.012, exposure: 0.85, env: 0.07, bg: 0.22, night: 1 },
};

/** Buổi theo giờ của máy. */
export function periodForHour(h) {
  if (h >= 6 && h < 10) return 'sang';
  if (h >= 10 && h < 15) return 'trua';
  if (h >= 15 && h < 18.5) return 'chieu';
  return 'toi';
}

/** Tìm hướng ngang (azimuth) của điểm sáng nhất trong ảnh trời: đó là mặt trời/mặt trăng. */
function brightestAzimuth(tex) {
  const { data, width, height } = tex.image;
  if (!data) return null;
  let best = -1, bx = 0;
  // chỉ xét nửa trên (bầu trời), bước 2 px cho nhanh
  for (let y = 0; y < height / 2; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const i = (y * width + x) * 4;
      const l = data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722;
      if (l > best) { best = l; bx = x; }
    }
  }
  // equirect: u=0.5 nhìn về -Z trong three.js; azimuth đo từ +X ngược chiều kim đồng hồ quanh trục Y
  const u = bx / width;
  return (u - 0.5) * Math.PI * 2;
}

export class Daytime {
  constructor(renderer, scene, lights, sky) {
    this.renderer = renderer;
    this.scene = scene;
    this.lights = lights;
    this.sky = sky;                  // bầu trời vẽ bằng shader: dự phòng khi chưa tải được ảnh
    this.pmrem = new THREE.PMREMGenerator(renderer);
    this.loader = new RGBELoader().setDataType(THREE.FloatType);
    this.cache = new Map();          // tên buổi -> { bg, env }
    this.current = null;
    this.from = null;
    this.to = null;
    this.t = 1;                      // 0…1 tiến độ chuyển buổi
    this.night = 0;                  // 0 ngày … 1 đêm (đèn đường, biển hiệu… đọc giá trị này)
    this.onNight = null;
    this._c1 = new THREE.Color();
    this._c2 = new THREE.Color();
    this._watch = 0;
  }

  async _load(name) {
    if (this.cache.has(name)) return this.cache.get(name);
    const tex = await this.loader.loadAsync(SKY(PERIODS[name].file));
    tex.mapping = THREE.EquirectangularReflectionMapping;
    const az = brightestAzimuth(tex);
    const env = this.pmrem.fromEquirectangular(tex).texture;
    // Xoay ảnh trời để nguồn sáng trong ảnh trùng hướng nắng đổ bóng của cảnh (SUN_DIR)
    const sunAz = Math.atan2(-SUN_DIR.x, -SUN_DIR.z);
    const rot = az == null ? 0 : sunAz + az;
    const entry = { bg: tex, env, rot };
    this.cache.set(name, entry);
    return entry;
  }

  /** Chọn buổi theo giờ máy và theo dõi để tự đổi khi sang buổi mới. */
  async start() {
    await this.set(periodForHour(this._hour()), { instant: true });
    this._watch = setInterval(() => {
      const p = periodForHour(this._hour());
      if (p !== this.current) this.set(p);
    }, 60 * 1000);
  }

  _hour() {
    const d = new Date();
    return d.getHours() + d.getMinutes() / 60;
  }

  async set(name, { instant = false } = {}) {
    if (!PERIODS[name]) return;
    let entry = null;
    try { entry = await this._load(name); }
    catch (err) { console.warn('Không tải được ảnh trời, dùng bầu trời mặc định.', err); }
    this.from = this._snapshot();
    this.to = { ...PERIODS[name], entry };
    this.current = name;
    this.t = instant ? 1 : 0;
    this._swapped = false;
    if (instant) this._apply(1);
  }

  _snapshot() {
    const L = this.lights;
    return {
      sun: L.sun.intensity, sunColor: '#' + L.sun.color.getHexString(),
      hemi: L.hemi.intensity, hemiSky: '#' + L.hemi.color.getHexString(), hemiGround: '#' + L.hemi.groundColor.getHexString(),
      bounce: L.bounce.intensity,
      fog: '#' + (this.scene.fog?.color.getHexString() ?? 'dfe6ea'), fogDensity: this.scene.fog?.density ?? 0.0088,
      exposure: this.renderer.toneMappingExposure,
      env: this.scene.environmentIntensity ?? 0.55,
      bg: this.scene.backgroundIntensity ?? 1,
      night: this.night,
    };
  }

  /**
   * Ban đêm: vật liệu "tự sáng" để trông rõ dưới nắng (lá cây) thì tắt dần,
   * còn nguồn sáng thật (đèn đường, đèn xe, đèn tường, biển hiệu, lòng tiệm) thì sáng lên.
   */
  _nightMaterials(n) {
    if (!this._mats) {
      this._mats = [];
      const seen = new Set();
      this.scene.traverse((o) => {
        if (!o.isMesh) return;
        for (const m of [].concat(o.material)) {
          if (!m || m.userData.ownLight || seen.has(m) || !m.emissive || m.emissiveIntensity === undefined) continue;
          seen.add(m);
          const c = m.emissive;
          const lum = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
          if (lum < 0.01) continue;                 // không tự sáng (có thể được bật sau, vd. đèn phanh)
          const base = m.emissiveIntensity;
          // lá cây và vật tối màu: tắt; còn lại: là nguồn sáng
          const kind = lum < 0.3 ? 'fill' : 'light';
          this._mats.push({ m, base, kind });
        }
      });
    }
    for (const { m, base, kind } of this._mats) {
      m.emissiveIntensity = kind === 'fill' ? base * (1 - 0.9 * n) : Math.min(2.4, base * (1 + 2.6 * n) + 0.25 * n);
    }
  }

  /** Gọi lại sau khi thêm vật thể mới (xe, người…) để chúng cũng sáng/tắt theo đêm. */
  refreshMaterials() {
    this._mats = null;
    this._nightMaterials(this.night);
  }

  update(dt) {
    if (!this.to || this.t >= 1) return;
    this.t = Math.min(1, this.t + dt / 2);
    this._apply(this.t);
  }

  _apply(t) {
    const a = this.from || this.to;
    const b = this.to;
    const e = t * t * (3 - 2 * t);
    const mix = (k) => a[k] + (b[k] - a[k]) * e;
    const col = (target, k) => target.copy(this._c1.set(a[k])).lerp(this._c2.set(b[k]), e);
    const L = this.lights;
    L.sun.intensity = mix('sun');
    col(L.sun.color, 'sunColor');
    L.hemi.intensity = mix('hemi');
    col(L.hemi.color, 'hemiSky');
    col(L.hemi.groundColor, 'hemiGround');
    L.bounce.intensity = mix('bounce');
    if (this.scene.fog) {
      col(this.scene.fog.color, 'fog');
      this.scene.fog.density = mix('fogDensity');
    }
    this.renderer.toneMappingExposure = mix('exposure');
    if ('environmentIntensity' in this.scene) this.scene.environmentIntensity = mix('env');
    this.night = mix('night');
    this._nightMaterials(this.night);
    this.onNight?.(this.night);

    // Nền trời: mờ dần ảnh cũ trong nửa đầu, đổi ảnh ở giữa, hiện dần ảnh mới ở nửa sau
    const entry = b.entry;
    if (!entry) return;
    if (!this._swapped && (t >= 0.5 || !this.scene.background?.isTexture)) {
      this.scene.background = entry.bg;
      this.scene.environment = entry.env;
      if (this.scene.backgroundRotation) this.scene.backgroundRotation.set(0, entry.rot, 0);
      if (this.scene.environmentRotation) this.scene.environmentRotation.set(0, entry.rot, 0);
      this.sky.visible = false;
      this._swapped = true;
    }
    if ('backgroundIntensity' in this.scene) {
      const fade = t < 0.5 && this.from?.bg != null && this.scene.background?.isTexture && !this._swapped ? 1 - t * 2 : (t - 0.5) * 2;
      this.scene.backgroundIntensity = b.bg * (t >= 1 ? 1 : Math.max(0.15, Math.min(1, Math.abs(fade))));
    }
  }

  dispose() {
    clearInterval(this._watch);
    this.pmrem.dispose();
  }
}
