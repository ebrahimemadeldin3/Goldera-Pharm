import express from "express";
const router = express.Router();

import {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  archiveProduct,
  restoreProduct,
} from "../controllers/product.controller.js";
import { guard, allowedTo } from "../middlewares/auth.middleware.js";
import { productImageUpload } from "../utils/multer.js";

router.use(guard);

router
  .route("/")
  .post(allowedTo("MANAGER"), productImageUpload, addProduct)
  .get(getAllProducts);
router.get("/:id", getProductById);
router.patch("/:id/archive", allowedTo("MANAGER"), archiveProduct);
router.patch("/:id/restore", allowedTo("MANAGER"), restoreProduct);
router.patch("/:id", allowedTo("MANAGER"), productImageUpload, updateProduct);
router.delete("/:id", allowedTo("MANAGER"), deleteProduct);

export default router;
