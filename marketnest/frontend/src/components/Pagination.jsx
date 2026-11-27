import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page = 1, totalPages = 1, onChange }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  return (
    <nav className="pagination" aria-label="Pages">
      <button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ChevronLeft size={15} />
      </button>
      {pages.map((item) => (
        <button
          type="button"
          key={item}
          className={item === page ? "active" : ""}
          aria-current={item === page ? "page" : undefined}
          onClick={() => onChange(item)}
        >
          {item}
        </button>
      ))}
      <button type="button" aria-label="Next page" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        <ChevronRight size={15} />
      </button>
    </nav>
  );
}
