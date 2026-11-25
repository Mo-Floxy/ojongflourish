import { GENRES } from "../data/music";
import { GENRE_SOURCES } from "./popular";

/** Deterministic, preference-weighted mixes that rotate at local midnight. */
export const DAILY_MIX_SIZE = 50;
export const DAILY_MIX_COUNT = 3;
const STORAGE_KEY = "vyra:daily-mix:v1";

export function todayKey(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const hashCode = (text) => {
  let hash = 2166136261;
  const value = String(text || "");
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled(items, random) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

export function canonicalGenre(value) {
  const text = String(value || "").trim().toLowerCase();
  if (!text) return "";
  for (const genre of GENRES) {
    const names = [
      genre.name,
      ...(genre.audiusGenres || []),
      ...(GENRE_SOURCES[genre.id] || []).slice(0, 1),
    ];
    if (names.some((name) => String(name).toLowerCase() === text)) return genre.id;
  }
  return "";
}

export function preferenceSignature({
  liked = [],
  recent = [],
  artists = [],
} = {}) {
  const clean = (values) =>
    [...new Set((Array.isArray(values) ? values : []).map(String).filter(Boolean))].sort();
  return hashCode(
    [clean(liked).join(","), clean(recent).join(","), clean(artists).join(",")].join("|")
  ).toString(36);
}

export function scoreGenres({ likedTracks = {}, recentTracks = [], savedArtists = {} } = {}) {
  const scores = {};
  const add = (value, weight) => {
    const genre = canonicalGenre(value);
    if (!genre) return;
    scores[genre] = (scores[genre] || 0) + weight;
  };

  Object.values(likedTracks || {}).forEach((track) => add(track?.genre, 5));
  (Array.isArray(recentTracks) ? recentTracks : []).slice(0, 40).forEach((track, index) => {
    add(track?.genre, index < 10 ? 3 : index < 25 ? 2 : 1);
  });
  Object.values(savedArtists || {}).forEach((artist) => add(artist?.genre, 2));

  return scores;
}

function allocationsFor(weights, total) {
  const raw = weights.map((weight) => (total * weight) / Math.max(1, weights.reduce((a, b) => a + b, 0)));
  const counts = raw.map((value) => Math.floor(value));
  let remainder = total - counts.reduce((a, b) => a + b, 0);
  for (let index = 0; remainder > 0; index = (index + 1) % counts.length, remainder -= 1) {
    counts[index] += 1;
  }
  return counts;
}

/** Builds three 50-track mixes. Same day + same taste = same mixes. */
export function buildDailyMixes({
  catalog = {},
  globalPopular = [],
  likedTracks = {},
  recentTracks = [],
  savedArtists = {},
  dateKey = todayKey(),
  signature = "",
} = {}) {
  const scores = scoreGenres({ likedTracks, recentTracks, savedArtists });
  const ranked = GENRES.map((genre) => ({
    id: genre.id,
    name: genre.name,
    accent: genre.accent,
    score: scores[genre.id] || 0,
    pool: Array.isArray(catalog[genre.id]) ? catalog[genre.id] : [],
  }))
    .filter((entry) => entry.pool.length > 0)
    .sort((a, b) => b.score - a.score || b.pool.length - a.pool.length);

  if (!ranked.length) return [];

  const globalPool = globalPopular.length
    ? globalPopular
    : ranked.flatMap((entry) => entry.pool);
  const fallbackPool = [...ranked.flatMap((entry) => entry.pool), ...globalPool];
  const genreById = GENRES.reduce((acc, genre) => ({ ...acc, [genre.id]: genre }), {});

  return Array.from({ length: DAILY_MIX_COUNT }, (_, index) => {
    const number = index + 1;
    const random = seededRandom(hashCode(`${dateKey}|${signature}|${number}`));
    const focus = ranked.slice(0, Math.min(DAILY_MIX_COUNT, ranked.length));
    const rotated = [...focus.slice(index), ...focus.slice(0, index)];
    const counts = allocationsFor(
      rotated.map((entry) => (entry.score > 0 ? entry.score : 1)),
      DAILY_MIX_SIZE
    );

    const selected = [];
    const seen = new Set();
    const take = (tracks, limit) => {
      for (const track of shuffled(tracks, random)) {
        if (selected.length >= limit || !track?.id) continue;
        const key = `${track.source || "audius"}:${track.id}`;
        if (seen.has(key)) continue;
        seen.add(key);
        selected.push(track);
        if (selected.length >= limit) break;
      }
    };

    rotated.forEach((entry, focusIndex) => take(entry.pool, selected.length + counts[focusIndex]));
    if (selected.length < DAILY_MIX_SIZE) take(fallbackPool, DAILY_MIX_SIZE);

    const tracks = shuffled(selected.slice(0, DAILY_MIX_SIZE), random);
    const lead = genreById[rotated[0]?.id] || GENRES[0];
    const vibe = rotated.slice(0, 2).map((entry) => entry.name).join(" · ");

    return {
      id: `daily-${dateKey}-${number}`,
      title: `Daily Mix ${number}`,
      subtitle: `${vibe} — picked today from what you love.`,
      cover: tracks[0]?.cover || lead.image,
      accent: lead.accent,
      count: tracks.length,
      dateKey,
      genre: lead.name,
      trackId: tracks[0]?.id,
      tracks,
    };
  });
}

export function readDailyMixes(dateKey, signature) {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.dateKey !== dateKey || parsed?.signature !== signature) return null;
    return Array.isArray(parsed.mixes) ? parsed.mixes : null;
  } catch {
    return null;
  }
}

export function writeDailyMixes({ dateKey, signature, mixes }) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ dateKey, signature, mixes }));
  } catch {
    /* storage may be full or denied; the mix still works in memory */
  }
}
