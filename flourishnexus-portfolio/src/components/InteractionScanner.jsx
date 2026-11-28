import { useEffect } from 'react'

const INTERACTIVE = [
  'a[href]',
  'button:not([disabled])',
  '[role="button"]:not([disabled])',
  'input[type="button"]:not([disabled])',
  'input[type="submit"]:not([disabled])',
  'summary',
  '[tabindex]:not([tabindex="-1"]):not([disabled])',
].join(',')

const SCAN_MS = 640

export default function InteractionScanner() {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const pending = new Set()
    const timers = new WeakMap()
    let lastHover = null

    const targetFrom = (node) => {
      if (!(node instanceof Element)) return null
      const el = node.closest(INTERACTIVE)
      if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return null
      return el
    }

    const scan = (el) => {
      if (!el) return
      if (!el.classList.contains('scan-target')) el.classList.add('scan-target')

      const previous = timers.get(el)
      if (previous) {
        window.clearTimeout(previous)
        pending.delete(previous)
      }

      // Remove, reflow, re-add: restarts the CSS animation on repeated taps.
      el.classList.remove('is-scanning')
      void el.offsetWidth
      el.classList.add('is-scanning')

      const timer = window.setTimeout(() => {
        el.classList.remove('is-scanning')
        timers.delete(el)
        pending.delete(timer)
      }, SCAN_MS)
      timers.set(el, timer)
      pending.add(timer)
    }

    const onPointerOver = (event) => {
      const el = targetFrom(event.target)
      if (!el || el === lastHover) return
      if (event.relatedTarget instanceof Node && el.contains(event.relatedTarget)) return
      lastHover = el
      scan(el)
    }

    const onPointerOut = (event) => {
      if (!event.relatedTarget || !targetFrom(event.relatedTarget)) lastHover = null
    }

    const onPointerDown = (event) => scan(targetFrom(event.target))
    const onFocusIn = (event) => scan(targetFrom(event.target))

    window.addEventListener('pointerover', onPointerOver, { passive: true })
    window.addEventListener('pointerout', onPointerOut, { passive: true })
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    window.addEventListener('focusin', onFocusIn)

    return () => {
      pending.forEach((timer) => window.clearTimeout(timer))
      window.removeEventListener('pointerover', onPointerOver)
      window.removeEventListener('pointerout', onPointerOut)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('focusin', onFocusIn)
    }
  }, [])

  return null
}
