import { motion, useReducedMotion } from 'framer-motion'

export default function Reveal({ children, delay = 0, className = '', as = 'div' }) {
  const reduceMotion = useReducedMotion()
  const Component = motion[as] || motion.div

  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: reduceMotion ? 0 : 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: reduceMotion ? 0.15 : 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Component>
  )
}
