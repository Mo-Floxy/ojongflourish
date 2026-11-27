import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  CalendarDays,
  Check,
  Clock,
  Globe,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Plus,
  Send,
  Store,
  Tag,
} from "lucide-react";

import { api } from "../api/client";
import { businesses, products, reviews } from "../data/mock";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import ProductCard from "../components/ProductCard";
import Rating from "../components/Rating";
import { PageSpinner } from "../components/Skeletons";
import Thumb from "../components/Thumb";
import { useToast } from "../context/ToastContext";
import { formatDate, plural } from "../lib/format";

const tabs = [
  { id: "about", label: "About" },
  { id: "products", label: "Products" },
  { id: "reviews", label: "Reviews" },
];
const emptyMessage = { name: "", email: "", body: "" };

export default function BusinessProfile() {
  const { slug } = useParams();
  const toast = useToast();
  const business = businesses.find(
    (item) => item.slug === slug || String(item.id) === slug
  );

  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("about");
  const [following, setFollowing] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState(emptyMessage);

  useEffect(() => {
    document.title = business ? `${business.name} · Marketnest` : "Shop not found · Marketnest";
  }, [business]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 160);
    return () => clearTimeout(timer);
  }, [slug]);

  useEffect(() => {
    setFollowing(Boolean(business?.is_following));
    setTab("about");
  }, [business]);

  const shopProducts = business
    ? products.filter((item) => item.business_id === business.id)
    : [];
  const shopReviews = business
    ? reviews.filter((item) => item.business?.id === business.id)
    : [];
  const followerCount = (business?.followers || 0) + (following ? 1 : 0);

  function toggleFollow() {
    setFollowing((current) => !current);
    toast.info(
      following ? `Unfollowed ${business.name}` : `Following ${business.name}`,
      following ? "You won't get their updates any more." : "New arrivals will show up in your dashboard."
    );
  }

  async function sendMessage(event) {
    event.preventDefault();
    setSending(true);
    try {
      await api.post("/messages/", { ...message, business_id: business.id });
      toast.success("Message sent", `${business.name} will get back to you soon.`);
      setContactOpen(false);
      setMessage(emptyMessage);
    } catch {
      toast.error("Message not sent", "Please try again in a moment.");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="mn-container page-section">
        <PageSpinner label="Opening the shop" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="mn-container page-section">
        <EmptyState
          icon={Store}
          title="We couldn't find that shop"
          text="It may have moved or closed. Why not explore the other independent shops instead?"
          action={<Link className="mn-btn" to="/businesses">Browse all shops</Link>}
        />
      </div>
    );
  }

  return (
    <div className="pub-profile">
      <div className="pub-profile-banner">
        <Thumb src={business.banner} alt="" mark={business.name.slice(0, 1)} />
      </div>

      <div className="mn-container">
        <nav className="breadcrumbs pub-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <Link to="/businesses">Shops</Link>
          <span>{business.name}</span>
        </nav>

        <div className="pub-profile-head">
          <Thumb
            src={business.logo}
            alt=""
            mark={business.name.slice(0, 1)}
            className="pub-profile-avatar"
          />
          <div className="pub-profile-info">
            <span className="eyebrow">{business.category} · {business.city}</span>
            <h1>{business.name}</h1>
            <p>{business.tagline}</p>
            <div className="pub-profile-meta">
              <Rating value={business.rating} count={business.review_count} />
              <span>· {followerCount.toLocaleString()} followers</span>
              <span>· {business.product_count} {plural(business.product_count, "find")}</span>
              <span>· Since {business.joined}</span>
            </div>
          </div>
          <div className="pub-profile-actions">
            <button
              type="button"
              className={`mn-btn ${following ? "ghost" : ""}`}
              onClick={toggleFollow}
            >
              {following ? <Check size={15} /> : <Plus size={15} />}
              {following ? "Following" : "Follow shop"}
            </button>
            <button type="button" className="mn-btn ghost" onClick={() => setContactOpen(true)}>
              <Mail size={15} /> Contact seller
            </button>
          </div>
        </div>

        <div className="pub-tabs" role="tablist" aria-label="Shop sections">
          {tabs.map((item) => (
            <button
              type="button"
              role="tab"
              key={item.id}
              className={`pub-tab ${tab === item.id ? "active" : ""}`}
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
            >
              {item.label}
              {item.id === "products" && <small>{shopProducts.length}</small>}
              {item.id === "reviews" && <small>{shopReviews.length}</small>}
            </button>
          ))}
        </div>

        <div className="pub-profile-body page-section tight">
          {tab === "about" && (
            <div className="pub-about-grid">
              <div className="panel">
                <h2>Our story</h2>
                <p>{business.description}</p>
                <div className="business-tags mt-3">
                  {business.tags.map((item) => (
                    <span className="business-tag" key={item}>{item}</span>
                  ))}
                </div>
              </div>
              <div className="panel">
                <h2>Shop details</h2>
                <div className="pub-detail-list">
                  <div className="pub-detail-item">
                    <MapPin size={17} />
                    <div><span className="tiny">Address</span><strong>{business.address}</strong></div>
                  </div>
                  <div className="pub-detail-item">
                    <Clock size={17} />
                    <div><span className="tiny">Opening hours</span><strong>{business.hours}</strong></div>
                  </div>
                  <div className="pub-detail-item">
                    <CalendarDays size={17} />
                    <div><span className="tiny">On Marketnest</span><strong>Since {business.joined}</strong></div>
                  </div>
                  <div className="pub-detail-item">
                    <Tag size={17} />
                    <div><span className="tiny">Specialities</span><strong>{business.tags.join(", ")}</strong></div>
                  </div>
                </div>
                <div className="pub-socials">
                  <a href={`https://instagram.com/${business.social.instagram.replace("@", "")}`} target="_blank" rel="noreferrer">
                    <Instagram size={15} /> {business.social.instagram}
                  </a>
                  <a href={`https://${business.social.website}`} target="_blank" rel="noreferrer">
                    <Globe size={15} /> {business.social.website}
                  </a>
                </div>
              </div>
            </div>
          )}

          {tab === "products" && (
            shopProducts.length ? (
              <div className="product-grid">
                {shopProducts.map((item) => <ProductCard key={item.id} product={item} />)}
              </div>
            ) : (
              <EmptyState
                icon={Package}
                title="No products listed yet"
                text="This shop is getting ready. Follow them to hear when new finds arrive."
                action={
                  <button type="button" className="mn-btn" onClick={toggleFollow}>
                    {following ? "Following" : "Follow shop"}
                  </button>
                }
              />
            )
          )}

          {tab === "reviews" && (
            <div className="panel pub-profile-reviews">
              <div className="pub-review-head">
                <h2>What people are saying</h2>
                <Rating value={business.rating} count={business.review_count} />
              </div>
              {shopReviews.length ? (
                shopReviews.map((review) => (
                  <div className="review-card" key={review.id}>
                    <div className="pub-review-meta">
                      <strong>{review.author}</strong>
                      <span className="tiny">{formatDate(review.at)}</span>
                    </div>
                    <Rating value={review.rating} size={13} />
                    <p>{review.body}</p>
                    {review.product && (
                      <Link className="tiny pub-review-product" to={`/product/${review.product.slug}`}>
                        On {review.product.name}
                      </Link>
                    )}
                  </div>
                ))
              ) : (
                <EmptyState
                  icon={MessageCircle}
                  title="No written reviews yet"
                  text="Orders from this shop haven't been reviewed in public yet — be the first."
                />
              )}
            </div>
          )}
        </div>
      </div>

      <Modal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        title={`Message ${business.name}`}
      >
        <p className="text-muted">
          Have a question for {business.name}? Send a note and they&apos;ll get back to you.
        </p>
        <form className="pub-modal-form" onSubmit={sendMessage}>
          <div className="pub-form-grid">
            <div>
              <label className="form-label" htmlFor="shop-contact-name">Your name</label>
              <input
                id="shop-contact-name"
                className="form-control"
                required
                value={message.name}
                onChange={(event) => setMessage({ ...message, name: event.target.value })}
                placeholder="Amara Okafor"
              />
            </div>
            <div>
              <label className="form-label" htmlFor="shop-contact-email">Email address</label>
              <input
                id="shop-contact-email"
                className="form-control"
                type="email"
                required
                value={message.email}
                onChange={(event) => setMessage({ ...message, email: event.target.value })}
                placeholder="you@example.com"
              />
            </div>
          </div>
          <label className="form-label" htmlFor="shop-contact-body">Your message</label>
          <textarea
            id="shop-contact-body"
            className="form-control"
            rows="5"
            required
            value={message.body}
            onChange={(event) => setMessage({ ...message, body: event.target.value })}
            placeholder="Hi! I'd love to know more about your work…"
          />
          <button type="submit" className="mn-btn mt-3" disabled={sending}>
            <Send size={15} /> {sending ? "Sending…" : "Send message"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
