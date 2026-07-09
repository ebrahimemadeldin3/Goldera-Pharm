import { v2 as cloudinary } from "cloudinary";
import { ApiError } from "./apiError.js";

import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} from "../config/index.js";

// Configure Cloudinary
try {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
} catch (error) {
  console.error("Failed to configure Cloudinary:", error.message);
  throw new ApiError("فشل في تهيئة Cloudinary.", 500);
}

const uploadImageToCloudinary = (buffer, options = {}) => {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error("Invalid file buffer");
  }
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        quality: "auto",
        fetch_format: "auto",
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
};

const uploadDocumentToCloudinary = (buffer, options = {}) => {
  if (!Buffer.isBuffer(buffer)) {
    throw new Error("Invalid file buffer");
  }
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
};

const removeImageFromCloudinary = async (publicId) => {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error(`[Cloudinary Image Delete Failed] ${publicId}:`, err.message);
  }
};

const removeDocumentFromCloudinary = async (publicId) => {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "raw",
    });
  } catch (err) {
    console.error(
      `[Cloudinary Document Delete Failed] ${publicId}:`,
      err.message
    );
  }
};

const removeCloudinaryFolder = async (folderPath) => {
  if (!folderPath) return;

  try {
    // Helper to delete all assets by prefix (with pagination)
    const deleteAllByPrefix = async (resourceType) => {
      let nextCursor = null;

      do {
        const res = await cloudinary.api.delete_resources_by_prefix(
          folderPath,
          {
            resource_type: resourceType,
            next_cursor: nextCursor,
          }
        );

        nextCursor = res.next_cursor;
      } while (nextCursor);
    };

    // 1️⃣ Delete all RAW files
    await deleteAllByPrefix("raw");

    // 2️⃣ Delete all images (if any)
    await deleteAllByPrefix("image");

    // 3️⃣ Delete folder (now guaranteed empty)
    await cloudinary.api.delete_folder(folderPath);
  } catch (err) {
    // 🚨 NEVER throw in cleanup logic
    console.error(`[Cloudinary Cleanup Failed] ${folderPath}:`, err.message);
  }
};

export {
  uploadImageToCloudinary,
  uploadDocumentToCloudinary,
  removeImageFromCloudinary,
  removeDocumentFromCloudinary,
  removeCloudinaryFolder,
};
