import { ArrowUpRight, Clock, Layers3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import SectionHeading from '../common/SectionHeading.jsx';
import { learningPaths } from '../../data/homeData.js';

export default function LearningPaths() {
  return (
    <section className="section section-paths" id="paths">
      <div className="container">
        <SectionHeading
          eyebrow="Learning paths"
          title={<>A clear route from curious to capable.</>}
          description="Curated sequences of courses, challenges and projects. Follow a path step by step and watch your skills stack up."
          action={
            <Link className="text-link" to="/coming-soon/paths">
              See all paths <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          }
        />

        <div className="row g-4">
          {learningPaths.map((path, index) => (
            <div className="col-12 col-md-6 col-xl-4" key={path.title}>
              <motion.article
                className={`path-card tone-${path.tone}`}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.5, delay: (index % 3) * 0.07 }}
              >
                <div className="path-card-top">
                  <span className="path-icon">
                    <Layers3 size={22} aria-hidden="true" />
                  </span>
                  <span className="path-number">0{index + 1}</span>
                </div>
                <h3>{path.title}</h3>
                <p>{path.description}</p>
                <div className="path-skills">
                  {path.skills.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
                <div className="path-card-footer">
                  <span>
                    <Layers3 size={14} aria-hidden="true" /> {path.courses} courses
                  </span>
                  <span>
                    <Clock size={14} aria-hidden="true" /> {path.duration}
                  </span>
                  <Link to="/coming-soon/paths" aria-label={`Explore ${path.title} path`}>
                    <ArrowUpRight size={17} aria-hidden="true" />
                  </Link>
                </div>
              </motion.article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
