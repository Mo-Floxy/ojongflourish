import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, SearchX, SlidersHorizontal, Sparkles, X } from "lucide-react";

import { api } from "../api/client";
import { businesses, categories } from "../data/mock";
import EmptyState from "../components/EmptyState";
import Pagination from "../components/Pagination";
import ProductCard from "../components/ProductCard";
import { ErrorState, ProductSkeleton } from "../components/Skeletons";
import { money, plural } from "../lib/format";

const PAGE_SIZE = 8;
const cities = [...new Set(businesses.map((item) => item.city))].sort();
const sortOptions = [
  { value: "", label: "Recommended" },
  { value: "newest", label: "Newest first" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
];

export default function Marketplace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryString = searchParams.toString();
  const params = useMemo(() => new URLSearchParams(queryString), [queryString]);

  const [result, setResult] = useState({ count: 0, results: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [query, setQuery] = useState(params.get("search") || "");
  const [minPrice, setMinPrice] = useState(params.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(params.get("max_price") || "");

  useEffect(() => {
    document.title = "Marketplace · Marketnest";
  }, []);

  useEffect(() => {
    setQuery(params.get("search") || "");
    setMinPrice(params.get("min_price") || "");
    setMaxPrice(params.get("max_price") || "");
  }, [params]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    const request = { page_size: PAGE_SIZE };
    params.forEach((value, key) => {
      if (value) request[key] = value;
    });

    api.get("/products/", { params: request })
      .then(({ data }) => {
        if (!active) return;
        setResult(data);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setError(true);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [params, reloadKey]);

  function setParam(key, value) {
    const next = new URLSearchParams(params);
    if (value === "" || value === null || value === undefined) next.delete(key);
    else next.set(key, value);
    next.delete("page");
    setSearchParams(next);
  }

  function clearAll() {
    setSearchParams({});
  }

  function submitQuery(event) {
    event.preventDefault();
    setParam("search", query.trim());
  }

  function submitPrice(event) {
    event.preventDefault();
    const next = new URLSearchParams(params);
    if (minPrice) next.set("min_price", minPrice);
    else next.delete("min_price");
    if (maxPrice) next.set("max_price", maxPrice);
    else next.delete("max_price");
    next.delete("page");
    setSearchParams(next);
  }

  function goToPage(page) {
    const next = new URLSearchParams(params);
    if (page <= 1) next.delete("page");
    else next.set("page", page);
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const page = Number(params.get("page")) || 1;
  const totalPages = Math.max(1, Math.ceil(result.count / PAGE_SIZE));
  const sortValue = params.get("sort") || "";
  const categoryParam = params.get("category");
  const activeCategory = categories.find(
    (item) => String(item.id) === categoryParam || item.slug === categoryParam
  );

  const activeFilters = [];
  if (params.get("search")) {
    activeFilters.push({ key: "search", label: `“${params.get("search")}”` });
  }
  if (categoryParam) {
    activeFilters.push({ key: "category", label: activeCategory?.name || categoryParam });
  }
  if (params.get("city")) {
    activeFilters.push({ key: "city", label: params.get("city") });
  }
  if (params.get("min_price") || params.get("max_price")) {
    activeFilters.push({
      key: "price",
      label: `${params.get("min_price") ? money(params.get("min_price")) : "₦0"} – ${
        params.get("max_price") ? money(params.get("max_price")) : "any"
      }`,
    });
  }
  if (sortValue) {
    activeFilters.push({
      key: "sort",
      label: sortOptions.find((option) => option.value === sortValue)?.label || sortValue,
    });
  }

  function removeFilter(key) {
    if (key === "price") {
      const next = new URLSearchParams(params);
      next.delete("min_price");
      next.delete("max_price");
      next.delete("page");
      setSearchParams(next);
      return;
    }
    setParam(key, "");
  }

  return (
    <>
      <section className="page-hero light">
        <div className="mn-container">
          <div className="breadcrumbs">
            <Link to="/">Home</Link>
            <span>Marketplace</span>
          </div>
          <span className="eyebrow">Browse the market</span>
          <h1>Find your next favourite thing</h1>
          <p>
            Handpicked pieces from independent shops. Filter by what you love, where it&apos;s made
            and what you want to spend.
          </p>
        </div>
      </section>

      <div className="mn-container pub-market-layout">
        <aside className="panel pub-filters" aria-label="Product filters">
          <div className="pub-filter-head">
            <h2><SlidersHorizontal size={17} /> Filters</h2>
            <button type="button" className="link-btn" onClick={clearAll}>Clear all</button>
          </div>

          <div className="filter-group">
            <h4>Search</h4>
            <form className="toolbar-search pub-filter-search" onSubmit={submitQuery}>
              <Search size={16} aria-hidden="true" />
              <label className="sr-only" htmlFor="filter-search">Search products</label>
              <input
                id="filter-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="What are you looking for?"
              />
            </form>
          </div>

          <div className="filter-group">
            <h4>Categories</h4>
            <div className="chip-row">
              {categories.map((category) => {
                const active =
                  String(category.id) === categoryParam || category.slug === categoryParam;
                return (
                  <button
                    type="button"
                    key={category.id}
                    className={`chip ${active ? "active" : ""}`}
                    onClick={() => setParam("category", active ? "" : String(category.id))}
                    aria-pressed={active}
                  >
                    <span aria-hidden="true">{category.icon}</span>
                    {category.name}
                    <small>{category.count}</small>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="filter-group">
            <h4>City</h4>
            <select
              className="form-select"
              value={params.get("city") || ""}
              onChange={(event) => setParam("city", event.target.value)}
              aria-label="Filter by city"
            >
              <option value="">All cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <form className="filter-group" onSubmit={submitPrice}>
            <h4>Price range</h4>
            <div className="pub-price-row">
              <input
                className="form-control"
                type="number"
                min="0"
                placeholder="Min"
                aria-label="Minimum price"
                value={minPrice}
                onChange={(event) => setMinPrice(event.target.value)}
              />
              <span aria-hidden="true">—</span>
              <input
                className="form-control"
                type="number"
                min="0"
                placeholder="Max"
                aria-label="Maximum price"
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
              />
            </div>
            <button type="submit" className="mn-btn sm ghost wide mt-2">Apply price</button>
          </form>

          <div className="filter-group">
            <h4>Sort by</h4>
            <select
              className="form-select"
              value={sortValue}
              onChange={(event) => setParam("sort", event.target.value)}
              aria-label="Sort products"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </aside>

        <section className="pub-results" aria-label="Products">
          <div className="results-toolbar">
            <div className="results-count">
              <strong>{loading ? "…" : result.count}</strong> {plural(result.count, "find")}
              {activeCategory ? ` in ${activeCategory.name}` : ""}
            </div>
            <div className="toolbar-actions">
              <form className="toolbar-search pub-results-search" onSubmit={submitQuery}>
                <Search size={16} aria-hidden="true" />
                <label className="sr-only" htmlFor="results-search">Search products</label>
                <input
                  id="results-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search finds"
                />
              </form>
              <select
                className="sort-select"
                value={sortValue}
                onChange={(event) => setParam("sort", event.target.value)}
                aria-label="Sort products"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          {activeFilters.length > 0 && (
            <div className="pub-active-filters">
              {activeFilters.map((filter) => (
                <button
                  type="button"
                  className="pub-active-filter"
                  key={filter.key}
                  onClick={() => removeFilter(filter.key)}
                  aria-label={`Remove ${filter.label} filter`}
                >
                  {filter.label} <X size={12} />
                </button>
              ))}
            </div>
          )}

          {params.get("featured") && (
            <div className="pub-featured-note">
              <Sparkles size={15} />
              Showing the editor&apos;s picks.
              <button type="button" className="link-btn" onClick={() => setParam("featured", "")}>
                Show everything
              </button>
            </div>
          )}

          {loading ? (
            <div className="product-grid" aria-busy="true">
              {Array.from({ length: PAGE_SIZE }, (_, index) => (
                <ProductSkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            <ErrorState
              message="We couldn't load the marketplace right now."
              onRetry={() => setReloadKey((key) => key + 1)}
            />
          ) : result.results.length ? (
            <>
              <div className="product-grid">
                {result.results.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
            </>
          ) : (
            <EmptyState
              icon={SearchX}
              title="No finds match those filters"
              text="Try a different search, widen your price range or clear the filters to see everything."
              action={
                <button type="button" className="mn-btn" onClick={clearAll}>
                  Clear all filters
                </button>
              }
            />
          )}
        </section>
      </div>
    </>
  );
}
