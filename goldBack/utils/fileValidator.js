import { filetypemime } from "magic-bytes.js";
import { ApiError } from "./apiError.js";

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

const allowedDocumentMimeTypes = {
  "application/pdf": "pdf",
};

const allowedImageMimeTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const detectMimeType = async (file) => {
  if (!file.buffer || !Buffer.isBuffer(file.buffer)) {
    throw new ApiError(`Invalid or empty file: ${file.originalname}`, 400);
  }

  const detected = await filetypemime(file.buffer);
  const detectedMime = Array.isArray(detected) ? detected[0] : detected;

  if (!detectedMime) {
    throw new ApiError(`Unsupported file type: ${file.originalname}`, 415);
  }

  return detectedMime;
};

const validateAndDetectFiles = async (files) => {
  const validated = [];

  for (const file of files) {
    const detectedMime = await detectMimeType(file);

    if (!allowedDocumentMimeTypes[detectedMime]) {
      throw new ApiError(
        `Unsupported file type: ${file.originalname}. Allowed: PDF`,
        415,
      );
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      throw new ApiError("File must be smaller than 5 MB.", 413);
    }

    validated.push({
      ...file,
      realMime: detectedMime,
      realExt: allowedDocumentMimeTypes[detectedMime],
    });
  }

  return validated;
};

const validateAndDetectImageFile = async (file) => {
  const detectedMime = await detectMimeType(file);

  if (!allowedImageMimeTypes[detectedMime]) {
    throw new ApiError("Please select a JPG, PNG or WebP image.", 415);
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    throw new ApiError("Image must be smaller than 5 MB.", 413);
  }

  return {
    ...file,
    realMime: detectedMime,
    realExt: allowedImageMimeTypes[detectedMime],
  };
};

export { validateAndDetectFiles, validateAndDetectImageFile };
