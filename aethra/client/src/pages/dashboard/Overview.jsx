import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  FolderHeart,
  Image as ImageIcon,
  MessageSquareText,
  Mic2,
  Plus,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/common/States';

const QUICK_ACTIONS = [
  { to: '/app/chat', label: 'Start a conversation', icon: MessageSquareText, tone: 'blue' },
  { to: '/app/images', label: 'Generate an image', icon: ImageIcon, tone: 'violet' },
  { to: '/app/voice', label: 'Talk to AETHRA', icon: Mic2, tone: 'cyan' },
  { to: '/app/creations', label: 'Browse creations', icon: FolderHeart, tone: 'rose' },
];

export default function Overview() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [usage, conversations, images, creations] = await Promise.all([
        api('/settings/usage'),
        api('/chat/conversations'),
        api('/images?limit=6'),
        api('/creations'),
      ]);
      setData({ usage, conversations: conversations.conversations, images: images.images, creations: creations.creations });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingState label="Opening your universe…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const { usage, conversations, images, creations } = data;
  const stats = [
    { label: 'Conversations', value: usage.counts.conversations, icon: MessageSquareText, tone: 'blue' },
    { label: 'Images generated', value: usage.counts.images, icon: ImageIcon, tone: 'violet' },
    { label: 'Saved creations', value: usage.counts.creations, icon: FolderHeart, tone: 'rose' },
    { label: 'Chat tokens used', value: usage.totals.find((t) => t.action === 'chat_message')?.units || 0, icon: Sparkles, tone: 'cyan' },
  ];

  const recentImages = images.filter((image) => image.status === 'completed').slice(0, 4);

  return (
    <div className="nx-overview">
      <PageHeader
        eyebrow="Overview"
        title={`Welcome back, ${user?.firstName || 'creator'}.`}
        description="Here's what's happening inside your universe."
        actions={<Link to="/app/chat" className="nx-btn nx-btn--primary"><Plus size={16} /> New conversation</Link>}
      />

      <section className="nx-overview__stats">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div className={`nx-glass nx-stat nx-stat--${stat.tone}`} key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
              <span className="nx-stat__icon"><Icon size={19} /></span>
              <strong>{stat.value.toLocaleString()}</strong>
              <span className="nx-stat__label">{stat.label}</span>
            </motion.div>
          );
        })}
      </section>

      <section className="nx-overview__quick">
        <h2>Quick actions</h2>
        <div className="nx-overview__quick-grid">
          {QUICK_ACTIONS.map(({ to, label, icon: Icon, tone }) => (
            <Link to={to} className={`nx-glass nx-quick nx-quick--${tone}`} key={label}>
              <Icon size={20} />
              <span>{label}</span>
              <ArrowRight size={16} className="nx-quick__arrow" />
            </Link>
          ))}
        </div>
      </section>

      <div className="nx-overview__columns">
        <section className="nx-glass nx-panel">
          <div className="nx-panel__head"><h2>Recent conversations</h2><Link to="/app/chat">View all <ArrowRight size={14} /></Link></div>
          {conversations.length === 0 ? (
            <EmptyState icon={MessageSquareText} title="No conversations yet" description="Ask AETHRA anything to begin your first thread." action={<Link to="/app/chat" className="nx-btn nx-btn--primary nx-btn--sm">Open AI Chat</Link>} />
          ) : (
            <div className="nx-list">
              {conversations.slice(0, 5).map((conversation) => (
                <Link to={`/app/chat?conversation=${conversation.id}`} className="nx-list__item" key={conversation.id}>
                  <span className="nx-list__icon"><MessageSquareText size={16} /></span>
                  <span className="nx-list__body"><strong>{conversation.title}</strong><small>{conversation.last_message || 'No messages yet'}</small></span>
                  <span className="nx-list__meta">{new Date(conversation.updated_at).toLocaleDateString()}</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="nx-glass nx-panel">
          <div className="nx-panel__head"><h2>Recent images</h2><Link to="/app/images">View studio <ArrowRight size={14} /></Link></div>
          {recentImages.length === 0 ? (
            <EmptyState icon={ImageIcon} title="Your canvas is clear" description="Generate an image and it will appear here." action={<Link to="/app/images" className="nx-btn nx-btn--ghost nx-btn--sm">Open Image Studio</Link>} />
          ) : (
            <div className="nx-overview__images">
              {recentImages.map((image) => (
                <Link to="/app/images" key={image.id} className="nx-overview__image" title={image.prompt}>
                  <img src={image.fileUrl} alt={image.prompt.slice(0, 60)} />
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="nx-glass nx-panel nx-overview__activity">
        <div className="nx-panel__head"><h2>Activity history</h2><Link to="/app/history">See all <ArrowRight size={14} /></Link></div>
        {usage.recent.length === 0 ? (
          <p className="nx-muted">No activity recorded yet.</p>
        ) : (
          <div className="nx-timeline">
            {usage.recent.slice(0, 6).map((item) => (
              <div className="nx-timeline__item" key={`${item.createdAt}-${item.id || item.action}`}>
                <span className={`nx-timeline__dot nx-timeline__dot--${item.action}`} />
                <div><strong>{item.action.replace('_', ' ')}</strong><small>{item.provider} · {item.amount} units</small></div>
                <time>{new Date(item.createdAt).toLocaleString()}</time>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
