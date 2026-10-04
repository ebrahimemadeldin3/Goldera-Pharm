import express from "express";
const router = express.Router();

import {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import { guard, allowedTo } from "../middlewares/auth.middleware.js";

router.use(guard);

router.route("/").post(allowedTo("MANAGER"), addProduct).get(getAllProducts);
router.get("/:id", getProductById);
router.patch("/:id", allowedTo("MANAGER"), updateProduct);
router.delete("/:id", allowedTo("MANAGER"), deleteProduct);

export default router;
