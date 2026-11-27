import { Clock3, Dumbbell, ListChecks } from 'lucide-react'
import TopicPage from '../components/TopicPage.jsx'

export default function Workouts() {
  return (
    <TopicPage
      eyebrow="Workout Studio · Phase 4"
      title={<>Train with intention, not guesswork.</>}
      description="A calm, focused studio for strength, mobility and movement. PULSE will bring your exercise library, plans, timers and history into one clear place."
      image="/images/pulse-hero-alt.jpg"
      imageAlt="Athlete training in a modern gym"
      imageLabel="PREVIEW · WORKOUT STUDIO"
      points={[
        {
          icon: Dumbbell,
          title: 'An exercise library that makes sense',
          text: 'Browse movements by goal, muscle group and equipment with clear, practical guidance.',
        },
        {
          icon: ListChecks,
          title: 'Plans built for real schedules',
          text: 'Follow structured weekly plans or shape sessions around the time you actually have.',
        },
        {
          icon: Clock3,
          title: 'Timers and history included',
          text: 'Keep rest timers, sets and past sessions together so every workout builds on the last.',
        },
      ]}
      related={['workout-studio', 'progress-analytics', 'sleep-tracking']}
      ctaTitle="Stronger starts with a plan."
      ctaText="The Workout Studio is planned for Phase 4 of the PULSE roadmap."
    />
  )
}
