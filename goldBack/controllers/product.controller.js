import { prisma } from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import { ApiFeatures, paginationResults } from "../utils/apiFeatures.js";

const addProduct = async (req, res, next) => {
  try {
    const { name, internalRef, salesPrice, image, imageUrl } = req.body;

    if (!name || !internalRef || !salesPrice) {
      return next(
        new ApiError("Name, internalRef, and salesPrice are required", 400),
      );
    }

    const product = await prisma.products.create({
      data: {
        name: String(name).trim(),
        internalRef: String(internalRef).trim(),
        salesPrice: Number(salesPrice),
        image: image ?? imageUrl ?? null,
      },
    });

    res.status(201).json({
      status: "success",
      message: "Data created successfully",
      data: product,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Failed to create product", 500));
  }
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

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await prisma.products.findUnique({ where: { id } });
    if (!product) {
      return next(new ApiError("Product not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: product,
    });
  } catch (error) {
    next(new ApiError("Failed to fetch product", 500));
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.products.findUnique({ where: { id } });

    if (!existing) {
      return next(new ApiError("Product not found", 404));
    }

    const { name, internalRef, salesPrice, image, imageUrl } = req.body;
    const payload = {};

    if (name !== undefined) payload.name = String(name).trim();
    if (internalRef !== undefined) payload.internalRef = String(internalRef).trim();
    if (salesPrice !== undefined) payload.salesPrice = Number(salesPrice);
    if (image !== undefined || imageUrl !== undefined) {
      payload.image = image ?? imageUrl ?? null;
    }

    const updated = await prisma.products.update({
      where: { id },
      data: payload,
    });

    res.status(200).json({
      status: "success",
      message: "Product updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Failed to update product", 500));
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.products.findUnique({ where: { id } });

    if (!existing) {
      return next(new ApiError("Product not found", 404));
    }

    await prisma.products.delete({ where: { id } });

    res.status(200).json({
      status: "success",
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(new ApiError("Failed to delete product", 500));
  }
};

export { addProduct, getAllProducts, getProductById, updateProduct, deleteProduct };
