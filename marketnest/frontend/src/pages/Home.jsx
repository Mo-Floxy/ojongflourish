import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  HeartHandshake,
  MapPin,
  Search,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";

import { businesses, categories, products } from "../data/mock";
import BusinessCard from "../components/BusinessCard";
import NewsletterSignup from "../components/NewsletterSignup";
import ProductCard from "../components/ProductCard";
import Reveal from "../components/Reveal";
import SectionHead from "../components/SectionHead";
import Thumb from "../components/Thumb";

const steps = [
  {
    icon: Search,
    title: "Find your kind of thing",
    text: "Search by product, style or city and discover shops you didn't know were around the corner.",
  },
  {
    icon: HeartHandshake,
    title: "Talk to the maker",
    text: "Ask a question, request a colour or just say hello. Real people answer, usually within a day.",
  },
  {
    icon: Truck,
    title: "Get it, love it",
    text: "Your order arrives packed with care — and you keep a little more of your money local.",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  useEffect(() => {
    document.title = "Marketnest · Find something made nearby";
  }, []);

  const featured = products.filter((item) => item.featured).slice(0, 4);
  const cities = new Set(businesses.map((item) => item.city));
  const averageRating = (
    businesses.reduce((sum, item) => sum + item.rating, 0) / businesses.length
  ).toFixed(1);
  const stats = [
    { value: businesses.length, label: "independent shops" },
    { value: products.length, label: "handpicked finds" },
    { value: cities.size, label: "cities covered" },
    { value: averageRating, label: "average shop rating" },
  ];
  const heroArt = [products[0], products[5], products[8]];

  function submitSearch(event) {
    event.preventDefault();
    const term = query.trim();
    navigate(term ? `/marketplace?search=${encodeURIComponent(term)}` : "/marketplace");
  }

  return (
    <div className="pub-home">
      <section className="pub-hero">
        <div className="mn-container pub-hero-inner">
          <div className="pub-hero-copy">
            <span className="eyebrow pub-hero-eyebrow">Local finds, real stories</span>
            <h1 className="pub-hero-title">Find something made nearby</h1>
            <p className="pub-hero-sub">
              A little marketplace for big-hearted makers. Discover handmade pieces from
              independent shops in your city — and keep the good stuff close to home.
            </p>
            <form className="pub-hero-search" onSubmit={submitSearch} role="search">
              <Search size={19} aria-hidden="true" />
              <label className="sr-only" htmlFor="home-search">Search products and shops</label>
              <input
                id="home-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Try “stoneware mug” or “canvas tote”"
              />
              <button type="submit" className="mn-btn gold">
                Search <ArrowRight size={16} />
              </button>
            </form>
            <div className="pub-hero-stats">
              {stats.map((stat) => (
                <div className="pub-stat" key={stat.label}>
                  <strong className="pub-stat-value">{stat.value}</strong>
                  <span className="pub-stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pub-hero-art" aria-hidden="true">
            <div className="pub-art-glow" />
            <div className="pub-art-card pub-art-main">
              <Thumb src={heroArt[0].image} alt="" mark="M" />
              <span className="pub-art-label">
                Made by hand <Star size={12} fill="currentColor" />
              </span>
            </div>
            <div className="pub-art-card pub-art-small pub-art-small-a">
              <Thumb src={heroArt[1].image} alt="" mark="M" />
            </div>
            <div className="pub-art-card pub-art-small pub-art-small-b">
              <Thumb src={heroArt[2].image} alt="" mark="M" />
            </div>
            <span className="pub-art-pin"><MapPin size={14} /> Made near you</span>
          </div>
        </div>
      </section>

      <section className="page-section tight">
        <div className="mn-container">
          <div className="pub-categories">
            <span className="pub-categories-label">Browse by category</span>
            <div className="chip-row">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/marketplace?category=${category.id}`}
                  className="chip pub-category-chip"
                >
                  <span aria-hidden="true">{category.icon}</span>
                  {category.name}
                  <small>{category.count}</small>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="mn-container">
          <SectionHead
            eyebrow="Editor's picks"
            title="Featured finds"
            text="A few things we keep coming back to — beautifully made, fairly priced and ready to ship."
            linkTo="/marketplace?featured=1"
            linkLabel="Shop all picks"
          />
          <div className="product-grid">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="pub-how page-section">
        <div className="mn-container">
          <SectionHead
            eyebrow="How it works"
            title="Good things, simply done"
            text="Three small steps between you and something lovely."
          />
          <div className="pub-steps">
            {steps.map((step, index) => (
              <Reveal className="pub-step" key={step.title} delay={index * 90}>
                <span className="pub-step-icon"><step.icon size={24} /></span>
                <span className="pub-step-number">0{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="mn-container">
          <SectionHead
            eyebrow="Shops to know"
            title="Meet the makers"
            text="Independent shops with a point of view — and a story worth hearing."
            linkTo="/businesses"
            linkLabel="All shops"
          />
          <div className="business-grid">
            {businesses.slice(0, 3).map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        </div>
      </section>

      <section className="pub-newsletter">
        <div className="mn-container pub-newsletter-inner">
          <div className="pub-newsletter-copy">
            <span className="eyebrow">The good letter</span>
            <h2>Fresh finds, once a week</h2>
            <p>New arrivals, maker stories and little discounts. No noise, just the good stuff.</p>
          </div>
          <div className="pub-newsletter-form">
            <NewsletterSignup />
            <span className="tiny">
              <ShoppingBag size={12} /> Join 2,400+ neighbours who shop local.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
