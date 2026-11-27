import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import Button from './Button.jsx'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/workouts', label: 'Workouts' },
  { to: '/nutrition', label: 'Nutrition' },
  { to: '/wellness', label: 'Wellness' },
  { to: '/about', label: 'About' },
]

function Logo({ onClick }) {
  return (
    <Link to="/" className="brand" aria-label="PULSE home" onClick={onClick}>
      <span className="brand__mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" role="presentation">
          <path d="M2 17h6l3.2-8.5 5.2 15 3.6-9.5 2.4 3H30" />
        </svg>
      </span>
      <span className="brand__name">PULSE</span>
    </Link>
  )
}

export default function Header() {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const isHome = location.pathname === '/'
  const solid = !isHome || scrolled || menuOpen

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <header className={`site-header ${solid ? 'site-header--solid' : ''}`}>
      <div className="container-fluid site-header__inner">
        <Logo />

        <nav className="site-nav" aria-label="Primary navigation">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `site-nav__link ${isActive ? 'is-active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="site-header__actions">
          <Link to="/login" className="header-login">
            Login
          </Link>
          <Button to="/get-started" variant="lime" size="sm" icon={ArrowUpRight}>
            Get Started
          </Button>
        </div>

        <button
          type="button"
          className="menu-toggle"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="mobile-navigation"
            className="mobile-nav"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
          >
            <div className="mobile-nav__links">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) => `mobile-nav__link ${isActive ? 'is-active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
            <div className="mobile-nav__actions">
              <Button to="/login" variant="outline-light" className="w-100">
                Login
              </Button>
              <Button to="/get-started" variant="lime" className="w-100" icon={ArrowUpRight}>
                Get Started
              </Button>
            </div>
            <p className="mobile-nav__tagline">Move Better. Live Stronger.</p>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
