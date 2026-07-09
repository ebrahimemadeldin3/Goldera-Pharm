import express from "express";

import {
  addPharmacy,
  getAllPharmacies,
} from "../controllers/pharmacies.controller.js";

const router = express.Router();

import { guard, allowedTo } from "../middlewares/auth.middleware.js";

router.use(guard);

router.route("/").post(allowedTo("MANAGER"), addPharmacy).get(getAllPharmacies);

export default router;
