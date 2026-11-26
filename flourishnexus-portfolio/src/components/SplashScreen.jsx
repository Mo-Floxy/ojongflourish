import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import mascot from '../assets/images/splash-mascot.webp'

const PARTICLES = [
  [8, 18, 3, 0], [18, 72, 2, 1.2], [27, 30, 4, 0.6], [38, 84, 2, 1.8],
  [47, 12, 3, 0.3], [58, 68, 2, 1.5], [67, 26, 4, 0.9], [76, 78, 2, 0.2],
  [86, 38, 3, 1.7], [93, 62, 2, 0.8], [12, 48, 2, 2.1], [31, 58, 3, 1.1],
  [64, 46, 2, 0.4], [89, 18, 3, 1.9],
]

export default function SplashScreen({ onComplete }) {
  const reduceMotion = useReducedMotion()
  const [leaving, setLeaving] = useState(false)

  const duration = reduceMotion ? 450 : 1400

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLeaving(true)
      window.setTimeout(onComplete, reduceMotion ? 90 : 220)
    }, duration)
    return () => window.clearTimeout(timer)
  }, [duration, onComplete, reduceMotion])

  const skip = () => {
    setLeaving(true)
    window.setTimeout(onComplete, reduceMotion ? 60 : 140)
  }

  const particles = useMemo(() => PARTICLES, [])

  return (
    <motion.div
      className={`splash ${leaving ? 'splash--leaving' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0.15 : 0.45 }}
      role="status"
      aria-label="FlourishNexus is loading"
    >
      <div className="splash__grid" aria-hidden="true" />
      <div className="splash__aurora" aria-hidden="true" />

      {particles.map(([left, top, size, delay], i) => (
        <span
          key={i}
          className="splash__particle"
          style={{ left: `${left}%`, top: `${top}%`, width: size, height: size, animationDelay: `${delay}s` }}
          aria-hidden="true"
        />
      ))}

      <div className="splash__rings" aria-hidden="true">
        <span className="splash__ring splash__ring--one" />
        <span className="splash__ring splash__ring--two" />
        <span className="splash__ring splash__ring--three" />
      </div>

      <motion.div
        className="splash__stage"
        initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reduceMotion ? 0.12 : 0.42, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="splash__glow" aria-hidden="true" />
        <img
          src={mascot}
          alt="Official FlourishNexus mascot with glowing blue hair, FN emblem, brand name and tagline"
          className="splash__mascot"
          draggable="false"
        />
        <span className="splash__scan" aria-hidden="true" />
      </motion.div>

      <motion.div
        className="splash__brand"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduceMotion ? 0.05 : 0.3, duration: reduceMotion ? 0.12 : 0.3 }}
      >
        <p className="splash__name">FlourishNexus</p>
        <p className="splash__tagline">Dream. Code. Innovate.</p>
      </motion.div>

      <div className="splash__loader" aria-hidden="true">
        <span className="splash__loader-fill" style={{ animationDuration: `${duration}ms` }} />
      </div>

      <button type="button" className="splash__skip" onClick={skip}>
        Skip Intro
      </button>
    </motion.div>
  )
}
