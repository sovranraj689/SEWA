import express from "express";
import {
  getDashboardStats,
  getAllUsers,
  updateUser,
  getActivityFeed,        // ← add this
} from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/auth.js";


const router = express.Router();

router.use(protect, adminOnly);

router.get("/stats", getDashboardStats);
router.get("/users", getAllUsers);
router.get("/activity", getActivityFeed);   // ← add this
router.put("/users/:id", updateUser);

export default router;