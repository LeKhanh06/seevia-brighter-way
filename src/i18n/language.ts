import { useSyncExternalStore } from "react";
import english from "./en.json";

export type Language = "vi" | "en";
const normalize = (value: string) =>
  value.replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
const translations = new Map(
  Object.entries(english).map(([vi, en]) => [normalize(vi), en]),
);
// One store across Vite's optimised JSX runtime and normal application modules.
type LanguageStore = { language: Language; listeners: Set<() => void> };
const shared = globalThis as typeof globalThis & {
  __seeviaLanguageStore?: LanguageStore;
};
if (!shared.__seeviaLanguageStore) {
  let initial: Language = "vi";
  try {
    initial = localStorage.getItem("seevia-language") === "en" ? "en" : "vi";
  } catch {
    /* Storage is optional. */
  }
  shared.__seeviaLanguageStore = { language: initial, listeners: new Set() };
}
const store = shared.__seeviaLanguageStore;
document.documentElement.lang = store.language;
const listeners = store.listeners;
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
export const getLanguage = () => store.language;
export const useLanguage = () =>
  useSyncExternalStore(subscribe, getLanguage, () => "vi" as Language);
export function setLanguage(next: Language) {
  if (next === store.language) return;
  store.language = next;
  document.documentElement.lang = next;
  try {
    localStorage.setItem("seevia-language", next);
  } catch {
    /* Keep working without storage. */
  }
  listeners.forEach((listener) => listener());
}
export function translate(
  text: string,
  locale: Language = store.language,
): string {
  if (locale === "vi" || !text.trim()) return text;
  const key = normalize(text);
  const translated = translations.get(key);
  if (translated !== undefined) return text.replace(text.trim(), translated);
  const prefixes: [RegExp, string][] = [
    [/^Đọc bài:\s*/, "Read article: "],
    [/^Đọc ghi chú:\s*/, "Read note: "],
    [/^Mở ghi chú:\s*/, "Open note: "],
    [/^Đọc nguồn\s*/, "Read source: "],
    [/^Khung ảnh cận\s*/, "Close-up image: "],
  ];
  for (const [pattern, prefix] of prefixes)
    if (pattern.test(key))
      return prefix + translate(key.replace(pattern, ""), locale);
  const position = key.match(/^Vị trí (\d+):\s*(.+)$/);
  if (position)
    return `Position ${position[1]}: ${translate(position[2], locale)}`;
  const closeup = key.match(/^Ảnh chụp cận (.+) trên kính SeeVia$/);
  if (closeup)
    return `Close-up of ${translate(closeup[1], locale)} on SeeVia glasses`;
  if (key.endsWith(" — SeeVia"))
    return translate(key.slice(0, -9), locale) + " — SeeVia";
  return text;
}
export function searchText(text: string) {
  return `${text} ${translate(text, "en")}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}
