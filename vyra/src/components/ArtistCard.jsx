import { motion } from "framer-motion";
import { Play, Pause } from "lucide-react";
import Equalizer from "./Equalizer";

export default function ArtistCard({ artist, onPlay, active, playing }) {
  return (
    <motion.article
      className={`artist-card ${active ? "is-active" : ""}`}
      onClick={() => onPlay(artist.trackId)}
      whileHover={{ y: -7 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
    >
      <div className="artist-card__art">
        <img src={artist.image} alt={artist.name} loading="lazy" />
        <span className="artist-card__ring" aria-hidden="true" />
        <button
          type="button"
          className="play-fab"
          onClick={(e) => {
            e.stopPropagation();
            onPlay(artist.trackId);
          }}
          aria-label={`Play ${artist.name}`}
        >
          {active && playing ? (
            <Pause size={17} fill="currentColor" />
          ) : (
            <Play size={17} fill="currentColor" />
          )}
        </button>
      </div>
      <h3>{artist.name}</h3>
      <p>{artist.genre}</p>
      <span className="artist-card__listeners">
        {active ? <Equalizer bars={3} animated={playing} barWidth={2} /> : null}
        {artist.listeners} plays
      </span>
    </motion.article>
  );
}
