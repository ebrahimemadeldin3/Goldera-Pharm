import express from "express";
const router = express.Router();

import {
  getMyRequests,
  createRequest,
  updateRequest,
} from "../controllers/request.controller.js";
import { guard, allowedTo } from "../middlewares/auth.middleware.js";
import { filesUpload } from "../utils/multer.js";

router.use(guard);

// Requests Routes
router.get("/", getMyRequests);
router.post("/", filesUpload, createRequest);
router.patch("/:id", allowedTo("MANAGER", "SUPERVISOR"), updateRequest);

export default router;
