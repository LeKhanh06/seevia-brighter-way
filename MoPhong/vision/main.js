// SeeVia Vision Experience — điểm vào. Ghép: cảnh, camera, tương tác, nhận diện, giọng nói, HUD, 5 nhóm chức năng.
// Đây là MÔ PHỎNG trải nghiệm sản phẩm, không phải nhận diện AI thật.

import * as THREE from 'three';
import { ObjectRegistry, WELCOME, GROUPS, NOT_FOUND } from './data.js';
import { setAnisotropy } from './textures.js';
import { createSky, createLights, followShadow, applySkyEnvironment, updateFog, HORIZON_COLOR } from './environment.js';
import { createSunlight, SunFlare } from './sunlight.js';
import { createPetals } from './petals.js';
import { buildWorld } from './world.js';
import { createEntities } from './entities.js';
import { PlayerControls, bindStick } from './controls.js';
import { Recognizer } from './interaction.js';
import { Speech } from './speech.js';
import { Hud } from './hud.js';
import { Lens } from './lens.js';
import { Sfx, Music } from './audio.js';
import { Features } from './features.js';
import { directionPhrase, relativeAngle, distanceTo, cap } from './recognition.js';

window.__seeviaLoaded = true;

const $ = (id) => document.getElementById(id);
const tick = () => new Promise((r) => setTimeout(r, 16));
const params = new URLSearchParams(location.search);
const lowQuality = params.get('quality') === 'low';
const isTouch = matchMedia('(pointer: coarse)').matches;

async function boot() {
  const status = $('load-status');
  const startBtn = $('start-btn');
  const setStatus = (t) => { status.textContent = t; };

  // ───── Renderer ─────
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: !lowQuality, powerPreference: 'high-performance' });
  } catch (e) {
    console.error(e);
    status.textContent = 'Thiết bị hoặc trình duyệt này chưa hỗ trợ WebGL nên không thể hiển thị cảnh 3D. Hãy thử Chrome, Edge hoặc Safari bản mới.';
    status.classList.add('error');
    return;
  }
  const maxRatio = Math.min(window.devicePixelRatio || 1, lowQuality ? 1 : 2);
  let pixelRatio = maxRatio;
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;
  $('stage').appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-label', 'Khung nhìn 3D của kính mô phỏng SeeVia');
  setAnisotropy(Math.min(lowQuality ? 2 : 8, renderer.capabilities.getMaxAnisotropy()));

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(HORIZON_COLOR);
  scene.fog = new THREE.FogExp2(HORIZON_COLOR, 0.0088);
  const camera = new THREE.PerspectiveCamera(68, window.innerWidth / window.innerHeight, 0.2, 600);
  scene.add(camera);
  const baseFov = 68;

  // ───── Dựng cảnh (chia nhỏ để màn hình giới thiệu vẫn phản hồi) ─────
  setStatus('Đang dựng bầu trời và ánh nắng…');
  await tick();
  const lights = createLights(scene);
  if (lowQuality) lights.sun.shadow.mapSize.set(1024, 1024);
  const sky = createSky();
  scene.add(sky);
  applySkyEnvironment(renderer, scene);

  setStatus('Đang dựng phố, nhà cửa và cây xanh…');
  await tick();
  const reg = new ObjectRegistry();
  const world = buildWorld(scene, reg);
  const sunlight = createSunlight(scene, world.sunSources, { low: lowQuality });
  const petals = createPetals(scene, { low: lowQuality });
  const flare = new SunFlare(reg.list.filter((o) => o.group === GROUPS.BUILDINGS));
  if (lowQuality) flare.enabled = false;

  setStatus('Đang thêm người và xe cộ…');
  await tick();
  const ents = createEntities(scene, reg, world);

  // ───── Hệ thống tương tác ─────
  const controls = new PlayerControls(camera, renderer.domElement, reg);
  const recognizer = new Recognizer(camera, scene, reg, world.pickables, world.zones);
  const speech = new Speech();
  const hud = new Hud();
  const lens = new Lens();
  const sfx = new Sfx();
  const music = new Music(sfx);
  hud.setVoiceButton(true);

  const warn = $('voice-warning');
  speech.onVoicesChecked = (found) => {
    warn.hidden = found;
    if (!speech.supported) warn.textContent = 'Trình duyệt này không hỗ trợ đọc giọng nói. Phụ đề vẫn hiển thị đầy đủ.';
  };
  if (speech.voicesChecked) warn.hidden = speech.hasVietnameseVoice;

  let lastText = '';
  let started = false;
  let paused = false;
  let speaking = false;
  let busy = false;      // đang chạy chuỗi "yêu cầu → chụp → xác định → đọc"
  let runToken = 0;
  const waiting = [];    // câu nói chờ đến lượt (thông báo nền: chỉ đường, tìm đồ…)

  // ───── Khung tiêu điểm bám theo vật thể ─────
  const box3 = new THREE.Box3();
  const corner = new THREE.Vector3();
  const v3 = new THREE.Vector3();
  function screenTracker(obj, point) {
    const mesh = obj.mesh;
    mesh.updateWorldMatrix(true, false);
    const local = mesh.worldToLocal(point.clone());
    return () => {
      try {
        const W = window.innerWidth;
        const H = window.innerHeight;
        // vị trí điểm trúng (dùng làm dự phòng cho vật quá lớn như nhà, mặt đường)
        v3.copy(local);
        mesh.localToWorld(v3);
        v3.project(camera);
        const hit = { x: (v3.x * 0.5 + 0.5) * W, y: (-v3.y * 0.5 + 0.5) * H, ok: v3.z < 1 };
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        let behind = false;
        if (obj.group !== GROUPS.SPACE) {
          box3.setFromObject(mesh);
          for (let i = 0; i < 8; i++) {
            corner.set(i & 1 ? box3.max.x : box3.min.x, i & 2 ? box3.max.y : box3.min.y, i & 4 ? box3.max.z : box3.min.z).project(camera);
            if (corner.z > 1) { behind = true; break; }
            const sx = (corner.x * 0.5 + 0.5) * W;
            const sy = (-corner.y * 0.5 + 0.5) * H;
            minX = Math.min(minX, sx); maxX = Math.max(maxX, sx);
            minY = Math.min(minY, sy); maxY = Math.max(maxY, sy);
          }
        }
        let w = maxX - minX;
        let h = maxY - minY;
        const useBox = obj.group !== GROUPS.SPACE && !behind && Number.isFinite(w) && w * h < W * H * 0.34 && w < W * 0.7 && h < H * 0.8;
        if (useBox) {
          w = THREE.MathUtils.clamp(w * 1.12 + 14, 84, W * 0.7);
          h = THREE.MathUtils.clamp(h * 1.12 + 14, 84, H * 0.8);
          return { visible: maxX > 0 && minX < W && maxY > 0 && minY < H, x: (minX + maxX) / 2, y: (minY + maxY) / 2, w, h };
        }
        return { visible: hit.ok && hit.x > -40 && hit.x < W + 40 && hit.y > -40 && hit.y < H + 40, x: hit.x, y: hit.y, w: 170, h: 170 };
      } catch {
        return { visible: false, x: 0, y: 0, w: 120, h: 120 };
      }
    };
  }

  function showFocus(obj, point) {
    if (!obj || obj.group === GROUPS.SPACE || !point) return;
    hud.focusOn(screenTracker(obj, point));
  }

  // ───── Nói ─────
  function flushWaiting() {
    const n = waiting.shift();
    if (!n) return;
    setTimeout(() => { if (!speaking && !busy) say(n.text, n.subtitle); }, 350);
  }

  function say(text, subtitle = true) {
    lastText = text;
    speaking = true;
    if (subtitle) hud.say(text);
    speech.speak(text, {
      onEnd: () => {
        speaking = false;
        if (subtitle) hud.fadeSubtitle(1800);
        flushWaiting();
      },
    });
  }

  /** Nói ngay (hoặc xếp hàng nếu là thông báo nền). */
  function speakNow(text, { subtitle = true, queue = false, key = '' } = {}) {
    if (!started) return;
    if (queue && (speaking || busy)) {
      const i = key ? waiting.findIndex((x) => x.key === key) : -1;
      if (i >= 0) waiting[i] = { text, subtitle, key };
      else if (waiting.length < 3) waiting.push({ text, subtitle, key });
      return;
    }
    // một câu quan trọng cắt ngang chuỗi đang chạy
    if (busy) {
      runToken++;
      busy = false;
      lens.end(300);
      hud.clearFocus();
    }
    waiting.length = 0;
    say(text, subtitle);
  }

  /**
   * Quy trình: bạn yêu cầu → (kính chụp 1 khung) → SeeVia xác định → đọc to → camera tắt, HUD mờ đi.
   * compute() chạy ngay lúc yêu cầu (đúng thứ bạn đang hướng kính vào); kết quả được hiện/đọc sau ~0,6 giây.
   * @param {{label:string, camera?:boolean, compute:()=>{text:string,focus?:{obj:object,point:object},hold?:object,radar?:object,sweep?:boolean}}} spec
   */
  function perform({ label, camera = false, compute }) {
    if (!started) return;
    sfx.unlock();
    const token = ++runToken;
    busy = true;
    speaking = false;
    waiting.length = 0;
    speech.cancel();
    hud.clearFocus();
    lens.radar.hide();
    lens.begin({ camera, label });
    if (camera) sfx.shutter();
    let res;
    try {
      res = compute();
    } catch (e) {
      console.error(e);
      res = { text: 'Có lỗi nhỏ khi xử lý yêu cầu. Bạn thử lại nhé.' };
    }
    const tCapture = camera ? 170 : 40;
    const tDetect = camera ? 480 : 140;
    const tSpeak = camera ? 600 : 220;
    const alive = () => token === runToken;
    setTimeout(() => { if (alive()) lens.step(camera ? 'capture' : 'detect'); }, tCapture);
    setTimeout(() => {
      if (!alive()) return;
      lens.step('detect');
      sfx.done();
      if (res.sweep) lens.sweep();
      if (res.radar && res.radar.items.length) lens.radar.show({ ...res.radar, cam: controls.state });
      if (res.focus) showFocus(res.focus.obj, res.focus.point);
    }, tDetect);
    setTimeout(() => {
      if (!alive()) return;
      lens.step('speak');
      lastText = res.text;
      hud.say(res.text);
      speaking = true;
      speech.speak(res.text, {
        onEnd: () => {
          if (!alive()) return;
          speaking = false;
          busy = false;
          hud.fadeSubtitle(1800);
          hud.fadeFocus(700);
          lens.end(1200);
          flushWaiting();
        },
      });
    }, tSpeak);
  }

  // ───── Hành động cơ bản ─────
  const identifyRaw = () => recognizer.identify(controls.state, camera.aspect);
  const scanRaw = () => recognizer.scan(controls.state);

  function doIdentify() {
    perform({
      label: 'Nhận diện vật phía trước', camera: true,
      compute: () => {
        const res = identifyRaw();
        return { text: res.text, focus: res.obj ? { obj: res.obj, point: res.point } : null };
      },
    });
  }
  function doScan() {
    perform({
      label: 'Mô tả xung quanh', camera: true,
      compute: () => {
        const r = scanRaw();
        return {
          text: r.text, sweep: true,
          card: r.mentioned.length ? { title: 'Xung quanh bạn', sub: `${r.mentioned.length} điều đáng chú ý` } : undefined,
          radar: { title: 'Vị trí so với bạn', items: r.mentioned.slice(0, 3).map((o) => ({ label: o.name, pos: o.pos, size: o.size })) },
        };
      },
    });
  }
  function toggleVoice() {
    speech.setEnabled(!speech.enabled);
    hud.setVoiceButton(speech.enabled);
    if (speech.enabled) speakNow('Đã bật giọng nói.');
    else {
      hud.say('Đã tắt giọng nói. Phụ đề vẫn hiển thị.');
      hud.fadeSubtitle(2600);
    }
  }
  function repeat() {
    if (lastText) speakNow(lastText);
  }

  // ───── 4 nhóm chức năng ─────
  const features = new Features({
    reg, hud, lens, sfx, music,
    getPlayer: () => controls.state,
    getSignal: () => ents.signal,
    perform, speakNow,
    identify: doIdentify,
    scan: doScan,
    identifyRaw,
    scanRaw,
    repeat,
    isVoiceOn: () => speech.enabled,
    requestUnlock: () => sfx.unlock(),
    setSpeechRate: (r) => { speech.rate = r; },
    runVoiceToggle: () => toggleVoice(),
    releaseLock: () => releaseForUi(),
    onSheetClosed: () => {
      if (started && !paused && !isTouch && !controls.locked) {
        hud.say('Đã đóng bảng. Bấm vào khung cảnh để tiếp tục nhìn quanh bằng chuột.');
        hud.fadeSubtitle(2600);
      }
    },
  });

  function setPaused(v) {
    if (!started || paused === v) return;
    paused = v;
    controls.setEnabled(!v);
    hud.showPause(v);
    if (v) {
      speech.cancel();
      waiting.length = 0;
      speaking = false;
      controls.releaseLock();
    }
  }

  controls.on.identify = doIdentify;
  controls.on.scan = doScan;
  controls.on.read = () => features.readSign();
  controls.on.voice = toggleVoice;
  controls.on.repeat = repeat;
  controls.on.command = () => features.focusCommand();
  controls.on.guide = () => hud.toggleHelp();
  controls.on.digit = (n) => features.handleDigit(n);
  // Tab: mở bảng tính năng (như nút "menu" trong game); nhấn tiếp để đổi nhóm, Shift+Tab đi ngược lại.
  controls.on.tab = (dir = 1) => {
    if (paused || hud.isHelpOpen) return false;
    features.cycleGroup(dir);
    return true;
  };
  controls.on.pause = () => {
    if (hud.isHelpOpen) {
      hud.closeHelp();
      return;
    }
    if (features.isOpen) {
      features.close();
      return;
    }
    setPaused(true);
  };
  // Mở bảng thì nhả khoá chuột để người dùng thấy con trỏ; khi đó Esc tới được trang và đóng bảng ngay ở lần nhấn đầu.
  let ignoreUnlockUntil = 0;
  const releaseForUi = () => {
    if (controls.locked) {
      ignoreUnlockUntil = performance.now() + 500;
      controls.releaseLock();
    }
  };
  controls.on.lockchange = (locked) => {
    if (locked || !started || paused || isTouch || performance.now() < ignoreUnlockUntil) return;
    // trình duyệt nuốt phím Esc khi đang khoá chuột: coi đó là yêu cầu đóng thứ đang mở, hoặc tạm dừng
    if (hud.isHelpOpen) hud.closeHelp();
    else if (features.isOpen) features.close();
    else setPaused(true);
  };

  // Nút bấm (bàn phím/chạm/chuột đều dùng được). Bấm bằng chuột xong thì bỏ focus để phím Space vẫn là "mô tả xung quanh".
  document.querySelectorAll('[data-act]').forEach((el) =>
    el.addEventListener('click', (e) => {
      if (!started && el.dataset.act !== 'help-close') return;
      sfx.unlock();
      switch (el.dataset.act) {
        case 'identify': doIdentify(); break;
        case 'scan': doScan(); break;
        case 'read': features.readSign(); break;
        case 'repeat': repeat(); break;
        case 'voice': toggleVoice(); break;
        case 'command': features.voiceCommand(); break;
        case 'features': if (features.isOpen) features.close(); else features.openGroup(features.group || 1, { mouse: e.detail > 0 }); break;
        case 'help': hud.toggleHelp(); break;
        case 'help-close': hud.closeHelp(); break;
        case 'pause': hud.closeHelp(); if (paused) { resume(); } else setPaused(true); break;
        default: break;
      }
      if (e.detail > 0) el.blur();
    }),
  );
  function resume() {
    if (!paused) return;
    paused = false;
    hud.showPause(false);
    controls.setEnabled(true);
    if (!isTouch && !features.isOpen) controls.requestLock();
  }
  $('btn-resume').addEventListener('click', resume);
  hud.onReplay = () => { sfx.unlock(); repeat(); };
  // bấm ra ngoài menu tính năng thì đóng menu
  document.addEventListener('pointerdown', (e) => {
    if (!features.isOpen || e.target.closest('#sheet, #dock, #help, #subtitle, .chip, #top')) return;
    features.close();
  }, true);
  renderer.domElement.addEventListener('click', () => {
    if (started && !paused && !isTouch && !controls.locked && !features.isOpen) controls.requestLock();
  });
  bindStick($('stick'), $('stick-knob'), controls.moveStick);

  // Bấm "Bắt đầu" — thao tác của người dùng, nên mới được xin khoá chuột, bật âm thanh và phát giọng nói.
  startBtn.addEventListener('click', () => {
    $('intro').hidden = true;
    lens.show();
    hud.show();
    hud.armKeyHint();
    started = true;
    controls.hotkeys = true;
    controls.setEnabled(true);
    sfx.unlock();
    if (!isTouch) controls.requestLock();
    setTimeout(() => {
      speakNow(WELCOME);
      speakNow('Bạn tự do đi dạo. Nhấn E để nhận diện, Space để mô tả xung quanh, hoặc nút Tính năng để mở các chức năng.', { queue: true, key: 'tip' });
    }, 350);
  });

  // ───── Kích thước + tự điều chỉnh độ phân giải theo hiệu năng ─────
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  let fpsFrames = 0;
  let fpsTime = 0;
  // Đổi độ phân giải làm canvas bị xoá và gây một khung hình trống (chớp). Vì vậy chỉ hạ MỘT chiều khi máy thực sự yếu,
  // và áp dụng ngay đầu khung hình để khung đó vẫn được vẽ xong trước khi hiển thị.
  let ratioDirty = false;
  const applyRatio = () => {
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  let last = performance.now();
  let dtS = 1 / 60;
  let appliedFov = baseFov;
  const t0 = performance.now();
  // Đo độ sáng cảnh (8×8 điểm, vài lần mỗi giây) để giao diện đổi tông: sáng ấm khi có nắng, tối khi vào bóng râm.
  const lightCv = document.createElement('canvas');
  lightCv.width = lightCv.height = 8;
  const lightCx = lightCv.getContext('2d', { willReadFrequently: true });
  let lightT = 0;
  function sampleLight(now) {
    if (now - lightT < 1200) return;
    lightT = now;
    try {
      const c = renderer.domElement;
      lightCx.drawImage(c, 0, 0, c.width, c.height, 0, 0, 8, 8);
      const d = lightCx.getImageData(0, 0, 8, 8).data;
      let sum = 0;
      for (let i = 0; i < d.length; i += 4) sum += (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255;
      hud.setLuminance(sum / 64, now);
    } catch { /* canvas không đọc được: giữ tông sáng mặc định */ }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    if (ratioDirty) { applyRatio(); ratioDirty = false; }
    const raw = Math.min(0.1, (now - last) / 1000);
    last = now;
    dtS += (Math.min(0.05, raw) - dtS) * 0.35; // làm mượt bước thời gian để chuyển động đều hơn
    const dt = dtS;
    if (!paused) ents.update(dt, started ? controls.state : null);
    controls.update(dt);
    // FOV nhích nhẹ khi đi nhanh
    const fov = baseFov + controls.run * 3;
    if (Math.abs(fov - appliedFov) > 0.02) {
      appliedFov = fov;
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
    sky.position.copy(camera.position);
    sky.material.uniforms.time.value += dt;
    followShadow(lights.sun, camera.position);
    updateFog(scene, camera);
    sunlight.update(dt, camera);
    petals.update(dt, camera);
    flare.update(dt, camera);
    if (started) {
      features.update(dt, controls.state);
      lens.update(controls.state);
      hud.updateFocus();
      hud.setHeading(controls.state.yaw);
    }
    renderer.render(scene, camera);
    sampleLight(now);

    if (started) {
      fpsFrames++;
      fpsTime += raw;
      if (fpsTime > 2.5) {
        const fps = fpsFrames / fpsTime;
        if (fps < 28 && pixelRatio > 1) {
          pixelRatio = Math.max(1, pixelRatio - 0.25);
          ratioDirty = true;
        }
        fpsFrames = 0;
        fpsTime = 0;
      }
    }
  }
  requestAnimationFrame((t) => { last = t; frame(t); });

  window.__seevia = { reg, controls, ents, recognizer, camera, scene, features, lens, hud, speech, music, perform, speakNow, world, started: () => started, t0 };

  setStatus('');
  startBtn.disabled = false;
  startBtn.focus();
}

boot().catch((e) => {
  console.error(e);
  const status = document.getElementById('load-status');
  if (status) {
    status.textContent = 'Có lỗi khi khởi tạo trải nghiệm: ' + (e && e.message ? e.message : e);
    status.classList.add('error');
  }
});
