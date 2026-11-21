const LRCLIB_BASE = "https://lrclib.net";
const APP_ID = (import.meta.env.VITE_LRCLIB_APP_ID || "").trim();
const USER_AGENT = "VYRA v1.0 (https://vyra-azure-iota.vercel.app/)";
const MIN_REQUEST_GAP_MS = 250;

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
    .replace(/\bfeat\.?\b|\bfeaturing\b/g, " ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");

const primaryArtist = (value) => clean(value).split(" ")[0] || "";

const normalizeTitle = (value) =>
  clean(value)
    .replace(/\bwith lyrics\b|\bofficial lyrics\b|\blyric video\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export function parseLrc(source) {
  if (typeof source !== "string" || !source.trim()) return [];
  const entries = [];
  const stamp = /\[(\d{1,3}):(\d{1,2})(?:[.:](\d{1,3}))?\]/g;

  source.split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) return;
    const matches = [...line.matchAll(stamp)];
    if (!matches.length) return;

    const text = line.slice(matches[matches.length - 1].index + matches[matches.length - 1][0].length).trim();
    if (!text) return;

    matches.forEach((match) => {
      const minutes = Number(match[1]);
      const seconds = Number(match[2]);
      const fraction = Number(match[3] || 0);
      const fractionSeconds = match[3]?.length === 1 ? fraction / 10 : match[3]?.length === 2 ? fraction / 100 : fraction / 1000;
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

  if (response.status === 404) {
    throw new LyricsLookupError("No lyrics were found for this exact track.", { status: 404, notFound: true });
  }

  const retryAfter = Number(response.headers?.get?.("Retry-After")) || 0;
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

  const requestedArtist = primaryArtist(request.artist);
  const recordArtist = primaryArtist(record.artistName);
  if (!requestedArtist || requestedArtist !== recordArtist) return false;

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

export async function fetchLyrics(request, signal) {
  const title = String(request?.title || "").trim();
  const artist = String(request?.artist || "").trim();
  if (!title || !artist) {
    throw new LyricsLookupError("This track is missing enough information to find lyrics.");
  }

  const params = new URLSearchParams({ track_name: title, artist_name: artist });
  const album = String(request?.album || "").trim();
  if (album) params.set("album_name", album);
  const duration = Math.round(Number(request?.duration) || 0);
  if (duration >= 1 && duration <= 3600) params.set("duration", String(duration));

  const record = await lrclibFetch(`/api/get?${params}`, signal);
  const result = formatLyricsResult(record, request);
  if (!result) {
    throw new LyricsLookupError("No lyrics matched this exact track version.", {
      status: 404,
      notFound: true,
    });
  }
  return result;
}
