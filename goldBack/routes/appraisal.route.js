import express from "express";
const router = express.Router();

import {
  addAppraisal,
  getAppraisals,
  getRepAppraisals,
  acknowledgeAppraisal,
} from "../controllers/appraisal.controller.js";
import { guard, allowedTo } from "../middlewares/auth.middleware.js";

router.use(guard);

router.post("/", allowedTo("MANAGER"), addAppraisal);
router.get("/", allowedTo("MANAGER"), getAppraisals);
router.get("/rep", allowedTo("MEDICAL_REP"), getRepAppraisals);
router.patch("/:id", allowedTo("MEDICAL_REP", "MANAGER"), acknowledgeAppraisal);

export default router;
