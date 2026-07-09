import { prisma } from "../config/db.js";
import { ApiError } from "../utils/apiError.js";

const repMiddleware = async (req, res, next) => {
  const { position, id: userId } = req.user;
  const { id } = req.params;

  // MANAGER → full access
  if (position === "MANAGER") return next();

  // MEDICAL_REP → can only access own data
  if (position === "MEDICAL_REP") {
    if (id !== userId) {
      return next(
        new ApiError("Forbidden, you can only access your own data", 403)
      );
    }
    return next();
  }

  // SUPERVISOR → can access only reps under them
  if (position === "SUPERVISOR") {
    const user = await prisma.user.findUnique({
      where: { id: id },
      select: { supervisorId: true },
    });

    // Rep doesn't exist
    if (!user) {
      return next(new ApiError("User not found", 404));
    }

    // Rep doesn't belong to this supervisor
    if (!user.supervisorId || user.supervisorId !== userId) {
      return next(
        new ApiError("Forbidden, you can only access your own data", 403)
      );
    }

    return next();
  }

  // Fallback for unexpected roles
  return next(new ApiError("Access denied", 403));
};

export { repMiddleware };
