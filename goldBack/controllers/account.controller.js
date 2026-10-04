import { prisma } from "../config/db.js";
import { ApiError } from "../utils/apiError.js";

const addAccount = async (req, res, next) => {
  try {
    const { name, subRegionId } = req.body;

    if (!name) {
      return next(new ApiError("Account name is required", 400));
    }

    const account = await prisma.accounts.create({
      data: {
        name,
        subRegionId: subRegionId || null,
      },
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
      },
    });

    res.status(201).json({
      status: "success",
      message: "Data created successfully",
      data: account,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Failed to create account", 500));
  }
};

const getAllAccounts = async (req, res, next) => {
  try {
    const accounts = await prisma.accounts.findMany({
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
        doctors: {
          select: {
            id: true,
            nameEN: true,
            nameAR: true,
            phone: true,
            specialty: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      status: "success",
      message: "Data fetched successfully",
      results: accounts.length,
      data: accounts,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Failed to fetch accounts", 500));
  }
};

export { addAccount, getAllAccounts };
