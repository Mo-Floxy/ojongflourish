import { ArrowLeft, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

import Brand from '../components/common/Brand.jsx';

export default function NotFound() {
  return (
    <div className="placeholder-page">
      <div className="placeholder-top">
        <Brand />
      </div>
      <main className="placeholder-card">
        <span className="placeholder-icon">
          <Compass size={26} aria-hidden="true" />
        </span>
        <span className="section-eyebrow">404</span>
        <h1>This path has not been charted yet.</h1>
        <p>The page you are looking for does not exist. Let us get you back to something worth learning.</p>
        <Link className="btn btn-primary" to="/">
          <ArrowLeft size={17} aria-hidden="true" /> Back to homepage
        </Link>
      </main>
    </div>
  );
}
