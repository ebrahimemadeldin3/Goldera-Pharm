import express from "express";
const router = express.Router();

import {
  addAppraisal,
  getAppraisals,
} from "../controllers/appraisal.controller.js";
import { guard, allowedTo } from "../middlewares/auth.middleware.js";

router.use(guard);

router.post("/", allowedTo("MANAGER"), addAppraisal);
router.get("/", allowedTo("MANAGER"), getAppraisals);

export default router;
