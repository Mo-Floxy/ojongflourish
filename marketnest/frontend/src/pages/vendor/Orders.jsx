import { useEffect, useMemo, useState } from "react";
import { Eye, FileText, MapPin, Search } from "lucide-react";
import Avatar from "../../components/Avatar";
import EmptyState from "../../components/EmptyState";
import Modal from "../../components/Modal";
import StatusPill from "../../components/StatusPill";
import Thumb from "../../components/Thumb";
import { vendorOrders } from "../../data/mock";
import { useToast } from "../../context/ToastContext";
import { formatDate, money, plural } from "../../lib/format";

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "out_for_delivery", label: "Out for delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const chips = [{ value: "all", label: "All orders" }, ...statusOptions];

export default function Orders() {
  useEffect(() => {
    document.title = "Orders · Marketnest";
  }, []);

  const toast = useToast();
  const [orders, setOrders] = useState(vendorOrders);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [detailId, setDetailId] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  const filtered = useMemo(
    () =>
      orders.filter((order) => {
        const term = search.trim().toLowerCase();
        const matchesSearch = !term || order.number.toLowerCase().includes(term);
        const matchesFilter = filter === "all" || order.status === filter;
        return matchesSearch && matchesFilter;
      }),
    [orders, search, filter]
  );

  const detail = orders.find((order) => order.id === detailId) || null;
  const pending = orders.filter((order) => order.status === "pending").length;

  function handleStatusChange(order, nextStatus) {
    if (nextStatus === order.status) return;
    if (nextStatus === "cancelled") {
      setCancelTarget(order);
      return;
    }
    setOrders((current) =>
      current.map((item) => (item.id === order.id ? { ...item, status: nextStatus } : item))
    );
    toast.success("Status updated", `${order.number} is now ${nextStatus.replaceAll("_", " ")}.`);
  }

  function confirmCancel() {
    if (!cancelTarget) return;
    setOrders((current) =>
      current.map((item) =>
        item.id === cancelTarget.id ? { ...item, status: "cancelled" } : item
      )
    );
    toast.info("Order cancelled", `${cancelTarget.number} has been cancelled.`);
    setCancelTarget(null);
  }

  return (
    <div className="vnd-page">
      <header className="dash-header">
        <div>
          <span className="eyebrow">Fulfilment</span>
          <h1>Orders</h1>
          <p>
            {pending} {plural(pending, "order")} waiting to be confirmed
          </p>
        </div>
      </header>

      <section className="panel vnd-table-panel">
        <div className="results-toolbar">
          <label className="toolbar-search">
            <Search size={16} />
            <span className="sr-only">Search by order number</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search order number…"
            />
          </label>
          <span className="results-count">
            <strong>{filtered.length}</strong> {plural(filtered.length, "order")}
          </span>
        </div>

        <div className="chip-row vnd-filter-chips" aria-label="Filter orders by status">
          {chips.map((chip) => (
            <button
              type="button"
              key={chip.value}
              className={`chip ${filter === chip.value ? "active" : ""}`}
              onClick={() => setFilter(chip.value)}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {filtered.length ? (
          <div className="mn-table-wrap">
            <table className="mn-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th className="vnd-align-right">Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <div className="vnd-order-number">
                        <strong>{order.number}</strong>
                        <span>{formatDate(order.created_at)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="vnd-order-customer">
                        <Avatar name={order.customer} size={32} />
                        <span>{order.customer}</span>
                      </div>
                    </td>
                    <td>{order.item_count} {plural(order.item_count, "item")}</td>
                    <td><strong>{money(order.total)}</strong></td>
                    <td>
                      <select
                        className={`form-select vnd-status-select vnd-status-${order.status}`}
                        aria-label={`Status for ${order.number}`}
                        value={order.status}
                        onChange={(event) => handleStatusChange(order, event.target.value)}
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="table-icon-btn"
                          aria-label={`View details for ${order.number}`}
                          title="View details"
                          onClick={() => setDetailId(order.id)}
                        >
                          <Eye size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Search}
            title="No orders found"
            text="Try a different order number or status filter."
            action={
              <button
                type="button"
                className="mn-btn sm ghost"
                onClick={() => {
                  setSearch("");
                  setFilter("all");
                }}
              >
                Clear filters
              </button>
            }
          />
        )}
      </section>

      <Modal
        open={Boolean(detail)}
        onClose={() => setDetailId(null)}
        title="Order details"
        size="lg"
      >
        {detail && (
          <div className="vnd-order-detail">
            <div className="vnd-order-detail-head">
              <div>
                <span className="tiny">Order number</span>
                <h3>{detail.number}</h3>
              </div>
              <StatusPill status={detail.status} />
            </div>

            <div className="vnd-order-meta-grid">
              <div>
                <span className="form-label">Customer</span>
                <strong>{detail.customer}</strong>
              </div>
              <div>
                <span className="form-label">Placed on</span>
                <strong>{formatDate(detail.created_at)}</strong>
              </div>
              <div>
                <span className="form-label">Items</span>
                <strong>{detail.item_count} {plural(detail.item_count, "item")}</strong>
              </div>
            </div>

            <h4 className="vnd-order-section-title">Items in this order</h4>
            <div className="vnd-order-lines">
              {detail.items.map((line, index) => (
                <div className="vnd-order-line" key={`${line.product.id}-${index}`}>
                  <Thumb
                    className="vnd-order-line-thumb"
                    src={line.product.image}
                    alt={line.product.name}
                    mark={line.product.name.charAt(0)}
                  />
                  <div className="vnd-order-line-info">
                    <strong>{line.product.name}</strong>
                    <span>{line.quantity} × {money(line.product.price)}</span>
                  </div>
                  <strong>{money(line.line_total)}</strong>
                </div>
              ))}
            </div>

            <div className="vnd-order-total">
              <span>Order total</span>
              <strong>{money(detail.total)}</strong>
            </div>

            <div className="vnd-order-info-grid">
              <div className="vnd-order-info-block">
                <h4><MapPin size={15} /> Delivery address</h4>
                <p>{detail.address}</p>
              </div>
              <div className="vnd-order-info-block">
                <h4><FileText size={15} /> Customer notes</h4>
                <p>{detail.notes || "No notes for this order."}</p>
              </div>
            </div>

            <div className="vnd-modal-actions">
              <button type="button" className="mn-btn" onClick={() => setDetailId(null)}>
                Done
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        title="Cancel this order?"
      >
        <p className="vnd-confirm-text">
          Order <strong>{cancelTarget?.number}</strong> from {cancelTarget?.customer} will be
          marked as cancelled. The customer won&apos;t receive these items.
        </p>
        <div className="vnd-modal-actions">
          <button type="button" className="mn-btn ghost" onClick={() => setCancelTarget(null)}>
            Keep order
          </button>
          <button type="button" className="mn-btn clay" onClick={confirmCancel}>
            Cancel order
          </button>
        </div>
      </Modal>
    </div>
  );
}
