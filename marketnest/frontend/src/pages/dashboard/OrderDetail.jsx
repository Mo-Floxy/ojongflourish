import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  CircleSlash,
  Clock3,
  MapPin,
  MessageCircle,
  Package,
  ReceiptText,
  Truck,
  XCircle,
} from "lucide-react";
import Modal from "../../components/Modal";
import StatusPill from "../../components/StatusPill";
import Thumb from "../../components/Thumb";
import EmptyState from "../../components/EmptyState";
import { useToast } from "../../context/ToastContext";
import { orders } from "../../data/mock";
import { formatDate, money, plural } from "../../lib/format";

const stages = [
  { label: "Order placed", caption: "We received your order", icon: ReceiptText },
  { label: "Being prepared", caption: "The shop is packing your finds", icon: Package },
  { label: "Out for delivery", caption: "Your order is on its way", icon: Truck },
  { label: "Delivered", caption: "Time to enjoy your new things", icon: MapPin },
];

const stageForStatus = {
  pending: 0,
  processing: 1,
  out_for_delivery: 2,
  delivered: 3,
};

export default function OrderDetail() {
  const { number } = useParams();
  const toast = useToast();
  const order = orders.find((item) => item.number === number);
  const [status, setStatus] = useState(order?.status || "pending");
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    document.title = order ? `Order ${order.number} · Marketnest` : "Order not found · Marketnest";
  }, [order]);

  if (!order) {
    return (
      <>
        <header className="dash-header">
          <div>
            <span className="eyebrow">Order detail</span>
            <h1>Order not found</h1>
          </div>
        </header>
        <div className="panel">
          <EmptyState
            icon={CircleSlash}
            title="We couldn't find that order"
            text="The order number may be incorrect or the order is no longer available."
            action={<Link to="/dashboard/orders" className="mn-btn sm">Back to orders</Link>}
          />
        </div>
      </>
    );
  }

  const currentStage = stageForStatus[status] ?? 0;
  const cancelled = status === "cancelled";
  const canCancel = status === "pending" || status === "processing";
  const subtotal = order.items.reduce((sum, item) => sum + item.line_total, 0);

  function confirmCancel() {
    setStatus("cancelled");
    setConfirmOpen(false);
    toast.success("Order cancelled", `${order.number} has been cancelled. Your payment will be refunded.`);
  }

  return (
    <>
      <header className="dash-header dash-detail-header">
        <div>
          <Link to="/dashboard/orders" className="dash-back-link">
            <ArrowLeft size={15} /> Back to orders
          </Link>
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <h1>Order {order.number}</h1>
            <StatusPill status={status} />
          </div>
          <p>
            Placed on {formatDate(order.created_at, { weekday: "short" })} at{" "}
            {new Date(order.created_at).toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" })}
          </p>
        </div>
        {canCancel && (
          <div className="dash-actions">
            <button type="button" className="mn-btn ghost dash-danger-outline" onClick={() => setConfirmOpen(true)}>
              <XCircle size={15} /> Cancel order
            </button>
          </div>
        )}
      </header>

      <div className="dash-detail-grid">
        <div className="dash-detail-main">
          <section className="panel">
            <div className="panel-head">
              <div>
                <h2>Items in this order</h2>
                <p className="sub">Sold by {order.business?.name || "a Marketnest shop"}.</p>
              </div>
              <span className="pill">{order.item_count} {plural(order.item_count, "item")}</span>
            </div>
            <div className="dash-detail-items">
              {order.items.map((item) => (
                <div className="dash-detail-item" key={item.product.id}>
                  <Link to={`/product/${item.product.slug}`} className="dash-detail-item-media">
                    <Thumb src={item.product.image} alt={item.product.name} mark={item.product.name[0]} />
                  </Link>
                  <div className="dash-detail-item-info">
                    <Link to={`/product/${item.product.slug}`}><strong>{item.product.name}</strong></Link>
                    <span className="tiny">{money(item.product.price)} each</span>
                    <span className="tiny">Quantity: {item.quantity}</span>
                  </div>
                  <strong className="dash-detail-item-total">{money(item.line_total)}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="panel dash-timeline-panel">
            <div className="panel-head">
              <div>
                <h2>Delivery progress</h2>
                <p className="sub">Follow your order from the shop to your door.</p>
              </div>
              <Clock3 size={19} className="text-muted" />
            </div>
            {cancelled ? (
              <div className="dash-timeline-cancelled">
                <span className="dash-timeline-marker done"><XCircle size={17} /></span>
                <div>
                  <strong>Order cancelled</strong>
                  <p className="tiny mb-0">This order was cancelled and will not be delivered.</p>
                </div>
              </div>
            ) : (
              <ol className="dash-timeline">
                {stages.map((stage, index) => {
                  const done = index < currentStage;
                  const active = index === currentStage;
                  const Icon = stage.icon;
                  return (
                    <li
                      className={`dash-timeline-step ${done ? "done" : ""} ${active ? "active" : ""}`}
                      key={stage.label}
                    >
                      <span className="dash-timeline-marker">
                        {done ? <Check size={15} /> : <Icon size={15} />}
                      </span>
                      <div className="dash-timeline-body">
                        <strong>{stage.label}</strong>
                        <span className="tiny">{stage.caption}</span>
                        {active && index < stages.length - 1 && (
                          <span className="pill gold dash-timeline-now">In progress</span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        </div>

        <aside className="dash-detail-side">
          <div className="summary-card">
            <h2>Order summary</h2>
            <div className="summary-row"><span>Items subtotal</span><strong>{money(subtotal)}</strong></div>
            <div className="summary-row"><span>Delivery</span><strong>Included</strong></div>
            <div className="summary-row"><span>Payment</span><strong>Paid</strong></div>
            <div className="summary-total"><span>Total</span><strong>{money(order.total)}</strong></div>
          </div>

          <div className="panel dash-address-card">
            <div className="d-flex align-items-center gap-2 mb-2">
              <MapPin size={17} className="text-muted" />
              <h3>Delivery address</h3>
            </div>
            <p className="tiny mb-0">{order.address}</p>
            {order.notes && (
              <>
                <div className="divider" />
                <span className="form-label">Note to the shop</span>
                <p className="tiny mb-0">“{order.notes}”</p>
              </>
            )}
          </div>

          <div className="panel dash-help-card">
            <MessageCircle size={19} />
            <div>
              <h3>Need help?</h3>
              <p className="tiny mb-2">Ask {order.business?.name || "the shop"} about this order.</p>
              <Link to="/dashboard/messages" className="link-btn">Send a message →</Link>
            </div>
          </div>
        </aside>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Cancel this order?"
      >
        <p>
          Are you sure you want to cancel <strong>{order.number}</strong>? This can&apos;t be undone and
          any paid amount will be refunded to your original payment method.
        </p>
        <div className="dash-modal-actions">
          <button type="button" className="mn-btn ghost" onClick={() => setConfirmOpen(false)}>
            Keep order
          </button>
          <button type="button" className="mn-btn clay" onClick={confirmCancel}>
            Yes, cancel order
          </button>
        </div>
      </Modal>
    </>
  );
}
