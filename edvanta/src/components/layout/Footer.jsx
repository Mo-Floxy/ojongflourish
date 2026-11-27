import { Github, Instagram, Linkedin, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';

import Brand from '../common/Brand.jsx';

const courseLinks = ['Web Development', 'Python', 'Java', 'JavaScript', 'UI/UX Design', 'Data Analytics'];
const pathLinks = ['Frontend Developer', 'Full Stack Developer', 'Python Developer', 'Data Analyst'];
const socials = [
  { label: 'GitHub', icon: Github, href: 'https://github.com' },
  { label: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com' },
  { label: 'Instagram', icon: Instagram, href: 'https://instagram.com' },
  { label: 'YouTube', icon: Youtube, href: 'https://youtube.com' },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-glow" aria-hidden="true" />
      <div className="container footer-content">
        <div className="row gy-5">
          <div className="col-12 col-lg-4">
            <Brand withTagline />
            <p className="footer-about">
              A new generation of learning powered by technology, creativity and AI. Build skills that move you
              forward, at a pace that works for you.
            </p>
            <div className="footer-socials">
              {socials.map(({ label, icon: Icon, href }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}>
                  <Icon size={17} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <div className="col-6 col-lg-2">
            <h3>Categories</h3>
            <ul className="footer-links">
              {courseLinks.map((label) => (
                <li key={label}>
                  <Link to="/#courses">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-6 col-lg-2">
            <h3>Learning paths</h3>
            <ul className="footer-links">
              {pathLinks.map((label) => (
                <li key={label}>
                  <Link to="/#paths">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-12 col-sm-6 col-lg-2">
            <h3>Company</h3>
            <ul className="footer-links">
              <li>
                <Link to="/#about">About EDVANTA</Link>
              </li>
              <li>
                <Link to="/coming-soon/contact">Contact</Link>
              </li>
              <li>
                <Link to="/coming-soon/faqs">FAQs</Link>
              </li>
            </ul>
          </div>

          <div className="col-12 col-sm-6 col-lg-2">
            <h3>Legal</h3>
            <ul className="footer-links">
              <li>
                <Link to="/coming-soon/privacy">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/coming-soon/terms">Terms of Service</Link>
              </li>
              <li>
                <Link to="/coming-soon/certificates">Certificates</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} EDVANTA. Learn Without Limits.</p>
          <p>Crafted for curious minds everywhere.</p>
        </div>
      </div>
    </footer>
  );
}
