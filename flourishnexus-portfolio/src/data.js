import vyra from './assets/projects/vyra.jpg'
import codeher from './assets/projects/codeher.png'
import jobhive from './assets/projects/jobhive.webp'
import jenkinson from './assets/projects/jenkinson.jpg'

export const SOCIALS = {
  email: 'ojongflourish14@gmail.com',
  github: 'https://github.com/Mo-Floxy',
  linkedin: import.meta.env.VITE_LINKEDIN_URL || '',
  portfolio: 'https://moflourishportfolio.vercel.app/',
}

export const PROJECT_CATEGORIES = ['All', 'Web Apps', 'Mobile Apps', 'Community', 'Other']

export const PROJECTS = [
  {
    id: 'vyra',
    name: 'VYRA',
    subtitle: 'Music Streaming Platform',
    description: 'A futuristic music discovery and streaming experience with dynamic mixes, synced lyrics and a persistent player.',
    tags: ['React', 'Vite', 'Framer Motion', 'REST APIs'],
    categories: ['Web Apps'],
    image: vyra,
    repo: 'https://github.com/Mo-Floxy/ojongflourish/tree/main/vyra',
    accent: '#168BFF',
  },
  {
    id: 'codeher',
    name: 'CodeHer',
    subtitle: 'Community-focused Platform',
    description: 'A community platform designed to help learners connect, collaborate and grow together in technology.',
    tags: ['React', 'Bootstrap', 'JavaScript'],
    categories: ['Web Apps', 'Community'],
    image: codeher,
    repo: 'https://github.com/Mo-Floxy/codeher',
    accent: '#3B82F6',
  },
  {
    id: 'jobhive',
    name: 'JobHive',
    subtitle: 'Job Listing Portal',
    description: 'A clean job board experience for browsing opportunities, exploring roles and discovering teams.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    categories: ['Web Apps'],
    image: jobhive,
    repo: 'https://github.com/Mo-Floxy/ojongflourish/tree/main/job-hive',
    accent: '#0EA5E9',
  },
  {
    id: 'weathernow',
    name: 'WeatherNow',
    subtitle: 'Weather Forecast Application',
    description: 'A responsive weather forecast app that presents live conditions and upcoming forecasts clearly.',
    tags: ['JavaScript', 'REST APIs', 'CSS'],
    categories: ['Web Apps', 'Other'],
    image: null,
    repo: 'https://github.com/Mo-Floxy/Weather-Forecast',
    accent: '#38BDF8',
  },
  {
    id: 'jenkinson',
    name: 'Jenkinson Sea Life',
    subtitle: 'Marine Life Website',
    description: 'An immersive marine-life experience showcasing sea creatures, conservation stories and vibrant visuals.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    categories: ['Web Apps', 'Other'],
    image: jenkinson,
    repo: 'https://github.com/Mo-Floxy/Jenkinson-Sea-Life',
    accent: '#22D3EE',
  },
  {
    id: 'cityguide',
    name: 'City Guide',
    subtitle: 'Flutter Mobile Application',
    description: 'A mobile guide concept for discovering places, landmarks and useful local information on the go.',
    tags: ['Flutter', 'Dart', 'Mobile UI'],
    categories: ['Mobile Apps'],
    image: null,
    repo: '',
    accent: '#6366F1',
  },
]

export const SKILL_GROUPS = [
  {
    title: 'Frontend',
    icon: 'Code2',
    items: ['HTML', 'CSS', 'JavaScript', 'React', 'Bootstrap'],
  },
  {
    title: 'Backend',
    icon: 'Server',
    items: ['Python', 'Django', 'Java'],
  },
  {
    title: 'Database',
    icon: 'Database',
    items: ['MySQL', 'SQL'],
  },
  {
    title: 'Tools',
    icon: 'Wrench',
    items: ['Git', 'GitHub', 'VS Code', 'Figma'],
  },
]

export const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/skills', label: 'Skills' },
  { to: '/projects', label: 'Projects' },
  { to: '/experience', label: 'Experience' },
  { to: '/contact', label: 'Contact' },
]
