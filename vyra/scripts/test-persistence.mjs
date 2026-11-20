import puppeteer from "puppeteer-core";
import { serveDist } from "./serve-dist.mjs";

const EXE = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const staticServer = await serveDist();
const browser = await puppeteer.launch({ executablePath: EXE, headless: "new" });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

const snapshot = () =>
  page.evaluate(() => {
    const pressed = (label) =>
      document.querySelector(`[aria-label="${label}"]`)?.getAttribute("aria-pressed") === "true";
    let stored = null;
    try {
      stored = JSON.parse(localStorage.getItem("vyra:listener:v1"));
    } catch {
      /* ignore malformed storage */
    }
    return {
      title: document.querySelector(".player__title")?.textContent,
      volume: Number(document.querySelector(".range--volume")?.value),
      shuffle: pressed("Shuffle"),
      repeat: pressed("Repeat"),
      likedCount: document.querySelectorAll('[aria-label="Remove from liked songs"]').length,
      stored,
    };
  });

const results = [];
const check = (name, ok, detail) => results.push({ name, ok, detail });

try {
  await page.goto(staticServer.url, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".player");
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector(".player");
  const fresh = await snapshot();
  check("defaults to first track", fresh.title === "Slither Away", fresh.title);
  check("defaults to 0.72 volume", Math.abs(fresh.volume - 0.72) < 0.01, fresh.volume);
  check("starts unliked beyond defaults", fresh.likedCount >= 2, fresh.likedCount);

  await page.evaluate(() => {
    localStorage.setItem(
      "vyra:listener:v1",
      JSON.stringify({
        currentId: "t5",
        progress: 42,
        volume: 0.33,
        muted: false,
        shuffle: true,
        repeat: true,
        liked: ["t2", "t7"],
      })
    );
  });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector(".player");
  const restored = await snapshot();
  check("restores last track", restored.title === "Bad Attraction - EarJamm Mix", restored.title);
  check("restores volume", Math.abs(restored.volume - 0.33) < 0.01, restored.volume);
  check("restores shuffle", restored.shuffle === true, restored.shuffle);
  check("restores repeat", restored.repeat === true, restored.repeat);
  check(
    "restores likes",
    Array.isArray(restored.stored?.liked) &&
      restored.stored.liked.includes("t2") &&
      restored.stored.liked.includes("t7"),
    restored.stored?.liked
  );

  await page.click('[aria-label="Shuffle"]');
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector(".player");
  const toggled = await snapshot();
  check("persists UI interaction", toggled.shuffle === false, toggled.shuffle);

  await page.evaluate(() => {
    const key = "vyra:listener:v1";
    const state = JSON.parse(localStorage.getItem(key));
    localStorage.setItem(key, JSON.stringify({ ...state, muted: true }));
  });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector(".player");
  const mutedState = await snapshot();
  check("restores mute state", mutedState.volume === 0, mutedState.volume);
} finally {
  await browser.close();
  await staticServer.close();
}

for (const r of results) {
  console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}  (${JSON.stringify(r.detail)})`);
}
if (results.some((r) => !r.ok)) process.exitCode = 1;
