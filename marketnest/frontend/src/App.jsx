import { Route, Routes } from "react-router-dom";

import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import RequireAuth from "./layouts/RequireAuth";

import Home from "./pages/Home";
import Marketplace from "./pages/Marketplace";
import ProductDetail from "./pages/ProductDetail";
import Businesses from "./pages/Businesses";
import BusinessProfile from "./pages/BusinessProfile";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

import Overview from "./pages/dashboard/Overview";
import Profile from "./pages/dashboard/Profile";
import Orders from "./pages/dashboard/Orders";
import OrderDetail from "./pages/dashboard/OrderDetail";
import Favourites from "./pages/dashboard/Favourites";
import Following from "./pages/dashboard/Following";
import Reviews from "./pages/dashboard/Reviews";
import Messages from "./pages/dashboard/Messages";
import Notifications from "./pages/dashboard/Notifications";
import Settings from "./pages/dashboard/Settings";

import VendorOverview from "./pages/vendor/Overview";
import ShopProfile from "./pages/vendor/ShopProfile";
import VendorProducts from "./pages/vendor/Products";
import VendorCategories from "./pages/vendor/Categories";
import VendorOrders from "./pages/vendor/Orders";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="marketplace" element={<Marketplace />} />
        <Route path="product/:slug" element={<ProductDetail />} />
        <Route path="businesses" element={<Businesses />} />
        <Route path="business/:slug" element={<BusinessProfile />} />
        <Route path="cart" element={<Cart />} />
        <Route
          path="checkout"
          element={
            <RequireAuth roles={["customer"]}>
              <Checkout />
            </RequireAuth>
          }
        />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route
        path="dashboard"
        element={
          <RequireAuth roles={["customer"]}>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Overview />} />
        <Route path="profile" element={<Profile />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:number" element={<OrderDetail />} />
        <Route path="favourites" element={<Favourites />} />
        <Route path="following" element={<Following />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="messages" element={<Messages />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route
        path="vendor"
        element={
          <RequireAuth roles={["vendor"]}>
            <DashboardLayout vendor />
          </RequireAuth>
        }
      >
        <Route index element={<VendorOverview />} />
        <Route path="shop" element={<ShopProfile />} />
        <Route path="products" element={<VendorProducts />} />
        <Route path="categories" element={<VendorCategories />} />
        <Route path="orders" element={<VendorOrders />} />
        <Route path="messages" element={<Messages />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
