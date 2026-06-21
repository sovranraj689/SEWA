import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path"; 
import { fileURLToPath } from "url"; 
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import designRoutes from "./routes/designRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB();

const app = express();

// ─── Middleware ───────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || "https://swatisutra.onrender.com",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "../SwatiArts/dist")));

// ─── API Routes ──────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/designs", designRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/contact", messageRoutes);

// Health check
app.get("/api/health", (_, res) => res.json({ status: "ok", time: new Date().toISOString() }));

app.get("*", (req, res, next) => {

  if (req.originalUrl.startsWith("/api")) {
    return next();
  }
  res.sendFile(path.join(__dirname, "../SwatiArts/dist/index.html"));
});

// ─── 404 API handler ─────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: `Route ${req.originalUrl} not found` }));

// ─── Global error handler ────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("💥", err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 SwatiArts API running on port ${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV || "development"}`);
  console.log(`   Health      : https://swatisutra.onrender.com/api/health\n`);
});