import express from "express";
const router = express.Router();

import {
  getSupervisorTeam,
  getRepDetails,
  getTeamRequests,
} from "../controllers/supervisor.controller.js";
import { guard, allowedTo } from "../middlewares/auth.middleware.js";

router.use(guard, allowedTo("SUPERVISOR", "MANAGER"));

// Team Routes
router.get("/team", getSupervisorTeam);
router.get("/team/requests", getTeamRequests);
router.get("/team/:repId", getRepDetails);

export default router;
