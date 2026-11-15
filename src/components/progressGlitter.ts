export function createProgressGlitter() {
  const progress = document.createElement("div");
  progress.id = "progress";
  progress.setAttribute("aria-hidden", "true");

  const bar = document.createElement("div");
  bar.id = "progress-bar";
  progress.appendChild(bar);

  const layer = document.createElement("div");
  layer.id = "sparkle-layer";
  layer.setAttribute("aria-hidden", "true");
  document.body.append(progress, layer);

  let pct = 0;
  let lastPct = 0;
  let lastSpawn = 0;
  let frame = 0;

  const spawn = (x: number) => {
    const el = document.createElement("span");
    const size = 2 + Math.random() * 5;
    const isStar = Math.random() < 0.35;
    el.className = `sparkle${isStar ? " star" : ""}`;
    el.style.width = el.style.height = `${size}px`;
    el.style.left = `${x - Math.random() * 14}px`;
    el.style.top = `${1 + Math.random() * 3}px`;
    layer.appendChild(el);

    const dx = -(10 + Math.random() * 40);
    const dy = 6 + Math.random() * 26;
    const life = 700 + Math.random() * 900;
    const spin = isStar ? Math.random() * 180 - 90 : 0;
    el.animate(
      [
        { transform: "translate(0,0) scale(.3) rotate(0deg)", opacity: 0 },
        {
          transform: `translate(${dx * 0.3}px,${dy * 0.3}px) scale(1) rotate(${spin * 0.4}deg)`,
          opacity: 1,
          offset: 0.25,
        },
        { transform: `translate(${dx}px,${dy}px) scale(.2) rotate(${spin}deg)`, opacity: 0 },
      ],
      { duration: life, easing: "cubic-bezier(.2,.6,.4,1)" },
    ).onfinish = () => el.remove();
  };

  const loop = (time: number) => {
    const x = pct * window.innerWidth;
    const moving = Math.abs(pct - lastPct) > 0.0001;
    const gap = moving ? 35 : 220;
    if (!document.hidden && pct > 0.002 && time - lastSpawn > gap) {
      spawn(x);
      if (moving && Math.random() < 0.5) spawn(x);
      lastSpawn = time;
    }
    lastPct = pct;
    frame = requestAnimationFrame(loop);
  };

  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    frame = requestAnimationFrame(loop);
  }

  return {
    update(value: number) {
      pct = Math.min(1, Math.max(0, value));
      bar.style.width = `${pct * 100}%`;
    },
    remove() {
      cancelAnimationFrame(frame);
      layer.remove();
      progress.remove();
    },
  };
}
