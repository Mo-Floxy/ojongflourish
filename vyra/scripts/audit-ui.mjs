import fs from "node:fs";
import puppeteer from "puppeteer-core";
import { serveDist } from "./serve-dist.mjs";

const EXE = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const staticServer = await serveDist();
const URL = process.env.VYRA_URL || staticServer.url;

const VIEWPORTS = [
  { name: "desktop-1600", width: 1600, height: 1000 },
  { name: "desktop-1280", width: 1280, height: 800 },
  { name: "laptop-1024", width: 1024, height: 768 },
  { name: "tablet-900", width: 900, height: 1180, isMobile: true, hasTouch: true },
  { name: "tablet-768", width: 768, height: 1024, isMobile: true, hasTouch: true },
  { name: "mobile-390", width: 390, height: 844, isMobile: true, hasTouch: true },
  { name: "mobile-360", width: 360, height: 800, isMobile: true, hasTouch: true },
  { name: "mobile-320", width: 320, height: 700, isMobile: true, hasTouch: true },
];

const audit = () => {
  const rect = (el) => {
    const b = el.getBoundingClientRect();
    return {
      x: Math.round(b.x),
      y: Math.round(b.y + scrollY),
      w: Math.round(b.width),
      h: Math.round(b.height),
    };
  };

  const parseColor = (value) => {
    const m = value.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const parts = m[1].split(/[,/]/).map((v) => parseFloat(v));
    return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] === undefined ? 1 : parts[3] };
  };

  const bgOf = (el) => {
    let node = el;
    while (node && node !== document.documentElement) {
      const c = parseColor(getComputedStyle(node).backgroundColor);
      if (c && c.a > 0.85) return c;
      node = node.parentElement;
    }
    return { r: 10, g: 11, b: 20, a: 1 };
  };

  const lum = ({ r, g, b }) => {
    const f = (v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };

  const contrast = (a, b) => {
    const l1 = lum(a);
    const l2 = lum(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };

  const visible = (el) => {
    const s = getComputedStyle(el);
    const b = el.getBoundingClientRect();
    return s.display !== "none" && s.visibility !== "hidden" && +s.opacity > 0.1 && b.width > 0 && b.height > 0;
  };

  const label = (el) => {
    const cls = typeof el.className === "string" ? el.className : "";
    return `${el.tagName.toLowerCase()}${cls ? "." + cls.trim().split(/\s+/).slice(0, 2).join(".") : ""}`;
  };

  const all = [...document.querySelectorAll("body *")].filter(visible);

  const clipped = all
    .filter((el) => {
      const s = getComputedStyle(el);
      if (s.textOverflow === "ellipsis") return false;
      if (s.overflowX === "auto" || s.overflowX === "scroll") return false;
      if (el.children.length) return false;
      return el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0;
    })
    .slice(0, 20)
    .map((el) => ({
      el: label(el),
      text: (el.textContent || "").trim().slice(0, 42),
      scrollW: el.scrollWidth,
      clientW: el.clientWidth,
    }));

  const tinyText = all
    .filter((el) => {
      if (!el.textContent || el.children.length || !el.textContent.trim()) return false;
      return parseFloat(getComputedStyle(el).fontSize) < 11.5;
    })
    .slice(0, 20)
    .map((el) => ({ el: label(el), text: el.textContent.trim().slice(0, 32), size: getComputedStyle(el).fontSize }));

  const lowContrast = all
    .filter((el) => {
      if (!el.textContent || el.children.length || !el.textContent.trim()) return false;
      const s = getComputedStyle(el);
      const fg = parseColor(s.color);
      if (!fg || fg.a < 0.5) return false;
      const ratio = contrast(fg, bgOf(el));
      const large = parseFloat(s.fontSize) >= 18.66 || (parseFloat(s.fontSize) >= 14 && +s.fontWeight >= 700);
      return ratio < (large ? 3 : 4.5);
    })
    .slice(0, 20)
    .map((el) => ({
      el: label(el),
      text: el.textContent.trim().slice(0, 32),
      color: getComputedStyle(el).color,
      ratio: +contrast(parseColor(getComputedStyle(el).color), bgOf(el)).toFixed(2),
    }));

  const touch = all
    .filter((el) => ["BUTTON", "A", "INPUT"].includes(el.tagName))
    .map((el) => ({ el: label(el), text: (el.textContent || el.ariaLabel || "").trim().slice(0, 24), r: rect(el) }))
    .filter((x) => x.r.w > 0 && (x.r.w < 34 || x.r.h < 34))
    .slice(0, 20);

  const overflowing = all
    .filter((el) => {
      const b = el.getBoundingClientRect();
      return b.width > 2 && (b.right > innerWidth + 2 || b.left < -2);
    })
    .filter((el) => getComputedStyle(el).position !== "fixed")
    .slice(0, 20)
    .map((el) => ({ el: label(el), r: rect(el) }));

  const imgs = [...document.images].map((i) => ({
    src: i.currentSrc.split("/").pop().slice(0, 38),
    broken: i.complete && i.naturalWidth === 0,
    natural: `${i.naturalWidth}x${i.naturalHeight}`,
    rendered: `${Math.round(i.clientWidth)}x${Math.round(i.clientHeight)}`,
  }));

  const sections = [...document.querySelectorAll(".page > section, .page > aside, .page > footer, .topbar, .player")].map((el) => ({
    el: label(el),
    id: el.id,
    ...rect(el),
  }));

  const player = document.querySelector(".player");
  const footer = document.querySelector(".page-footer");
  const playerRect = player?.getBoundingClientRect();
  const footerRect = footer?.getBoundingClientRect();

  return {
    viewport: { w: innerWidth, h: innerHeight },
    doc: { scrollW: document.documentElement.scrollWidth, scrollH: document.documentElement.scrollHeight },
    horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 1,
    sections,
    playerFooter: playerRect && footerRect ? {
      playerTop: Math.round(playerRect.top),
      footerTop: Math.round(footerRect.top),
      footerBottomAtBottomScroll: Math.round(footerRect.bottom + scrollY),
      covered: footerRect.bottom > playerRect.top && scrollY + innerHeight >= document.documentElement.scrollHeight - 2,
    } : null,
    clipped,
    tinyText,
    lowContrast,
    touch,
    overflowing,
    brokenImages: imgs.filter((i) => i.broken),
    imageCount: imgs.length,
  };
};

const browser = await puppeteer.launch({
  executablePath: EXE,
  headless: "new",
  args: ["--hide-scrollbars", "--force-color-profile=srgb"],
});

const report = {};
for (const vp of VIEWPORTS) {
  const page = await browser.newPage();
  await page.setViewport({
    width: vp.width,
    height: vp.height,
    deviceScaleFactor: 1,
    isMobile: !!vp.isMobile,
    hasTouch: !!vp.hasTouch,
  });
  await page.goto(URL, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".player");
  await page.evaluate(async () => {
    document.documentElement.style.scrollBehavior = "auto";
    const step = Math.round(innerHeight * 0.7);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      scrollTo({ top: y, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 90));
    }
    scrollTo({ top: 0, behavior: "instant" });
    await new Promise((r) => setTimeout(r, 400));
  });
  report[vp.name] = await page.evaluate(audit);
  await page.close();
}
await browser.close();
await staticServer.close();

fs.mkdirSync(".shots", { recursive: true });
fs.writeFileSync(".shots/ui-audit.json", JSON.stringify(report, null, 2));
for (const [name, r] of Object.entries(report)) {
  console.log(
    name,
    JSON.stringify({
      overflow: r.horizontalOverflow,
      clipped: r.clipped.length,
      tiny: r.tinyText.length,
      contrast: r.lowContrast.length,
      touch: r.touch.length,
      offscreen: r.overflowing.length,
      brokenImgs: r.brokenImages.length,
      playerFooter: r.playerFooter,
    })
  );
}
console.log("full report: .shots/ui-audit.json");
