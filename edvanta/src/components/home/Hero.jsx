import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

import HeroDashboard from './HeroDashboard.jsx';

const fadeUp = (delay) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: 'easeOut' },
});

export default function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-glow hero-glow-violet" aria-hidden="true" />
      <div className="hero-glow hero-glow-sky" aria-hidden="true" />
      <div className="hero-grid-lines" aria-hidden="true" />

      <div className="container hero-layout">
        <div className="hero-copy">
          <motion.span className="hero-eyebrow" {...fadeUp(0.05)}>
            <span className="hero-pulse" aria-hidden="true" />
            The smarter way to learn
          </motion.span>

          <motion.h1 {...fadeUp(0.12)}>
            Unlock Your Potential. <span>Learn What Matters.</span>
          </motion.h1>

          <motion.p className="hero-lead" {...fadeUp(0.2)}>
            Build real-world skills, explore interactive courses and learn smarter with your personal AI learning
            companion.
          </motion.p>

          <motion.div className="hero-actions" {...fadeUp(0.28)}>
            <Link className="btn btn-primary btn-lg" to="/#join">
              Get Started <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link className="btn btn-hero-outline btn-lg" to="/#courses">
              Explore Courses
            </Link>
          </motion.div>

          <motion.div className="hero-proof" {...fadeUp(0.36)}>
            <div className="proof-avatars" aria-hidden="true">
              <span>AR</span>
              <span>SK</span>
              <span>JM</span>
              <span>+</span>
            </div>
            <p>
              <strong>25,000+ learners</strong> are learning without limits
              <span className="proof-rating">
                <Star size={14} fill="currentColor" aria-hidden="true" /> 4.9/5
              </span>
            </p>
          </motion.div>
        </div>

        <HeroDashboard />
      </div>

      <div className="hero-bottom-fade" aria-hidden="true" />
    </section>
  );
}
