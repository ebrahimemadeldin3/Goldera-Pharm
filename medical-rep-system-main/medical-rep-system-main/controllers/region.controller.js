import { prisma } from "../config/db.js";
import { ApiError } from "../utils/apiError.js";

const addRegion = async (req, res) => {
  const { name, country } = req.body;

  const region = await prisma.region.create({
    data: { name, country },
  });
  res.status(201).json({
    status: "success",
    message: "Data created successfully",
    data: region,
  });
};

const getAllRegions = async (req, res) => {
  const regions = await prisma.region.findMany({
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
      subRegions: {
        select: {
          id: true,
          name: true,
          reps: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      },

      createdAt: true,
    },
  });
  res.status(200).json({
    status: "success",
    message: "Data fetched successfully",
    results: regions.length,
    data: regions,
  });
};

export { addRegion, getAllRegions };
