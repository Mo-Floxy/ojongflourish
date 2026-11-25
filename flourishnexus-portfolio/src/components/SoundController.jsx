import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

const SoundContext = createContext(null)

const SOUNDS = {
  click: { freqs: [880, 1320], duration: 0.055, type: 'triangle', volume: 0.028 },
  nav: { freqs: [520, 780, 1040], duration: 0.12, type: 'sine', volume: 0.022 },
  blip: { freqs: [1200, 1600], duration: 0.08, type: 'sine', volume: 0.024 },
  menu: { freqs: [420, 840], duration: 0.1, type: 'square', volume: 0.016 },
  success: { freqs: [660, 990, 1320], duration: 0.22, type: 'sine', volume: 0.03 },
  startup: { freqs: [520, 780, 1170], duration: 0.32, type: 'sine', volume: 0.024 },
}

export function SoundProvider({ children }) {
  const [enabled, setEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('fn-sound-enabled')
      return saved === null ? true : saved === 'true'
    } catch {
      return true
    }
  })
  const ctxRef = useRef(null)

  useEffect(() => {
    try {
      localStorage.setItem('fn-sound-enabled', String(enabled))
    } catch {
      /* storage may be unavailable */
    }
  }, [enabled])

  const ensureContext = useCallback(() => {
    if (typeof window === 'undefined') return null
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return null
    if (!ctxRef.current) ctxRef.current = new AudioCtx()
    if (ctxRef.current.state === 'suspended') ctxRef.current.resume().catch(() => {})
    return ctxRef.current
  }, [])

  useEffect(() => {
    const unlock = () => ensureContext()
    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })
    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [ensureContext])

  const play = useCallback(
    (name = 'click') => {
      if (!enabled) return
      const ctx = ensureContext()
      if (!ctx) return
      const config = SOUNDS[name] || SOUNDS.click
      const now = ctx.currentTime
      const master = ctx.createGain()

      master.gain.setValueAtTime(0.0001, now)
      master.gain.exponentialRampToValueAtTime(config.volume, now + 0.012)
      master.gain.exponentialRampToValueAtTime(0.0001, now + config.duration)
      master.connect(ctx.destination)

      config.freqs.forEach((freq, index) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = config.type
        osc.frequency.setValueAtTime(freq, now + index * 0.018)
        gain.gain.setValueAtTime(1 / config.freqs.length, now)
        osc.connect(gain)
        gain.connect(master)
        osc.start(now + index * 0.018)
        osc.stop(now + config.duration + 0.05)
      })
    },
    [enabled, ensureContext],
  )

  const value = useMemo(() => ({ enabled, setEnabled, play }), [enabled, play])
  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
}

export function useSound() {
  const ctx = useContext(SoundContext)
  if (!ctx) throw new Error('useSound must be used inside SoundProvider')
  return ctx
}

export function SoundToggle({ className = '' }) {
  const { enabled, setEnabled, play } = useSound()

  const toggle = () => {
    const next = !enabled
    setEnabled(next)
    if (next) play('menu')
  }

  return (
    <button
      type="button"
      className={`sound-toggle ${className}`}
      onClick={toggle}
      aria-label={enabled ? 'Mute interface sounds' : 'Enable interface sounds'}
      aria-pressed={enabled}
      title={enabled ? 'Sound on — click to mute' : 'Sound off — click to enable'}
    >
      {enabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
      <span className="sound-toggle__label">{enabled ? 'Sound on' : 'Muted'}</span>
    </button>
  )
}
