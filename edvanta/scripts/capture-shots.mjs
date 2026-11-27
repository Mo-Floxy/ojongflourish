/** Captures desktop and mobile homepage screenshots through CDP (port 9333). */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, 'design-previews');
mkdirSync(out, { recursive: true });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const target = await fetch('http://127.0.0.1:9333/json/new?about:blank', { method: 'PUT' }).then((r) => r.json());
const socket = new WebSocket(target.webSocketDebuggerUrl);
const pending = new Map();
let nextId = 1;

socket.addEventListener('message', (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    const p = pending.get(msg.id);
    pending.delete(msg.id);
    p(msg.result);
  }
});
await new Promise((resolve) => socket.addEventListener('open', resolve, { once: true }));

const send = (method, params = {}) =>
  new Promise((resolve) => {
    const id = nextId++;
    pending.set(id, resolve);
    socket.send(JSON.stringify({ id, method, params }));
  });

for (const [name, width, height, mobile] of [
  ['edvanta-desktop.png', 1440, 900, false],
  ['edvanta-mobile.png', 390, 844, true],
]) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile });
  await send('Page.navigate', { url: 'http://localhost:5199/' });
  await sleep(3500);
  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  writeFileSync(resolve(out, name), Buffer.from(shot.data, 'base64'));
  console.log(`Saved ${name}`);
}

socket.close();
