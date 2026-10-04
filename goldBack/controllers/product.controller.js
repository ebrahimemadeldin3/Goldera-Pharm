import { prisma } from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import { ApiFeatures, paginationResults } from "../utils/apiFeatures.js";
import { text, number } from "../utils/validation.js";

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
        name: text(name, "Name"),
        internalRef: text(internalRef, "Internal reference"),
        salesPrice: number(salesPrice, "Sales price", { min: 0.01 }),
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
    next(error);
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

    const apiFeatures = new ApiFeatures(req.query, "Products");
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
    next(error);
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
    next(error);
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

    if (name !== undefined) payload.name = text(name, "Name");
    if (internalRef !== undefined)
      payload.internalRef = text(internalRef, "Internal reference");
    if (salesPrice !== undefined)
      payload.salesPrice = number(salesPrice, "Sales price", { min: 0.01 });
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
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.products.findUnique({ where: { id } });

    if (!existing) {
      return next(new ApiError("Product not found", 404));
    }

    if (
      (await prisma.sales.count({ where: { productId: id } })) ||
      (await prisma.request.count({ where: { productsId: id } }))
    )
      return next(
        new ApiError(
          "This product is used in sales or requests and cannot be deleted",
          409,
        ),
      );
    const [requests, forecasts] = await Promise.all([
      prisma.request.findMany({
        where: { type: "SAMPLE" },
        select: { sampleData: true },
      }),
      prisma.forecast.findMany({ select: { productForecasts: true } }),
    ]);
    if (
      requests.some((r) =>
        r.sampleData.some((item) => item.productId === id),
      ) ||
      forecasts.some((f) =>
        f.productForecasts.some(
          (item) => item.productId === id || item.productName === existing.name,
        ),
      )
    )
      return next(
        new ApiError(
          "This product is referenced by samples or forecasts and cannot be deleted",
          409,
        ),
      );
    await prisma.products.delete({ where: { id } });

    res.status(200).json({
      status: "success",
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
