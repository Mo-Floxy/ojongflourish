import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Layers3 } from 'lucide-react'
import logo from '../assets/logo/fn-logo.jpeg'
import { SKILL_GROUPS } from '../data'
import PageHeader from '../components/PageHeader'
import Reveal from '../components/Reveal'
import SkillCard from '../components/SkillCard'
import { useSound } from '../components/SoundController'

const ALL = SKILL_GROUPS.flatMap((group) => group.items)

export default function Skills() {
  const { play } = useSound()

  return (
    <>
      <PageHeader
        number="02"
        eyebrow="Skills & tools"
        title="My technical"
        accent="toolkit."
        description="The technologies I work with across interface design, application logic, databases and the tools that support my workflow."
      />

      <section className="section skills-section">
        <div className="container">
          <Reveal className="skills-note glass-panel">
            <span className="skills-note__icon"><Layers3 size={19} /></span>
            <p>
              No invented percentages here — just the real technologies I&apos;m building with and continuing to learn.
            </p>
            <span className="skills-note__count">{ALL.length} technologies</span>
          </Reveal>

          <div className="skills-grid">
            {SKILL_GROUPS.map((group, i) => (
              <SkillCard key={group.title} group={group} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="section skills-marquee-section">
        <Reveal className="skills-marquee">
          <div className="skills-marquee__track">
            {[...ALL, ...ALL].map((skill, i) => (
              <span key={`${skill}-${i}`}>
                <i aria-hidden="true" /> {skill}
              </span>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="section skills-cta-section">
        <div className="container">
          <Reveal className="glass-panel skills-cta">
            <div className="skills-cta__mark" aria-hidden="true">
              <img src={logo} alt="" />
              <span />
            </div>
            <div>
              <p className="eyebrow">Always expanding</p>
              <h2>Next up: deeper full-stack development.</h2>
              <p>I&apos;m strengthening my backend and database skills while continuing to sharpen the interfaces I build.</p>
            </div>
            <div className="skills-cta__actions">
              <Link to="/projects" className="btn btn--glow" onClick={() => play('nav')}>
                See skills in action <ArrowRight size={16} />
              </Link>
              <Link to="/contact" className="text-link" onClick={() => play('nav')}>
                Connect <ArrowUpRight size={14} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
