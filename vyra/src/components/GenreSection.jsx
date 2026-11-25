import { motion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import SectionHead from "./SectionHead";
import { GENRES, genreLabel } from "../data/music";

export default function GenreSection({ activeGenre, onSelect, onSeeAll, counts = {} }) {
  return (
    <section className="section" id="genres">
      <SectionHead
        title="Browse by genre"
        subtitle={`${GENRES.length} worlds of sound, with 50+ real popular tracks in every genre.`}
        action="See all"
        onAction={onSeeAll}
      >
        {activeGenre && (
          <button type="button" className="filter-chip" onClick={() => onSelect(null)}>
            <span className="filter-chip__dot" />
            {genreLabel(activeGenre)}
            <X size={13} />
          </button>
        )}
      </SectionHead>

      <div className="genre-grid">
        {GENRES.map((g, i) => {
          const isActive = activeGenre === g.id;
          return (
            <motion.button
              key={g.id}
              type="button"
              className={`genre-card ${isActive ? "is-active" : ""}`}
              style={{ "--accent": g.accent }}
              onClick={() => onSelect(isActive ? null : g.id)}
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              aria-pressed={isActive}
            >
              <img src={g.image} alt="" loading="lazy" />
              <span className="genre-card__scrim" />
              <span className="genre-card__glow" />
              <span className="genre-card__name">{g.name}</span>
              <span className="genre-card__count">
                {counts[g.id]?.length ? `${counts[g.id].length} popular tracks` : g.count}
              </span>
              <span className="genre-card__icon">
                <ArrowUpRight size={16} />
              </span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
