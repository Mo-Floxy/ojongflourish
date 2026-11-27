import { ArrowUpRight, Sparkles } from 'lucide-react'
import Button from '../Button.jsx'
import Reveal from '../Reveal.jsx'

export default function FinalCTA() {
  return (
    <section className="final-cta" aria-labelledby="final-cta-title">
      <div className="container">
        <Reveal className="final-cta__panel">
          <div className="final-cta__glow" aria-hidden="true" />
          <div className="final-cta__rings" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="final-cta__content">
            <span className="eyebrow eyebrow--lime">
              <Sparkles size={14} aria-hidden="true" /> The beginning
            </span>
            <h2 id="final-cta-title">Your next chapter starts with one step.</h2>
            <p>
              Build a healthier rhythm with a platform designed around your real life. Your journey
              starts here.
            </p>
            <Button to="/get-started" variant="lime" size="lg" icon={ArrowUpRight}>
              Start Your Journey
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
