import { ArrowUpRight, HeartHandshake, Leaf, MoveUpRight, Sparkles } from 'lucide-react'
import Button from '../components/Button.jsx'
import Reveal from '../components/Reveal.jsx'

const beliefs = [
  {
    icon: Leaf,
    title: 'Progress over perfection',
    text: 'Wellness should meet you where you are. Every small, repeatable action counts.',
  },
  {
    icon: HeartHandshake,
    title: 'Clarity over noise',
    text: 'Your data should help you make decisions, not make you feel overwhelmed.',
  },
  {
    icon: Sparkles,
    title: 'Human over hype',
    text: 'A premium experience that feels calm, considered and genuinely useful.',
  },
]

const phases = [
  ['01', 'Foundation & Homepage'],
  ['02', 'Authentication & Database'],
  ['03', 'Personal Dashboard'],
  ['04', 'Workout Studio'],
  ['05', 'Nutrition & Hydration'],
  ['06', 'Habits & Sleep'],
  ['07', 'Progress Analytics'],
  ['08', 'AI Wellness Coach'],
  ['09', 'Challenges & Achievements'],
  ['10', 'Testing & Deployment'],
]

export default function About() {
  return (
    <>
      <section className="page-hero page-hero--about">
        <div className="page-hero__glow" aria-hidden="true" />
        <div className="container">
          <Reveal className="page-hero__inner">
            <span className="eyebrow eyebrow--lime">About PULSE</span>
            <h1>Move Better. Live Stronger.</h1>
            <p>
              PULSE is a premium wellness platform built around one simple idea: your health should
              feel like your own rhythm, not someone else&apos;s rulebook.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="about-story section">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <Reveal className="about-story__image">
                <img
                  src="/images/movement.jpg"
                  alt="Person moving mindfully in a bright studio"
                  width="1400"
                  height="933"
                  loading="lazy"
                />
              </Reveal>
            </div>
            <div className="col-lg-6">
              <Reveal>
                <span className="eyebrow">Our thinking</span>
                <h2 className="about-story__title">
                  One place for the whole picture.
                </h2>
                <p className="about-story__lead">
                  Most wellness apps focus on one piece of the puzzle. PULSE connects movement,
                  nutrition, hydration, sleep, habits and progress into a single experience that
                  respects your time and your life.
                </p>
                <p>
                  The result is not more tracking for its own sake. It is a clearer sense of what
                  helps you feel strong, focused and consistent — and a simple way to keep doing it.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="beliefs section">
        <div className="container">
          <Reveal>
            <span className="eyebrow">What we believe</span>
            <h2 className="beliefs__title">Built on three simple ideas.</h2>
          </Reveal>
          <div className="row g-4 mt-1">
            {beliefs.map((belief, index) => (
              <div className="col-md-4" key={belief.title}>
                <Reveal className="belief-card" delay={index * 0.1}>
                  <span className="belief-card__icon" aria-hidden="true">
                    <belief.icon size={24} strokeWidth={1.8} />
                  </span>
                  <h3>{belief.title}</h3>
                  <p>{belief.text}</p>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="roadmap section">
        <div className="container">
          <Reveal>
            <span className="eyebrow eyebrow--lime">The roadmap</span>
            <h2 className="roadmap__title">A clear path, phase by phase.</h2>
            <p className="roadmap__intro">
              Phase 1 is complete in this build. Everything that follows is planned as a focused,
              connected release.
            </p>
          </Reveal>
          <div className="roadmap__grid">
            {phases.map(([number, label], index) => (
              <Reveal key={number} delay={(index % 5) * 0.06}>
                <div className={`roadmap-item ${index === 0 ? 'is-current' : ''}`}>
                  <span>{number}</span>
                  <strong>{label}</strong>
                  {index === 0 && <em>Current phase</em>}
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="roadmap__cta" delay={0.2}>
            <Button to="/get-started" variant="lime" icon={ArrowUpRight}>
              Start Your Journey
            </Button>
            <span>
              <MoveUpRight size={14} aria-hidden="true" /> Phase 1 foundation is ready to explore.
            </span>
          </Reveal>
        </div>
      </section>
    </>
  )
}
