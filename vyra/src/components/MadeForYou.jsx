import { motion } from "framer-motion";
import { Star } from "lucide-react";
import SectionHead from "./SectionHead";
import PlaylistCard from "./PlaylistCard";
import { PLAYLISTS } from "../data/music";

export default function MadeForYou({ onPlay, currentId, playing, onSeeAll }) {
  return (
    <section className="section" id="made-for-you">
      <SectionHead
        eyebrow={
          <span className="eyebrow-icon eyebrow-icon--gold">
            <Star size={19} fill="currentColor" />
          </span>
        }
        title="Made for you"
        subtitle="Personal mixes tuned to your taste, refreshed every day at midnight."
        action="See all"
        onAction={onSeeAll}
      />

      <div className="playlist-grid">
        {PLAYLISTS.map((playlist, i) => (
          <motion.div
            key={playlist.id}
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
          >
            <PlaylistCard
              playlist={playlist}
              onPlay={onPlay}
              active={currentId === playlist.trackId}
              playing={playing}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
