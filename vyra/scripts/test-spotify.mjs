import puppeteer from "puppeteer-core";
import { serveDist } from "./serve-dist.mjs";

const EXE = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const staticServer = await serveDist();
const browser = await puppeteer.launch({
  executablePath: EXE,
  headless: "new",
  args: ["--autoplay-policy=no-user-gesture-required"],
});

const results = [];
const check = (name, ok, detail) => results.push({ name, ok, detail });
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const waitFor = async (page, fn, timeout = 15000) => {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    if (await page.evaluate(fn)) return;
    await wait(200);
  }
  throw new Error("Timed out waiting for Spotify UI state");
};
const bodyText = (page) => page.evaluate(() => document.body.innerText);

const sdkStub = `
  window.Spotify = {
    Player: class {
      constructor(options) { this.options = options; this.listeners = {}; }
      addListener(name, callback) {
        (this.listeners[name] ||= []).push(callback);
        if (name === "ready") setTimeout(() => callback({ device_id: "qa-device" }), 0);
        return this;
      }
      connect() { return Promise.resolve(true); }
      disconnect() {}
      getCurrentState() { return Promise.resolve(null); }
      pause() {} resume() {} togglePlay() {} next() {} previous() {}
      seek() {} setVolume() {} setShuffle() {} setRepeatMode() {}
    }
  };
  if (typeof window.onSpotifyWebPlaybackSDKReady === "function") {
    window.onSpotifyWebPlaybackSDKReady();
  }
`;

const iframeApiStub = `
  window.onSpotifyIframeApiReady?.({
    createController: (element, options, callback) => {
      const [, type, id] = String(options?.uri || "").split(":");
      if (type && id && element?.replaceWith) {
        const frame = document.createElement("iframe");
        frame.src = "https://open.spotify.com/embed/" + type + "/" + id;
        frame.title = "Spotify embed";
        element.replaceWith(frame);
      }
      const listeners = {};
      const controller = {
        addListener(name, handler) {
          (listeners[name] ||= []).push(handler);
          if (name === "playback_started") setTimeout(() => handler({}), 0);
          return () => {};
        },
        removeListener() {},
        destroy() {},
      };
      setTimeout(() => callback?.(controller), 0);
      return controller;
    },
  });
`;

const catalog = {
  tracks: {
    items: [{
      id: "qa-track",
      name: "QA Track",
      uri: "spotify:track:qa-track",
      duration_ms: 180000,
      explicit: false,
      artists: [{ name: "QA Artist" }],
      album: { name: "QA Album", images: [] },
      external_urls: { spotify: "https://open.spotify.com/track/qa-track" },
    }],
  },
  artists: {
    items: [{
      id: "qa-artist",
      name: "QA Artist",
      images: [],
      external_urls: { spotify: "https://open.spotify.com/artist/qa-artist" },
    }],
  },
  albums: { items: [] },
  playlists: { items: [] },
};

const json = (respond, data, status = 200) =>
  respond({
    status,
    contentType: "application/json",
    headers: { "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify(data),
  });

try {
  // Guest access and the connection dialog.
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(staticServer.url, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(".premium__cta");
    await page.click(".premium__cta");
    await page.waitForSelector(".spotify-dialog__panel");
    const text = await bodyText(page);
    check("connect dialog explains Spotify", text.includes("Spotify in VYRA") && text.includes("PKCE"));
    check("guest option is available", text.includes("Continue as Guest"));
    await page.evaluate(() => {
      [...document.querySelectorAll(".spotify-dialog__panel button")]
        .find((button) => button.textContent.trim() === "Continue as Guest")?.click();
    });
    await waitFor(page, () => !document.querySelector(".spotify-dialog__panel"));
    check("Continue as Guest closes the dialog", true);
    await page.close();
  }

  // Cancellation callback is friendly and the URL is cleaned.
  {
    const page = await browser.newPage();
    await page.goto(`${staticServer.url}?error=access_denied&error_description=User%20cancelled`);
    await waitFor(page, () => document.body.innerText.includes("login was cancelled"));
    const url = page.url();
    check("cancelled login shows a friendly message", true);
    check("callback params are removed", !url.includes("error=") && !url.includes("error_description="), url);
    await page.close();
  }

  // Invalid state callback is rejected and cleaned.
  {
    const page = await browser.newPage();
    await page.goto(`${staticServer.url}?code=abc&state=not-valid`);
    await waitFor(page, () => document.body.innerText.includes("state did not match"));
    check("invalid callback state is rejected", true, page.url());
    await page.close();
  }

  // Authenticated catalogue, SDK playback, embeds and disconnection with stubbed providers.
  {
    const page = await browser.newPage();
    const playbackRequests = [];
    await page.setViewport({ width: 1440, height: 900 });
    await page.evaluateOnNewDocument(() => {
      window.localStorage.setItem("vyra:spotify:auth", JSON.stringify({
        access_token: "qa-access-token",
        refresh_token: "qa-refresh-token",
        scope: "streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state",
        expires_at: Date.now() + 3600000,
      }));
    });
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      const url = request.url();
      if (
        request.method() === "OPTIONS" &&
        (url.includes("api.spotify.com/") || url.includes("api.audius.co/"))
      ) {
        return request.respond({
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "authorization, x-api-key, content-type, accept",
          },
        });
      }
      if (url.startsWith("https://sdk.scdn.co/")) {
        return request.respond({ status: 200, contentType: "application/javascript", body: sdkStub });
      }
      if (url.startsWith("https://open.spotify.com/embed/iframe-api/v1")) {
        return request.respond({ status: 200, contentType: "application/javascript", body: iframeApiStub });
      }
      if (url.includes("api.spotify.com/v1/me/player/play")) {
        playbackRequests.push({ method: request.method(), body: request.postData() || "", url });
        return request.respond({ status: 204, body: "" });
      }
      if (url.includes("api.spotify.com/v1/me")) {
        return json(request.respond.bind(request), {
          id: "qa-user",
          display_name: "QA Listener",
          email: "qa@example.test",
          images: [],
        });
      }
      if (url.includes("api.spotify.com/v1/search")) return json(request.respond.bind(request), catalog);
      if (url.includes("api.spotify.com/")) return json(request.respond.bind(request), {});
      if (url.includes("api.audius.co/v1/search/full")) {
        return json(request.respond.bind(request), { data: { tracks: [], users: [], albums: [], playlists: [] } });
      }
      if (url.includes("api.audius.co/")) return json(request.respond.bind(request), { data: [] });
      return request.continue();
    });

    await page.goto(`${staticServer.url}search?q=qa`, { waitUntil: "domcontentloaded" });
    await waitFor(page, () => document.body.innerText.includes("QA Track"));
    check("authenticated search shows real Spotify metadata", true);
    const officialHref = await page.evaluate(() =>
      [...document.querySelectorAll('a')].find((link) => link.textContent.includes("Open in Spotify"))?.href || ""
    );
    check("official Spotify link is used", officialHref === "https://open.spotify.com/track/qa-track", officialHref);

    await page.click('[aria-label="Play QA Track on Spotify"]');
    await waitFor(page, () => window.localStorage.getItem("vyra:spotify:auth") !== null);
    await wait(600);
    check(
      "SDK playback starts through Spotify player",
      playbackRequests.some((entry) => entry.method === "PUT" && entry.body.includes("spotify:track:qa-track")),
      playbackRequests
    );

    await page.evaluate(() => {
      const row = [...document.querySelectorAll(".search-page__track")].find((el) => el.textContent.includes("QA Track"));
      [...(row?.querySelectorAll("button") || [])]
        .find((button) => button.textContent.trim() === "Embed")?.click();
    });
    await waitFor(page, () => Boolean(document.querySelector(".player__external")));
    await waitFor(page, () =>
      [...document.querySelectorAll("iframe")].some((frame) => frame.src.includes("/embed/track/qa-track"))
    );
    check("official track embed loads and pauses VYRA audio", true);

    await page.click(".search-page__embed-close");
    await waitFor(page, () => !document.querySelector(".search-page__embed"));
    await page.evaluate(() => {
      const card = [...document.querySelectorAll(".search-page__card")].find((el) => el.textContent.includes("QA Artist"));
      [...(card?.querySelectorAll("button") || [])]
        .find((button) => button.textContent.trim() === "Embed")?.click();
    });
    await waitFor(page, () =>
      [...document.querySelectorAll("iframe")].some((frame) => frame.src.includes("/embed/artist/qa-artist"))
    );
    check("official artist embed is supported", true);

    await page.click(".premium__cta");
    await page.waitForSelector(".spotify-dialog__panel");
    const accountText = await bodyText(page);
    check("connected account status is shown", accountText.includes("QA Listener") && accountText.includes("Connected to Spotify"));
    await page.evaluate(() => {
      [...document.querySelectorAll(".spotify-dialog__panel button")]
        .find((button) => button.textContent.includes("Disconnect Spotify"))?.click();
    });
    await waitFor(page, () => !window.localStorage.getItem("vyra:spotify:auth"));
    check("disconnect clears the Spotify session", true);
    await page.close();
  }
} finally {
  await browser.close();
  await staticServer.close();
}

for (const result of results) {
  console.log(`${result.ok ? "PASS" : "FAIL"}  ${result.name}  (${JSON.stringify(result.detail ?? null)})`);
}
if (results.some((result) => !result.ok)) process.exitCode = 1;
