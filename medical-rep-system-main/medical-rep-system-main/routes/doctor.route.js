import express from "express";
const router = express.Router();

import {
  addNewDoctor,
  getAllDoctors,
  getOneDoctor,
  updateDoctor,
  deleteDoctor,
  addDoctorByCSV,
} from "../controllers/doctor.controller.js";
import { sheetUpload } from "../utils/multer.js";
import { guard, allowedTo } from "../middlewares/auth.middleware.js";

router.use(guard);

router.get("/", getAllDoctors);
router.post("/", allowedTo("MANAGER"), addNewDoctor);
router.post("/csv", allowedTo("MANAGER"), sheetUpload, addDoctorByCSV);
router.get("/:id", getOneDoctor);
router.patch("/:id", allowedTo("MANAGER"), updateDoctor);
router.delete("/:id", allowedTo("MANAGER"), deleteDoctor);

export default router;
