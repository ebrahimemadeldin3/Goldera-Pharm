import express from "express";
const router = express.Router();

import {
  scheduleVisit,
  getVisits,
  addVisitReports,
  getAllVisitReports,
  getMyVisitReports,
  updateVisit,
  getAllVisits,
} from "../controllers/visit.controller.js";
import { guard, allowedTo } from "../middlewares/auth.middleware.js";

router.use(guard);

// Visits and Visit Reports Routes
router.post("/", scheduleVisit);
router.get("/", getVisits);
router.get("/all", allowedTo("MANAGER", "SUPERVISOR"), getAllVisits);
router.post("/visit-reports", addVisitReports);
router.get("/visit-reports", getMyVisitReports);
router.get(
  "/all-visit-reports",
  allowedTo("MANAGER", "SUPERVISOR"),
  getAllVisitReports,
);
router.patch("/:id", updateVisit);

export default router;
