import express from "express";
const router = express.Router();

import {
  addCoachingReport,
  responseToCoachingReport,
  getMyCoachingReport,
  getAllCoachingReport,
  getRepCoachingReport,
} from "../controllers/coaching-reports.controller.js";
import { guard, allowedTo } from "../middlewares/auth.middleware.js";

router.use(guard);

router.post("/", allowedTo("SUPERVISOR", "MANAGER"), addCoachingReport);
router.get("/", allowedTo("SUPERVISOR"), getMyCoachingReport);
router.get("/all", allowedTo("MANAGER"), getAllCoachingReport);
router.get("/rep", allowedTo("MEDICAL_REP"), getRepCoachingReport);
router.patch("/:id", allowedTo("MEDICAL_REP"), responseToCoachingReport);

export default router;
