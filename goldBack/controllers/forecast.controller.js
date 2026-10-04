import { prisma } from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import { ApiFeatures, paginationResults } from "../utils/apiFeatures.js";

const createForecast = async (req, res, next) => {
  const { periodType, periodDate, productForecasts, notes, status } = req.body;

  try {
    const forecast = await prisma.forecast.create({
      data: {
        periodType,
        periodDate: new Date(periodDate),
        productForecasts,
        notes,
        status: status ? String(status).toUpperCase() : "DRAFT",
        isApproved: status === "APPROVED",
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
    return next(new ApiError(`Create Forecast Error: ${err}`));
  }
};

const getForecasts = async (req, res, next) => {
  try {
    const apiFeatures = new ApiFeatures(req.query);
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
    return next(new ApiError(`Get Forecasts Error: ${err}`));
  }
};

const getForecastById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const forecast = await prisma.forecast.findUnique({
      where: { id },
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
    next(new ApiError("Failed to fetch forecast", 500));
  }
};

const getAllForecasts = async (req, res, next) => {
  try {
    const apiFeatures = new ApiFeatures(req.query);
    const { queryObj, pagination } = apiFeatures.applyFeatures(req.query);
    const whereClause = { ...queryObj.where };

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
    return next(new ApiError(`Get Forecasts Error: ${err}`));
  }
};

const updateForecast = async (req, res, next) => {
  const { id } = req.params;
  const { isApproved, status, supervisorFeedback, notes, periodDate, productForecasts } = req.body;
  try {
    const forecast = await prisma.forecast.update({
      where: { id },
      data: {
        ...(status !== undefined ? { status: String(status).toUpperCase() } : {}),
        ...(isApproved !== undefined ? { isApproved } : {}),
        ...(supervisorFeedback !== undefined ? { supervisorFeedback } : {}),
        ...(notes !== undefined ? { notes } : {}),
        ...(periodDate !== undefined ? { periodDate: new Date(periodDate) } : {}),
        ...(productForecasts !== undefined ? { productForecasts } : {}),
      },
    });
    res.status(200).json({
      status: "success",
      message: "Data updated successfully",
      data: forecast,
    });
  } catch (err) {
    console.error(err);
    return next(new ApiError(`Update Forecast Error: ${err}`));
  }
};

export { createForecast, getForecasts, getForecastById, updateForecast, getAllForecasts };
