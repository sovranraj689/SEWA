// import express from "express";
// import { register, login, googleAuth, getMe, updateProfile, changePassword } from "../controllers/authController.js";
// import { protect } from "../middleware/auth.js";

// const router = express.Router();

// router.post("/register", register);
// router.post("/login", login);
// router.post("/google", googleAuth);
// router.get("/me", protect, getMe);
// router.put("/profile", protect, updateProfile);
// router.put("/change-password", protect, changePassword);

// export default router;

import express from "express";
import {
  register, login, googleAuth, getMe, updateProfile, changePassword,
  addAddress, updateAddress, deleteAddress,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleAuth);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

router.post("/addresses", protect, addAddress);
router.put("/addresses/:addressId", protect, updateAddress);
router.delete("/addresses/:addressId", protect, deleteAddress);

export default router;
