import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookmarkPlus,
  Check,
  Download,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  Trash2,
  WandSparkles,
} from 'lucide-react';
import { EmptyState, ErrorState, LoadingState, PageHeader, SetupNotice } from '../../components/common/States';
import { api, downloadBlob } from '../../lib/api';

const STAGES = ['Preparing your prompt…', 'Contacting the image model…', 'Rendering pixels…', 'Finalising your image…'];

export default function ImageStudio() {
  const [config, setConfig] = useState(null);
  const [images, setImages] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [style, setStyle] = useState('cinematic');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [generating, setGenerating] = useState(false);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);

  const loadImages = useCallback(async () => {
    try {
      const data = await api('/images?limit=60');
      setImages(data.images);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    Promise.all([api('/images/config'), loadImages()])
      .then(([data]) => setConfig(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [loadImages]);

  useEffect(() => {
    if (!generating) return undefined;
    setStage(0);
    const timer = setInterval(() => setStage((current) => Math.min(current + 1, STAGES.length - 1)), 2200);
    return () => clearInterval(timer);
  }, [generating]);

  const generate = async (event) => {
    event.preventDefault();
    if (!prompt.trim() || generating) return;
    setError('');
    setNotice('');
    setGenerating(true);

    try {
      const data = await api('/images/generate', {
        method: 'POST',
        body: { prompt: prompt.trim(), negativePrompt: negativePrompt.trim() || undefined, style, aspectRatio },
      });
      setImages((current) => [data.image, ...current]);
      setNotice('Image generated and added to your history.');
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const download = async (image) => {
    try {
      const blob = await api(`/images/${image.id}/file`, { responseType: 'blob' });
      downloadBlob(blob, `aethra-${image.id}.png`);
    } catch (err) {
      setError(err.message);
    }
  };

  const save = async (image) => {
    try {
      await api(`/images/${image.id}/save`, { method: 'POST', body: {} });
      setImages((current) => current.map((item) => item.id === image.id ? { ...item, isSaved: true } : item));
      setNotice('Saved to My Creations.');
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (image) => {
    try {
      await api(`/images/${image.id}`, { method: 'DELETE' });
      setImages((current) => current.filter((item) => item.id !== image.id));
      setNotice('Image removed from history.');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <LoadingState label="Opening the studio…" />;

  return (
    <div className="nx-studio">
      <PageHeader
        eyebrow="Image Studio"
        title="Every idea deserves a visual."
        description="Describe what you imagine, choose a style, and let the model bring it into focus."
      />

      {error && <div className="nx-alert nx-studio__error">{error}</div>}
      {notice && <div className="nx-alert nx-alert--success nx-studio__error">{notice}</div>}

      {config && !config.configured && (
        <SetupNotice
          title="Image generation is not connected"
          message="No image provider key is configured on the server. Generation is disabled until credentials are added."
          icon={ImageIcon}
        />
      )}

      <div className="nx-studio__grid">
        <form className="nx-glass nx-studio__editor" onSubmit={generate}>
          <div className="nx-studio__editor-head"><WandSparkles size={19} /><h2>Prompt studio</h2></div>

          <label className="nx-field">
            <span className="nx-label">Your prompt</span>
            <textarea className="nx-textarea nx-studio__prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="A luminous holographic orb floating above a midnight ocean, cinematic lighting, ultra detailed…" rows={6} required />
          </label>

          <label className="nx-field">
            <span className="nx-label">Negative prompt <small>(optional)</small></span>
            <input className="nx-input" value={negativePrompt} onChange={(e) => setNegativePrompt(e.target.value)} placeholder="blurry, text, watermark" />
          </label>

          <label className="nx-field">
            <span className="nx-label">Visual style</span>
            <select className="nx-select" value={style} onChange={(e) => setStyle(e.target.value)}>
              {(config?.styles || ['cinematic']).map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>

          <div className="nx-field">
            <span className="nx-label">Aspect ratio</span>
            <div className="nx-studio__ratios">
              {(config?.aspectRatios || ['1:1']).map((ratio) => (
                <button type="button" key={ratio} className={aspectRatio === ratio ? 'is-active' : ''} onClick={() => setAspectRatio(ratio)}>{ratio}</button>
              ))}
            </div>
          </div>

          <button className="nx-btn nx-btn--primary nx-studio__generate" disabled={generating || !config?.configured || !prompt.trim()}>
            {generating ? <><Loader2 size={17} className="nx-spin" /> Generating…</> : <><Sparkles size={17} /> Generate Image</>}
          </button>

          {generating && (
            <div className="nx-studio__progress">
              <div className="nx-studio__progress-bar"><i /></div>
              <span className="nx-mono">{STAGES[stage]}</span>
            </div>
          )}

          <div className="nx-studio__provider nx-mono">
            PROVIDER: {config?.provider || '—'} · MODEL: {config?.model || '—'}
          </div>
        </form>

        <section className="nx-glass nx-studio__gallery">
          <div className="nx-panel__head"><h2>Generated gallery</h2><span className="nx-badge">{images.length} images</span></div>
          {images.length === 0 ? (
            <EmptyState icon={ImageIcon} title="Nothing here yet" description="Your generated images will appear in this gallery." />
          ) : (
            <div className="nx-studio__tiles">
              {images.map((image, index) => (
                <motion.article className={`nx-studio__tile ${image.status === 'failed' ? 'is-failed' : ''}`} key={image.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.04, 0.4) }}>
                  {image.status === 'completed' ? (
                    <img src={image.fileUrl} alt={image.prompt.slice(0, 80)} loading="lazy" />
                  ) : (
                    <div className="nx-studio__tile-failed"><Trash2 size={24} /><span>{image.errorMessage || 'Generation failed'}</span></div>
                  )}
                  <div className="nx-studio__tile-overlay">
                    <p>{image.prompt}</p>
                    <div className="nx-studio__tile-actions">
                      {image.status === 'completed' && <>
                        <button onClick={() => download(image)} title="Download"><Download size={15} /></button>
                        <button onClick={() => save(image)} title={image.isSaved ? 'Saved' : 'Save to creations'}>{image.isSaved ? <Check size={15} /> : <BookmarkPlus size={15} />}</button>
                      </>}
                      <button onClick={() => remove(image)} title="Delete"><Trash2 size={15} /></button>
                    </div>
                  </div>
                  <span className="nx-studio__tile-tag nx-mono">{image.aspectRatio} · {image.style}</span>
                </motion.article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
