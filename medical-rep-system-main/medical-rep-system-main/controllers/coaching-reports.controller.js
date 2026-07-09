import { prisma } from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import { ApiFeatures, paginationResults } from "../utils/apiFeatures.js";

const addCoachingReport = async (req, res, next) => {
  try {
    const {
      repId,
      doctorId,
      visitDate,
      visitDuration,
      visitLocation,
      performanceRating,
      visitPros,
      visitCons,
      recommendations,
      actionItems,
      notes,
    } = req.body;

    const data = await prisma.coachingReport.create({
      data: {
        repId,
        doctorId,
        createdById: req.user.id,
        visitDate: new Date(visitDate),
        visitDuration,
        visitLocation,
        performanceRating,
        visitPros,
        visitCons,
        recommendations,
        actionItems,
        notes,
      },
    });
    res.status(201).json({
      status: "success",
      message: "Data created successfully",
      data: data,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Failed to create coaching report", 500));
  }
};

const responseToCoachingReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comment, accept } = req.body;

    const exists = await prisma.coachingReport.findUnique({
      where: { id },
    });
    if (!exists) {
      return next(new ApiError("Coaching report not found", 404));
    }

    if (
      exists.repId !== req.user.id ||
      (exists.createdById !== req.user.supervisorId &&
        exists.createdById !== req.user.managerId)
    ) {
      return next(
        new ApiError("Forbidden, you can only access your own data", 403),
      );
    }

    let data = {};
    if (comment) {
      data = await prisma.coachingReport.update({
        where: {
          id,
          repId: req.user.id,
          createdById: { in: [req.user.supervisorId, req.user.managerId] },
        },
        data: {
          repComment: comment,
          repAccepted: true,
        },
      });
    } else if (accept) {
      data = await prisma.coachingReport.update({
        where: { id, repId: req.user.id, createdById: req.user.supervisorId },
        data: {
          repAccepted: true,
        },
      });
    }

    res.status(200).json({
      status: "success",
      message: "Data updated successfully",
      data: data,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Failed to update coaching report", 500));
  }
};

const getMyCoachingReport = async (req, res, next) => {
  try {
    const apiFeatures = new ApiFeatures(req.query);
    const { queryObj, pagination } = apiFeatures.applyFeatures(req.query);

    const whereClause = {
      ...queryObj.where,
      createdById: req.user.id,
    };

    const totalDocuments = await prisma.coachingReport.count({ where: whereClause });

    const data = await prisma.coachingReport.findMany({
      where: whereClause,
      select: {
        id: true,
        visitDate: true,
        visitDuration: true,
        visitLocation: true,
        performanceRating: true,
        visitPros: true,
        visitCons: true,
        recommendations: true,
        actionItems: true,
        notes: true,
        repComment: true,
        repAccepted: true,
        createdAt: true,
        rep: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        doctor: {
          select: {
            id: true,
            nameAR: true,
            nameEN: true,
            email: true,
            phone: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
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
      data: data,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Failed to fetch coaching report", 500));
  }
};

const getAllCoachingReport = async (req, res, next) => {
  try {
    const apiFeatures = new ApiFeatures(req.query);
    const { queryObj, pagination } = apiFeatures.applyFeatures(req.query);
    const whereClause = { ...queryObj.where };

    const totalDocuments = await prisma.coachingReport.count({ where: whereClause });

    const data = await prisma.coachingReport.findMany({
      where: whereClause,
      select: {
        id: true,
        visitDate: true,
        visitDuration: true,
        visitLocation: true,
        performanceRating: true,
        visitPros: true,
        visitCons: true,
        recommendations: true,
        actionItems: true,
        notes: true,
        repComment: true,
        repAccepted: true,
        createdAt: true,
        rep: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        doctor: {
          select: {
            id: true,
            nameAR: true,
            nameEN: true,
            email: true,
            phone: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
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
      data: data,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Failed to fetch coaching report", 500));
  }
};

const getRepCoachingReport = async (req, res, next) => {
  try {
    const apiFeatures = new ApiFeatures(req.query);
    const { queryObj, pagination } = apiFeatures.applyFeatures(req.query);

    const whereClause = {
      ...queryObj.where,
      repId: req.user.id,
    };

    const totalDocuments = await prisma.coachingReport.count({ where: whereClause });

    const data = await prisma.coachingReport.findMany({
      where: whereClause,
      select: {
        id: true,
        visitDate: true,
        visitDuration: true,
        visitLocation: true,
        performanceRating: true,
        visitPros: true,
        visitCons: true,
        recommendations: true,
        actionItems: true,
        notes: true,
        repComment: true,
        repAccepted: true,
        createdAt: true,
        rep: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        doctor: {
          select: {
            id: true,
            nameAR: true,
            nameEN: true,
            email: true,
            phone: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
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
      data: data,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Failed to fetch coaching report", 500));
  }
};

export {
  addCoachingReport,
  responseToCoachingReport,
  getMyCoachingReport,
  getAllCoachingReport,
  getRepCoachingReport,
};
