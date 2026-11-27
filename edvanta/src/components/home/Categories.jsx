import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import SectionHeading from '../common/SectionHeading.jsx';
import { categories } from '../../data/homeData.js';

export default function Categories() {
  return (
    <section className="section section-categories" id="categories">
      <div className="container">
        <SectionHeading
          eyebrow="Explore by category"
          title={<>Find your next <span className="heading-accent">obsession.</span></>}
          description="From your first line of code to advanced AI systems, there is a path for every curious mind."
          centered
        />

        <div className="category-grid">
          {categories.map(({ name, icon: Icon, courses, color }, index) => (
            <motion.div
              key={name}
              className={`category-card tone-${color}`}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: index * 0.04 }}
              whileHover={{ y: -6 }}
            >
              <span className="category-icon">
                <Icon size={24} aria-hidden="true" />
              </span>
              <h3>{name}</h3>
              <p>{courses} courses</p>
              <Link to="/#courses" aria-label={`Explore ${name} courses`}>
                <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
