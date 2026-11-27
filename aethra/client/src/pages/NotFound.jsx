import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="nx-notfound">
      <span className="nx-eyebrow">Signal lost</span>
      <h1 className="nx-gradient-text">404</h1>
      <p className="nx-muted">This part of the universe hasn't been discovered yet.</p>
      <Link to="/" className="nx-btn nx-btn--primary"><ArrowLeft size={16} /> Back to AETHRA</Link>
    </main>
  );
}
