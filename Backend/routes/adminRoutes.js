import express from "express";
import {
  getDashboardStats,
  getAllUsers,
  updateUser,
  getActivityFeed,
} from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/auth.js";


const router = express.Router();

router.use(protect, adminOnly);

router.get("/stats", getDashboardStats);
router.get("/users", getAllUsers);
router.get("/activity", getActivityFeed);   
router.put("/users/:id", updateUser);

export default router;