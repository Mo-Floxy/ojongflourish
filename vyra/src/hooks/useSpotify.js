import { useCallback, useEffect, useRef, useState } from "react";
import {
  clearAuth,
  consumeSpotifyCallback,
  exchangeCode,
  getValidAuth,
  isSpotifyConfigured,
  loadSpotifySdk,
  readAuth,
  searchSpotifyCatalog,
  searchSpotifyTracks,
  spotifyFetch,
  startSpotifyLogin,
} from "../lib/spotify";

const emptyCatalog = () => ({ tracks: [], artists: [], albums: [], playlists: [] });
const initialAuth = () => (isSpotifyConfigured() ? readAuth() : null);

const friendlyError = (reason) => {
  if (reason instanceof Error) return reason.message;
  return reason ? String(reason) : "Spotify could not complete that request.";
};

export default function useSpotify() {
  const [auth, setAuth] = useState(initialAuth);
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(() => {
    if (!isSpotifyConfigured()) return "unconfigured";
    return initialAuth() ? "connected" : "logged-out";
  });
  const [error, setError] = useState("");
  const [deviceId, setDeviceId] = useState(null);
  const [playerState, setPlayerState] = useState(null);
  const [track, setTrack] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.72);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);

  const authRef = useRef(auth);
  const playerRef = useRef(null);
  const volumeRef = useRef(volume);
  authRef.current = auth;
  volumeRef.current = volume;

  const applyAuth = useCallback((next) => {
    authRef.current = next;
    setAuth(next);
  }, []);

  const clearSession = useCallback(
    (message = "") => {
      clearAuth();
      playerRef.current?.disconnect?.();
      playerRef.current = null;
      applyAuth(null);
      setUser(null);
      setDeviceId(null);
      setPlayerState(null);
      setTrack(null);
      setPlaying(false);
      setPosition(0);
      setDuration(0);
      setStatus("logged-out");
      setError(message);
    },
    [applyAuth]
  );

  const ensureToken = useCallback(async () => {
    const next = await getValidAuth(authRef.current);
    if (!next) {
      clearSession("Your Spotify session expired. Connect Spotify again.");
      return "";
    }
    if (next !== authRef.current) applyAuth(next);
    return next.access_token;
  }, [applyAuth, clearSession]);

  const handleRequestError = useCallback(
    (reason) => {
      if (reason?.authExpired || reason?.status === 401) {
        clearSession("Your Spotify session expired. Connect Spotify again.");
        return;
      }
      setError(friendlyError(reason));
    },
    [clearSession]
  );

  // Handle the redirect from Spotify Accounts (PKCE authorization code).
  useEffect(() => {
    const callback = consumeSpotifyCallback();
    if (!callback) return undefined;
    if (callback.error) {
      clearSession(callback.error);
      return undefined;
    }

    let cancelled = false;
    setError("");
    exchangeCode(callback)
      .then((next) => {
        if (cancelled) return;
        applyAuth(next);
        setStatus("connected");
      })
      .catch((reason) => {
        if (cancelled) return;
        setStatus("logged-out");
        setError(friendlyError(reason));
      });

    return () => {
      cancelled = true;
    };
  }, [applyAuth, clearSession]);

  // Keep the access token fresh without restarting the SDK player.
  useEffect(() => {
    if (!auth?.expires_at) return undefined;
    const delay = Math.max(0, auth.expires_at - Date.now() - 60_000);
    const timer = window.setTimeout(async () => {
      const next = await ensureToken();
      if (next) setStatus((current) => (current === "logged-out" ? "connected" : current));
    }, delay);
    return () => window.clearTimeout(timer);
  }, [auth?.expires_at, ensureToken]);

  // Load the profile for the connected account.
  useEffect(() => {
    if (!auth?.access_token) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const token = await ensureToken();
        if (!token || cancelled) return;
        const profile = await spotifyFetch("/me", token);
        if (!cancelled) setUser(profile);
      } catch (reason) {
        if (cancelled) return;
        if (reason?.authExpired) clearSession("Your Spotify session expired. Connect Spotify again.");
        else setUser(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [auth?.access_token, ensureToken, clearSession]);

  // Create and connect the Web Playback SDK player once per login session.
  const hasAuth = Boolean(auth?.access_token);
  useEffect(() => {
    if (!hasAuth) return undefined;
    let cancelled = false;

    const connect = async () => {
      try {
        const Spotify = await loadSpotifySdk();
        if (cancelled || !Spotify?.Player) return;

        const player = new Spotify.Player({
          name: "Vyra Web Player",
          getOAuthToken: (callback) => {
            ensureToken()
              .then((token) => callback(token || ""))
              .catch(() => callback(""));
          },
          volume: volumeRef.current,
        });
        playerRef.current = player;

        player.addListener("ready", ({ device_id }) => {
          if (cancelled) return;
          setDeviceId(device_id);
          setError("");
        });

        player.addListener("not_ready", () => {
          if (cancelled) return;
          setDeviceId(null);
        });

        player.addListener("player_state_changed", (state) => {
          if (cancelled || !state) return;
          setPlayerState(state);
          setTrack(state.track_window?.current_track || null);
          setPlaying(!state.paused);
          setPosition(state.position || 0);
          setDuration(state.duration || 0);
          setShuffle(Boolean(state.shuffle));
          setRepeat(state.repeat_mode !== "off");
          if (typeof state.volume === "number") setVolumeState(state.volume);
        });

        const sdkMessages = {
          initialization_error: "Spotify’s player could not start in this browser. Search and embeds still work.",
          authentication_error: "Your Spotify session expired. Connect Spotify again.",
          account_error: "A Spotify Premium account is required for in-app playback. Use an embed or open in Spotify instead.",
          playback_error: "Spotify could not start playback here. Use the official embed or open in Spotify.",
        };
        // addListener callbacks need the event name; wrap each registration.
        Object.entries(sdkMessages).forEach(([eventName, fallbackMessage]) => {
          player.addListener(eventName, ({ message } = {}) => {
            if (cancelled) return;
            const text = fallbackMessage || message || "Spotify playback is unavailable.";
            if (eventName === "authentication_error") clearSession(text);
            else {
              setError(text);
              if (eventName === "account_error") setDeviceId(null);
            }
          });
        });

        const connected = await player.connect();
        if (!connected && !cancelled) {
          setError("Spotify playback is not ready on this device. Search, official links, and embeds still work.");
        }
      } catch (reason) {
        if (cancelled) return;
        setError(friendlyError(reason));
      }
    };

    connect();
    return () => {
      cancelled = true;
      playerRef.current?.disconnect?.();
      playerRef.current = null;
      setDeviceId(null);
      setTrack(null);
      setPlaying(false);
    };
  }, [hasAuth, ensureToken, clearSession]);

  // Poll for smooth progress; player_state_changed only fires on state changes.
  useEffect(() => {
    if (!playing || !playerRef.current) return undefined;
    const timer = window.setInterval(async () => {
      try {
        const state = await playerRef.current?.getCurrentState();
        if (state) {
          setPosition(state.position || 0);
          setDuration(state.duration || 0);
        }
      } catch {
        // Ignore transient SDK errors; the next poll will recover.
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [playing]);

  const login = useCallback(async () => {
    // Never let a previous account linger in the UI while a new login starts.
    clearSession("");
    setStatus("connecting");
    const started = await startSpotifyLogin();
    if (!started) {
      setStatus("logged-out");
      setError("Spotify is not configured. Add your client ID to vyra/.env.local.");
    }
  }, [clearSession]);

  const logout = useCallback(() => clearSession(""), [clearSession]);

  const search = useCallback(
    async (query) => {
      if (!query?.trim()) return [];
      try {
        const token = await ensureToken();
        if (!token) return [];
        return await searchSpotifyTracks(query.trim(), token, 8);
      } catch (reason) {
        handleRequestError(reason);
        return [];
      }
    },
    [ensureToken, handleRequestError]
  );

  const searchCatalog = useCallback(
    async (query, options = {}) => {
      if (!query?.trim()) return emptyCatalog();
      try {
        const token = await ensureToken();
        if (!token) return emptyCatalog();
        return await searchSpotifyCatalog(query.trim(), token, options);
      } catch (reason) {
        handleRequestError(reason);
        return emptyCatalog();
      }
    },
    [ensureToken, handleRequestError]
  );

  const playTracks = useCallback(
    async (uris) => {
      if (!uris?.length) return false;
      if (!deviceId) {
        setError("Spotify playback is still starting, or this account is not eligible. You can use an embed or open in Spotify.");
        return false;
      }
      try {
        const token = await ensureToken();
        if (!token) return false;
        await spotifyFetch(`/me/player/play?device_id=${encodeURIComponent(deviceId)}`, token, {
          method: "PUT",
          body: JSON.stringify({ uris, position_ms: 0 }),
        });
        setError("");
        return true;
      } catch (reason) {
        handleRequestError(reason);
        return false;
      }
    },
    [deviceId, ensureToken, handleRequestError]
  );

  const toggle = useCallback(() => {
    playerRef.current?.togglePlay?.();
  }, []);
  const next = useCallback(() => {
    playerRef.current?.next?.();
  }, []);
  const previous = useCallback(() => {
    playerRef.current?.previous?.();
  }, []);
  const pause = useCallback(() => {
    playerRef.current?.pause?.();
  }, []);
  const seek = useCallback((ms) => {
    playerRef.current?.seek?.(Math.max(0, Math.round(ms)));
  }, []);
  const setVolume = useCallback((value) => {
    const nextVolume = Math.min(1, Math.max(0, value));
    setVolumeState(nextVolume);
    playerRef.current?.setVolume?.(nextVolume);
  }, []);
  const setShuffleMode = useCallback((value) => {
    setShuffle(value);
    playerRef.current?.setShuffle?.(value);
  }, []);
  const setRepeatMode = useCallback((value) => {
    setRepeat(value);
    playerRef.current?.setRepeatMode?.(value ? "context" : "off");
  }, []);

  return {
    configured: isSpotifyConfigured(),
    status,
    authenticated: hasAuth,
    playerReady: Boolean(deviceId),
    error,
    user,
    deviceId,
    auth,
    track,
    playerState,
    playing,
    position,
    duration,
    volume,
    shuffle,
    repeat,
    login,
    logout,
    search,
    searchCatalog,
    playTracks,
    toggle,
    next,
    previous,
    pause,
    seek,
    setVolume,
    setShuffleMode,
    setRepeatMode,
    clearError: () => setError(""),
  };
}
