import { useEffect, useMemo, useRef, useState } from "react";
import { Eye, EyeOff, Pencil, Plus, Search, Trash2 } from "lucide-react";
import EmptyState from "../../components/EmptyState";
import ImageUpload from "../../components/ImageUpload";
import Modal from "../../components/Modal";
import Pagination from "../../components/Pagination";
import Thumb from "../../components/Thumb";
import { products, vendorCategories, vendorUser } from "../../data/mock";
import { useToast } from "../../context/ToastContext";
import { money } from "../../lib/format";

const PAGE_SIZE = 3;
const LOW_STOCK_AT = 10;

const blankDraft = {
  name: "",
  category: vendorCategories[0]?.name || "",
  description: "",
  price: "",
  compare_at_price: "",
  stock: "",
  is_active: true,
};

function statusOf(item) {
  if (!item.is_active) return "draft";
  if (item.stock > 0 && item.stock <= LOW_STOCK_AT) return "low_stock";
  return "active";
}

const statusLabels = {
  active: "Active",
  draft: "Draft",
  low_stock: "Low stock",
};

const statusPillTone = {
  active: "teal",
  draft: "clay",
  low_stock: "gold",
};

export default function Products() {
  useEffect(() => {
    document.title = "Products · Marketnest";
  }, []);

  const toast = useToast();
  const createdUrls = useRef([]);
  useEffect(
    () => () => createdUrls.current.forEach((url) => URL.revokeObjectURL(url)),
    []
  );

  // Seed one draft locally so the draft filter has something to show in this UI-first build.
  const seeded = useMemo(
    () =>
      products
        .filter((item) => item.business_id === vendorUser.business_id)
        .map((item) => ({ ...item, is_active: item.id !== 3 })),
    []
  );

  const [items, setItems] = useState(seeded);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ ...blankDraft });
  const [imageFiles, setImageFiles] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const editingItem = items.find((item) => item.id === editingId) || null;

  const filtered = items.filter((item) => {
    const term = search.trim().toLowerCase();
    const matchesSearch =
      !term || `${item.name} ${item.category}`.toLowerCase().includes(term);
    const matchesStatus = status === "all" || statusOf(item) === status;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [search, status]);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  function update(field) {
    return (event) => setDraft((current) => ({ ...current, [field]: event.target.value }));
  }

  function openCreate() {
    setEditingId(null);
    setDraft({ ...blankDraft });
    setImageFiles([]);
    setFormOpen(true);
  }

  function openEdit(item) {
    setEditingId(item.id);
    setDraft({
      name: item.name,
      category: item.category,
      description: item.description || "",
      price: String(item.price),
      compare_at_price: item.compare_at_price ? String(item.compare_at_price) : "",
      stock: String(item.stock),
      is_active: item.is_active,
    });
    setImageFiles([]);
    setFormOpen(true);
  }

  function handleSave(event) {
    event.preventDefault();
    const name = draft.name.trim();
    const price = Number(draft.price);
    const stock = Number(draft.stock);
    const compareAt = draft.compare_at_price ? Number(draft.compare_at_price) : null;

    if (!name) {
      toast.error("Name needed", "Give your product a name before saving.");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      toast.error("Check the price", "Enter a price greater than zero.");
      return;
    }
    if (!Number.isInteger(stock) || stock < 0) {
      toast.error("Check the stock", "Stock must be a whole number of units.");
      return;
    }
    if (compareAt !== null && (!Number.isFinite(compareAt) || compareAt < price)) {
      toast.error("Check compare-at price", "It should be equal to or higher than the price.");
      return;
    }

    const category = vendorCategories.find(
      (item) => item.name.toLowerCase() === draft.category.trim().toLowerCase()
    );
    const image = imageFiles[0]
      ? (() => {
          const url = URL.createObjectURL(imageFiles[0]);
          createdUrls.current.push(url);
          return url;
        })()
      : editingItem?.image || "/images/products/stoneware-mug.jpg";

    const payload = {
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `product-${Date.now()}`,
      category: draft.category.trim() || "Uncategorised",
      category_id: category?.id || null,
      description: draft.description.trim(),
      price,
      compare_at_price: compareAt,
      stock,
      is_active: draft.is_active,
      image,
    };

    if (editingItem) {
      setItems((current) =>
        current.map((item) => (item.id === editingItem.id ? { ...item, ...payload } : item))
      );
      toast.success("Product updated", `${name} is up to date.`);
    } else {
      const nextId = Math.max(0, ...items.map((item) => item.id)) + 1;
      setItems((current) => [
        {
          ...payload,
          id: nextId,
          business_id: vendorUser.business_id,
          business: { id: vendorUser.business_id, name: "Ember & Oak", slug: "ember-and-oak" },
          rating: 0,
          review_count: 0,
          sold_count: 0,
          gallery: [image],
          badge: null,
          featured: false,
          created_at: new Date().toISOString().slice(0, 10),
        },
        ...current,
      ]);
      toast.success("Product added", `${name} has been added to your shop.`);
    }
    setFormOpen(false);
  }

  function togglePublish(item) {
    const next = !item.is_active;
    setItems((current) =>
      current.map((entry) => (entry.id === item.id ? { ...entry, is_active: next } : entry))
    );
    toast.success(
      next ? "Product published" : "Product unpublished",
      `${item.name} is now ${next ? "live" : "a draft"}.`
    );
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    setItems((current) => current.filter((item) => item.id !== deleteTarget.id));
    toast.success("Product deleted", `${deleteTarget.name} was removed from your shop.`);
    setDeleteTarget(null);
  }

  return (
    <div className="vnd-page">
      <header className="dash-header">
        <div>
          <span className="eyebrow">Inventory</span>
          <h1>Products</h1>
          <p>
            {items.length} pieces in your catalogue · {items.filter((item) => item.is_active).length} live
          </p>
        </div>
        <div className="dash-actions">
          <button type="button" className="mn-btn" onClick={openCreate}>
            <Plus size={16} /> Add product
          </button>
        </div>
      </header>

      <section className="panel vnd-table-panel">
        <div className="results-toolbar">
          <label className="toolbar-search">
            <Search size={16} />
            <span className="sr-only">Search products</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products…"
            />
          </label>
          <div className="toolbar-actions">
            <select
              className="form-select vnd-filter-select"
              aria-label="Filter products by status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="low_stock">Low stock</option>
            </select>
            <span className="results-count">
              Showing <strong>{visible.length}</strong> of <strong>{filtered.length}</strong>
            </span>
          </div>
        </div>

        {visible.length ? (
          <div className="mn-table-wrap">
            <table className="mn-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th className="vnd-align-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => {
                  const itemStatus = statusOf(item);
                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="table-product">
                          <Thumb src={item.image} alt={item.name} mark={item.name.charAt(0)} />
                          <div>
                            <strong>{item.name}</strong>
                            <span>{item.category}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="vnd-price-cell">
                          <strong>{money(item.price)}</strong>
                          {item.compare_at_price && <del>{money(item.compare_at_price)}</del>}
                        </div>
                      </td>
                      <td>
                        <div className="vnd-stock-cell">
                          <strong>{item.stock}</strong>
                          <span>units</span>
                          {item.stock > 0 && item.stock <= LOW_STOCK_AT && (
                            <span className="vnd-stock-warning">Low</span>
                          )}
                          {item.stock === 0 && <span className="vnd-stock-warning">Out</span>}
                        </div>
                      </td>
                      <td>
                        <span className={`pill ${statusPillTone[itemStatus]}`}>
                          {statusLabels[itemStatus]}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="table-icon-btn"
                            aria-label={`Edit ${item.name}`}
                            title="Edit product"
                            onClick={() => openEdit(item)}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            className="table-icon-btn"
                            aria-label={item.is_active ? `Unpublish ${item.name}` : `Publish ${item.name}`}
                            title={item.is_active ? "Unpublish" : "Publish"}
                            onClick={() => togglePublish(item)}
                          >
                            {item.is_active ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                          <button
                            type="button"
                            className="table-icon-btn danger"
                            aria-label={`Delete ${item.name}`}
                            title="Delete product"
                            onClick={() => setDeleteTarget(item)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Search}
            title="No products found"
            text="Try a different search or status filter, or add a new product to your shop."
            action={
              <button type="button" className="mn-btn sm" onClick={openCreate}>
                <Plus size={15} /> Add product
              </button>
            }
          />
        )}

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </section>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingItem ? "Edit product" : "Add a product"}
        size="lg"
      >
        <form className="vnd-modal-form" onSubmit={handleSave}>
          <div className="vnd-form-grid two-col">
            <div className="vnd-field full">
              <label className="form-label" htmlFor="vnd-product-name">Product name</label>
              <input
                id="vnd-product-name"
                className="form-control"
                value={draft.name}
                onChange={update("name")}
                placeholder="Hand-thrown Stoneware Mug"
              />
            </div>
            <div className="vnd-field">
              <label className="form-label" htmlFor="vnd-product-category">Category</label>
              <select
                id="vnd-product-category"
                className="form-select"
                value={draft.category}
                onChange={update("category")}
              >
                {vendorCategories.map((category) => (
                  <option key={category.id} value={category.name}>{category.name}</option>
                ))}
                {!vendorCategories.some((category) => category.name === draft.category) && draft.category && (
                  <option value={draft.category}>{draft.category}</option>
                )}
              </select>
            </div>
            <div className="vnd-field">
              <label className="form-label" htmlFor="vnd-product-stock">Stock (units)</label>
              <input
                id="vnd-product-stock"
                className="form-control"
                type="number"
                min="0"
                step="1"
                value={draft.stock}
                onChange={update("stock")}
                placeholder="12"
              />
            </div>
            <div className="vnd-field">
              <label className="form-label" htmlFor="vnd-product-price">Price (₦)</label>
              <input
                id="vnd-product-price"
                className="form-control"
                type="number"
                min="0"
                step="1"
                value={draft.price}
                onChange={update("price")}
                placeholder="8500"
              />
            </div>
            <div className="vnd-field">
              <label className="form-label" htmlFor="vnd-product-compare">Compare-at price (₦)</label>
              <input
                id="vnd-product-compare"
                className="form-control"
                type="number"
                min="0"
                step="1"
                value={draft.compare_at_price}
                onChange={update("compare_at_price")}
                placeholder="Optional"
              />
            </div>
            <div className="vnd-field full">
              <label className="form-label" htmlFor="vnd-product-description">Description</label>
              <textarea
                id="vnd-product-description"
                className="form-control"
                rows={3}
                value={draft.description}
                onChange={update("description")}
                placeholder="Materials, dimensions and care…"
              />
            </div>
          </div>

          <div className="vnd-field-group vnd-modal-section">
            <h3>Photos</h3>
            {editingItem?.image && !imageFiles.length && (
              <Thumb
                className="vnd-current-image"
                src={editingItem.image}
                alt={editingItem.name}
                mark={editingItem.name.charAt(0)}
              />
            )}
            <ImageUpload
              files={imageFiles}
              onChange={setImageFiles}
              max={4}
              label="Add product photos"
              hint="Upload up to 4 images"
            />
          </div>

          <label className="form-check vnd-switch-row" htmlFor="vnd-product-active">
            <input
              id="vnd-product-active"
              className="form-check-input"
              type="checkbox"
              checked={draft.is_active}
              onChange={(event) => setDraft((current) => ({ ...current, is_active: event.target.checked }))}
            />
            <span className="form-check-label">
              <strong>Live in my shop</strong>
              <span className="tiny">Uncheck to save this product as a draft.</span>
            </span>
          </label>

          <div className="vnd-modal-actions">
            <button type="button" className="mn-btn ghost" onClick={() => setFormOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="mn-btn">
              {editingItem ? "Save changes" : "Add product"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete product?"
      >
        <p className="vnd-confirm-text">
          <strong>{deleteTarget?.name}</strong> will be removed from your catalogue. This can&apos;t be undone.
        </p>
        <div className="vnd-modal-actions">
          <button type="button" className="mn-btn ghost" onClick={() => setDeleteTarget(null)}>
            Keep product
          </button>
          <button type="button" className="mn-btn clay" onClick={confirmDelete}>
            <Trash2 size={15} /> Delete product
          </button>
        </div>
      </Modal>
    </div>
  );
}
