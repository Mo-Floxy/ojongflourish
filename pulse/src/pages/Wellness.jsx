import { BrainCircuit, MoonStar, Repeat2 } from 'lucide-react'
import TopicPage from '../components/TopicPage.jsx'

export default function Wellness() {
  return (
    <TopicPage
      eyebrow="Habits, Sleep & Coaching · Phases 6–8"
      title={<>Wellness is more than movement.</>}
      description="Lasting progress lives in the small things you repeat. PULSE will help you build routines, understand rest and get guidance that adapts to you."
      image="/images/recovery.jpg"
      imageAlt="Person meditating in a quiet, naturally lit space"
      imageLabel="PREVIEW · WELLNESS ROUTINES"
      points={[
        {
          icon: Repeat2,
          title: 'Habits that actually stick',
          text: 'Design daily routines, protect streaks and celebrate the small wins that compound over time.',
        },
        {
          icon: MoonStar,
          title: 'Sleep you can understand',
          text: 'Keep simple sleep records and spot patterns that connect rest with energy and performance.',
        },
        {
          icon: BrainCircuit,
          title: 'Coaching that feels personal',
          text: 'AI-guided suggestions and plans shaped by your goals, routines and recovery.',
        },
      ]}
      related={['habit-builder', 'sleep-tracking', 'ai-wellness-coach']}
      ctaTitle="Small rituals. Real change."
      ctaText="Habit, sleep and coaching tools arrive across Phases 6 to 8."
    />
  )
}
