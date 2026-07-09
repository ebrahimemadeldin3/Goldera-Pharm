import JWT from "jsonwebtoken";
import { prisma } from "../config/db.js";
import { JWT_ACCESS_SECRET_KEY } from "../config/index.js";
import { ApiError } from "../utils/apiError.js";

const guard = async (req, res, next) => {
  // 1) Check if token exists in request
  let token = null;

  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.body && req.body.token) {
    token = req.body.token;
  }

  // 2) If no token is found, return an error
  if (!token) {
    return next(new ApiError("Not authenticated to perform this action.", 401));
  }

  try {
    // 3) Verify the token
    const decoded = await JWT.verify(token, JWT_ACCESS_SECRET_KEY);

    // 4) Find the user based on decoded token
    const loggedUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        supervisorId: true,
        managerId: true,
        dateOfBirth: true,
        dateOfRecruitment: true,
        lastLogin: true,
      },
    });

    if (!loggedUser) {
      return next(new ApiError("User not found", 404));
    }

    // 5) Attach the user to the request object for future middleware or routes
    req.user = loggedUser;

    // 6) Continue to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Token verification error:", error);

    return next(
      new ApiError(
        "Something went wrong with access token, please log in again.",
        401
      )
    );
  }
};

const allowedTo =
  (...roles) =>
  async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          "Access Denied - You are not authorized to perform this action",
          403
        )
      );
    }

    next();
  };

export { guard, allowedTo };
