import { Link } from 'react-router-dom'
import { ArrowUpRight, Github, Linkedin, Mail } from 'lucide-react'
import logo from '../assets/logo/fn-logo.jpeg'
import { NAV_LINKS, SOCIALS } from '../data'
import { useSound } from './SoundController'

export default function Footer() {
  const { play } = useSound()
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="footer-glow" aria-hidden="true" />
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link to="/" className="brand" onClick={() => play('click')} aria-label="FlourishNexus home">
            <img src={logo} alt="FlourishNexus FN logo" className="brand__logo" />
            <span className="brand__text">Flourish<b>Nexus</b></span>
          </Link>
          <p>Creative developer. Problem solver. Always learning, always building.</p>
          <p className="footer-tagline">Dream. Code. Innovate.</p>
        </div>

        <div className="footer-column">
          <h3>Explore</h3>
          {NAV_LINKS.map((link) => (
            <Link key={link.to} to={link.to} onClick={() => play('click')}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="footer-column">
          <h3>Connect</h3>
          <a href={`mailto:${SOCIALS.email}`} onClick={() => play('click')}>
            <Mail size={14} /> {SOCIALS.email}
          </a>
          <a href={SOCIALS.github} target="_blank" rel="noopener noreferrer" onClick={() => play('click')}>
            <Github size={14} /> GitHub
          </a>
          {SOCIALS.linkedin && (
            <a href={SOCIALS.linkedin} target="_blank" rel="noopener noreferrer" onClick={() => play('click')}>
              <Linkedin size={14} /> LinkedIn
            </a>
          )}
          <a href={SOCIALS.portfolio} target="_blank" rel="noopener noreferrer" onClick={() => play('click')}>
            <ArrowUpRight size={14} /> Live portfolio
          </a>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© {year} FlourishNexus. Built with intention.</span>
        <span className="footer-status"><i /> Systems online</span>
      </div>
    </footer>
  )
}
