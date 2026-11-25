import { audiusFetch, isMusicianTrack, normalizeAudiusTrack } from "./audius";

/**
 * Real popular music from Audius. Every VYRA genre maps to one or more exact,
 * case-sensitive Audius genre names; weaker related genres are only used when
 * a niche genre cannot fill 50 tracks on its own. No song titles are faked.
 */
export const MIN_TRACKS_PER_GENRE = 50;

export const GENRE_SOURCES = {
  afrobeats: ["Afrobeats", "World", "Pop", "Reggae"],
  hiphop: ["Hip-Hop/Rap"],
  chill: ["Chill", "Lo-Fi", "Ambient"],
  indie: ["Indie", "Alternative", "Rock"],
  dance: ["Dance", "Electronic", "House"],
  jazz: ["Jazz", "Classical"],
  rock: ["Rock", "Alternative"],
  soul: ["R&B/Soul", "Soul", "Pop"],
  latin: ["Latin", "Reggaeton", "World"],
};

const STORAGE_KEY = "vyra:popular:v1";
const CACHE_TTL = 12 * 60 * 60 * 1000;

const compact = (track) => ({
  id: String(track.id || ""),
  source: "audius",
  sourceId: String(track.sourceId || track.id || ""),
  title: track.title || "Untitled",
  artist: track.artist || "Unknown artist",
  artistId: track.artistId || "",
  artistHandle: track.artistHandle || "",
  artistIsVerified: Boolean(track.artistIsVerified),
  artistFollowers: Number(track.artistFollowers) || 0,
  artistTrackCount: Number(track.artistTrackCount) || 0,
  album: track.album || "",
  artwork: track.artwork || null,
  cover: track.cover || "",
  src: "",
  duration: Number(track.duration) || 0,
  genre: track.genre || "",
  mood: track.mood || "",
  releaseDate: track.releaseDate || "",
  permalink: track.permalink || "",
  playCount: Number(track.playCount) || 0,
  likeCount: Number(track.likeCount) || 0,
});

export function readPopularCache() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || Date.now() - (parsed.savedAt || 0) > CACHE_TTL) return {};
    return parsed.genres && typeof parsed.genres === "object" ? parsed.genres : {};
  } catch {
    return {};
  }
}

function writePopularCache(genres) {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ savedAt: Date.now(), genres })
    );
  } catch {
    /* storage may be full or denied; in-memory state still works */
  }
}

export function clearPopularCache() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

async function fetchAudiusTracks(path, params, signal) {
  const response = await audiusFetch(path, {
    params,
    signal,
    cache: false,
    timeout: 20000,
  });
  const data = Array.isArray(response?.data) ? response.data : [];
  return data.map(normalizeAudiusTrack).filter((track) => track.id);
}

function mergeTracks(base, incoming) {
  const seen = new Set(base.map((track) => `${track.source}:${track.id}`));
  const merged = [...base];
  for (const track of incoming) {
    const key = `${track.source}:${track.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(track);
  }
  return merged;
}

const notIgbo = (track) => !/\bigbo\b/i.test(String(track?.title || ""));
const established = (track) => Boolean(track?.id) && notIgbo(track) && track.artistTrackCount >= 2;

const genreRequests = (genre) => [
  ["/tracks/trending", { genre, time: "week", limit: MIN_TRACKS_PER_GENRE }],
  ["/tracks/trending", { genre, time: "month", limit: MIN_TRACKS_PER_GENRE }],
  ["/tracks/trending", { genre, time: "allTime", limit: MIN_TRACKS_PER_GENRE }],
  ["/tracks/latest", { genre, limit: MIN_TRACKS_PER_GENRE }],
];

/** At least 50 real popular tracks per genre whenever Audius can supply them. */
export async function getPopularTracksByGenre(genreId, options = {}) {
  const cached = readPopularCache();
  if (!options.force && cached[genreId]?.length >= MIN_TRACKS_PER_GENRE) {
    return cached[genreId];
  }

  const sources = GENRE_SOURCES[genreId] || [];
  let preferred = [];
  let broader = [];

  for (const genre of sources) {
    for (const [path, params] of genreRequests(genre)) {
      if (options.signal?.aborted) return preferred.length ? preferred : cached[genreId] || [];
      try {
        const fetched = await fetchAudiusTracks(path, params, options.signal);
        preferred = mergeTracks(preferred, fetched.filter(isMusicianTrack));
        broader = mergeTracks(broader, fetched.filter(established));
      } catch {
        /* try the next window/source rather than dropping the whole genre */
      }
      if (preferred.length >= MIN_TRACKS_PER_GENRE) break;
    }
    if (preferred.length >= MIN_TRACKS_PER_GENRE) break;
  }

  let tracks = preferred.slice(0, MIN_TRACKS_PER_GENRE);
  if (tracks.length < MIN_TRACKS_PER_GENRE) {
    tracks = mergeTracks(tracks, broader.filter((track) => !tracks.some((item) => item.id === track.id)))
      .slice(0, MIN_TRACKS_PER_GENRE);
  }
  if (!tracks.length) return cached[genreId] || [];

  writePopularCache({ ...readPopularCache(), [genreId]: tracks.map(compact) });
  return tracks;
}

const AFROBEATS_SOURCES = ["Afrobeats", "World", "Reggae", "Pop"];

/** Real Afrobeats/Naija picks from Audius genre trending — no search or user uploads. */
export async function getTrendingAfrobeats(options = {}) {
  const limit = options.limit || 12;
  let tracks = [];

  for (const genre of AFROBEATS_SOURCES) {
    for (const time of ["week", "month"]) {
      if (options.signal?.aborted) return tracks;
      try {
        const fetched = await fetchAudiusTracks(
          "/tracks/trending",
          { genre, time, limit: MIN_TRACKS_PER_GENRE },
          options.signal
        );
        tracks = mergeTracks(tracks, fetched.filter(isMusicianTrack));
      } catch {
        /* keep trying the next genre window */
      }
      if (tracks.length >= limit) break;
    }
    if (tracks.length >= limit) break;
  }

  return tracks.slice(0, limit);
}

export async function getGlobalPopular(options = {}) {
  const limit = options.limit || MIN_TRACKS_PER_GENRE;
  try {
    const fetched = await fetchAudiusTracks(
      "/tracks/trending",
      { time: options.time || "week", limit: Math.max(limit * 2, MIN_TRACKS_PER_GENRE) },
      options.signal
    );
    const musicians = fetched.filter(isMusicianTrack);
    return (musicians.length ? musicians : fetched.filter(established)).slice(0, limit);
  } catch {
    return [];
  }
}
