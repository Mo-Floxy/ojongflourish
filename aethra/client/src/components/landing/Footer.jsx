import { ArrowUpRight, Github, Linkedin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import Brand from '../Brand';

const groups = [
  {
    title: 'Product',
    links: [
      { label: 'AI Chat', to: '/#features' },
      { label: 'Image Studio', to: '/#explore' },
      { label: 'Voice Assistant', to: '/#explore' },
      { label: 'My Creations', to: '/#explore' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/#about' },
      { label: 'How it works', to: '/#how-it-works' },
      { label: 'FAQ', to: '/#faq' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="nx-footer">
      <div className="nx-container">
        <div className="nx-footer__top">
          <div className="nx-footer__brand">
            <Brand />
            <p>One universe. Endless possibilities.</p>
            <div className="nx-footer__socials">
              <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={17} /></a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={17} /></a>
              <a href="mailto:hello@aethra.app" aria-label="Email"><Mail size={17} /></a>
            </div>
          </div>

          {groups.map((group) => (
            <div key={group.title} className="nx-footer__group">
              <h4>{group.title}</h4>
              {group.links.map((link) => (
                <Link key={link.label} to={link.to}>{link.label}</Link>
              ))}
            </div>
          ))}

          <div className="nx-footer__cta">
            <h4>Ready to go beyond?</h4>
            <p>Step into your personal AI universe.</p>
            <Link to="/register" className="nx-btn nx-btn--primary nx-btn--sm">
              Start creating <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>

        <div className="nx-footer__bottom">
          <span>© {new Date().getFullYear()} AETHRA. Built for the curious.</span>
          <span className="nx-mono">Your Intelligence. Without Limits.</span>
        </div>
      </div>
    </footer>
  );
}
