import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Package, Search } from "lucide-react";
import EmptyState from "../../components/EmptyState";
import StatusPill from "../../components/StatusPill";
import { orders } from "../../data/mock";
import { formatDate, money, plural } from "../../lib/format";

const statusFilters = [
  { value: "all", label: "All orders" },
  { value: "pending", label: "Awaiting confirmation" },
  { value: "processing", label: "Being prepared" },
  { value: "out_for_delivery", label: "Out for delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const sorters = {
  newest: (a, b) => new Date(b.created_at) - new Date(a.created_at),
  oldest: (a, b) => new Date(a.created_at) - new Date(b.created_at),
  highest: (a, b) => b.total - a.total,
  lowest: (a, b) => a.total - b.total,
};

export default function Orders() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    document.title = "Orders · Marketnest";
  }, []);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders
      .filter((order) => (status === "all" ? true : order.status === status))
      .filter((order) =>
        term
          ? `${order.number} ${order.business?.name || ""}`.toLowerCase().includes(term)
          : true
      )
      .sort(sorters[sort] || sorters.newest);
  }, [search, status, sort]);

  const filtered = search.trim() || status !== "all";

  function clearFilters() {
    setSearch("");
    setStatus("all");
    setSort("newest");
  }

  return (
    <>
      <header className="dash-header">
        <div>
          <span className="eyebrow">Purchase history</span>
          <h1>Your orders</h1>
          <p>Track deliveries and revisit everything you&apos;ve bought.</p>
        </div>
        <div className="dash-actions">
          <Link to="/marketplace" className="mn-btn ghost">Shop again</Link>
        </div>
      </header>

      <section className="panel dash-orders-panel">
        <div className="results-toolbar">
          <div className="toolbar-actions">
            <div className="toolbar-search">
              <Search size={16} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search order number or shop"
                aria-label="Search orders"
              />
            </div>
            <select
              className="sort-select"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              aria-label="Sort orders"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="highest">Highest total</option>
              <option value="lowest">Lowest total</option>
            </select>
          </div>
          <span className="results-count">
            <strong>{visible.length}</strong> {plural(visible.length, "order")}
          </span>
        </div>

        <div className="chip-row dash-orders-chips" aria-label="Filter by status">
          {statusFilters.map((filter) => {
            const count = filter.value === "all"
              ? orders.length
              : orders.filter((order) => order.status === filter.value).length;
            return (
              <button
                type="button"
                key={filter.value}
                className={`chip ${status === filter.value ? "active" : ""}`}
                onClick={() => setStatus(filter.value)}
                aria-pressed={status === filter.value}
              >
                {filter.label} <span className="dash-chip-count">{count}</span>
              </button>
            );
          })}
        </div>

        {visible.length ? (
          <div className="mn-table-wrap dash-orders-table">
            <table className="mn-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Date</th>
                  <th>Shop</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th><span className="sr-only">View</span></th>
                </tr>
              </thead>
              <tbody>
                {visible.map((order) => (
                  <tr key={order.number}>
                    <td>
                      <Link to={`/dashboard/orders/${order.number}`} className="dash-order-number">
                        {order.number}
                      </Link>
                    </td>
                    <td className="text-muted">{formatDate(order.created_at)}</td>
                    <td>{order.business?.name || "Marketnest shop"}</td>
                    <td className="text-muted">{order.item_count} {plural(order.item_count, "item")}</td>
                    <td><strong>{money(order.total)}</strong></td>
                    <td><StatusPill status={order.status} /></td>
                    <td className="table-actions">
                      <Link
                        to={`/dashboard/orders/${order.number}`}
                        className="table-icon-btn"
                        aria-label={`View order ${order.number}`}
                      >
                        <ArrowUpRight size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Package}
            title="No orders found"
            text={filtered ? "Try a different search or status filter." : "Once you place an order, it will show up here."}
            action={filtered ? (
              <button type="button" className="mn-btn sm ghost" onClick={clearFilters}>Clear filters</button>
            ) : (
              <Link to="/marketplace" className="mn-btn sm">Explore marketplace</Link>
            )}
          />
        )}
      </section>
    </>
  );
}
