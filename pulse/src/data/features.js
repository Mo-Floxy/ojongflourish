import {
  Activity,
  Apple,
  BrainCircuit,
  Droplets,
  MoonStar,
  Repeat2,
  TrendingUp,
} from 'lucide-react'

export const features = [
  {
    slug: 'workout-studio',
    name: 'Workout Studio',
    icon: Activity,
    tagline: 'Train with intention.',
    description:
      'A focused space for exercise libraries, guided plans, rest timers and your complete workout history.',
    detail:
      'Build a week that fits your life. Browse movements by goal and equipment, follow a structured plan, and keep every session in one clear history.',
    accent: 'emerald',
    stat: '40+ movements',
    highlights: [
      'Exercise library with clear guidance',
      'Flexible plans for every schedule',
      'Built-in timers and session history',
    ],
  },
  {
    slug: 'nutrition-tracker',
    name: 'Nutrition Tracker',
    icon: Apple,
    tagline: 'Fuel the right way.',
    description:
      'Log meals, understand calories and macros, and see the bigger picture of how you eat.',
    detail:
      'Move beyond counting. PULSE turns everyday meals into simple, useful insight so you can fuel training, recovery and steady energy.',
    accent: 'lime',
    stat: 'Macros made simple',
    highlights: [
      'Quick meal logging',
      'Calorie and macro breakdowns',
      'Patterns you can actually use',
    ],
  },
  {
    slug: 'hydration-tracker',
    name: 'Hydration Tracker',
    icon: Droplets,
    tagline: 'Small sips, big difference.',
    description:
      'Set a daily water goal, log your intake and keep hydration visible throughout the day.',
    detail:
      'Hydration is easy to forget. A calm, visual tracker keeps it in view without turning wellness into another chore.',
    accent: 'blue',
    stat: 'Daily water goals',
    highlights: [
      'Personal daily targets',
      'One-tap water logging',
      'Gentle progress reminders',
    ],
  },
  {
    slug: 'habit-builder',
    name: 'Habit Builder',
    icon: Repeat2,
    tagline: 'Consistency, built in.',
    description:
      'Create daily routines, protect your streaks and celebrate the small wins that compound.',
    detail:
      'Lasting change is built one repeatable day at a time. Design routines that fit your rhythm and watch momentum take shape.',
    accent: 'amber',
    stat: 'Streaks that stick',
    highlights: [
      'Daily habit check-ins',
      'Visual streak tracking',
      'Flexible weekly routines',
    ],
  },
  {
    slug: 'sleep-tracking',
    name: 'Sleep Tracking',
    icon: MoonStar,
    tagline: 'Recover on purpose.',
    description:
      'Record sleep, spot patterns and connect rest with the way you feel and perform.',
    detail:
      'Better days begin with better recovery. Keep a simple sleep record and understand how rest interacts with your energy.',
    accent: 'violet',
    stat: 'Nightly insight',
    highlights: [
      'Simple sleep records',
      'Weekly sleep patterns',
      'Recovery-focused routines',
    ],
  },
  {
    slug: 'progress-analytics',
    name: 'Progress Analytics',
    icon: TrendingUp,
    tagline: 'See what is changing.',
    description:
      'Turn your activity and weight data into readable trends, reports and meaningful milestones.',
    detail:
      'Numbers mean more in context. PULSE turns scattered entries into a clear story of what is working and where to adjust.',
    accent: 'forest',
    stat: 'Trends, not noise',
    highlights: [
      'Weight and activity trends',
      'Weekly and monthly reports',
      'Milestone tracking',
    ],
  },
  {
    slug: 'ai-wellness-coach',
    name: 'AI Wellness Coach',
    icon: BrainCircuit,
    tagline: 'Guidance that adapts.',
    description:
      'Get personalized suggestions and AI-generated wellness plans that evolve with your goals.',
    detail:
      'A thoughtful coaching layer that considers your habits, training and recovery to suggest realistic next steps — never generic advice.',
    accent: 'rose',
    stat: 'Personalized plans',
    highlights: [
      'Context-aware suggestions',
      'Adaptable weekly plans',
      'Goal-focused check-ins',
    ],
  },
]

export const getFeature = (slug) => features.find((feature) => feature.slug === slug)
