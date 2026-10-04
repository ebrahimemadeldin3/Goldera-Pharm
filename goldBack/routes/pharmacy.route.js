import express from "express";

import {
  addPharmacy,
  getAllPharmacies,
  getPharmacyById,
  updatePharmacy,
  deletePharmacy,
  bulkImportPharmacies,
} from "../controllers/pharmacies.controller.js";

const router = express.Router();

import { guard, allowedTo } from "../middlewares/auth.middleware.js";

router.use(guard);

router.route("/").post(allowedTo("MANAGER"), addPharmacy).get(getAllPharmacies);
router.post("/bulk-import", allowedTo("MANAGER"), bulkImportPharmacies);
router.get("/:id", getPharmacyById);
router.patch("/:id", allowedTo("MANAGER"), updatePharmacy);
router.delete("/:id", allowedTo("MANAGER"), deletePharmacy);

export default router;
