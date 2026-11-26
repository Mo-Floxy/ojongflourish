import { useMemo, useState } from 'react'
import { Filter } from 'lucide-react'
import { PROJECT_CATEGORIES, PROJECTS } from '../data'
import PageHeader from '../components/PageHeader'
import ProjectCard from '../components/ProjectCard'
import ProjectModal from '../components/ProjectModal'

export default function Projects() {
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState(null)

  const visible = useMemo(
    () => (filter === 'All' ? PROJECTS : PROJECTS.filter((p) => p.categories.includes(filter))),
    [filter],
  )

  const chooseFilter = (category) => setFilter(category)

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

          <div className="project-grid">
            {visible.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} onOpen={() => setSelected(project)} />
            ))}
          </div>

          {visible.length === 0 && (
            <p className="empty-state">No projects in this category yet.</p>
          )}
        </div>
      </section>

      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </>
  )
}
