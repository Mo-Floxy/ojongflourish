import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Image as ImageIcon, MessageSquareText, Mic2, Sparkles, WandSparkles } from 'lucide-react';

const TABS = [
  {
    id: 'chat',
    label: 'AI Chat',
    icon: MessageSquareText,
    title: 'A conversation that keeps up with you',
    description: 'Ask anything, iterate on ideas, and keep every thread organised in one intelligent workspace.',
  },
  {
    id: 'images',
    label: 'Image Studio',
    icon: ImageIcon,
    title: 'Turn a thought into a visual',
    description: 'Describe the scene, choose a style, and let the studio render it in the ratio you need.',
  },
  {
    id: 'voice',
    label: 'Voice',
    icon: Mic2,
    title: 'Talk to your intelligence',
    description: 'Speak naturally, listen to replies, and move between typing and talking without losing context.',
  },
  {
    id: 'library',
    label: 'My Creations',
    icon: Sparkles,
    title: 'Everything you made, in one place',
    description: 'Search, save, download and revisit your best work whenever inspiration strikes again.',
  },
];

function ChatPreview() {
  return (
    <div className="nx-preview-chat">
      <div className="nx-preview-chat__head">
        <span className="nx-dot" /> Strategy session
      </div>
      <div className="nx-preview-chat__body">
        <div className="nx-preview-bubble nx-preview-bubble--user">Help me name a futuristic AI platform.</div>
        <div className="nx-preview-bubble nx-preview-bubble--ai">
          <WandSparkles size={14} /> <strong>AETHRA</strong> — from “nexus” and “aurora”.<br />
          <span className="nx-muted">Your intelligence. Without limits.</span>
        </div>
        <div className="nx-preview-typing"><i /><i /><i /></div>
      </div>
    </div>
  );
}

function ImagePreview() {
  return (
    <div className="nx-preview-images">
      <div className="nx-preview-images__prompt">
        <ImageIcon size={15} /> “A luminous orb suspended in a midnight nebula, holographic rings…”
      </div>
      <div className="nx-preview-images__grid">
        <div className="nx-preview-images__tile nx-preview-images__tile--one"><span>01</span></div>
        <div className="nx-preview-images__tile nx-preview-images__tile--two"><span>02</span></div>
        <div className="nx-preview-images__tile nx-preview-images__tile--three"><span>03</span></div>
        <div className="nx-preview-images__tile nx-preview-images__tile--four"><span>04</span></div>
      </div>
    </div>
  );
}

function VoicePreview() {
  return (
    <div className="nx-preview-voice">
      <div className="nx-preview-voice__orb"><Mic2 size={30} /></div>
      <div className="nx-preview-voice__wave">
        {Array.from({ length: 34 }).map((_, index) => (
          <i key={index} style={{ '--h': `${12 + Math.abs(Math.sin(index * 0.7)) * 52}px`, '--d': `${index * 0.035}s` }} />
        ))}
      </div>
      <span className="nx-mono">LISTENING · 00:04</span>
    </div>
  );
}

function LibraryPreview() {
  return (
    <div className="nx-preview-library">
      <div className="nx-preview-library__search">⌕ &nbsp; Search your creations…</div>
      <div className="nx-preview-library__row">
        {['Aurora Bloom', 'Signal Drift', 'Neural Sea', 'Solar Script'].map((name, index) => (
          <div className="nx-preview-library__item" key={name}>
            <div className={`nx-preview-library__thumb nx-preview-library__thumb--${index + 1}`} />
            <span>{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const PREVIEWS = {
  chat: ChatPreview,
  images: ImagePreview,
  voice: VoicePreview,
  library: LibraryPreview,
};

export default function FeatureTabs() {
  const [active, setActive] = useState('chat');
  const tab = TABS.find((item) => item.id === active);
  const Preview = PREVIEWS[active];

  return (
    <div className="nx-feature-tabs">
      <div className="nx-feature-tabs__list" role="tablist" aria-label="Explore AETHRA features">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={active === id}
            className={`nx-feature-tabs__tab ${active === id ? 'is-active' : ''}`}
            onClick={() => setActive(id)}
          >
            <Icon size={17} /> {label}
          </button>
        ))}
      </div>

      <div className="nx-feature-tabs__panel nx-glass">
        <span className="nx-badge">Illustrative preview</span>
        <h3>{tab.title}</h3>
        <p className="nx-muted">{tab.description}</p>
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
          >
            <Preview />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
