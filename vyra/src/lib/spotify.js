const CLIENT_ID = (import.meta.env.VITE_SPOTIFY_CLIENT_ID || "").trim();
const REDIRECT_URI =
  (import.meta.env.VITE_SPOTIFY_REDIRECT_URI || "").trim() ||
  (typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}` : "");

// Only the scopes needed for profile display and the optional Web Playback SDK.
const SCOPES = [
  "streaming",
  "user-read-email",
  "user-read-private",
  "user-read-playback-state",
  "user-modify-playback-state",
].join(" ");

const AUTH_KEY = "vyra:spotify:auth";
const PKCE_KEY = "vyra:spotify:pkce";
const PKCE_TTL_MS = 10 * 60 * 1000;

export const isSpotifyConfigured = () => Boolean(CLIENT_ID);
export const spotifyRedirectUri = () => REDIRECT_URI;

class SpotifyRequestError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "SpotifyRequestError";
    this.status = details.status || 0;
    this.retryAfter = details.retryAfter || 0;
    this.reason = details.reason || "";
    this.authExpired = Boolean(details.authExpired);
  }
}

const base64url = (bytes) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const randomString = () => {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64url(bytes);
};

const sha256 = async (value) => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return base64url(digest);
};

const storeAuth = (auth) => {
  const next = {
    access_token: auth.access_token,
    refresh_token: auth.refresh_token,
    scope: auth.scope || "",
    expires_at: Date.now() + (Number(auth.expires_in) || 3600) * 1000,
  };
  try {
    window.localStorage.setItem(AUTH_KEY, JSON.stringify(next));
  } catch {
    // Private mode: tokens stay in memory for this session only.
  }
  return next;
};

export const readAuth = () => {
  try {
    const raw = window.localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.access_token ? parsed : null;
  } catch {
    return null;
  }
};

export const clearAuth = () => {
  try {
    window.localStorage.removeItem(AUTH_KEY);
  } catch {
    // Ignore unavailable storage.
  }
};

export async function startSpotifyLogin() {
  if (!isSpotifyConfigured()) return false;
  // A fresh PKCE flow must always bind to the account that signs in now.
  clearAuth();
  const verifier = randomString();
  const state = randomString();
  try {
    window.sessionStorage.setItem(
      PKCE_KEY,
      JSON.stringify({
        verifier,
        state,
        redirectUri: REDIRECT_URI,
        createdAt: Date.now(),
      })
    );
  } catch {
    return false;
  }

  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    state,
    code_challenge_method: "S256",
    code_challenge: await sha256(verifier),
  });

  window.location.assign(`https://accounts.spotify.com/authorize?${params}`);
  return true;
}

const callbackError = (code, description) => {
  if (code === "access_denied") return "Spotify login was cancelled or declined. You can continue as a guest.";
  if (description) return description;
  return `Spotify could not complete login (${code || "unknown error"}).`;
};

export function consumeSpotifyCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const state = params.get("state");
  const error = params.get("error");
  const errorDescription = params.get("error_description");
  if (!code && !error) return null;

  // Clean every callback parameter so refresh/back never replays an auth code.
  ["code", "state", "error", "error_description"].forEach((key) => params.delete(key));
  const query = params.toString();
  window.history.replaceState(
    {},
    document.title,
    `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`
  );

  if (error) return { error: callbackError(error, errorDescription) };

  let pending = null;
  try {
    pending = JSON.parse(window.sessionStorage.getItem(PKCE_KEY) || "null");
    window.sessionStorage.removeItem(PKCE_KEY);
  } catch {
    // Ignore unavailable session storage.
  }

  if (!pending || !state || pending.state !== state) {
    return { error: "Spotify login state did not match. Please try again." };
  }
  if (!pending.createdAt || Date.now() - pending.createdAt > PKCE_TTL_MS) {
    return { error: "That Spotify login request expired. Please try again." };
  }
  if (!pending.verifier || pending.redirectUri !== REDIRECT_URI) {
    return { error: "That Spotify login request is no longer valid. Please try again." };
  }

  return { code, verifier: pending.verifier, redirectUri: pending.redirectUri };
}

async function readSpotifyError(response) {
  let data = null;
  try {
    data = await response.json();
  } catch {
    // The body may be empty or non-JSON.
  }

  const message = data?.error?.message || data?.error_description || "";
  const reason = data?.error?.reason || "";
  const retryAfter = Number(response.headers?.get?.("Retry-After")) || 0;

  if (response.status === 401) {
    return new SpotifyRequestError("Your Spotify session expired. Connect Spotify again.", {
      status: 401,
      authExpired: true,
    });
  }
  if (response.status === 403 && /quota|not.*allow|development/i.test(`${message} ${reason}`)) {
    return new SpotifyRequestError(
      "Spotify has not approved this app/account for Web API access yet. Ask the app owner to allowlist the account or request extended access.",
      { status: 403, reason }
    );
  }
  if (response.status === 429) {
    return new SpotifyRequestError(
      retryAfter
        ? `Spotify is rate-limiting requests. Try again in ${retryAfter} seconds.`
        : "Spotify is rate-limiting requests. Try again in a moment.",
      { status: 429, retryAfter, reason }
    );
  }
  if (response.status === 404) {
    return new SpotifyRequestError("That Spotify item is unavailable or restricted.", { status: 404 });
  }
  return new SpotifyRequestError(message || `Spotify request failed (${response.status}).`, {
    status: response.status,
    reason,
  });
}

export async function exchangeCode({ code, verifier, redirectUri }) {
  if (!code || !verifier) throw new Error("The Spotify login response was incomplete. Please try again.");
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: CLIENT_ID,
      code_verifier: verifier,
    }),
  });
  if (!response.ok) throw await readSpotifyError(response);
  const data = await response.json();
  if (!data?.access_token) throw new Error("Spotify did not return an access token. Please try again.");
  return storeAuth(data);
}

let refreshPromise = null;

async function refreshAccessToken(auth) {
  if (!auth?.refresh_token) return null;
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: auth.refresh_token,
        client_id: CLIENT_ID,
      }),
    });
    if (!response.ok) {
      clearAuth();
      return null;
    }
    const data = await response.json();
    if (!data?.access_token) {
      clearAuth();
      return null;
    }
    return storeAuth({
      ...data,
      refresh_token: data.refresh_token || auth.refresh_token,
    });
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

export async function getValidAuth(current) {
  const auth = current || readAuth();
  if (!auth) return null;
  if (auth.expires_at && Date.now() < auth.expires_at - 60_000) return auth;
  return refreshAccessToken(auth);
}

export async function spotifyFetch(path, token, options = {}, allowRefresh = true) {
  const send = async (accessToken) =>
    fetch(`https://api.spotify.com/v1${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        Authorization: `Bearer ${accessToken}`,
        ...(options.headers || {}),
      },
    });

  let response;
  try {
    response = await send(token);
  } catch {
    throw new Error("Could not reach Spotify. Check your connection and try again.");
  }

  if (response.status === 204) return null;

  if (!response.ok) {
    const failure = await readSpotifyError(response);
    if (response.status === 401 && allowRefresh) {
      const refreshed = await getValidAuth(readAuth());
      if (refreshed?.access_token && refreshed.access_token !== token) {
        return spotifyFetch(path, refreshed.access_token, options, false);
      }
    }
    throw failure;
  }

  try {
    return await response.json();
  } catch {
    throw new Error("Spotify returned an unreadable response. Please try again.");
  }
}

export async function searchSpotifyTracks(query, token, limit = 8) {
  const params = new URLSearchParams({
    q: query,
    type: "track",
    limit: String(Math.min(Math.max(limit, 1), 10)),
    market: "NG",
  });
  const data = await spotifyFetch(`/search?${params}`, token);
  return data?.tracks?.items || [];
}

export async function searchSpotifyCatalog(query, token, options = {}) {
  const {
    limit = 8,
    types = ["track", "artist", "album", "playlist"],
    signal,
  } = options;
  if (!query?.trim()) {
    return { tracks: [], artists: [], albums: [], playlists: [] };
  }
  const params = new URLSearchParams({
    q: query.trim(),
    type: types.join(","),
    limit: String(Math.min(Math.max(limit, 1), 10)),
    market: "NG",
  });
  const data = await spotifyFetch(`/search?${params}`, token, { signal });
  return {
    tracks: data?.tracks?.items || [],
    artists: data?.artists?.items || [],
    albums: data?.albums?.items || [],
    playlists: data?.playlists?.items || [],
  };
}

const SPOTIFY_ID_PATTERN = /^[A-Za-z0-9]{22}$/;

// Exact-ID lookups for the curated official artist allowlist. Search results
// are deliberately never used to identify a featured artist.
export async function getSpotifyArtist(artistId, token) {
  if (!SPOTIFY_ID_PATTERN.test(artistId || "")) return null;
  return spotifyFetch(`/artists/${artistId}`, token);
}

export async function getSpotifyArtistTopTracks(artistId, token, market = "NG") {
  if (!SPOTIFY_ID_PATTERN.test(artistId || "")) return [];
  const params = new URLSearchParams({ market });
  const data = await spotifyFetch(`/artists/${artistId}/top-tracks?${params}`, token);
  return data?.tracks || [];
}

let sdkPromise = null;
export function loadSpotifySdk() {
  if (typeof window === "undefined") return Promise.reject(new Error("No browser"));
  if (window.Spotify) return Promise.resolve(window.Spotify);
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    const previous = window.onSpotifyWebPlaybackSDKReady;
    window.onSpotifyWebPlaybackSDKReady = () => {
      if (typeof previous === "function") previous();
      resolve(window.Spotify);
    };
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    script.onerror = () => {
      sdkPromise = null;
      reject(new Error("Could not load the Spotify player script."));
    };
    document.body.appendChild(script);
  });
  return sdkPromise;
}
