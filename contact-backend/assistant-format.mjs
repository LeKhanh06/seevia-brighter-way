import pages from "../src/support/pages.json" with { type: "json" };
const hrefs = new Set(Object.values(pages).map((page) => page.href));
export function normalizeAnswer(value) {
  if (typeof value !== "string") return value;
  return value
    .replace(/\r\n?/g, "\n")
    .replace(/\\r\\n|\\n|\\r/g, "\n")
    .trim();
}
export function safeAnswer(value) {
  if (typeof value !== "string" || !value.trim() || value.length > 2400)
    return false;
  if (/https?:\/\/|www\.|javascript:|mailto:|<[^>]*>/iu.test(value))
    return false;
  if (/^\s*[\[{]\s*"(?:answer|suggested_questions|sourceIds)"/u.test(value))
    return false;
  for (const match of value.matchAll(/\[[^\]\n]+\]\(([^)]+)\)/g)) {
    if (!hrefs.has(match[1])) return false;
  }
  return true;
}
