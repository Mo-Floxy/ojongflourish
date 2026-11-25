import { motion } from "framer-motion";
import { Play, Pause, Music2 } from "lucide-react";

export default function PlaylistCard({ playlist, onPlay, onPlayPlaylist, active, playing }) {
  const play = () => {
    if (onPlayPlaylist) onPlayPlaylist(playlist);
    else onPlay(playlist.trackId);
  };

  return (
    <motion.article
      className={`playlist-card ${active ? "is-active" : ""}`}
      style={{ "--accent": playlist.accent }}
      onClick={play}
      whileHover={{ y: -7 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    >
      <div className="playlist-card__art">
        <span className="playlist-card__vinyl" aria-hidden="true">
          <span className="playlist-card__vinyl-label" />
        </span>
        <img src={playlist.cover} alt={`${playlist.title} playlist cover`} loading="lazy" />
        <span className="playlist-card__scrim" />
        <button
          type="button"
          className="play-fab play-fab--lg"
          onClick={(e) => {
            e.stopPropagation();
            play();
          }}
          aria-label={`Play ${playlist.title}`}
        >
          {active && playing ? (
            <Pause size={19} fill="currentColor" />
          ) : (
            <Play size={19} fill="currentColor" />
          )}
        </button>
        <span className="playlist-card__count">
          <Music2 size={11} />
          {playlist.count} tracks
        </span>
      </div>
      <h3>{playlist.title}</h3>
      <p>{playlist.subtitle}</p>
      {playlist.saves && (
        <span className="playlist-card__saves">{playlist.saves}</span>
      )}
    </motion.article>
  );
}
