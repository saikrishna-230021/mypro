const express = require("express");
const { authRequired } = require("../middleware/auth");
const { getProductById, getCart, addCartItem, updateCartItem, removeCartItem, enrichCart } = require("../db");

const router = express.Router();
router.use(authRequired);

router.get("/", (req, res) => {
  const cart = getCart(req.user.id);
  return res.json({ cart: enrichCart(cart) });
});

router.post("/items", (req, res) => {
  const { productId, quantity } = req.body;
  const qty = Number(quantity);
  if (!productId || !Number.isFinite(qty) || qty <= 0) {
    return res.status(400).json({ message: "productId and positive quantity are required" });
  }

  const product = getProductById(productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const cart = addCartItem(req.user.id, productId, qty);
  return res.status(201).json({ cart: enrichCart(cart) });
});

router.patch("/items/:productId", (req, res) => {
  const qty = Number(req.body.quantity);
  if (!Number.isFinite(qty)) {
    return res.status(400).json({ message: "quantity must be numeric" });
  }

  const cart = updateCartItem(req.user.id, req.params.productId, qty);
  if (!cart) {
    return res.status(404).json({ message: "Cart item not found" });
  }
  return res.json({ cart: enrichCart(cart) });
});

router.delete("/items/:productId", (req, res) => {
  const cart = removeCartItem(req.user.id, req.params.productId);
  if (!cart) {
    return res.status(404).json({ message: "Cart not found" });
  }
  return res.json({ cart: enrichCart(cart) });
});

module.exports = router;

