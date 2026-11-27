import { useState } from 'react'
import { ArrowUpRight, Activity, Apple, Repeat2 } from 'lucide-react'
import Button from '../components/Button.jsx'
import Reveal from '../components/Reveal.jsx'

const focuses = [
  {
    value: 'move',
    label: 'Move better',
    icon: Activity,
    text: 'Strength, mobility and workouts that fit your week.',
  },
  {
    value: 'fuel',
    label: 'Eat smarter',
    icon: Apple,
    text: 'Simple meal logging, macros and hydration habits.',
  },
  {
    value: 'restore',
    label: 'Build routines',
    icon: Repeat2,
    text: 'Daily habits, better sleep and steady recovery.',
  },
]

export default function GetStarted() {
  const [focus, setFocus] = useState('move')
  const [submitted, setSubmitted] = useState(false)

  const selected = focuses.find((item) => item.value === focus)

  return (
    <>
      <section className="page-hero page-hero--compact">
        <div className="page-hero__glow" aria-hidden="true" />
        <div className="container">
          <Reveal className="page-hero__inner">
            <span className="eyebrow eyebrow--lime">Get started · Phase 1 preview</span>
            <h1>Where would you like to begin?</h1>
            <p>
              Choose a focus to preview the PULSE experience. This is a local demo interaction — no
              account is created and nothing is sent anywhere.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="starter section">
        <div className="container">
          <Reveal className="starter__card">
            <form
              onSubmit={(event) => {
                event.preventDefault()
                setSubmitted(true)
              }}
            >
              <fieldset>
                <legend>Choose your starting focus</legend>
                <div className="row g-3 mt-2">
                  {focuses.map((item) => (
                    <div className="col-md-4" key={item.value}>
                      <label
                        className={`starter-option ${focus === item.value ? 'is-selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name="focus"
                          value={item.value}
                          checked={focus === item.value}
                          onChange={() => {
                            setFocus(item.value)
                            setSubmitted(false)
                          }}
                        />
                        <span className="starter-option__icon" aria-hidden="true">
                          <item.icon size={22} />
                        </span>
                        <strong>{item.label}</strong>
                        <span>{item.text}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>

              <div className="starter__actions">
                <Button type="submit" variant="dark" icon={ArrowUpRight}>
                  Save my focus
                </Button>
                {submitted && (
                  <p className="starter__status" role="status">
                    Demo focus saved: <strong>{selected.label}</strong>. Full accounts arrive in
                    Phase 2.
                  </p>
                )}
              </div>
            </form>
          </Reveal>

          <Reveal className="starter__note" delay={0.2}>
            <span aria-hidden="true">01 / 10</span>
            <p>
              You are exploring the Phase 1 foundation. The full journey unfolds across ten focused
              phases.
            </p>
            <Button to="/about" variant="link-dark">
              See the roadmap
            </Button>
          </Reveal>
        </div>
      </section>
    </>
  )
}
