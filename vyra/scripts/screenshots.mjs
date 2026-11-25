import puppeteer from "puppeteer-core";
import { serveDist } from "./serve-dist.mjs";

const EXE = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const staticServer = await serveDist();
const URL = process.env.VYRA_URL || staticServer.url;

const browser = await puppeteer.launch({
  executablePath: EXE,
  headless: "new",
  userDataDir: "C:/Users/HP/AppData/Local/Temp/opencode/vyra-qa-screenshots",
  args: ["--hide-scrollbars", "--force-color-profile=srgb"],
});

const settle = async (page) => {
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.65);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 230));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 500));
  });
};

const shotAt = async (page, name, y) => {
  await page.evaluate((top) => window.scrollTo(0, top), y);
  await new Promise((r) => setTimeout(r, 650));
  await page.screenshot({ path: `.shots/${name}.png` });
};

const desktop = await browser.newPage();
await desktop.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 1 });
await desktop.goto(URL, { waitUntil: "networkidle0" });
await settle(desktop);

const metrics = await desktop.evaluate(() => ({
  iw: window.innerWidth,
  scrollWidth: document.documentElement.scrollWidth,
  height: document.body.scrollHeight,
}));
console.log("desktop", JSON.stringify(metrics));

await shotAt(desktop, "d-1-hero", 0);
await shotAt(desktop, "d-2-genres", 720);
await shotAt(desktop, "d-3-trending", 1250);
await shotAt(desktop, "d-4-charts", 2150);
await shotAt(desktop, "d-5-bottom", 2600);

const hero = await desktop.$(".hero");
await hero.screenshot({ path: ".shots/hero-detail.png" });

const mobile = await browser.newPage();
await mobile.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
await mobile.goto(URL, { waitUntil: "networkidle0" });
await settle(mobile);
const mMetrics = await mobile.evaluate(() => ({
  iw: window.innerWidth,
  scrollWidth: document.documentElement.scrollWidth,
  height: document.body.scrollHeight,
}));
console.log("mobile", JSON.stringify(mMetrics));
await shotAt(mobile, "m-1-hero", 0);
await shotAt(mobile, "m-2-genres", 720);
await shotAt(mobile, "m-3-trending", 1400);
await shotAt(mobile, "m-4-mixes", 2200);
await shotAt(mobile, "m-5-charts", 3000);

const tablet = await browser.newPage();
await tablet.setViewport({ width: 900, height: 1180, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
await tablet.goto(URL, { waitUntil: "networkidle0" });
await settle(tablet);
await shotAt(tablet, "t-1-hero", 0);
await shotAt(tablet, "t-2-sections", 900);

await browser.close();
await staticServer.close();
console.log("done");
