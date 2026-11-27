import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { features } from '../../data/features.js'
import Reveal from '../Reveal.jsx'
import SectionHeading from '../SectionHeading.jsx'

function FeatureMini({ slug }) {
  switch (slug) {
    case 'workout-studio':
      return (
        <div className="mini mini--bars" aria-hidden="true">
          <i style={{ height: '38%' }} />
          <i style={{ height: '68%' }} />
          <i style={{ height: '50%' }} />
          <i style={{ height: '88%' }} />
          <i style={{ height: '62%' }} />
        </div>
      )
    case 'nutrition-tracker':
      return (
        <div className="mini mini--macros" aria-hidden="true">
          <span className="mini__ring mini__ring--one" />
          <span className="mini__ring mini__ring--two" />
          <span className="mini__ring mini__ring--three" />
        </div>
      )
    case 'hydration-tracker':
      return (
        <div className="mini mini--water" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      )
    case 'habit-builder':
      return (
        <div className="mini mini--checks" aria-hidden="true">
          <i className="is-done" />
          <i className="is-done" />
          <i className="is-done" />
          <i />
        </div>
      )
    case 'sleep-tracking':
      return (
        <div className="mini mini--waves" aria-hidden="true">
          <svg viewBox="0 0 90 28" role="presentation">
            <path d="M1 18c8-15 16 10 24-4S42 24 50 10s16 12 24-3" />
          </svg>
        </div>
      )
    case 'progress-analytics':
      return (
        <div className="mini mini--chart" aria-hidden="true">
          <svg viewBox="0 0 92 32" role="presentation">
            <path d="M2 27 20 19 35 23 51 10 66 14 90 3" />
          </svg>
        </div>
      )
    default:
      return (
        <div className="mini mini--spark" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </div>
      )
  }
}

export default function Features() {
  return (
    <section className="features section" id="features" aria-labelledby="features-title">
      <div className="container">
        <div className="features__heading-row">
          <SectionHeading
            eyebrow="Explore PULSE"
            title={
              <span id="features-title">
                One platform. <em>Every part of you.</em>
              </span>
            }
            description="Seven thoughtful tools that work together, so your wellness routine feels like a rhythm instead of a checklist."
          />
          <Reveal className="features__count" delay={0.2}>
            <strong>07</strong>
            <span>connected<br />features</span>
          </Reveal>
        </div>

        <div className="row g-4 features__grid">
          {features.map((feature, index) => (
            <div className="col-md-6 col-xl-4" key={feature.slug}>
              <Reveal delay={(index % 3) * 0.08} className="h-100">
                <Link
                  to={`/features/${feature.slug}`}
                  className={`feature-card feature-card--${feature.accent}`}
                >
                  <div className="feature-card__visual">
                    <span className="feature-card__glow" aria-hidden="true" />
                    <span className="feature-card__icon" aria-hidden="true">
                      <feature.icon size={30} strokeWidth={1.7} />
                    </span>
                    <FeatureMini slug={feature.slug} />
                  </div>
                  <div className="feature-card__body">
                    <span className="feature-card__tagline">{feature.tagline}</span>
                    <h3>{feature.name}</h3>
                    <p>{feature.description}</p>
                    <span className="feature-card__link">
                      Explore feature <ArrowUpRight size={17} aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            </div>
          ))}

          <div className="col-md-6 col-xl-4">
            <Reveal delay={0.16} className="h-100">
              <div className="feature-card feature-card--cta">
                <div className="feature-card__cta-inner">
                  <span className="eyebrow eyebrow--lime">Coming together</span>
                  <h3>Your whole wellness story, in one place.</h3>
                  <p>
                    Each feature is designed to connect with the next. That is where real momentum
                    begins.
                  </p>
                  <Link to="/about" className="feature-card__cta-link">
                    See the vision <ArrowUpRight size={18} aria-hidden="true" />
                  </Link>
                </div>
                <div className="feature-card__cta-art" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
