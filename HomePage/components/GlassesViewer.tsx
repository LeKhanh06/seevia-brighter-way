import { useEffect, useRef, useState } from "react";
import type * as THREE from "three";
import { buildGlasses } from "./glassesModel";

/*
 * Khung xem 3D cho mô hình kính SeeVia (hình học nằm ở glassesModel.ts).
 * Kéo để xoay 360°, mũi tên trái/phải khi đang focus, tự quay chậm khi không bị giảm chuyển động.
 * Thả tay 5 giây thì kính tự về góc nhìn ban đầu (giảm chuyển động: về ngay, không chạy hiệu ứng).
 */

export default function GlassesViewer() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      try {
        const T = await import("three");
        const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
        const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js");
        if (disposed) return;

        const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        renderer.toneMapping = T.ACESFilmicToneMapping;
        host.appendChild(renderer.domElement);

        const scene = new T.Scene();
        const pmrem = new T.PMREMGenerator(renderer);
        scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
        const key = new T.DirectionalLight(0xffffff, 1.6);
        key.position.set(-0.35, 0.3, 0.4);
        const rim = new T.DirectionalLight(0xd9e6ff, 2);
        rim.position.set(0.4, 0.15, -0.35);
        scene.add(key, rim);

        const model = buildGlasses(T);
        scene.add(model);

        const camera = new T.PerspectiveCamera(26, 1, 0.01, 10);
        // Góc nhìn ban đầu: 3/4 hơi từ trên xuống, camera gần nằm bên phải như ảnh sản phẩm.
        const HOME = new T.Vector3(0.2, 0.075, 0.26).normalize();
        camera.position.copy(HOME);
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.enablePan = false;
        controls.enableZoom = false;
        controls.target.set(0, 0, 0);
        // Vuốt dọc vẫn cuộn trang trên điện thoại, vuốt ngang để xoay.
        renderer.domElement.style.touchAction = "pan-y";

        const reduce = matchMedia("(prefers-reduced-motion: reduce)");
        const syncMotion = () => { controls.autoRotate = !reduce.matches; };
        syncMotion();
        reduce.addEventListener("change", syncMotion);
        controls.autoRotateSpeed = 1.6;

        // Sau 5 giây không tương tác, kính tự xoay về góc nhìn ban đầu rồi mới tự quay tiếp.
        const RETURN_AFTER = 5000, RETURN_MS = 1400;
        let idleTimer = 0;
        let back: { t0: number; from: THREE.Spherical; to: THREE.Spherical; rotY: number } | null = null;
        const startReturn = () => {
          const from = new T.Spherical().setFromVector3(camera.position);
          const to = new T.Spherical().setFromVector3(HOME.clone().multiplyScalar(from.radius));
          // quay theo đường ngắn nhất quanh trục đứng
          const d = to.theta - from.theta;
          to.theta = from.theta + Math.atan2(Math.sin(d), Math.cos(d));
          const rotY = Math.atan2(Math.sin(model.rotation.y), Math.cos(model.rotation.y));
          if (reduce.matches) {
            camera.position.setFromSpherical(to);
            model.rotation.y = 0;
            return;
          }
          back = { t0: performance.now(), from, to, rotY };
        };
        const interact = () => {
          controls.autoRotate = false;
          back = null;
          clearTimeout(idleTimer);
        };
        const settle = () => {
          clearTimeout(idleTimer);
          idleTimer = window.setTimeout(startReturn, RETURN_AFTER);
        };
        controls.addEventListener("start", interact);
        controls.addEventListener("end", settle);
        const stepReturn = () => {
          if (!back) return;
          const k = Math.min(1, (performance.now() - back.t0) / RETURN_MS);
          const e = k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2;
          const { from, to } = back;
          camera.position.setFromSpherical(
            new T.Spherical(
              from.radius + (to.radius - from.radius) * e,
              from.phi + (to.phi - from.phi) * e,
              from.theta + (to.theta - from.theta) * e,
            ),
          );
          model.rotation.y = back.rotY * (1 - e);
          if (k === 1) {
            back = null;
            syncMotion();
          }
        };

        // Khoảng cách camera cố định khi xoay (kính không phóng to/thu nhỏ theo góc nhìn), chỉ tính lại khi khung
        // đổi kích thước: kính chiếm tối đa ~0.26m ngang và ~0.14m dọc khi nhìn ngang, × FRAME_PAD chừa thêm ~7% lề.
        const FRAME_PAD = 1.075;
        const fit = () => {
          const w = host.clientWidth, h = host.clientHeight;
          if (!w || !h) return;
          renderer.setSize(w, h, false);
          camera.aspect = w / h;
          const tanV = Math.tan((camera.fov * Math.PI) / 360);
          const tanH = tanV * camera.aspect;
          camera.position.setLength(FRAME_PAD * Math.max(0.072 / tanV, 0.13 / tanH));
          camera.updateProjectionMatrix();
        };
        const ro = new ResizeObserver(fit);
        ro.observe(host);
        fit();

        let visible = false;
        let frame = 0;
        const loop = () => {
          frame = visible ? requestAnimationFrame(loop) : 0;
          stepReturn();
          controls.update();
          renderer.render(scene, camera);
        };
        const io = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
          if (visible && !frame) loop();
        });
        io.observe(host);

        const onKey = (e: KeyboardEvent) => {
          if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
          e.preventDefault();
          interact();
          model.rotation.y += e.key === "ArrowLeft" ? -0.2 : 0.2;
          settle();
        };
        host.addEventListener("keydown", onKey);

        cleanup = () => {
          cancelAnimationFrame(frame);
          clearTimeout(idleTimer);
          io.disconnect();
          ro.disconnect();
          reduce.removeEventListener("change", syncMotion);
          host.removeEventListener("keydown", onKey);
          controls.dispose();
          model.traverse((o) => {
            if (o instanceof T.Mesh) {
              o.geometry.dispose();
              const m = o.material as THREE.MeshStandardMaterial;
              m.map?.dispose();
              m.dispose();
            }
          });
          scene.environment?.dispose();
          pmrem.dispose();
          renderer.dispose();
          renderer.domElement.remove();
        };
      } catch {
        if (!disposed) setFailed(true);
      }
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <>
      <div
        ref={hostRef}
        className="product-3d"
        tabIndex={0}
        role="img"
        aria-label="Mô hình 3D kính SeeVia màu bạc, kéo hoặc dùng phím mũi tên trái phải để xoay"
      />
      <span>{failed ? "Trình duyệt không hiển thị được mô hình 3D" : "Kéo để xoay 360°"}</span>
    </>
  );
}
