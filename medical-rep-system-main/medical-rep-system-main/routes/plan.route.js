import express from "express";
const router = express.Router();

import {
  createPlan,
  getAllPlans,
  getMyPlans,
  getOnePlan,
  getPlansMGMT,
  updateOnePlan,
} from "../controllers/plan.controller.js";
import { guard, allowedTo } from "../middlewares/auth.middleware.js";

router.use(guard);

// Plans Routes
router.post("/", createPlan);
router.get("/", getMyPlans);
router.get("/all", allowedTo("MANAGER"), getAllPlans);
router.get("/mgmt", allowedTo("SUPERVISOR", "MANAGER"), getPlansMGMT);
router.get("/:id", getOnePlan);
router.patch("/:id", updateOnePlan);

export default router;
