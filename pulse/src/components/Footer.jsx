import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Instagram, Youtube } from 'lucide-react'
import { features } from '../data/features.js'
import Button from './Button.jsx'

const socials = [
  { label: 'Instagram', href: 'https://www.instagram.com/', icon: Instagram },
  { label: 'YouTube', href: 'https://www.youtube.com/', icon: Youtube },
  { label: 'X', href: 'https://x.com/', icon: null },
]

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!email.trim()) return
    setSubscribed(true)
    setEmail('')
  }

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-newsletter">
          <div>
            <span className="eyebrow eyebrow--lime">Stay in the loop</span>
            <h2>Wellness notes, not noise.</h2>
            <p>Get thoughtful updates as PULSE grows. This demo form does not send data anywhere.</p>
          </div>
          <form className="newsletter-form" onSubmit={handleSubmit}>
            <label className="visually-hidden" htmlFor="newsletter-email">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                setSubscribed(false)
              }}
              required
            />
            <Button type="submit" variant="lime" aria-label="Join the PULSE newsletter">
              <ArrowRight size={18} aria-hidden="true" />
            </Button>
            {subscribed && (
              <p className="newsletter-form__status" role="status">
                Thanks — you are on the list for updates.
              </p>
            )}
          </form>
        </div>

        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="brand brand--footer" aria-label="PULSE home">
              <span className="brand__mark" aria-hidden="true">
                <svg viewBox="0 0 32 32" role="presentation">
                  <path d="M2 17h6l3.2-8.5 5.2 15 3.6-9.5 2.4 3H30" />
                </svg>
              </span>
              <span className="brand__name">PULSE</span>
            </Link>
            <p>Move Better. Live Stronger.</p>
            <p className="footer-brand__note">
              One calm space for movement, food, hydration, rest and progress.
            </p>
            <div className="footer-socials">
              {socials.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  title={label}
                >
                  {Icon ? <Icon size={18} aria-hidden="true" /> : 'X'}
                </a>
              ))}
            </div>
          </div>

          <div className="footer-column">
            <h3>Explore</h3>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/workouts">Workouts</Link></li>
              <li><Link to="/nutrition">Nutrition</Link></li>
              <li><Link to="/wellness">Wellness</Link></li>
              <li><Link to="/about">About PULSE</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h3>Features</h3>
            <ul>
              {features.slice(0, 5).map((feature) => (
                <li key={feature.slug}>
                  <Link to={`/features/${feature.slug}`}>{feature.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-column">
            <h3>Account</h3>
            <ul>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/get-started">Get Started</Link></li>
              <li><Link to="/features/ai-wellness-coach">AI Coach</Link></li>
              <li><Link to="/features/progress-analytics">Progress</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} PULSE. Built for better everyday rhythm.</p>
          <p>
            Photography from{' '}
            <a href="https://unsplash.com/" target="_blank" rel="noreferrer">
              Unsplash
            </a>
            . All dashboard data and testimonials shown are illustrative samples.
          </p>
        </div>
      </div>
    </footer>
  )
}
