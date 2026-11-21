import { Pause, Play, Repeat, ScrollText, Shuffle, SkipBack, SkipForward, Volume1, Volume2, VolumeX, X } from "lucide-react";
import Equalizer from "./Equalizer";
import { formatTime } from "../data/music";

export default function SpotifyPlayer({ spotify, onClose, onOpenLyrics, lyricsOpen = false }) {
  const track = spotify.track;
  if (!track) return null;

  const total = spotify.duration || 1;
  const pct = `${Math.min(100, (spotify.position / total) * 100)}%`;
  const volPct = `${spotify.volume * 100}%`;
  const VolIcon = spotify.volume === 0 ? VolumeX : spotify.volume < 0.5 ? Volume1 : Volume2;
  const art = track.album?.images?.at(-1)?.url || track.album?.images?.[0]?.url || "";
  const artist = track.artists?.map((item) => item.name).join(", ") || "Spotify";

  return (
    <footer className="player spotify-player" aria-label="Spotify player">
      {spotify.error && (
        <p className="player__error" role="status">
          {spotify.error}
        </p>
      )}
      <span className="player__line" aria-hidden="true" />
      <span className="player__mobile-progress" aria-hidden="true">
        <span style={{ width: pct }} />
      </span>

      <div className="player__now">
        <div className="player__art">
          <img src={art} alt={`${track.name} cover`} />
          <span className={`player__art-eq ${spotify.playing ? "is-on" : ""}`}>
            <Equalizer bars={4} animated={spotify.playing} barWidth={2} />
          </span>
        </div>
        <div className="player__meta">
          <p className="player__title">{track.name}</p>
          <p className="player__artist">{artist}</p>
        </div>
        <span className="spotify-player__badge">Spotify</span>
      </div>

      <div className="player__center">
        <div className="player__controls">
          <button
            type="button"
            className={`ctrl ${spotify.shuffle ? "is-on" : ""}`}
            onClick={() => spotify.setShuffleMode(!spotify.shuffle)}
            aria-label="Shuffle"
            aria-pressed={spotify.shuffle}
            title="Shuffle"
          >
            <Shuffle size={18} />
          </button>
          <button type="button" className="ctrl" onClick={spotify.previous} aria-label="Previous track" title="Previous">
            <SkipBack size={20} fill="currentColor" />
          </button>
          <button
            type="button"
            className={`player__play ${spotify.playing ? "is-playing" : ""}`}
            onClick={spotify.toggle}
            aria-label={spotify.playing ? "Pause" : "Play"}
            title={spotify.playing ? "Pause" : "Play"}
          >
            {spotify.playing ? (
              <Pause size={21} fill="currentColor" />
            ) : (
              <Play size={21} fill="currentColor" className="player__play-icon" />
            )}
          </button>
          <button type="button" className="ctrl" onClick={spotify.next} aria-label="Next track" title="Next">
            <SkipForward size={20} fill="currentColor" />
          </button>
          <button
            type="button"
            className={`ctrl ${spotify.repeat ? "is-on" : ""}`}
            onClick={() => spotify.setRepeatMode(!spotify.repeat)}
            aria-label="Repeat"
            aria-pressed={spotify.repeat}
            title="Repeat"
          >
            <Repeat size={18} />
          </button>
        </div>

        <div className="player__timeline">
          <span>{formatTime(spotify.position / 1000)}</span>
          <input
            type="range"
            min="0"
            max={total}
            step="1000"
            value={Math.min(spotify.position, total)}
            onChange={(event) => spotify.seek(Number(event.target.value))}
            style={{ "--progress": pct }}
            aria-label="Seek"
          />
          <span>{formatTime(total / 1000)}</span>
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
          className="player__exit"
          onClick={onClose}
          aria-label="Back to Vyra library"
          title="Back to Vyra library"
        >
          <X size={18} />
          <span>Library</span>
        </button>
        <button
          type="button"
          className="ctrl"
          onClick={() => spotify.setVolume(spotify.volume === 0 ? 0.72 : 0)}
          aria-label={spotify.volume === 0 ? "Unmute" : "Mute"}
          title={spotify.volume === 0 ? "Unmute" : "Mute"}
        >
          <VolIcon size={18} />
        </button>
        <input
          className="player__volume"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={spotify.volume}
          onChange={(event) => spotify.setVolume(Number(event.target.value))}
          style={{ "--progress": volPct }}
          aria-label="Volume"
        />
      </div>
    </footer>
  );
}
