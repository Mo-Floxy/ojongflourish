/* Frontend-only seed data for the UI-first rebuild.
 * Replace these exports with API calls when the Django endpoints land.
 */

export const user = {
  id: 1,
  first_name: "Amara",
  last_name: "Okafor",
  full_name: "Amara Okafor",
  email: "amara@example.com",
  phone: "+234 801 234 5678",
  city: "Lagos",
  role: "customer",
  bio: "Collecting small, beautiful things made by people who care.",
  avatar: "/images/avatars/customer.jpg",
};

export const vendorUser = {
  ...user,
  id: 2,
  full_name: "Temi Adeyemi",
  first_name: "Temi",
  last_name: "Adeyemi",
  email: "temi@emberandoak.example",
  role: "vendor",
  business_id: 1,
  avatar: "/images/avatars/vendor.jpg",
};

export const categories = [
  { id: 1, name: "Home & Living", slug: "home-living", icon: "🏡", count: 42 },
  { id: 2, name: "Fashion", slug: "fashion", icon: "👗", count: 36 },
  { id: 3, name: "Jewellery", slug: "jewellery", icon: "💍", count: 24 },
  { id: 4, name: "Art & Stationery", slug: "art-stationery", icon: "🎨", count: 31 },
  { id: 5, name: "Food & Gifts", slug: "food-gifts", icon: "🧺", count: 18 },
  { id: 6, name: "Beauty", slug: "beauty", icon: "🧴", count: 15 },
  { id: 7, name: "Textiles", slug: "textiles", icon: "🧶", count: 21 },
  { id: 8, name: "Woodwork", slug: "woodwork", icon: "🪵", count: 12 },
];

const businessSummary = (id) => {
  const shop = businesses.find((item) => item.id === id);
  return shop
    ? { id: shop.id, name: shop.name, slug: shop.slug, city: shop.city }
    : null;
};

export const businesses = [
  {
    id: 1,
    slug: "ember-and-oak",
    name: "Ember & Oak",
    tagline: "Slow-made homeware with a warm, lived-in feel",
    description:
      "We make small-batch ceramics, woven baskets and wooden pieces in our Lagos studio. Everything is shaped by hand, glazed in small runs and built to be used every day.",
    city: "Lagos",
    area: "Yaba",
    category: "Home & Living",
    rating: 4.9,
    review_count: 128,
    followers: 1240,
    product_count: 24,
    banner: "/images/shops/shop-1.jpg",
    logo: "/images/logos/logo-1.jpg",
    accent: "#f97316",
    tags: ["Ceramics", "Woodwork", "Handmade"],
    joined: "2022",
    is_following: true,
    address: "14 Herbert Macaulay Way, Yaba, Lagos",
    hours: "Mon–Sat, 9am–6pm",
    social: { instagram: "@emberandoak", website: "emberandoak.example" },
  },
  {
    id: 2,
    slug: "the-clay-room",
    name: "The Clay Room",
    tagline: "Playful ceramics for everyday rituals",
    description:
      "A tiny studio turning local clay into mugs, plates and little vessels. We love imperfect edges and colours that feel like sunset.",
    city: "Lagos",
    area: "Ikoyi",
    category: "Home & Living",
    rating: 4.8,
    review_count: 86,
    followers: 890,
    product_count: 18,
    banner: "/images/shops/shop-2.jpg",
    logo: "/images/logos/logo-2.jpg",
    accent: "#f59e0b",
    tags: ["Ceramics", "Gifts"],
    joined: "2023",
    is_following: false,
    address: "8 Gerrard Road, Ikoyi, Lagos",
    hours: "Tue–Sat, 10am–5pm",
    social: { instagram: "@theclayroom", website: "theclayroom.example" },
  },
  {
    id: 3,
    slug: "thread-and-tide",
    name: "Thread & Tide",
    tagline: "Handwoven textiles with a contemporary edge",
    description:
      "We work with weavers across the country to make durable, joyful fabrics — from table runners to statement wraps.",
    city: "Abuja",
    area: "Wuse II",
    category: "Textiles",
    rating: 4.9,
    review_count: 64,
    followers: 1120,
    product_count: 31,
    banner: "/images/shops/shop-3.jpg",
    logo: "/images/logos/logo-3.jpg",
    accent: "#14b8a6",
    tags: ["Textiles", "Fashion", "Fair trade"],
    joined: "2021",
    is_following: true,
    address: "12A Ademola Adetokunbo Crescent, Wuse II, Abuja",
    hours: "Mon–Fri, 9am–5pm",
    social: { instagram: "@threadandtide", website: "threadandtide.example" },
  },
  {
    id: 4,
    slug: "golden-hour-studio",
    name: "Golden Hour Studio",
    tagline: "Jewellery that holds a little sunlight",
    description:
      "Hand-formed brass and gold-plated pieces, made in small runs. Each one is polished by hand and made to be worn daily.",
    city: "Lagos",
    area: "Lekki",
    category: "Jewellery",
    rating: 4.7,
    review_count: 52,
    followers: 760,
    product_count: 16,
    banner: "/images/shops/shop-4.jpg",
    logo: "/images/logos/logo-4.jpg",
    accent: "#d97706",
    tags: ["Jewellery", "Gifts"],
    joined: "2023",
    is_following: false,
    address: "41 Admiralty Way, Lekki, Lagos",
    hours: "Daily, 10am–7pm",
    social: { instagram: "@goldenhourstudio", website: "goldenhour.example" },
  },
  {
    id: 5,
    slug: "paper-and-pine",
    name: "Paper & Pine",
    tagline: "Paper goods and little works of art",
    description:
      "Letterpress stationery, hand-bound notebooks and prints, made for people who still love putting pen to paper.",
    city: "Port Harcourt",
    area: "GRA",
    category: "Art & Stationery",
    rating: 4.9,
    review_count: 43,
    followers: 540,
    product_count: 22,
    banner: "/images/shops/shop-5.jpg",
    logo: "/images/logos/logo-5.jpg",
    accent: "#0284c7",
    tags: ["Stationery", "Art", "Gifts"],
    joined: "2024",
    is_following: false,
    address: "5 Aba Road, GRA, Port Harcourt",
    hours: "Mon–Sat, 9am–5pm",
    social: { instagram: "@paperandpine", website: "paperandpine.example" },
  },
  {
    id: 6,
    slug: "scent-and-spice",
    name: "Scent & Spice",
    tagline: "Small-batch scents, teas and thoughtful gifts",
    description:
      "We blend botanicals, essential oils and local spices into candles, teas and gift boxes that feel like a warm welcome.",
    city: "Ibadan",
    area: "Bodija",
    category: "Beauty",
    rating: 4.8,
    review_count: 71,
    followers: 680,
    product_count: 14,
    banner: "/images/shops/shop-6.jpg",
    logo: "/images/logos/logo-6.jpg",
    accent: "#db2777",
    tags: ["Beauty", "Food & Gifts"],
    joined: "2022",
    is_following: false,
    address: "22 Bodija Market Road, Ibadan",
    hours: "Mon–Sat, 8am–6pm",
    social: { instagram: "@scentandspice", website: "scentandspice.example" },
  },
];

const productImages = [
  "stoneware-mug",
  "macrame-hanger",
  "sourdough-loaf",
  "stoneware-bowl",
  "potted-plant",
  "canvas-tote",
  "linen-apron",
  "gold-chain",
  "soap-dish",
  "hibiscus-tea",
  "raw-honey",
  "soy-candle",
  "coffee-beans",
  "card-holder",
  "spoon-rest",
  "gift-set",
];

const rawProducts = [
  [1, "hand-thrown-stoneware-mug", "Hand-thrown Stoneware Mug", 1, 1, 8500, 10500, 14, "A gently tapered mug glazed in warm oat. Each one has its own little fingerprint from the wheel.", "Stoneware, food-safe glaze. 350ml. Dishwasher safe.", "Bestseller"],
  [2, "macrame-plant-hanger", "Macramé Plant Hanger", 1, 7, 14500, null, 8, "A hand-knotted hanger in soft cotton cord with a relaxed, modern silhouette.", "Cotton cord, solid oak ring. 90cm drop.", "New"],
  [3, "slow-sourdough-loaf", "Slow-fermented Sourdough Loaf", 6, 5, 4200, null, 16, "A crackling crust and soft, open crumb from a slow, careful ferment.", "Wheat flour, water, sea salt. 800g.", null],
  [4, "speckled-stoneware-bowl", "Speckled Stoneware Bowl", 2, 1, 6800, null, 22, "A generous bowl with a soft speckle and a gently rolled edge.", "Local clay, matte glaze. 22cm. Dishwasher safe.", null],
  [5, "potted-green-plant", "Potted Green Plant", 5, 1, 9200, null, 11, "An easy-care plant in a warm ceramic pot, ready to brighten a desk or shelf.", "Live plant, ceramic pot. 18cm diameter.", null],
  [6, "everyday-canvas-tote", "Everyday Canvas Tote", 3, 2, 18500, 22000, 9, "A sturdy everyday tote cut from heavyweight cotton canvas with reinforced straps.", "100% cotton canvas. 38 × 40cm, 12oz.", "Bestseller"],
  [7, "washed-linen-apron", "Washed Linen Apron", 3, 7, 19500, null, 7, "A relaxed cross-back apron in washed linen that only gets better with age.", "100% linen. Adjustable straps, two pockets.", null],
  [8, "everyday-gold-chain", "Everyday Gold-Filled Chain", 4, 3, 34000, 42000, 6, "A delicate chain that goes with everything and never needs fussing over.", "14k gold fill. 45cm with extender.", "Bestseller"],
  [9, "ridged-soap-dish", "Ridged Stoneware Soap Dish", 2, 1, 5400, null, 25, "A little curved soap dish with raised ridges and a soft matte glaze.", "Stoneware, food-safe glaze. 12cm.", null],
  [10, "spiced-hibiscus-tea", "Spiced Hibiscus Tea", 6, 5, 7200, null, 27, "A bright, gently spiced herbal blend, packed in a compostable pouch.", "Hibiscus, ginger, cinnamon. 100g, 40 cups.", null],
  [11, "raw-wildflower-honey", "Raw Wildflower Honey", 6, 5, 6800, null, 18, "Raw, unfiltered honey with a clean floral finish, bottled by a small apiary.", "100% raw honey. 250g glass jar.", "New"],
  [12, "cedar-candle", "Cedar & Orange Candle", 6, 6, 9800, null, 20, "A warm, woody candle poured by hand into a reusable ceramic jar.", "Soy wax, cotton wick. 220g, ~40 hours.", "Bestseller"],
  [13, "small-batch-coffee", "Small-batch Coffee", 6, 5, 7200, null, 24, "Slow-roasted arabica with notes of cocoa, citrus and toasted nuts.", "Arabica beans. 250g, whole bean or ground.", null],
  [14, "stitched-card-holder", "Hand-stitched Card Holder", 4, 2, 12500, null, 13, "A slim card holder stitched by hand in supple vegetable-tanned leather.", "Vegetable-tanned leather. Holds 4–6 cards.", "New"],
  [15, "ceramic-spoon-rest", "Ceramic Spoon Rest", 2, 1, 5400, null, 25, "A little curved rest for spoons and lids, glazed in a soft deep teal.", "Stoneware, food-safe glaze. 12cm.", null],
  [16, "gift-box-of-small-joys", "Gift Box of Small Joys", 6, 5, 24500, null, 10, "A curated box of candle, tea and a handmade card for a thoughtful surprise.", "Soy candle, tea sachets, letterpress card.", "Gift-ready"],
];

export const products = rawProducts.map(
  ([id, slug, name, business_id, category_id, price, compare_at_price, stock, description, materials, badge], index) => {
    const image = `/images/products/${productImages[id - 1]}.jpg`;
    return {
      id,
      slug,
      name,
      business_id,
      business: businessSummary(business_id),
      category_id,
      category: categories.find((item) => item.id === category_id)?.name || "Uncategorised",
      price,
      compare_at_price,
      stock,
      is_active: true,
      rating: Number((4.5 + ((index * 7) % 5) / 10).toFixed(1)),
      review_count: 8 + ((index * 13) % 60),
      sold_count: 12 + ((index * 29) % 180),
      image,
      gallery: [
        image,
        `/images/products/${productImages[(id + 1) % productImages.length]}.jpg`,
        `/images/products/${productImages[(id + 4) % productImages.length]}.jpg`,
      ],
      description,
      materials,
      badge,
      featured: index < 4,
      created_at: "2026-09-12",
    };
  }
);

export const cartLines = [
  { id: 1, product_id: 1, product: products[0], quantity: 2, line_total: 17000 },
  { id: 2, product_id: 12, product: products[11], quantity: 1, line_total: 9800 },
];

export const orders = [
  {
    id: 101,
    number: "MN-24091",
    status: "delivered",
    created_at: "2026-11-12T10:24:00Z",
    item_count: 2,
    total: 15300,
    business: { id: 1, name: "Ember & Oak", slug: "ember-and-oak" },
    items: [
      { product: products[0], quantity: 1, line_total: 8500 },
      { product: products[3], quantity: 1, line_total: 6800 },
    ],
    address: "12 Adeola Odeku Street, Victoria Island, Lagos",
    notes: "Please call on arrival.",
  },
  {
    id: 102,
    number: "MN-24068",
    status: "out_for_delivery",
    created_at: "2026-11-20T14:05:00Z",
    item_count: 1,
    total: 9800,
    business: { id: 6, name: "Scent & Spice", slug: "scent-and-spice" },
    items: [{ product: products[11], quantity: 1, line_total: 9800 }],
    address: "12 Adeola Odeku Street, Victoria Island, Lagos",
    notes: "",
  },
  {
    id: 103,
    number: "MN-24042",
    status: "processing",
    created_at: "2026-11-25T09:41:00Z",
    item_count: 3,
    total: 23800,
    business: { id: 6, name: "Scent & Spice", slug: "scent-and-spice" },
    items: [
      { product: products[11], quantity: 1, line_total: 9800 },
      { product: products[9], quantity: 1, line_total: 7200 },
      { product: products[10], quantity: 1, line_total: 6800 },
    ],
    address: "12 Adeola Odeku Street, Victoria Island, Lagos",
    notes: "Wrap as a gift, please.",
  },
  {
    id: 104,
    number: "MN-24017",
    status: "pending",
    created_at: "2026-11-26T16:18:00Z",
    item_count: 1,
    total: 18500,
    business: { id: 3, name: "Thread & Tide", slug: "thread-and-tide" },
    items: [{ product: products[5], quantity: 1, line_total: 18500 }],
    address: "12 Adeola Odeku Street, Victoria Island, Lagos",
    notes: "",
  },
  {
    id: 105,
    number: "MN-23988",
    status: "cancelled",
    created_at: "2026-11-02T11:02:00Z",
    item_count: 1,
    total: 6500,
    business: { id: 5, name: "Paper & Pine", slug: "paper-and-pine" },
    items: [{ product: products[9], quantity: 1, line_total: 6500 }],
    address: "12 Adeola Odeku Street, Victoria Island, Lagos",
    notes: "",
  },
];

export const vendorOrders = [
  { ...orders[3], status: "pending", customer: "Amara Okafor" },
  { ...orders[2], status: "processing", customer: "Chidi Nwosu", total: 23800 },
  { ...orders[1], status: "out_for_delivery", customer: "Zainab Bello" },
  { ...orders[0], status: "delivered", customer: "Amara Okafor" },
  {
    id: 106,
    number: "MN-24003",
    status: "pending",
    created_at: "2026-11-27T08:12:00Z",
    item_count: 2,
    total: 22400,
    business: { id: 1, name: "Ember & Oak", slug: "ember-and-oak" },
    items: [
      { product: products[0], quantity: 2, line_total: 17000 },
      { product: products[14], quantity: 1, line_total: 3300 },
    ],
    address: "7 Bourdillon Road, Ikoyi, Lagos",
    notes: "Please use kraft paper wrapping.",
    customer: "Folake Ade",
  },
];

export const messages = [
  {
    id: 1,
    business: businesses[0],
    unread: 1,
    last_at: "10:42",
    last_message: "That sounds perfect — I'll wrap it in kraft paper for you.",
    messages: [
      { id: 1, from: "me", body: "Hi! Do you have the stoneware mug in the oat glaze?", at: "Yesterday, 4:18pm" },
      { id: 2, from: "shop", body: "Hi Amara, yes we do! We have three left from the latest batch.", at: "Yesterday, 4:32pm" },
      { id: 3, from: "me", body: "Lovely. Could you include a small note card? It's a gift.", at: "10:38" },
      { id: 4, from: "shop", body: "That sounds perfect — I'll wrap it in kraft paper for you.", at: "10:42" },
    ],
  },
  {
    id: 2,
    business: businesses[3],
    unread: 0,
    last_at: "Mon",
    last_message: "It's been posted today. Tracking details are on your order page.",
    messages: [
      { id: 1, from: "me", body: "Has my order been dispatched yet?", at: "Mon, 9:14am" },
      { id: 2, from: "shop", body: "It's been posted today. Tracking details are on your order page.", at: "Mon, 11:02am" },
    ],
  },
  {
    id: 3,
    business: businesses[5],
    unread: 0,
    last_at: "18 Nov",
    last_message: "Thank you for the kind review! It made our week.",
    messages: [
      { id: 1, from: "shop", body: "Thank you for the kind review! It made our week.", at: "18 Nov, 2:45pm" },
    ],
  },
];

export const notifications = [
  { id: 1, type: "order", title: "Your order is on its way", body: "MN-24068 from Golden Hour Studio is out for delivery.", at: "12 minutes ago", read: false },
  { id: 2, type: "message", title: "New message from Ember & Oak", body: "That sounds perfect — I'll wrap it in kraft paper for you.", at: "1 hour ago", read: false },
  { id: 3, type: "order", title: "Order confirmed", body: "MN-24042 with Scent & Spice is being prepared.", at: "Yesterday", read: false },
  { id: 4, type: "review", title: "Thanks for your review", body: "Your review of Indigo Wrap Skirt is now live.", at: "2 days ago", read: true },
  { id: 5, type: "shop", title: "Thread & Tide added new finds", body: "3 new pieces just landed in their shop.", at: "4 days ago", read: true },
  { id: 6, type: "system", title: "Welcome to Marketnest", body: "We're glad you're here. Start by exploring local shops.", at: "2 weeks ago", read: true },
];

export const reviews = [
  { id: 1, product: products[0], business: businesses[0], rating: 5, author: "You", at: "18 Nov 2026", body: "Beautiful mug — the glaze is even lovelier in person. Packaged with real care and arrived a day early." },
  { id: 2, product: products[5], business: businesses[2], rating: 5, author: "You", at: "4 Nov 2026", body: "The fabric is soft and the colour is exactly as pictured. It's become my favourite thing to wear." },
  { id: 3, product: products[11], business: businesses[5], rating: 4, author: "You", at: "22 Oct 2026", body: "Warm and woody without being overpowering. The ceramic jar is a nice bonus." },
];

export const following = [businesses[0], businesses[2]];

export const vendorCategories = [
  { id: 1, name: "Ceramics", product_count: 8, description: "Mugs, plates, bowls and little vessels" },
  { id: 2, name: "Baskets", product_count: 4, description: "Woven storage and market baskets" },
  { id: 3, name: "Woodwork", product_count: 5, description: "Boards, spoons and small furniture" },
  { id: 4, name: "Textiles", product_count: 7, description: "Tea towels, aprons and wraps" },
];

export const searchSuggestions = [
  "stoneware mug",
  "macramé hanger",
  "canvas tote",
  "gold chain",
  "soy candle",
  "hibiscus tea",
];
