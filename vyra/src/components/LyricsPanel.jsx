import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ExternalLink, Music2, RefreshCw, X } from "lucide-react";
import { fetchLyrics } from "../services/lyrics";
import "../styles/lyrics.css";

function shortMessage(error) {
  return error?.message || "Lyrics could not be loaded right now.";
}

export default function LyricsPanel({ open, onClose, track, position = 0 }) {
  const [state, setState] = useState("idle");
  const [lyrics, setLyrics] = useState(null);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [autoFollow, setAutoFollow] = useState(true);
  const scrollRef = useRef(null);
  const lineRefs = useRef([]);

  const trackKey = track?.key || "";
  const title = track?.title || "Unknown track";
  const artist = track?.artist || "Unknown artist";
  const album = track?.album || "";
  const art = track?.art || "";

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    setLyrics(null);
    setError("");
    setAutoFollow(true);
    lineRefs.current = [];

    if (!open || !trackKey || !title || !artist) {
      setState("idle");
      return undefined;
    }

    const controller = new AbortController();
    setState("loading");
    fetchLyrics({ title, artist, album, duration: track?.duration }, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setLyrics(result);
        setState(result.status === "instrumental" ? "instrumental" : "ready");
      })
      .catch((reason) => {
        if (controller.signal.aborted || reason?.name === "AbortError") return;
        setError(shortMessage(reason));
        setState("error");
      });

    return () => controller.abort();
  }, [open, trackKey, title, artist, album, track?.duration, retryKey]);

  const activeIndex = useMemo(() => {
    if (!lyrics?.synced || !lyrics.lines?.length) return -1;
    let index = -1;
    for (let i = 0; i < lyrics.lines.length; i += 1) {
      if (position + 0.05 >= lyrics.lines[i].time) index = i;
      else break;
    }
    return index;
  }, [lyrics, position]);

  useEffect(() => {
    if (!autoFollow || activeIndex < 0) return;
    const container = scrollRef.current;
    const line = lineRefs.current[activeIndex];
    if (!container || !line) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const lineTop = line.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
    container.scrollTo({
      top: lineTop - container.clientHeight / 2 + line.clientHeight / 2,
      behavior: reduced ? "auto" : "smooth",
    });
  }, [activeIndex, autoFollow, lyrics]);

  const pauseFollowing = () => setAutoFollow(false);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="lyrics"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="lyrics-title"
        >
          <button type="button" className="lyrics__scrim" onClick={onClose} aria-label="Close lyrics" />

          <motion.section
            className="lyrics__panel"
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.985 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="lyrics__glow" aria-hidden="true" />

            <header className="lyrics__head">
              <div>
                <p className="lyrics__eyebrow">Now playing · Lyrics</p>
                <h2 id="lyrics-title">{title}</h2>
                <p className="lyrics__artist">{artist}{album ? ` · ${album}` : ""}</p>
              </div>
              <button type="button" className="lyrics__close" onClick={onClose} aria-label="Close lyrics">
                <X size={19} />
              </button>
            </header>

            <div className="lyrics__body">
              <aside className="lyrics__aside">
                <div className="lyrics__art">
                  {art ? <img src={art} alt={`${title} artwork`} /> : <Music2 size={42} aria-hidden="true" />}
                </div>
                <div className="lyrics__meta">
                  <span className="lyrics__source">
                    <span className="lyrics__dot" aria-hidden="true" /> Lyrics by LRCLIB
                  </span>
                  <a href="https://lrclib.net" target="_blank" rel="noreferrer">
                    About the provider <ExternalLink size={12} />
                  </a>
                </div>
                <p className="lyrics__hint">
                  Lyrics follow the real playback position. Scroll freely to read ahead; use “Follow
                  playback” to jump back to the current line.
                </p>
              </aside>

              <div className="lyrics__main">
                {state === "loading" && (
                  <div className="lyrics__state" aria-live="polite">
                    <span className="lyrics__spinner" aria-hidden="true" />
                    <p>Finding lyrics for this exact track…</p>
                  </div>
                )}

                {state === "instrumental" && (
                  <div className="lyrics__state" role="status">
                    <Music2 size={28} aria-hidden="true" />
                    <h3>Instrumental</h3>
                    <p>LRCLIB marks this track as having no lyrics.</p>
                  </div>
                )}

                {state === "error" && (
                  <div className="lyrics__state lyrics__state--error" role="alert">
                    <Music2 size={28} aria-hidden="true" />
                    <h3>Lyrics unavailable</h3>
                    <p>{error}</p>
                    <button type="button" onClick={() => setRetryKey((key) => key + 1)}>
                      <RefreshCw size={14} /> Try again
                    </button>
                  </div>
                )}

                {state === "ready" && lyrics && (
                  <>
                    <div className="lyrics__toolbar">
                      <span>
                        {lyrics.synced ? "Synced lyrics" : "Unsynced lyrics"} · {lyrics.lines.length} lines
                      </span>
                      {lyrics.synced && !autoFollow && (
                        <button type="button" onClick={() => setAutoFollow(true)}>
                          <ArrowDown size={13} /> Follow playback
                        </button>
                      )}
                    </div>
                    {!lyrics.synced && (
                      <p className="lyrics__notice">
                        Timestamps aren’t available from the provider for this track, so these lyrics
                        won’t highlight automatically.
                      </p>
                    )}
                    <div
                      className={`lyrics__scroll ${lyrics.synced ? "is-synced" : ""}`}
                      ref={scrollRef}
                      onWheel={lyrics.synced ? pauseFollowing : undefined}
                      onTouchMove={lyrics.synced ? pauseFollowing : undefined}
                    >
                      <div className="lyrics__lines">
                        {lyrics.lines.map((line, index) => (
                          <p
                            key={`${line.time}-${index}-${line.text}`}
                            ref={(node) => { lineRefs.current[index] = node; }}
                            className={`lyrics__line ${index === activeIndex ? "is-active" : ""}`}
                            aria-current={index === activeIndex ? "true" : undefined}
                          >
                            {line.text}
                          </p>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
