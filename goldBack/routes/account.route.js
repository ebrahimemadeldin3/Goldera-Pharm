import express from "express";
const router = express.Router();

import {
  addAccount,
  getAllAccounts,
} from "../controllers/account.controller.js";
import {
  updateReference,
  deleteReference,
} from "../controllers/account.controller.js";
import { guard, allowedTo } from "../middlewares/auth.middleware.js";

router.use(guard);

router.get("/", getAllAccounts);
router.post("/", allowedTo("MANAGER"), addAccount);

router.patch("/:id", allowedTo("MANAGER"), updateReference);
router.delete("/:id", allowedTo("MANAGER"), deleteReference);

export default router;
