import express from "express";
const router = express.Router();

import {
  addAccount,
  getAllAccounts,
} from "../controllers/account.controller.js";
import { guard, allowedTo } from "../middlewares/auth.middleware.js";

router.use(guard);

router.get("/", getAllAccounts);
router.post("/", allowedTo("MANAGER"), addAccount);

export default router;
