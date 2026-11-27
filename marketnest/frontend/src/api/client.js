/* Temporary mock API client.
 *
 * Every screen calls this module exactly as it would call a real API, so the
 * swap to Django only requires replacing the request adapter below with axios
 * pointed at /api/. The seed data lives in src/data/mock.js.
 */
import {
  businesses,
  cartLines,
  categories,
  messages,
  notifications,
  orders,
  products,
  reviews,
  user,
  vendorCategories,
  vendorOrders,
} from "../data/mock";

const wait = (value, ms = 180) =>
  new Promise((resolve) => setTimeout(() => resolve({ data: value }), ms));

const paginate = (items, params = {}) => {
  const page = Number(params.page) || 1;
  const pageSize = Number(params.page_size) || 12;
  const start = (page - 1) * pageSize;
  return {
    count: items.length,
    next: start + pageSize < items.length ? page + 1 : null,
    previous: page > 1 ? page - 1 : null,
    results: items.slice(start, start + pageSize),
  };
};

function filterProducts(params) {
  let list = [...products];
  if (params.search) {
    const term = String(params.search).toLowerCase();
    list = list.filter((item) =>
      `${item.name} ${item.category} ${item.business?.name}`.toLowerCase().includes(term)
    );
  }
  if (params.category) {
    const category = String(params.category).toLowerCase();
    list = list.filter(
      (item) =>
        item.category_id === Number(params.category) ||
        item.category.toLowerCase() === category
    );
  }
  if (params.city) {
    list = list.filter((item) =>
      item.business?.city?.toLowerCase().includes(String(params.city).toLowerCase())
    );
  }
  if (params.min_price) list = list.filter((item) => item.price >= Number(params.min_price));
  if (params.max_price) list = list.filter((item) => item.price <= Number(params.max_price));
  if (params.sort === "price_asc") list.sort((a, b) => a.price - b.price);
  if (params.sort === "price_desc") list.sort((a, b) => b.price - a.price);
  if (params.sort === "rating") list.sort((a, b) => b.rating - a.rating);
  if (params.sort === "newest") list.sort((a, b) => b.id - a.id);
  if (params.featured) list = list.filter((item) => item.featured);
  return list;
}

export const api = {
  async get(path, config = {}) {
    const params = config.params || {};
    const clean = path.replace(/^\//, "");

    if (clean === "products/") return wait(paginate(filterProducts(params), params));
    if (clean.startsWith("products/")) {
      const slug = clean.split("/")[1];
      const product = products.find((item) => item.slug === slug || String(item.id) === slug);
      if (!product) throw new Error("Product not found");
      return wait(product);
    }
    if (clean === "categories/") return wait(paginate(categories, params));
    if (clean === "businesses/") return wait(paginate(businesses, params));
    if (clean.startsWith("businesses/")) {
      const slug = clean.split("/")[1];
      const business = businesses.find((item) => item.slug === slug || String(item.id) === slug);
      if (!business) throw new Error("Business not found");
      return wait({
        ...business,
        products: products.filter((item) => item.business_id === business.id),
      });
    }
    if (clean === "cart/") return wait(cartLines);
    if (clean === "orders/") return wait(paginate(orders, params));
    if (clean.startsWith("orders/")) return wait(orders.find((item) => item.number === clean.split("/")[1]));
    if (clean === "favourites/") return wait(products.filter((item) => [1, 5, 8].includes(item.id)));
    if (clean === "following/") return wait(businesses.filter((item) => item.is_following));
    if (clean === "reviews/") return wait(paginate(reviews, params));
    if (clean === "messages/") return wait(messages);
    if (clean === "notifications/") return wait(notifications);
    if (clean === "vendor/orders/") return wait(paginate(vendorOrders, params));
    if (clean === "vendor/categories/") return wait(vendorCategories);
    if (clean === "account/me/") return wait(user);

    throw new Error(`No mock route for GET ${path}`);
  },

  async post(path, payload) {
    if (path.replace(/^\//, "") === "orders/checkout/") {
      return wait({ detail: "Order placed!", orders: [orders[3]] }, 500);
    }
    return wait({ detail: "Saved", ...payload }, 350);
  },

  async patch(path, payload) {
    return wait({ ...payload }, 250);
  },

  async delete() {
    return wait({ detail: "Deleted" }, 250);
  },
};

export function apiError(error, fallback = "Something went wrong. Please try again.") {
  return error?.response?.data?.detail || error?.message || fallback;
}

export function fieldErrors(error) {
  const data = error?.response?.data;
  if (!data || typeof data !== "object") return {};
  const result = {};
  Object.entries(data).forEach(([key, value]) => {
    result[key] = Array.isArray(value) ? value.join(" ") : String(value);
  });
  return result;
}

export function mediaUrl(path) {
  return path || null;
}
