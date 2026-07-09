import { prisma } from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import { ApiFeatures, paginationResults } from "../utils/apiFeatures.js";

const getRepDetails = async (req, res, next) => {
  try {
    const rep = await prisma.user.findUnique({
      where: {
        id: req.params.repId,
        supervisorId: req.user.id,
        role: "MEDICAL_REP",
      },
    });
    res.status(200).json({
      status: "success",
      message: "Data fetched successfully",
      data: rep,
    });
  } catch (err) {
    console.error(err);
    return next(new ApiError(`Get Rep Details Error: ${err}`));
  }
};

const getSupervisorTeam = async (req, res, next) => {
  try {
    const apiFeatures = new ApiFeatures(req.query);
    const { queryObj, pagination } = apiFeatures.applyFeatures(req.query);

    const whereClause = {
      ...queryObj.where,
      supervisorId: req.user.id,
    };

    const totalDocuments = await prisma.user.count({ where: whereClause });

    const team = await prisma.user.findMany({
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
      data: team,
    });
  } catch (err) {
    console.error(err);
    return next(new ApiError(`Get Supervisor Team Error: ${err}`));
  }
};

const getTeamRequests = async (req, res, next) => {
  try {
    const apiFeatures = new ApiFeatures(req.query);
    const { queryObj, pagination } = apiFeatures.applyFeatures(req.query);

    const reps = await prisma.user.findMany({
      where: { supervisorId: req.user.id },
      select: { id: true },
    });

    if (reps.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "No requests found",
        results: 0,
        pagination: paginationResults(pagination, 0),
        data: [],
      });
    }

    const whereClause = {
      ...queryObj.where,
      userId: { in: reps.map((rep) => rep.id) },
    };

    const totalDocuments = await prisma.request.count({ where: whereClause });

    const data = await prisma.request.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true } },
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
      data,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Failed to fetch requests", 500));
  }
};

export { getSupervisorTeam, getRepDetails, getTeamRequests };
