import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, SearchX, Store } from "lucide-react";

import { businesses } from "../data/mock";
import BusinessCard from "../components/BusinessCard";
import EmptyState from "../components/EmptyState";
import Pagination from "../components/Pagination";
import { PageSpinner } from "../components/Skeletons";
import { plural } from "../lib/format";

const PAGE_SIZE = 6;
const cities = [...new Set(businesses.map((item) => item.city))].sort();

export default function Businesses() {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Independent shops · Marketnest";
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 160);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [query, city]);

  const term = query.trim().toLowerCase();
  const filtered = businesses.filter((business) => {
    const searchable = `${business.name} ${business.tagline} ${business.city} ${business.area} ${business.tags.join(" ")}`.toLowerCase();
    return (!term || searchable.includes(term)) && (!city || business.city === city);
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function resetFilters() {
    setQuery("");
    setCity("");
  }

  return (
    <>
      <section className="page-hero">
        <div className="mn-container">
          <div className="breadcrumbs">
            <Link to="/">Home</Link>
            <span>Shops</span>
          </div>
          <span className="eyebrow">Independent makers</span>
          <h1>Meet the shops near you</h1>
          <p>
            Every shop on Marketnest is independent, locally rooted and run by people who care
            about what they make. Start with a city or a name you love.
          </p>
        </div>
      </section>

      <div className="mn-container page-section tight">
        <div className="results-toolbar pub-business-toolbar">
          <div className="results-count">
            <Store size={15} style={{ verticalAlign: -3 }} />{" "}
            <strong>{filtered.length}</strong> {plural(filtered.length, "shop")} to explore
          </div>
          <div className="toolbar-actions">
            <form className="toolbar-search" onSubmit={(event) => event.preventDefault()}>
              <Search size={16} aria-hidden="true" />
              <label className="sr-only" htmlFor="shop-search">Search shops</label>
              <input
                id="shop-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search shops or makers"
              />
            </form>
            <select
              className="sort-select"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              aria-label="Filter shops by city"
            >
              <option value="">All cities</option>
              {cities.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            {(query || city) && (
              <button type="button" className="link-btn" onClick={resetFilters}>Clear</button>
            )}
          </div>
        </div>

        {loading ? (
          <PageSpinner label="Finding shops" />
        ) : visible.length ? (
          <>
            <div className="business-grid">
              {visible.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        ) : (
          <EmptyState
            icon={SearchX}
            title="No shops found"
            text="Try another name, tag or city — or clear the filters to see every shop."
            action={
              <button type="button" className="mn-btn" onClick={resetFilters}>
                Show all shops
              </button>
            }
          />
        )}
      </div>
    </>
  );
}
