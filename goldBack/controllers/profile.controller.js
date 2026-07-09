import { prisma } from "../config/db.js";

import { ApiError } from "../utils/apiError.js";
import {
  removeImageFromCloudinary,
  uploadImageToCloudinary,
} from "../utils/cloudinary.js";

// Profile Controllers
const getProfile = async (req, res) => {
  const data = await prisma.user.findUnique({
    where: { id: req.user.id },
  });
  let user = { ...data };
  delete user.password;

  res.status(200).json({
    status: "success",
    message: "Data fetched successfully",
    data: user,
  });
};

const updateProfile = async (req, res) => {
  if (req.body?.password) {
    delete req.body.password; // Prevent password updates through this route
  }

  const data = await prisma.user.update({
    where: { id: req.user.id },
    data: req.body,
  });
  res.status(200).json({
    status: "success",
    message: "Data updated successfully",
    data: data,
  });
};

const uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ApiError("No file uploaded", 400));
    }

    if (
      req.file.mimetype !== "image/jpeg" &&
      req.file.mimetype !== "image/png"
    ) {
      return next(new ApiError("Only JPEG and PNG images are allowed", 400));
    }

    // upload image to cloudinary

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { profileImage: true },
    });

    if (user?.profileImage && user.profileImage?.public_id) {
      await removeImageFromCloudinary(user.profileImage?.public_id);
    }

    const result = await uploadImageToCloudinary(req.file.buffer, {
      public_id: `profile_${req.user.id}_${Date.now()}`,
      folder: "folder-files/profiles",
    });

    let imageData =
      { public_id: result.public_id, url: result.secure_url } || {};

    const data = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        profileImage: imageData,
      },
    });
    res.status(200).json({
      status: "success",
      message: "Data updated successfully",
      data: data,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError(`Upload Profile Image Error: ${error}`, 500));
  }
};

const removeProfileImage = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { profileImage: true },
    });

    if (user?.profileImage && user.profileImage?.public_id) {
      await removeImageFromCloudinary(user.profileImage?.public_id);
    }

    const data = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        profileImage: null,
      },
    });
    res.status(200).json({
      status: "success",
      message: "Data updated successfully",
      data: data,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError(`Remove Profile Image Error: ${error}`, 500));
  }
};

export { getProfile, updateProfile, uploadProfileImage, removeProfileImage };
