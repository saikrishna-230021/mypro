const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const config = require("./config");
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/orders");

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(config.port, () => {
  console.log(`API server running on http://localhost:${config.port}`);
});

