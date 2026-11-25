import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Compass, GraduationCap, Lightbulb, Target } from 'lucide-react'
import mascot from '../assets/images/splash-mascot.jpeg'
import PageHeader from '../components/PageHeader'
import Reveal from '../components/Reveal'
import { useSound } from '../components/SoundController'

const JOURNEY = [
  {
    icon: Compass,
    title: 'Finding the path',
    text: 'I discovered software engineering through curiosity — the idea that a clear idea could become something people actually use.',
  },
  {
    icon: GraduationCap,
    title: 'Learning at Aptech',
    text: 'I began formal training in software engineering, building fundamentals in programming, databases and web technologies.',
  },
  {
    icon: Lightbulb,
    title: 'Learning by building',
    text: 'Personal projects became my practice ground: planning, designing, debugging and refining complete experiences.',
  },
  {
    icon: Target,
    title: 'Looking forward',
    text: 'I want to grow into full-stack development, write maintainable code and build products that solve real problems.',
  },
]

const VALUES = [
  {
    title: 'Understand first',
    text: 'I start by understanding the problem and the person behind it before choosing a solution.',
  },
  {
    title: 'Build in small steps',
    text: 'I prefer steady progress: structure the idea, build the core, test, then refine the details.',
  },
  {
    title: 'Keep learning',
    text: 'Every project teaches something new. I treat mistakes as information, not failure.',
  },
]

export default function About() {
  const { play } = useSound()

  return (
    <>
      <PageHeader
        number="01"
        eyebrow="About me"
        title="Engineering with"
        accent="intention."
        description="A developer growing through hands-on projects, continuous learning and a genuine interest in useful technology."
      />

      <section className="section about-intro-section">
        <div className="container about-intro__grid">
          <Reveal className="glass-panel about-intro__main">
            <p className="eyebrow">Professional introduction</p>
            <h2 className="section-title">Hi, I&apos;m <span>Flourish.</span></h2>
            <p>
              I&apos;m a software engineering student and creative developer who enjoys turning ideas into practical digital experiences. My focus is currently frontend development, with a growing interest in complete full-stack workflows.
            </p>
            <p>
              I care about the details that make technology feel approachable: readable interfaces, thoughtful interactions and code that stays understandable as it grows.
            </p>
            <Link to="/projects" className="text-link" onClick={() => play('nav')}>
              See what I&apos;ve built <ArrowRight size={14} />
            </Link>
          </Reveal>

          <Reveal className="about-intro__visual" delay={0.1}>
            <div className="about-intro__visual-glow" aria-hidden="true" />
            <img src={mascot} alt="Official FlourishNexus mascot" draggable="false" />
            <span className="about-intro__tag">Always learning</span>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal className="section-head">
            <div>
              <p className="eyebrow">My journey</p>
              <h2 className="section-title">From curiosity to <span>craft.</span></h2>
            </div>
            <p className="section-intro">A path built step by step — through study, experimentation and a willingness to keep improving.</p>
          </Reveal>

          <div className="journey-grid">
            {JOURNEY.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} className="glass-panel journey-card" delay={i * 0.06}>
                <span className="journey-card__icon"><Icon size={20} /></span>
                <span className="journey-card__number">0{i + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section about-details-section">
        <div className="container about-details__grid">
          <Reveal className="glass-panel education-card">
            <p className="eyebrow">Education</p>
            <h3>Aptech</h3>
            <p className="education-card__course">Advanced Diploma in Software Engineering (ADSE)</p>
            <span className="status-pill">Currently studying</span>
            <p className="education-card__text">
              My training covers software development fundamentals, web technologies, programming languages and database concepts — the foundation I continue to build on through projects.
            </p>
            <Link to="/experience" className="text-link" onClick={() => play('nav')}>
              View my journey <ArrowUpRight size={14} />
            </Link>
          </Reveal>

          <div className="values-stack">
            {VALUES.map((item, i) => (
              <Reveal key={item.title} className="glass-panel value-card" delay={i * 0.06}>
                <span className="value-card__index">0{i + 1}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section about-goals-section">
        <div className="container">
          <Reveal className="glass-panel goals-panel">
            <div>
              <p className="eyebrow">Goals as a developer</p>
              <h2>Build useful things. Keep getting better.</h2>
            </div>
            <div className="goals-panel__list">
              <p>Grow from frontend foundations into confident full-stack development.</p>
              <p>Build projects with clear purpose and thoughtful user experience.</p>
              <p>Develop the habit of testing, documenting and improving every build.</p>
            </div>
            <Link to="/contact" className="btn btn--glow" onClick={() => play('nav')}>
              Let&apos;s talk <ArrowUpRight size={16} />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}
