/*
 * Kiểm thử nhanh: duyệt mọi route (Chrome headless, dữ liệu mẫu) và báo lỗi nếu chữ hiển thị, tooltip, aria-label, title
 * chứa "[object", "undefined", "NaN"; đồng thời chạy kiểm tra chéo số liệu mẫu (js/api/mock/validate.js).
 *   node tools/check-routes.mjs            (cần Chrome/Edge; đặt CHROME=<đường dẫn> nếu không ở vị trí mặc định)
 * Thoát với mã 1 nếu có lỗi. Không phải một phần của ứng dụng; có thể xóa nếu không dùng.
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { pathToFileURL, fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CHROME = process.env.CHROME || [
  "C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/google-chrome", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].find(p => fs.existsSync(p));
const ROUTES = ["overview", "see-read", "find", "connect", "go", "community", "time", "quality", "engagement", "safety", "accounts", "devices", "errors", "config",
  "account-detail/TK-0001", "device-detail/KINH-01", "profile"];
const BAD = /\[object|undefined|\bNaN\b/;
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".woff2": "font/woff2" };
let failures = 0;
const fail = msg => { failures += 1; console.error("✗", msg); };

// 1) Kiểm tra chéo dữ liệu mẫu
const { validateMock } = await import(pathToFileURL(path.join(ROOT, "js/api/mock/validate.js")).href);
const problems = validateMock();
problems.forEach(p => fail(`Dữ liệu mẫu: ${p}`));
if (!problems.length) console.log("✓ Dữ liệu mẫu khớp nhau (tổng lượt, nhóm, SOS, trạng thái, lỗi, phần trăm)");

// 2) Duyệt route trong trình duyệt
if (!CHROME) { console.error("Không tìm thấy Chrome/Edge (đặt biến CHROME)."); process.exit(1); }
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]); if (p === "/") p = "/index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
  fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}/index.html`;
const port = 9400 + Math.floor(Math.random() * 400);
const profile = fs.mkdtempSync(path.join(process.env.TEMP || "/tmp", "seevia-check-"));
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${port}`, "--disable-gpu", "--no-first-run", `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore" });
let targets;
for (let i = 0; i < 50 && !targets?.length; i++) { try { targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); } catch { await new Promise(r => setTimeout(r, 200)); } }
const ws = new WebSocket(targets.find(t => t.type === "page").webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener("open", r));
let id = 0; const pending = new Map();
ws.addEventListener("message", m => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } });
const send = (method, params = {}) => new Promise(res => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async expr => (await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true })).result?.result?.value;
const wait = ms => new Promise(r => setTimeout(r, ms));

const SCAN = `(() => {
  const bad = [];
  const re = /\\[object|undefined|\\bNaN\\b/;
  const text = document.body.innerText; if (re.test(text)) bad.push("chữ hiển thị: " + text.match(re.input ? re : re)?.[0]);
  for (const el of document.querySelectorAll("[data-tooltip],[data-tooltip-use],[aria-label],[title],[alt]")) {
    for (const a of ["data-tooltip", "data-tooltip-use", "aria-label", "title", "alt"]) { const v = el.getAttribute(a); if (v && re.test(v)) bad.push(a + ": " + v.slice(0, 80)); }
  }
  // Mở thử từng tooltip dấu "i": nội dung hiển thị không được chứa chuỗi lỗi.
  for (const btn of document.querySelectorAll(".info-tip")) { btn.dispatchEvent(new FocusEvent("focusin", { bubbles: true })); const t = document.querySelector("#global-tooltip"); if (t && !t.hidden && re.test(t.innerText)) bad.push("tooltip mở: " + t.innerText.slice(0, 80)); if (t && t.hidden) bad.push("tooltip không mở được"); }
  return JSON.stringify(bad);
})()`;

try {
  await send("Page.enable"); await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await send("Page.addScriptToEvaluateOnNewDocument", { source: `sessionStorage.setItem('seevia-session', JSON.stringify({token:'mock-token',user:{display_name:'Khánh Hà',email_masked:'kh***@gmail.com'},expiresAt:Date.now()+3.6e6}));` });
  for (const route of ROUTES) {
    await send("Page.navigate", { url: `${base}#${route}` });
    await wait(500);
    for (let i = 0; i < 60 && !(await evaluate("!document.querySelector('.skeleton-page') && document.querySelector('#page-body')?.children.length")); i++) await wait(100);
    await wait(900);   // chờ hiệu ứng số chạy xong
    const bad = JSON.parse(await evaluate(SCAN) || "[]");
    if (bad.length) bad.forEach(b => fail(`#${route} → ${b}`)); else console.log(`✓ #${route}`);
  }
} finally { try { ws.close(); } catch {} chrome.kill(); server.close(); }
if (failures) { console.error(`\n${failures} lỗi`); process.exit(1); }
console.log("\nTất cả route sạch.");
