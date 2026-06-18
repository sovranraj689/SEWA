import express from "express";
import { getDashboardStats, getAllUsers, updateUser } from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.use(protect, adminOnly); // All admin routes protected

router.get("/stats", getDashboardStats);
router.get("/users", getAllUsers);
router.put("/users/:id", updateUser);

export default router;