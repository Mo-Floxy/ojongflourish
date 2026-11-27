import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Clock3,
  Globe2,
  Instagram,
  MapPin,
  RotateCcw,
  Save,
  Store,
} from "lucide-react";
import ImageUpload from "../../components/ImageUpload";
import Thumb from "../../components/Thumb";
import { businesses, vendorUser } from "../../data/mock";
import { useToast } from "../../context/ToastContext";
import { formatDate } from "../../lib/format";

function usePreviewUrl(file) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!file) {
      setUrl(null);
      return undefined;
    }
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return url;
}

export default function ShopProfile() {
  useEffect(() => {
    document.title = "Shop profile · Marketnest";
  }, []);

  const toast = useToast();
  const shop = businesses.find((item) => item.id === vendorUser.business_id) || businesses[0];

  const initialForm = {
    name: shop.name,
    tagline: shop.tagline,
    description: shop.description,
    city: shop.city,
    address: shop.address,
    hours: shop.hours,
    instagram: shop.social?.instagram || "",
    website: shop.social?.website || "",
  };

  const [form, setForm] = useState(initialForm);
  const [bannerFiles, setBannerFiles] = useState([]);
  const [logoFiles, setLogoFiles] = useState([]);
  const [savedAt, setSavedAt] = useState(null);

  const bannerUrl = usePreviewUrl(bannerFiles[0]);
  const logoUrl = usePreviewUrl(logoFiles[0]);

  function update(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  }

  function handleReset() {
    setForm(initialForm);
    setBannerFiles([]);
    setLogoFiles([]);
    setSavedAt(null);
    toast.info("Changes discarded", "Your shop profile is back to its last saved version.");
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!form.name.trim()) {
      toast.error("A shop name is required", "Give your shop a name before saving.");
      return;
    }
    setSavedAt(new Date());
    toast.success("Shop profile saved", "Your public shop preview has been updated.");
  }

  const preview = {
    ...shop,
    name: form.name || shop.name,
    tagline: form.tagline,
    description: form.description,
    city: form.city,
    address: form.address,
    hours: form.hours,
  };

  return (
    <div className="vnd-page">
      <header className="dash-header">
        <div>
          <span className="eyebrow">Your public presence</span>
          <h1>Shop profile</h1>
          <p>Tell shoppers who you are and how to find you.</p>
        </div>
        <div className="dash-actions">
          <button type="button" className="mn-btn ghost" onClick={handleReset}>
            <RotateCcw size={16} /> Discard
          </button>
          <button type="submit" form="vnd-shop-form" className="mn-btn">
            <Save size={16} /> Save changes
          </button>
        </div>
      </header>

      <div className="vnd-profile-layout">
        <form id="vnd-shop-form" className="form-card vnd-profile-form" onSubmit={handleSubmit}>
          <div className="vnd-field-group">
            <h3>The basics</h3>
            <p className="tiny">This is the first thing people see when they visit your shop.</p>
            <div className="vnd-form-grid">
              <div className="vnd-field">
                <label className="form-label" htmlFor="vnd-shop-name">Shop name</label>
                <input
                  id="vnd-shop-name"
                  className="form-control"
                  value={form.name}
                  onChange={update("name")}
                  placeholder="Ember & Oak"
                />
              </div>
              <div className="vnd-field">
                <label className="form-label" htmlFor="vnd-shop-city">City</label>
                <input
                  id="vnd-shop-city"
                  className="form-control"
                  value={form.city}
                  onChange={update("city")}
                  placeholder="Lagos"
                />
              </div>
              <div className="vnd-field full">
                <label className="form-label" htmlFor="vnd-shop-tagline">Tagline</label>
                <input
                  id="vnd-shop-tagline"
                  className="form-control"
                  value={form.tagline}
                  onChange={update("tagline")}
                  placeholder="A short line about what makes you different"
                />
              </div>
              <div className="vnd-field full">
                <label className="form-label" htmlFor="vnd-shop-description">Description</label>
                <textarea
                  id="vnd-shop-description"
                  className="form-control"
                  rows={4}
                  value={form.description}
                  onChange={update("description")}
                  placeholder="Tell your story, materials and process…"
                />
                <span className="tiny">A few warm sentences work best.</span>
              </div>
            </div>
          </div>

          <div className="vnd-field-group">
            <h3>Find you</h3>
            <p className="tiny">Help customers visit your studio or get in touch.</p>
            <div className="vnd-form-grid">
              <div className="vnd-field full">
                <label className="form-label" htmlFor="vnd-shop-address">Street address</label>
                <input
                  id="vnd-shop-address"
                  className="form-control"
                  value={form.address}
                  onChange={update("address")}
                  placeholder="14 Herbert Macaulay Way, Yaba, Lagos"
                />
              </div>
              <div className="vnd-field full">
                <label className="form-label" htmlFor="vnd-shop-hours">Opening hours</label>
                <input
                  id="vnd-shop-hours"
                  className="form-control"
                  value={form.hours}
                  onChange={update("hours")}
                  placeholder="Mon–Sat, 9am–6pm"
                />
              </div>
            </div>
          </div>

          <div className="vnd-field-group">
            <h3>Social links</h3>
            <p className="tiny">Shown as clickable badges on your public shop page.</p>
            <div className="vnd-form-grid">
              <div className="vnd-field">
                <label className="form-label" htmlFor="vnd-shop-instagram">Instagram</label>
                <input
                  id="vnd-shop-instagram"
                  className="form-control"
                  value={form.instagram}
                  onChange={update("instagram")}
                  placeholder="@yourshop"
                />
              </div>
              <div className="vnd-field">
                <label className="form-label" htmlFor="vnd-shop-website">Website</label>
                <input
                  id="vnd-shop-website"
                  className="form-control"
                  value={form.website}
                  onChange={update("website")}
                  placeholder="yourshop.example"
                />
              </div>
            </div>
          </div>

          <div className="vnd-field-group">
            <h3>Shop imagery</h3>
            <p className="tiny">Landscape images work best for the banner; square images for your logo.</p>
            <div className="vnd-upload-grid">
              <div>
                <span className="form-label">Banner</span>
                <ImageUpload
                  files={bannerFiles}
                  onChange={setBannerFiles}
                  max={1}
                  label="Upload a banner"
                  hint="Pick one landscape image"
                />
              </div>
              <div>
                <span className="form-label">Logo</span>
                <ImageUpload
                  files={logoFiles}
                  onChange={setLogoFiles}
                  max={1}
                  label="Upload a logo"
                  hint="Pick one square image"
                />
              </div>
            </div>
          </div>

          <div className="vnd-form-actions">
            <button type="submit" className="mn-btn">
              <Save size={16} /> Save changes
            </button>
            <button type="button" className="mn-btn ghost" onClick={handleReset}>
              Discard
            </button>
            {savedAt && (
              <span className="vnd-saved-note">Saved at {formatDate(savedAt)}</span>
            )}
          </div>
        </form>

        <aside className="vnd-preview-pane">
          <div className="vnd-preview-heading">
            <div>
              <span className="eyebrow">Live preview</span>
              <h3>How shoppers see you</h3>
            </div>
            <Link className="link-btn" to={`/business/${shop.slug}`}>
              Open shop <ArrowUpRight size={14} />
            </Link>
          </div>

          <article className="vnd-shop-preview">
            <div className="vnd-preview-banner">
              <Thumb
                src={bannerUrl || shop.banner}
                alt={`${preview.name} banner`}
                mark={preview.name.charAt(0)}
              />
              <span className="pill gold vnd-preview-badge">
                <Store size={12} /> Verified shop
              </span>
            </div>
            <div className="vnd-preview-body">
              <Thumb
                className="vnd-preview-logo"
                src={logoUrl || shop.logo}
                alt={`${preview.name} logo`}
                mark={preview.name.charAt(0)}
              />
              <h3>{preview.name}</h3>
              <p className="vnd-preview-tagline">{preview.tagline || "Your tagline goes here"}</p>
              <p className="vnd-preview-description">
                {preview.description || "Your shop description will appear here."}
              </p>
              <div className="vnd-preview-meta">
                <span><MapPin size={14} /> {preview.city || "City"}</span>
                <span><Clock3 size={14} /> {preview.hours || "Hours"}</span>
              </div>
              <div className="vnd-preview-social">
                {form.instagram && (
                  <a href={`https://instagram.com/${form.instagram.replace(/^@/, "")}`} target="_blank" rel="noreferrer">
                    <Instagram size={13} /> {form.instagram}
                  </a>
                )}
                {form.website && (
                  <a href={`https://${form.website}`} target="_blank" rel="noreferrer">
                    <Globe2 size={13} /> {form.website}
                  </a>
                )}
                {!form.instagram && !form.website && (
                  <span className="tiny">Add social links to see them here.</span>
                )}
              </div>
            </div>
          </article>
          <p className="tiny vnd-preview-note">
            Preview only — changes stay in this session until you save.
          </p>
        </aside>
      </div>
    </div>
  );
}
