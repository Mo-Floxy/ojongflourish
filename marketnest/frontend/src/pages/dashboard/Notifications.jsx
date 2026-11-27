import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, BellRing, Check, CheckCheck, MessageCircle, Package, Sparkles, Star, Store, Trash2 } from "lucide-react";
import EmptyState from "../../components/EmptyState";
import { useToast } from "../../context/ToastContext";
import { notifications as seedNotifications } from "../../data/mock";

const typeIcons = {
  order: Package,
  message: MessageCircle,
  review: Star,
  shop: Store,
  system: Sparkles,
};

const filters = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
];

export default function Notifications() {
  const toast = useToast();
  const [items, setItems] = useState(seedNotifications);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    document.title = "Notifications · Marketnest";
  }, []);

  const unread = items.filter((item) => !item.read).length;
  const read = items.length - unread;
  const visible = items.filter((item) =>
    filter === "all" ? true : filter === "unread" ? !item.read : item.read
  );

  function markRead(id) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, read: true } : item)));
    toast.info("Marked as read", "This notification is now in your read list.");
  }

  function markAllRead() {
    setItems((current) => current.map((item) => ({ ...item, read: true })));
    toast.success("All caught up", "Every notification has been marked as read.");
  }

  function clearRead() {
    const count = read;
    setItems((current) => current.filter((item) => !item.read));
    setFilter(filter === "read" ? "all" : filter);
    toast.success("Read notifications cleared", `${count} ${count === 1 ? "notification" : "notifications"} removed.`);
  }

  return (
    <>
      <header className="dash-header">
        <div>
          <span className="eyebrow">What&apos;s new</span>
          <h1>Notifications</h1>
          <p>
            {unread
              ? `You have ${unread} unread ${unread === 1 ? "update" : "updates"}.`
              : "You're all caught up with your Marketnest updates."}
          </p>
        </div>
        <div className="dash-actions">
          <button type="button" className="mn-btn ghost" onClick={markAllRead} disabled={!unread}>
            <CheckCheck size={15} /> Mark all read
          </button>
          <button type="button" className="mn-btn ghost dash-danger-outline" onClick={clearRead} disabled={!read}>
            <Trash2 size={15} /> Clear read
          </button>
        </div>
      </header>

      <section className="panel dash-notifications-panel">
        <div className="results-toolbar">
          <div className="chip-row" aria-label="Filter notifications">
            {filters.map((option) => {
              const count = option.value === "all" ? items.length : option.value === "unread" ? unread : read;
              return (
                <button
                  type="button"
                  key={option.value}
                  className={`chip ${filter === option.value ? "active" : ""}`}
                  onClick={() => setFilter(option.value)}
                  aria-pressed={filter === option.value}
                >
                  {option.label} <span className="dash-chip-count">{count}</span>
                </button>
              );
            })}
          </div>
          {unread > 0 && <span className="pill clay"><BellRing size={12} /> {unread} new</span>}
        </div>

        {visible.length ? (
          <div className="dash-notification-list">
            {visible.map((item) => {
              const Icon = typeIcons[item.type] || Bell;
              return (
                <article className={`dash-notification ${item.read ? "" : "unread"}`} key={item.id}>
                  <span className={`dash-notification-icon dash-icon-${item.type}`}>
                    <Icon size={19} />
                  </span>
                  <div className="dash-notification-body">
                    <div className="dash-notification-title">
                      <strong>{item.title}</strong>
                      {!item.read && <span className="dash-unread-dot" aria-label="Unread" />}
                    </div>
                    <p className="tiny mb-1">{item.body}</p>
                    <span className="tiny dash-notification-time">{item.at}</span>
                  </div>
                  {!item.read && (
                    <button
                      type="button"
                      className="table-icon-btn"
                      aria-label={`Mark "${item.title}" as read`}
                      onClick={() => markRead(item.id)}
                    >
                      <Check size={15} />
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Bell}
            title={items.length ? "Nothing here" : "No notifications"}
            text={
              items.length
                ? filter === "unread"
                  ? "You've read everything. Nice work!"
                  : "There are no read notifications to show."
                : "When there's news about your orders, shops or messages, you'll find it here."
            }
            action={
              <Link to="/marketplace" className="mn-btn sm">Explore marketplace</Link>
            }
          />
        )}
      </section>
    </>
  );
}
