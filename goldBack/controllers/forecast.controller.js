import { prisma } from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import { ApiFeatures, paginationResults } from "../utils/apiFeatures.js";
import { date, number, userScope, canManageUser } from "../utils/validation.js";

const createForecast = async (req, res, next) => {
  const { periodType, periodDate, productForecasts, notes, status } = req.body;

  try {
    if (status && !["DRAFT", "PENDING"].includes(String(status).toUpperCase()))
      return next(
        new ApiError("Forecasts must be submitted for approval", 400),
      );
    if (!Array.isArray(productForecasts) || !productForecasts.length)
      return next(new ApiError("Add at least one product forecast", 400));
    for (const item of productForecasts)
      number(item.productUnits ?? item.quantity, "Forecast units", {
        min: 1,
        integer: true,
      });
    const productIds = [
      ...new Set(
        productForecasts.map((item) => item.productId).filter(Boolean),
      ),
    ];
    const productNames = [
      ...new Set(
        productForecasts
          .filter((item) => !item.productId)
          .map((item) => item.productName)
          .filter(Boolean),
      ),
    ];
    if (!productIds.length && !productNames.length) {
      return next(
        new ApiError("Each forecast row must include a product", 400),
      );
    }
    const activeProducts = await prisma.products.findMany({
      where: {
        isArchived: false,
        OR: [
          ...(productIds.length ? [{ id: { in: productIds } }] : []),
          ...(productNames.length ? [{ name: { in: productNames } }] : []),
        ],
      },
      select: { id: true, name: true },
    });
    const activeProductIds = new Set(
      activeProducts.map((product) => product.id),
    );
    const activeProductNames = new Set(
      activeProducts.map((product) => product.name),
    );
    if (
      productIds.some((productId) => !activeProductIds.has(productId)) ||
      productNames.some((productName) => !activeProductNames.has(productName))
    ) {
      return next(
        new ApiError("One or more selected products are unavailable", 400),
      );
    }

    const forecast = await prisma.forecast.create({
      data: {
        periodType,
        periodDate: date(periodDate, "Forecast period"),
        productForecasts: productForecasts.map((item) => ({
          ...item,
          productId:
            item.productId ||
            activeProducts.find((product) => product.name === item.productName)
              ?.id,
          productUnits: Number(item.productUnits ?? item.quantity),
          doctorName: item.doctorName || "Unassigned doctor",
        })),
        notes,
        status: status ? String(status).toUpperCase() : "DRAFT",
        isApproved: false,
        repId: req.user.id,
      },
    });

    res.status(201).json({
      status: "success",
      message: "Data created successfully",
      data: forecast,
    });
  } catch (err) {
    console.error(err);
    return next(err);
  }
};

const getForecasts = async (req, res, next) => {
  try {
    const apiFeatures = new ApiFeatures(req.query, "forecast");
    const { queryObj, pagination } = apiFeatures.applyFeatures(req.query);

    const whereClause = {
      ...queryObj.where,
      repId: req.user.id,
    };

    const totalDocuments = await prisma.forecast.count({ where: whereClause });

    const forecasts = await prisma.forecast.findMany({
      where: whereClause,
      include: { rep: { select: { id: true, name: true, email: true } } },
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
      data: forecasts,
    });
  } catch (err) {
    console.error(err);
    return next(err);
  }
};

const getForecastById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const forecast = await prisma.forecast.findUnique({
      where: { id, rep: userScope(req.user) },
      include: { rep: { select: { id: true, name: true, email: true } } },
    });

    if (!forecast) {
      return next(new ApiError("Forecast not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: forecast,
    });
  } catch (error) {
    next(error);
  }
};

const getAllForecasts = async (req, res, next) => {
  try {
    const apiFeatures = new ApiFeatures(req.query, "forecast");
    const { queryObj, pagination } = apiFeatures.applyFeatures(req.query);
    const whereClause = { ...queryObj.where, rep: userScope(req.user) };

    const totalDocuments = await prisma.forecast.count({ where: whereClause });

    const forecasts = await prisma.forecast.findMany({
      where: whereClause,
      include: { rep: { select: { id: true, name: true, email: true } } },
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
      data: forecasts,
    });
  } catch (err) {
    console.error(err);
    return next(err);
  }
};

const updateForecast = async (req, res, next) => {
  const { id } = req.params;
  const {
    isApproved,
    status,
    supervisorFeedback,
    notes,
    periodDate,
    productForecasts,
  } = req.body;
  try {
    const existing = await prisma.forecast.findUnique({
      where: { id },
      include: { rep: true },
    });
    if (!existing) return next(new ApiError("Forecast not found", 404));
    if (
      !canManageUser(req.user, existing.rep) ||
      existing.repId === req.user.id
    )
      return next(
        new ApiError("You can only review forecasts from your team", 403),
      );
    const nextStatus =
      status !== undefined
        ? String(status).toUpperCase()
        : isApproved === true
          ? "APPROVED"
          : isApproved === false
            ? "REJECTED"
            : existing.status;
    if (!["APPROVED", "REJECTED", "PENDING", "DRAFT"].includes(nextStatus))
      return next(new ApiError("Invalid forecast status", 400));
    if (productForecasts !== undefined) {
      return next(
        new ApiError("Forecast product rows cannot be changed here", 400),
      );
    }
    const forecast = await prisma.forecast.update({
      where: { id },
      data: {
        status: nextStatus,
        isApproved: nextStatus === "APPROVED",
        ...(supervisorFeedback !== undefined ? { supervisorFeedback } : {}),
        ...(notes !== undefined ? { notes } : {}),
        ...(periodDate !== undefined
          ? { periodDate: new Date(periodDate) }
          : {}),
      },
    });
    res.status(200).json({
      status: "success",
      message: "Data updated successfully",
      data: forecast,
    });
  } catch (err) {
    console.error(err);
    return next(err);
  }
};

export {
  createForecast,
  getForecasts,
  getForecastById,
  updateForecast,
  getAllForecasts,
};
