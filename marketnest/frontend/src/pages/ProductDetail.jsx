import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Heart,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Plus,
  Send,
  ShieldCheck,
  Store,
  Truck,
} from "lucide-react";

import { api } from "../api/client";
import { businesses, products, reviews } from "../data/mock";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import ProductCard from "../components/ProductCard";
import QtyStepper from "../components/QtyStepper";
import Rating from "../components/Rating";
import SectionHead from "../components/SectionHead";
import { PageSpinner } from "../components/Skeletons";
import Thumb from "../components/Thumb";
import { useCart } from "../context/CartContext";
import { useFavourites } from "../context/FavouritesContext";
import { useToast } from "../context/ToastContext";
import { formatDate, money, plural } from "../lib/format";

const emptyMessage = { name: "", email: "", body: "" };

export default function ProductDetail() {
  const { slug } = useParams();
  const cart = useCart();
  const favourites = useFavourites();
  const toast = useToast();

  const product = products.find(
    (item) => item.slug === slug || String(item.id) === slug
  );
  const business = product
    ? businesses.find((item) => item.id === product.business_id)
    : null;

  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState("");
  const [contactOpen, setContactOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState(emptyMessage);

  useEffect(() => {
    document.title = product
      ? `${product.name} · Marketnest`
      : "Find not found · Marketnest";
  }, [product]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 160);
    return () => clearTimeout(timer);
  }, [slug]);

  useEffect(() => {
    setQty(1);
    setActiveImage(product?.image || "");
  }, [product]);

  const related = product
    ? products
        .filter((item) => item.category_id === product.category_id && item.id !== product.id)
        .slice(0, 4)
    : [];
  const productReviews = product
    ? reviews.filter((review) => review.product?.id === product.id)
    : [];
  const saved = product ? favourites.has(product.id) : false;
  const discount = product?.compare_at_price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : 0;

  async function sendMessage(event) {
    event.preventDefault();
    setSending(true);
    try {
      await api.post("/messages/", {
        ...message,
        business_id: business?.id,
        product_id: product.id,
      });
      toast.success("Message sent", `${business?.name || "The maker"} will reply soon.`);
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
        <PageSpinner label="Loading this find" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mn-container page-section">
        <EmptyState
          icon={Package}
          title="We couldn't find that find"
          text="It may have been sold out or moved. There are plenty of other lovely things to explore."
          action={<Link className="mn-btn" to="/marketplace">Browse the marketplace</Link>}
        />
      </div>
    );
  }

  const images = product.gallery?.length ? product.gallery : [product.image];

  return (
    <div className="pub-pdp">
      <div className="mn-container">
        <nav className="breadcrumbs pub-breadcrumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <Link to="/marketplace">Marketplace</Link>
          {business && <Link to={`/business/${business.slug}`}>{business.name}</Link>}
          <span>{product.name}</span>
        </nav>

        <div className="pub-pdp-layout">
          <div className="pub-pdp-main">
            <div className="pub-gallery">
              <div className="pub-gallery-main">
                <Thumb src={activeImage} alt={product.name} mark={product.name.slice(0, 1)} />
                {product.badge && (
                  <span className="pill gold pub-gallery-badge">{product.badge}</span>
                )}
              </div>
              <div className="pub-gallery-thumbs" role="tablist" aria-label="Product images">
                {images.map((image, index) => (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeImage === image}
                    key={`${image}-${index}`}
                    className={`pub-gallery-thumb ${activeImage === image ? "active" : ""}`}
                    onClick={() => setActiveImage(image)}
                    aria-label={`View image ${index + 1}`}
                  >
                    <Thumb src={image} alt="" mark={product.name.slice(0, 1)} />
                  </button>
                ))}
              </div>
            </div>

            <div className="panel pub-detail-panel">
              <h2>About this find</h2>
              <p>{product.description}</p>
              <div className="pub-detail-grid">
                <div>
                  <span className="eyebrow">Materials & care</span>
                  <p>{product.materials}</p>
                </div>
                <div>
                  <span className="eyebrow">Details</span>
                  <p>
                    {product.category} · {plural(product.sold_count, "piece")} sold · Added{" "}
                    {formatDate(product.created_at)}
                  </p>
                </div>
              </div>
            </div>

            <div className="panel pub-detail-panel">
              <div className="pub-review-head">
                <h2>Customer reviews</h2>
                <Rating value={product.rating} count={product.review_count} />
              </div>
              {productReviews.length ? (
                productReviews.map((review) => (
                  <div className="review-card" key={review.id}>
                    <div className="pub-review-meta">
                      <strong>{review.author}</strong>
                      <span className="tiny">{formatDate(review.at)}</span>
                    </div>
                    <Rating value={review.rating} size={13} />
                    <p>{review.body}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted mb-0">
                  No written reviews yet — be the first to share what you think.
                </p>
              )}
            </div>
          </div>

          <aside className="pub-pdp-side">
            <div className="panel pub-buybox">
              <span className="product-shop">{business?.name || "Independent maker"}</span>
              <h1 className="pub-pdp-title">{product.name}</h1>
              <div className="pub-pdp-rating">
                <Rating value={product.rating} count={product.review_count} />
                <span className="tiny">· {product.sold_count} sold</span>
              </div>
              <div className="pub-pdp-price">
                <strong>{money(product.price)}</strong>
                {product.compare_at_price && (
                  <>
                    <del>{money(product.compare_at_price)}</del>
                    <span className="pill clay">{discount}% off</span>
                  </>
                )}
              </div>
              <p className={`pub-pdp-stock ${product.stock <= 5 ? "low" : ""}`}>
                <span className="pub-stock-dot" />
                {product.stock <= 0
                  ? "Currently sold out"
                  : product.stock <= 5
                    ? `Only ${product.stock} left in stock`
                    : "In stock, ready to ship"}
              </p>
              <p className="pub-pdp-intro">{product.description}</p>

              <div className="pub-pdp-actions">
                <QtyStepper
                  value={qty}
                  min={1}
                  max={Math.max(1, product.stock)}
                  onChange={setQty}
                  disabled={product.stock <= 0}
                />
                <button
                  type="button"
                  className="mn-btn lg"
                  disabled={product.stock <= 0}
                  onClick={() => cart.add(product, qty)}
                >
                  <Plus size={17} />
                  Add to basket
                </button>
                <button
                  type="button"
                  className={`mn-btn icon ghost ${saved ? "pub-saved" : ""}`}
                  aria-label={saved ? "Remove from saved finds" : "Save to finds"}
                  onClick={() => favourites.toggle(product)}
                >
                  <Heart size={18} fill={saved ? "currentColor" : "none"} />
                </button>
              </div>

              <div className="pub-trust">
                <span><Truck size={15} /> Ships from {business?.city || "Nigeria"}</span>
                <span><ShieldCheck size={15} /> Secure local checkout</span>
                <span><MessageCircle size={15} /> Talk to the maker</span>
              </div>
            </div>

            {business && (
              <div className="panel pub-shop-card">
                <div className="pub-shop-card-top">
                  <Thumb
                    src={business.logo}
                    alt=""
                    mark={business.name.slice(0, 1)}
                    className="pub-shop-avatar"
                  />
                  <div>
                    <h3>{business.name}</h3>
                    <span className="tiny">
                      <MapPin size={12} /> {business.area}, {business.city}
                    </span>
                  </div>
                </div>
                <Rating value={business.rating} count={business.review_count} />
                <p className="tiny mt-2">{business.tagline}</p>
                <div className="d-flex gap-2 mt-3 flex-wrap">
                  <Link className="mn-btn sm ghost" to={`/business/${business.slug}`}>
                    <Store size={14} /> Visit shop
                  </Link>
                  <button
                    type="button"
                    className="mn-btn sm ghost"
                    onClick={() => setContactOpen(true)}
                  >
                    <Mail size={14} /> Contact
                  </button>
                </div>
              </div>
            )}
          </aside>
        </div>

        {related.length > 0 && (
          <section className="page-section tight">
            <SectionHead
              eyebrow="You might also like"
              title="More from this category"
              linkTo={`/marketplace?category=${product.category_id}`}
              linkLabel="See all"
            />
            <div className="product-grid">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>

      <Modal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        title={`Message ${business?.name || "the maker"}`}
      >
        <p className="text-muted">
          Ask about this piece, sizing, colours or delivery. {business?.name || "The shop"} usually
          replies within a day.
        </p>
        <form className="pub-modal-form" onSubmit={sendMessage}>
          <div className="pub-form-grid">
            <div>
              <label className="form-label" htmlFor="contact-name">Your name</label>
              <input
                id="contact-name"
                className="form-control"
                required
                value={message.name}
                onChange={(event) => setMessage({ ...message, name: event.target.value })}
                placeholder="Amara Okafor"
              />
            </div>
            <div>
              <label className="form-label" htmlFor="contact-email">Email address</label>
              <input
                id="contact-email"
                className="form-control"
                type="email"
                required
                value={message.email}
                onChange={(event) => setMessage({ ...message, email: event.target.value })}
                placeholder="you@example.com"
              />
            </div>
          </div>
          <label className="form-label" htmlFor="contact-body">Your message</label>
          <textarea
            id="contact-body"
            className="form-control"
            rows="5"
            required
            value={message.body}
            onChange={(event) => setMessage({ ...message, body: event.target.value })}
            placeholder={`Hi! I'd love to know more about the ${product.name}…`}
          />
          <button type="submit" className="mn-btn mt-3" disabled={sending}>
            <Send size={15} /> {sending ? "Sending…" : "Send message"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
