import express from "express";
const router = express.Router();

import {
  addProduct,
  getAllProducts,
} from "../controllers/product.controller.js";
import { guard, allowedTo } from "../middlewares/auth.middleware.js";

router.use(guard);

router.route("/").post(allowedTo("MANAGER"), addProduct).get(getAllProducts);

export default router;
