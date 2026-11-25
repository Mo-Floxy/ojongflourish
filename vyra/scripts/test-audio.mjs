import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";
import puppeteer from "puppeteer-core";
import { serveDist } from "./serve-dist.mjs";
import { TRACKS } from "../src/data/music.js";

const EXE = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const staticServer = await serveDist();
const browser = await puppeteer.launch({
  executablePath: EXE,
  headless: "new",
  userDataDir: "C:/Users/HP/AppData/Local/Temp/opencode/vyra-qa-audio",
  args: ["--autoplay-policy=no-user-gesture-required"],
});
const page = await browser.newPage();
const pageErrors = [];
page.on("pageerror", (error) => pageErrors.push(String(error)));
await page.setViewport({ width: 1440, height: 900 });
await page.evaluateOnNewDocument(() => {
  window.__vyraMedia = { plays: 0, pauses: 0, sources: [], times: [], element: null };
  const proto = HTMLMediaElement.prototype;
  const nativePlay = proto.play;
  const nativePause = proto.pause;
  proto.play = function play(...args) {
    window.__vyraMedia.plays += 1;
    window.__vyraMedia.sources.push(this.src);
    window.__vyraMedia.element = this;
    return nativePlay.apply(this, args);
  };
  proto.pause = function pause(...args) {
    window.__vyraMedia.pauses += 1;
    return nativePause.apply(this, args);
  };
});

const media = () => page.evaluate(() => ({ ...window.__vyraMedia }));
const elapsed = () =>
  page.evaluate(() => document.querySelector(".player__timeline span")?.textContent ?? "");
const results = [];
const check = (name, ok, detail) => results.push({ name, ok, detail });
const waitFor = async (fn, timeout = 20000) => {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    if (await page.evaluate(fn)) return;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Timed out waiting for audio state");
};

try {
  const missing = TRACKS.filter((track) => {
    const path = resolve("dist", track.src.replace(/^\//, ""));
    return !existsSync(path) || statSync(path).size < 10_000;
  }).map((track) => track.src);
  check(`all ${TRACKS.length} tracks have local audio files`, missing.length === 0, missing);

  await page.goto(staticServer.url, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".player");
  const before = await media();
  check("no playback before interaction", before.plays === 0, before);

  await page.click('[aria-label="Play"]');
  await waitFor(() => {
    const el = window.__vyraMedia.element;
    return Boolean(el && el.readyState >= 1 && !el.paused && Number.isFinite(el.duration));
  }, 20000);
  const playing = await media();
  check("starts real audio playback", playing.plays >= 1, playing.plays);
  check("loads the first local track", playing.sources.some((s) => s.includes("slither-away.mp3")), playing.sources);
  const startedAt = await elapsed();
  const audioState = await page.evaluate(() => {
    const el = window.__vyraMedia.element;
    return el ? { paused: el.paused, time: el.currentTime, ready: el.readyState, duration: el.duration, error: el.error?.message ?? null } : null;
  });
  check(
    "real audio element is active",
    audioState?.paused === false && Number.isFinite(audioState?.duration) && audioState.duration > 0,
    [startedAt, audioState]
  );

  await page.click('[aria-label="Pause"]');
  await new Promise((resolve) => setTimeout(resolve, 250));
  const pausedA = await elapsed();
  await new Promise((resolve) => setTimeout(resolve, 700));
  const pausedB = await elapsed();
  const paused = await media();
  check("pause stops playback", paused.pauses >= 1 && pausedA === pausedB, [paused.pauses, pausedA, pausedB]);

  await page.click('[aria-label="Next track"]');
  await waitFor(
    () => window.__vyraMedia.sources.some((src) => src.includes("abz-future-the-day.mp3")),
    20000
  );
  const next = await media();
  check("next track loads a different file", next.sources.some((s) => s.includes("abz-future-the-day.mp3")), next.sources);
  check("player title follows the queue", (await page.$eval(".player__title", (el) => el.textContent)) === "ABZ/Future/the day mix", await page.$eval(".player__title", (el) => el.textContent));

  await waitFor(
    () => {
      const el = window.__vyraMedia.element;
      return Boolean(el && el.src.includes("abz-future-the-day.mp3") && el.readyState >= 1);
    },
    20000
  );
  const seekTo = (selector, seconds) => page.evaluate((details) => {
    const input = document.querySelector(details.selector);
    if (!input) return { found: false };
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    setValue.call(input, String(details.seconds));
    input.dispatchEvent(new Event("input", { bubbles: true }));
    return { found: true, display: getComputedStyle(input).display, max: Number(input.max) };
  }, { selector, seconds });
  const desktopSeek = await seekTo(".range--progress", 60);
  await waitFor(() => window.__vyraMedia.element?.currentTime >= 55, 10000);
  check("desktop progress bar seeks", desktopSeek.found && (await page.evaluate(() => window.__vyraMedia.element.currentTime)) >= 55, desktopSeek);

  await page.setViewport({ width: 390, height: 844 });
  const mobileSeek = await seekTo(".player__mobile-progress", 90);
  await waitFor(() => window.__vyraMedia.element?.currentTime >= 85, 10000);
  check("mobile progress bar is visible and seeks", mobileSeek.found && mobileSeek.display !== "none" && (await page.evaluate(() => window.__vyraMedia.element.currentTime)) >= 85, mobileSeek);

  check("page remains mounted", (await page.evaluate(() => document.querySelectorAll("body").length)) === 1, null);
  check("no page errors", pageErrors.length === 0, pageErrors);
} finally {
  await browser.close();
  await staticServer.close();
}

for (const r of results) {
  console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}  (${JSON.stringify(r.detail)})`);
}
if (results.some((r) => !r.ok)) process.exitCode = 1;
