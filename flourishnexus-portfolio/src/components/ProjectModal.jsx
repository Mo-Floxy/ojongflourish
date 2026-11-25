import { useEffect } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Github, X } from 'lucide-react'
import { useSound } from './SoundController'

export default function ProjectModal({ project, onClose }) {
  const { play } = useSound()
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!project) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') {
        play('click')
        onClose()
      }
    }
    document.body.classList.add('modal-open')
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.classList.remove('modal-open')
      window.removeEventListener('keydown', onKey)
    }
  }, [project, onClose, play])

  const close = () => {
    play('click')
    onClose()
  }

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.1 : 0.22 }}
          onClick={close}
          role="presentation"
        >
          <motion.div
            className="project-modal glass-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-modal-title"
            initial={{ opacity: 0, y: reduceMotion ? 0 : 28, scale: reduceMotion ? 1 : 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : 18, scale: reduceMotion ? 1 : 0.98 }}
            transition={{ duration: reduceMotion ? 0.1 : 0.32, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{ '--accent': project.accent }}
          >
            <button type="button" className="icon-button project-modal__close" onClick={close} aria-label="Close project details">
              <X size={20} />
            </button>

            <div className="project-modal__media">
              {project.image ? (
                <img src={project.image} alt={`${project.name} preview`} />
              ) : (
                <div className="project-card__placeholder" aria-hidden="true">
                  <span>{project.name.slice(0, 2)}</span>
                  <i />
                </div>
              )}
            </div>

            <div className="project-modal__body">
              <p className="eyebrow">Project file / {project.subtitle}</p>
              <h2 id="project-modal-title">{project.name}</h2>
              <p>{project.description}</p>

              <div className="project-modal__meta">
                <div>
                  <span className="meta-label">Stack</span>
                  <ul className="tag-list">
                    {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
                  </ul>
                </div>
                <div>
                  <span className="meta-label">Availability</span>
                  <p className="meta-value">
                    {project.repo ? 'Source available on GitHub' : 'Private concept — no public repository'}
                  </p>
                </div>
              </div>

              <div className="project-modal__actions">
                {project.repo && (
                  <a className="btn btn--glow" href={project.repo} target="_blank" rel="noopener noreferrer" onClick={() => play('click')}>
                    Open repository <ArrowUpRight size={15} />
                  </a>
                )}
                {!project.repo && (
                  <button type="button" className="btn btn--ghost" onClick={close}>
                    Got it <Github size={15} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
