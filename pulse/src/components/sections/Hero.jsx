import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Flame, HeartPulse, Play, TrendingUp } from 'lucide-react'
import Button from '../Button.jsx'

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
}

export default function Hero() {
  const reduceMotion = useReducedMotion()

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__ambient hero__ambient--one" aria-hidden="true" />
      <div className="hero__ambient hero__ambient--two" aria-hidden="true" />
      <div className="hero__grid" aria-hidden="true" />

      <div className="container hero__container">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <motion.div
              className="hero__content"
              variants={containerVariants}
              initial={reduceMotion ? false : 'hidden'}
              animate={reduceMotion ? undefined : 'visible'}
            >
              <motion.div variants={itemVariants}>
                <span className="hero__badge">
                  <span className="hero__badge-dot" aria-hidden="true" />
                  Your all-in-one wellness space
                </span>
              </motion.div>

              <motion.h1 id="hero-title" className="hero__title" variants={itemVariants}>
                Your Health.
                <br />
                Your Rhythm.
                <br />
                <span>Your PULSE.</span>
              </motion.h1>

              <motion.p className="hero__text" variants={itemVariants}>
                One space to move better, eat smarter, build healthy habits, and become your
                strongest self.
              </motion.p>

              <motion.div className="hero__actions" variants={itemVariants}>
                <Button to="/get-started" variant="lime" size="lg" icon={ArrowRight}>
                  Get Started
                </Button>
                <Button to="/#features" variant="glass" size="lg" icon={Play} iconPosition="left">
                  Explore Features
                </Button>
              </motion.div>

              <motion.dl className="hero__proof" variants={itemVariants}>
                <div>
                  <dt>7</dt>
                  <dd>wellness systems</dd>
                </div>
                <div>
                  <dt>1</dt>
                  <dd>connected rhythm</dd>
                </div>
                <div>
                  <dt>100%</dt>
                  <dd>built around you</dd>
                </div>
              </motion.dl>
            </motion.div>
          </div>

          <div className="col-lg-6">
            <motion.div
              className="hero__visual"
              initial={reduceMotion ? false : { opacity: 0, x: 36, scale: 0.97 }}
              animate={reduceMotion ? undefined : { opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="hero__image-wrap">
                <img
                  src="/images/pulse-hero.jpg"
                  alt="Athlete training with focus in a bright studio"
                  className="hero__image"
                  width="1400"
                  height="933"
                />
                <div className="hero__image-shade" aria-hidden="true" />
                <div className="hero__image-caption">
                  <span>STRONGER, EVERY DAY</span>
                  <span className="hero__image-line" aria-hidden="true" />
                </div>
              </div>

              <motion.div
                className="float-card float-card--activity"
                animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="float-card__icon float-card__icon--lime" aria-hidden="true">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <span className="float-card__label">Weekly activity</span>
                  <strong>+24%</strong>
                </div>
              </motion.div>

              <motion.div
                className="float-card float-card--streak"
                animate={reduceMotion ? undefined : { y: [0, 9, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
              >
                <div className="float-card__icon float-card__icon--amber" aria-hidden="true">
                  <Flame size={18} />
                </div>
                <div>
                  <span className="float-card__label">Current streak</span>
                  <strong>12 days</strong>
                </div>
              </motion.div>

              <motion.div
                className="float-card float-card--recovery"
                animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
                transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
              >
                <HeartPulse size={18} aria-hidden="true" />
                <div className="float-card__recovery-text">
                  <span>Recovery</span>
                  <strong>Balanced</strong>
                </div>
                <span className="float-card__pulse" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="hero__scroll-cue" aria-hidden="true">
        <span>Scroll to discover</span>
        <i />
      </div>
    </section>
  )
}
