import express from "express";
const router = express.Router();

import { guard, allowedTo } from "../middlewares/auth.middleware.js";
import { getRepsDashboard } from "../controllers/dashboard.controller.js";
import { getCurrentRep } from "../controllers/rep.controller.js";

router.use(guard, allowedTo("MEDICAL_REP"));

router.get("/", getCurrentRep);
router.get("/me", getCurrentRep);
router.get("/dashboard", getRepsDashboard);

export default router;
