import { Link } from 'react-router-dom'
import { ArrowUpRight, Award, BookOpen, GraduationCap, FolderGit2, Sparkles } from 'lucide-react'
import logo from '../assets/logo/fn-logo.webp'
import PageHeader from '../components/PageHeader'
import Reveal from '../components/Reveal'

const TIMELINE = [
  {
    icon: GraduationCap,
    tag: 'Current study',
    title: 'Aptech — ADSE',
    org: 'Advanced Diploma in Software Engineering',
    text: 'Currently studying software engineering, building fundamentals in programming, web development and databases.',
    detail: 'Focus: frontend development, full-stack foundations and practical problem solving.',
  },
  {
    icon: Award,
    tag: 'Certification',
    title: 'Digi Girls',
    org: 'Data Analytics certification',
    text: 'Completed a Data Analytics certification with Digi Girls, adding data thinking to my development foundation.',
    detail: 'Relevant areas: data analysis, interpretation and structured problem solving.',
  },
  {
    icon: FolderGit2,
    tag: 'Practical experience',
    title: 'Personal projects',
    org: 'Built, tested and refined independently',
    text: 'Projects are where I practise the full process: understanding a problem, designing an interface, writing code and improving the result.',
    detail: 'Includes VYRA, CodeHer, JobHive, WeatherNow, Jenkinson Sea Life and City Guide.',
  },
  {
    icon: BookOpen,
    tag: 'Learning journey',
    title: 'Technical growth',
    org: 'Frontend → full-stack',
    text: 'I started with HTML, CSS and JavaScript, then moved into React, Python, Django and database workflows.',
    detail: 'I continue to strengthen backend development and complete application architecture.',
  },
  {
    icon: Sparkles,
    tag: 'Development milestones',
    title: 'Milestones',
    org: 'Progress made through consistent building',
    text: 'From first layouts to interactive applications, each build has added a practical skill to my workflow.',
    detail: 'Responsive interfaces, reusable components, API integration and thoughtful interaction design.',
  },
]

export default function Experience() {
  return (
    <>
      <PageHeader
        number="04"
        eyebrow="Experience & education"
        title="My"
        accent="journey."
        description="Education, certifications, personal projects and the milestones shaping my development as a software engineer."
      />

      <section className="section timeline-section">
        <div className="container timeline-layout">
          <div className="timeline">
            {TIMELINE.map(({ icon: Icon, tag, title, org, text, detail }, i) => (
              <Reveal key={title} className="timeline-item" delay={i * 0.05}>
                <span className="timeline-item__marker" aria-hidden="true"><Icon size={17} /></span>
                <div className="glass-panel timeline-item__card">
                  <div className="timeline-item__top">
                    <span className="status-pill status-pill--small">{tag}</span>
                    <span className="timeline-item__index">0{i + 1}</span>
                  </div>
                  <h3>{title}</h3>
                  <p className="timeline-item__org">{org}</p>
                  <p>{text}</p>
                  <p className="timeline-item__detail">{detail}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <aside className="timeline-aside">
            <Reveal className="glass-panel timeline-aside__card" delay={0.15}>
              <p className="eyebrow">Important note</p>
              <h3>Honest by design.</h3>
              <p>
                This timeline contains education, certification and project work only. No employment history or qualifications have been invented.
              </p>
            </Reveal>

            <Reveal className="timeline-aside__visual" delay={0.2}>
              <div className="timeline-aside__glow" aria-hidden="true" />
              <div className="visual-emblem" aria-hidden="true">
                <img src={logo} alt="" />
              </div>
              <span>Building the future, one skill at a time.</span>
            </Reveal>

            <Reveal className="glass-panel timeline-aside__card timeline-aside__card--cta" delay={0.25}>
              <p className="eyebrow">Next chapter</p>
              <p>Interested in what I&apos;m building now?</p>
              <Link to="/projects" className="btn btn--glow btn--small">
                View projects <ArrowUpRight size={14} />
              </Link>
            </Reveal>
          </aside>
        </div>
      </section>
    </>
  )
}
