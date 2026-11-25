import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import logo from '../assets/logo/fn-logo.jpeg'
import { NAV_LINKS } from '../data'
import { SoundToggle, useSound } from './SoundController'
import MobileNavigation from './MobileNavigation'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { play } = useSound()

  useEffect(() => setOpen(false), [location.pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('menu-open', open)
    return () => document.body.classList.remove('menu-open')
  }, [open])

  const handleNav = (sound = 'nav') => {
    play(sound)
    setOpen(false)
  }

  const goContact = () => {
    play('nav')
    navigate('/contact')
  }

  return (
    <>
      <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="nav-shell">
          <NavLink to="/" className="brand" onClick={() => handleNav('click')} aria-label="FlourishNexus home">
            <img src={logo} alt="FlourishNexus FN logo" className="brand__logo" />
            <span className="brand__text">Flourish<b>Nexus</b></span>
          </NavLink>

          <nav className="desktop-nav" aria-label="Primary navigation">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => handleNav('nav')}
                className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="nav-actions">
            <SoundToggle className="sound-toggle--nav" />
            <button type="button" className="btn btn--glow nav-cta" onClick={goContact}>
              Let&apos;s Talk <ArrowUpRight size={15} />
            </button>
            <button
              type="button"
              className="menu-button"
              onClick={() => {
                play('menu')
                setOpen((v) => !v)
              }}
              aria-expanded={open}
              aria-controls="mobile-navigation"
              aria-label={open ? 'Close navigation' : 'Open navigation'}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      <MobileNavigation open={open} onClose={() => setOpen(false)} onNavigate={handleNav} />
    </>
  )
}
