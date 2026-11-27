import { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowUp, Mic, MicOff, Square, Volume2, VolumeX } from 'lucide-react';
import AIOrb from '../../components/three/AIOrb';
import { PageHeader, SetupNotice } from '../../components/common/States';
import { api, apiStream } from '../../lib/api';

const SpeechRecognition = typeof window !== 'undefined'
  ? window.SpeechRecognition || window.webkitSpeechRecognition
  : null;

export default function VoiceAssistant() {
  const [state, setState] = useState('idle');
  const [transcript, setTranscript] = useState('');
  const [reply, setReply] = useState('');
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [preferences, setPreferences] = useState(null);
  const [aiConfigured, setAiConfigured] = useState(true);
  const recognitionRef = useRef(null);
  const startedAt = useRef(null);

  useEffect(() => {
    api('/settings').then((data) => setPreferences(data.preferences)).catch(() => {});
    api('/health').then((data) => setAiConfigured(data.aiConfigured)).catch(() => {});
    return () => {
      recognitionRef.current?.abort?.();
      window.speechSynthesis?.cancel();
    };
  }, []);

  const speak = useCallback((text) => {
    if (!('speechSynthesis' in window) || !preferences?.voiceEnabled) {
      setState('idle');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[#*`_>]/g, '').slice(0, 1200));
    utterance.rate = preferences.voiceRate || 1;
    utterance.pitch = preferences.voicePitch || 1;
    if (preferences.voiceName && preferences.voiceName !== 'default') {
      const voice = window.speechSynthesis.getVoices().find((item) => item.name === preferences.voiceName);
      if (voice) utterance.voice = voice;
    }
    utterance.onstart = () => setState('speaking');
    utterance.onend = () => setState('idle');
    utterance.onerror = () => setState('idle');
    window.speechSynthesis.speak(utterance);
  }, [preferences]);

  const respond = useCallback(async (text) => {
    const clean = text.trim();
    if (!clean) return;

    setTranscript(clean);
    setHistory((current) => [...current, { role: 'user', content: clean }]);
    setState('processing');
    setError('');
    setReply('');
    startedAt.current = Date.now();

    try {
      let full = '';
      await apiStream('/chat/messages', {
        body: { content: clean },
        onEvent: (event, payload) => {
          if (event === 'token') {
            full += payload.token;
            setReply(full);
          }
          if (event === 'error') setError(payload.message);
          if (event === 'done') {
            full = payload.content;
            setReply(full);
            setHistory((current) => [...current, { role: 'assistant', content: full }]);
          }
        },
      });
      await api('/voice/sessions', { method: 'POST', body: { durationSec: Math.max(1, (Date.now() - startedAt.current) / 1000) } }).catch(() => {});
      if (full) speak(full);
      else setState('idle');
    } catch (err) {
      setError(err.message);
      setState('idle');
    }
  }, [speak]);

  const startListening = () => {
    setError('');
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser. You can still type below.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setTranscript('');
      setState('listening');
      window.speechSynthesis?.cancel();
    };
    recognition.onresult = (event) => {
      let text = '';
      for (let i = 0; i < event.results.length; i += 1) text += event.results[i][0].transcript;
      setTranscript(text);
      if (event.results[event.results.length - 1].isFinal) recognition.stop();
    };
    recognition.onerror = (event) => {
      const messages = {
        'not-allowed': 'Microphone permission was denied. Allow access in your browser settings and try again.',
        'no-speech': 'No speech was detected. Try again or type your message.',
        network: 'Speech recognition needs a network connection.',
      };
      setError(messages[event.error] || `Microphone error: ${event.error}`);
      setState('idle');
    };
    recognition.onend = () => {
      const finalText = recognitionRef.current?.__final || transcript;
      recognitionRef.current = null;
      if (finalText.trim()) respond(finalText);
      else setState('idle');
    };

    recognition.onspeechend = () => recognition.stop();
    recognition.start();
  };

  // Keep the latest committed transcript available to the onend callback.
  useEffect(() => {
    if (recognitionRef.current) recognitionRef.current.__final = transcript;
  }, [transcript]);

  const stopAll = () => {
    recognitionRef.current?.stop?.();
    recognitionRef.current = null;
    window.speechSynthesis?.cancel();
    setState('idle');
  };

  const statusLabel = {
    idle: 'Ready when you are',
    listening: 'Listening… speak naturally',
    processing: 'Processing your request…',
    speaking: 'Speaking…',
  }[state];

  return (
    <div className="nx-voice">
      <PageHeader
        eyebrow="Voice Assistant"
        title="Talk to your intelligence."
        description="Use your microphone, or type if you prefer. AETHRA replies with voice and text."
      />

      {error && <div className="nx-alert nx-voice__error">{error}</div>}
      {!aiConfigured && <SetupNotice title="AI chat needs configuration" message="Voice responses use the same AI provider as chat. Add server credentials to enable replies." />}
      {!SpeechRecognition && (
        <div className="nx-alert nx-alert--info">Live microphone recognition is not available in this browser. The text fallback below works everywhere.</div>
      )}

      <div className="nx-voice__stage nx-glass">
        <div className="nx-voice__states">
          <span className={state === 'listening' ? 'is-active' : ''}><Mic size={13} /> Listening</span>
          <span className={state === 'processing' ? 'is-active' : ''}>Processing</span>
          <span className={state === 'speaking' ? 'is-active' : ''}><Volume2 size={13} /> Speaking</span>
        </div>
        <div className="nx-voice__orb"><AIOrb state={state} /></div>
        <div className="nx-voice__status">
          <span className={`nx-dot ${state !== 'idle' ? 'is-pulsing' : ''}`} />
          <strong>{statusLabel}</strong>
        </div>
        <div className="nx-voice__controls">
          <button className={`nx-btn ${state === 'listening' ? 'nx-btn--ghost' : 'nx-btn--primary'}`} onClick={startListening} disabled={state !== 'idle' || !aiConfigured}>
            {state === 'listening' ? <MicOff size={17} /> : <Mic size={17} />} {state === 'listening' ? 'Stop listening' : 'Start speaking'}
          </button>
          <button className="nx-btn nx-btn--ghost" onClick={stopAll} disabled={state === 'idle'}><Square size={15} /> Stop</button>
          <button className="nx-btn nx-btn--icon" onClick={() => { window.speechSynthesis?.cancel(); setState('idle'); }} title="Stop speaking"><VolumeX size={17} /></button>
        </div>
      </div>

      <div className="nx-voice__transcript nx-glass">
        <span className="nx-label">You said</span>
        <p>{transcript || 'Your words will appear here…'}</p>
      </div>

      <div className="nx-voice__reply nx-glass">
        <span className="nx-label">AETHRA</span>
        {reply ? <div className="nx-markdown"><ReactMarkdown remarkPlugins={[remarkGfm]}>{reply}</ReactMarkdown></div> : <p className="nx-muted">The response will stream here and then be spoken aloud.</p>}
      </div>

      <form className="nx-voice__fallback" onSubmit={(event) => { event.preventDefault(); respond(input); setInput(''); }}>
        <input className="nx-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Or type your message…" disabled={state === 'processing'} />
        <button className="nx-btn nx-btn--primary nx-btn--icon" disabled={!input.trim() || state === 'processing'} aria-label="Send"><ArrowUp size={18} /></button>
      </form>

      {history.length > 0 && (
        <section className="nx-glass nx-panel nx-voice__history">
          <div className="nx-panel__head"><h2>Session transcript</h2><span className="nx-badge">{history.length} turns</span></div>
          <div className="nx-voice__history-list">
            {history.map((item, index) => <p key={index}><strong>{item.role === 'user' ? 'You' : 'AETHRA'}:</strong> {item.content}</p>)}
          </div>
        </section>
      )}
    </div>
  );
}
