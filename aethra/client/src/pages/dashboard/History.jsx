import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Image as ImageIcon,
  MessageSquareText,
  Mic2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/common/States';
import { api } from '../../lib/api';

const ACTION_META = {
  chat_message: { label: 'Chat message', icon: MessageSquareText, tone: 'blue', unit: 'tokens' },
  image_generation: { label: 'Image generated', icon: ImageIcon, tone: 'violet', unit: 'images' },
  voice_session: { label: 'Voice session', icon: Mic2, tone: 'cyan', unit: 'seconds' },
};

const FILTERS = [
  { value: 'all', label: 'All activity' },
  { value: 'chat_message', label: 'Chat' },
  { value: 'image_generation', label: 'Images' },
  { value: 'voice_session', label: 'Voice' },
];

export default function History() {
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await api('/settings/usage'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const totals = useMemo(() => {
    if (!data?.totals) return [];
    return data.totals.map((item) => ({ ...item, meta: ACTION_META[item.action] || {} }));
  }, [data]);

  const recent = useMemo(() => {
    if (!data?.recent) return [];
    return filter === 'all' ? data.recent : data.recent.filter((item) => item.action === filter);
  }, [data, filter]);

  if (loading) return <LoadingState label="Reading your activity…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="nx-history">
      <PageHeader
        eyebrow="History"
        title="Everything you've created."
        description="A private record of your conversations, generated images and voice sessions."
        actions={
          <button className="nx-btn nx-btn--ghost nx-btn--sm" onClick={load}>
            <RefreshCw size={15} /> Refresh
          </button>
        }
      />

      <section className="nx-history__summary">
        {totals.length === 0 ? (
          <div className="nx-glass nx-panel"><p className="nx-muted">No activity has been recorded yet.</p></div>
        ) : totals.map((item, index) => {
          const Icon = item.meta.icon || Activity;
          return (
            <motion.article
              className="nx-glass nx-history__card"
              key={item.action}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <span className={`nx-history__icon nx-history__icon--${item.meta.tone || 'blue'}`}><Icon size={19} /></span>
              <div>
                <strong>{Number(item.units || 0).toLocaleString()}</strong>
                <span>{item.meta.unit || 'units'} · {item.sessions} sessions</span>
              </div>
              <h3>{item.meta.label || item.action}</h3>
            </motion.article>
          );
        })}
      </section>

      <section className="nx-glass nx-panel nx-history__panel">
        <div className="nx-panel__head">
          <div>
            <h2>Activity log</h2>
            <p className="nx-muted">Latest 30 records from your workspace</p>
          </div>
          <span className="nx-badge">{recent.length} shown</span>
        </div>

        <div className="nx-history__filters" role="group" aria-label="Filter activity">
          {FILTERS.map((option) => (
            <button
              type="button"
              key={option.value}
              className={filter === option.value ? 'is-active' : ''}
              onClick={() => setFilter(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        {recent.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="Nothing in this view yet"
            description="Use AETHRA and your activity will appear here automatically."
            action={<Link className="nx-btn nx-btn--primary nx-btn--sm" to="/app/chat">Start a conversation</Link>}
          />
        ) : (
          <div className="nx-history__table-wrap">
            <table className="nx-history__table">
              <thead>
                <tr>
                  <th>Activity</th>
                  <th>Provider</th>
                  <th>Model</th>
                  <th className="nx-history__num">Units</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((item, index) => {
                  const meta = ACTION_META[item.action] || {};
                  const Icon = meta.icon || Activity;
                  return (
                    <tr key={`${item.action}-${item.createdAt}-${index}`}>
                      <td>
                        <span className="nx-history__row-label">
                          <Icon size={15} /> {meta.label || item.action.replace('_', ' ')}
                        </span>
                      </td>
                      <td><span className="nx-mono">{item.provider || '—'}</span></td>
                      <td><span className="nx-mono">{item.model || '—'}</span></td>
                      <td className="nx-history__num">{Number(item.amount || 0).toLocaleString()}</td>
                      <td>{new Date(item.createdAt).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {data?.counts && (
        <section className="nx-history__counts">
          <span><strong>{data.counts.conversations}</strong> conversations</span>
          <span><strong>{data.counts.images}</strong> images generated</span>
          <span><strong>{data.counts.creations}</strong> saved creations</span>
        </section>
      )}
    </div>
  );
}
