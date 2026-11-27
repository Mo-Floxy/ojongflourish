import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquareQuote, PenLine, Plus, Star, Trash2 } from "lucide-react";
import EmptyState from "../../components/EmptyState";
import Modal from "../../components/Modal";
import Rating from "../../components/Rating";
import Thumb from "../../components/Thumb";
import { useToast } from "../../context/ToastContext";
import { businesses, products, reviews as seedReviews } from "../../data/mock";
import { plural } from "../../lib/format";

function StarPicker({ value, onChange, label }) {
  return (
    <div className="dash-star-picker" role="group" aria-label={label}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          type="button"
          key={star}
          className={`dash-star-btn ${star <= value ? "active" : ""}`}
          onClick={() => onChange(star)}
          aria-label={`${star} ${plural(star, "star")}`}
          aria-pressed={star === value}
        >
          <Star size={27} fill={star <= value ? "currentColor" : "none"} />
        </button>
      ))}
    </div>
  );
}

const blankWrite = () => ({ product_id: products[0].id, rating: 5, body: "" });

export default function Reviews() {
  const toast = useToast();
  const [reviewList, setReviewList] = useState(seedReviews);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 5, body: "" });
  const [deleting, setDeleting] = useState(null);
  const [writing, setWriting] = useState(false);
  const [writeForm, setWriteForm] = useState(blankWrite);

  useEffect(() => {
    document.title = "My reviews · Marketnest";
  }, []);

  function openEdit(review) {
    setEditing(review);
    setEditForm({ rating: review.rating, body: review.body });
  }

  function saveEdit(event) {
    event.preventDefault();
    if (!editForm.body.trim()) {
      toast.error("Add a few words", "Your review needs some text before saving.");
      return;
    }
    setReviewList((current) =>
      current.map((review) =>
        review.id === editing.id
          ? { ...review, rating: editForm.rating, body: editForm.body.trim(), at: `${review.at} (edited)` }
          : review
      )
    );
    setEditing(null);
    toast.success("Review updated", "Your changes are now live.");
  }

  function confirmDelete() {
    setReviewList((current) => current.filter((review) => review.id !== deleting.id));
    toast.success("Review deleted", "Your review has been removed.");
    setDeleting(null);
  }

  function saveWrite(event) {
    event.preventDefault();
    if (!writeForm.body.trim()) {
      toast.error("Add a few words", "Tell other shoppers what you thought.");
      return;
    }
    const product = products.find((item) => item.id === Number(writeForm.product_id)) || products[0];
    const business =
      product.business || businesses.find((item) => item.id === product.business_id) || businesses[0];
    setReviewList((current) => [
      {
        id: Date.now(),
        product,
        business,
        rating: writeForm.rating,
        author: "You",
        at: "Just now",
        body: writeForm.body.trim(),
      },
      ...current,
    ]);
    setWriteForm(blankWrite());
    setWriting(false);
    toast.success("Review published", `Thanks for reviewing ${product.name}.`);
  }

  return (
    <>
      <header className="dash-header">
        <div>
          <span className="eyebrow">Your voice</span>
          <h1>My reviews</h1>
          <p>
            {reviewList.length
              ? `You've shared ${reviewList.length} ${plural(reviewList.length, "review")} with the community.`
              : "Share what you think about the pieces you've bought."}
          </p>
        </div>
        <div className="dash-actions">
          <button type="button" className="mn-btn" onClick={() => setWriting(true)}>
            <Plus size={15} /> Write a review
          </button>
        </div>
      </header>

      <section className="panel dash-reviews-panel">
        <div className="panel-head">
          <h2>Reviews you&apos;ve written</h2>
          <span className="pill">{reviewList.length} total</span>
        </div>
        {reviewList.length ? (
          <div>
            {reviewList.map((review) => (
              <article className="review-card dash-review-card" key={review.id}>
                <div className="dash-review-head">
                  <Link to={`/product/${review.product.slug}`} className="dash-review-thumb">
                    <Thumb src={review.product.image} alt={review.product.name} mark={review.product.name[0]} />
                  </Link>
                  <div className="dash-review-info">
                    <h3><Link to={`/product/${review.product.slug}`}>{review.product.name}</Link></h3>
                    <span className="tiny">{review.business?.name || "Marketnest shop"}</span>
                    <Rating value={review.rating} />
                  </div>
                  <div className="dash-review-actions">
                    <button
                      type="button"
                      className="table-icon-btn"
                      aria-label={`Edit review of ${review.product.name}`}
                      onClick={() => openEdit(review)}
                    >
                      <PenLine size={15} />
                    </button>
                    <button
                      type="button"
                      className="table-icon-btn danger"
                      aria-label={`Delete review of ${review.product.name}`}
                      onClick={() => setDeleting(review)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <p>{review.body}</p>
                <span className="tiny dash-review-date">{review.author} · {review.at}</span>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={MessageSquareQuote}
            title="No reviews yet"
            text="Your reviews help other shoppers find pieces they'll love."
            action={<button type="button" className="mn-btn sm" onClick={() => setWriting(true)}>Write your first review</button>}
          />
        )}
      </section>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title="Edit your review">
        <form onSubmit={saveEdit}>
          {editing && (
            <>
              <div className="dash-review-target">
                <div className="dash-review-thumb">
                  <Thumb src={editing.product.image} alt={editing.product.name} mark={editing.product.name[0]} />
                </div>
                <div><strong>{editing.product.name}</strong><span className="tiny">{editing.business?.name}</span></div>
              </div>
              <label className="form-label">Your rating</label>
              <StarPicker value={editForm.rating} onChange={(rating) => setEditForm((f) => ({ ...f, rating }))} label="Rating" />
              <label className="form-label mt-3" htmlFor="edit-review-body">Your review</label>
              <textarea
                id="edit-review-body"
                className="form-control"
                rows="5"
                maxLength={600}
                value={editForm.body}
                onChange={(event) => setEditForm((f) => ({ ...f, body: event.target.value }))}
              />
              <div className="dash-modal-actions">
                <button type="button" className="mn-btn ghost" onClick={() => setEditing(null)}>Cancel</button>
                <button type="submit" className="mn-btn">Save changes</button>
              </div>
            </>
          )}
        </form>
      </Modal>

      <Modal open={Boolean(deleting)} onClose={() => setDeleting(null)} title="Delete this review?">
        <p>
          Your review of <strong>{deleting?.product.name}</strong> will be permanently removed.
        </p>
        <div className="dash-modal-actions">
          <button type="button" className="mn-btn ghost" onClick={() => setDeleting(null)}>Keep review</button>
          <button type="button" className="mn-btn clay" onClick={confirmDelete}>Delete review</button>
        </div>
      </Modal>

      <Modal open={writing} onClose={() => setWriting(false)} title="Write a review">
        <form onSubmit={saveWrite}>
          <label className="form-label" htmlFor="write-review-product">Product</label>
          <select
            id="write-review-product"
            className="form-select"
            value={writeForm.product_id}
            onChange={(event) => setWriteForm((f) => ({ ...f, product_id: Number(event.target.value) }))}
          >
            {products.map((product) => (
              <option value={product.id} key={product.id}>{product.name} — {product.business?.name}</option>
            ))}
          </select>
          <label className="form-label mt-3">Your rating</label>
          <StarPicker value={writeForm.rating} onChange={(rating) => setWriteForm((f) => ({ ...f, rating }))} label="Rating" />
          <label className="form-label mt-3" htmlFor="write-review-body">Your review</label>
          <textarea
            id="write-review-body"
            className="form-control"
            rows="5"
            maxLength={600}
            placeholder="What did you love about it? How was the packaging?"
            value={writeForm.body}
            onChange={(event) => setWriteForm((f) => ({ ...f, body: event.target.value }))}
          />
          <span className="tiny">{writeForm.body.length}/600 characters</span>
          <div className="dash-modal-actions">
            <button type="button" className="mn-btn ghost" onClick={() => setWriting(false)}>Cancel</button>
            <button type="submit" className="mn-btn">Publish review</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
