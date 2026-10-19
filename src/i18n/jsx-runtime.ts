import {
  createContext,
  useContext,
  type ElementType,
  type ReactNode,
  type Key,
} from "react";
import {
  jsx as reactJsx,
  jsxs as reactJsxs,
  Fragment,
} from "react/jsx-runtime";
import { useLanguage, translate, type Language } from "./language";
export { Fragment };
export type { JSX } from "react/jsx-runtime";

// Localise at React render time, never by changing React-owned DOM nodes.
// Keep values, event handlers, keys, refs and internal identifiers unchanged.
const Untranslated = createContext(false);
function localiseChild(child: ReactNode, language: Language): ReactNode {
  return typeof child === "string"
    ? translate(child, language)
    : Array.isArray(child)
      ? child.map((value) => localiseChild(value, language))
      : child;
}
function LocalisedFragment({
  children,
  staticChildren,
}: {
  children?: ReactNode;
  staticChildren: boolean;
}) {
  const language = useLanguage();
  const excluded = useContext(Untranslated);
  return (staticChildren ? reactJsxs : reactJsx)(Fragment, {
    children: excluded ? children : localiseChild(children, language),
  });
}
const htmlCache = new Map<string, string>();
const textAttributes = [
  "alt",
  "title",
  "placeholder",
  "aria-label",
  "aria-description",
  "aria-valuetext",
];
function localiseHtml(html: string, language: Language) {
  if (language === "vi") return html;
  if (htmlCache.has(html)) return htmlCache.get(html)!;
  const template = document.createElement("template");
  template.innerHTML = html;
  const walker = document.createTreeWalker(
    template.content,
    NodeFilter.SHOW_TEXT,
  );
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (!node.parentElement?.closest('[translate="no"],script,style,textarea'))
      node.textContent = translate(node.textContent ?? "", language);
  }
  template.content.querySelectorAll("*").forEach((element) => {
    if (element.closest('[translate="no"]')) return;
    textAttributes.forEach((attribute) => {
      if (element.hasAttribute(attribute))
        element.setAttribute(
          attribute,
          translate(element.getAttribute(attribute)!, language),
        );
    });
  });
  const result = template.innerHTML;
  htmlCache.set(html, result);
  return result;
}
type Props = Record<string, unknown> & {
  children?: ReactNode;
  translate?: string;
  dangerouslySetInnerHTML?: { __html: string };
};
function LocalisedHost({
  tag,
  original,
  staticChildren,
}: {
  tag: string;
  original: Props;
  staticChildren: boolean;
}) {
  const language = useLanguage();
  const inherited = useContext(Untranslated);
  const excluded =
    inherited ||
    original.translate === "no" ||
    ["script", "style"].includes(tag);
  const props = { ...original };
  if (!excluded && language === "en") {
    textAttributes.forEach((attribute) => {
      if (typeof props[attribute] === "string")
        props[attribute] = translate(props[attribute] as string, language);
    });
    if (tag !== "textarea")
      props.children = localiseChild(props.children, language);
    if (props.dangerouslySetInnerHTML)
      props.dangerouslySetInnerHTML = {
        __html: localiseHtml(props.dangerouslySetInnerHTML.__html, language),
      };
  }
  const element = (staticChildren ? reactJsxs : reactJsx)(
    tag as ElementType,
    props,
  );
  return original.translate === "no"
    ? reactJsx(Untranslated.Provider, { value: true, children: element })
    : element;
}
function create(
  factory: typeof reactJsx,
  type: ElementType,
  props: Props,
  key?: Key,
) {
  if (type === Fragment)
    return factory(
      LocalisedFragment,
      { children: props.children, staticChildren: factory === reactJsxs },
      key,
    );
  if (typeof type !== "string") return factory(type, props, key);
  return factory(
    LocalisedHost,
    { tag: type, original: props, staticChildren: factory === reactJsxs },
    key,
  );
}
export const jsx: typeof reactJsx = (type, props, key) =>
  create(reactJsx, type, (props ?? {}) as Props, key);
export const jsxs: typeof reactJsxs = (type, props, key) =>
  create(reactJsxs, type, (props ?? {}) as Props, key);
