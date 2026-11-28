import { motion } from 'framer-motion'
import { ArrowUpRight, Github, Globe2, Layers3 } from 'lucide-react'

export default function ProjectCard({ project, index, onOpen }) {
  return (
    <motion.article
      className="glass-panel project-card"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.07 }}
      style={{ '--accent': project.accent }}
    >
      <div className="project-card__media">
        {project.image ? (
          <img src={project.image} alt={`${project.name} project preview`} loading="lazy" />
        ) : (
          <div className="project-card__placeholder" aria-hidden="true">
            <span>{project.name.slice(0, 2)}</span>
            <i />
          </div>
        )}
        <span className="project-card__media-glow" aria-hidden="true" />
        <span className="project-card__number">{String(index + 1).padStart(2, '0')}</span>
      </div>

      <div className="project-card__body">
        <div className="project-card__title-row">
          <div>
            <h3>{project.name}</h3>
            <p className="project-card__subtitle">{project.subtitle}</p>
          </div>
          <Layers3 size={18} className="project-card__mark" aria-hidden="true" />
        </div>

        <p className="project-card__desc">{project.description}</p>

        <ul className="tag-list" aria-label="Technologies used">
          {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
        </ul>

        <div className="project-card__actions">
          <button
            type="button"
            className="btn btn--glow btn--small"
            onClick={() => onOpen(project)}
          >
            View Project <ArrowUpRight size={14} />
          </button>

          {project.live && (
            <a
              href={project.live}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--ghost btn--small"
            >
              <Globe2 size={15} /> Live demo
            </a>
          )}

          {project.repo && (
            <a
              href={project.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--ghost btn--small"
            >
              <Github size={15} /> GitHub
            </a>
          )}
        </div>
      </div>
    </motion.article>
  )
}
