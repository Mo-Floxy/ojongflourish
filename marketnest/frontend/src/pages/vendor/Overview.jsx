import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Box,
  Package,
  Plus,
  ReceiptText,
  Store,
  TrendingUp,
  TriangleAlert,
  Users,
} from "lucide-react";
import StatusPill from "../../components/StatusPill";
import Thumb from "../../components/Thumb";
import { businesses, products, vendorOrders, vendorUser } from "../../data/mock";
import { money, shortMoney } from "../../lib/format";

const revenueSeries = [
  { label: "Jun", value: 62000 },
  { label: "Jul", value: 81000 },
  { label: "Aug", value: 68000 },
  { label: "Sep", value: 94000 },
  { label: "Oct", value: 78000 },
  { label: "Nov", value: 114600 },
];

const LOW_STOCK_AT = 10;

const quickLinks = [
  {
    to: "/vendor/products",
    icon: Box,
    title: "Manage products",
    text: "Add new pieces, update stock and prices.",
  },
  {
    to: "/vendor/orders",
    icon: ReceiptText,
    title: "Review orders",
    text: "Confirm, prepare and dispatch customer orders.",
  },
  {
    to: "/vendor/shop",
    icon: Store,
    title: "Polish your shop",
    text: "Refresh your story, photos and social links.",
  },
];

export default function Overview() {
  useEffect(() => {
    document.title = "Shop overview · Marketnest";
  }, []);

  const shop = businesses.find((item) => item.id === vendorUser.business_id) || businesses[0];
  const myProducts = useMemo(
    () => products.filter((item) => item.business_id === vendorUser.business_id),
    []
  );

  const revenue = vendorOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const lowStock = myProducts.filter(
    (item) => item.stock > 0 && item.stock <= LOW_STOCK_AT
  );
  const recentOrders = vendorOrders.slice(0, 4);
  const maxRevenue = Math.max(...revenueSeries.map((point) => point.value));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const stats = [
    {
      label: "Revenue",
      value: shortMoney(revenue),
      foot: "Across all your orders",
      icon: TrendingUp,
      tone: "moss",
    },
    {
      label: "Orders",
      value: vendorOrders.length,
      foot: `${vendorOrders.filter((order) => order.status === "pending").length} awaiting action`,
      icon: ReceiptText,
      tone: "clay",
    },
    {
      label: "Products",
      value: myProducts.length,
      foot: `${myProducts.filter((item) => item.is_active).length} live in your shop`,
      icon: Package,
      tone: "gold",
    },
    {
      label: "Followers",
      value: shop.followers.toLocaleString("en-NG"),
      foot: `${shop.review_count} happy reviews`,
      icon: Users,
      tone: "blue",
    },
  ];

  return (
    <div className="vnd-page">
      <header className="dash-header">
        <div>
          <span className="eyebrow">Your shop at a glance</span>
          <h1>
            {greeting}, {vendorUser.first_name}.
          </h1>
          <p>
            Here&apos;s what&apos;s happening with <strong>{shop.name}</strong> today.
          </p>
        </div>
        <div className="dash-actions">
          <Link className="mn-btn ghost" to="/vendor/shop">
            <Store size={16} /> Edit shop
          </Link>
          <Link className="mn-btn" to="/vendor/products">
            <Plus size={16} /> Add product
          </Link>
        </div>
      </header>

      <section className="stat-grid" aria-label="Shop statistics">
        {stats.map(({ label, value, foot, icon: Icon, tone }) => (
          <article className="stat-card vnd-stat-card" key={label}>
            <div className="vnd-stat-top">
              <span className="stat-label">{label}</span>
              <span className={`vnd-stat-icon ${tone}`}>
                <Icon size={17} />
              </span>
            </div>
            <strong className="stat-value">{value}</strong>
            <span className="stat-foot">{foot}</span>
          </article>
        ))}
      </section>

      <div className="vnd-overview-grid">
        <section className="panel vnd-chart-panel">
          <div className="panel-head">
            <div>
              <h3>Revenue</h3>
              <p className="sub">A gentle climb over the last six months</p>
            </div>
            <span className="pill teal">
              <TrendingUp size={13} /> +18.4%
            </span>
          </div>
          <div
            className="vnd-chart"
            role="img"
            aria-label="Monthly revenue bar chart, rising from 62,000 naira in June to 114,600 naira in November"
          >
            <div className="vnd-chart-grid" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div className="vnd-chart-bars">
              {revenueSeries.map((point, index) => (
                <div
                  className={`vnd-chart-col ${index === revenueSeries.length - 1 ? "current" : ""}`}
                  key={point.label}
                >
                  <span className="vnd-chart-track">
                    <span className="vnd-chart-value">{shortMoney(point.value)}</span>
                    <span
                      className="vnd-chart-bar"
                      style={{ height: `${Math.round((point.value / maxRevenue) * 100)}%` }}
                    />
                  </span>
                  <span className="vnd-chart-label">{point.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="vnd-chart-foot">
            <span>Best month: November</span>
            <strong>{money(revenue)} total</strong>
          </div>
        </section>

        <div className="vnd-overview-side">
          <section className="panel vnd-compact-panel">
            <div className="panel-head">
              <h3>Recent orders</h3>
              <Link className="link-btn" to="/vendor/orders">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="vnd-recent-list">
              {recentOrders.map((order) => (
                <Link className="vnd-recent-row" to="/vendor/orders" key={order.id}>
                  <span className="vnd-recent-icon">
                    <ReceiptText size={16} />
                  </span>
                  <span className="vnd-recent-info">
                    <strong>{order.number}</strong>
                    <span>{order.customer}</span>
                  </span>
                  <span className="vnd-recent-meta">
                    <StatusPill status={order.status} />
                    <strong>{money(order.total)}</strong>
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section className="panel vnd-compact-panel">
            <div className="panel-head">
              <h3>Low stock</h3>
              <Link className="link-btn" to="/vendor/products">
                Manage stock <ArrowRight size={14} />
              </Link>
            </div>
            {lowStock.length ? (
              <div className="vnd-stock-list">
                {lowStock.map((item) => (
                  <Link className="vnd-stock-row" to="/vendor/products" key={item.id}>
                    <Thumb
                      className="vnd-stock-thumb"
                      src={item.image}
                      alt={item.name}
                      mark={item.name.charAt(0)}
                    />
                    <span className="vnd-stock-info">
                      <strong>{item.name}</strong>
                      <span>{item.category}</span>
                    </span>
                    <span className="pill clay vnd-stock-count">
                      <TriangleAlert size={12} /> {item.stock} left
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="tiny vnd-panel-empty">Everything is well stocked. Nice work.</p>
            )}
          </section>
        </div>
      </div>

      <section className="vnd-quick-section">
        <div className="section-head">
          <div>
            <h2>Quick links</h2>
            <p>The little things that keep your shop running smoothly.</p>
          </div>
        </div>
        <div className="vnd-quick-grid">
          {quickLinks.map(({ to, icon: Icon, title, text }) => (
            <Link className="vnd-quick-link" to={to} key={title}>
              <span className="vnd-quick-icon">
                <Icon size={19} />
              </span>
              <span className="vnd-quick-copy">
                <strong>{title}</strong>
                <span>{text}</span>
              </span>
              <ArrowRight className="vnd-quick-arrow" size={17} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
