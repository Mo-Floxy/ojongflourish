import puppeteer from "puppeteer-core";
import { serveDist } from "./serve-dist.mjs";

const EXE = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const staticServer = await serveDist();
const browser = await puppeteer.launch({
  executablePath: EXE,
  headless: "new",
  userDataDir: "C:/Users/HP/AppData/Local/Temp/opencode/vyra-qa-library",
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

const pageErrors = [];
page.on("pageerror", (error) => pageErrors.push(String(error)));

const results = [];
const check = (name, ok, detail) => results.push({ name, ok, detail });

const clickByText = async (selector, text) => {
  const clicked = await page.$$eval(
    selector,
    (elements, label) => {
      const target = elements.find((element) => element.textContent.trim().includes(label));
      if (!target) return false;
      target.click();
      return true;
    },
    text
  );
  if (!clicked) throw new Error(`Could not find ${selector} containing "${text}"`);
};

const storedPlaylists = () =>
  page.evaluate(() => {
    try {
      const value = JSON.parse(localStorage.getItem("vyra:playlists:v1"));
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  });

try {
  await page.goto(staticServer.url, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => window.localStorage.clear());
  await page.goto(`${staticServer.url}playlists`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".playlist-page");

  await clickByText("button", "New playlist");
  await page.waitForFunction(() => /\/playlists\/[^/]+$/.test(window.location.pathname), {
    timeout: 10000,
  });
  check("creating a playlist opens its detail page", true, page.url());

  const playlistId = new URL(page.url()).pathname.split("/").pop();
  await page.waitForSelector('button[aria-label^="Add "]', { timeout: 10000 });
  await page.click('button[aria-label^="Add "]');
  await page.waitForSelector(".playlist-rows .playlist-row", { timeout: 10000 });

  let playlists = await storedPlaylists();
  const created = playlists.find((playlist) => playlist.id === playlistId);
  check("added track is persisted", (created?.tracks || []).length === 1, created?.tracks?.length);

  await page.click('input[aria-label="Playlist name"]');
  await page.keyboard.down("Control");
  await page.keyboard.press("a");
  await page.keyboard.up("Control");
  await page.keyboard.type("QA Mix");
  await new Promise((resolve) => setTimeout(resolve, 150));
  await page.keyboard.press("Tab");
  await page.waitForFunction(
    () => {
      try {
        const value = JSON.parse(localStorage.getItem("vyra:playlists:v1"));
        return Array.isArray(value) && value.some((playlist) => playlist.name === "QA Mix");
      } catch {
        return false;
      }
    },
    { timeout: 10000 }
  );
  playlists = await storedPlaylists();
  check("renaming a playlist persists", playlists.some((playlist) => playlist.name === "QA Mix"), playlists.map((p) => p.name));

  await page.goto(`${staticServer.url}playlists`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".playlist-item", { timeout: 10000 });
  check("renamed playlist appears in the list", (await page.$eval(".playlist-item", (element) => element.textContent)).includes("QA Mix"), null);

  await page.$$eval(".playlist-item", (items) => {
    const item = items.find((element) => element.textContent.includes("QA Mix"));
    const button = Array.from(item?.querySelectorAll("button") || []).find((element) =>
      element.textContent.includes("Delete")
    );
    button?.click();
  });
  await page.waitForFunction(
    () => {
      try {
        const value = JSON.parse(localStorage.getItem("vyra:playlists:v1"));
        return Array.isArray(value) && value.length === 0;
      } catch {
        return false;
      }
    },
    { timeout: 10000 }
  );
  check("deleting a playlist persists", (await storedPlaylists()).length === 0, null);
  check("no page errors during library flow", pageErrors.length === 0, pageErrors);
} finally {
  await browser.close();
  await staticServer.close();
}

for (const result of results) {
  console.log(`${result.ok ? "PASS" : "FAIL"}  ${result.name}  (${JSON.stringify(result.detail)})`);
}
if (results.some((result) => !result.ok)) process.exitCode = 1;
