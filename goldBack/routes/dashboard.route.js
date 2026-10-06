import express from "express";
const router = express.Router();

import { guard, allowedTo } from "../middlewares/auth.middleware.js";
import { getManagerOverview } from "../controllers/manager-overview.controller.js";

import {
  getRepsDashboard,
  getManagersDashboard,
} from "../controllers/dashboard.controller.js";

router.use(guard);

// Dashboard route
router.get("/reps", allowedTo("MEDICAL_REP"), getRepsDashboard);
router.get("/rep", allowedTo("MEDICAL_REP"), getRepsDashboard);
router.get("/managers", allowedTo("MANAGER"), getManagersDashboard);
router.get("/managers/overview", allowedTo("MANAGER"), getManagerOverview);
router.get("/manager", allowedTo("MANAGER"), getManagersDashboard);
router.get("/supervisors", allowedTo("SUPERVISOR"), getManagersDashboard);

export default router;
