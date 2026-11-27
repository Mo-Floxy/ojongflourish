import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import Brand from '../common/Brand.jsx';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Explore Courses', to: '/#courses' },
  { label: 'Learning Paths', to: '/#paths' },
  { label: 'Challenges', to: '/coming-soon/challenges' },
  { label: 'About', to: '/#about' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/' && !location.hash;
    if (to.startsWith('/#')) return location.pathname === '/' && location.hash === to.slice(1);
    return location.pathname === to;
  };

  return (
    <header className={`site-navbar${isScrolled || isOpen ? ' is-scrolled' : ''}`}>
      <div className="container nav-inner">
        <Brand />

        <nav className="desktop-nav" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <Link key={link.label} to={link.to} className={`nav-link${isActive(link.to) ? ' is-active' : ''}`}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="nav-actions">
          <Link to="/coming-soon/account" className="nav-login">
            Login
          </Link>
          <Link to="/#join" className="btn btn-primary nav-cta">
            Get Started <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <button
          className="nav-toggle"
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.nav
            id="mobile-navigation"
            className="mobile-nav"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className="container mobile-nav-inner">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className={`mobile-nav-link${isActive(link.to) ? ' is-active' : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mobile-nav-actions">
                <Link to="/coming-soon/account" className="btn btn-outline-dark" onClick={() => setIsOpen(false)}>
                  Login
                </Link>
                <Link to="/#join" className="btn btn-primary" onClick={() => setIsOpen(false)}>
                  Get Started <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
