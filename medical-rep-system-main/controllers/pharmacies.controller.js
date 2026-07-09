import { prisma } from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import { ApiFeatures, paginationResults } from "../utils/apiFeatures.js";

const addPharmacy = async (req, res, next) => {
  try {
    const pharmacy = await prisma.pharmacy.createMany({ data: req.body });
    res.status(201).json({
      status: "success",
      message: "Data created successfully",
      data: pharmacy,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Failed to create pharmacy", 500));
  }
};

const getAllPharmacies = async (req, res, next) => {
  try {
    const apiFeatures = new ApiFeatures(req.query);
    const { queryObj, pagination } = apiFeatures.applyFeatures(req.query);
    const whereClause = { ...queryObj.where };

    const totalDocuments = await prisma.pharmacy.count({ where: whereClause });

    const pharmacies = await prisma.pharmacy.findMany({
      where: whereClause,
      orderBy: queryObj.orderBy || { createdAt: "desc" },
      take: queryObj.take,
      skip: queryObj.skip,
    });

    const paginationData = paginationResults(pagination, totalDocuments);

    res.status(200).json({
      status: "success",
      message: "Data fetched successfully",
      results: totalDocuments,
      pagination: paginationData,
      data: pharmacies,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Failed to fetch pharmacies", 500));
  }
};

export { addPharmacy, getAllPharmacies };
