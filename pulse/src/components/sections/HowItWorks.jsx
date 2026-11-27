import { BarChart3, Goal, Repeat } from 'lucide-react'
import Button from '../Button.jsx'
import Reveal from '../Reveal.jsx'
import SectionHeading from '../SectionHeading.jsx'

const steps = [
  {
    number: '01',
    icon: Goal,
    title: 'Set your personal goals',
    text: 'Start with what matters to you. Define a direction that feels realistic and meaningful.',
  },
  {
    number: '02',
    icon: Repeat,
    title: 'Build healthy daily routines',
    text: 'Turn intentions into small repeatable actions across movement, food, water and rest.',
  },
  {
    number: '03',
    icon: BarChart3,
    title: 'Track your progress and improve',
    text: 'See patterns, celebrate wins and adjust with clarity instead of guesswork.',
  },
]

export default function HowItWorks() {
  return (
    <section className="how section" aria-labelledby="how-title">
      <div className="how__glow" aria-hidden="true" />
      <div className="container">
        <SectionHeading
          eyebrow="How it works"
          title={<span id="how-title">Simple by design. <em>Powerful in practice.</em></span>}
          description="Getting started does not require a complete life overhaul. PULSE gives you a clear path and helps you keep it."
          align="center"
          light
        />

        <div className="row g-4 how__steps">
          {steps.map((step, index) => (
            <div className="col-md-4" key={step.number}>
              <Reveal className="how-step" delay={index * 0.12}>
                <div className="how-step__top">
                  <span className="how-step__number">{step.number}</span>
                  <span className="how-step__icon" aria-hidden="true">
                    <step.icon size={24} strokeWidth={1.8} />
                  </span>
                </div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
                {index < steps.length - 1 && (
                  <span className="how-step__connector" aria-hidden="true" />
                )}
              </Reveal>
            </div>
          ))}
        </div>

        <Reveal className="how__footer" delay={0.35}>
          <p>Phase 1 is the foundation. Your full dashboard arrives in the next phases.</p>
          <Button to="/get-started" variant="lime" size="sm">
            Begin your journey
          </Button>
        </Reveal>
      </div>
    </section>
  )
}
