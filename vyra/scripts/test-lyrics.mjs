import puppeteer from "puppeteer-core";
import { serveDist } from "./serve-dist.mjs";

const EXE = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const staticServer = await serveDist();
const browser = await puppeteer.launch({
  executablePath: EXE,
  headless: "new",
  args: ["--autoplay-policy=no-user-gesture-required"],
});
const page = await browser.newPage();
const pageErrors = [];
page.on("pageerror", (error) => pageErrors.push(String(error)));

const results = [];
const check = (name, ok, detail) => results.push({ name, ok, detail });
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const waitFor = async (fn, timeout = 15000) => {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    if (await page.evaluate(fn)) return;
    await wait(200);
  }
  throw new Error(`Timed out: ${fn.toString().slice(0, 120)}`);
};

const records = {
  "Slither Away": {
    id: 9001,
    trackName: "Slither Away",
    artistName: "sunbyrn",
    albumName: "Vocal Originals",
    duration: 301,
    instrumental: false,
    plainLyrics: "Intro line\nSecond line\nThird line",
    syncedLyrics: [
      "[00:00.00]Intro line",
      "[00:05.00]Second line",
      "[00:10.00]Third line",
      "[00:15.00]Fourth line",
      "[00:20.00]Fifth line",
      "[00:25.00]Sixth line",
      "[00:30.00]Seventh line",
      "[00:35.00]Eighth line",
      "[00:40.00]Ninth line",
      "[00:45.00]Tenth line",
      "[00:50.00]Eleventh line",
      "[00:55.00]Twelfth line",
      "[01:00.00]Thirteenth line",
      "[01:05.00]Fourteenth line",
      "[01:10.00]Fifteenth line",
      "[01:15.00]Sixteenth line",
      "[01:20.00]Seventeenth line",
      "",
    ].join("\n"),
  },
  "ABZ/Future/the day mix": {
    id: 9002,
    trackName: "ABZ/Future/the day mix (Remix)",
    artistName: "BOCrew",
    albumName: "Vocal Sessions",
    duration: 213,
    instrumental: false,
    plainLyrics: "This must never be displayed",
    syncedLyrics: "[00:00.00]This must never be displayed",
  },
  "Ophelia's Song": null,
  "Destination Non-Specific": {
    id: 9004,
    trackName: "Destination Non-Specific",
    artistName: "commonsplice",
    albumName: "Downtempo Vocals",
    duration: 266,
    instrumental: false,
    plainLyrics: "Plain line one\nPlain line two",
    syncedLyrics: null,
  },
};

const lrclibRequests = [];

await page.setViewport({ width: 1440, height: 900 });
await page.evaluateOnNewDocument(() => {
  window.__lyricsAudio = { element: null, plays: 0 };
  const proto = HTMLMediaElement.prototype;
  const nativePlay = proto.play;
  proto.play = function play(...args) {
    window.__lyricsAudio.element = this;
    window.__lyricsAudio.plays += 1;
    return nativePlay.apply(this, args);
  };
});
await page.setRequestInterception(true);
page.on("request", async (request) => {
  const url = request.url();
  if (url.startsWith("https://lrclib.net/api/get") && request.method() === "OPTIONS") {
    return request.respond({
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "accept, x-user-agent, lrclib-app-id",
      },
    });
  }
  if (url.startsWith("https://lrclib.net/api/get")) {
    const params = new URL(url).searchParams;
    const title = params.get("track_name") || "";
    const headers = request.headers();
    lrclibRequests.push({
      title,
      userAgent: headers["x-user-agent"] || headers["X-User-Agent"] || "",
      params: Object.fromEntries(params),
    });
    const record = records[title];
    if (!record) {
      return request.respond({
        status: 404,
        contentType: "application/json",
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ message: "Failed to find specified track", name: "TrackNotFound", statusCode: 404 }),
      });
    }
    await wait(260);
    return request.respond({
      status: 200,
      contentType: "application/json",
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(record),
    });
  }
  if (url.includes("api.audius.co/")) {
    return request.respond({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [] }) });
  }
  return request.continue();
});

const seekAudio = async (seconds) => {
  await page.evaluate((value) => {
    const input = document.querySelector(".range--progress");
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    setValue.call(input, String(value));
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }, seconds);
};

const openLyrics = async () => {
  const selector = await page.evaluate(() =>
    getComputedStyle(document.querySelector(".player__lyrics-btn")).display === "none"
      ? ".player__lyrics-mini"
      : ".player__lyrics-btn"
  );
  await page.click(selector);
  await page.waitForSelector(".lyrics__panel");
};

const closeLyrics = async () => {
  await page.click(".lyrics__close");
  await waitFor(() => !document.querySelector(".lyrics__panel"));
};

try {
  await page.goto(staticServer.url, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".player");
  await page.click('[aria-label="Play"]');
  await waitFor(() => {
    const audio = window.__lyricsAudio.element;
    return Boolean(audio && audio.readyState >= 1 && !audio.paused);
  });

  await openLyrics();
  await waitFor(() => document.querySelectorAll(".lyrics__line").length === 17);
  check("Lyrics button opens the full panel", true);
  check(
    "LRCLIB client is identified",
    lrclibRequests[0]?.userAgent.includes("VYRA") && lrclibRequests[0]?.params.duration === "301",
    lrclibRequests[0]
  );

  await seekAudio(6);
  await waitFor(() => window.__lyricsAudio.element?.currentTime >= 5);
  await waitFor(() => document.querySelector(".lyrics__line.is-active")?.textContent === "Second line");
  check("active line follows real audio position", true, await page.evaluate(() => window.__lyricsAudio.element.currentTime));

  await seekAudio(80);
  await waitFor(() => window.__lyricsAudio.element?.currentTime >= 79);
  await waitFor(() => document.querySelector(".lyrics__line.is-active")?.textContent === "Seventeenth line");
  await waitFor(() => {
    const container = document.querySelector(".lyrics__scroll");
    const active = document.querySelector(".lyrics__line.is-active");
    if (!container || !active) return false;
    const box = container.getBoundingClientRect();
    const line = active.getBoundingClientRect();
    return line.top >= box.top - 2 && line.bottom <= box.bottom + 2 && container.scrollTop > 0;
  });
  check("active line is auto-scrolled into view", true);

  await page.evaluate(() => {
    document.querySelector(".lyrics__scroll").dispatchEvent(new WheelEvent("wheel", { deltaY: 200, bubbles: true }));
  });
  await waitFor(() => Boolean(document.querySelector(".lyrics__toolbar button")));
  check("manual scrolling disables follow mode", true);

  await closeLyrics();
  await page.click('[aria-label="Next track"]');
  await waitFor(() => document.querySelector(".player__title")?.textContent === "ABZ/Future/the day mix");
  await openLyrics();
  check("old lyrics are cleared on track change", await page.evaluate(() => document.querySelectorAll(".lyrics__line").length === 0));
  await waitFor(() => Boolean(document.querySelector(".lyrics__state--error")));
  const mismatchText = await page.$eval(".lyrics__state--error", (el) => el.textContent);
  check("remix metadata is rejected instead of shown", mismatchText.includes("exact track version"), mismatchText);
  await closeLyrics();

  await page.click('[aria-label="Next track"]');
  await waitFor(() => document.querySelector(".player__title")?.textContent === "Ophelia's Song");
  await openLyrics();
  await waitFor(() => Boolean(document.querySelector(".lyrics__state--error")));
  const unavailableText = await page.$eval(".lyrics__state--error", (el) => el.textContent);
  check("unavailable lyrics show a graceful message", unavailableText.includes("No lyrics were found"), unavailableText);
  await closeLyrics();

  await page.click('[aria-label="Next track"]');
  await waitFor(() => document.querySelector(".player__title")?.textContent === "Destination Non-Specific");
  await openLyrics();
  await waitFor(() => document.querySelectorAll(".lyrics__line").length === 2);
  const unsynced = await page.evaluate(() => ({
    notice: document.querySelector(".lyrics__notice")?.textContent || "",
    active: document.querySelectorAll(".lyrics__line.is-active").length,
    lines: [...document.querySelectorAll(".lyrics__line")].map((el) => el.textContent),
  }));
  check("plain lyrics are shown without fake timing", unsynced.notice.includes("Timestamps aren’t available") && unsynced.active === 0, unsynced);

  await closeLyrics();
  await page.setViewport({ width: 390, height: 844 });
  await waitFor(() => getComputedStyle(document.querySelector(".player__lyrics-btn")).display === "none");
  check("mobile uses the compact lyrics button", true);

  await page.click('[aria-label="Previous track"]');
  await waitFor(() => document.querySelector(".player__title")?.textContent === "Ophelia's Song");
  await page.click('[aria-label="Previous track"]');
  await waitFor(() => document.querySelector(".player__title")?.textContent === "ABZ/Future/the day mix");
  await page.click('[aria-label="Previous track"]');
  await waitFor(() => document.querySelector(".player__title")?.textContent === "Slither Away");
  await openLyrics();
  await waitFor(() => document.querySelectorAll(".lyrics__line").length === 17);

  const mobile = await page.evaluate(() => {
    const panel = document.querySelector(".lyrics__panel").getBoundingClientRect();
    return {
      width: Math.round(panel.width),
      height: Math.round(panel.height),
      viewport: [window.innerWidth, window.innerHeight],
      closeVisible: Boolean(document.querySelector(".lyrics__close")?.getBoundingClientRect().width),
      scrollable: document.querySelector(".lyrics__scroll")?.scrollHeight > document.querySelector(".lyrics__scroll")?.clientHeight,
    };
  });
  check("mobile full-screen lyrics view is usable", mobile.width === mobile.viewport[0] && mobile.closeVisible && mobile.scrollable, mobile);
  check("no page errors", pageErrors.length === 0, pageErrors);
} finally {
  await browser.close();
  await staticServer.close();
}

for (const result of results) {
  console.log(`${result.ok ? "PASS" : "FAIL"}  ${result.name}  (${JSON.stringify(result.detail ?? null)})`);
}
if (results.some((result) => !result.ok)) process.exitCode = 1;
