import { motion } from "framer-motion";
import { Play, Pause } from "lucide-react";
import Equalizer from "./Equalizer";

export default function TrackCard({ track, onPlay, active, playing }) {
  return (
    <motion.article
      className={`track-card ${active ? "is-active" : ""}`}
      onClick={() => onPlay(track)}
      whileHover={{ y: -7 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
    >
      <div className="track-card__art">
        <img src={track.cover} alt={`${track.title} cover art`} loading="lazy" />
        <span className="track-card__scrim" />
        {active && (
          <span className="track-card__status">
            <Equalizer bars={4} animated={playing} barWidth={2} />
            <span>{playing ? "Playing" : "Paused"}</span>
          </span>
        )}
        <span className="track-card__genre">{track.genre}</span>
        <button
          type="button"
          className="play-fab"
          onClick={(e) => {
            e.stopPropagation();
            onPlay(track);
          }}
          aria-label={`${active && playing ? "Pause" : "Play"} ${track.title}`}
        >
          {active && playing ? (
            <Pause size={17} fill="currentColor" />
          ) : (
            <Play size={17} fill="currentColor" />
          )}
        </button>
      </div>
      <div className="track-card__body">
        <h3>{track.title}</h3>
        <p>{track.artist}</p>
      </div>
    </motion.article>
  );
}
