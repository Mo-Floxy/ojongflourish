import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Filter } from 'lucide-react'
import { PROJECT_CATEGORIES, PROJECTS } from '../data'
import PageHeader from '../components/PageHeader'
import ProjectCard from '../components/ProjectCard'
import ProjectModal from '../components/ProjectModal'
import { useSound } from '../components/SoundController'

export default function Projects() {
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState(null)
  const { play } = useSound()

  const visible = useMemo(
    () => (filter === 'All' ? PROJECTS : PROJECTS.filter((p) => p.categories.includes(filter))),
    [filter],
  )

  const chooseFilter = (category) => {
    play('blip')
    setFilter(category)
  }

  return (
    <>
      <PageHeader
        number="03"
        eyebrow="Selected work"
        title="Projects with"
        accent="purpose."
        description="Interfaces, platforms and experiments built while learning, designing and solving real problems through code."
      />

      <section className="section projects-page-section">
        <div className="container">
          <div className="filter-bar glass-panel" role="group" aria-label="Filter projects by category">
            <span className="filter-bar__label"><Filter size={15} /> Filter</span>
            <div className="filter-bar__chips">
              {PROJECT_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={`filter-chip ${filter === category ? 'is-active' : ''}`}
                  onClick={() => chooseFilter(category)}
                  aria-pressed={filter === category}
                >
                  {category}
                </button>
              ))}
            </div>
            <span className="filter-bar__count">{visible.length} shown</span>
          </div>

          <motion.div className="project-grid" layout>
            <AnimatePresence mode="popLayout">
              {visible.map((project, i) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.28 }}
                >
                  <ProjectCard project={project} index={i} onOpen={() => setSelected(project)} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {visible.length === 0 && (
            <p className="empty-state">No projects in this category yet.</p>
          )}
        </div>
      </section>

      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </>
  )
}
