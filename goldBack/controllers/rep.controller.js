import { prisma } from "../config/db.js";
import { ApiError } from "../utils/apiError.js";

const getCurrentRep = async (req, res, next) => {
  try {
    const rep = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        subRegion: {
          select: {
            id: true,
            name: true,
            region: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        supervisor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!rep) {
      return next(new ApiError("Rep not found", 404));
    }

    res.status(200).json({
      status: "success",
      message: "Data fetched successfully",
      data: rep,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Failed to fetch rep profile", 500));
  }
};

export { getCurrentRep };
