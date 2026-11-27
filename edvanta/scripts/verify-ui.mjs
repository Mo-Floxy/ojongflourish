/**
 * Lightweight Phase 1 UI smoke test using the Chrome DevTools Protocol.
 * Requires a Chrome instance with --remote-debugging-port=9333 and the dev server running.
 * Run: node scripts/verify-ui.mjs
 */
const CDP = 'http://127.0.0.1:9333';
const APP = 'http://localhost:5199/';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const target = await fetch(`${CDP}/json/new?${encodeURIComponent(APP)}`, { method: 'PUT' }).then((r) => r.json());
const socket = new WebSocket(target.webSocketDebuggerUrl);
const pending = new Map();
let nextId = 1;
const errors = [];

socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(JSON.stringify(message.error)));
    else resolve(message.result);
  }
  if (message.method === 'Runtime.exceptionThrown') {
    errors.push(message.params.exceptionDetails.text);
  }
  if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') {
    errors.push(message.params.entry.text);
  }
});

await new Promise((resolve) => socket.addEventListener('open', resolve, { once: true }));

function send(method, params = {}) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  return result.result.value;
}

await send('Runtime.enable');
await send('Log.enable');
await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await send('Page.navigate', { url: APP });
await sleep(3500);

const initial = await evaluate(`(() => ({
  title: document.title,
  h1: document.querySelector('h1')?.innerText,
  sections: document.querySelectorAll('main section').length,
  courseCards: document.querySelectorAll('.course-card').length,
  horizontalOverflow: document.documentElement.scrollWidth - window.innerWidth,
  navToggleVisible: getComputedStyle(document.querySelector('.nav-toggle')).display !== 'none',
  desktopNavVisible: getComputedStyle(document.querySelector('.desktop-nav')).display !== 'none',
}))()`);

await evaluate(`document.querySelector('.nav-toggle').click()`);
await sleep(450);
const menuOpen = await evaluate(`(() => ({
  mobileNav: !!document.querySelector('#mobile-navigation'),
  links: document.querySelectorAll('#mobile-navigation .mobile-nav-link').length,
  bodyLocked: document.body.style.overflow === 'hidden',
}))()`);

await evaluate(`[...document.querySelectorAll('#mobile-navigation .mobile-nav-link')].find(a => a.textContent.includes('Learning Paths')).click()`);
await sleep(1200);
const afterNav = await evaluate(`(() => ({
  hash: location.hash,
  menuClosed: !document.querySelector('#mobile-navigation'),
  scrollY: Math.round(window.scrollY),
}))()`);

await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await sleep(400);
const desktop = await evaluate(`(() => ({
  horizontalOverflow: document.documentElement.scrollWidth - window.innerWidth,
  heroColumns: getComputedStyle(document.querySelector('.hero-layout')).gridTemplateColumns,
  categoryColumns: getComputedStyle(document.querySelector('.category-grid')).gridTemplateColumns.split(' ').length,
  desktopNavVisible: getComputedStyle(document.querySelector('.desktop-nav')).display !== 'none',
}))()`);

socket.close();
console.log(JSON.stringify({ initial, menuOpen, afterNav, desktop, errors }, null, 2));
