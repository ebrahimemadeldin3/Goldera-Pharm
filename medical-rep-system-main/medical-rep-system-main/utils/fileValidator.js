import { filetypemime } from "magic-bytes.js";
import { ApiError } from "./apiError.js";

// Allowed types
const allowedMimeTypes = {
  "application/pdf": "pdf",
};

const validateAndDetectFiles = async (files) => {
  const validated = [];

  for (const file of files) {
    if (!file.buffer || !Buffer.isBuffer(file.buffer)) {
      throw new ApiError(`Invalid or empty file: ${file.originalname}`, 400);
    }

    const detected = await filetypemime(file.buffer);

    console.log(detected[0]);

    if (!detected || !allowedMimeTypes[detected[0]]) {
      throw new ApiError(
        `نوع الملف غير مدعوم: ${file.originalname}. المسموح به: PDF`,
        422
      );
    }

    let maxFileSize = 5 * 1024 * 1024;

    if (file.size > maxFileSize) {
      throw new ApiError(
        `الملف كبير جدًا. الحد الأقصى المسموح به هو ${maxFileSize} بايت`,
        400
      );
    }

    validated.push({
      ...file,
      realMime: detected.mime,
      realExt: allowedMimeTypes[detected[0]],
    });
  }

  return validated;
};

export { validateAndDetectFiles };
