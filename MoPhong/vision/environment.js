// Bầu trời, ánh sáng buổi sáng sớm (7–9h), sương mù nhẹ.

import * as THREE from 'three';

// Hướng TỚI mặt trời: nắng sớm thấp (~21°) phía cuối phố (-Z), hơi lệch phải. Người dùng nhìn dọc phố sẽ thấy mặt trời
// ở phía trước, bóng cây và bóng nhà đổ dài về phía người xem; nắng soi dọc con phố nên vỉa hè không bị nhà đối diện che hết.
export const SUN_DIR = new THREE.Vector3(0.25, 0.36, -0.9).normalize();
export const HORIZON_COLOR = 0xdfe6ea;
export const WARM_GLOW = 0xffcf94;
const GLOW_STRENGTH = 0.6;

const skyVert = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const skyFrag = /* glsl */ `
  uniform vec3 sunDir;
  uniform vec3 zenith;
  uniform vec3 horizon;
  uniform vec3 sunColor;
  uniform vec3 warm;
  uniform float time;
  varying vec3 vDir;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
    return v;
  }

  void main() {
    vec3 d = normalize(vDir);
    float h = clamp(d.y, 0.0, 1.0);
    vec3 col = mix(horizon, zenith, pow(h, 0.42));
    float sd = max(dot(d, normalize(sunDir)), 0.0);
    // dải sáng ấm ở chân trời về phía mặt trời (khớp với màu sương mù — xem updateFog)
    float fh = max(dot(normalize(vec3(d.x, 0.0001, d.z)), normalize(vec3(sunDir.x, 0.0001, sunDir.z))), 0.0);
    float band = pow(fh, 3.0) * 0.55 * (1.0 - smoothstep(0.0, 0.4, d.y));
    col = mix(col, warm, band * ${GLOW_STRENGTH.toFixed(2)});
    // quầng sáng + đĩa mặt trời
    col += sunColor * (pow(sd, 5.0) * 0.34 + pow(sd, 60.0) * 0.8 + pow(sd, 1100.0) * 6.0);
    // mây tích trắng bồng bềnh: hai lớp, đỉnh sáng – đáy hơi xám xanh, viền mềm
    if (d.y > 0.015) {
      float pers = d.y + 0.22;
      vec2 base = d.xz / pers;
      vec2 sdir2 = normalize(sunDir.xz + 1e-4);
      for (int L = 0; L < 2; L++) {
        float sc = L == 0 ? 0.55 : 1.15;
        vec2 uv = base * sc + vec2(time * (L == 0 ? 0.006 : 0.011), 3.7 * float(L));
        float dens = fbm(uv * 1.15);
        float cov = L == 0 ? 0.47 : 0.54;           // độ phủ: trời thoáng, mây không kín
        float c = smoothstep(cov, cov + 0.13, dens);        // viền mây rõ nét hơn, bớt nhoè
        // đổ bóng tự thân: lấy mẫu lệch về phía mặt trời, nếu dày hơn thì phần này nằm trong bóng
        float dens2 = fbm((uv + sdir2 * 0.10) * 1.15);
        float shade = clamp((dens2 - dens) * 4.0 + 0.45, 0.0, 1.0);
        vec3 lightC = vec3(1.0, 0.985, 0.95) * (1.02 + 0.25 * pow(sd, 3.0));
        vec3 darkC = vec3(0.66, 0.74, 0.86);
        vec3 cloud = mix(lightC, darkC, shade * 0.7);
        float fade = smoothstep(0.015, 0.20, d.y) * (L == 0 ? 0.92 : 0.7);
        col = mix(col, cloud, c * fade);
      }
    }
    // lớp haze mỏng gần chân trời (khói bụi đô thị buổi sáng)
    col = mix(col, horizon * 1.02, (1.0 - smoothstep(0.0, 0.16, d.y)) * 0.55);
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export function createSky() {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      sunDir: { value: SUN_DIR.clone() },
      zenith: { value: new THREE.Color(0x2a74d4) },
      horizon: { value: new THREE.Color(HORIZON_COLOR) },
      sunColor: { value: new THREE.Color(0xffd9a0) },
      warm: { value: new THREE.Color(WARM_GLOW) },
      time: { value: 0 },
    },
    vertexShader: skyVert,
    fragmentShader: skyFrag,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 20), mat);
  mesh.renderOrder = -10;
  mesh.frustumCulled = false;
  return mesh;
}

export function createLights(scene) {
  const hemi = new THREE.HemisphereLight(0xcfe0f5, 0x9a8468, 1.0);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xffd7a0, 5.2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const cam = sun.shadow.camera;
  cam.left = -30;
  cam.right = 30;
  cam.top = 30;
  cam.bottom = -30;
  cam.near = 1;
  cam.far = 180;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.04;
  sun.shadow.radius = 2.5;
  scene.add(sun);
  scene.add(sun.target);

  // ánh sáng tán xạ từ mặt đường/tường, hướng ngược mặt trời
  const bounce = new THREE.DirectionalLight(0xffeedb, 0.85);
  bounce.position.set(-SUN_DIR.x * 20, 7, -SUN_DIR.z * 20);
  scene.add(bounce);

  return { hemi, sun, bounce };
}

const _fogBase = new THREE.Color(HORIZON_COLOR);
const _fogWarm = new THREE.Color(WARM_GLOW);
const _sunH = new THREE.Vector2(SUN_DIR.x, SUN_DIR.z).normalize();
const _fwd = new THREE.Vector3();

/** Màu sương mù đổi theo hướng nhìn: ấm và sáng hơn khi nhìn về phía mặt trời (khớp dải chân trời của bầu trời). */
export function updateFog(scene, camera) {
  if (!scene.fog) return;
  camera.getWorldDirection(_fwd);
  const len = Math.hypot(_fwd.x, _fwd.z) || 1;
  const f = Math.max(0, (_fwd.x / len) * _sunH.x + (_fwd.z / len) * _sunH.y);
  const band = Math.pow(f, 3) * 0.55 * GLOW_STRENGTH;
  scene.fog.color.copy(_fogBase).lerp(_fogWarm, band);
}

/** Giữ khung bóng đổ quanh người chơi và "snap" theo texel để bóng không rung. */
const _sr = new THREE.Vector3();
const _su = new THREE.Vector3();
const _sf = SUN_DIR.clone().negate();
_sr.crossVectors(_sf, new THREE.Vector3(0, 1, 0)).normalize();
_su.crossVectors(_sr, _sf).normalize();
const _st = new THREE.Vector3();
export function followShadow(sun, target) {
  // Snap theo lưới texel CỦA ÁNH SÁNG (trục phải/lên của camera bóng), không phải lưới X/Z của thế giới:
  // như vậy cạnh bóng không bò hay nhấp nháy khi người chơi đi.
  const texel = 60 / sun.shadow.mapSize.x;
  const a = Math.round(target.dot(_sr) / texel) * texel;
  const b = Math.round(target.dot(_su) / texel) * texel;
  _st.set(0, 0, 0).addScaledVector(_sr, a).addScaledVector(_su, b);
  const along = target.dot(_sf);
  _st.addScaledVector(_sf, along);
  sun.target.position.copy(_st);
  sun.position.set(_st.x + SUN_DIR.x * 90, _st.y + SUN_DIR.y * 90, _st.z + SUN_DIR.z * 90);
  sun.target.updateMatrixWorld();
}

/** Bản đồ môi trường từ bầu trời — cho phản chiếu kính/sơn xe tự nhiên. Có thể thất bại: bỏ qua. */
export function applySkyEnvironment(renderer, scene) {
  try {
    const envScene = new THREE.Scene();
    envScene.add(createSky());
    const pmrem = new THREE.PMREMGenerator(renderer);
    const rt = pmrem.fromScene(envScene, 0, 0.1, 1000);
    scene.environment = rt.texture;
    if ('environmentIntensity' in scene) scene.environmentIntensity = 0.55;
    pmrem.dispose();
    return true;
  } catch (e) {
    console.warn('Không tạo được môi trường phản chiếu:', e);
    return false;
  }
}
