import { ArrowLeft, Compass } from 'lucide-react'
import Button from '../components/Button.jsx'
import Reveal from '../components/Reveal.jsx'

export default function NotFound() {
  return (
    <section className="not-found">
      <div className="container">
        <Reveal className="not-found__inner">
          <span className="not-found__icon" aria-hidden="true"><Compass size={30} /></span>
          <span className="eyebrow eyebrow--lime">404 · Off the rhythm</span>
          <h1>This page took a different path.</h1>
          <p>Let us get you back to something useful.</p>
          <Button to="/" variant="lime" icon={ArrowLeft} iconPosition="left">
            Back to home
          </Button>
        </Reveal>
      </div>
    </section>
  )
}
