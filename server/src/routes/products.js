const express = require("express");
const { getProducts, getProductById, searchProducts } = require("../db");

const router = express.Router();

router.get("/", (req, res) => {
  return res.json({ products: getProducts() });
});

router.get("/search", (req, res) => {
  const q = (req.query.q || "").toString().trim();
  if (!q) {
    return res.status(400).json({ message: "Query q is required" });
  }
  return res.json({ products: searchProducts(q) });
});

router.get("/:id", (req, res) => {
  const product = getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  return res.json({ product });
});

module.exports = router;

