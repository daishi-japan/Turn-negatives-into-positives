import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = path.join(__dirname, "images");
const WIREFRAMES_DIR = path.join(__dirname, "..", "wireframes", "designs");

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });

  // === Step 1: 5 initial design patterns ===
  const patterns = ["pattern1", "pattern2", "pattern3", "pattern4", "pattern5"];
  for (const name of patterns) {
    const page = await context.newPage();
    await page.goto(`file://${path.join(WIREFRAMES_DIR, `${name}.html`)}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(IMAGES_DIR, `design-${name}.png`), fullPage: true });
    console.log(`✅ design-${name}.png`);
    await page.close();
  }

  // === Step 2: pattern3 variations (3-1 to 3-5) ===
  for (let i = 1; i <= 5; i++) {
    const name = `pattern3-${i}`;
    const page = await context.newPage();
    await page.goto(`file://${path.join(WIREFRAMES_DIR, `${name}.html`)}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(IMAGES_DIR, `design-${name}.png`), fullPage: true });
    console.log(`✅ design-${name}.png`);
    await page.close();
  }

  // === Step 3: mono1-5 sharp designs ===
  for (let i = 1; i <= 5; i++) {
    const name = `mono${i}`;
    const page = await context.newPage();
    await page.goto(`file://${path.join(WIREFRAMES_DIR, `${name}.html`)}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(IMAGES_DIR, `design-${name}.png`), fullPage: true });
    console.log(`✅ design-${name}.png`);
    await page.close();
  }

  await browser.close();
  console.log("\n🎉 All design screenshots captured!");
}

main().catch(console.error);
