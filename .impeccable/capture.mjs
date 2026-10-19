import { chromium } from "@playwright/test";
const base = "http://localhost:5173";
const browser = await chromium.launch({ channel: "chrome" });
async function shot(path, file, width, height) {
  const page = await browser.newPage({ viewport: { width, height }, reducedMotion: "reduce" });
  await page.goto(base + path, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 400) { scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); }
    document.querySelectorAll('[class*="pending"]').forEach(e => [...e.classList].forEach(c => c.includes("pending") && e.classList.remove(c)));
    scrollTo(0, 0);
  });
  await page.waitForTimeout(900);
  await page.screenshot({ path: `.impeccable/review/${file}`, fullPage: true });
  await page.close();
}
await shot("/", "desktop.png", 1440, 900);
await shot("/", "mobile.png", 390, 844);
for (const [p, n] of [["/san-pham","product"],["/cong-nghe","technology"],["/ve-chung-toi","about"],["/cong-dong","community"],["/tin-tuc","news"],["/doi-tac","partner"],["/lien-he","contact"],["/tong-quan","overview"],["/chinh-sach-bao-mat","privacy"]]) {
  await shot(p, `desktop-${n}.png`, 1440, 900);
}
await shot("/san-pham", "mobile-product.png", 390, 844);
await browser.close();
console.log("done");
