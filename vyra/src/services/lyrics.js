const LRCLIB_BASE = "https://lrclib.net";
const APP_ID = (import.meta.env.VITE_LRCLIB_APP_ID || "").trim();
const USER_AGENT = "VYRA v1.0 (https://vyra-azure-iota.vercel.app/)";
const MIN_REQUEST_GAP_MS = 250;
const CACHE_KEY = "vyra:lyrics:v1";
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

let lastRequestAt = 0;

export class LyricsLookupError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "LyricsLookupError";
    this.status = details.status || 0;
    this.retryAfter = details.retryAfter || 0;
    this.notFound = Boolean(details.notFound);
  }
}

const clean = (value) =>
  String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\bfeat\.?\b|\bfeaturing\b|\bft\b/g, " ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");

// LRCLIB titles often include upload prefixes such as "Tyla - Water (Official Audio)".
const stripUploadNoise = (value) =>
  String(value || "")
    .replace(/^\s*[\p{L}\p{N} .&'’_-]{1,60}?\s+[-–—]\s+/u, "")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/\b(official|audio|lyrics?|lyric|video|visualizer|hd|hq|4k|1080p|explicit|clean|only)\b/gi, " ");

const VERSION_WORDS =
  /\b(remix|rework|cover|karaoke|instrumental|acoustic|live|unplugged|sped|slowed|reverb|boosted|mashup|tribute|edit|extended|club|dub|radio)\b/i;

const normalizeTitle = (value) => clean(stripUploadNoise(value)).replace(/\s+/g, " ").trim();
const primaryArtist = (value) => clean(value).split(" ")[0] || "";

const artistsMatch = (left, right) => {
  const a = clean(left);
  const b = clean(right);
  if (!a || !b) return false;
  return a === b || a.split(" ")[0] === b.split(" ")[0];
};

const isDifferentVersion = (requestTitle, recordTitle) => {
  const requested = VERSION_WORDS.test(String(requestTitle || ""));
  const record = VERSION_WORDS.test(String(recordTitle || ""));
  return record && !requested;
};

export function parseLrc(source) {
  if (typeof source !== "string" || !source.trim()) return [];
  const entries = [];
  const stamp = /\[(\d{1,3}):(\d{1,2})(?:[.:](\d{1,3}))?\]/g;

  source.split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) return;
    const matches = [...line.matchAll(stamp)];
    if (!matches.length) return;

    const last = matches[matches.length - 1];
    const text = line.slice(last.index + last[0].length).trim();
    if (!text) return;

    matches.forEach((match) => {
      const minutes = Number(match[1]);
      const seconds = Number(match[2]);
      const fraction = Number(match[3] || 0);
      const fractionSeconds =
        match[3]?.length === 1
          ? fraction / 10
          : match[3]?.length === 2
            ? fraction / 100
            : fraction / 1000;
      const time = minutes * 60 + seconds + fractionSeconds;
      if (Number.isFinite(time) && time >= 0) entries.push({ time, text });
    });
  });

  return entries.sort((a, b) => a.time - b.time || a.text.localeCompare(b.text));
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function lrclibFetch(path, signal) {
  const elapsed = Date.now() - lastRequestAt;
  if (elapsed < MIN_REQUEST_GAP_MS) {
    await wait(MIN_REQUEST_GAP_MS - elapsed);
  }
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
  lastRequestAt = Date.now();

  let response;
  try {
    response = await fetch(`${LRCLIB_BASE}${path}`, {
      signal,
      headers: {
        "X-User-Agent": USER_AGENT,
        ...(APP_ID ? { "Lrclib-App-Id": APP_ID } : {}),
        Accept: "application/json",
      },
    });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    throw new LyricsLookupError("Could not reach the lyrics service. Check your connection and try again.");
  }

  const retryAfter = Number(response.headers?.get?.("Retry-After")) || 0;
  if (response.status === 404) {
    throw new LyricsLookupError("No lyrics were found for this track.", { status: 404, notFound: true });
  }
  if (response.status === 429 || response.status === 503) {
    throw new LyricsLookupError(
      response.status === 429
        ? retryAfter
          ? `The lyrics service is rate-limiting requests. Try again in ${retryAfter}s.`
          : "The lyrics service is rate-limiting requests. Try again shortly."
        : "The lyrics service is temporarily busy. Try again in a moment.",
      { status: response.status, retryAfter }
    );
  }
  if (!response.ok) {
    throw new LyricsLookupError("The lyrics service could not complete that request.", {
      status: response.status,
    });
  }

  try {
    return await response.json();
  } catch {
    throw new LyricsLookupError("The lyrics service returned an unreadable response.");
  }
}

function isExactMatch(request, record) {
  if (!record || typeof record !== "object") return false;

  const requestedTitle = normalizeTitle(request.title);
  const recordTitle = normalizeTitle(record.trackName || record.name);
  if (!requestedTitle || requestedTitle !== recordTitle) return false;
  if (isDifferentVersion(request.title, record.trackName || record.name)) return false;

  if (!primaryArtist(request.artist) || !artistsMatch(request.artist, record.artistName)) return false;

  const requestedAlbum = clean(request.album);
  const recordAlbum = clean(record.albumName);
  if (requestedAlbum && recordAlbum && requestedAlbum !== recordAlbum) return false;

  const requestedDuration = Number(request.duration);
  const recordDuration = Number(record.duration);
  if (
    Number.isFinite(requestedDuration) &&
    Number.isFinite(recordDuration) &&
    Math.abs(requestedDuration - recordDuration) > 3
  ) {
    return false;
  }

  return true;
}

export function formatLyricsResult(record, request) {
  if (!isExactMatch(request, record)) return null;

  if (record.instrumental || (!record.syncedLyrics && !record.plainLyrics)) {
    return {
      status: "instrumental",
      source: "LRCLIB",
      trackId: record.id,
      lines: [],
      synced: false,
    };
  }

  const lines = parseLrc(record.syncedLyrics);
  if (lines.length) {
    return {
      status: "ready",
      source: "LRCLIB",
      trackId: record.id,
      lines,
      synced: true,
      title: record.trackName || record.name || request.title,
      artist: record.artistName || request.artist,
      album: record.albumName || request.album,
    };
  }

  const plain = String(record.plainLyrics || "")
    .split(/\r?\n/)
    .map((text) => text.trim())
    .filter(Boolean)
    .map((text) => ({ time: 0, text }));

  if (plain.length) {
    return {
      status: "ready",
      source: "LRCLIB",
      trackId: record.id,
      lines: plain,
      synced: false,
      title: record.trackName || record.name || request.title,
      artist: record.artistName || request.artist,
      album: record.albumName || request.album,
    };
  }

  return null;
}

function cacheKey(request) {
  return clean(`${request.title}|${request.artist}|${Math.round(Number(request.duration) || 0)}`);
}

function readCache(request) {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const entry = parsed?.[cacheKey(request)];
    if (!entry || Date.now() - entry.at > CACHE_TTL) return null;
    return entry.result || null;
  } catch {
    return null;
  }
}

function writeCache(request, result) {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    const parsed = raw && JSON.parse(raw);
    const entries = parsed && typeof parsed === "object" ? parsed : {};
    const key = cacheKey(request);
    entries[key] = { at: Date.now(), result };
    // Keep the cache small; lyrics are small but this grows over months.
    const keys = Object.keys(entries);
    if (keys.length > 120) delete entries[keys[0]];
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(entries));
  } catch {
    /* storage may be denied or full */
  }
}

async function searchExactRecord(request, signal) {
  const query = `${request.title} ${request.artist}`.trim();
  const records = await lrclibFetch(`/api/search?${new URLSearchParams({ q: query })}`, signal);
  if (!Array.isArray(records)) return null;

  const candidates = records
    .map((record) => ({ record, result: formatLyricsResult(record, request) }))
    .filter((entry) => entry.result);

  if (!candidates.length) return null;

  const requestedDuration = Number(request.duration) || 0;
  candidates.sort((a, b) => {
    const aSynced = a.result.synced ? 1 : 0;
    const bSynced = b.result.synced ? 1 : 0;
    if (aSynced !== bSynced) return bSynced - aSynced;
    const aGap = Math.abs(Number(a.record.duration || 0) - requestedDuration);
    const bGap = Math.abs(Number(b.record.duration || 0) - requestedDuration);
    return aGap - bGap;
  });

  return candidates[0].result;
}

export async function fetchLyrics(request, signal) {
  const title = String(request?.title || "").trim();
  const artist = String(request?.artist || "").trim();
  if (!title || !artist) {
    throw new LyricsLookupError("This track is missing enough information to find lyrics.");
  }

  const normalized = { ...request, title, artist };
  const cached = readCache(normalized);
  if (cached) return cached;

  const params = new URLSearchParams({ track_name: title, artist_name: artist });
  const album = String(request?.album || "").trim();
  if (album) params.set("album_name", album);
  const duration = Math.round(Number(request?.duration) || 0);
  if (duration >= 1 && duration <= 3600) params.set("duration", String(duration));

  let result = null;
  try {
    const record = await lrclibFetch(`/api/get?${params}`, signal);
    result = formatLyricsResult(record, normalized);
  } catch (error) {
    if (!error?.notFound || signal?.aborted) throw error;
    result = await searchExactRecord(normalized, signal);
  }

  if (!result) {
    throw new LyricsLookupError("No lyrics were found for this exact track version.", {
      status: 404,
      notFound: true,
    });
  }

  writeCache(normalized, result);
  return result;
}
