import express from "express";
const router = express.Router();

import {
  addSubRegion,
  getAllSubRegions,
} from "../controllers/subRegion.controller.js";
import {
  updateReference,
  deleteReference,
} from "../controllers/subRegion.controller.js";
import { guard, allowedTo } from "../middlewares/auth.middleware.js";

router.use(guard);

router
  .route("/")
  .post(allowedTo("MANAGER"), addSubRegion)
  .get(getAllSubRegions);

router.patch("/:id", allowedTo("MANAGER"), updateReference);
router.delete("/:id", allowedTo("MANAGER"), deleteReference);

export default router;
