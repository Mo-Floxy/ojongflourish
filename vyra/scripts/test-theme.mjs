import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { serveDist } from "./serve-dist.mjs";

const EXE = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SHOTS = path.join(ROOT, ".shots");
const staticServer = await serveDist();
const browser = await puppeteer.launch({ executablePath: EXE, headless: "new" });
const page = await browser.newPage();
const pageErrors = [];
page.on("pageerror", (error) => pageErrors.push(String(error)));

const results = [];
const check = (name, ok, detail) => results.push({ name, ok, detail });
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const themeState = () =>
  page.evaluate(() => ({
    theme: document.documentElement.dataset.theme,
    bsTheme: document.documentElement.dataset.bsTheme,
    colorScheme: document.documentElement.style.colorScheme,
    filter: getComputedStyle(document.documentElement).filter,
    stored: localStorage.getItem("vyra:theme:v1"),
    mediaFilter: document.querySelector(".player__art img")
      ? getComputedStyle(document.querySelector(".player__art img")).filter
      : "",
  }));

try {
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(staticServer.url, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".player");
  const initial = await themeState();
  check("starts in dark neon theme", initial.theme === "dark" && initial.bsTheme === "dark", initial);

  await page.click(".theme-switch");
  await page.waitForFunction(() => document.documentElement.dataset.theme === "light");
  await wait(250);
  const light = await themeState();
  check(
    "switch applies a light palette",
    light.theme === "light" && light.bsTheme === "light" && light.colorScheme === "light" && light.filter.includes("invert"),
    light
  );
  check("real artwork keeps original colours", light.mediaFilter.includes("invert"), light.mediaFilter);
  check(
    "theme choice is remembered",
    light.stored === "light",
    light.stored
  );

  fs.mkdirSync(SHOTS, { recursive: true });
  await page.screenshot({ path: path.join(SHOTS, "theme-light-home.png") });

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector(".player");
  const restored = await themeState();
  check("light theme survives reload", restored.theme === "light" && restored.filter.includes("invert"), restored);

  await page.click('[aria-label="Play"]');
  await page.waitForFunction(() => Boolean(window.localStorage.getItem("vyra:theme:v1")));
  await page.click(".player__lyrics-btn");
  await page.waitForSelector(".lyrics__panel");
  await wait(400);
  const lyricsVisible = await page.evaluate(() => {
    const panel = document.querySelector(".lyrics__panel");
    return Boolean(panel && panel.getBoundingClientRect().width > 0);
  });
  check("lyrics panel remains usable in light mode", lyricsVisible);
  await page.screenshot({ path: path.join(SHOTS, "theme-light-lyrics.png") });
  await page.click(".lyrics__close");

  await page.setViewport({ width: 390, height: 844 });
  await page.goto(`${staticServer.url}search`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".player");
  const mobile = await page.evaluate(() => ({
    theme: document.documentElement.dataset.theme,
    overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    playerVisible: Boolean(document.querySelector(".player")?.getBoundingClientRect().width),
  }));
  check("mobile light layout fits the viewport", mobile.theme === "light" && !mobile.overflow && mobile.playerVisible, mobile);
  await page.screenshot({ path: path.join(SHOTS, "theme-light-mobile.png") });

  check("no page errors", pageErrors.length === 0, pageErrors);
} finally {
  await browser.close();
  await staticServer.close();
}

for (const result of results) {
  console.log(`${result.ok ? "PASS" : "FAIL"}  ${result.name}  (${JSON.stringify(result.detail ?? null)})`);
}
if (results.some((result) => !result.ok)) process.exitCode = 1;
