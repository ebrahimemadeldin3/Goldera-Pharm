import express from "express";
const router = express.Router();

import {
  createUser,
  getAllUsers,
  getUserDetails,
  updateOneUserById,
  deleteOneUserById,
  getManagerTeam,
  getTeamRequests,
} from "../controllers/manager.controller.js";
import { filesUpload } from "../utils/multer.js";
import { guard, allowedTo } from "../middlewares/auth.middleware.js";

router.use(guard, allowedTo("MANAGER"));

// Users CRUD operations
router.post("/users", filesUpload, createUser);
router.get("/users", getAllUsers);
router.get("/users/:id", getUserDetails);
router.put("/users/:id", updateOneUserById);
router.delete("/users/:id", deleteOneUserById);

// Team Routes
router.get("/team", getManagerTeam);
router.get("/team/requests", getTeamRequests);

export default router;
