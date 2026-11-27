import { Apple, BarChart3, NotebookPen } from 'lucide-react'
import TopicPage from '../components/TopicPage.jsx'

export default function Nutrition() {
  return (
    <TopicPage
      eyebrow="Nutrition & Hydration · Phase 5"
      title={<>Fuel your day with clarity.</>}
      description="Logging food and water should be useful, not exhausting. PULSE will turn everyday entries into simple insight you can act on."
      image="/images/nutrition-preview.jpg"
      imageAlt="Fresh, colorful healthy meal bowl on a light table"
      imageLabel="PREVIEW · NUTRITION TRACKER"
      points={[
        {
          icon: NotebookPen,
          title: 'Meal logging, made quick',
          text: 'Add meals in seconds and keep a clean record of what you eat without a complicated workflow.',
        },
        {
          icon: BarChart3,
          title: 'Calories and macros, explained',
          text: 'See protein, carbs and fats in context so you can fuel training, energy and recovery.',
        },
        {
          icon: Apple,
          title: 'Hydration stays visible',
          text: 'Set a daily water goal and log intake with a gentle tracker that keeps you on course.',
        },
      ]}
      related={['nutrition-tracker', 'hydration-tracker', 'habit-builder']}
      ctaTitle="Better fuel, better days."
      ctaText="Nutrition and hydration tools are planned for Phase 5 of the PULSE roadmap."
    />
  )
}
