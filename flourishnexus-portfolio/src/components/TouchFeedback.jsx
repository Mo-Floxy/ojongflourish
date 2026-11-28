import { useEffect } from 'react'

// Visual-only mobile feedback. No Web Audio, no sound, no audio elements.
const INTERACTIVE = [
  'a[href]',
  'button:not([disabled])',
  '[role="button"]:not([disabled])',
  'input[type="button"]:not([disabled])',
  'input[type="submit"]:not([disabled])',
  'summary',
  '[tabindex]:not([tabindex="-1"]):not([disabled])',
  '.project-card',
].join(',')

const DURATION = 620
const MAX_ACTIVE = 4

export default function TouchFeedback() {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const touchQuery = window.matchMedia('(hover: none), (pointer: coarse)')
    const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!touchQuery.matches) return undefined

    const active = new WeakSet()
    const timers = new WeakMap()
    let count = 0

    const targetFrom = (node) => {
      if (!(node instanceof Element)) return null
      const el = node.closest(INTERACTIVE)
      if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return null
      return el
    }

    const onTouchStart = (event) => {
      if (reduceQuery.matches || count >= MAX_ACTIVE) return

      const el = targetFrom(event.target)
      if (!el || active.has(el)) return

      const touch = event.touches[0] || event.changedTouches[0]
      if (!touch) return

      const rect = el.getBoundingClientRect()
      if (!rect.width || !rect.height) return

      const x = Math.max(0, Math.min(rect.width, touch.clientX - rect.left))
      const y = Math.max(0, Math.min(rect.height, touch.clientY - rect.top))
      el.style.setProperty('--touch-x', `${x}px`)
      el.style.setProperty('--touch-y', `${y}px`)

      el.classList.add('touch-fx')
      void el.offsetWidth
      el.classList.add('is-touch-fx')
      active.add(el)
      count += 1

      const timer = window.setTimeout(() => {
        el.classList.remove('is-touch-fx')
        active.delete(el)
        timers.delete(el)
        count = Math.max(0, count - 1)
      }, DURATION)
      timers.set(el, timer)
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true })

    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [])

  return null
}
