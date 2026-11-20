import { motion } from "framer-motion";
import { Play, Compass, Sparkles, Radio, AudioWaveform } from "lucide-react";
import FloatingNotes from "./FloatingNotes";
import Equalizer from "./Equalizer";

const stage = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};

const rise = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const line = {
  hidden: { y: "110%" },
  show: { y: "0%", transition: { duration: 0.9, ease: [0.19, 1, 0.22, 1] } },
};

export default function Hero({ onStart, onExplore, nowPlaying }) {
  return (
    <section className="hero" id="top">
      <div className="hero__aurora" aria-hidden="true" />
      <div className="hero__grain" aria-hidden="true" />
      <FloatingNotes />

      <div className="hero__content">
        <motion.div variants={stage} initial="hidden" animate="show">
          <motion.div variants={rise} className="chip">
            <span className="chip__dot" />
            <AudioWaveform size={14} className="chip__icon" />
            <strong className="chip__vyra">VYRA</strong>
            <span className="chip__divider">·</span>
            <span className="chip__tagline">Your Music. Your Vibe.</span>
          </motion.div>

          <h1 className="hero__title">
            <span className="hero__line-mask">
              <motion.span variants={line} className="hero__line">
                Feel the Music.
              </motion.span>
            </span>
            <span className="hero__line-mask">
              <motion.span variants={line} className="hero__line hero__line--grad">
                Live the Moment.
              </motion.span>
            </span>
          </h1>

          <motion.p variants={rise} className="hero__copy">
            Stream your favourite songs, discover new vibes, and enjoy music like never before.
          </motion.p>

          <motion.div variants={rise} className="hero__actions">
            <button type="button" className="btn-vyra" onClick={onStart}>
              <span className="btn-vyra__icon">
                <Play size={15} fill="currentColor" />
              </span>
              Start Listening
              <span className="btn-vyra__shine" aria-hidden="true" />
            </button>
            <button type="button" className="btn-ghost" onClick={onExplore}>
              <Compass size={17} />
              Explore More
            </button>
          </motion.div>

          <motion.ul variants={rise} className="hero__stats">
            <li>
              <strong>12.4M</strong>
              <span>tracks</span>
            </li>
            <li>
              <Sparkles size={16} />
              <span>Lossless audio</span>
            </li>
            <li>
              <Radio size={16} />
              <span>190 countries</span>
            </li>
          </motion.ul>
        </motion.div>
      </div>

      <motion.div
        className="hero__visual"
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      >
        <span className="hero__ring" aria-hidden="true" />
        <span className="hero__ring hero__ring--2" aria-hidden="true" />
        <img
          src="/images/hero.jpg"
          alt="Woman with braided hair smiling joyfully with glowing neon headphones and halo ring"
        />
        <div className="hero__fade" aria-hidden="true" />

        {/* Floating "Good Vibes Only" glass widget matching the reference */}
        <motion.div
          className="hero__vibe-card"
          initial={{ opacity: 0, x: 20, y: -10 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ delay: 0.8, duration: 0.7, ease: "easeOut" }}
        >
          <div className="hero__vibe-top">
            <AudioWaveform size={17} className="hero__vibe-icon" />
            <span className="hero__vibe-title">Good Vibes Only</span>
          </div>
          <div className="hero__vibe-wave" aria-hidden="true">
            <Equalizer bars={26} animated barWidth={3} className="eq--cyan" />
          </div>
        </motion.div>

        {/* Live track preview badge at bottom right */}
        <motion.div
          className="now-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.7, ease: "easeOut" }}
        >
          <div className="now-card__top">
            <span className="now-card__live">
              <span className="chip__dot chip__dot--sm" /> On air
            </span>
            <Equalizer bars={3} animated barWidth={2} className="eq--accent" />
          </div>
          <div className="now-card__body">
            <img src={nowPlaying.cover} alt="" />
            <div>
              <p className="now-card__title">{nowPlaying.title}</p>
              <p className="now-card__artist">{nowPlaying.artist}</p>
            </div>
          </div>
          <div className="now-card__wave" aria-hidden="true">
            <Equalizer bars={20} animated variant={1} />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
