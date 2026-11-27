import { useEffect, useState } from "react";
import { Layers3, Pencil, Plus, Tags, Trash2 } from "lucide-react";
import Modal from "../../components/Modal";
import { vendorCategories } from "../../data/mock";
import { useToast } from "../../context/ToastContext";
import { plural } from "../../lib/format";

const emptyDraft = { name: "", description: "" };

export default function Categories() {
  useEffect(() => {
    document.title = "Categories · Marketnest";
  }, []);

  const toast = useToast();
  const [items, setItems] = useState(vendorCategories);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ ...emptyDraft });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const totalProducts = items.reduce((sum, item) => sum + Number(item.product_count || 0), 0);
  const editingItem = items.find((item) => item.id === editingId) || null;

  function openCreate() {
    setEditingId(null);
    setDraft({ ...emptyDraft });
    setFormOpen(true);
  }

  function openEdit(item) {
    setEditingId(item.id);
    setDraft({ name: item.name, description: item.description || "" });
    setFormOpen(true);
  }

  function handleSave(event) {
    event.preventDefault();
    const name = draft.name.trim();
    if (!name) {
      toast.error("Name needed", "Give your category a name before saving.");
      return;
    }
    const duplicate = items.some(
      (item) => item.id !== editingId && item.name.toLowerCase() === name.toLowerCase()
    );
    if (duplicate) {
      toast.error("Already exists", "You already have a category with that name.");
      return;
    }

    const payload = { name, description: draft.description.trim() };
    if (editingItem) {
      setItems((current) =>
        current.map((item) => (item.id === editingItem.id ? { ...item, ...payload } : item))
      );
      toast.success("Category updated", `${name} has been saved.`);
    } else {
      setItems((current) => [
        ...current,
        { ...payload, id: Math.max(0, ...current.map((item) => item.id)) + 1, product_count: 0 },
      ]);
      toast.success("Category added", `${name} is ready for your products.`);
    }
    setFormOpen(false);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    setItems((current) => current.filter((item) => item.id !== deleteTarget.id));
    toast.success("Category deleted", `${deleteTarget.name} was removed.`);
    setDeleteTarget(null);
  }

  return (
    <div className="vnd-page">
      <header className="dash-header">
        <div>
          <span className="eyebrow">Organise your shop</span>
          <h1>Categories</h1>
          <p>
            {items.length} {plural(items.length, "collection")} · {totalProducts} products grouped
          </p>
        </div>
        <div className="dash-actions">
          <button type="button" className="mn-btn" onClick={openCreate}>
            <Plus size={16} /> Add category
          </button>
        </div>
      </header>

      <section className="panel vnd-category-panel">
        <div className="panel-head">
          <div>
            <h3>Your collections</h3>
            <p className="sub">Group similar pieces so shoppers can browse with ease.</p>
          </div>
          <span className="vnd-category-summary">
            <Layers3 size={15} /> {items.length} total
          </span>
        </div>

        {items.length ? (
          <div className="vnd-category-grid">
            {items.map((item, index) => (
              <article className="vnd-category-card" key={item.id}>
                <div className="vnd-category-head">
                  <span className={`vnd-category-icon tone-${index % 4}`}>
                    <Tags size={19} />
                  </span>
                  <span className="pill">
                    {item.product_count} {plural(item.product_count, "product")}
                  </span>
                </div>
                <h3>{item.name}</h3>
                <p className="vnd-category-desc">
                  {item.description || "No description added yet."}
                </p>
                <div className="vnd-category-foot">
                  <span className="tiny">ID #{String(item.id).padStart(3, "0")}</span>
                  <div className="table-actions">
                    <button
                      type="button"
                      className="table-icon-btn"
                      aria-label={`Edit ${item.name}`}
                      title="Edit category"
                      onClick={() => openEdit(item)}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      className="table-icon-btn danger"
                      aria-label={`Delete ${item.name}`}
                      title="Delete category"
                      onClick={() => setDeleteTarget(item)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="tiny vnd-panel-empty">No categories yet. Add one to get started.</p>
        )}
      </section>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingItem ? "Edit category" : "Add a category"}
      >
        <form className="vnd-modal-form" onSubmit={handleSave}>
          <div className="vnd-field">
            <label className="form-label" htmlFor="vnd-category-name">Name</label>
            <input
              id="vnd-category-name"
              className="form-control"
              value={draft.name}
              onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
              placeholder="Ceramics"
            />
          </div>
          <div className="vnd-field">
            <label className="form-label" htmlFor="vnd-category-description">Description</label>
            <textarea
              id="vnd-category-description"
              className="form-control"
              rows={3}
              value={draft.description}
              onChange={(event) =>
                setDraft((current) => ({ ...current, description: event.target.value }))
              }
              placeholder="Mugs, plates, bowls and little vessels"
            />
          </div>
          <div className="vnd-modal-actions">
            <button type="button" className="mn-btn ghost" onClick={() => setFormOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="mn-btn">
              {editingItem ? "Save changes" : "Add category"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete category?"
      >
        <p className="vnd-confirm-text">
          <strong>{deleteTarget?.name}</strong> will be removed. Products in it stay in your shop,
          but they&apos;ll no longer have this category.
        </p>
        <div className="vnd-modal-actions">
          <button type="button" className="mn-btn ghost" onClick={() => setDeleteTarget(null)}>
            Keep category
          </button>
          <button type="button" className="mn-btn clay" onClick={confirmDelete}>
            <Trash2 size={15} /> Delete category
          </button>
        </div>
      </Modal>
    </div>
  );
}
