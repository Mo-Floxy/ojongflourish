import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import CourseCard from '../common/CourseCard.jsx';
import SectionHeading from '../common/SectionHeading.jsx';
import { courses } from '../../data/homeData.js';

export default function FeaturedCourses() {
  return (
    <section className="section section-courses" id="courses">
      <div className="container">
        <SectionHeading
          eyebrow="Featured courses"
          title={<>Learn from courses built for the real world.</>}
          description="Practical, project-driven lessons designed by instructors who know what the industry actually needs."
          action={
            <Link className="text-link" to="/coming-soon/courses">
              Browse all courses <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          }
        />

        <div className="row g-4 course-grid">
          {courses.map((course) => (
            <div className="col-12 col-sm-6 col-lg-4 col-xxl-3" key={course.slug}>
              <CourseCard course={course} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
