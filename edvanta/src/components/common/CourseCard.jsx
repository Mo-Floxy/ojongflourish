import { ArrowUpRight, BookOpen, Clock, Star, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

function handleImageError(event) {
  const image = event.currentTarget;
  if (!image.dataset.fallbackApplied) {
    image.dataset.fallbackApplied = 'true';
    image.src = image.dataset.fallback || '';
  }
}

export default function CourseCard({ course }) {
  return (
    <motion.article
      className={`course-card tone-${course.tone}`}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="course-cover">
        <img
          src={course.image}
          data-fallback={course.cover}
          onError={handleImageError}
          alt={`${course.title} cover artwork`}
          loading="lazy"
        />
        <div className="course-cover-shade" aria-hidden="true" />
        {course.tag && <span className="course-tag">{course.tag}</span>}
        <span className="course-category-pill">{course.category}</span>
      </div>

      <div className="course-body">
        <span className="course-level">
          <i aria-hidden="true" /> {course.level}
        </span>
        <h3>{course.title}</h3>
        <div className="course-instructor">
          <span className="instructor-avatar" aria-hidden="true">
            {course.initials}
          </span>
          <span>
            By <strong>{course.instructor}</strong>
          </span>
        </div>

        <div className="course-meta" aria-label="Course details">
          <span>
            <Clock size={14} aria-hidden="true" /> {course.duration}
          </span>
          <span>
            <BookOpen size={14} aria-hidden="true" /> {course.lessons} lessons
          </span>
          <span>
            <Star size={14} aria-hidden="true" /> {course.rating}
          </span>
          <span>
            <Users size={14} aria-hidden="true" /> {course.learners}
          </span>
        </div>

        <Link className="course-link" to={`/course/${course.slug}`}>
          View Course <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </motion.article>
  );
}
