import { motion } from 'framer-motion';

import SectionHeading from '../common/SectionHeading.jsx';
import { features } from '../../data/homeData.js';

export default function WhyEdvanta() {
  return (
    <section className="section section-why" id="about">
      <div className="why-glow" aria-hidden="true" />
      <div className="container why-inner">
        <SectionHeading
          eyebrow="Why EDVANTA"
          title={<>A learning experience that thinks with you.</>}
          description="Not another video library. EDVANTA combines intelligent guidance, hands-on practice and clear progress so every session moves you forward."
          centered
          light
        />

        <div className="row g-4 why-grid">
          {features.map(({ title, description, icon: Icon, tone }, index) => (
            <motion.article
              className={`why-card tone-${tone}`}
              key={title}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, delay: (index % 3) * 0.07 }}
            >
              <span className="why-icon">
                <Icon size={22} aria-hidden="true" />
              </span>
              <h3>{title}</h3>
              <p>{description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
