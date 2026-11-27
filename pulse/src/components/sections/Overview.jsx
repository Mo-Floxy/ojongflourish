import { ArrowUpRight, Compass, Layers3, Sparkles } from 'lucide-react'
import Button from '../Button.jsx'
import Reveal from '../Reveal.jsx'
import SectionHeading from '../SectionHeading.jsx'

const points = [
  {
    icon: Layers3,
    title: 'Everything connected',
    text: 'Training, nutrition, hydration, sleep and habits finally live in the same picture.',
  },
  {
    icon: Compass,
    title: 'Built around your rhythm',
    text: 'Set your own pace. PULSE adapts to real life, not the other way around.',
  },
  {
    icon: Sparkles,
    title: 'Clarity over complexity',
    text: 'Simple daily actions, readable progress and guidance that feels human.',
  },
]

export default function Overview() {
  return (
    <section className="overview section" id="about-pulse" aria-labelledby="overview-title">
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-lg-5">
            <Reveal className="overview__visual">
              <div className="overview__image-frame">
                <img
                  src="/images/wellness-overview.jpg"
                  alt="Person stretching in a calm, sunlit wellness studio"
                  width="1400"
                  height="933"
                  loading="lazy"
                />
              </div>
              <div className="overview__floating">
                <span className="overview__floating-icon" aria-hidden="true">
                  <Sparkles size={20} />
                </span>
                <div>
                  <strong>Designed for real life</strong>
                  <span>Small steps, steady momentum.</span>
                </div>
              </div>
              <div className="overview__orb" aria-hidden="true" />
            </Reveal>
          </div>

          <div className="col-lg-6 offset-lg-1">
            <SectionHeading
              eyebrow="The PULSE approach"
              title={
                <span id="overview-title">
                  Wellness, in one <em>clean rhythm.</em>
                </span>
              }
              description="PULSE is an all-in-one wellness companion that brings the pieces together. Instead of juggling apps and guesswork, you get one calm place to understand your habits and act on them."
            />

            <div className="overview__points">
              {points.map((point, index) => (
                <Reveal key={point.title} className="overview__point" delay={0.08 * index}>
                  <span className="overview__point-icon" aria-hidden="true">
                    <point.icon size={20} strokeWidth={1.9} />
                  </span>
                  <div>
                    <h3>{point.title}</h3>
                    <p>{point.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.3}>
              <Button to="/about" variant="dark" icon={ArrowUpRight}>
                More about PULSE
              </Button>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
