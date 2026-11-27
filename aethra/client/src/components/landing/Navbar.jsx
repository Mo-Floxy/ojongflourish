import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Brand from '../Brand';

const LINKS = [
  { label: 'Home', href: '/#home' },
  { label: 'Features', href: '/#features' },
  { label: 'Explore', href: '/#explore' },
  { label: 'About', href: '/#about' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header className={`nx-nav ${scrolled ? 'nx-nav--scrolled' : ''}`}>
      <div className="nx-container nx-nav__inner">
        <Brand />

        <nav className="nx-nav__links" aria-label="Main navigation">
          {LINKS.map((link) => (
            <a key={link.label} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="nx-nav__actions">
          <Link to="/login" className="nx-btn nx-btn--quiet nx-nav__signin">
            Sign In
          </Link>
          <Link to="/register" className="nx-btn nx-btn--primary nx-btn--sm">
            Get Started <ArrowUpRight size={15} />
          </Link>
          <button
            className="nx-btn nx-btn--icon nx-nav__toggle"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="nx-nav__mobile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="nx-container nx-nav__mobile-inner">
              {LINKS.map((link) => (
                <a key={link.label} href={link.href} onClick={() => setOpen(false)}>
                  {link.label}
                </a>
              ))}
              <div className="nx-nav__mobile-actions">
                <Link to="/login" className="nx-btn nx-btn--ghost nx-btn--sm" onClick={() => setOpen(false)}>
                  Sign In
                </Link>
                <Link to="/register" className="nx-btn nx-btn--primary nx-btn--sm" onClick={() => setOpen(false)}>
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
