import { ArrowUpRight, Github, Linkedin, Mail, MapPin, Sparkles } from 'lucide-react'
import logo from '../assets/logo/fn-logo.webp'
import { SOCIALS } from '../data'
import ContactForm from '../components/ContactForm'
import PageHeader from '../components/PageHeader'
import Reveal from '../components/Reveal'

const linkedinUrl = import.meta.env.VITE_LINKEDIN_URL || ''

export default function Contact() {
  const links = [
    {
      label: 'Email',
      value: SOCIALS.email,
      icon: Mail,
      href: `mailto:${SOCIALS.email}`,
      hint: 'Best for projects and collaborations',
    },
    {
      label: 'GitHub',
      value: 'github.com/Mo-Floxy',
      icon: Github,
      href: SOCIALS.github,
      hint: 'Source code and project repositories',
    },
    {
      label: 'LinkedIn',
      value: linkedinUrl ? linkedinUrl.replace(/^https?:\/\//, '').replace(/\/$/, '') : 'Add your profile URL to activate',
      icon: Linkedin,
      href: linkedinUrl || null,
      hint: linkedinUrl ? 'Professional profile' : 'Set VITE_LINKEDIN_URL in .env',
      disabled: !linkedinUrl,
    },
  ]

  return (
    <>
      <PageHeader
        number="05"
        eyebrow="Contact"
        title="Let's"
        accent="Connect"
        description="Have a project in mind? Let&apos;s talk!"
      />

      <section className="section contact-section">
        <div className="container contact-layout">
          <Reveal className="glass-panel contact-panel">
            <div className="contact-panel__head">
              <div>
                <p className="eyebrow"><span className="status-dot" aria-hidden="true" /> Open for new ideas</p>
                <h2 className="section-title">Send a <span>message.</span></h2>
                <p>Tell me what you&apos;re imagining — an idea, a project, a question or simply a hello.</p>
              </div>
              <div className="contact-panel__logo" aria-hidden="true">
                <img src={logo} alt="" />
                <span />
              </div>
            </div>

            <ContactForm />
          </Reveal>

          <aside className="contact-side">
            <Reveal className="glass-panel contact-side__card" delay={0.08}>
              <p className="eyebrow">Direct channels</p>
              <div className="contact-links">
                {links.map(({ label, value, icon: Icon, href, hint, disabled }) => {
                  const content = (
                    <>
                      <span className="contact-links__icon"><Icon size={18} /></span>
                      <span className="contact-links__body">
                        <b>{label}</b>
                        <span>{value}</span>
                        <small>{hint}</small>
                      </span>
                      {!disabled && <ArrowUpRight size={16} />}
                    </>
                  )

                  return href ? (
                    <a key={label} href={href} target={href.startsWith('mailto:') ? undefined : '_blank'} rel={href.startsWith('mailto:') ? undefined : 'noopener noreferrer'} className="contact-links__item">
                      {content}
                    </a>
                  ) : (
                    <div key={label} className="contact-links__item is-disabled" aria-disabled="true">
                      {content}
                    </div>
                  )
                })}
              </div>
            </Reveal>

            <Reveal className="glass-panel contact-side__card contact-side__card--note" delay={0.14}>
              <p className="eyebrow">Currently based</p>
              <p className="contact-side__location"><MapPin size={16} /> Nigeria · Remote-friendly</p>
              <p className="contact-side__note">
                <Sparkles size={15} /> I usually reply as soon as I can. Thank you for reaching out.
              </p>
            </Reveal>

            <Reveal className="contact-side__visual" delay={0.2}>
              <div className="contact-side__glow" aria-hidden="true" />
              <div className="visual-emblem" aria-hidden="true">
                <img src={logo} alt="" />
              </div>
              <span>Dream. Code. Innovate.</span>
            </Reveal>
          </aside>
        </div>
      </section>
    </>
  )
}
