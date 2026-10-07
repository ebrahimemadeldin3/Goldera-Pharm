import { prisma } from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import { ApiFeatures, paginationResults } from "../utils/apiFeatures.js";
import {
  text,
  number,
  date as validDate,
  stringList,
  userScope,
  canManageUser,
} from "../utils/validation.js";

// Visits and Visit Reports Controllers
const scheduleVisit = async (req, res, next) => {
  try {
    const {
      samples,
      date,
      time,
      doctorId,
      notes,
      visitType,
      medicalRepId,
      supervisorId,
    } = req.body;

    const targetUserId =
      req.user.role === "MANAGER" && medicalRepId ? medicalRepId : req.user.id;

    if (req.user.role === "MANAGER" && medicalRepId) {
      const rep = await prisma.user.findUnique({
        where: { id: medicalRepId },
        select: { id: true, managerId: true, supervisorId: true },
      });

      if (!rep || rep.managerId !== req.user.id) {
        return next(
          new ApiError("Selected rep is not under your management", 400),
        );
      }

      if (supervisorId && rep.supervisorId !== supervisorId) {
        return next(
          new ApiError("Selected supervisor does not match the rep", 400),
        );
      }
    }

    validDate(date, "Visit date");
    text(doctorId, "Doctor");
    if (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time))
      throw new ApiError("Time must use HH:mm", 400);
    const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor || !doctor.isActive)
      throw new ApiError("Select an active doctor", 400);
    const data = await prisma.visit.create({
      data: {
        samples: Array.isArray(samples) ? samples : [],
        date: new Date(date),
        time,
        doctorId,
        notes,
        userId: targetUserId,
        visitType: visitType ? String(visitType).toUpperCase() : "ROUTINE",
      },
    });

    res.status(201).json({
      status: "success",
      message: "Data created successfully",
      data: data,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const getVisits = async (req, res, next) => {
  try {
    let { paginate } = req.query;
    let dateFilter = undefined;
    if (req.query.date) {
      const clientDate = new Date(req.query.date);

      // 1. Check for Invalid Date
      if (isNaN(clientDate.getTime())) {
        return res.status(400).json({
          status: "fail",
          message: "Invalid date format provided.",
        });
      }

      // 2. Safely calculate month start/end using UTC to avoid server timezone bugs
      // We use `Date.UTC` to get the Exact 1st of the required month in UTC
      const startOfTheMonth = new Date(
        Date.UTC(clientDate.getUTCFullYear(), clientDate.getUTCMonth(), 1),
      );

      // The 1st day of the NEXT month. We'll use `lt` (less than) in Prisma for this.
      const endOfTheMonth = new Date(
        Date.UTC(clientDate.getUTCFullYear(), clientDate.getUTCMonth() + 1, 1),
      );

      dateFilter = { gte: startOfTheMonth, lt: endOfTheMonth };
    }

    if (paginate === "false") {
      const data = await prisma.visit.findMany({
        where: {
          userId: req.user.id,
          ...(dateFilter && { date: dateFilter }),
        },
        include: {
          doctor: {
            select: { id: true, nameAR: true, nameEN: true, accountName: true },
          },
          createdBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      return res.status(200).json({
        status: "success",
        message: "Data fetched successfully",
        results: data.length,
        pagination: null,
        data: data,
      });
    }

    // Instantiate the ApiFeatures class and apply features
    const apiFeatures = new ApiFeatures(req.query, "Visit");
    const { queryObj, pagination } = apiFeatures.applyFeatures(req.query);

    const whereClause = {
      ...queryObj.where,
      userId: req.user.id,
      ...(dateFilter && { date: dateFilter }),
    };

    // Get total count of documents for accurate pagination calculations
    const totalDocuments = await prisma.visit.count({
      where: whereClause,
    });

    const data = await prisma.visit.findMany({
      where: whereClause,
      include: {
        doctor: {
          select: { id: true, nameAR: true, nameEN: true, accountName: true },
        },
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: queryObj.orderBy || { createdAt: "desc" },
      take: queryObj.take, // Apply limit
      skip: queryObj.skip, // Apply pagination skip
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
    // Route the error to your global error middleware
    console.error(error);
    next(error);
  }
};

const getAllVisits = async (req, res, next) => {
  try {
    let { paginate } = req.query;
    let whereClause = { createdBy: userScope(req.user) };
    const clientDate = req.query.date ? new Date(req.query.date) : null;
    const { createdById } = req.query || null;

    if (clientDate && isNaN(clientDate.getTime())) {
      throw new ApiError("Invalid date format provided", 400);
    }

    if (createdById) {
      whereClause.userId = createdById;
      delete whereClause.createdById;
    }

    if (clientDate) {
      const startOfToday = new Date(clientDate);
      const endOfToday = new Date(clientDate);

      startOfToday.setUTCHours(0, 0, 0, 0);
      endOfToday.setUTCHours(23, 59, 59, 999);

      whereClause.date = {
        gte: startOfToday,
        lte: endOfToday,
      };
    }

    if (paginate === "false") {
      const data = await prisma.visit.findMany({
        where: whereClause,
        include: {
          doctor: {
            select: { id: true, nameAR: true, nameEN: true, accountName: true },
          },
          createdBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      return res.status(200).json({
        status: "success",
        message: "Data fetched successfully",
        results: data.length,
        pagination: null,
        data: data,
      });
    }

    // Instantiate the ApiFeatures class and apply features
    const apiFeatures = new ApiFeatures(req.query, "Visit");
    const { queryObj, pagination } = apiFeatures.applyFeatures(req.query);
    whereClause = { ...queryObj.where, ...whereClause };

    // Get total count of documents for accurate pagination calculations
    const totalDocuments = await prisma.visit.count({ where: whereClause });

    const data = await prisma.visit.findMany({
      where: whereClause,
      include: {
        doctor: {
          select: { id: true, nameAR: true, nameEN: true, accountName: true },
        },
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: queryObj.orderBy || { createdAt: "desc" },
      take: queryObj.take, // Apply limit
      skip: queryObj.skip, // Apply pagination skip
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
    // Route the error to your global error middleware
    console.error(error);
    next(error);
  }
};

const addVisitReports = async (req, res, next) => {
  try {
    const {
      visitId,
      duration,
      rating,
      doctorFeedback,
      visitPurpose,
      notes,
      samplesProvided,
      discussedTopics,
    } = req.body;

    if (!visitId) {
      return next(new ApiError("visitId is required", 400));
    }

    const visit = await prisma.visit.findUnique({
      where: { id: visitId },
      include: { visitReports: true, createdBy: true },
    });

    if (!visit) {
      return next(new ApiError("Visit not found", 404));
    }

    if (!canManageUser(req.user, visit.createdBy)) {
      return next(
        new ApiError(
          "Unauthorized: You can only submit reports for your own visits",
          403,
        ),
      );
    }

    // Do not allow reporting on cancelled visits
    if (visit.status === "CANCELLED") {
      return next(
        new ApiError("Cannot submit report for a cancelled visit", 400),
      );
    }

    // Idempotency / duplicate check
    if (
      visit.status === "COMPLETED" ||
      (visit.visitReports && visit.visitReports.length > 0)
    ) {
      return next(
        new ApiError("A report has already been submitted for this visit", 400),
      );
    }

    text(duration, "Duration");
    const score = number(rating, "Rating", { min: 1, integer: true });
    if (score > 5) throw new ApiError("Rating must be between 1 and 5", 400);
    text(visitPurpose, "Visit purpose");
    const topics = stringList(discussedTopics, "Discussed topics", {
      required: true,
    });
    const providedSamples = stringList(samplesProvided || [], "Samples");
    const report = await prisma.$transaction(async (tx) => {
      const claimed = await tx.visit.updateMany({
        where: { id: visitId, status: "SCHEDULED" },
        data: { status: "COMPLETED" },
      });
      if (claimed.count !== 1)
        throw new ApiError(
          "This visit has already been completed or cancelled",
          409,
        );
      return tx.visitReport.create({
        data: {
          visitId,
          userId: visit.userId,
          duration: String(duration),
          rating: String(score),
          doctorFeedback: doctorFeedback || null,
          visitPurpose: visitPurpose.trim(),
          notes: notes || null,
          samplesProvided: providedSamples,
          discussedTopics: topics,
        },
      });
    });

    res.status(200).json({
      status: "success",
      message: "Data created successfully",
      data: report,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const getMyVisitReports = async (req, res, next) => {
  try {
    let { paginate } = req.query;

    if (paginate === "false") {
      const data = await prisma.visitReport.findMany({
        where: { userId: req.user.id },
        include: {
          visit: {
            select: {
              id: true,
              date: true,
              doctor: {
                select: {
                  id: true,
                  nameAR: true,
                  nameEN: true,
                  accountName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return res.status(200).json({
        status: "success",
        message: "Data fetched successfully",
        results: data.length,
        pagination: null,
        data: data,
      });
    }

    // Instantiate the ApiFeatures class and apply features
    const apiFeatures = new ApiFeatures(req.query, "VisitReport");
    const { queryObj, pagination } = apiFeatures.applyFeatures(req.query);
    const whereClause = {
      ...queryObj.where,
      userId: req.user.id,
    };

    // Get total count of documents for accurate pagination calculations
    const totalDocuments = await prisma.visitReport.count({
      where: whereClause,
    });

    const data = await prisma.visitReport.findMany({
      where: whereClause,
      include: {
        visit: {
          select: {
            id: true,
            date: true,
            doctor: {
              select: {
                id: true,
                nameAR: true,
                nameEN: true,
                accountName: true,
              },
            },
          },
        },
      },
      orderBy: queryObj.orderBy || { createdAt: "desc" },
      take: queryObj.take, // Apply limit
      skip: queryObj.skip, // Apply pagination skip
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
    // Route the error to your global error middleware
    console.error(error);
    next(error);
  }
};

const getAllVisitReports = async (req, res, next) => {
  try {
    let { paginate } = req.query;

    const baseWhere = { createdBy: userScope(req.user) };
    if (req.query.createdById) baseWhere.userId = req.query.createdById;

    if (paginate === "false") {
      const data = await prisma.visitReport.findMany({
        where: baseWhere,
        include: {
          visit: {
            select: {
              id: true,
              date: true,
              doctor: {
                select: {
                  id: true,
                  nameAR: true,
                  nameEN: true,
                  accountName: true,
                },
              },
              createdBy: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return res.status(200).json({
        status: "success",
        message: "Data fetched successfully",
        results: data.length,
        pagination: null,
        data: data,
      });
    }

    // Instantiate the ApiFeatures class and apply features
    const apiFeatures = new ApiFeatures(req.query, "VisitReport");
    const { queryObj, pagination } = apiFeatures.applyFeatures(req.query);
    const whereClause = {
      ...queryObj.where,
      ...baseWhere,
    };

    // filter by rep id
    if (req.query.createdById) {
      whereClause.userId = req.query.createdById;
      delete whereClause.createdById;
    }

    // Get total count of documents for accurate pagination calculations
    const totalDocuments = await prisma.visitReport.count({
      where: whereClause,
    });

    const data = await prisma.visitReport.findMany({
      where: whereClause,
      include: {
        visit: {
          select: {
            id: true,
            date: true,
            doctor: {
              select: {
                id: true,
                nameAR: true,
                nameEN: true,
                accountName: true,
              },
            },
            createdBy: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: queryObj.orderBy || { createdAt: "desc" },
      take: queryObj.take, // Apply limit
      skip: queryObj.skip, // Apply pagination skip
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
    // Route the error to your global error middleware
    console.error(error);
    next(error);
  }
};

const updateVisit = async (req, res, next) => {
  try {
    const { id } = req.params;

    const visit = await prisma.visit.findUnique({
      where: { id },
      include: { createdBy: true },
    });

    if (!visit) {
      return next(new ApiError("Visit not found", 404));
    }

    // Authorization check
    if (!canManageUser(req.user, visit.createdBy)) {
      return next(
        new ApiError("Unauthorized: You can only update your own visits", 403),
      );
    }

    // Allowed fields for update - do NOT allow changing userId, doctorId, or id
    const allowedFields = [
      "date",
      "time",
      "visitType",
      "samples",
      "notes",
      "status",
    ];
    const updateData = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }

    if (visit.status === "COMPLETED")
      throw new ApiError("Completed visits cannot be changed", 409);
    if (updateData.date !== undefined)
      updateData.date = validDate(updateData.date, "Visit date");
    if (updateData.time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(updateData.time))
      throw new ApiError("Time must use HH:mm", 400);
    if (updateData.samples !== undefined)
      updateData.samples = stringList(updateData.samples, "Samples");
    // Completion must go through the report transaction.
    if (updateData.status === "COMPLETED")
      throw new ApiError("Submit a visit report to complete this visit", 400);

    // Legal status transitions check
    if (updateData.status) {
      const validStatuses = ["SCHEDULED", "COMPLETED", "CANCELLED"];
      if (!validStatuses.includes(updateData.status)) {
        return next(new ApiError("Invalid visit status", 400));
      }
    }

    const data = await prisma.visit.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({
      status: "success",
      message: "Data updated successfully",
      data: data,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export {
  scheduleVisit,
  getVisits,
  addVisitReports,
  getMyVisitReports,
  getAllVisitReports,
  updateVisit,
  getAllVisits,
};
