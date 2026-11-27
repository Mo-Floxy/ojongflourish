import Hero from '../components/sections/Hero.jsx'
import Overview from '../components/sections/Overview.jsx'
import Features from '../components/sections/Features.jsx'
import HowItWorks from '../components/sections/HowItWorks.jsx'
import DashboardPreview from '../components/sections/DashboardPreview.jsx'
import Testimonials from '../components/sections/Testimonials.jsx'
import FinalCTA from '../components/sections/FinalCTA.jsx'

export default function Home() {
  return (
    <>
      <Hero />
      <Overview />
      <Features />
      <HowItWorks />
      <DashboardPreview />
      <Testimonials />
      <FinalCTA />
    </>
  )
}
