import { useCallback, useEffect, useRef, useState } from "react";
import {
  clearAuth,
  consumeSpotifyCallback,
  exchangeCode,
  getValidAuth,
  isSpotifyConfigured,
  loadSpotifySdk,
  readAuth,
  searchSpotifyTracks,
  spotifyFetch,
  startSpotifyLogin,
} from "../lib/spotify";

const INITIAL_AUTH = () => (isSpotifyConfigured() ? readAuth() : null);

export default function useSpotify() {
  const [auth, setAuth] = useState(INITIAL_AUTH);
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(() =>
    !isSpotifyConfigured() ? "unconfigured" : INITIAL_AUTH() ? "connecting" : "logged-out"
  );
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

  const ensureToken = useCallback(async () => {
    const next = await getValidAuth(authRef.current);
    if (!next) {
      applyAuth(null);
      setStatus("logged-out");
      return "";
    }
    if (next !== authRef.current) applyAuth(next);
    return next.access_token;
  }, [applyAuth]);

  // Handle the redirect from Spotify Accounts (PKCE authorization code).
  useEffect(() => {
    const callback = consumeSpotifyCallback();
    if (!callback) return;
    if (callback.error) {
      setError(callback.error);
      setStatus("error");
      return;
    }
    let cancelled = false;
    setStatus("connecting");
    exchangeCode(callback)
      .then((next) => {
        if (cancelled) return;
        applyAuth(next);
        setError("");
        setStatus("connecting");
      })
      .catch((reason) => {
        if (cancelled) return;
        setError(reason instanceof Error ? reason.message : String(reason));
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [applyAuth]);

  // Keep the access token fresh without restarting the SDK player.
  useEffect(() => {
    if (!auth?.expires_at) return undefined;
    const delay = Math.max(0, auth.expires_at - Date.now() - 60_000);
    const timer = window.setTimeout(async () => {
      const next = await getValidAuth(auth);
      if (next) applyAuth(next);
      else {
        applyAuth(null);
        setStatus("logged-out");
      }
    }, delay);
    return () => window.clearTimeout(timer);
  }, [auth, applyAuth]);

  // Load the profile for the connected account.
  useEffect(() => {
    if (!auth?.access_token) return;
    let cancelled = false;
    spotifyFetch("/me", auth.access_token)
      .then((profile) => {
        if (!cancelled) setUser(profile);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      });
    return () => {
      cancelled = true;
    };
  }, [auth?.access_token]);

  // Create and connect the Web Playback SDK player once per login session.
  const hasAuth = Boolean(auth?.access_token);
  useEffect(() => {
    if (!hasAuth) return undefined;
    let cancelled = false;

    const connect = async () => {
      setStatus("connecting");
      setError("");
      try {
        const Spotify = await loadSpotifySdk();
        if (cancelled || !Spotify?.Player) return;

        const player = new Spotify.Player({
          name: "Vyra Web Player",
          getOAuthToken: (callback) => {
            getValidAuth(authRef.current)
              .then((next) => {
                if (next && next !== authRef.current) applyAuth(next);
                callback(next?.access_token || "");
              })
              .catch(() => callback(""));
          },
          volume: volumeRef.current,
        });
        playerRef.current = player;

        player.addListener("ready", ({ device_id }) => {
          if (cancelled) return;
          setDeviceId(device_id);
          setStatus("connected");
          setError("");
        });
        player.addListener("not_ready", () => {
          if (cancelled) return;
          setDeviceId(null);
          setStatus("connecting");
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

        const listener = ({ message }) => {
          if (cancelled) return;
          setError(message || "Spotify playback error. A Premium account is required.");
          setStatus("error");
        };
        [
          "initialization_error",
          "authentication_error",
          "account_error",
          "playback_error",
        ].forEach((event) => player.addListener(event, listener));

        const connected = await player.connect();
        if (!connected && !cancelled) {
          setError("Could not connect to Spotify. Check your account and try again.");
          setStatus("error");
        }
      } catch (reason) {
        if (cancelled) return;
        setError(reason instanceof Error ? reason.message : String(reason));
        setStatus("error");
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
  }, [hasAuth, applyAuth]);

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
    setError("");
    const started = await startSpotifyLogin();
    if (!started) setError("Spotify is not configured. Add your client ID to vyra/.env.local.");
  }, []);

  const logout = useCallback(() => {
    playerRef.current?.disconnect?.();
    playerRef.current = null;
    clearAuth();
    applyAuth(null);
    setUser(null);
    setDeviceId(null);
    setTrack(null);
    setPlayerState(null);
    setPlaying(false);
    setPosition(0);
    setDuration(0);
    setStatus("logged-out");
    setError("");
  }, [applyAuth]);

  const search = useCallback(
    async (query) => {
      if (!query?.trim()) return [];
      try {
        const token = await ensureToken();
        if (!token) return [];
        return await searchSpotifyTracks(query.trim(), token, 8);
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : String(reason));
        return [];
      }
    },
    [ensureToken]
  );

  const playTracks = useCallback(
    async (uris) => {
      if (!uris?.length) return false;
      if (!deviceId) {
        setError("Spotify player is still connecting. Try again in a moment.");
        return false;
      }
      try {
        const token = await ensureToken();
        if (!token) return false;
        await spotifyFetch(
          `/me/player/play?device_id=${encodeURIComponent(deviceId)}`,
          token,
          { method: "PUT", body: JSON.stringify({ uris, position_ms: 0 }) }
        );
        setError("");
        return true;
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : String(reason));
        return false;
      }
    },
    [deviceId, ensureToken]
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
