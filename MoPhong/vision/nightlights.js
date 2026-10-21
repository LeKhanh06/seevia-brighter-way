// Đèn đường buổi tối: mỗi cột điện có cần đèn vươn ra lòng đường.
// Vệt sáng vàng trên mặt đất là một mặt phẳng tô gradient (rẻ), còn ánh sáng thật (SpotLight)
// chỉ dùng cho vài cột gần người chơi nhất để máy yếu vẫn mượt.

import * as THREE from 'three';
import { POLES, DECOR_POLES } from './world.js';
import { STREET } from './data.js';

const BULB_Y = 7.4;
const ARM = 1.7;            // cần đèn vươn về phía lòng đường
const REAL_LIGHTS = 3;

function poolTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(255,214,140,0.9)');
  grd.addColorStop(0.45, 'rgba(255,190,110,0.35)');
  grd.addColorStop(1, 'rgba(255,170,90,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function createNightLights(scene) {
  const group = new THREE.Group();
  group.name = 'night-lights';
  scene.add(group);

  const metal = new THREE.MeshStandardMaterial({ color: 0x2b3036, metalness: 0.6, roughness: 0.5 });
  const bulbMat = new THREE.MeshStandardMaterial({ color: 0xfff1d0, emissive: 0xffc878, emissiveIntensity: 0 });
  bulbMat.userData.ownLight = true;   // daytime.js không chỉnh đèn này
  const poolMat = new THREE.MeshBasicMaterial({
    map: poolTexture(), transparent: true, opacity: 0, depthWrite: false,
    blending: THREE.AdditiveBlending, toneMapped: false, fog: true,
  });
  const poolGeo = new THREE.PlaneGeometry(9, 9).rotateX(-Math.PI / 2);
  const armGeo = new THREE.BoxGeometry(ARM, 0.07, 0.07);
  const headGeo = new THREE.BoxGeometry(0.5, 0.1, 0.24);

  const spots = [];
  for (const [x, z] of [...POLES, ...DECOR_POLES]) {
    const dir = x < 0 ? 1 : -1;             // vươn về phía giữa đường
    const bx = x + dir * ARM;
    const arm = new THREE.Mesh(armGeo, metal);
    arm.position.set(x + dir * ARM / 2, BULB_Y + 0.12, z);
    const head = new THREE.Mesh(headGeo, bulbMat);
    head.position.set(bx, BULB_Y, z);
    const pool = new THREE.Mesh(poolGeo, poolMat);
    pool.position.set(bx, 0.03, z);
    pool.renderOrder = 2;
    group.add(arm, head, pool);
    spots.push(new THREE.Vector3(bx, BULB_Y - 0.1, z));
  }

  // Một vài đèn thật đi theo các cột gần người chơi nhất
  const real = [];
  for (let i = 0; i < REAL_LIGHTS; i++) {
    const l = new THREE.SpotLight(0xffc27a, 0, 16, Math.PI / 3.2, 0.6, 1.4);
    l.castShadow = false;
    group.add(l, l.target);
    real.push(l);
  }

  let night = 0;
  const dist = (p, x, z) => (p.x - x) ** 2 + (p.z - z) ** 2;
  return {
    setNight(n) {
      night = n;
      bulbMat.emissiveIntensity = n * 2.2;
      poolMat.opacity = n * 0.55;
      group.visible = true;
    },
    update(px, pz) {
      if (night < 0.02) { real.forEach((l) => { l.intensity = 0; }); return; }
      const near = spots.slice().sort((a, b) => dist(a, px, pz) - dist(b, px, pz)).slice(0, REAL_LIGHTS);
      near.forEach((p, i) => {
        const l = real[i];
        l.position.copy(p);
        l.target.position.set(p.x, 0, p.z);
        l.target.updateMatrixWorld();
        l.intensity = night * 38;
      });
    },
  };
}

void STREET;
