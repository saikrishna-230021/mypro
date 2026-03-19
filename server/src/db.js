const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");
const seedProducts = require("./data/seedProducts");

const dataDir = path.join(__dirname, "..", "data");
const dbPath = path.join(dataDir, "store.json");

function ensureStore() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dbPath)) {
    const initial = {
      users: [],
      products: seedProducts,
      carts: [],
      orders: []
    };
    fs.writeFileSync(dbPath, JSON.stringify(initial, null, 2));
    return initial;
  }

  const parsed = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
  if (!Array.isArray(parsed.products) || parsed.products.length === 0) {
    parsed.products = seedProducts;
    fs.writeFileSync(dbPath, JSON.stringify(parsed, null, 2));
  }
  return parsed;
}

function readStore() {
  return ensureStore();
}

function writeStore(store) {
  fs.writeFileSync(dbPath, JSON.stringify(store, null, 2));
}

function createUser({ name, email, passwordHash }) {
  const store = readStore();
  const user = { id: randomUUID(), name, email: email.toLowerCase(), passwordHash, createdAt: new Date().toISOString() };
  store.users.push(user);
  store.carts.push({ userId: user.id, items: [] });
  writeStore(store);
  return user;
}

function findUserByEmail(email) {
  const store = readStore();
  return store.users.find((u) => u.email === email.toLowerCase()) || null;
}

function findUserById(id) {
  const store = readStore();
  return store.users.find((u) => u.id === id) || null;
}

function getProducts() {
  const store = readStore();
  return store.products;
}

function getProductById(id) {
  const store = readStore();
  return store.products.find((p) => p.id === id) || null;
}

function searchProducts(query) {
  const q = query.toLowerCase();
  const products = getProducts();
  return products.filter((p) =>
    [p.title, p.brand, p.category, p.description].join(" ").toLowerCase().includes(q)
  );
}

function getCart(userId) {
  const store = readStore();
  let cart = store.carts.find((c) => c.userId === userId);
  if (!cart) {
    cart = { userId, items: [] };
    store.carts.push(cart);
    writeStore(store);
  }
  return cart;
}

function addCartItem(userId, productId, quantity) {
  const store = readStore();
  let cart = store.carts.find((c) => c.userId === userId);
  if (!cart) {
    cart = { userId, items: [] };
    store.carts.push(cart);
  }

  const existing = cart.items.find((item) => item.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({ productId, quantity });
  }
  writeStore(store);
  return cart;
}

function updateCartItem(userId, productId, quantity) {
  const store = readStore();
  const cart = store.carts.find((c) => c.userId === userId);
  if (!cart) {
    return null;
  }
  const item = cart.items.find((i) => i.productId === productId);
  if (!item) {
    return null;
  }

  if (quantity <= 0) {
    cart.items = cart.items.filter((i) => i.productId !== productId);
  } else {
    item.quantity = quantity;
  }

  writeStore(store);
  return cart;
}

function removeCartItem(userId, productId) {
  const store = readStore();
  const cart = store.carts.find((c) => c.userId === userId);
  if (!cart) {
    return null;
  }
  cart.items = cart.items.filter((i) => i.productId !== productId);
  writeStore(store);
  return cart;
}

function enrichCart(cart) {
  const products = getProducts();
  const items = cart.items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    return {
      productId: item.productId,
      quantity: item.quantity,
      product,
      lineTotal: product ? Number((product.price * item.quantity).toFixed(2)) : 0
    };
  });

  const total = Number(items.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2));
  return { ...cart, items, total };
}

function createOrder(userId, address, paymentMethod) {
  const store = readStore();
  const cart = store.carts.find((c) => c.userId === userId);
  if (!cart || cart.items.length === 0) {
    return null;
  }

  const products = store.products;
  const items = cart.items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    return {
      productId: item.productId,
      title: product?.title || "Unknown",
      price: product?.price || 0,
      quantity: item.quantity,
      lineTotal: Number(((product?.price || 0) * item.quantity).toFixed(2))
    };
  });

  const total = Number(items.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2));
  const order = {
    id: randomUUID(),
    userId,
    items,
    total,
    address,
    paymentMethod,
    status: "PLACED",
    createdAt: new Date().toISOString()
  };
  store.orders.unshift(order);
  cart.items = [];
  writeStore(store);
  return order;
}

function getOrdersForUser(userId) {
  const store = readStore();
  return store.orders.filter((order) => order.userId === userId);
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  getProducts,
  getProductById,
  searchProducts,
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  enrichCart,
  createOrder,
  getOrdersForUser
};
