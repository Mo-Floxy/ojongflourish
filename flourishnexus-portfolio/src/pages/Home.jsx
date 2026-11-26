import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight, ArrowUpRight, Braces, Database, Github, Layers3, Mail,
  Server, Sparkles, TerminalSquare,
} from 'lucide-react'
import girlDesktop from '../assets/images/girl3.webp'
import girlMobile from '../assets/images/girl2.webp'
import logo from '../assets/logo/fn-logo.webp'
import { PROJECTS, SKILL_GROUPS, SOCIALS } from '../data'
import ProjectCard from '../components/ProjectCard'
import ProjectModal from '../components/ProjectModal'
import Reveal from '../components/Reveal'

const STACK = [
  { label: 'HTML', icon: Braces },
  { label: 'CSS', icon: Sparkles },
  { label: 'JavaScript', icon: TerminalSquare },
  { label: 'React', icon: Layers3 },
  { label: 'Python', icon: Server },
  { label: 'Django', icon: Server },
  { label: 'MySQL', icon: Database },
  { label: 'Bootstrap', icon: Layers3 },
]

export default function Home() {
  const reduceMotion = useReducedMotion()
  const [selectedProject, setSelectedProject] = useState(null)
  const featured = PROJECTS.slice(0, 3)
  const allSkills = SKILL_GROUPS.flatMap((group) => group.items)

  return (
    <>
      <section className="hero">
        <div className="hero__aurora" aria-hidden="true" />
        <div className="container hero__grid">
          <motion.div
            className="hero__copy"
            initial={{ opacity: 0, x: reduceMotion ? 0 : -28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: reduceMotion ? 0.15 : 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="hero__badge">
              <span className="status-dot" aria-hidden="true" />
              Software Engineer
            </div>

            <h1 className="hero__title">
              Hi, I&apos;m <span>Flourish</span>
            </h1>

            <p className="hero__lead">I build digital solutions through creativity and code.</p>
            <p className="hero__description">
              Creative developer. Problem solver. Always learning, always building.
            </p>

            <div className="hero__actions">
              <Link to="/projects" className="btn btn--glow">
                Explore My Work <ArrowRight size={16} />
              </Link>
              <Link to="/contact" className="btn btn--ghost">
                Contact Me <ArrowUpRight size={16} />
              </Link>
            </div>

            <div className="hero__socials" aria-label="Social links">
              <a href={SOCIALS.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <Github size={18} />
              </a>
              <a href={`mailto:${SOCIALS.email}`} aria-label="Email">
                <Mail size={18} />
              </a>
              {SOCIALS.linkedin && (
                <a href={SOCIALS.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <ArrowUpRight size={18} />
                </a>
              )}
              <span className="hero__socials-line" aria-hidden="true" />
              <span className="hero__socials-label">Open to collaborations</span>
            </div>
          </motion.div>

          <motion.div
            className="hero__visual"
            initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.92, x: reduceMotion ? 0 : 24 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: reduceMotion ? 0.15 : 0.8, delay: reduceMotion ? 0 : 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="hero__visual-glow" aria-hidden="true" />
            <div className="hero__rings" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div className="hero__ai-frame">
              <picture>
                <source media="(max-width: 640px)" srcSet={girlMobile} />
                <img
                  src={girlDesktop}
                  alt="Flourish portrait"
                  className="hero__ai-image"
                  draggable="false"
                  loading="eager"
                  fetchPriority="high"
                />
              </picture>
            </div>
            <div className="hero__holo" aria-hidden="true">
              <img src={logo} alt="" />
            </div>
            <span className="hero__float-tag hero__float-tag--one">React / Vite</span>
            <span className="hero__float-tag hero__float-tag--two">Creative code</span>
            <span className="hero__float-tag hero__float-tag--three">Dream. Code. Innovate.</span>
          </motion.div>
        </div>

        <div className="hero__scroll" aria-hidden="true">
          <span>Scroll to explore</span>
          <i />
        </div>
      </section>

      <section className="section stack-section">
        <div className="container">
          <Reveal className="stack-panel glass-panel">
            <div className="stack-panel__head">
              <div>
                <p className="eyebrow"><span className="status-dot" aria-hidden="true" /> Technology stack</p>
                <h2>Tools I use to bring ideas to life</h2>
              </div>
              <Link to="/skills" className="text-link">
                All skills <ArrowUpRight size={14} />
              </Link>
            </div>
            <div className="stack-grid">
              {STACK.map(({ label, icon: Icon }, i) => (
                <motion.div
                  key={label}
                  className="stack-item"
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ delay: i * 0.035, duration: 0.35 }}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </motion.div>
              ))}
            </div>
            <p className="stack-panel__note">
              Continuously learning across frontend, backend and database workflows — from {allSkills.slice(0, 3).join(', ')} to {allSkills.slice(-2).join(' and ')}.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section featured-section">
        <div className="container">
          <Reveal className="section-head">
            <div>
              <p className="eyebrow">Selected work / 01</p>
              <h2 className="section-title">Featured <span>projects</span></h2>
            </div>
            <p className="section-intro">A selection of work exploring useful products, expressive interfaces and thoughtful frontend experiences.</p>
          </Reveal>

          <div className="project-grid project-grid--featured">
            {featured.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} onOpen={() => setSelectedProject(project)} />
            ))}
          </div>

          <Reveal className="center-cta">
            <Link to="/projects" className="btn btn--glow">
              View all projects <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="section home-split">
        <div className="container home-split__grid">
          <Reveal className="glass-panel home-split__card">
            <p className="eyebrow">About preview / 02</p>
            <h2>Building with curiosity, clarity and care.</h2>
            <p>
              I&apos;m a software engineering student at Aptech with a growing focus on frontend and full-stack development. I like turning ideas into interfaces that feel clear, useful and alive.
            </p>
            <div className="home-split__points">
              <span>Problem solving</span>
              <span>Continuous learning</span>
              <span>User-focused design</span>
            </div>
            <Link to="/about" className="text-link">
              More about me <ArrowRight size={14} />
            </Link>
          </Reveal>

          <Reveal className="glass-panel home-split__card home-split__card--contact" delay={0.1}>
            <div className="home-split__contact-mark" aria-hidden="true">
              <img src={logo} alt="" />
            </div>
            <p className="eyebrow">Let&apos;s connect / 03</p>
            <h2>Have something in mind?</h2>
            <p>I&apos;m always open to interesting ideas, collaborations and conversations about technology.</p>
            <Link to="/contact" className="btn btn--glow">
              Start a conversation <ArrowUpRight size={16} />
            </Link>
          </Reveal>
        </div>
      </section>

      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </>
  )
}
