import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Store,
} from "lucide-react";

import { api, apiError, fieldErrors } from "../api/client";
import EmptyState from "../components/EmptyState";
import StatusPill from "../components/StatusPill";
import Thumb from "../components/Thumb";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { formatDate, money, plural } from "../lib/format";

export default function Checkout() {
  const { user } = useAuth();
  const cart = useCart();
  const toast = useToast();

  const [form, setForm] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: "12 Adeola Odeku Street, Victoria Island, Lagos",
    city: user?.city || "",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [placing, setPlacing] = useState(false);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    document.title = "Checkout · Marketnest";
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

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function validate(values) {
    const next = {};
    if (!values.full_name.trim()) next.full_name = "Please enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) next.email = "Enter a valid email address.";
    if (!values.phone.trim()) next.phone = "Please enter a phone number.";
    if (!values.address.trim()) next.address = "Please enter a delivery address.";
    if (!values.city.trim()) next.city = "Please enter your city.";
    return next;
  }

  async function submit(event) {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      toast.error("Check your details", "Fix the highlighted fields to continue.");
      return;
    }

    setPlacing(true);
    const fallbackOrders = groups.map((group, index) => ({
      id: 2000 + index,
      number: `MN-${25000 + index}`,
      status: "pending",
      created_at: new Date().toISOString(),
      total: group.lines.reduce((sum, line) => sum + line.line_total, 0),
      item_count: group.lines.reduce((sum, line) => sum + line.quantity, 0),
      business: { name: group.name, slug: group.slug },
      items: group.lines,
    }));

    try {
      const { data } = await api.post("/orders/checkout/", {
        ...form,
        items: cart.lines.map((line) => ({
          product_id: line.product_id,
          quantity: line.quantity,
        })),
      });
      const created = Array.isArray(data.orders) && data.orders.length
        ? data.orders
        : fallbackOrders;
      setOrders(created);
      cart.clear();
      toast.success("Order placed", "Your makers have been notified.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setErrors(fieldErrors(error));
      toast.error("Couldn't place your order", apiError(error));
    } finally {
      setPlacing(false);
    }
  }

  if (!orders.length && cart.lines.length === 0) {
    return (
      <div className="mn-container page-section">
        <EmptyState
          icon={ShoppingBag}
          title="Nothing to check out yet"
          text="Add a few finds to your basket first, then come back to complete your order."
          action={<Link className="mn-btn" to="/marketplace">Browse the marketplace</Link>}
        />
      </div>
    );
  }

  if (orders.length) {
    return (
      <div className="mn-container pub-checkout-success">
        <div className="pub-success-head">
          <span className="pub-success-icon"><CheckCircle2 size={38} /></span>
          <span className="eyebrow">Order confirmed</span>
          <h1>Thank you — your order is in!</h1>
          <p>
            We&apos;ve sent the details to {form.email}. Each shop is preparing their part, and you
            can follow every parcel from your dashboard.
          </p>
        </div>

        <div className="pub-created-orders">
          {orders.map((order) => (
            <article className="panel pub-created-order" key={order.id}>
              <div className="pub-created-order-head">
                <div>
                  <span className="eyebrow">{order.number}</span>
                  <h3>{order.business?.name || "Marketnest"}</h3>
                  <span className="tiny">
                    {formatDate(order.created_at || new Date())} · {order.item_count || order.items?.length || 0}{" "}
                    {plural(order.item_count || order.items?.length || 0, "item")}
                  </span>
                </div>
                <StatusPill status={order.status} />
              </div>
              <div className="checkout-items">
                {(order.items || []).map((item, index) => (
                  <div className="checkout-item" key={`${order.id}-${index}`}>
                    <Thumb
                      src={item.product?.image}
                      alt={item.product?.name || "Item"}
                      mark={item.product?.name?.slice(0, 1) || "M"}
                    />
                    <div className="info">
                      <strong>{item.product?.name || "Handmade find"}</strong>
                      <span>Qty {item.quantity} · {money(item.product?.price)} each</span>
                    </div>
                    <strong>{money(item.line_total)}</strong>
                  </div>
                ))}
              </div>
              <div className="pub-created-order-foot">
                <strong>Total {money(order.total)}</strong>
                <Link className="mn-btn sm" to={`/dashboard/orders/${order.number}`}>
                  Track order <ArrowRight size={14} />
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="pub-success-actions">
          <Link className="mn-btn ghost" to="/marketplace">Continue shopping</Link>
          <Link className="mn-btn ghost" to="/dashboard/orders">View all orders</Link>
        </div>
      </div>
    );
  }

  const fields = [
    { key: "full_name", label: "Full name", placeholder: "Amara Okafor" },
    { key: "email", label: "Email address", placeholder: "you@example.com", type: "email" },
    { key: "phone", label: "Phone number", placeholder: "+234 801 234 5678" },
    { key: "city", label: "City", placeholder: "Lagos" },
  ];

  return (
    <div className="mn-container">
      <nav className="breadcrumbs pub-breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <Link to="/cart">Basket</Link>
        <span>Checkout</span>
      </nav>
      <div className="section-head">
        <div>
          <span className="eyebrow">Almost there</span>
          <h1>Checkout</h1>
          <p>Where should we send your finds? You won&apos;t be charged until each shop confirms.</p>
        </div>
        <Link className="link-arrow" to="/cart">Edit basket</Link>
      </div>

      <div className="checkout-layout">
        <div>
          <form id="checkout-form" className="panel pub-checkout-form" onSubmit={submit} noValidate>
            <div className="panel-head">
              <h2><MapPin size={18} /> Delivery details</h2>
              <span className="pill teal"><ShieldCheck size={13} /> Secure checkout</span>
            </div>
            <div className="pub-form-grid">
              {fields.map((field) => (
                <div key={field.key}>
                  <label className="form-label" htmlFor={`checkout-${field.key}`}>{field.label}</label>
                  <input
                    id={`checkout-${field.key}`}
                    className={`form-control ${errors[field.key] ? "is-invalid" : ""}`}
                    type={field.type || "text"}
                    placeholder={field.placeholder}
                    value={form[field.key]}
                    onChange={(event) => updateField(field.key, event.target.value)}
                  />
                  {errors[field.key] && <span className="field-error">{errors[field.key]}</span>}
                </div>
              ))}
              <div className="pub-form-span">
                <label className="form-label" htmlFor="checkout-address">Delivery address</label>
                <input
                  id="checkout-address"
                  className={`form-control ${errors.address ? "is-invalid" : ""}`}
                  placeholder="Street, area, city"
                  value={form.address}
                  onChange={(event) => updateField("address", event.target.value)}
                />
                {errors.address && <span className="field-error">{errors.address}</span>}
              </div>
              <div className="pub-form-span">
                <label className="form-label" htmlFor="checkout-notes">Delivery notes <span className="text-muted">(optional)</span></label>
                <textarea
                  id="checkout-notes"
                  className="form-control"
                  rows="3"
                  placeholder="Gate colour, gift wrapping, a note for the maker…"
                  value={form.notes}
                  onChange={(event) => updateField("notes", event.target.value)}
                />
              </div>
            </div>
          </form>

          <div className="panel mt-3 pub-order-items">
            <div className="panel-head">
              <h2>Your items</h2>
              <Link className="link-btn" to="/cart">Edit basket</Link>
            </div>
            {groups.map((group) => (
              <div className="pub-checkout-group" key={group.key}>
                <h3><Store size={15} /> {group.name}</h3>
                <div className="checkout-items">
                  {group.lines.map((line) => (
                    <div className="checkout-item" key={line.product_id}>
                      <Thumb
                        src={line.product.image}
                        alt={line.product.name}
                        mark={line.product.name.slice(0, 1)}
                      />
                      <div className="info">
                        <strong>{line.product.name}</strong>
                        <span>
                          Qty {line.quantity} · {money(line.product.price)} each
                        </span>
                      </div>
                      <strong>{money(line.line_total)}</strong>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="summary-card">
          <h2>Summary</h2>
          <div className="summary-row">
            <span>Items ({cart.count})</span>
            <strong>{money(cart.subtotal)}</strong>
          </div>
          <div className="summary-row">
            <span>Shipping ({cart.businessCount} {plural(cart.businessCount, "shop")})</span>
            <strong>{money(cart.shippingEstimate)}</strong>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <strong>{money(cart.total)}</strong>
          </div>
          <button
            type="submit"
            form="checkout-form"
            className="mn-btn lg wide mt-3"
            disabled={placing}
          >
            {placing ? <><span className="spinner" /> Placing order…</> : <>Place order <ArrowRight size={16} /></>}
          </button>
          <p className="tiny mt-3 mb-0 text-center">
            By placing this order you agree to our terms. Each shop handles its own delivery.
          </p>
        </aside>
      </div>
    </div>
  );
}
