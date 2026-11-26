import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Github, Home, Mail, UserRound, Layers3, FolderGit2, X } from 'lucide-react'
import logo from '../assets/logo/fn-logo.webp'
import { NAV_LINKS, SOCIALS } from '../data'
import { SoundToggle, useSound } from './SoundController'

const BOTTOM = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/about', label: 'About', icon: UserRound },
  { to: '/skills', label: 'Skills', icon: Layers3 },
  { to: '/projects', label: 'Projects', icon: FolderGit2 },
  { to: '/contact', label: 'Contact', icon: Mail },
]

export default function MobileNavigation({ open, onClose, onNavigate }) {
  const { play } = useSound()

  useEffect(() => {
    const close = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [onClose])

  const handle = () => {
    play('click')
    onNavigate()
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-navigation"
            className="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <div className="mobile-menu__head">
              <img src={logo} alt="FlourishNexus FN logo" className="mobile-menu__logo" />
              <button type="button" className="icon-button" onClick={onClose} aria-label="Close navigation">
                <X size={22} />
              </button>
            </div>

            <nav className="mobile-menu__links" aria-label="Mobile navigation">
              {NAV_LINKS.map((link, index) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <NavLink
                    to={link.to}
                    end={link.to === '/'}
                    onClick={handle}
                    className={({ isActive }) => `mobile-menu__link ${isActive ? 'is-active' : ''}`}
                  >
                    <span className="mobile-menu__index">0{index + 1}</span>
                    {link.label}
                    <ArrowUpRight size={16} />
                  </NavLink>
                </motion.div>
              ))}
            </nav>

            <div className="mobile-menu__footer">
              <SoundToggle />
              <a href={SOCIALS.github} target="_blank" rel="noopener noreferrer" className="glass-chip" onClick={() => play('click')}>
                <Github size={15} /> GitHub
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="bottom-nav" aria-label="Quick navigation">
        {BOTTOM.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={() => play('click')}
            className={({ isActive }) => `bottom-nav__item ${isActive ? 'is-active' : ''}`}
          >
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}
