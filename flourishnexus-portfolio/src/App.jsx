import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Atmosphere from './components/Atmosphere'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import ScrollToTop from './components/ScrollToTop'
import SplashScreen from './components/SplashScreen'
import About from './pages/About'
import Contact from './pages/Contact'
import Experience from './pages/Experience'
import Home from './pages/Home'
import Projects from './pages/Projects'
import Skills from './pages/Skills'

const TITLES = {
  '/': 'Home — FlourishNexus',
  '/about': 'About — FlourishNexus',
  '/skills': 'Skills — FlourishNexus',
  '/projects': 'Projects — FlourishNexus',
  '/experience': 'My Journey — FlourishNexus',
  '/contact': 'Let’s Connect — FlourishNexus',
}

export default function App() {
  const location = useLocation()
  const reduceMotion = useReducedMotion()
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    document.title = TITLES[location.pathname] || 'FlourishNexus'
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Atmosphere />

      <AnimatePresence>
        {showSplash && <SplashScreen key="splash" onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>

      {!showSplash && (
        <>
          <Navbar />

          <AnimatePresence mode="wait">
            <motion.main
              id="main"
              key={location.pathname}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduceMotion ? 0 : -10 }}
              transition={{ duration: reduceMotion ? 0.12 : 0.34, ease: [0.22, 1, 0.36, 1] }}
            >
              <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/skills" element={<Skills />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/experience" element={<Experience />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </motion.main>
          </AnimatePresence>

          <Footer />
          <ScrollToTop />
        </>
      )}
    </>
  )
}
