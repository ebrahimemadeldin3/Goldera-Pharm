import express from "express";

import {
  addSale,
  getAllSales,
  getRepsSales,
  getRepsSalesByRepId,
} from "../controllers/sales.controller.js";
import { sheetUpload } from "../utils/multer.js";
import { guard, allowedTo } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(guard);

router.post("/", allowedTo("MANAGER"), sheetUpload, addSale);
router.get("/", allowedTo("MANAGER"), getAllSales);
router.get("/reps", allowedTo("MEDICAL_REP"), getRepsSales);
router.get("/reps/:repId", allowedTo("MANAGER"), getRepsSalesByRepId);

export default router;
