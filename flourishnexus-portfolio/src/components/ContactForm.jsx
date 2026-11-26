import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, CheckCircle2, LoaderCircle, TriangleAlert } from 'lucide-react'
import { SOCIALS } from '../data'

const EMPTY = { name: '', email: '', subject: '', message: '' }

function validate(values) {
  const errors = {}
  if (!values.name.trim()) errors.name = 'Please enter your name.'
  if (!values.email.trim()) {
    errors.email = 'Please enter your email address.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'That email address does not look right.'
  }
  if (!values.subject.trim()) errors.subject = 'Please add a subject.'
  if (!values.message.trim()) {
    errors.message = 'Please tell me a little about your project.'
  } else if (values.message.trim().length < 12) {
    errors.message = 'A few more details would help — at least 12 characters.'
  }
  return errors
}

export default function ContactForm() {
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState({ type: '', message: '' })
  const [sending, setSending] = useState(false)
  const web3formsKey = import.meta.env.VITE_WEB3FORMS_KEY || ''

  const update = (field) => (e) => {
    setValues((v) => ({ ...v, [field]: e.target.value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
    if (status.message) setStatus({ type: '', message: '' })
  }

  const onSubmit = async (e) => {
    e.preventDefault()

    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      setStatus({ type: 'error', message: 'Please check the highlighted fields.' })
      return
    }

    const subject = values.subject.trim()
    const body = `Name: ${values.name.trim()}\nEmail: ${values.email.trim()}\n\n${values.message.trim()}`

    if (!web3formsKey) {
      window.location.href = `mailto:${SOCIALS.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      setStatus({
        type: 'info',
        message: 'Your email app should open with the message ready to send. If it does not, email me directly using the link below.',
      })
      return
    }

    setSending(true)
    setStatus({ type: '', message: '' })

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: web3formsKey,
          name: values.name.trim(),
          email: values.email.trim(),
          subject,
          message: values.message.trim(),
          from_name: values.name.trim(),
        }),
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'The message could not be sent.')
      }

      setValues(EMPTY)
      setStatus({ type: 'success', message: 'Message sent. I will get back to you soon.' })
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'Something went wrong. Please try again or use the email link below.',
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <form className="contact-form" onSubmit={onSubmit} noValidate>
      <div className="field-row">
        <label className="field">
          <span>Name</span>
          <input
            type="text"
            name="name"
            autoComplete="name"
            placeholder="Your name"
            value={values.name}
            onChange={update('name')}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'error-name' : undefined}
          />
          <AnimatePresence>
            {errors.name && <motion.small id="error-name" className="field-error" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{errors.name}</motion.small>}
          </AnimatePresence>
        </label>

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={values.email}
            onChange={update('email')}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'error-email' : undefined}
          />
          <AnimatePresence>
            {errors.email && <motion.small id="error-email" className="field-error" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{errors.email}</motion.small>}
          </AnimatePresence>
        </label>
      </div>

      <label className="field">
        <span>Subject</span>
        <input
          type="text"
          name="subject"
          placeholder="What would you like to build?"
          value={values.subject}
          onChange={update('subject')}
          aria-invalid={Boolean(errors.subject)}
          aria-describedby={errors.subject ? 'error-subject' : undefined}
        />
        <AnimatePresence>
          {errors.subject && <motion.small id="error-subject" className="field-error" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{errors.subject}</motion.small>}
        </AnimatePresence>
      </label>

      <label className="field">
        <span>Message</span>
        <textarea
          name="message"
          rows="5"
          placeholder="Tell me about your idea, goal or question..."
          value={values.message}
          onChange={update('message')}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? 'error-message' : undefined}
        />
        <AnimatePresence>
          {errors.message && <motion.small id="error-message" className="field-error" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{errors.message}</motion.small>}
        </AnimatePresence>
      </label>

      <div className="contact-form__footer">
        <button type="submit" className="btn btn--glow" disabled={sending}>
          {sending ? <LoaderCircle size={16} className="spin" /> : <ArrowUpRight size={16} />}
          {sending ? 'Sending...' : 'Send Message'}
        </button>
        <p className="form-hint">
          {web3formsKey
            ? 'Messages are delivered through the configured form service.'
            : 'Without a form service key, this opens your email app — no false success messages.'}
        </p>
      </div>

      <AnimatePresence>
        {status.message && (
          <motion.p
            className={`form-status form-status--${status.type}`}
            role="status"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {status.type === 'success' && <CheckCircle2 size={16} />}
            {status.type === 'error' && <TriangleAlert size={16} />}
            {status.message}
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  )
}
