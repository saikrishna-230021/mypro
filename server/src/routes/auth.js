const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config");
const { authRequired } = require("../middleware/auth");
const { createUser, findUserByEmail } = require("../db");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "name, email, password are required" });
  }

  const existing = findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ message: "Email already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = createUser({ name, email, passwordHash });
  const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: "7d" });

  return res.status(201).json({
    token,
    user: { id: user.id, name: user.name, email: user.email }
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }

  const user = findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: "7d" });
  return res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email }
  });
});

router.get("/me", authRequired, (req, res) => {
  return res.json({ user: req.user });
});

module.exports = router;

