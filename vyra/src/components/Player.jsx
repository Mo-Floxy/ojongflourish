import { AnimatePresence, motion } from "framer-motion";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Heart,
  Volume2,
  Volume1,
  VolumeX,
  ListMusic,
  Maximize2,
  ScrollText,
  X,
} from "lucide-react";
import Equalizer from "./Equalizer";
import { formatTime } from "../data/music";

export default function Player({
  track,
  queue,
  playing,
  progress,
  duration,
  error,
  loading,
  onToggle,
  onNext,
  onPrev,
  onSeek,
  volume,
  muted,
  onVolume,
  onToggleMute,
  shuffle,
  repeat,
  onShuffle,
  onRepeat,
  liked,
  onToggleLike,
  queueOpen,
  onToggleQueue,
  onCloseQueue,
  onPlayTrack,
  externalActive = false,
  onReturnToVyra,
  onOpenLyrics,
  lyricsOpen = false,
}) {
  const total = duration || track.duration;
  const pct = `${Math.min(100, (progress / total) * 100)}%`;
  const volPct = `${(muted ? 0 : volume) * 100}%`;
  const VolIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
  const keyFor = (item) => `${item.source || "local"}:${item.id}`;
  const currentIndex = queue.findIndex((t) => keyFor(t) === keyFor(track));
  const upNext = [...queue.slice(currentIndex + 1), ...queue.slice(0, Math.max(0, currentIndex))].slice(0, 6);

  const goFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
    } catch {
      /* fullscreen can be blocked by the host */
    }
  };

  return (
    <footer className="player" aria-label="Music player">
      {(error || loading) && (
        <p className="player__error" role="status">
          {error || (loading ? "Resolving the Audius stream…" : "")}
        </p>
      )}
      {externalActive && (
        <div className="player__external" role="status">
          <span className="spotify-account__dot" aria-hidden="true" />
          <span>Spotify embed active · VYRA audio paused</span>
          <button type="button" onClick={onReturnToVyra}>Back to VYRA</button>
        </div>
      )}
      <span className="player__line" aria-hidden="true" />
      <input
        type="range"
        className="player__mobile-progress range"
        min="0"
        max={total}
        step="1"
        value={Math.min(progress, total)}
        onChange={(event) => onSeek(Number(event.target.value))}
        style={{ "--val": pct }}
        aria-label="Seek"
        disabled={externalActive}
      />

      <div className="player__now">
        <div className="player__art">
          <img src={track.cover} alt={`${track.title} cover`} />
          <span className={`player__art-eq ${playing ? "is-on" : ""}`}>
            <Equalizer bars={4} animated={playing} barWidth={2} />
          </span>
        </div>
        <div className="player__meta">
          <p className="player__title">{track.title}</p>
          <p className="player__artist">{track.artist}</p>
        </div>
        <button
          type="button"
          className={`player__like ${liked.has(track.id) ? "is-liked" : ""}`}
          onClick={() => onToggleLike(track)}
          aria-label={liked.has(track.id) ? "Remove from liked songs" : "Like song"}
          title="Like"
        >
          <Heart size={18} fill={liked.has(track.id) ? "currentColor" : "none"} />
        </button>
        <button
          type="button"
          className={`ctrl player__lyrics-mini ${lyricsOpen ? "is-on" : ""}`}
          onClick={onOpenLyrics}
          aria-label="Lyrics"
          title="Lyrics"
        >
          <ScrollText size={18} />
        </button>
      </div>

      <div className={`player__center ${externalActive ? "is-external" : ""}`}>
        <div className="player__controls">
          <button
            type="button"
            className={`ctrl ${shuffle ? "is-on" : ""}`}
            onClick={onShuffle}
            aria-label="Shuffle"
            aria-pressed={shuffle}
            title="Shuffle"
            disabled={externalActive}
          >
            <Shuffle size={18} />
          </button>
          <button
            type="button"
            className="ctrl"
            onClick={onPrev}
            aria-label="Previous track"
            title="Previous"
            disabled={externalActive}
          >
            <SkipBack size={20} fill="currentColor" />
          </button>
          <button
            type="button"
            className={`player__play ${playing ? "is-playing" : ""}`}
            onClick={onToggle}
            aria-label={playing ? "Pause" : "Play"}
            title={playing ? "Pause" : "Play"}
            disabled={externalActive}
          >
            {playing ? <Pause size={21} fill="currentColor" /> : <Play size={21} fill="currentColor" className="player__play-icon" />}
          </button>
          <button
            type="button"
            className="ctrl"
            onClick={onNext}
            aria-label="Next track"
            title="Next"
            disabled={externalActive}
          >
            <SkipForward size={20} fill="currentColor" />
          </button>
          <button
            type="button"
            className={`ctrl ${repeat ? "is-on" : ""}`}
            onClick={onRepeat}
            aria-label="Repeat"
            aria-pressed={repeat}
            title="Repeat"
            disabled={externalActive}
          >
            <Repeat size={18} />
          </button>
        </div>

        <div className="player__timeline">
          <span>{formatTime(progress)}</span>
          <input
            type="range"
            min="0"
            max={total}
            step="1"
            value={Math.min(progress, total)}
            onChange={(e) => onSeek(Number(e.target.value))}
            className="range range--progress"
            style={{ "--val": pct }}
            aria-label="Seek"
            disabled={externalActive}
          />
          <span>{formatTime(total)}</span>
        </div>
      </div>

      <div className="player__right">
        <button
          type="button"
          className={`ctrl player__lyrics-btn ${lyricsOpen ? "is-on" : ""}`}
          onClick={onOpenLyrics}
          aria-label="Lyrics"
          title="Lyrics"
        >
          <ScrollText size={19} />
        </button>
        <button
          type="button"
          className={`ctrl player__queue-btn ${queueOpen ? "is-on" : ""}`}
          onClick={onToggleQueue}
          aria-label="Queue"
          title="Queue"
        >
          <ListMusic size={19} />
        </button>

        <div className="player__volume">
          <button type="button" className="ctrl" onClick={onToggleMute} aria-label="Mute" title="Volume">
            <VolIcon size={19} />
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={muted ? 0 : volume}
            onChange={(e) => onVolume(Number(e.target.value))}
            className="range range--volume"
            style={{ "--val": volPct }}
            aria-label="Volume"
          />
        </div>

        <button type="button" className="ctrl player__fullscreen" onClick={goFullscreen} aria-label="Fullscreen" title="Fullscreen">
          <Maximize2 size={18} />
        </button>
      </div>

      <AnimatePresence>
        {queueOpen && (
          <>
            <div className="queue-scrim" onClick={onCloseQueue} />
            <motion.div
              className="queue"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <div className="queue__head">
                <div>
                  <p className="queue__kicker">Queue</p>
                  <h4>Up next</h4>
                </div>
                <button type="button" className="icon-btn icon-btn--sm" onClick={onCloseQueue} aria-label="Close queue">
                  <X size={15} />
                </button>
              </div>

              <div className="queue__current">
                <img src={track.cover} alt="" />
                <div>
                  <p>{track.title}</p>
                  <span>{track.artist} · now playing</span>
                </div>
                <Equalizer bars={4} animated={playing} barWidth={2} className="eq--accent" />
              </div>

              <p className="queue__label">Next from your mix</p>
              <div className="queue__list">
                {upNext.map((t) => (
                  <button
                    key={keyFor(t)}
                    type="button"
                    className="queue__row"
                    onClick={() => onPlayTrack(t)}
                  >
                    <img src={t.cover} alt="" />
                    <span className="queue__meta">
                      <span className="queue__title">{t.title}</span>
                      <span className="queue__artist">{t.artist}</span>
                    </span>
                    <span className="queue__dur">{formatTime(t.duration)}</span>
                    <span className="queue__play">
                      <Play size={12} fill="currentColor" />
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </footer>
  );
}
