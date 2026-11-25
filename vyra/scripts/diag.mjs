import puppeteer from "puppeteer-core";
import { serveDist } from "./serve-dist.mjs";

const staticServer = await serveDist();
const URL = process.env.VYRA_URL || staticServer.url;

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: "new",
  userDataDir: "C:/Users/HP/AppData/Local/Temp/opencode/vyra-qa-diag",
  args: ["--hide-scrollbars"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 1 });
await page.goto(URL, { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 800));
const out = await page.evaluate(() => {
  const vw = window.innerWidth;
  const els = [...document.querySelectorAll("body *")]
    .map((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return { tag: el.tagName, cls: String(el.className).slice(0, 60), right: Math.round(r.right), left: Math.round(r.left), w: Math.round(r.width), pos: cs.position };
    })
    .filter((e) => e.right > vw + 1 && e.pos !== "fixed")
    .sort((a, b) => b.right - a.right)
    .slice(0, 15);
  return { vw, scrollWidth: document.documentElement.scrollWidth, els };
});
console.log(JSON.stringify(out, null, 2));
await browser.close();
await staticServer.close();
