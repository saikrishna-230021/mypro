const express = require("express");
const { authRequired } = require("../middleware/auth");
const { createOrder, getOrdersForUser } = require("../db");

const router = express.Router();
router.use(authRequired);

router.post("/checkout", (req, res) => {
  const { address, paymentMethod } = req.body;
  if (!address || !paymentMethod) {
    return res.status(400).json({ message: "address and paymentMethod are required" });
  }

  const order = createOrder(req.user.id, address, paymentMethod);
  if (!order) {
    return res.status(400).json({ message: "Cart is empty" });
  }
  return res.status(201).json({ order });
});

router.get("/", (req, res) => {
  return res.json({ orders: getOrdersForUser(req.user.id) });
});

module.exports = router;

