import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, CheckCircle2 } from 'lucide-react'
import Button from '../components/Button.jsx'
import Reveal from '../components/Reveal.jsx'
import { features, getFeature } from '../data/features.js'
import NotFound from './NotFound.jsx'

const phaseBySlug = {
  'workout-studio': 'Phase 4',
  'nutrition-tracker': 'Phase 5',
  'hydration-tracker': 'Phase 5',
  'habit-builder': 'Phase 6',
  'sleep-tracking': 'Phase 6',
  'progress-analytics': 'Phase 7',
  'ai-wellness-coach': 'Phase 8',
}

export default function FeatureDetail() {
  const { slug } = useParams()
  const feature = getFeature(slug)

  if (!feature) return <NotFound />

  const index = features.findIndex((item) => item.slug === slug)
  const next = features[(index + 1) % features.length]
  const Icon = feature.icon

  return (
    <>
      <section className="page-hero feature-hero">
        <div className="page-hero__glow" aria-hidden="true" />
        <div className="container">
          <Reveal className="page-hero__inner">
            <Link to="/#features" className="back-link">
              <ArrowLeft size={16} aria-hidden="true" /> All features
            </Link>
            <span className="eyebrow eyebrow--lime">{phaseBySlug[slug]} · Feature preview</span>
            <h1>{feature.name}</h1>
            <p>{feature.detail}</p>
            <div className="page-hero__actions">
              <Button to="/get-started" variant="lime" icon={ArrowUpRight}>
                Get Started
              </Button>
              <Link to="/about" className="text-link-light">
                See the roadmap
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="feature-detail section">
        <div className="container">
          <div className="row g-5 align-items-stretch">
            <div className="col-lg-5">
              <Reveal className={`feature-detail__art feature-detail__art--${feature.accent}`}>
                <span className="feature-detail__art-glow" aria-hidden="true" />
                <Icon size={76} strokeWidth={1.3} aria-hidden="true" />
                <span className="feature-detail__art-stat">{feature.stat}</span>
              </Reveal>
            </div>
            <div className="col-lg-7">
              <Reveal className="feature-detail__content">
                <span className="eyebrow">What it brings</span>
                <h2>{feature.tagline}</h2>
                <p>{feature.description}</p>
                <ul className="feature-detail__list">
                  {feature.highlights.map((highlight) => (
                    <li key={highlight}>
                      <CheckCircle2 size={19} aria-hidden="true" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
                <p className="feature-detail__note">
                  This is a Phase 1 preview. The interactive tools arrive in their planned roadmap
                  phase.
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="next-feature">
        <div className="container">
          <Reveal className="next-feature__inner">
            <div>
              <span className="eyebrow">Up next</span>
              <h2>{next.name}</h2>
              <p>{next.tagline}</p>
            </div>
            <Button to={`/features/${next.slug}`} variant="dark" icon={ArrowUpRight}>
              Explore next feature
            </Button>
          </Reveal>
        </div>
      </section>
    </>
  )
}
