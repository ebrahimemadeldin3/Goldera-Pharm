import multer from "multer";
import { ApiError } from "./apiError.js";

// Image-specific configuration
const imageUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("image/") &&
      file.originalname.match(/\.(jpg|jpeg|png)$/i)
    ) {
      cb(null, true);
    } else {
      cb(new ApiError("Only image files are allowed!", 422), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB for images
  },
}).single("profileImage");

const filesUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ApiError("Only PDF files are allowed!", 422), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
}).fields([
  { name: "resume", maxCount: 1 },
  { name: "certificates", maxCount: 10 },
  { name: "pdfs", maxCount: 10 },
]);

const sheetUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + "-" + file.originalname);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.mimetype === "application/vnd.ms-excel"
    ) {
      cb(null, true);
    } else {
      cb(new ApiError("Only Excel files are allowed!", 422), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 },
}).single("sheet");

export { imageUpload, filesUpload, sheetUpload };
