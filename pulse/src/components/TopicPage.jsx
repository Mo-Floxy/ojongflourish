import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import Button from './Button.jsx'
import Reveal from './Reveal.jsx'
import { features } from '../data/features.js'

export default function TopicPage({
  eyebrow,
  title,
  description,
  image,
  imageAlt,
  imageLabel,
  points,
  related = [],
  ctaTitle = 'Ready to find your rhythm?',
  ctaText = 'PULSE is being built one thoughtful phase at a time.',
}) {
  const relatedFeatures = related
    .map((slug) => features.find((feature) => feature.slug === slug))
    .filter(Boolean)

  return (
    <>
      <section className="page-hero">
        <div className="page-hero__glow" aria-hidden="true" />
        <div className="container">
          <Reveal className="page-hero__inner">
            <span className="eyebrow eyebrow--lime">{eyebrow}</span>
            <h1>{title}</h1>
            <p>{description}</p>
            <div className="page-hero__actions">
              <Button to="/get-started" variant="lime" icon={ArrowUpRight}>
                Get Started
              </Button>
              <Button to="/#features" variant="outline-light">
                All features
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="topic section">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <Reveal className="topic__image">
                <img src={image} alt={imageAlt} width="1400" height="933" loading="lazy" />
                {imageLabel && <span className="topic__image-label">{imageLabel}</span>}
              </Reveal>
            </div>
            <div className="col-lg-6">
              <div className="topic__points">
                {points.map((point, index) => (
                  <Reveal key={point.title} className="topic__point" delay={index * 0.09}>
                    <span className="topic__point-icon" aria-hidden="true">
                      <point.icon size={21} strokeWidth={1.8} />
                    </span>
                    <div>
                      <h2>{point.title}</h2>
                      <p>{point.text}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {relatedFeatures.length > 0 && (
        <section className="related section">
          <div className="container">
            <Reveal>
              <span className="eyebrow">Connected tools</span>
              <h2 className="related__title">Works better together.</h2>
            </Reveal>
            <div className="row g-4 mt-1">
              {relatedFeatures.map((feature, index) => (
                <div className="col-md-4" key={feature.slug}>
                  <Reveal delay={index * 0.1}>
                    <Link to={`/features/${feature.slug}`} className="related-card">
                      <span className="related-card__icon" aria-hidden="true">
                        <feature.icon size={22} />
                      </span>
                      <h3>{feature.name}</h3>
                      <p>{feature.tagline}</p>
                      <span className="related-card__link">View feature</span>
                    </Link>
                  </Reveal>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="simple-cta">
        <div className="container">
          <Reveal className="simple-cta__inner">
            <div>
              <h2>{ctaTitle}</h2>
              <p>{ctaText}</p>
            </div>
            <Button to="/get-started" variant="dark" icon={ArrowUpRight}>
              Start Your Journey
            </Button>
          </Reveal>
        </div>
      </section>
    </>
  )
}
