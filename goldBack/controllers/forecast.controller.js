import { prisma } from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import { ApiFeatures, paginationResults } from "../utils/apiFeatures.js";

const createForecast = async (req, res, next) => {
  const { periodType, periodDate, productForecasts, notes } = req.body;

  try {
    const forecast = await prisma.forecast.create({
      data: {
        periodType,
        periodDate: new Date(periodDate),
        productForecasts,
        notes,
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
  const { isApproved, supervisorFeedback } = req.body;
  try {
    const forecast = await prisma.forecast.update({
      where: { id },
      data: { isApproved, supervisorFeedback },
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

export { createForecast, getForecasts, updateForecast, getAllForecasts };
