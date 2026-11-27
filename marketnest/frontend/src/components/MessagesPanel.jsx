import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Search, Send, Store } from "lucide-react";
import { messages as seedThreads } from "../data/mock";
import Avatar from "./Avatar";
import Thumb from "./Thumb";
import { useToast } from "../context/ToastContext";

export default function MessagesPanel({ vendor = false }) {
  const [threads, setThreads] = useState(seedThreads);
  const [selectedId, setSelectedId] = useState(seedThreads[0]?.id);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [mobileThread, setMobileThread] = useState(false);
  const endRef = useRef(null);
  const toast = useToast();

  const filtered = useMemo(
    () =>
      threads.filter((thread) =>
        thread.business.name.toLowerCase().includes(search.toLowerCase())
      ),
    [threads, search]
  );

  const selected = threads.find((thread) => thread.id === selectedId) || filtered[0];

  useEffect(() => {
    if (selected?.messages.length) {
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [selected?.id, selected?.messages.length]);

  function openThread(id) {
    setSelectedId(id);
    setMobileThread(true);
    setThreads((current) =>
      current.map((thread) => (thread.id === id ? { ...thread, unread: 0 } : thread))
    );
  }

  async function send(event) {
    event.preventDefault();
    if (!draft.trim() || !selected) return;
    setSending(true);
    const body = draft.trim();
    await new Promise((resolve) => setTimeout(resolve, 350));
    setThreads((current) =>
      current.map((thread) =>
        thread.id === selected.id
          ? {
              ...thread,
              last_message: body,
              last_at: "now",
              messages: [
                ...thread.messages,
                { id: Date.now(), from: "me", body, at: "Just now" },
              ],
            }
          : thread
      )
    );
    setDraft("");
    setSending(false);
    toast.success("Message sent", `${selected.business.name} has been notified.`);
  }

  return (
    <div className={`messages-layout ${mobileThread ? "show-thread" : ""}`}>
      <div className="threads-pane panel">
        <div className="threads-head">
          <div>
            <span className="eyebrow">{vendor ? "Customers" : "Your conversations"}</span>
            <h2>Messages</h2>
          </div>
          <span className="pill">{threads.reduce((sum, t) => sum + t.unread, 0)} unread</span>
        </div>
        <div className="toolbar-search" style={{ width: "100%", marginBottom: 14 }}>
          <Search size={16} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={vendor ? "Search customers" : "Search shops"}
            aria-label="Search conversations"
          />
        </div>
        <div className="thread-list">
          {filtered.length ? (
            filtered.map((thread) => (
              <button
                type="button"
                key={thread.id}
                className={`thread-item ${selected?.id === thread.id ? "active" : ""}`}
                onClick={() => openThread(thread.id)}
              >
                <Avatar name={thread.business.name} size={42} />
                <span className="info">
                  <strong>{vendor ? `Order #${thread.id}210` : thread.business.name}</strong>
                  <small>{thread.last_message}</small>
                </span>
                <span className="thread-meta">
                  <small>{thread.last_at}</small>
                  {thread.unread > 0 && <span className="unread-dot">{thread.unread}</span>}
                </span>
              </button>
            ))
          ) : (
            <p className="tiny text-center" style={{ padding: 24 }}>No conversations found.</p>
          )}
        </div>
      </div>

      <div className="conversation-pane panel">
        {selected ? (
          <>
            <div className="conversation-head">
              <button
                type="button"
                className="nav-icon thread-back"
                aria-label="Back to conversations"
                onClick={() => setMobileThread(false)}
              >
                <ArrowLeft size={18} />
              </button>
              <div className="d-flex align-items-center gap-2">
                <div style={{ width: 40, height: 40, borderRadius: "50%", overflow: "hidden" }}>
                  <Thumb src={selected.business.logo} alt={selected.business.name} mark={selected.business.name[0]} />
                </div>
                <div>
                  <strong>{vendor ? `Customer · ${selected.business.name}` : selected.business.name}</strong>
                  <div className="tiny"><Store size={11} /> {selected.business.city} · Usually replies within a day</div>
                </div>
              </div>
            </div>
            <div className="conversation-body">
              <div className="conversation-note">
                {vendor
                  ? "Replies you send here are visible to the customer."
                  : `This conversation is with ${selected.business.name}. Please be kind and clear.`}
              </div>
              {selected.messages.map((message) => (
                <div className={`bubble-row ${message.from === "me" ? "mine" : ""}`} key={message.id}>
                  <div className="bubble">{message.body}</div>
                  <small>{message.at}</small>
                </div>
              ))}
              <div ref={endRef} />
            </div>
            <form className="conversation-form" onSubmit={send}>
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={`Message ${vendor ? "customer" : selected.business.name}…`}
                aria-label="Your message"
              />
              <button type="submit" className="mn-btn sm" disabled={sending || !draft.trim()}>
                <Send size={15} />
              </button>
            </form>
          </>
        ) : (
          <div className="empty-state">
            <h3>Select a conversation</h3>
            <p>Choose a chat on the left to see the messages.</p>
          </div>
        )}
      </div>
    </div>
  );
}
