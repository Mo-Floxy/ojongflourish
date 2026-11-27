import { Link } from "react-router-dom";
import { MapPin, Star } from "lucide-react";
import Thumb from "./Thumb";
import { plural } from "../lib/format";

export default function BusinessCard({ business }) {
  return (
    <article className="business-card">
      <Link to={`/business/${business.slug}`} className="business-banner">
        <Thumb src={business.banner} alt={business.name} mark={business.name.slice(0, 1)} />
      </Link>
      <div className="business-body">
        <Link to={`/business/${business.slug}`} className="business-avatar">
          <Thumb src={business.logo} alt={business.name} mark={business.name.slice(0, 1)} />
        </Link>
        <div className="info">
          <h3><Link to={`/business/${business.slug}`}>{business.name}</Link></h3>
          <div className="product-meta mb-1">
            <Star size={13} fill="currentColor" color="var(--gold)" />
            <span>{business.rating} · {business.review_count} {plural(business.review_count, "review")}</span>
          </div>
          <div className="tiny"><MapPin size={12} style={{ verticalAlign: -2 }} /> {business.city}</div>
          <p className="tiny" style={{ marginTop: 8 }}>{business.tagline}</p>
          <div className="business-tags">
            {business.tags.slice(0, 3).map((tag) => (
              <span className="business-tag" key={tag}>{tag}</span>
            ))}
          </div>
          <Link to={`/business/${business.slug}`} className="mn-btn sm ghost">
            Visit shop
          </Link>
        </div>
      </div>
    </article>
  );
}
