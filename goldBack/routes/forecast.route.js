import express from "express";
const router = express.Router();

import {
  createForecast,
  getForecasts,
  getForecastById,
  getAllForecasts,
  updateForecast,
} from "../controllers/forecast.controller.js";
import { guard, allowedTo } from "../middlewares/auth.middleware.js";

router.use(guard);

router.post("/", allowedTo("MEDICAL_REP"), createForecast);
router.get("/", allowedTo("MEDICAL_REP"), getForecasts);
router.get("/all", allowedTo("MANAGER", "SUPERVISOR"), getAllForecasts);
router.get("/:id", getForecastById);
router.put("/:id", allowedTo("MANAGER", "SUPERVISOR"), updateForecast);
router.patch("/:id", allowedTo("MANAGER", "SUPERVISOR"), updateForecast);

export default router;
