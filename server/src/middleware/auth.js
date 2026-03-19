const jwt = require("jsonwebtoken");
const config = require("../config");
const { findUserById } = require("../db");

function authRequired(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Missing auth token" });
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const user = findUserById(payload.userId);
    if (!user) {
      return res.status(401).json({ message: "Invalid token user" });
    }
    req.user = { id: user.id, name: user.name, email: user.email };
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = { authRequired };

