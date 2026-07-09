import express from "express";
const router = express.Router();

import {
  addSubRegion,
  getAllSubRegions,
} from "../controllers/subRegion.controller.js";
import { guard, allowedTo } from "../middlewares/auth.middleware.js";

router.use(guard);

router
  .route("/")
  .post(allowedTo("MANAGER"), addSubRegion)
  .get(getAllSubRegions);

export default router;
