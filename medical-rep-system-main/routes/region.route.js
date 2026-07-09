import express from "express";
const router = express.Router();

import { addRegion, getAllRegions } from "../controllers/region.controller.js";
import { guard, allowedTo } from "../middlewares/auth.middleware.js";

router.use(guard);

router.route("/").post(allowedTo("MANAGER"), addRegion).get(getAllRegions);

export default router;
