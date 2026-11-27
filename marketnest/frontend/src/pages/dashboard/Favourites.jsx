import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, HeartCrack, MapPin, Star, Trash2 } from "lucide-react";
import EmptyState from "../../components/EmptyState";
import Modal from "../../components/Modal";
import Thumb from "../../components/Thumb";
import { useFavourites } from "../../context/FavouritesContext";
import { useToast } from "../../context/ToastContext";
import { products } from "../../data/mock";
import { money, plural } from "../../lib/format";

export default function Favourites() {
  const favourites = useFavourites();
  const toast = useToast();
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    document.title = "Saved finds · Marketnest";
  }, []);

  const saved = useMemo(
    () => products.filter((product) => favourites.ids.includes(product.id)),
    [favourites.ids]
  );

  function remove(product) {
    favourites.toggle(product);
  }

  function clearAll() {
    favourites.clear();
    setConfirmClear(false);
    toast.info("Saved finds cleared", "Your saved list is now empty.");
  }

  return (
    <>
      <header className="dash-header">
        <div>
          <span className="eyebrow">Your collection</span>
          <h1>Saved finds</h1>
          <p>
            {saved.length
              ? `${saved.length} ${plural(saved.length, "piece")} you'd like to come back to.`
              : "All the pieces you love, kept in one place."}
          </p>
        </div>
        <div className="dash-actions">
          {saved.length > 0 && (
            <button type="button" className="mn-btn ghost dash-danger-outline" onClick={() => setConfirmClear(true)}>
              <Trash2 size={15} /> Clear all
            </button>
          )}
          <Link to="/marketplace" className="mn-btn">Find more</Link>
        </div>
      </header>

      {saved.length ? (
        <div className="product-grid dash-favourites-grid">
          {saved.map((product) => (
            <article className="panel dash-fav-card" key={product.id}>
              <div className="dash-fav-media">
                {product.badge && <span className="pill gold">{product.badge}</span>}
                <button
                  type="button"
                  className="fav-btn active"
                  aria-label={`Remove ${product.name} from saved finds`}
                  onClick={() => remove(product)}
                >
                  <Heart size={16} fill="currentColor" />
                </button>
                <Link to={`/product/${product.slug}`} aria-label={product.name}>
                  <Thumb src={product.image} alt={product.name} mark={product.name[0]} />
                </Link>
              </div>
              <div className="dash-fav-body">
                <span className="product-shop">{product.business?.name || "Independent maker"}</span>
                <h3 className="product-title"><Link to={`/product/${product.slug}`}>{product.name}</Link></h3>
                <div className="product-meta">
                  <Star size={13} fill="currentColor" color="var(--gold)" />
                  <span>{product.rating} · {product.review_count} {plural(product.review_count, "review")}</span>
                </div>
                <div className="tiny dash-fav-location"><MapPin size={12} /> {product.business?.city || "Marketnest"}</div>
                <div className="product-price">
                  <span>{money(product.price)}</span>
                  {product.compare_at_price && <del>{money(product.compare_at_price)}</del>}
                </div>
                <div className="dash-fav-actions">
                  <Link to={`/product/${product.slug}`} className="mn-btn sm">View piece</Link>
                  <button type="button" className="mn-btn sm ghost" onClick={() => remove(product)}>
                    <HeartCrack size={14} /> Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="panel">
          <EmptyState
            icon={Heart}
            title="No saved finds yet"
            text="Tap the heart on any product to keep it here for later."
            action={<Link to="/marketplace" className="mn-btn sm">Explore the marketplace</Link>}
          />
        </div>
      )}

      <Modal open={confirmClear} onClose={() => setConfirmClear(false)} title="Clear all saved finds?">
        <p>This will remove all {saved.length} {plural(saved.length, "piece")} from your saved finds.</p>
        <div className="dash-modal-actions">
          <button type="button" className="mn-btn ghost" onClick={() => setConfirmClear(false)}>Keep them</button>
          <button type="button" className="mn-btn clay" onClick={clearAll}>Clear all</button>
        </div>
      </Modal>
    </>
  );
}
