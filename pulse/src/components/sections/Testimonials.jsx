import { Quote, Star } from 'lucide-react'
import Reveal from '../Reveal.jsx'
import SectionHeading from '../SectionHeading.jsx'

const testimonials = [
  {
    quote:
      'Having movement, meals and recovery in one place makes the whole routine feel lighter. I can see what is working without overthinking it.',
    name: 'Sample Member 01',
    role: 'Illustrative profile',
  },
  {
    quote:
      'The small daily check-ins are what stand out. It feels less like another app to maintain and more like a rhythm I actually want to keep.',
    name: 'Sample Member 02',
    role: 'Illustrative profile',
  },
  {
    quote:
      'I love how calm the experience is. Clear progress, useful guidance, and no noisy streaks or pressure. Just a better way to show up for myself.',
    name: 'Sample Member 03',
    role: 'Illustrative profile',
  },
]

export default function Testimonials() {
  return (
    <section className="testimonials section" aria-labelledby="testimonials-title">
      <div className="container">
        <div className="testimonials__head">
          <SectionHeading
            eyebrow="Sample voices"
            title={
              <span id="testimonials-title">
                What a balanced routine <em>can feel like.</em>
              </span>
            }
            description="These are clearly identified sample testimonials used to illustrate tone and product experience. They are not real customer reviews."
          />
          <Reveal delay={0.2}>
            <span className="sample-badge">SAMPLE TESTIMONIALS · NOT REAL REVIEWS</span>
          </Reveal>
        </div>

        <div className="row g-4">
          {testimonials.map((item, index) => (
            <div className="col-md-6 col-lg-4" key={item.name}>
              <Reveal className="testimonial-card h-100" delay={index * 0.1}>
                <Quote className="testimonial-card__quote-icon" size={32} aria-hidden="true" />
                <div className="testimonial-card__stars" aria-label="Illustrative five-star rating">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star key={starIndex} size={14} fill="currentColor" aria-hidden="true" />
                  ))}
                </div>
                <blockquote>“{item.quote}”</blockquote>
                <div className="testimonial-card__person">
                  <span className="testimonial-card__avatar" aria-hidden="true">
                    {item.name.slice(-2)}
                  </span>
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.role}</span>
                  </div>
                </div>
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
