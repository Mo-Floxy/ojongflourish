import { ArrowLeft, Sparkles } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import Brand from '../components/common/Brand.jsx';
import { courses } from '../data/homeData.js';

const descriptions = {
  challenges: 'Coding challenges, leaderboards and safe code evaluation are planned for Phase 7.',
  account: 'Registration, login and protected student areas are planned for Phase 5.',
  courses: 'Search, filters and dedicated course pages are planned for Phase 2.',
  paths: 'Full learning path pages and enrollment are planned for Phase 8.',
  dashboard: 'The student dashboard is the centerpiece of Phase 3.',
  join: 'Account creation opens with the authentication phase.',
};

const prettify = (value = '') => value.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

export default function ComingSoon() {
  const { feature, slug } = useParams();
  const course = courses.find((item) => item.slug === slug);
  const title = course?.title ?? prettify(feature ?? 'This page');
  const description =
    (course && 'The full course experience is planned for Phase 2.') ?? descriptions[feature] ?? 'This experience is coming soon.';

  return (
    <div className="placeholder-page">
      <div className="placeholder-glow" aria-hidden="true" />
      <div className="placeholder-top">
        <Brand />
      </div>
      <main className="placeholder-card">
        <span className="placeholder-icon">
          <Sparkles size={26} aria-hidden="true" />
        </span>
        <span className="section-eyebrow">Phase 1 preview</span>
        <h1>{title}</h1>
        <p>{description}</p>
        <p className="placeholder-note">
          EDVANTA is being built in phases. The homepage is live; deeper experiences arrive as each phase is completed.
        </p>
        <Link className="btn btn-primary" to="/">
          <ArrowLeft size={17} aria-hidden="true" /> Back to homepage
        </Link>
      </main>
    </div>
  );
}
