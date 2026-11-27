import { Link } from "react-router-dom";
import { Heart, Plus, Star } from "lucide-react";
import Thumb from "./Thumb";
import { useCart } from "../context/CartContext";
import { useFavourites } from "../context/FavouritesContext";
import { money, plural } from "../lib/format";

export default function ProductCard({ product }) {
  const cart = useCart();
  const favourites = useFavourites();
  const soldOut = Number(product.stock) <= 0;
  const saved = favourites.has(product.id);

  return (
    <article className="product-card">
      <div className="product-media">
        {product.badge && <span className="product-badges"><span className="pill gold">{product.badge}</span></span>}
        <button
          type="button"
          className={`fav-btn ${saved ? "active" : ""}`}
          aria-label={saved ? "Remove from saved finds" : "Save this find"}
          onClick={() => favourites.toggle(product)}
        >
          <Heart size={16} fill={saved ? "currentColor" : "none"} />
        </button>
        <Link to={`/product/${product.slug}`} aria-label={product.name}>
          <Thumb src={product.image} alt={product.name} mark={product.name.slice(0, 1)} />
        </Link>
      </div>
      <div className="product-body">
        <span className="product-shop">{product.business?.name || "Independent maker"}</span>
        <h3 className="product-title">
          <Link to={`/product/${product.slug}`}>{product.name}</Link>
        </h3>
        <div className="product-meta">
          <Star size={13} fill="currentColor" color="var(--gold)" />
          <span>
            {product.rating} · {product.review_count} {plural(product.review_count, "review")}
          </span>
        </div>
        <div className="product-price">
          <span>{money(product.price)}</span>
          {product.compare_at_price && <del>{money(product.compare_at_price)}</del>}
        </div>
        <button
          type="button"
          className="mn-btn sm wide"
          disabled={soldOut}
          onClick={() => cart.add(product)}
        >
          <Plus size={15} />
          {soldOut ? "Sold out" : "Add to basket"}
        </button>
      </div>
    </article>
  );
}
