import { useEffect, useRef, useState } from "react";
import "../styles/embed.css";

const API_SRC = "https://open.spotify.com/embed/iframe-api/v1";
const SPOTIFY_API_KEY = "__vyraSpotifyIframeApi";
const ALLOW_ATTRIBUTE =
  "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
const VALID_TYPES = new Set(["track", "album", "playlist", "artist"]);

let apiPromise = null;

/**
 * Load Spotify's official IFrame API exactly once. The global callback is
 * installed before the script is injected because the API calls it on load.
 */
function loadSpotifyIframeApi() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Spotify IFrame API requires a browser."));
  }

  if (window[SPOTIFY_API_KEY]) {
    return Promise.resolve(window[SPOTIFY_API_KEY]);
  }

  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve, reject) => {
    const previousCallback = window.onSpotifyIframeApiReady;
    let settled = false;

    const handleReady = (api) => {
      if (settled) return;
      settled = true;

      // Preserve another integration's callback if one was already installed.
      if (typeof previousCallback === "function" && previousCallback !== handleReady) {
        try {
          previousCallback(api);
        } catch {
          // A third-party callback must not break this embed.
        }
      }

      window[SPOTIFY_API_KEY] = api;
      resolve(api);
    };

    // Older API builds expose controllers through IFRAMES on the callback.
    if (previousCallback?.IFRAMES) {
      handleReady.IFRAMES = previousCallback.IFRAMES;
    }

    window.onSpotifyIframeApiReady = handleReady;

    const fail = () => {
      if (settled) return;
      settled = true;
      reject(new Error("Spotify IFrame API could not be loaded."));
    };

    const existingScript =
      document.querySelector('script[data-vyra-spotify-iframe-api="true"]') ||
      document.querySelector(`script[src="${API_SRC}"]`);

    if (existingScript) {
      existingScript.addEventListener("error", fail, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = API_SRC;
    script.async = true;
    script.dataset.vyraSpotifyIframeApi = "true";
    script.addEventListener("error", fail, { once: true });
    document.head.appendChild(script);
  });

  return apiPromise;
}

/** Best-effort support for the IFRAMES registry mentioned by older API docs. */
function findControllerFromIframes(element) {
  const frames = window.onSpotifyIframeApiReady?.IFRAMES;
  if (!frames) return null;

  const matches = (value) => {
    const controller = value?.controller || value;
    const iframe = value?.iframe || value?.element || controller?.iframeElement;
    return iframe === element || value === element;
  };

  if (typeof frames.get === "function" && matches(frames.get(element))) {
    return frames.get(element)?.controller || frames.get(element);
  }

  if (Array.isArray(frames)) {
    const found = frames.find(matches);
    return found ? found.controller || found : null;
  }

  if (typeof frames === "object") {
    const found = Object.values(frames).find(matches);
    return found ? found.controller || found : null;
  }

  return null;
}

export default function SpotifyEmbed({
  type = "track",
  id,
  height = 152,
  title = "Spotify embed",
  onPlay,
}) {
  const onPlayRef = useRef(onPlay);
  const frameRef = useRef(null);
  const [apiAttached, setApiAttached] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    onPlayRef.current = onPlay;
  }, [onPlay]);

  const isSupportedType = VALID_TYPES.has(type);
  const embedId = id === undefined || id === null ? "" : String(id).trim();
  const isValid = isSupportedType && embedId.length > 0;
  const embedHeight = height ?? 152;
  const embedUrl = isValid
    ? `https://open.spotify.com/embed/${type}/${encodeURIComponent(embedId)}`
    : "";
  const spotifyUri = isValid ? `spotify:${type}:${embedId}` : "";

  useEffect(() => {
    if (!isValid) return undefined;

    const wrapper = frameRef.current;
    if (!wrapper) return undefined;

    let disposed = false;
    let controller = null;
    let removeListener = null;
    let anchor = null;
    const reactIframes = new Set(wrapper.querySelectorAll("iframe"));

    const removeStrayIframes = () => {
      wrapper.querySelectorAll("iframe").forEach((node) => {
        if (!reactIframes.has(node)) node.remove();
      });
    };

    setApiAttached(false);
    setActive(false);

    const handlePlaybackStarted = () => {
      if (disposed) return;
      setActive(true);
      onPlayRef.current?.();
    };

    const bindController = (created) => {
      if (disposed || !created) return;
      controller = created;

      const addListener = created.addListener || created.on;
      const unsubscribe = addListener?.call(
        created,
        "playback_started",
        handlePlaybackStarted
      );

      removeListener =
        typeof unsubscribe === "function"
          ? unsubscribe
          : () =>
              created.removeListener?.(
                "playback_started",
                handlePlaybackStarted
              );

      setApiAttached(true);
    };

    // The IFrame API replaces this unowned node with its own iframe, so React
    // never tries to reconcile the player iframe it creates.
    anchor = document.createElement("span");
    anchor.setAttribute("data-vyra-spotify-anchor", "true");
    anchor.style.display = "none";
    wrapper.appendChild(anchor);

    const existingController = findControllerFromIframes(anchor);
    if (existingController && typeof existingController.addListener === "function") {
      bindController(existingController);
    } else {
      loadSpotifyIframeApi()
        .then((api) => {
          if (disposed || typeof api?.createController !== "function") return;

          try {
            api.createController(
              anchor,
              { uri: spotifyUri, width: "100%", height: embedHeight },
              bindController
            );
          } catch {
            // Keep the declarative iframe as the only player.
            removeStrayIframes();
            anchor?.remove();
            anchor = null;
          }
        })
        .catch(() => {
          // API failure is non-fatal: the official embed iframe still works.
          removeStrayIframes();
          anchor?.remove();
          anchor = null;
        });
    }

    return () => {
      disposed = true;

      if (typeof removeListener === "function") {
        removeListener();
      } else {
        controller?.removeListener?.("playback_started", handlePlaybackStarted);
      }

      if (controller?.destroy) {
        controller.destroy();
      }
      removeStrayIframes();
      anchor?.remove();
    };
  }, [isValid, embedUrl, spotifyUri, embedHeight]);

  if (!isValid) {
    return (
      <section
        className="spotify-embed-card spotify-embed-card--empty"
        aria-label="Spotify embed"
        role="status"
        aria-live="polite"
      >
        <header className="spotify-embed-card__header">
          <span className="spotify-embed-card__badge">Spotify player</span>
        </header>
        <p className="spotify-embed-card__message">
          {!isSupportedType
            ? "This embed supports Spotify tracks, albums, playlists, and artists only."
            : "Add a Spotify track, album, playlist, or artist ID to load the official embed."}
        </p>
        <p className="spotify-embed-card__note">
          Audio is streamed by Spotify. VYRA’s local/Audius player stays separate.
        </p>
      </section>
    );
  }

  return (
    <section
      className="spotify-embed-card"
      aria-label={`${title} — ${active ? "Playing on Spotify" : "Spotify player"}`}
    >
      <header className="spotify-embed-card__header">
        <span className="spotify-embed-card__badge">
          {active ? "Playing on Spotify" : "Spotify player"}
        </span>
        <span className="spotify-embed-card__type">{type}</span>
      </header>

      <div className="spotify-embed-card__frame" ref={frameRef}>
        {!apiAttached && (
          <iframe
            key={embedUrl}
            src={embedUrl}
            title={title}
            width="100%"
            height={embedHeight}
            frameBorder="0"
            allowFullScreen
            loading="lazy"
            allow={ALLOW_ATTRIBUTE}
          />
        )}
      </div>

      <p className="spotify-embed-card__note">
        Playback is controlled by Spotify’s embedded player. VYRA pauses its own
        audio when Spotify starts; its controls never drive this embed.
      </p>
    </section>
  );
}
