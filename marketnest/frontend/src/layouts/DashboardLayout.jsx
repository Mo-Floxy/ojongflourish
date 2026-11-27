import { Outlet } from "react-router-dom";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Bell,
  Box,
  Heart,
  LayoutDashboard,
  MessageCircle,
  Package,
  ReceiptText,
  Settings,
  Star,
  Store,
  Tags,
  User,
  Users,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Avatar from "../components/Avatar";
import ScrollToTop from "../components/ScrollToTop";
import { useAuth } from "../context/AuthContext";

const customerNav = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/dashboard/profile", label: "My profile", icon: User },
  { to: "/dashboard/orders", label: "Orders", icon: Package },
  { to: "/dashboard/favourites", label: "Saved finds", icon: Heart },
  { to: "/dashboard/following", label: "Following", icon: Store },
  { to: "/dashboard/reviews", label: "Reviews", icon: Star },
  { to: "/dashboard/messages", label: "Messages", icon: MessageCircle },
  { to: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

const vendorNav = [
  { to: "/vendor", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/vendor/shop", label: "Shop profile", icon: Store },
  { to: "/vendor/products", label: "Products", icon: Box },
  { to: "/vendor/categories", label: "Categories", icon: Tags },
  { to: "/vendor/orders", label: "Orders", icon: ReceiptText },
  { to: "/vendor/messages", label: "Messages", icon: MessageCircle },
  { to: "/vendor/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({ vendor = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const items = vendor ? vendorNav : customerNav;
  const base = vendor ? "/vendor" : "/dashboard";

  return (
    <>
      <ScrollToTop />
      <Navbar />
      <div className="dash-layout">
        <aside className="dash-sidebar">
          <div className="dash-user">
            <Avatar name={user?.full_name || "Guest"} size={40} />
            <div>
              <strong>{user?.full_name || "Guest"}</strong>
              <span>{vendor ? "Shop owner" : "Marketnest member"}</span>
            </div>
          </div>
          <nav className="dash-nav" aria-label="Dashboard navigation">
            <span className="dash-nav-label">{vendor ? "Your shop" : "Your account"}</span>
            {items.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? "active" : "")}>
                <Icon size={16} /> {label}
              </NavLink>
            ))}
            <span className="dash-nav-label">Shortcuts</span>
            <NavLink to={vendor ? "/business/ember-and-oak" : "/marketplace"}>
              <Users size={16} /> {vendor ? "View public shop" : "Explore marketplace"}
            </NavLink>
            {vendor && <NavLink to="/dashboard"><User size={16} /> Customer dashboard</NavLink>}
          </nav>
        </aside>
        <main className="dash-main">
          <Outlet />
        </main>
      </div>
    </>
  );
}
