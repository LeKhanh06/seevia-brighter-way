/**
 * Splits a heading into masked words for a rising reveal, the same look as the homepage titles.
 * The split is built on a clone: React's own text nodes are set aside untouched and put back
 * by `restore()`, so React can keep updating them (language switch, route change) safely.
 */
export function splitHeading(el: HTMLElement) {
  const originals = Array.from(el.childNodes);
  const clone = el.cloneNode(true) as HTMLElement;
  // Line breaks count as spaces in the spoken label.
  const spoken = el.cloneNode(true) as HTMLElement;
  spoken.querySelectorAll("br").forEach((br) => br.replaceWith(" "));
  const label = (spoken.textContent ?? "").replace(/\s+/g, " ").trim();
  const walk = (node: Node) => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        (child.textContent ?? "").split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(" "));
            return;
          }
          const outer = document.createElement("span");
          outer.className = "sv-w";
          outer.setAttribute("aria-hidden", "true");
          const inner = document.createElement("span");
          inner.className = "sv-wi";
          inner.textContent = part;
          outer.appendChild(inner);
          frag.appendChild(outer);
        });
        child.parentNode!.replaceChild(frag, child);
      } else if (child.nodeType === Node.ELEMENT_NODE && (child as Element).tagName !== "BR") {
        walk(child);
      }
    });
  };
  walk(clone);
  el.replaceChildren(...Array.from(clone.childNodes));
  el.setAttribute("aria-label", label);
  return {
    words: Array.from(el.querySelectorAll<HTMLElement>(".sv-wi")),
    restore: () => {
      el.replaceChildren(...originals);
      el.removeAttribute("aria-label");
    },
  };
}
