import express from "express";
const router = express.Router();

import { addRegion, getAllRegions } from "../controllers/region.controller.js";
import {
  updateReference,
  deleteReference,
} from "../controllers/region.controller.js";
import { guard, allowedTo } from "../middlewares/auth.middleware.js";

router.use(guard);

router.route("/").post(allowedTo("MANAGER"), addRegion).get(getAllRegions);

router.patch("/:id", allowedTo("MANAGER"), updateReference);
router.delete("/:id", allowedTo("MANAGER"), deleteReference);

export default router;
