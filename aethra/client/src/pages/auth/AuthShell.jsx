import { ArrowLeft, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import AIOrb from '../../components/three/AIOrb';
import Brand from '../../components/Brand';

export default function AuthShell({ eyebrow, title, description, children, state = 'idle' }) {
  return (
    <div className="nx-auth">
      <div className="nx-backdrop" aria-hidden="true">
        <div className="nx-backdrop__grid" />
        <div className="nx-backdrop__orb nx-backdrop__orb--one" />
        <div className="nx-backdrop__orb nx-backdrop__orb--two" />
        <div className="nx-backdrop__stars" />
      </div>

      <div className="nx-auth__inner">
        <div className="nx-auth__form-side">
          <div className="nx-auth__top">
            <Brand />
            <Link to="/" className="nx-btn nx-btn--quiet nx-btn--sm">
              <ArrowLeft size={15} /> Back home
            </Link>
          </div>

          <div className="nx-auth__card nx-glass">
            <span className="nx-eyebrow">{eyebrow}</span>
            <h1>{title}</h1>
            <p className="nx-muted">{description}</p>
            {children}
          </div>

          <p className="nx-auth__foot">
            <Sparkles size={13} /> One universe. Endless possibilities.
          </p>
        </div>

        <div className="nx-auth__visual">
          <div className="nx-auth__visual-ring" />
          <AIOrb state={state} />
          <div className="nx-auth__visual-copy">
            <span className="nx-mono">AETHRA // SECURE LINK</span>
            <strong>Your intelligence lives here.</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
