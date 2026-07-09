import express from "express";
const router = express.Router();

import {
  getProfile,
  updateProfile,
  uploadProfileImage,
  removeProfileImage,
} from "../controllers/profile.controller.js";
import { imageUpload } from "../utils/multer.js";
import { guard } from "../middlewares/auth.middleware.js";

router.use(guard);

// Profile Routes
router.get("/", getProfile);
router.patch("/", updateProfile);
router.post("/profile-image", imageUpload, uploadProfileImage);
router.delete("/profile-image", removeProfileImage);

export default router;
