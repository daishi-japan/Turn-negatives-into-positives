import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = path.join(__dirname, "images");
const WIREFRAMES_DIR = path.join(__dirname, "..", "wireframes", "designs");
const APP_URL = "https://turn-negatives-into-positives.vercel.app";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // iPhone 14 size
    deviceScaleFactor: 2,
  });

  // === 1. Login page (no auth needed) ===
  console.log("📸 Capturing login page...");
  const loginPage = await context.newPage();
  await loginPage.goto(`${APP_URL}/login`, { waitUntil: "networkidle" });
  await loginPage.waitForTimeout(1000);
  await loginPage.screenshot({
    path: path.join(IMAGES_DIR, "04-login.png"),
    fullPage: true,
  });
  console.log("✅ 04-login.png saved");
  await loginPage.close();

  // === 2. Wireframes (local HTML files) ===
  console.log("📸 Capturing wireframes...");

  // Capture 4 representative wireframes for comparison
  const wireframeFiles = ["mono1.html", "pattern1.html", "pattern3.html", "pattern5.html"];
  const wireframeScreenshots = [];

  for (const file of wireframeFiles) {
    const page = await context.newPage();
    const filePath = path.join(WIREFRAMES_DIR, file);
    await page.goto(`file://${filePath}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    const screenshotPath = path.join(IMAGES_DIR, `wireframe-${file.replace(".html", "")}.png`);
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });
    wireframeScreenshots.push(screenshotPath);
    console.log(`✅ wireframe-${file.replace(".html", "")}.png saved`);
    await page.close();
  }

  // Capture the adopted design (Mono 1) separately
  const monoPage = await context.newPage();
  await monoPage.goto(`file://${path.join(WIREFRAMES_DIR, "mono1.html")}`, { waitUntil: "networkidle" });
  await monoPage.waitForTimeout(500);
  await monoPage.screenshot({
    path: path.join(IMAGES_DIR, "08-mono1-design.png"),
    fullPage: true,
  });
  console.log("✅ 08-mono1-design.png saved");
  await monoPage.close();

  // === 3. Try to access authenticated pages ===
  // The app redirects to /login if not authenticated
  // We'll capture what we can
  console.log("📸 Attempting to capture app pages...");
  const appPage = await context.newPage();
  await appPage.goto(APP_URL, { waitUntil: "networkidle" });
  await appPage.waitForTimeout(2000);

  // Check if we got redirected to login
  const currentUrl = appPage.url();
  console.log(`Current URL after navigating to /: ${currentUrl}`);

  if (currentUrl.includes("/login")) {
    console.log("⚠️  Redirected to login - authenticated pages need manual capture or local dev server");
    // Take the input page screenshot from the wireframe instead
    const inputWf = await context.newPage();
    await inputWf.goto(`file://${path.join(__dirname, "..", "wireframes", "index.html")}`, { waitUntil: "networkidle" });
    await inputWf.waitForTimeout(500);
    await inputWf.screenshot({
      path: path.join(IMAGES_DIR, "01-app-input.png"),
      fullPage: true,
    });
    console.log("✅ 01-app-input.png saved (from wireframe)");
    await inputWf.close();

    // Result wireframe
    const resultWf = await context.newPage();
    await resultWf.goto(`file://${path.join(__dirname, "..", "wireframes", "result.html")}`, { waitUntil: "networkidle" });
    await resultWf.waitForTimeout(500);
    await resultWf.screenshot({
      path: path.join(IMAGES_DIR, "03-result.png"),
      fullPage: true,
    });
    console.log("✅ 03-result.png saved (from wireframe)");
    await resultWf.close();

    // History wireframe
    const historyWf = await context.newPage();
    await historyWf.goto(`file://${path.join(__dirname, "..", "wireframes", "history.html")}`, { waitUntil: "networkidle" });
    await historyWf.waitForTimeout(500);
    await historyWf.screenshot({
      path: path.join(IMAGES_DIR, "05-history.png"),
      fullPage: true,
    });
    console.log("✅ 05-history.png saved (from wireframe)");
    await historyWf.close();
  } else {
    // We're on the main page - take screenshots
    await appPage.screenshot({
      path: path.join(IMAGES_DIR, "01-app-input.png"),
      fullPage: true,
    });
    console.log("✅ 01-app-input.png saved");

    // Try to navigate to history
    await appPage.goto(`${APP_URL}/history`, { waitUntil: "networkidle" });
    await appPage.waitForTimeout(1000);
    await appPage.screenshot({
      path: path.join(IMAGES_DIR, "05-history.png"),
      fullPage: true,
    });
    console.log("✅ 05-history.png saved");
  }

  await appPage.close();
  await browser.close();
  console.log("\n🎉 Screenshot capture complete!");
}

main().catch(console.error);
