import { useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import {
  ArrowUp,
  Check,
  Copy,
  Loader2,
  MessageSquarePlus,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import AIOrb from '../../components/three/AIOrb';
import { EmptyState, ErrorState, SetupNotice } from '../../components/common/States';
import { api, apiStream } from '../../lib/api';

function Message({ message, onCopy, onRegenerate, streaming }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const copy = async () => {
    await onCopy(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className={`nx-message nx-message--${isUser ? 'user' : 'assistant'}`}>
      {!isUser && <div className="nx-message__avatar"><span /></div>}
      <div className="nx-message__body">
        <div className="nx-message__meta">
          <strong>{isUser ? 'You' : 'AETHRA'}</strong>
          <time>{message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'now'}</time>
        </div>
        <div className="nx-message__content">
          {isUser ? <p>{message.content}</p> : (
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
              {message.content || '…'}
            </ReactMarkdown>
          )}
          {streaming && <span className="nx-message__cursor" />}
        </div>
        {!isUser && !streaming && message.content && (
          <div className="nx-message__actions">
            <button onClick={copy} title="Copy response">{copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}</button>
            {message.id && <button onClick={() => onRegenerate(message.id)} title="Regenerate response"><RefreshCw size={14} /> Regenerate</button>}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Chat() {
  const [params, setParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(params.get('conversation') || null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState('');
  const [error, setError] = useState('');
  const [listError, setListError] = useState('');
  const [aiConfigured, setAiConfigured] = useState(true);
  const textareaRef = useRef(null);
  const bottomRef = useRef(null);

  const loadConversations = useCallback(async () => {
    try {
      const data = await api('/chat/conversations');
      setConversations(data.conversations);
      setListError('');
      return data.conversations;
    } catch (err) {
      setListError(err.message);
      return [];
    }
  }, []);

  const loadMessages = useCallback(async (id) => {
    if (!id) { setMessages([]); return; }
    try {
      const data = await api(`/chat/conversations/${id}/messages`);
      setMessages(data.messages);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    loadConversations().then((list) => {
      if (!activeId && list.length) {
        const first = list[0].id;
        setActiveId(first);
        setParams({ conversation: String(first) }, { replace: true });
      }
    });
    api('/health').then((data) => setAiConfigured(data.aiConfigured)).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadMessages(activeId); }, [activeId, loadMessages]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, streamText]);

  const selectConversation = (id) => {
    setActiveId(id);
    setParams(id ? { conversation: String(id) } : {}, { replace: true });
  };

  const handleStreamEvent = (event, payload) => {
    if (event === 'start') {
      setActiveId(payload.conversationId);
      setParams({ conversation: String(payload.conversationId) }, { replace: true });
    }
    if (event === 'token') setStreamText((current) => current + payload.token);
    if (event === 'error') setError(payload.message || 'The response stream failed.');
    if (event === 'done') {
      setMessages((current) => [
        ...current.filter((message) => !message.pending),
        { id: payload.messageId, role: 'assistant', content: payload.content },
      ]);
      setStreamText('');
    }
  };

  const send = async () => {
    const content = input.trim();
    if (!content || streaming) return;

    setError('');
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setMessages((current) => [
      ...current,
      { role: 'user', content, createdAt: new Date().toISOString() },
      { role: 'assistant', content: '', pending: true },
    ]);
    setStreaming(true);
    setStreamText('');

    try {
      await apiStream('/chat/messages', {
        body: { content, conversationId: activeId || undefined },
        onEvent: handleStreamEvent,
      });
      await loadConversations();
    } catch (err) {
      if (err.code === 'AI_NOT_CONFIGURED') setAiConfigured(false);
      setError(err.message);
      setMessages((current) => current.filter((message) => !message.pending));
    } finally {
      setStreaming(false);
      setStreamText('');
    }
  };

  const regenerate = async (messageId) => {
    if (streaming) return;
    setError('');
    setStreaming(true);
    setStreamText('');
    setMessages((current) => current.filter((message) => message.id !== messageId));
    setMessages((current) => [...current, { role: 'assistant', content: '', pending: true }]);
    try {
      await apiStream(`/chat/regenerate/${messageId}`, { onEvent: handleStreamEvent });
      await loadMessages(activeId);
    } catch (err) {
      setError(err.message);
      await loadMessages(activeId);
    } finally {
      setStreaming(false);
      setStreamText('');
    }
  };

  const removeConversation = async (id) => {
    try {
      await api(`/chat/conversations/${id}`, { method: 'DELETE' });
      const list = await loadConversations();
      if (activeId === id) {
        selectConversation(list[0]?.id || null);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); } catch { /* clipboard unavailable */ }
  };

  return (
    <div className="nx-chat">
      <aside className="nx-chat__sidebar nx-glass">
        <button className="nx-btn nx-btn--primary nx-chat__new" onClick={() => selectConversation(null)}>
          <MessageSquarePlus size={17} /> New conversation
        </button>
        <div className="nx-chat__sidebar-label nx-mono">YOUR THREADS · {conversations.length}</div>
        <div className="nx-chat__conversations">
          {listError && <p className="nx-alert">{listError}</p>}
          {!listError && conversations.length === 0 && <p className="nx-muted nx-chat__no-threads">No conversations yet. Start one above.</p>}
          {conversations.map((conversation) => (
            <div className={`nx-chat__thread ${activeId === conversation.id ? 'is-active' : ''}`} key={conversation.id}>
              <button onClick={() => selectConversation(conversation.id)}>
                <span className="nx-dot" />
                <span><strong>{conversation.title}</strong><small>{conversation.last_message || 'Empty conversation'}</small></span>
              </button>
              <button className="nx-chat__thread-delete" onClick={() => removeConversation(conversation.id)} title="Delete conversation"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
        <div className="nx-chat__sidebar-orb"><AIOrb state={streaming ? 'processing' : 'idle'} compact /></div>
      </aside>

      <section className="nx-chat__workspace nx-glass">
        <header className="nx-chat__head">
          <div>
            <span className="nx-eyebrow">AI Chat</span>
            <h1>{conversations.find((c) => c.id === activeId)?.title || 'New conversation'}</h1>
          </div>
          <span className="nx-badge"><span className="nx-dot" /> {streaming ? 'Thinking' : 'Ready'}</span>
        </header>

        {!aiConfigured && <SetupNotice title="AI chat needs configuration" message="No AI provider key is set on the server, so AETHRA cannot generate a real reply." />}
        {error && <div className="nx-alert nx-chat__error">{error}</div>}

        <div className="nx-chat__messages">
          {messages.length === 0 && !streaming ? (
            <EmptyState
              icon={Sparkles}
              title="Ask anything."
              description="Brainstorm, write, debug, explore — AETHRA is listening."
            />
          ) : (
            messages.map((message, index) => (
              <Message
                key={message.id || `${index}-${message.role}`}
                message={message.pending ? { ...message, content: streamText } : message}
                onCopy={copy}
                onRegenerate={regenerate}
                streaming={message.pending}
              />
            ))
          )}
          <div ref={bottomRef} />
        </div>

        <div className="nx-chat__composer">
          <div className="nx-chat__composer-box">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              placeholder="Message AETHRA…"
              onChange={(event) => {
                setInput(event.target.value);
                event.target.style.height = 'auto';
                event.target.style.height = `${Math.min(event.target.scrollHeight, 180)}px`;
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  send();
                }
              }}
            />
            <button className="nx-chat__send" onClick={send} disabled={!input.trim() || streaming} aria-label="Send message">
              {streaming ? <Loader2 size={18} className="nx-spin" /> : <ArrowUp size={18} />}
            </button>
          </div>
          <span className="nx-chat__hint"><Send size={11} /> Enter to send · Shift+Enter for a new line</span>
        </div>
      </section>
    </div>
  );
}
