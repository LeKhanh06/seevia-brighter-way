/*
 * Dựng DOM an toàn: chuỗi luôn đi vào text node hoặc setAttribute, không bao giờ qua innerHTML.
 * Nhờ vậy dữ liệu từ API không thể chèn mã vào trang.
 */
const SVG_NS = "http://www.w3.org/2000/svg";

function apply(el, props) {
  for (const [key, value] of Object.entries(props || {})) {
    if (value == null || value === false) continue;
    if (key === "class") el.setAttribute("class", Array.isArray(value) ? value.filter(Boolean).join(" ") : value);
    else if (key === "style" && typeof value === "object") {
      for (const [name, val] of Object.entries(value)) if (val != null) el.style.setProperty(name, String(val));
    } else if (key === "dataset") Object.assign(el.dataset, value);
    else if (key === "aria") for (const [name, val] of Object.entries(value)) el.setAttribute(`aria-${name}`, String(val));
    else if (key.startsWith("on") && typeof value === "function") el.addEventListener(key.slice(2).toLowerCase(), value);
    else if (value === true) el.setAttribute(key, "");
    else el.setAttribute(key, String(value));
  }
}

function append(el, children) {
  for (const child of children.flat(Infinity)) {
    if (child == null || child === false) continue;
    el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
}

export function h(tag, props, ...children) {
  const el = document.createElement(tag);
  apply(el, props);
  append(el, children);
  return el;
}

export function s(tag, props, ...children) {
  const el = document.createElementNS(SVG_NS, tag);
  apply(el, props);
  append(el, children);
  return el;
}

export const fragment = (...children) => {
  const f = document.createDocumentFragment();
  append(f, children);
  return f;
};
