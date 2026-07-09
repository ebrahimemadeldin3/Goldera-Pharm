import { prisma } from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import { ApiFeatures, paginationResults } from "../utils/apiFeatures.js";

const addProduct = async (req, res, next) => {
  const { name, internalRef, salesPrice } = req.body;

  const product = await prisma.products.createMany({
    data: req.body,
  });
  res.status(201).json({
    status: "success",
    message: "Data created successfully",
    data: product,
  });
};

const getAllProducts = async (req, res, next) => {
  try {
    const { paginate } = req.query;

    if (paginate === "false") {
      const products = await prisma.products.findMany({
        orderBy: { createdAt: "desc" },
      });

      return res.status(200).json({
        status: "success",
        message: "Products fetched successfully",
        results: products.length,
        pagination: null,
        data: products,
      });
    }

    const apiFeatures = new ApiFeatures(req.query);
    const { queryObj, pagination } = apiFeatures.applyFeatures(req.query);
    const whereClause = { ...queryObj.where };

    const totalDocuments = await prisma.products.count({ where: whereClause });

    const products = await prisma.products.findMany({
      where: whereClause,
      orderBy: queryObj.orderBy || { id: "desc" },
      take: queryObj.take,
      skip: queryObj.skip,
    });

    const paginationData = paginationResults(pagination, totalDocuments);

    res.status(200).json({
      status: "success",
      message: "Data fetched successfully",
      results: totalDocuments,
      pagination: paginationData,
      data: products,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Failed to fetch products", 500));
  }
};

export { addProduct, getAllProducts };
