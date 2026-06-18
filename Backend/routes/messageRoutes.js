import express from "express";
import { createMessage, getMessages, markMessageRead, deleteMessage } from "../controllers/messageController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.post("/", createMessage); // public — contact form
router.get("/", protect, adminOnly, getMessages);
router.put("/:id/read", protect, adminOnly, markMessageRead);
router.delete("/:id", protect, adminOnly, deleteMessage);

export default router;