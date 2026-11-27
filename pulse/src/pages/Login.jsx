import { ArrowLeft, ArrowUpRight, Database, LockKeyhole, ShieldCheck } from 'lucide-react'
import Button from '../components/Button.jsx'
import Reveal from '../components/Reveal.jsx'

const coming = [
  {
    icon: LockKeyhole,
    title: 'Secure accounts',
    text: 'Registration and login with protected routes, planned for Phase 2.',
  },
  {
    icon: Database,
    title: 'Your personal data',
    text: 'A MySQL database will store profiles and progress safely in later phases.',
  },
  {
    icon: ShieldCheck,
    title: 'Private by design',
    text: 'Your dashboard and history will only be available to you.',
  },
]

export default function Login() {
  return (
    <>
      <section className="page-hero page-hero--compact">
        <div className="page-hero__glow" aria-hidden="true" />
        <div className="container">
          <Reveal className="page-hero__inner">
            <span className="eyebrow eyebrow--lime">Account access · Phase 2</span>
            <h1>Your account is on the way.</h1>
            <p>
              Authentication is intentionally not part of Phase 1. This preview keeps the homepage
              focused on foundation, brand and experience.
            </p>
            <div className="page-hero__actions">
              <Button to="/get-started" variant="lime" icon={ArrowUpRight}>
                Get Started
              </Button>
              <Button to="/" variant="outline-light" icon={ArrowLeft} iconPosition="left">
                Back to home
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="login-info section">
        <div className="container">
          <Reveal>
            <span className="eyebrow">Coming in Phase 2</span>
            <h2 className="login-info__title">Built for a private, personal experience.</h2>
          </Reveal>
          <div className="row g-4 mt-1">
            {coming.map((item, index) => (
              <div className="col-md-4" key={item.title}>
                <Reveal className="login-info__card" delay={index * 0.1}>
                  <span aria-hidden="true"><item.icon size={24} /></span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
