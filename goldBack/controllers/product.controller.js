import { prisma } from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import { ApiFeatures, paginationResults } from "../utils/apiFeatures.js";
import { text, number } from "../utils/validation.js";
import {
  removeImageFromCloudinary,
  uploadImageToCloudinary,
} from "../utils/cloudinary.js";
import { validateAndDetectImageFile } from "../utils/fileValidator.js";

const productStatusWhere = (status) => {
  if (status === undefined || status === "" || status === "active") {
    return { isArchived: false };
  }
  if (status === "archived") return { isArchived: true };
  if (status === "all") return {};
  throw new ApiError("Invalid product status filter", 400);
};

const getProductDependencies = async (product) => {
  const id = product.id;
  const [salesCount, directRequestCount, sampleRequests, forecasts] =
    await Promise.all([
      prisma.sales.count({ where: { productId: id } }),
      prisma.request.count({ where: { productsId: id } }),
      prisma.request.findMany({
        where: { type: "SAMPLE" },
        select: { sampleData: true },
      }),
      prisma.forecast.findMany({ select: { productForecasts: true } }),
    ]);

  const dependencies = [];
  if (salesCount > 0) dependencies.push("sales");
  if (directRequestCount > 0) dependencies.push("requests");
  if (
    sampleRequests.some((request) =>
      (request.sampleData || []).some((item) => item?.productId === id),
    )
  ) {
    dependencies.push("sampleRequests");
  }
  if (
    forecasts.some((forecast) =>
      (forecast.productForecasts || []).some(
        (item) => item?.productId === id || item?.productName === product.name,
      ),
    )
  ) {
    dependencies.push("forecasts");
  }

  return dependencies;
};

const productInUseError = (dependencies) =>
  new ApiError(
    "This product is used by existing records and cannot be permanently deleted. Archive it instead.",
    409,
    {
      code: "PRODUCT_IN_USE",
      canArchive: true,
      dependencies,
    },
  );

const parseBooleanField = (value) =>
  value === true || value === "true" || value === "1" || value === "yes";

const getCloudinaryPublicId = (image) => {
  if (!image || typeof image !== "object") return null;
  return typeof image.public_id === "string" && image.public_id.trim()
    ? image.public_id
    : null;
};

const uploadProductImage = async (file, productId) => {
  if (!file) return null;

  const validated = await validateAndDetectImageFile(file);
  const result = await uploadImageToCloudinary(validated.buffer, {
    public_id: `product_${productId}_${Date.now()}`,
    folder: "folder-files/products",
  });

  return {
    public_id: result.public_id,
    url: result.secure_url,
    mimeType: validated.realMime,
  };
};

const addProduct = async (req, res, next) => {
  let uploadedImage = null;

  try {
    const { name, internalRef, salesPrice, image, imageUrl } = req.body;

    if (!name || !internalRef || !salesPrice) {
      return next(
        new ApiError("Name, internalRef, and salesPrice are required", 400),
      );
    }

    if (req.file) {
      uploadedImage = await uploadProductImage(req.file, "new");
    }

    const product = await prisma.products.create({
      data: {
        name: text(name, "Name"),
        internalRef: text(internalRef, "Internal reference"),
        salesPrice: number(salesPrice, "Sales price", { min: 0.01 }),
        image: uploadedImage ?? image ?? imageUrl ?? null,
      },
    });

    res.status(201).json({
      status: "success",
      message: "Data created successfully",
      data: product,
    });
  } catch (error) {
    if (uploadedImage?.public_id) {
      await removeImageFromCloudinary(uploadedImage.public_id);
    }
    console.error(error);
    next(error);
  }
};

const getAllProducts = async (req, res, next) => {
  try {
    const { paginate, status } = req.query;
    const statusWhere = productStatusWhere(status);

    if (paginate === "false") {
      const products = await prisma.products.findMany({
        where: statusWhere,
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

    const productQuery = { ...req.query };
    delete productQuery.status;
    const apiFeatures = new ApiFeatures(productQuery, "Products");
    const { queryObj, pagination } = apiFeatures.applyFeatures(productQuery);
    const whereClause = { ...queryObj.where, ...statusWhere };

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
  let uploadedImage = null;

  try {
    const { id } = req.params;
    const existing = await prisma.products.findUnique({ where: { id } });

    if (!existing) {
      return next(new ApiError("Product not found", 404));
    }
    if (existing.isArchived) {
      return next(new ApiError("Restore this product before editing it", 409));
    }

    const { name, internalRef, salesPrice, image, imageUrl } = req.body;
    const payload = {};

    if (name !== undefined) payload.name = text(name, "Name");
    if (internalRef !== undefined)
      payload.internalRef = text(internalRef, "Internal reference");
    if (salesPrice !== undefined)
      payload.salesPrice = number(salesPrice, "Sales price", { min: 0.01 });
    if (req.file) {
      uploadedImage = await uploadProductImage(req.file, id);
      payload.image = uploadedImage;
    } else if (parseBooleanField(req.body.removeImage)) {
      payload.image = null;
    } else if (image !== undefined || imageUrl !== undefined) {
      payload.image = image ?? imageUrl ?? null;
    }

    const updated = await prisma.products.update({
      where: { id },
      data: payload,
    });

    if (
      Object.prototype.hasOwnProperty.call(payload, "image") &&
      getCloudinaryPublicId(existing.image) &&
      getCloudinaryPublicId(existing.image) !==
        getCloudinaryPublicId(payload.image)
    ) {
      await removeImageFromCloudinary(getCloudinaryPublicId(existing.image));
    }

    res.status(200).json({
      status: "success",
      message: "Product updated successfully",
      data: updated,
    });
  } catch (error) {
    if (uploadedImage?.public_id) {
      await removeImageFromCloudinary(uploadedImage.public_id);
    }
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

    const dependencies = await getProductDependencies(existing);
    if (dependencies.length > 0) return next(productInUseError(dependencies));

    await prisma.products.delete({ where: { id } });

    const publicId = getCloudinaryPublicId(existing.image);
    if (publicId) await removeImageFromCloudinary(publicId);

    res.status(200).json({
      status: "success",
      message: "Product deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const archiveProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.products.findUnique({ where: { id } });

    if (!existing) {
      return next(new ApiError("Product not found", 404));
    }

    if (existing.isArchived) {
      return res.status(200).json({
        status: "success",
        message: "Product is already archived",
        data: existing,
      });
    }

    const product = await prisma.products.update({
      where: { id },
      data: { isArchived: true, archivedAt: new Date() },
    });

    res.status(200).json({
      status: "success",
      message: "Product archived successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const restoreProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.products.findUnique({ where: { id } });

    if (!existing) {
      return next(new ApiError("Product not found", 404));
    }

    if (!existing.isArchived) {
      return res.status(200).json({
        status: "success",
        message: "Product is already active",
        data: existing,
      });
    }

    const product = await prisma.products.update({
      where: { id },
      data: { isArchived: false, archivedAt: null },
    });

    res.status(200).json({
      status: "success",
      message: "Product restored successfully",
      data: product,
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
  archiveProduct,
  restoreProduct,
};
