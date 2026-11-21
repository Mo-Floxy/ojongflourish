import puppeteer from "puppeteer-core";
import { serveDist } from "./serve-dist.mjs";

const EXE = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const staticServer = await serveDist();
const browser = await puppeteer.launch({ executablePath: EXE, headless: "new" });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

const pageErrors = [];
page.on("pageerror", (error) => pageErrors.push(String(error)));

const results = [];
const check = (name, ok, detail) => results.push({ name, ok, detail });

const ROUTES = [
  { path: "/", selector: ".hero", label: "home page" },
  { path: "/search?q=afrobeats", selector: ".search-page", label: "search page" },
  { path: "/library?tab=liked", selector: ".library-page", label: "library page" },
  { path: "/playlists", selector: ".playlist-page", label: "playlists page" },
  { path: "/artist/audius/example", selector: ".detail-page", label: "artist page" },
  { path: "/album/audius/example", selector: ".detail-page", label: "album page" },
  { path: "/not-a-real-page", selector: ".hero", label: "unknown route fallback" },
];

try {
  for (const route of ROUTES) {
    pageErrors.length = 0;
    const response = await page.goto(`${staticServer.url}${route.path.slice(1)}`, {
      waitUntil: "domcontentloaded",
    });
    await page.waitForSelector(route.selector, { timeout: 15000 });
    await page.waitForSelector(".player", { timeout: 15000 });
    check(`${route.label} responds`, response?.ok() === true, response?.status());
    check(`${route.label} keeps the player mounted`, Boolean(await page.$(".player")), null);
    check(`${route.label} has no page errors`, pageErrors.length === 0, pageErrors);
  }
} finally {
  await browser.close();
  await staticServer.close();
}

for (const result of results) {
  console.log(`${result.ok ? "PASS" : "FAIL"}  ${result.name}  (${JSON.stringify(result.detail)})`);
}
if (results.some((result) => !result.ok)) process.exitCode = 1;
