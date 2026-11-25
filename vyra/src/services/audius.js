const API_BASE = "https://api.audius.co/v1";
const API_KEY = (import.meta.env.VITE_AUDIUS_API_KEY || "").trim();
const CACHE_TTL = 5 * 60 * 1000;

const cache = new Map();
const inFlight = new Map();

export const isAudiusConfigured = () => Boolean(API_KEY);

const errorMessage = async (response) => {
  try {
    const data = await response.json();
    return data?.error || data?.message || `Audius request failed (${response.status})`;
  } catch {
    return `Audius request failed (${response.status})`;
  }
};

function buildUrl(path, params = {}) {
  const url = new URL(`${API_BASE}${path}`);
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value)) value.forEach((item) => url.searchParams.append(key, String(item)));
    else url.searchParams.set(key, String(value));
  });
  return url;
}

export async function audiusFetch(path, options = {}) {
  const { params = {}, signal, cache: useCache = true, timeout = 14000 } = options;
  if (!API_KEY) {
    throw new Error("Audius is not configured. Add VITE_AUDIUS_API_KEY to vyra/.env.local.");
  }

  const url = buildUrl(path, params);
  const cacheKey = url.toString();
  if (useCache) {
    const hit = cache.get(cacheKey);
    if (hit && Date.now() - hit.at < CACHE_TTL) return hit.value;
    if (inFlight.has(cacheKey)) return inFlight.get(cacheKey);
  }

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeout);
  const abort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", abort, { once: true });
  }

  const request = fetch(url, {
    headers: { "x-api-key": API_KEY, Accept: "application/json" },
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok) throw new Error(await errorMessage(response));
      return response.json();
    })
    .then((value) => {
      if (useCache) cache.set(cacheKey, { at: Date.now(), value });
      return value;
    })
    .finally(() => {
      window.clearTimeout(timer);
      if (signal) signal.removeEventListener("abort", abort);
      inFlight.delete(cacheKey);
    });

  if (useCache) inFlight.set(cacheKey, request);
  return request;
}

export function artworkImage(artwork, size = "480x480") {
  if (!artwork) return "";
  if (typeof artwork === "string") return artwork;
  return artwork[size] || artwork["480x480"] || artwork["150x150"] || artwork["1000x1000"] || "";
}

export function artworkMeta(artwork, size = "480x480") {
  return {
    src: artworkImage(artwork, size),
    mirrors: Array.isArray(artwork?.mirrors) ? artwork.mirrors : [],
  };
}

const fallbackCover = "/images/covers/genre-afrobeats.jpg";

export function normalizeAudiusTrack(raw = {}) {
  const artist = raw.user || {};
  const album = raw.album_backlink || {};
  return {
    id: String(raw.id || ""),
    source: "audius",
    sourceId: String(raw.id || ""),
    title: raw.title || "Untitled",
    artist: artist.name || artist.handle || "Unknown artist",
    artistId: artist.id ? String(artist.id) : "",
    artistHandle: artist.handle || "",
    artistIsVerified: Boolean(artist.is_verified),
    artistFollowers: Number(artist.follower_count) || 0,
    artistTrackCount: Number(artist.track_count) || 0,
    album: album.playlist_name || "",
    albumId: album.playlist_id ? String(album.playlist_id) : "",
    artwork: raw.artwork || null,
    cover: artworkImage(raw.artwork) || artworkImage(artist.profile_picture) || fallbackCover,
    src: "",
    duration: Math.max(0, Number(raw.duration) || 0),
    genre: raw.genre || "",
    mood: raw.mood || "",
    releaseDate: raw.release_date || raw.created_at || "",
    permalink: raw.permalink || "",
    playCount: Number(raw.play_count) || 0,
    likeCount: Number(raw.favorite_count) || 0,
    isStreamGated: Boolean(raw.is_stream_gated),
    raw,
  };
}

export function normalizeAudiusUser(raw = {}) {
  const image = raw.profile_picture || {};
  const cover = raw.cover_photo || {};
  return {
    id: String(raw.id || ""),
    source: "audius",
    name: raw.name || raw.handle || "Unknown artist",
    handle: raw.handle || "",
    bio: raw.bio || "",
    artwork: image,
    cover,
    coverImage: artworkImage(image, "480x480") || artworkImage(cover, "480x480") || "",
    permalink: raw.permalink || "",
    isVerified: Boolean(raw.is_verified),
    followerCount: Number(raw.follower_count) || 0,
    trackCount: Number(raw.track_count) || 0,
    location: String(raw.location || ""),
    raw,
  };
}

/** Verified accounts or established musicians, so one-off uploads stay out. */
export function isMusician(artist = {}) {
  if (!artist) return false;
  if (artist.isVerified || artist.artistIsVerified) return true;
  const followers = Number(artist.followerCount ?? artist.artistFollowers) || 0;
  const tracks = Number(artist.trackCount ?? artist.artistTrackCount) || 0;
  return followers >= 50 && tracks >= 2;
}

export function isMusicianTrack(track = {}) {
  return (
    Boolean(track?.id) &&
    isMusician(track) &&
    !/\bigbo\b/i.test(String(track.title || ""))
  );
}

const NIGERIAN_LOCATION = /\b(nigeria|nigerian|naija|lagos|abuja|port harcourt|phc|ibadan|enugu|kano|kogi|oyo|benin city)\b/i;

export function isNigerianArtist(artist = {}) {
  return NIGERIAN_LOCATION.test(String(artist?.location || ""));
}

export function hasArtistImage(artist = {}) {
  return Boolean(artist?.coverImage || artworkImage(artist?.artwork));
}

/** Popular, established artists with a real profile image. */
export function isFeaturedMusician(artist = {}) {
  return Boolean(artist?.id) && isMusician(artist) && hasArtistImage(artist);
}

export function normalizeAudiusCollection(raw = {}) {
  return {
    id: String(raw.id || ""),
    source: "audius",
    title: raw.playlist_name || raw.name || "Untitled collection",
    artist: raw.user?.name || raw.user?.handle || "Unknown artist",
    artistId: raw.user?.id ? String(raw.user.id) : "",
    artistIsVerified: Boolean(raw.user?.is_verified),
    artistFollowers: Number(raw.user?.follower_count) || 0,
    artistTrackCount: Number(raw.user?.track_count) || 0,
    description: raw.description || "",
    artwork: raw.artwork || null,
    cover: artworkImage(raw.artwork) || fallbackCover,
    isAlbum: Boolean(raw.is_album),
    trackCount: Number(raw.track_count) || 0,
    releaseDate: raw.release_date || "",
    permalink: raw.permalink || "",
    raw,
  };
}

const tracksFrom = (response) => (Array.isArray(response?.data) ? response.data : []).map(normalizeAudiusTrack);
const usersFrom = (response) => (Array.isArray(response?.data) ? response.data : []).map(normalizeAudiusUser);
const collectionsFrom = (response) =>
  (Array.isArray(response?.data) ? response.data : []).map(normalizeAudiusCollection);

export async function searchAudius(query, options = {}) {
  const { kind = "all", limit = 8, signal } = options;
  if (!query?.trim()) return { tracks: [], artists: [], albums: [], playlists: [] };
  const response = await audiusFetch("/search/full", {
    params: { query: query.trim(), kind, limit },
    signal,
  });
  const data = response?.data || {};
  return {
    tracks: (data.tracks || []).map(normalizeAudiusTrack),
    artists: (data.users || []).map(normalizeAudiusUser),
    albums: (data.albums || []).map(normalizeAudiusCollection),
    playlists: (data.playlists || []).map(normalizeAudiusCollection),
  };
}

export async function getTrendingTracks(options = {}) {
  const { genre = "", time = "week", limit = 12, signal } = options;
  return tracksFrom(
    await audiusFetch("/tracks/trending", { params: { genre, time, limit }, signal })
  );
}

export async function getLatestTracks(options = {}) {
  const { genre = "", limit = 12, signal } = options;
  return tracksFrom(await audiusFetch("/tracks/latest", { params: { genre, limit }, signal }));
}

export async function getRecommendedTracks(options = {}) {
  const { genre = "", time = "week", limit = 12, signal } = options;
  return tracksFrom(
    await audiusFetch("/tracks/recommended", { params: { genre, time, limit }, signal })
  );
}

export async function getTrendingCollections(options = {}) {
  const { type = "playlist", time = "week", limit = 12, signal } = options;
  return collectionsFrom(
    await audiusFetch("/playlists/trending", { params: { type, time, limit }, signal })
  );
}

export async function getPopularArtists(options = {}) {
  const { genre = "", limit = 12, signal } = options;
  const path = genre ? "/users/genre/top" : "/users/top";
  const params = genre ? { genre: [genre], limit } : { limit };
  return usersFrom(await audiusFetch(path, { params, signal }));
}

/**
 * Nigerian and Afrobeats musicians first, then other established artists.
 * Audius exposes artist location and profile pictures, so the card shows a
 * real face/artwork instead of a random one-off upload.
 */
export async function getFeaturedAudiusArtists(options = {}) {
  const { limit = 6, signal } = options;
  const sources = [
    ["Afrobeats", 5],
    ["World", 4],
    ["Reggae", 3],
    ["R&B/Soul", 2],
    ["Pop", 1],
  ];
  const collected = [];

  for (const [genre, weight] of sources) {
    if (signal?.aborted) return [];
    try {
      const response = await audiusFetch("/users/genre/top", {
        params: { genre, limit: 50 },
        signal,
      });
      usersFrom(response).forEach((artist) => {
        collected.push({ ...artist, sourceWeight: weight });
      });
    } catch {
      /* keep the remaining genre sources rather than dropping the whole feed */
    }
  }

  try {
    usersFrom(await audiusFetch("/users/top", { params: { limit: 30 }, signal })).forEach((artist) => {
      collected.push({ ...artist, sourceWeight: 0 });
    });
  } catch {
    /* genre sources are enough when the global list is unavailable */
  }

  const seen = new Set();
  const artists = collected.filter((artist) => {
    if (!artist.id || seen.has(artist.id) || !isFeaturedMusician(artist)) return false;
    seen.add(artist.id);
    return true;
  });

  const score = (artist) => {
    const followers = Math.max(0, Number(artist.followerCount) || 0);
    return (
      (isNigerianArtist(artist) ? 1000 : 0) +
      (Number(artist.sourceWeight) || 0) * 100 +
      (artist.isVerified ? 80 : 0) +
      Math.min(60, Math.log10(followers + 1) * 20)
    );
  };

  return artists.sort((a, b) => score(b) - score(a)).slice(0, limit);
}

export async function getArtistProfile(id, options = {}) {
  const { signal } = options;
  const safeId = encodeURIComponent(id);
  const [userResult, tracksResult, albumsResult, playlistsResult] = await Promise.allSettled([
    audiusFetch(`/users/${safeId}`, { signal }),
    audiusFetch(`/users/${safeId}/tracks`, { params: { limit: 20 }, signal }),
    audiusFetch(`/users/${safeId}/albums`, { params: { limit: 12 }, signal }),
    audiusFetch(`/users/${safeId}/playlists`, { params: { limit: 12 }, signal }),
  ]);
  const value = (result) => (result.status === "fulfilled" ? result.value : null);
  const userResponse = value(userResult);
  const artist = normalizeAudiusUser(userResponse?.data || {});
  return {
    artist,
    tracks: tracksFrom(value(tracksResult)),
    albums: collectionsFrom(value(albumsResult)),
    playlists: collectionsFrom(value(playlistsResult)),
  };
}

export async function getCollectionTracks(id, options = {}) {
  const response = await audiusFetch(`/playlists/${encodeURIComponent(id)}/tracks`, {
    signal: options.signal,
  });
  return tracksFrom(response);
}

export async function resolveAudiusStream(trackOrId, options = {}) {
  const id = typeof trackOrId === "object" ? trackOrId.sourceId || trackOrId.id : trackOrId;
  if (!id) throw new Error("This track does not have a streamable Audius ID.");
  const response = await audiusFetch(`/tracks/${encodeURIComponent(id)}/stream`, {
    params: { no_redirect: true, api_key: API_KEY },
    cache: false,
    signal: options.signal,
  });
  const url = typeof response?.data === "string" ? response.data : response?.url;
  if (!url) throw new Error("This Audius track is unavailable for streaming.");
  return url;
}
