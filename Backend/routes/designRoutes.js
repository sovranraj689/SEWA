import express from "express";
import {
  getDesigns, getDesignById, createDesign,
  updateDesign, deleteDesign, addReview, deleteReview, getTopReviews,
} from "../controllers/designController.js";
import { protect, adminOnly } from "../middleware/auth.js";
import { uploadDesignImage } from "../config/cloudinary.js";

const router = express.Router();

router.get("/", getDesigns);
router.get("/reviews/top", getTopReviews); // must come before /:id
router.get("/:id", getDesignById);
router.post("/", protect, adminOnly, uploadDesignImage.array("images", 5), createDesign);
router.put("/:id", protect, adminOnly, uploadDesignImage.array("images", 5), updateDesign);
router.delete("/:id", protect, adminOnly, deleteDesign);

// Reviews
router.post("/:id/reviews", protect, addReview);
router.delete("/:id/reviews/:reviewId", protect, adminOnly, deleteReview);

export default router;