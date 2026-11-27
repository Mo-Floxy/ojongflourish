import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CallToAction() {
  return (
    <section className="section section-cta" id="join">
      <div className="container">
        <motion.div
          className="cta-panel"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6 }}
        >
          <div className="cta-orb cta-orb-one" aria-hidden="true" />
          <div className="cta-orb cta-orb-two" aria-hidden="true" />
          <div className="cta-grid" aria-hidden="true" />
          <div className="cta-content">
            <span className="cta-eyebrow">
              <Sparkles size={15} aria-hidden="true" /> Start learning today
            </span>
            <h2>Your Future Skill Starts Here.</h2>
            <p>
              Join a platform built to help you learn faster, practice better and go further. Your next skill is one
              lesson away.
            </p>
            <Link className="btn btn-cta btn-lg" to="/coming-soon/join">
              Get Started <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
