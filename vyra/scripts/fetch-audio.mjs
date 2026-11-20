/**
 * Download the full-length vocal tracks used by Vyra and encode them for local playback.
 *
 * Sources: ccMixter (CC BY 2.5/3.0) and the Free Music Archive (CC BY 4.0).
 * Each track keeps its original artist/title/licence in src/data/music.js and the
 * in-app footer under "Music credits".
 *
 * Usage: node scripts/fetch-audio.mjs
 * Requires network access. If ffmpeg-static is installed, the files are encoded
 * to 96 kbps; otherwise the original MP3s are copied as-is.
 */

import { spawn } from "node:child_process";
import { mkdir, readFile, readdir, stat, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const USER_AGENT = "Mozilla/5.0 (compatible; VyraAudioFetch/1.0)";
const CCMIXTER_HEADERS = { "User-Agent": USER_AGENT, Referer: "https://ccmixter.org/" };
const FMA_HEADERS = { "User-Agent": USER_AGENT, Referer: "https://freemusicarchive.org/" };

const SOURCES = [
  { file: "slither-away.mp3", url: "https://ccmixter.org/content/sunbyrn/sunbyrn_-_Slither_Away.mp3", headers: CCMIXTER_HEADERS },
  { file: "abz-future-the-day.mp3", url: "https://ccmixter.org/content/BOCrew/BOCrew_-_ABZ_Future_the_day_mix.mp3", headers: CCMIXTER_HEADERS },
  { file: "ophelias-song.mp3", url: "https://ccmixter.org/content/Klaus_Neumaier/Klaus_Neumaier_-_Ophelia_s_Song.mp3", headers: CCMIXTER_HEADERS },
  { file: "destination-non-specific.mp3", url: "https://ccmixter.org/content/commonsplice/commonsplice_-_Destination_Non-Specific.mp3", headers: CCMIXTER_HEADERS },
  { file: "bad-attraction.mp3", url: "https://ccmixter.org/content/thehipcola/thehipcola_-_Bad_Attraction_-_EarJamm_Mix.mp3", headers: CCMIXTER_HEADERS },
  { file: "no-tv.mp3", url: "https://ccmixter.org/content/sohaclara/sohaclara_-_noTV.mp3", headers: CCMIXTER_HEADERS },
  { file: "ophelias-lounge.mp3", url: "https://ccmixter.org/content/cdk/cdk_-_Ophelia_s_Lounge.mp3", headers: CCMIXTER_HEADERS },
  { file: "hands-up.mp3", url: "https://ccmixter.org/content/cdk/cdk_-_Hands_Up_(cdk_Island_Mix).mp3", headers: CCMIXTER_HEADERS },
  { file: "i-wonder.mp3", url: "https://ccmixter.org/content/oldDog/oldDog_-_I_wonder_what_I_ll_do_today.mp3", headers: CCMIXTER_HEADERS },
  { file: "don-quixote.mp3", url: "https://ccmixter.org/content/oldDog/oldDog_-_Don_Quixote.mp3", headers: CCMIXTER_HEADERS },
  { file: "burn-it-up.mp3", url: "https://ccmixter.org/content/shagrugge/shagrugge_-_Burn_it_up_(mellow_G_vibe).mp3", headers: CCMIXTER_HEADERS },
  { file: "itz-like-yo.mp3", url: "https://ccmixter.org/content/beatgorilla/beatgorilla_-_ITZ_LIKE_YO_(The_Luxurious_Mix).mp3", headers: CCMIXTER_HEADERS },
  { file: "work-out-fine.mp3", url: "https://ccmixter.org/content/teru/teru_-_Work_Out_Fine.mp3", headers: CCMIXTER_HEADERS },
  { file: "graphic-design.mp3", url: "https://ccmixter.org/content/phusion/phusion_-_Graphic_Design.mp3", headers: CCMIXTER_HEADERS },
  { file: "started-a-trend.mp3", url: "https://ccmixter.org/content/williamberry/williamberry_-_I_Think_I_Started_a_Trend_(bill_berry_mix).mp3", headers: CCMIXTER_HEADERS },
  { file: "tanto-ruido.mp3", url: "https://ccmixter.org/content/Klaus_Neumaier/Klaus_Neumaier_-_Tanto_Ruido_(Bossa_Nova_Remix).mp3", headers: CCMIXTER_HEADERS },

  // Ugo Mbaise — Nigerian/Igbo vocals, Free Music Archive, CC BY 4.0.
  { file: "ndi-nne.mp3", url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/tracks/6JT6CVxYfnqjSdvXHj3JKjDqav1TYRRnKB9vJ8DL.mp3", headers: FMA_HEADERS },
  { file: "egwu-nwa.mp3", url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/tracks/g38hk1bPs9O8oEXUbKvtZ4vOabLuVHA15O41l0Hx.mp3", headers: FMA_HEADERS },
  { file: "nganga.mp3", url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/tracks/BegIJa4cQ4nxkUctVia12ELomjG3OBGa4s8hH1E1.mp3", headers: FMA_HEADERS },
  { file: "garri-gwu.mp3", url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/tracks/C2xxFnaN1RSqFC0x53lQ3umhPMoPHwoFS7A74BxY.mp3", headers: FMA_HEADERS },
  { file: "ogo-di-mma.mp3", url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/tracks/EFe5TXM2BYoEXKzCbJbw63TPMrmWyvqHW8HAUMTy.mp3", headers: FMA_HEADERS },
  { file: "anya-ukwu.mp3", url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/tracks/QpcYJA8yCFMEzZIlcAN1kxB87cygkffjKVp2q1ov.mp3", headers: FMA_HEADERS },
  { file: "imela.mp3", url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/tracks/pWIKlamyLH5xMvJuTtVlPIH998HLIxPCOL9CkGfD.mp3", headers: FMA_HEADERS },
  { file: "akwa.mp3", url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/tracks/ZlTxGvDUadZxV0dxZpvNnrBy4YqIKiRYXHiALo98.mp3", headers: FMA_HEADERS },
  { file: "onye-ga-bu-eze.mp3", url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/tracks/d0RhkC5obmUY5PBmaMrkqpPcbXdZKWfRBeg2sLyw.mp3", headers: FMA_HEADERS },
  { file: "ijego.mp3", url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/tracks/JlgWBAGr4WZds5b1TX7Ydz3Zj93NOVshtPtiBPbj.mp3", headers: FMA_HEADERS },
];

const OUT_DIR = resolve("public/audio");
const workDir = join(tmpdir(), "vyra-vocal-audio-src");

let ffmpeg = null;
try {
  const { default: path } = await import("ffmpeg-static");
  ffmpeg = path;
} catch {
  // Original MP3s are still valid; they are just larger.
}

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (cursor < items.length) {
        const index = cursor;
        cursor += 1;
        results[index] = await fn(items[index], index);
      }
    })
  );
  return results;
}

async function download({ file: target, url, headers }, index) {
  const tempPath = join(workDir, `${index}.mp3`);
  try {
    const info = await stat(tempPath);
    if (info.size > 100_000) {
      console.log(`cached ${target} (${(info.size / 1048576).toFixed(1)} MB)`);
      return { target, tempPath };
    }
  } catch {
    // Not cached yet.
  }

  const response = await fetch(encodeURI(url), { headers });
  if (!response.ok) throw new Error(`${target}: HTTP ${response.status}`);
  const type = response.headers.get("content-type") || "";
  if (!type.includes("audio")) throw new Error(`${target}: unexpected content type ${type}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < 100_000) throw new Error(`${target}: download too small (${bytes.length} bytes)`);
  await writeFile(tempPath, bytes);
  console.log(`downloaded ${target} (${(bytes.length / 1048576).toFixed(1)} MB)`);
  return { target, tempPath };
}

function run(command, args) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolvePromise();
      else reject(new Error(stderr.trim().slice(-800)));
    });
  });
}

async function encode({ target, tempPath }) {
  const output = join(OUT_DIR, target);
  if (ffmpeg) {
    await run(ffmpeg, [
      "-y", "-hide_banner", "-loglevel", "error",
      "-i", tempPath,
      "-vn", "-codec:a", "libmp3lame", "-b:a", "96k",
      "-ar", "44100", "-ac", "2", "-map_metadata", "-1",
      output,
    ]);
  } else {
    await writeFile(output, await readFile(tempPath));
  }
  return target;
}

await mkdir(OUT_DIR, { recursive: true });
await mkdir(workDir, { recursive: true });
const expected = new Set(SOURCES.map((source) => source.file));
for (const file of await readdir(OUT_DIR)) {
  if (file.endsWith(".mp3") && !expected.has(file)) {
    await unlink(join(OUT_DIR, file));
    console.log(`removed stale ${file}`);
  }
}
const downloaded = await mapLimit(SOURCES, 6, download);
const written = await mapLimit(downloaded, 2, encode);
console.log(`\nReady ${written.length} vocal tracks in ${OUT_DIR}`);
