import express from "express";
const router = express.Router();

import { guard, allowedTo } from "../middlewares/auth.middleware.js";

router.use(guard, allowedTo("MEDICAL_REP"));

// Targets and Dashboard Routes
// router.get("/targets", getTarget); // untested
// router.get("/dashboard");
// router.get("/reports");

export default router;
