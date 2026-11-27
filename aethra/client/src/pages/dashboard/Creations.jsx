import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, FolderHeart, Heart, Search, Trash2, X } from 'lucide-react';
import { EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/common/States';
import { api, downloadBlob } from '../../lib/api';

export default function Creations() {
  const [creations, setCreations] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api(`/creations?search=${encodeURIComponent(search)}`);
      setCreations(data.creations);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [load]);

  const download = async (creation) => {
    try {
      const blob = await api(`/images/${creation.imageId}/file`, { responseType: 'blob' });
      downloadBlob(blob, `${creation.title.slice(0, 40).replace(/[^\w-]+/g, '-') || 'aethra'}.png`);
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (creation) => {
    try {
      await api(`/creations/${creation.id}`, { method: 'DELETE' });
      setCreations((current) => current.filter((item) => item.id !== creation.id));
      setSelected(null);
      setNotice('Creation removed from your library.');
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleFavourite = async (creation) => {
    try {
      const data = await api(`/creations/${creation.id}`, { method: 'PATCH', body: { isFavourite: !creation.isFavourite } });
      setCreations((current) => current.map((item) => item.id === creation.id ? data.creation : item));
      setSelected((current) => current?.id === creation.id ? data.creation : current);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="nx-creations">
      <PageHeader
        eyebrow="My Creations"
        title="Your visual library."
        description="Every image you chose to keep, searchable and ready to revisit."
        actions={
          <label className="nx-search"><Search size={16} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search creations…" />
          </label>
        }
      />

      {error && <div className="nx-alert">{error}</div>}
      {notice && <div className="nx-alert nx-alert--success">{notice}</div>}

      {loading ? <LoadingState label="Loading your library…" /> : error ? <ErrorState message={error} onRetry={load} /> : (
        creations.length === 0 ? (
          <div className="nx-glass nx-panel"><EmptyState icon={FolderHeart} title={search ? 'No matches found' : 'Your library is empty'} description={search ? 'Try another search term.' : 'Save images from Image Studio and they will live here.'} /></div>
        ) : (
          <div className="nx-creations__grid">
            {creations.map((creation, index) => (
              <motion.article className="nx-glass nx-creation" key={creation.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.04, 0.4) }}>
                <button className="nx-creation__image" onClick={() => setSelected(creation)}>
                  <img src={creation.fileUrl} alt={creation.title} loading="lazy" />
                </button>
                <div className="nx-creation__body">
                  <div><strong>{creation.title}</strong><small>{creation.style} · {creation.aspectRatio}</small></div>
                  <div className="nx-creation__actions">
                    <button onClick={() => toggleFavourite(creation)} title="Favourite" className={creation.isFavourite ? 'is-favourite' : ''}><Heart size={15} fill={creation.isFavourite ? 'currentColor' : 'none'} /></button>
                    <button onClick={() => download(creation)} title="Download"><Download size={15} /></button>
                    <button onClick={() => remove(creation)} title="Remove"><Trash2 size={15} /></button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )
      )}

      <AnimatePresence>
        {selected && (
          <motion.div className="nx-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)}>
            <motion.div className="nx-modal__panel nx-glass" initial={{ scale: 0.96, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96 }} onClick={(e) => e.stopPropagation()}>
              <button className="nx-modal__close nx-btn nx-btn--icon" onClick={() => setSelected(null)}><X size={18} /></button>
              <img src={selected.fileUrl} alt={selected.title} />
              <div className="nx-modal__details">
                <span className="nx-eyebrow">Creation details</span>
                <h2>{selected.title}</h2>
                <p className="nx-muted">{selected.prompt}</p>
                <dl>
                  <div><dt>Style</dt><dd>{selected.style}</dd></div>
                  <div><dt>Ratio</dt><dd>{selected.aspectRatio}</dd></div>
                  <div><dt>Saved</dt><dd>{new Date(selected.createdAt).toLocaleString()}</dd></div>
                  <div><dt>Status</dt><dd>{selected.status}</dd></div>
                </dl>
                {selected.notes && <p className="nx-muted">{selected.notes}</p>}
                <div className="nx-modal__actions">
                  <button className="nx-btn nx-btn--primary nx-btn--sm" onClick={() => download(selected)}><Download size={15} /> Download</button>
                  <button className="nx-btn nx-btn--ghost nx-btn--sm" onClick={() => toggleFavourite(selected)}><Heart size={15} /> {selected.isFavourite ? 'Unfavourite' : 'Favourite'}</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
