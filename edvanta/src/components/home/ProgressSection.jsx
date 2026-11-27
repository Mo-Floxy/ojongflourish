import { motion } from 'framer-motion';
import { Award, BadgeCheck, Check, Flame, Target, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

import { weekDays, weeklyActivity } from '../../data/homeData.js';

const highlights = [
  { icon: TrendingUp, text: 'Weekly activity that shows your momentum' },
  { icon: Target, text: 'Personal goals with visible progress' },
  { icon: Award, text: 'Achievements and verified certificates' },
  { icon: Flame, text: 'Streaks that make learning a daily habit' },
];

export default function ProgressSection() {
  return (
    <section className="section section-progress">
      <div className="container progress-layout">
        <motion.div
          className="progress-visual-wrap"
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <div className="progress-visual">
            <div className="progress-visual-head">
              <div>
                <span className="section-eyebrow">LEARNING ACTIVITY</span>
                <h3>This week</h3>
              </div>
              <span className="progress-trend">
                <TrendingUp size={14} aria-hidden="true" /> 18% vs last week
              </span>
            </div>

            <div className="progress-chart" aria-hidden="true">
              {weeklyActivity.map((value, index) => (
                <div className="chart-column" key={`${weekDays[index]}-${index}`}>
                  <span className="chart-bar" style={{ height: `${value}%` }} />
                  <small>{weekDays[index]}</small>
                </div>
              ))}
            </div>

            <div className="progress-visual-foot">
              <div className="visual-stat">
                <Flame size={18} aria-hidden="true" />
                <span>
                  <strong>7 day streak</strong>
                  <small>Personal best</small>
                </span>
              </div>
              <div className="visual-stat">
                <BadgeCheck size={18} aria-hidden="true" />
                <span>
                  <strong>3 certificates</strong>
                  <small>Verified</small>
                </span>
              </div>
            </div>
          </div>

          <div className="achievement-chip achievement-chip-one">
            <span>
              <Flame size={16} aria-hidden="true" />
            </span>
            Week warrior
          </div>
          <div className="achievement-chip achievement-chip-two">
            <span>
              <Award size={16} aria-hidden="true" />
            </span>
            Course completed
          </div>
        </motion.div>

        <motion.div
          className="progress-copy"
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <span className="section-eyebrow">Your progress, beautifully clear</span>
          <h2>Every small win, right where you can see it.</h2>
          <p>
            EDVANTA turns your learning into a story you can follow. See what you have finished, what is next and
            exactly how far you have come.
          </p>
          <ul className="progress-highlights">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text}>
                <span>
                  <Icon size={16} aria-hidden="true" />
                </span>
                {text}
              </li>
            ))}
          </ul>
          <Link className="btn btn-primary" to="/coming-soon/dashboard">
            See the student dashboard <Check size={17} aria-hidden="true" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
