import { prisma } from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import { ApiFeatures, paginationResults } from "../utils/apiFeatures.js";
import {
  text,
  date,
  number,
  stringList,
  userScope,
  canManageUser,
} from "../utils/validation.js";

// Plans Controllers
const createPlan = async (req, res, next) => {
  const ownerId = req.body.repId || req.user.id;
  if (ownerId !== req.user.id) {
    const owner = await prisma.user.findUnique({ where: { id: ownerId } });
    if (
      req.user.role === "MEDICAL_REP" ||
      owner?.role !== "MEDICAL_REP" ||
      !canManageUser(req.user, owner)
    )
      return next(new ApiError("Select a representative from your team", 403));
  }
  const {
    title,
    type,
    status,
    description,
    startDate,
    endDate,
    objectives,
    targetVisits,
    doctorsWithDates,
  } = req.body;

  text(title, "Title");
  text(description, "Description");
  const start = date(startDate, "Start date");
  const end = date(endDate, "End date");
  if (start > end)
    return next(new ApiError("Start date must be before end date", 400));
  if (!["WEEKLY", "MONTHLY"].includes(type))
    return next(new ApiError("Invalid plan type", 400));
  if (status && status !== "PENDING")
    return next(new ApiError("New plans must be submitted for approval", 400));
  if (!Array.isArray(doctorsWithDates) || !doctorsWithDates.length)
    return next(new ApiError("Select at least one doctor", 400));
  number(targetVisits, "Target visits", { min: 1, integer: true });
  stringList(objectives, "Objectives", { required: true });
  for (const doctor of doctorsWithDates) {
    text(doctor.doctorId, "Doctor");
    const visitDate = date(doctor.visitDate, "Doctor visit date");
    if (visitDate < start || visitDate > end)
      return next(
        new ApiError("Visit dates must be within the plan period", 400),
      );
  }

  const existingPlan = await prisma.plan.findFirst({
    where: {
      title,
      createdById: ownerId,
    },
  });

  if (existingPlan) {
    return next(
      new ApiError(
        "You already have a plan with this title. Please choose a different title.",
        400,
      ),
    );
  }

  const doctorIds = doctorsWithDates.map((d) => d.doctorId);

  const doctorsInDB = await prisma.doctor.findMany({
    where: { id: { in: doctorIds } },
    select: {
      id: true,
      nameAR: true,
      nameEN: true,
      accountName: true,
      subRegion: true,
    },
  });
  if (doctorsInDB.length !== new Set(doctorIds).size)
    return next(
      new ApiError("One or more selected doctors no longer exist", 400),
    );

  let doctors = doctorsInDB.map((doctor) => ({
    ...doctor,
    visitDate: doctorsWithDates.find((d) => d.doctorId === doctor.id)
      ? doctorsWithDates.find((d) => d.doctorId === doctor.id).visitDate
      : null,
  }));

  const data = await prisma.plan.create({
    data: {
      title,
      type,
      status: "PENDING",
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      doctors: doctors,
      objectives,
      createdBy: { connect: { id: ownerId } },
      targetDoctors: doctorsWithDates.length,
      targetVisits,
    },
  });
  res.status(201).json({
    status: "success",
    message: "Data created successfully",
    data: data,
  });
};

const getOnePlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await prisma.plan.findUnique({
      where: { id, createdBy: userScope(req.user) },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    });

    if (!data) return next(new ApiError("Plan not found", 404));
    res.status(200).json({
      status: "success",
      message: "Data fetched successfully",
      data: data,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Plan not found", 404));
  }
};

const getMyPlans = async (req, res, next) => {
  try {
    // Instantiate the ApiFeatures class and apply features
    const apiFeatures = new ApiFeatures(req.query, "Plan");
    const { queryObj, pagination } = apiFeatures.applyFeatures(req.query);
    const whereClause = {
      ...queryObj.where,
      createdBy: userScope(req.user),
      createdById: req.user.id,
    };

    // Get total count of documents for accurate pagination calculations
    const totalDocuments = await prisma.plan.count({ where: whereClause });

    const data = await prisma.plan.findMany({
      where: whereClause,
      include: {
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
    console.error(error);
    next(error);
  }
};

const getAllPlans = async (req, res, next) => {
  try {
    // Instantiate the ApiFeatures class and apply features
    const apiFeatures = new ApiFeatures(req.query, "Plan");
    const { queryObj, pagination } = apiFeatures.applyFeatures(req.query);
    const whereClause = {
      ...queryObj.where,
      createdBy: userScope(req.user),
    };

    if (req.query.createdById) {
      whereClause.createdById = req.query.createdById;
    }

    // Get total count of documents for accurate pagination calculations
    const totalDocuments = await prisma.plan.count({ where: whereClause });

    const data = await prisma.plan.findMany({
      where: whereClause,
      include: {
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
    console.error(error);
    next(error);
  }
};

const getPlansMGMT = async (req, res, next) => {
  try {
    // Instantiate the ApiFeatures class and apply features
    const apiFeatures = new ApiFeatures(req.query, "Plan");
    const { queryObj, pagination } = apiFeatures.applyFeatures(req.query);

    let teamIds = [];

    if (req.query?.createdById) {
      teamIds.push(req.query.createdById);
    } else {
      const team = await prisma.user.findMany({
        where: userScope(req.user),
        select: { id: true },
      });
      teamIds = team.map((team) => team.id);
    }

    let whereClause = {
      ...queryObj.where,
      createdBy: userScope(req.user),
      status: "PENDING",
    };

    const totalDocuments = await prisma.plan.count({ where: whereClause });

    const plans = await prisma.plan.findMany({
      where: whereClause,
      include: {
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: queryObj.orderBy || { createdAt: "desc" },
      take: queryObj.take, // Apply limit
      skip: queryObj.skip, // Apply pagination skip
    });

    const paginationData = paginationResults(pagination, totalDocuments);

    let myPlans = plans.filter((plan) => plan.createdById === req.user.id);
    let repPlans = plans.filter((plan) => teamIds.includes(plan.createdById));
    let teamMembers = repPlans.map((plan) => [
      ...new Set(plan?.createdBy?.name),
    ]);

    res.status(200).json({
      status: "success",
      message: "Data fetched successfully",
      results: totalDocuments,
      pagination: paginationData,
      data: {
        teamMembers: teamMembers.length,
        pendingPlans: repPlans.length,
        repPlans,
        myPlans,
      },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const updateOnePlan = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["MANAGER", "SUPERVISOR"].includes(req.user.role))
    return next(
      new ApiError("Only managers and supervisors can review plans", 403),
    );
  if (!["APPROVED", "REJECTED"].includes(status))
    return next(new ApiError("Invalid review status", 400));
  const plan = await prisma.plan.findUnique({
    where: { id },
    include: { createdBy: true },
  });
  if (!plan) return next(new ApiError("Plan not found", 404));
  if (
    plan.createdById === req.user.id ||
    !canManageUser(req.user, plan.createdBy)
  )
    return next(
      new ApiError("You can only review plans submitted by your team", 403),
    );
  if (plan.status !== "PENDING")
    return next(new ApiError("This plan has already been reviewed", 409));

  let visitData;
  if (status === "APPROVED" && plan.status !== "APPROVED") {
    // create visit if the plan is approved
    visitData = plan.doctors?.map((doctor) => {
      return {
        planId: id,
        doctorId: doctor.id,
        userId: plan.createdById,
        date: new Date(doctor.visitDate),
      };
    });
  }

  const updatedPlan = await prisma.$transaction(async (tx) => {
    const claimed = await tx.plan.updateMany({
      where: { id, status: "PENDING" },
      data: { status, supervisorFeedback: req.body.supervisorFeedback || null },
    });
    if (claimed.count !== 1)
      throw new ApiError("This plan has already been reviewed", 409);
    if (visitData?.length) await tx.visit.createMany({ data: visitData });
    return tx.plan.findUnique({ where: { id } });
  });

  res.status(200).json({
    status: "success",
    message: "Plan updated successfully",
    data: updatedPlan,
  });
};

export {
  createPlan,
  getAllPlans,
  getMyPlans,
  getOnePlan,
  getPlansMGMT,
  updateOnePlan,
};
