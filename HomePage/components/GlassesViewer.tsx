import { useEffect, useRef, useState } from "react";
import type * as THREE from "three";
import { buildGlasses } from "./glassesModel";
import { getPageZoom } from "../../src/support/devicePolish";

/*
 * Khung xem 3D cho mô hình kính SeeVia (hình học nằm ở glassesModel.ts).
 * Kéo để xoay 360°, mũi tên trái/phải khi đang focus, tự quay chậm khi không bị giảm chuyển động.
 * Thả tay 5 giây thì kính tự về góc nhìn ban đầu (giảm chuyển động: về ngay, không chạy hiệu ứng).
 */

/** Bốn phiên bản màu, cùng tên với phần Màu sắc ở trang Sản phẩm. Chỉ thân kính và viền camera đổi màu. */
type Finish = { color: number; metalness: number; roughness: number; clearcoat: number };
const COLORS: { id: string; label: string; model: string; swatch: string; body: Finish; bezel: Finish }[] = [
  {
    id: "silver",
    label: "Bạc ánh ngọc trai",
    model: "Mô hình 3D kính SeeVia màu bạc, kéo hoặc dùng phím mũi tên trái phải để xoay",
    swatch: "#dee2e8",
    body: { color: 0xc9c9c5, metalness: 0.8, roughness: 0.27, clearcoat: 0.5 },
    bezel: { color: 0xe2e2df, metalness: 0.9, roughness: 0.18, clearcoat: 1 },
  },
  {
    id: "graphite",
    label: "Đen than chì",
    model: "Mô hình 3D kính SeeVia màu đen than chì, kéo hoặc dùng phím mũi tên trái phải để xoay",
    swatch: "#383a41",
    body: { color: 0x3a3c43, metalness: 0.55, roughness: 0.32, clearcoat: 0.6 },
    bezel: { color: 0x5a5d66, metalness: 0.8, roughness: 0.24, clearcoat: 1 },
  },
  {
    id: "crimson",
    label: "Đỏ rượu trầm",
    model: "Mô hình 3D kính SeeVia màu đỏ rượu trầm, kéo hoặc dùng phím mũi tên trái phải để xoay",
    swatch: "#a52c48",
    body: { color: 0x6e1a2d, metalness: 0.3, roughness: 0.34, clearcoat: 0.6 },
    bezel: { color: 0x8c2a42, metalness: 0.6, roughness: 0.26, clearcoat: 1 },
  },
  {
    id: "mist",
    label: "Xanh lam nhạt",
    model: "Mô hình 3D kính SeeVia màu xanh lam nhạt, kéo hoặc dùng phím mũi tên trái phải để xoay",
    swatch: "#8fc7f4",
    body: { color: 0x8cc3ef, metalness: 0.3, roughness: 0.3, clearcoat: 0.6 },
    bezel: { color: 0xb7dbf7, metalness: 0.6, roughness: 0.22, clearcoat: 1 },
  },
];
type Paint = { body: THREE.MeshPhysicalMaterial; bezel: THREE.MeshPhysicalMaterial };
const applyFinish = (m: THREE.MeshPhysicalMaterial, f: Finish) => {
  m.color.setHex(f.color);
  m.metalness = f.metalness;
  m.roughness = f.roughness;
  m.clearcoat = f.clearcoat;
};

export default function GlassesViewer() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);
  const paintRef = useRef<Paint | null>(null);
  const colorRef = useRef(0);
  colorRef.current = colorIndex;
  const color = COLORS[colorIndex];

  // Đổi màu ngay trên vật liệu; vòng render đang chạy sẽ vẽ lại ở khung hình kế tiếp.
  useEffect(() => {
    const paint = paintRef.current;
    if (!paint) return;
    applyFinish(paint.body, COLORS[colorIndex].body);
    applyFinish(paint.bezel, COLORS[colorIndex].bezel);
  }, [colorIndex]);

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
        paintRef.current = model.userData.paint as Paint;
        applyFinish(paintRef.current.body, COLORS[colorRef.current].body);
        applyFinish(paintRef.current.bezel, COLORS[colorRef.current].bezel);

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
          // The page may be scaled up on large screens (devicePolish.ts): render enough pixels to stay sharp.
          renderer.setPixelRatio(Math.min(devicePixelRatio * getPageZoom(), 3));
          renderer.setSize(w, h, false);
          camera.aspect = w / h;
          const tanV = Math.tan((camera.fov * Math.PI) / 360);
          const tanH = tanV * camera.aspect;
          camera.position.setLength(FRAME_PAD * Math.max(0.072 / tanV, 0.13 / tanH));
          camera.updateProjectionMatrix();
        };
        const ro = new ResizeObserver(fit);
        ro.observe(host);
        addEventListener("seevia:zoom", fit);
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
          removeEventListener("seevia:zoom", fit);
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
        aria-label={color.model}
      />
      <div className="glasses-colors" role="group" aria-label="Chọn màu kính">
        {COLORS.map((c, i) => (
          <button
            key={c.id}
            type="button"
            className="glasses-color"
            aria-pressed={i === colorIndex}
            aria-label={c.label}
            title={c.label}
            onClick={() => setColorIndex(i)}
          >
            <span className="glasses-swatch" style={{ "--swatch": c.swatch } as React.CSSProperties} />
          </button>
        ))}
        <span className="glasses-color-name" aria-hidden="true">{color.label}</span>
      </div>
      <span>{failed ? "Trình duyệt không hiển thị được mô hình 3D" : "Kéo để xoay 360°"}</span>
    </>
  );
}
