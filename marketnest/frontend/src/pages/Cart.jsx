import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag, Store, Trash2, Truck } from "lucide-react";

import EmptyState from "../components/EmptyState";
import QtyStepper from "../components/QtyStepper";
import Thumb from "../components/Thumb";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { money, plural } from "../lib/format";

export default function Cart() {
  const cart = useCart();
  const toast = useToast();

  useEffect(() => {
    document.title = "Your basket · Marketnest";
  }, []);

  const groups = useMemo(() => {
    const byShop = new Map();
    cart.lines.forEach((line) => {
      const business = line.product.business;
      const key = business?.id || 0;
      if (!byShop.has(key)) {
        byShop.set(key, {
          key,
          name: business?.name || "Independent makers",
          slug: business?.slug,
          lines: [],
        });
      }
      byShop.get(key).lines.push(line);
    });
    return [...byShop.values()];
  }, [cart.lines]);

  function removeLine(line) {
    cart.remove(line.product_id);
    toast.info("Removed from your basket", line.product.name);
  }

  function clearBasket() {
    cart.clear();
    toast.info("Basket emptied", "You can always find something new.");
  }

  return (
    <div className="mn-container page-section tight">
      <div className="section-head">
        <div>
          <span className="eyebrow">Your basket</span>
          <h1>Good things you picked out</h1>
          <p>Everything in one place, grouped by the shop it came from.</p>
        </div>
        {cart.lines.length > 0 && (
          <button type="button" className="link-btn" onClick={clearBasket}>Clear basket</button>
        )}
      </div>

      {cart.lines.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Your basket is empty"
          text="There's a whole market of handmade finds waiting. Go take a look around."
          action={<Link className="mn-btn" to="/marketplace">Explore the marketplace</Link>}
        />
      ) : (
        <div className="pub-cart-layout">
          <div className="pub-cart-groups">
            {groups.map((group) => {
              const groupTotal = group.lines.reduce((sum, line) => sum + line.line_total, 0);
              return (
                <section className="panel pub-cart-group" key={group.key}>
                  <div className="pub-cart-group-head">
                    <h2>
                      <Store size={17} />
                      {group.slug ? (
                        <Link to={`/business/${group.slug}`}>{group.name}</Link>
                      ) : (
                        group.name
                      )}
                    </h2>
                    <span className="tiny">
                      {group.lines.length} {plural(group.lines.length, "item")} · Ships together
                    </span>
                  </div>

                  {group.lines.map((line) => (
                    <div className="pub-cart-row" key={line.product_id}>
                      <Link
                        to={`/product/${line.product.slug}`}
                        className="pub-cart-thumb"
                        aria-label={line.product.name}
                      >
                        <Thumb
                          src={line.product.image}
                          alt={line.product.name}
                          mark={line.product.name.slice(0, 1)}
                        />
                      </Link>
                      <div className="pub-cart-row-main">
                        <strong>
                          <Link to={`/product/${line.product.slug}`}>{line.product.name}</Link>
                        </strong>
                        <span className="tiny">
                          {line.product.category} · {money(line.product.price)} each
                        </span>
                      </div>
                      <QtyStepper
                        value={line.quantity}
                        min={1}
                        max={Math.max(1, line.product.stock)}
                        onChange={(value) => cart.setQuantity(line.product_id, value)}
                      />
                      <strong className="pub-cart-line-total">{money(line.line_total)}</strong>
                      <button
                        type="button"
                        className="table-icon-btn danger"
                        aria-label={`Remove ${line.product.name}`}
                        onClick={() => removeLine(line)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}

                  <div className="pub-cart-group-foot">
                    <span className="tiny">Shop subtotal</span>
                    <strong>{money(groupTotal)}</strong>
                  </div>
                </section>
              );
            })}
          </div>

          <aside className="summary-card pub-cart-summary">
            <h2>Order summary</h2>
            <div className="summary-row">
              <span>Subtotal ({cart.count} {plural(cart.count, "item")})</span>
              <strong>{money(cart.subtotal)}</strong>
            </div>
            <div className="summary-row">
              <span>Shipping estimate ({cart.businessCount} {plural(cart.businessCount, "shop")})</span>
              <strong>{money(cart.shippingEstimate)}</strong>
            </div>
            <div className="summary-total">
              <span>Total</span>
              <strong>{money(cart.total)}</strong>
            </div>
            <Link className="mn-btn lg wide mt-3" to="/checkout">
              Go to checkout <ArrowRight size={16} />
            </Link>
            <Link className="mn-btn ghost wide mt-2" to="/marketplace">Keep browsing</Link>
            <p className="tiny mt-3 mb-0">
              <Truck size={13} style={{ verticalAlign: -2 }} /> Shipping is estimated per shop and
              confirmed at checkout.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
