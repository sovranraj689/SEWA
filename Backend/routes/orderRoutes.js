import express from "express";
import {
  createOrder, getMyOrders, getAllOrders,
  getOrderById, updateOrderStatus, deleteOrder,
} from "../controllers/orderController.js";
import { protect, adminOnly, optionalAuth } from "../middleware/auth.js";
import { uploadOrderImage } from "../config/cloudinary.js";

const router = express.Router();

// Customer routes
router.post("/custom", optionalAuth, uploadOrderImage.array("referenceImages", 5), createOrder);
router.get("/my", protect, getMyOrders);

// Admin routes
router.get("/", protect, adminOnly, getAllOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/status", protect, adminOnly, updateOrderStatus);
router.delete("/:id", protect, adminOnly, deleteOrder);

export default router;