import { prisma } from "../config/db.js";
import { ApiError } from "../utils/apiError.js";

const addSubRegion = async (req, res) => {
  const { name, regionId } = req.body;

  const subRegion = await prisma.subRegion.create({
    data: { name, regionId },
  });
  res.status(201).json({
    status: "success",
    message: "Data created successfully",
    data: subRegion,
  });
};

const getAllSubRegions = async (req, res) => {
  const subRegions = await prisma.subRegion.findMany({
    select: {
      id: true,
      name: true,
      region: {
        select: {
          id: true,
          name: true,
          country: true,
          supervisor: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      },
      reps: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },

      createdAt: true,
    },
  });
  res.status(200).json({
    status: "success",
    message: "Data fetched successfully",
    results: subRegions.length,
    data: subRegions,
  });
};

export { addSubRegion, getAllSubRegions };
