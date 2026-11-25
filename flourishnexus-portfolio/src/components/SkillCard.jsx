import { motion } from 'framer-motion'
import { Code2, Database, Server, Wrench } from 'lucide-react'

const ICONS = { Code2, Server, Database, Wrench }

export default function SkillCard({ group, index }) {
  const Icon = ICONS[group.icon] || Code2

  return (
    <motion.article
      className="glass-panel skill-card"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.45, delay: index * 0.07 }}
      whileHover={{ y: -5 }}
    >
      <div className="skill-card__head">
        <span className="skill-card__icon"><Icon size={21} /></span>
        <div>
          <p className="eyebrow">0{index + 1} / Category</p>
          <h3>{group.title}</h3>
        </div>
      </div>
      <ul className="skill-list">
        {group.items.map((skill) => (
          <li key={skill}>
            <span className="skill-dot" aria-hidden="true" />
            {skill}
          </li>
        ))}
      </ul>
      <span className="skill-card__line" aria-hidden="true" />
    </motion.article>
  )
}
