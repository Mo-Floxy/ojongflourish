import { useMemo } from 'react'
import { useReducedMotion } from 'framer-motion'

const DOTS = [
  [6, 14, 3], [23, 32, 4], [42, 20, 3], [63, 38, 4],
  [81, 28, 3], [11, 45, 2], [78, 52, 3], [27, 8, 2],
]

export default function Atmosphere() {
  const reduceMotion = useReducedMotion()
  const dots = useMemo(() => DOTS, [])

  return (
    <div className="atmosphere" aria-hidden="true">
      <div className="atmosphere__grid" />
      <div className="atmosphere__orb atmosphere__orb--one" />
      <div className="atmosphere__orb atmosphere__orb--two" />
      <div className="atmosphere__orb atmosphere__orb--three" />
      <div className="atmosphere__beam" />
      {!reduceMotion && dots.map(([left, top, size], i) => (
        <span
          key={i}
          className="atmosphere__dot"
          style={{ left: `${left}%`, top: `${top}%`, width: size, height: size, animationDelay: `${(i * 0.37) % 4}s` }}
        />
      ))}
      <div className="atmosphere__shape atmosphere__shape--one" />
      <div className="atmosphere__shape atmosphere__shape--two" />
    </div>
  )
}
