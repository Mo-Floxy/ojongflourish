import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  ChevronRight,
  Heart,
  MessageCircle,
  Package,
  Sparkles,
  Store,
  UserRound,
} from "lucide-react";
import Avatar from "../../components/Avatar";
import ProductCard from "../../components/ProductCard";
import StatusPill from "../../components/StatusPill";
import { useAuth } from "../../context/AuthContext";
import { useFavourites } from "../../context/FavouritesContext";
import {
  following as seedFollowing,
  messages as seedMessages,
  orders,
  products,
  user as seedUser,
} from "../../data/mock";
import { formatDate, money, plural } from "../../lib/format";

const quickLinks = [
  { to: "/dashboard/profile", label: "My profile", hint: "Update your details", icon: UserRound },
  { to: "/dashboard/orders", label: "Your orders", hint: "Track your purchases", icon: Package },
  { to: "/dashboard/favourites", label: "Saved finds", hint: "Things you love", icon: Heart },
  { to: "/dashboard/following", label: "Following", hint: "Shops you follow", icon: Store },
  { to: "/dashboard/messages", label: "Messages", hint: "Talk to makers", icon: MessageCircle },
  { to: "/dashboard/notifications", label: "Notifications", hint: "Latest updates", icon: Bell },
];

export default function Overview() {
  const { user } = useAuth();
  const favourites = useFavourites();
  const account = user || seedUser;

  useEffect(() => {
    document.title = "Overview · Marketnest";
  }, []);

  const unreadMessages = seedMessages.reduce((total, thread) => total + (thread.unread || 0), 0);
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3);
  const recommended = products.filter((product) => product.featured).slice(0, 4);

  const stats = [
    { label: "Orders placed", value: orders.length, foot: `${orders.filter((order) => order.status === "delivered").length} delivered`, icon: Package },
    { label: "Saved finds", value: favourites.count, foot: "Keep them close", icon: Heart },
    { label: "Shops followed", value: seedFollowing.length, foot: "New drops, first", icon: Store },
    { label: "Unread messages", value: unreadMessages, foot: unreadMessages ? "Waiting for you" : "All caught up", icon: MessageCircle },
  ];

  return (
    <>
      <header className="dash-header">
        <div className="d-flex align-items-center gap-3">
          <Avatar name={account.full_name} size={54} className="dash-overview-avatar" />
          <div>
            <span className="eyebrow">Your marketplace</span>
            <h1>Welcome back, {account.first_name || "friend"}.</h1>
            <p>Here&apos;s what&apos;s happening with your Marketnest account today.</p>
          </div>
        </div>
        <div className="dash-actions">
          <Link to="/marketplace" className="mn-btn ghost">
            Explore marketplace <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      <div className="stat-grid">
        {stats.map(({ label, value, foot, icon: Icon }) => (
          <div className="stat-card dash-stat" key={label}>
            <div className="d-flex justify-content-between align-items-center">
              <span className="stat-label">{label}</span>
              <span className="dash-stat-icon"><Icon size={18} /></span>
            </div>
            <span className="stat-value">{value}</span>
            <span className="stat-foot">{foot}</span>
          </div>
        ))}
      </div>

      <div className="dash-overview-grid">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Recent orders</h2>
              <p className="sub">A quick look at your latest purchases.</p>
            </div>
            <Link to="/dashboard/orders" className="link-btn">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="dash-recent-list">
            {recentOrders.map((order) => (
              <Link className="dash-recent-order" to={`/dashboard/orders/${order.number}`} key={order.number}>
                <span className="dash-recent-order-main">
                  <strong>{order.number}</strong>
                  <span className="tiny">
                    {order.business?.name} · {formatDate(order.created_at)} ·{" "}
                    {order.item_count} {plural(order.item_count, "item")}
                  </span>
                </span>
                <span className="dash-recent-order-side">
                  <StatusPill status={order.status} />
                  <strong>{money(order.total)}</strong>
                  <ChevronRight size={16} className="text-muted" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Quick links</h2>
              <p className="sub">Jump back in where you left off.</p>
            </div>
          </div>
          <div className="dash-quick-grid">
            {quickLinks.map(({ to, label, hint, icon: Icon }) => (
              <Link className="dash-quick-link" to={to} key={to}>
                <span className="dash-quick-icon"><Icon size={19} /></span>
                <span>
                  <strong>{label}</strong>
                  <small>{hint}</small>
                </span>
                <ChevronRight size={15} className="dash-quick-arrow" />
              </Link>
            ))}
          </div>
        </section>
      </div>

      <section className="dash-recommend-section">
        <div className="section-head">
          <div>
            <span className="eyebrow"><Sparkles size={13} /> Picked for you</span>
            <h2>Fresh finds worth a look</h2>
            <p>Handmade pieces from shops you&apos;ll love discovering.</p>
          </div>
          <Link to="/marketplace" className="link-arrow">Browse the marketplace</Link>
        </div>
        <div className="product-grid">
          {recommended.map((product) => <ProductCard product={product} key={product.id} />)}
        </div>
      </section>
    </>
  );
}
