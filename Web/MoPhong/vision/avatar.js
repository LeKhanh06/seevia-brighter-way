// Nhân vật "Đăng": nam ~30 tuổi đi làm, áo khoác nhẹ, quần kaki, đeo kính SeeVia và dùng gậy trắng.
//
// Thân là nhân vật Mixamo (tải từ mixamo.com, định dạng FBX), đặt trong MoPhong/models/:
//   dang.fbx       nhân vật + hoạt ảnh đứng (Idle), xuất "With Skin"
//   dang-walk.fbx  hoạt ảnh đi bộ, tick "In Place", xuất "Without Skin"
//   dang-run.fbx   (tuỳ chọn) hoạt ảnh chạy, "In Place", "Without Skin"
// Kính SeeVia và gậy trắng dựng bằng code. Thiếu file thì main.js tự dùng góc nhìn qua mắt.

import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

const MODEL = (name) => new URL('../models/' + name, import.meta.url).href;

function buildGlasses() {
  const g = new THREE.Group();
  const frame = new THREE.MeshStandardMaterial({ color: '#16152a', metalness: 0.4, roughness: 0.35 });
  const lens = new THREE.MeshStandardMaterial({ color: '#1b2a44', emissive: '#7fd3de', emissiveIntensity: 0, metalness: 0.2, roughness: 0.15, transparent: true, opacity: 0.85 });
  for (const sx of [-1, 1]) {
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.0035, 8, 24), frame);
    rim.scale.set(1.25, 1, 1);
    rim.position.set(sx * 0.034, 0, 0);
    const glass = new THREE.Mesh(new THREE.CircleGeometry(0.026, 24), lens);
    glass.scale.set(1.25, 1, 1);
    glass.position.set(sx * 0.034, 0, -0.001);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.004, 0.11), frame);
    arm.position.set(sx * 0.069, 0.004, -0.055);
    g.add(rim, glass, arm);
  }
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.004, 0.004), frame);
  g.add(bridge);
  // camera nhỏ trên gọng phải: sáng khi kính chụp
  const cam = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.008, 12), frame);
  cam.rotation.x = Math.PI / 2;
  cam.position.set(0.075, 0.012, 0.004);
  g.add(cam);
  g.userData.lens = lens;
  return g;
}

function buildCane() {
  const g = new THREE.Group();
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.012, 1, 10).translate(0, 0.5, 0),
    new THREE.MeshStandardMaterial({ color: '#f4f4f2', roughness: 0.45 }),
  );
  const band = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0125, 0.0125, 0.16, 10).translate(0, 0.12, 0),
    new THREE.MeshStandardMaterial({ color: '#c8262c', roughness: 0.5 }),
  );
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.016, 10, 8), new THREE.MeshStandardMaterial({ color: '#202024', roughness: 0.6 }));
  g.add(shaft, band, tip);
  g.userData = { shaft, band, tip };
  shaft.castShadow = true;
  return g;
}

const up = new THREE.Vector3(0, 1, 0);
const tmpA = new THREE.Vector3();
const tmpB = new THREE.Vector3();
const tmpQ = new THREE.Quaternion();

export async function createAvatar(scene) {
  const loader = new FBXLoader();
  const model = await loader.loadAsync(MODEL('dang.fbx'));
  const loadClip = async (file) => {
    try { return (await loader.loadAsync(MODEL(file))).animations[0] || null; }
    catch { return null; }
  };
  const [walkClip, runClip] = await Promise.all([loadClip('dang-walk.fbx'), loadClip('dang-run.fbx')]);
  const clips = { idle: model.animations[0] || null, walk: walkClip, run: runClip || walkClip };
  // Mixamo xuất theo cm
  model.scale.setScalar(0.01);
  const root = new THREE.Group();
  root.add(model);
  scene.add(root);

  model.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = true;
    o.receiveShadow = false;
    o.frustumCulled = false;
    for (const m of [].concat(o.material)) { if (m) { m.shininess = 8; m.needsUpdate = true; } }
  });

  const bone = (n) => model.getObjectByName('mixamorig' + n) || model.getObjectByName('mixamorig:' + n);
  const head = bone('Head');
  const handR = bone('RightHand');

  const glasses = buildGlasses();
  // xương đầu tính bằng cm (Armature scale 0.01): phóng 100 lần để kính đo bằng mét
  glasses.scale.setScalar(100);
  glasses.position.set(0, 9.5, 9.6);
  head?.add(glasses);

  const cane = buildCane();
  scene.add(cane);

  const mixer = new THREE.AnimationMixer(model);
  const actions = {};
  for (const n of ['idle', 'walk', 'run']) {
    if (!clips[n]) continue;
    const a = mixer.clipAction(clips[n]);
    a.enabled = true;
    a.setEffectiveWeight(n === 'idle' ? 1 : 0);
    a.play();
    actions[n] = a;
  }
  const weight = (n, w) => actions[n]?.setEffectiveWeight(w);
  // mô hình gốc bước ~1.45 m/s khi đi, ~3.6 m/s khi chạy: tỉ lệ timeScale theo tốc độ thật để chân không trượt
  const WALK_SPEED = 1.45;
  const RUN_SPEED = 3.6;
  let speedS = 0;
  let sweep = 0;
  let glow = 0;

  return {
    root,
    set visible(v) { root.visible = v; cane.visible = v; },
    get visible() { return root.visible; },
    /** @param s {x,z,yaw,floor,speed,cameraOn} */
    update(dt, s) {
      speedS += (s.speed - speedS) * (1 - Math.exp(-dt * 8));
      root.position.set(s.x, s.floor, s.z);
      root.rotation.y = s.yaw + Math.PI;
      const walkW = THREE.MathUtils.clamp(speedS / WALK_SPEED, 0, 1);
      const runW = THREE.MathUtils.clamp((speedS - WALK_SPEED) / (RUN_SPEED - WALK_SPEED), 0, 1);
      weight('idle', 1 - walkW);
      weight('walk', walkW * (1 - runW));
      weight('run', runW);
      if (actions.walk) actions.walk.timeScale = Math.max(0.6, speedS / WALK_SPEED);
      if (actions.run && actions.run !== actions.walk) actions.run.timeScale = Math.max(0.7, speedS / RUN_SPEED);
      mixer.update(dt);

      // gậy: từ tay phải chạm đất phía trước, quét trái–phải theo nhịp bước (đứng yên thì quét chậm)
      sweep += dt * (1.2 + speedS * 2.4);
      root.updateMatrixWorld(true);
      if (handR) handR.getWorldPosition(tmpA); else tmpA.set(s.x, s.floor + 0.9, s.z);
      const fwdX = -Math.sin(s.yaw), fwdZ = -Math.cos(s.yaw);
      const rgtX = Math.cos(s.yaw), rgtZ = -Math.sin(s.yaw);
      const side = Math.sin(sweep) * 0.32 + 0.08;
      tmpB.set(s.x + fwdX * 0.95 + rgtX * side, s.floor + 0.016, s.z + fwdZ * 0.95 + rgtZ * side);
      const len = tmpA.distanceTo(tmpB);
      cane.position.copy(tmpB);
      tmpQ.setFromUnitVectors(up, tmpA.clone().sub(tmpB).normalize());
      cane.quaternion.copy(tmpQ);
      cane.userData.shaft.scale.y = len;

      // tròng kính sáng cyan khi camera kính đang bật
      glow += ((s.cameraOn ? 1 : 0) - glow) * (1 - Math.exp(-dt * 10));
      glasses.userData.lens.emissiveIntensity = glow * 1.6;
    },
  };
}
