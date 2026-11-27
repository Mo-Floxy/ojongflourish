/**
 * Generates lightweight, branded SVG cover art used as an offline-safe
 * fallback for course cards. Run with: node scripts/generate-covers.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '../public/images/covers');
mkdirSync(outDir, { recursive: true });

const grid = `
  <pattern id="grid" width="44" height="44" patternUnits="userSpaceOnUse">
    <path d="M44 0H0V44" fill="none" stroke="#FFFFFF" stroke-opacity="0.055" stroke-width="1"/>
  </pattern>`;

const defs = (id, from, to, accent) => `
  <defs>
    <linearGradient id="bg-${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#171334"/>
      <stop offset="1" stop-color="${to}"/>
    </linearGradient>
    <linearGradient id="line-${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${from}"/>
      <stop offset="1" stop-color="${accent}"/>
    </linearGradient>
    <radialGradient id="glow-${id}">
      <stop offset="0" stop-color="${from}" stop-opacity="0.55"/>
      <stop offset="1" stop-color="${from}" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft-${id}" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="26"/>
    </filter>
    ${grid}
  </defs>`;

const motifs = {
  web: `
    <rect x="180" y="125" width="540" height="315" rx="20" fill="#FFFFFF" fill-opacity="0.07" stroke="#FFFFFF" stroke-opacity="0.2"/>
    <path d="M180 177h540" stroke="#FFFFFF" stroke-opacity="0.18"/>
    <circle cx="207" cy="151" r="6" fill="#FFB86B"/><circle cx="229" cy="151" r="6" fill="#7047EB"/><circle cx="251" cy="151" r="6" fill="#35B8E8"/>
    <rect x="210" y="205" width="145" height="190" rx="12" fill="#171334" fill-opacity="0.45"/>
    <rect x="372" y="205" width="316" height="26" rx="8" fill="url(#line-web)" fill-opacity="0.85"/>
    <rect x="372" y="248" width="240" height="12" rx="6" fill="#FFFFFF" fill-opacity="0.25"/>
    <rect x="372" y="274" width="288" height="12" rx="6" fill="#FFFFFF" fill-opacity="0.18"/>
    <rect x="372" y="300" width="196" height="12" rx="6" fill="#FFFFFF" fill-opacity="0.25"/>
    <rect x="372" y="340" width="132" height="34" rx="12" fill="url(#line-web)"/>`,
  python: `
    <path d="M400 175c-90 0-90 70-90 105 0 42 36 58 90 58h120c48 0 78 20 78 55 0 40-36 62-96 62H265" fill="none" stroke="url(#line-python)" stroke-width="24" stroke-linecap="round"/>
    <path d="M600 425c90 0 90-70 90-105 0-42-36-58-90-58H480c-48 0-78-20-78-55 0-40 36-62 96-62h235" fill="none" stroke="url(#line-python)" stroke-width="24" stroke-linecap="round" stroke-opacity="0.7"/>
    <circle cx="500" cy="300" r="13" fill="#FFB86B"/>`,
  java: `
    <g fill="none" stroke="url(#line-java)" stroke-width="7" stroke-linejoin="round">
      <path d="M500 130 660 220v180L500 490 340 400V220z"/>
      <path d="m500 130 160 90-160 90-160-90z" fill="#FFFFFF" fill-opacity="0.07"/>
      <path d="M500 310v180M340 220l160 90 160-90"/>
    </g>
    <path d="M432 360c0-24 18-40 42-40h54c22 0 36 12 36 30 0 16-12 26-32 30l-38 8c-18 4-28 12-28 26 0 16 14 26 36 26h56" fill="none" stroke="#FFB86B" stroke-width="12" stroke-linecap="round"/>`,
  javascript: `
    <path d="M330 190v250c0 46 28 70 78 70 30 0 54-8 72-24" fill="none" stroke="url(#line-javascript)" stroke-width="30" stroke-linecap="round"/>
    <path d="M640 190v250c0 46-28 70-78 70-30 0-54-8-72-24" fill="none" stroke="url(#line-javascript)" stroke-width="30" stroke-linecap="round" stroke-opacity="0.7"/>
    <rect x="452" y="402" width="96" height="88" rx="10" fill="#FFB86B" fill-opacity="0.85"/>`,
  uiux: `
    <rect x="150" y="140" width="350" height="320" rx="20" fill="#FFFFFF" fill-opacity="0.09" stroke="#FFFFFF" stroke-opacity="0.2"/>
    <rect x="180" y="175" width="110" height="250" rx="12" fill="#171334" fill-opacity="0.5"/>
    <rect x="200" y="198" width="70" height="10" rx="5" fill="#FFB86B"/>
    <rect x="200" y="224" width="52" height="10" rx="5" fill="#FFFFFF" fill-opacity="0.25"/>
    <rect x="200" y="250" width="60" height="10" rx="5" fill="#FFFFFF" fill-opacity="0.25"/>
    <rect x="315" y="175" width="152" height="118" rx="12" fill="url(#line-uiux)" fill-opacity="0.75"/>
    <rect x="315" y="312" width="152" height="12" rx="6" fill="#FFFFFF" fill-opacity="0.25"/>
    <rect x="315" y="338" width="112" height="12" rx="6" fill="#FFFFFF" fill-opacity="0.18"/>
    <rect x="520" y="225" width="230" height="230" rx="20" fill="#FFFFFF" fill-opacity="0.07" stroke="#FFFFFF" stroke-opacity="0.18"/>
    <circle cx="635" cy="340" r="62" fill="none" stroke="url(#line-uiux)" stroke-width="12"/>
    <circle cx="635" cy="340" r="28" fill="#FFB86B" fill-opacity="0.8"/>`,
  data: `
    <g fill="url(#line-data)">
      <rect x="190" y="330" width="62" height="130" rx="10"/>
      <rect x="282" y="270" width="62" height="190" rx="10" fill-opacity="0.8"/>
      <rect x="374" y="300" width="62" height="160" rx="10" fill-opacity="0.65"/>
      <rect x="466" y="210" width="62" height="250" rx="10" fill-opacity="0.9"/>
      <rect x="558" y="250" width="62" height="210" rx="10" fill-opacity="0.7"/>
      <rect x="650" y="170" width="62" height="290" rx="10"/>
    </g>
    <path d="M220 300 313 240l92 30 92-100 92 40 92-92" fill="none" stroke="#FFB86B" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
    <g fill="#FFFFFF"><circle cx="220" cy="300" r="8"/><circle cx="313" cy="240" r="8"/><circle cx="405" cy="270" r="8"/><circle cx="497" cy="170" r="8"/><circle cx="589" cy="210" r="8"/><circle cx="681" cy="118" r="8"/></g>`,
  cybersecurity: `
    <path d="M500 115 685 190v160c0 110-78 180-185 215-107-35-185-105-185-215V190z" fill="#FFFFFF" fill-opacity="0.06" stroke="url(#line-cybersecurity)" stroke-width="8"/>
    <path d="M500 165 635 217v128c0 85-57 139-135 169-78-30-135-84-135-169V217z" fill="none" stroke="#FFFFFF" stroke-opacity="0.2" stroke-width="3"/>
    <circle cx="500" cy="305" r="52" fill="none" stroke="url(#line-cybersecurity)" stroke-width="12"/>
    <path d="M482 305v-16a18 18 0 0 1 36 0v16" fill="none" stroke="#FFB86B" stroke-width="10" stroke-linecap="round"/>
    <rect x="474" y="302" width="52" height="44" rx="10" fill="#FFB86B"/>
    <g fill="#35B8E8"><circle cx="330" cy="180" r="7"/><circle cx="670" cy="180" r="7"/><circle cx="330" cy="430" r="7"/><circle cx="670" cy="430" r="7"/></g>`,
  ai: `
    <g stroke="url(#line-ai)" stroke-width="3" stroke-opacity="0.75">
      <path d="M270 200 500 300 730 180M270 200 500 300 730 420M270 410 500 300 730 180M270 410 500 300 730 420M270 200 270 410M730 180 730 420"/>
    </g>
    <g fill="#FFFFFF" fill-opacity="0.85">
      <circle cx="270" cy="200" r="12"/><circle cx="270" cy="410" r="12"/>
      <circle cx="730" cy="180" r="12"/><circle cx="730" cy="420" r="12"/>
    </g>
    <circle cx="500" cy="300" r="78" fill="url(#glow-ai)" filter="url(#soft-ai)"/>
    <circle cx="500" cy="300" r="52" fill="#171334" fill-opacity="0.65" stroke="url(#line-ai)" stroke-width="6"/>
    <circle cx="500" cy="300" r="22" fill="#FFB86B"/>`,
};

const themes = [
  ['web-development', '#7047EB', '#2A1C63', '#35B8E8'],
  ['python', '#35B8E8', '#153C63', '#7047EB'],
  ['java', '#FFB86B', '#44264B', '#7047EB'],
  ['javascript', '#7047EB', '#241A5A', '#35B8E8'],
  ['uiux', '#FFB86B', '#3B1F4D', '#7047EB'],
  ['data-analytics', '#35B8E8', '#192F5C', '#7047EB'],
  ['cybersecurity', '#7047EB', '#1B2450', '#35B8E8'],
  ['ai', '#35B8E8', '#2B1C64', '#7047EB'],
];

for (const [id, from, to, accent] of themes) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 560" role="img" aria-label="${id} course cover">
${defs(id, from, to, accent)}
  <rect width="900" height="560" fill="url(#bg-${id})"/>
  <rect width="900" height="560" fill="url(#grid)"/>
  <circle cx="760" cy="90" r="230" fill="url(#glow-${id})" filter="url(#soft-${id})"/>
  <circle cx="110" cy="500" r="180" fill="url(#glow-${id})" filter="url(#soft-${id})" opacity="0.6"/>
  <g>${motifs[id] ?? ''}</g>
</svg>
`;
  writeFileSync(resolve(outDir, `${id}.svg`), svg, 'utf8');
}

console.log(`Generated ${themes.length} covers in ${outDir}`);
