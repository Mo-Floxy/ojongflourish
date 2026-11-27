import { motion } from 'framer-motion';
import { Award, BookOpen, Flame, Sparkles, TrendingUp } from 'lucide-react';

import { weekDays, weeklyActivity } from '../../data/homeData.js';

const floatMotion = (delay) => ({
  animate: { y: [0, -9, 0] },
  transition: { duration: 5.5, delay, repeat: Infinity, ease: 'easeInOut' },
});

export default function HeroDashboard() {
  return (
    <div className="hero-visual" aria-label="Preview of the EDVANTA learning dashboard">
      <div className="hero-orbit hero-orbit-one" aria-hidden="true" />
      <div className="hero-orbit hero-orbit-two" aria-hidden="true" />

      <motion.div
        className="dashboard-preview"
        initial={{ opacity: 0, y: 34, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.12, ease: 'easeOut' }}
      >
        <div className="preview-topbar">
          <div>
            <span className="preview-eyebrow">YOUR LEARNING</span>
            <h3>Good morning, Alex</h3>
          </div>
          <span className="preview-avatar" aria-hidden="true">
            AK
          </span>
        </div>

        <div className="preview-stats">
          <div className="preview-stat">
            <span className="preview-stat-icon is-violet">
              <BookOpen size={17} aria-hidden="true" />
            </span>
            <span>
              <strong>6</strong>
              <small>Active courses</small>
            </span>
          </div>
          <div className="preview-stat">
            <span className="preview-stat-icon is-orange">
              <Flame size={17} aria-hidden="true" />
            </span>
            <span>
              <strong>7 days</strong>
              <small>Current streak</small>
            </span>
          </div>
        </div>

        <div className="preview-main">
          <div className="progress-ring" aria-label="72 percent course progress">
            <svg viewBox="0 0 140 140" aria-hidden="true">
              <defs>
                <linearGradient id="ring-gradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#7047EB" />
                  <stop offset="1" stopColor="#35B8E8" />
                </linearGradient>
              </defs>
              <circle cx="70" cy="70" r="56" className="ring-track" />
              <circle cx="70" cy="70" r="56" className="ring-value" />
            </svg>
            <div className="progress-ring-label">
              <strong>72%</strong>
              <small>Progress</small>
            </div>
          </div>

          <div className="preview-current">
            <span className="preview-label">CONTINUE LEARNING</span>
            <h4>Modern JavaScript</h4>
            <p>Lesson 14 · Async JavaScript</p>
            <div className="mini-progress" aria-hidden="true">
              <span style={{ width: '72%' }} />
            </div>
            <div className="preview-button">
              Continue lesson <span aria-hidden="true">→</span>
            </div>
          </div>
        </div>

        <div className="preview-week">
          <div className="preview-week-head">
            <span>Weekly activity</span>
            <span className="preview-trend">
              <TrendingUp size={13} aria-hidden="true" /> +18%
            </span>
          </div>
          <div className="activity-bars" aria-hidden="true">
            {weeklyActivity.map((height, index) => (
              <div className="activity-bar" key={`${weekDays[index]}-${index}`}>
                <span style={{ height: `${height}%` }} />
                <small>{weekDays[index]}</small>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div className="float-card float-ai" {...floatMotion(0.2)}>
        <span className="ai-orb">
          <Sparkles size={18} aria-hidden="true" />
        </span>
        <span className="float-copy">
          <strong>EDVANTA AI</strong>
          <small>Ask me about this lesson</small>
        </span>
        <span className="live-dot" aria-hidden="true" />
      </motion.div>

      <motion.div className="float-card float-streak" {...floatMotion(0.9)}>
        <span className="float-icon is-orange">
          <Flame size={18} aria-hidden="true" />
        </span>
        <span className="float-copy">
          <strong>7-day streak</strong>
          <small>Keep the momentum</small>
        </span>
      </motion.div>

      <motion.div className="float-card float-certificate" {...floatMotion(1.5)}>
        <span className="float-icon is-green">
          <Award size={18} aria-hidden="true" />
        </span>
        <span className="float-copy">
          <strong>Certificate earned</strong>
          <small>Python Foundations</small>
        </span>
      </motion.div>
    </div>
  );
}
