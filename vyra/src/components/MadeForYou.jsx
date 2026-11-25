import { motion } from "framer-motion";
import { Star } from "lucide-react";
import SectionHead from "./SectionHead";
import PlaylistCard from "./PlaylistCard";
import { PLAYLISTS } from "../data/music";

const formattedDate = (dateKey) => {
  if (!dateKey) return "";
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) return dateKey;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(
    new Date(year, month - 1, day)
  );
};

export default function MadeForYou({
  onPlay,
  onPlayPlaylist,
  currentId,
  playing,
  onSeeAll,
  dailyMixes = [],
}) {
  const mixes = dailyMixes.length
    ? dailyMixes
    : PLAYLISTS.map((playlist) => ({ ...playlist, tracks: [] }));
  const date = formattedDate(dailyMixes[0]?.dateKey);

  return (
    <section className="section" id="made-for-you">
      <SectionHead
        eyebrow={
          <span className="eyebrow-icon eyebrow-icon--gold">
            <Star size={19} fill="currentColor" />
          </span>
        }
        title="Made for you"
        subtitle={
          date
            ? `Your Daily Mixes for ${date} — refreshed from your likes and listening history.`
            : "Personal mixes tuned to your taste, refreshed every day."
        }
        action="See all"
        onAction={onSeeAll}
      />

      <div className="playlist-grid">
        {mixes.map((playlist, i) => (
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
              onPlayPlaylist={playlist.tracks?.length ? onPlayPlaylist : undefined}
              active={currentId === playlist.trackId}
              playing={playing}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
