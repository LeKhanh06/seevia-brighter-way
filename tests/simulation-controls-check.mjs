import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage();
  await page.goto(process.env.BASE_URL || "http://127.0.0.1:5176");
  const frame = page.locator(".photo-stage");
  await frame.locator(".photo-box").first().waitFor();
  await frame.getByRole("button", { name: "Ẩn vùng đánh dấu" }).click();
  assert.equal(await frame.locator(".photo-box").count(), 0);
  await frame.getByRole("button", { name: "Hiện vùng đánh dấu" }).click();
  assert.ok((await frame.locator(".photo-box").count()) > 0);
  await frame.getByRole("button", { name: "Tạm dừng quét" }).click();
  assert.equal(
    await frame
      .locator(".photo-scan")
      .evaluate((el) => getComputedStyle(el).animationPlayState),
    "paused",
  );
  await frame.getByRole("button", { name: "Tiếp tục quét" }).click();
  assert.equal(
    await frame
      .locator(".photo-scan")
      .evaluate((el) => getComputedStyle(el).animationPlayState),
    "running",
  );
  await page.getByRole("tab", { name: "Nhận diện tiền", exact: true }).click();
  assert.equal(
    await frame
      .getByRole("button", { name: "Ẩn vùng đánh dấu" })
      .getAttribute("aria-pressed"),
    "true",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(
    await frame
      .locator(".photo-scan")
      .evaluate((el) => getComputedStyle(el).animationName),
    "none",
  );
  console.log(
    "PASS: region visibility, scan pause/resume, scenario reset, reduced motion.",
  );
} finally {
  await browser.close();
}
