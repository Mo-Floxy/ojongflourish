const CLIENT_ID = (import.meta.env.VITE_SPOTIFY_CLIENT_ID || "").trim();
const REDIRECT_URI =
  (import.meta.env.VITE_SPOTIFY_REDIRECT_URI || "").trim() ||
  (typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}` : "");

const SCOPES = [
  "streaming",
  "user-read-email",
  "user-read-private",
  "user-read-playback-state",
  "user-modify-playback-state",
].join(" ");

const AUTH_KEY = "vyra:spotify:auth";
const PKCE_KEY = "vyra:spotify:pkce";

export const isSpotifyConfigured = () => Boolean(CLIENT_ID);
export const spotifyRedirectUri = () => REDIRECT_URI;

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
  try {
    window.localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  } catch {
    // Private mode: tokens stay in memory for this session only.
  }
  return auth;
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
  const verifier = randomString();
  const state = randomString();
  try {
    window.sessionStorage.setItem(
      PKCE_KEY,
      JSON.stringify({ verifier, state, redirectUri: REDIRECT_URI })
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

export function consumeSpotifyCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const state = params.get("state");
  const error = params.get("error");
  if (!code && !error) return null;

  // Clean the URL so a refresh does not replay the authorization code.
  params.delete("code");
  params.delete("state");
  params.delete("error");
  const query = params.toString();
  window.history.replaceState(
    {},
    document.title,
    `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`
  );

  if (error) return { error: params.get("error_description") || error };

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
  return { code, verifier: pending.verifier, redirectUri: pending.redirectUri || REDIRECT_URI };
}

async function readSpotifyError(response) {
  try {
    const data = await response.json();
    return data?.error?.message || data?.error_description || `Spotify request failed (${response.status})`;
  } catch {
    return `Spotify request failed (${response.status})`;
  }
}

export async function exchangeCode({ code, verifier, redirectUri }) {
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
  if (!response.ok) throw new Error(await readSpotifyError(response));
  const data = await response.json();
  return storeAuth({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + (data.expires_in || 3600) * 1000,
  });
}

async function refreshAccessToken(auth) {
  if (!auth?.refresh_token) return null;
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
  return storeAuth({
    access_token: data.access_token,
    refresh_token: data.refresh_token || auth.refresh_token,
    expires_at: Date.now() + (data.expires_in || 3600) * 1000,
  });
}

export async function getValidAuth(current) {
  const auth = current || readAuth();
  if (!auth) return null;
  if (auth.expires_at && Date.now() < auth.expires_at - 60_000) return auth;
  return refreshAccessToken(auth);
}

export async function spotifyFetch(path, token, options = {}) {
  const response = await fetch(`https://api.spotify.com/v1${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  if (response.status === 204) return null;
  if (!response.ok) throw new Error(await readSpotifyError(response));
  return response.json();
}

export async function searchSpotifyTracks(query, token, limit = 8) {
  const params = new URLSearchParams({
    q: query,
    type: "track",
    limit: String(limit),
    market: "NG",
  });
  const data = await spotifyFetch(`/search?${params}`, token);
  return data?.tracks?.items || [];
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
