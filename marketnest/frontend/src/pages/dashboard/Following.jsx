import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Search, Star, Store, UserCheck, UserPlus } from "lucide-react";
import EmptyState from "../../components/EmptyState";
import Thumb from "../../components/Thumb";
import { useToast } from "../../context/ToastContext";
import { businesses } from "../../data/mock";
import { plural } from "../../lib/format";

export default function Following() {
  const toast = useToast();
  const [followedIds, setFollowedIds] = useState(() =>
    businesses.filter((business) => business.is_following).map((business) => business.id)
  );
  const [discoverSearch, setDiscoverSearch] = useState("");

  useEffect(() => {
    document.title = "Following · Marketnest";
  }, []);

  const followed = businesses.filter((business) => followedIds.includes(business.id));
  const discover = businesses.filter((business) => {
    const matches = `${business.name} ${business.category} ${business.city}`
      .toLowerCase()
      .includes(discoverSearch.trim().toLowerCase());
    return !followedIds.includes(business.id) && matches;
  });

  function toggleFollow(business) {
    const alreadyFollowing = followedIds.includes(business.id);
    setFollowedIds((current) =>
      alreadyFollowing ? current.filter((id) => id !== business.id) : [...current, business.id]
    );
    toast.info(
      alreadyFollowing ? `Unfollowed ${business.name}` : `Following ${business.name}`,
      alreadyFollowing
        ? "You'll no longer see their updates here."
        : "Their new pieces will show up in your feed."
    );
  }

  return (
    <>
      <header className="dash-header">
        <div>
          <span className="eyebrow">Your circle of makers</span>
          <h1>Following</h1>
          <p>
            {followed.length
              ? `You're following ${followed.length} ${plural(followed.length, "shop")}.`
              : "Follow shops to keep up with their latest finds."}
          </p>
        </div>
        <div className="dash-actions">
          <Link to="/businesses" className="mn-btn ghost">Browse shops</Link>
        </div>
      </header>

      {followed.length ? (
        <div className="business-grid dash-following-grid">
          {followed.map((business) => (
            <article className="business-card dash-follow-card" key={business.id}>
              <Link to={`/business/${business.slug}`} className="business-banner">
                <Thumb src={business.banner} alt={business.name} mark={business.name[0]} />
              </Link>
              <div className="business-body">
                <Link to={`/business/${business.slug}`} className="business-avatar">
                  <Thumb src={business.logo} alt={business.name} mark={business.name[0]} />
                </Link>
                <div className="info wide">
                  <h3><Link to={`/business/${business.slug}`}>{business.name}</Link></h3>
                  <div className="product-meta mb-1">
                    <Star size={13} fill="currentColor" color="var(--gold)" />
                    <span>{business.rating} · {business.review_count} {plural(business.review_count, "review")}</span>
                  </div>
                  <div className="tiny"><MapPin size={12} /> {business.city} · {business.category}</div>
                  <p className="tiny mt-2">{business.tagline}</p>
                  <div className="business-tags">
                    {business.tags.slice(0, 3).map((tag) => <span className="business-tag" key={tag}>{tag}</span>)}
                  </div>
                  <div className="dash-follow-actions">
                    <Link to={`/business/${business.slug}`} className="mn-btn sm ghost">Visit shop</Link>
                    <button type="button" className="mn-btn sm" onClick={() => toggleFollow(business)}>
                      <UserCheck size={14} /> Following
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="panel">
          <EmptyState
            icon={Store}
            title="You're not following any shops yet"
            text="Follow a shop to see their new arrivals and stories here."
            action={<Link to="/businesses" className="mn-btn sm">Discover shops</Link>}
          />
        </div>
      )}

      <section className="dash-discover-section">
        <div className="results-toolbar">
          <div>
            <h2>Discover more shops</h2>
            <p className="sub">More independent makers waiting to be found.</p>
          </div>
          <div className="toolbar-search">
            <Search size={16} />
            <input
              value={discoverSearch}
              onChange={(event) => setDiscoverSearch(event.target.value)}
              placeholder="Search shops"
              aria-label="Search shops to follow"
            />
          </div>
        </div>
        {discover.length ? (
          <div className="dash-discover-list">
            {discover.map((business) => (
              <div className="panel dash-discover-row" key={business.id}>
                <div className="dash-discover-avatar">
                  <Thumb src={business.logo} alt={business.name} mark={business.name[0]} />
                </div>
                <div className="dash-discover-info">
                  <strong>{business.name}</strong>
                  <span className="tiny">
                    {business.category} · {business.city} · {business.product_count} {plural(business.product_count, "piece")}
                  </span>
                </div>
                <div className="dash-discover-actions">
                  <Link to={`/business/${business.slug}`} className="link-btn">Visit</Link>
                  <button type="button" className="mn-btn sm ghost" onClick={() => toggleFollow(business)}>
                    <UserPlus size={14} /> Follow
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted dash-discover-empty">
            {discoverSearch ? "No shops match that search." : "You're following every shop on Marketnest. Nice!"}
          </p>
        )}
      </section>
    </>
  );
}
