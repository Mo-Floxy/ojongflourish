import Reveal from './Reveal'

export default function PageHeader({ number, eyebrow, title, accent, description }) {
  return (
    <section className="page-header">
      <div className="container page-header__inner">
        <Reveal className="page-header__copy">
          <p className="eyebrow page-header__eyebrow">
            <span className="status-dot" aria-hidden="true" />
            {eyebrow}
          </p>
          <h1 className="page-title">
            {title} {accent && <span>{accent}</span>}
          </h1>
          {description && <p className="page-description">{description}</p>}
        </Reveal>

        <Reveal className="page-header__mark" delay={0.12}>
          <span className="page-header__number">{number}</span>
          <span className="page-header__orbit" aria-hidden="true" />
          <span className="page-header__orbit page-header__orbit--inner" aria-hidden="true" />
        </Reveal>
      </div>
    </section>
  )
}
