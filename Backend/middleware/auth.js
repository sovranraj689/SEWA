import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  try {
    if (!process.env.JWT_SECRET) {
      console.error(
        "🚨 BACKEND CONFIG ERROR: process.env.JWT_SECRET is not defined in your .env file!",
      );
      return res
        .status(500)
        .json({ message: "Internal server configuration error." });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({
        message: "Authorization failed. User profile no longer exists.",
      });
    }

    return next();
  } catch (error) {
    console.error("❌ Auth Middleware Exception:", error.message);

    return res.status(401).json({
      message: "Token is invalid, altered, or expired.",
      error: error.message,
    });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    return next();
  }
  return res
    .status(403)
    .json({ message: "Access denied. Admin privileges required." });
};

export const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    try {
      if (process.env.JWT_SECRET) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");
      }
    } catch (error) {
      console.warn("⚠️ Optional Auth failed to parse token:", error.message);
    }
  }
  return next();
};
