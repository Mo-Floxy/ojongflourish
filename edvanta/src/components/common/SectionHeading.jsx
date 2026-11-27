import { motion } from 'framer-motion';

export default function SectionHeading({ eyebrow, title, description, action, centered = false, light = false }) {
  return (
    <motion.div
      className={`section-heading${centered ? ' is-centered' : ''}${light ? ' is-light' : ''}`}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
    >
      <div className="section-heading-copy">
        <span className="section-eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action && <div className="section-heading-action">{action}</div>}
    </motion.div>
  );
}
