// Device polish at runtime: smooth scrolling under a resting mouse, and proportional scaling
// on large screens. Styles that pair with this live in src/styles/device-polish.css.

/** Layout width the site is designed at; wider screens scale the whole page up from here. */
const DESIGN_WIDTH = 1440;
/** Beyond this the page stops growing (very large or ultra-wide monitors). */
const MAX_ZOOM = 2.4;

let pageZoom = 1;
/** Current page scale (1 below DESIGN_WIDTH). Canvas renderers use it to stay sharp. */
export const getPageZoom = () => pageZoom;

export function setupDevicePolish() {
  const html = document.documentElement;
  const root = document.getElementById("root");

  // While the page scrolls, content glides under a resting mouse and keeps toggling hover
  // effects (lift + drop-shadow filter) on large cards, which stutters. Hover is paused until
  // scrolling stops; real hovering is untouched.
  let scrollTimer = 0;
  addEventListener(
    "scroll",
    () => {
      if (!html.classList.contains("is-scrolling")) html.classList.add("is-scrolling");
      clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => html.classList.remove("is-scrolling"), 160);
    },
    { passive: true },
  );

  // On screens wider than the design width the page scales up as a whole, so a 1920 or
  // 2560 display shows the same composition as a 1440 laptop instead of a narrow column
  // floating in empty space. CSS divides viewport units by --z where they size layout.
  if (!root) return;
  const apply = () => {
    const width = html.clientWidth;
    const z = width > DESIGN_WIDTH ? Math.min(width / DESIGN_WIDTH, MAX_ZOOM) : 1;
    const rounded = Math.round(z * 1000) / 1000;
    if (rounded === pageZoom) return;
    pageZoom = rounded;
    html.classList.toggle("sv-zoomed", rounded > 1);
    html.style.setProperty("--z", String(rounded));
    root.style.zoom = rounded > 1 ? String(rounded) : "";
    window.dispatchEvent(new CustomEvent("seevia:zoom", { detail: rounded }));
  };
  apply();
  let frame = 0;
  addEventListener("resize", () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(apply);
  });
}
