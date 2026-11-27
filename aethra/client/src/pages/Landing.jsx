import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  AudioLines,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  Compass,
  Cpu,
  Download,
  FolderHeart,
  Globe2,
  Image as ImageIcon,
  Layers3,
  LockKeyhole,
  MessageSquareText,
  Mic2,
  Quote,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
  WandSparkles,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AIOrb from '../components/three/AIOrb';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import FeatureTabs from '../components/landing/FeatureTabs';

const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
};

const CAPABILITIES = [
  {
    icon: BrainCircuit,
    title: 'Reasoning that flows',
    text: 'Context-aware conversations that remember where you left off and adapt to how you think.',
    className: 'nx-bento--wide',
    visual: 'chat',
  },
  {
    icon: ImageIcon,
    title: 'Image generation',
    text: 'From a sentence to a scene. Style, ratio and prompt control in a studio built for creators.',
    className: '',
    visual: 'image',
  },
  {
    icon: AudioLines,
    title: 'Voice interaction',
    text: 'Speak, listen and respond in a natural loop with live assistant states.',
    className: '',
    visual: 'voice',
  },
  {
    icon: FolderHeart,
    title: 'A library that remembers',
    text: 'Every creation saved, searchable and ready to download whenever you need it.',
    className: 'nx-bento--wide',
    visual: 'library',
  },
  {
    icon: ShieldCheck,
    title: 'Private by design',
    text: 'Your account, conversations and creations are scoped to you. Keys stay on the server.',
    className: '',
    visual: 'shield',
  },
  {
    icon: Zap,
    title: 'Built for speed',
    text: 'Streaming replies and an optimised 3D experience that stays smooth on mobile.',
    className: '',
    visual: 'speed',
  },
];

const STEPS = [
  { icon: Sparkles, step: '01', title: 'Create your space', text: 'Sign up in seconds. Your private universe is ready immediately.' },
  { icon: WandSparkles, step: '02', title: 'Choose your mode', text: 'Chat, imagine an image, or just start talking. It all feels connected.' },
  { icon: Layers3, step: '03', title: 'Build on ideas', text: 'Refine, regenerate and save the outputs that matter to you.' },
  { icon: Globe2, step: '04', title: 'Return anytime', text: 'Your history and creations are always waiting where you left them.' },
];

const TESTIMONIALS = [
  { quote: 'The orb sold me instantly. The workspace kept me here.', name: 'Ada O.', role: 'Product designer', initials: 'AO' },
  { quote: 'I brainstorm, generate visuals and keep everything in one flow.', name: 'Michael T.', role: 'Content strategist', initials: 'MT' },
  { quote: 'Voice mode makes it feel like a colleague, not a form.', name: 'Sofia R.', role: 'Researcher', initials: 'SR' },
];

const FAQS = [
  {
    q: 'What is AETHRA?',
    a: 'AETHRA is a personal AI universe: one place to converse with an AI assistant, generate images, talk by voice and manage everything you create.',
  },
  {
    q: 'Do I need an API key to use it?',
    a: 'No. The administrator configures AI credentials on the server. Your account works without seeing or handling any keys. If credentials are missing, AETHRA shows a clear setup state instead of pretending to generate content.',
  },
  {
    q: 'Are my conversations private?',
    a: 'Yes. All conversations, messages and saved creations are tied to your account and protected by authentication. API keys never reach the browser.',
  },
  {
    q: 'Does it work on mobile?',
    a: 'Yes. The interface adapts to phones and tablets, with collapsible navigation, touch-friendly controls and a lighter 3D renderer on smaller screens.',
  },
  {
    q: 'Which AI models does it use?',
    a: 'The backend supports configurable OpenAI-compatible chat providers and image providers. The exact model is set through server environment variables.',
  },
];

function Hero() {
  return (
    <section className="nx-hero" id="home">
      <div className="nx-hero__glow" />
      <div className="nx-container nx-hero__grid">
        <motion.div className="nx-hero__copy" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <span className="nx-eyebrow">Introducing AETHRA</span>
          <h1>
            Your Intelligence.
            <br />
            <span className="nx-gradient-text">Without Limits.</span>
          </h1>
          <p className="nx-hero__lead nx-muted">
            Meet your personal AI universe. Create, discover, communicate and bring your ideas to life with AETHRA.
          </p>
          <div className="nx-hero__actions">
            <Link to="/register" className="nx-btn nx-btn--primary">
              Get Started <ArrowRight size={17} />
            </Link>
            <a href="#explore" className="nx-btn nx-btn--ghost">
              <Compass size={17} /> Explore AETHRA
            </a>
          </div>
          <div className="nx-hero__metrics">
            <div><strong>24/7</strong><span>Intelligence on demand</span></div>
            <div><strong>04</strong><span>Creative modes</span></div>
            <div><strong>100%</strong><span>Your private space</span></div>
          </div>
        </motion.div>

        <motion.div className="nx-hero__visual" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.1, delay: 0.15 }}>
          <div className="nx-hero__ring nx-hero__ring--one" />
          <div className="nx-hero__ring nx-hero__ring--two" />
          <AIOrb state="idle" />

          <motion.div className="nx-float-panel nx-float-panel--top nx-glass" animate={{ y: [0, -12, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}>
            <span className="nx-float-panel__icon"><BrainCircuit size={18} /></span>
            <div><strong>Neural core</strong><small>Online · 98.6%</small></div>
            <span className="nx-dot" />
          </motion.div>

          <motion.div className="nx-float-panel nx-float-panel--right nx-glass" animate={{ y: [0, 14, 0] }} transition={{ duration: 6.2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}>
            <span className="nx-float-panel__icon nx-float-panel__icon--violet"><ImageIcon size={18} /></span>
            <div><strong>Image engine</strong><small>Ready to imagine</small></div>
          </motion.div>

          <motion.div className="nx-float-panel nx-float-panel--bottom nx-glass" animate={{ y: [0, -9, 0] }} transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}>
            <AudioLines size={17} className="text-info" />
            <div><strong>Voice link</strong><small className="nx-mono">LISTENING</small></div>
          </motion.div>
        </motion.div>
      </div>

      <a className="nx-hero__scroll nx-mono" href="#about">
        SCROLL TO DISCOVER <ChevronDown size={15} />
      </a>
    </section>
  );
}

function Discover() {
  const items = [
    { icon: MessageSquareText, title: 'Think out loud', text: 'A chat partner that follows your train of thought, not a script.' },
    { icon: ImageIcon, title: 'See the unseen', text: 'Give your ideas a visual form with a focused generation studio.' },
    { icon: Mic2, title: 'Speak freely', text: 'A voice assistant with responsive, expressive states.' },
    { icon: FolderHeart, title: 'Keep the good stuff', text: 'An organised library for every image and idea worth saving.' },
  ];

  return (
    <section className="nx-section nx-discover" id="about">
      <div className="nx-container">
        <motion.div className="nx-section-head" {...reveal}>
          <span className="nx-eyebrow">Discover AETHRA</span>
          <h2>One universe.<br /><span className="nx-gradient-text">Endless possibilities.</span></h2>
          <p className="nx-muted">Not a collection of tools — a connected space where your intelligence can move freely.</p>
        </motion.div>

        <div className="nx-discover__grid">
          {items.map(({ icon: Icon, title, text }, index) => (
            <motion.article className="nx-card nx-glass nx-discover__card" key={title} {...reveal} transition={{ ...reveal.transition, delay: index * 0.08 }}>
              <span className="nx-icon-tile"><Icon size={22} /></span>
              <span className="nx-discover__number nx-mono">0{index + 1}</span>
              <h3>{title}</h3>
              <p className="nx-muted">{text}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Capabilities() {
  return (
    <section className="nx-section nx-capabilities" id="features">
      <div className="nx-container">
        <motion.div className="nx-section-head nx-section-head--split" {...reveal}>
          <div>
            <span className="nx-eyebrow">AI capabilities</span>
            <h2>Designed around<br /><span className="nx-gradient-text">how you create.</span></h2>
          </div>
          <p className="nx-muted">Every capability is built to be useful first and beautiful second — with the details that make long sessions feel effortless.</p>
        </motion.div>

        <div className="nx-bento">
          {CAPABILITIES.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.article className={`nx-glass nx-bento__card ${item.className}`} key={item.title} {...reveal} transition={{ ...reveal.transition, delay: index * 0.06 }}>
                <span className="nx-icon-tile"><Icon size={21} /></span>
                <h3>{item.title}</h3>
                <p className="nx-muted">{item.text}</p>
                <div className={`nx-bento__visual nx-bento__visual--${item.visual}`} aria-hidden="true">
                  {item.visual === 'chat' && <><i /><i /><i /></>}
                  {item.visual === 'image' && <><b /><b /></>}
                  {item.visual === 'voice' && <><i style={{ height: '18px' }} /><i style={{ height: '38px' }} /><i style={{ height: '26px' }} /><i style={{ height: '46px' }} /><i style={{ height: '20px' }} /></>}
                  {item.visual === 'library' && <><b /><b /><b /></>}
                  {item.visual === 'shield' && <LockKeyhole size={22} />}
                  {item.visual === 'speed' && <><span className="nx-mono">FAST</span><Activity size={22} /></>}
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Explore() {
  return (
    <section className="nx-section nx-explore" id="explore">
      <div className="nx-container">
        <motion.div className="nx-section-head nx-section-head--center" {...reveal}>
          <span className="nx-eyebrow">Interactive previews</span>
          <h2>Take a look <span className="nx-gradient-text">inside.</span></h2>
          <p className="nx-muted">Switch between AETHRA's modes to see how each workspace feels.</p>
        </motion.div>
        <motion.div {...reveal}><FeatureTabs /></motion.div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="nx-section nx-how" id="how-it-works">
      <div className="nx-container">
        <motion.div className="nx-section-head nx-section-head--center" {...reveal}>
          <span className="nx-eyebrow">How it works</span>
          <h2>From idea to output<br /><span className="nx-gradient-text">in four moves.</span></h2>
        </motion.div>

        <div className="nx-steps">
          {STEPS.map(({ icon: Icon, step, title, text }, index) => (
            <motion.div className="nx-step" key={step} {...reveal} transition={{ ...reveal.transition, delay: index * 0.1 }}>
              <div className="nx-step__marker"><span className="nx-mono">{step}</span><Icon size={20} /></div>
              <h3>{title}</h3>
              <p className="nx-muted">{text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="nx-section nx-testimonials">
      <div className="nx-container">
        <div className="nx-testimonials__head">
          <motion.div {...reveal}>
            <span className="nx-eyebrow">Early reactions</span>
            <h2>People are already<br /><span className="nx-gradient-text">thinking differently.</span></h2>
          </motion.div>
          <span className="nx-badge nx-badge--sample">Sample content · illustrative</span>
        </div>

        <div className="nx-testimonials__grid">
          {TESTIMONIALS.map((item, index) => (
            <motion.figure className="nx-glass nx-quote" key={item.name} {...reveal} transition={{ ...reveal.transition, delay: index * 0.08 }}>
              <Quote size={24} className="nx-quote__mark" />
              <blockquote>“{item.quote}”</blockquote>
              <figcaption>
                <span className="nx-quote__avatar">{item.initials}</span>
                <span><strong>{item.name}</strong><small>{item.role}</small></span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section className="nx-section nx-faq" id="faq">
      <div className="nx-container nx-faq__grid">
        <motion.div {...reveal}>
          <span className="nx-eyebrow">Frequently asked questions</span>
          <h2>Good questions.<br /><span className="nx-gradient-text">Clear answers.</span></h2>
          <p className="nx-muted">Still curious? Create an account and explore everything for yourself.</p>
          <Link to="/register" className="nx-btn nx-btn--ghost nx-btn--sm">Get Started <ArrowRight size={15} /></Link>
        </motion.div>

        <div className="nx-faq__list">
          {FAQS.map((item, index) => {
            const isOpen = open === index;
            return (
              <div className={`nx-faq__item nx-glass ${isOpen ? 'is-open' : ''}`} key={item.q}>
                <button onClick={() => setOpen(isOpen ? -1 : index)} aria-expanded={isOpen}>
                  <span>{item.q}</span>
                  <ChevronDown size={18} className="nx-faq__chevron" />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28 }}
                    >
                      <p className="nx-muted">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="nx-final-cta">
      <div className="nx-container">
        <motion.div className="nx-final-cta__inner nx-glass" {...reveal}>
          <div className="nx-final-cta__orb"><AIOrb state="idle" compact /></div>
          <div>
            <span className="nx-eyebrow">Your move</span>
            <h2>Your intelligence<br /><span className="nx-gradient-text">is waiting.</span></h2>
            <p className="nx-muted">Create an account and step into a universe built around the way you think.</p>
            <div className="nx-final-cta__actions">
              <Link to="/register" className="nx-btn nx-btn--primary">Get Started <ArrowRight size={17} /></Link>
              <Link to="/login" className="nx-btn nx-btn--ghost">I already have an account</Link>
            </div>
          </div>
          <div className="nx-final-cta__points">
            <span><CheckCircle2 size={16} /> Free to explore</span>
            <span><CheckCircle2 size={16} /> Private by design</span>
            <span><CheckCircle2 size={16} /> No setup required</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function Landing() {
  return (
    <>
      <div className="nx-backdrop" aria-hidden="true">
        <div className="nx-backdrop__grid" />
        <div className="nx-backdrop__orb nx-backdrop__orb--one" />
        <div className="nx-backdrop__orb nx-backdrop__orb--two" />
        <div className="nx-backdrop__stars" />
      </div>
      <Navbar />
      <main>
        <Hero />
        <Discover />
        <Capabilities />
        <Explore />
        <HowItWorks />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
