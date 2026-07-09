import { prisma } from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import { ApiFeatures, paginationResults } from "../utils/apiFeatures.js";

// Plans Controllers
const createPlan = async (req, res, next) => {
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

  const existingPlan = await prisma.plan.findFirst({
    where: {
      title,
      createdById: req.user.id,
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
      status,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      doctors: doctors,
      objectives,
      createdBy: { connect: { id: req.user.id } },
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
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    });

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
    const apiFeatures = new ApiFeatures(req.query);
    const { queryObj, pagination } = apiFeatures.applyFeatures(req.query);
    const whereClause = {
      ...queryObj.where,
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
    next(new ApiError("Failed to fetch plans", 500));
  }
};

const getAllPlans = async (req, res, next) => {
  try {
    // Instantiate the ApiFeatures class and apply features
    const apiFeatures = new ApiFeatures(req.query);
    const { queryObj, pagination } = apiFeatures.applyFeatures(req.query);
    const whereClause = {
      ...queryObj.where,
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
    next(new ApiError("Failed to fetch plans", 500));
  }
};

const getPlansMGMT = async (req, res, next) => {
  try {
    // Instantiate the ApiFeatures class and apply features
    const apiFeatures = new ApiFeatures(req.query);
    const { queryObj, pagination } = apiFeatures.applyFeatures(req.query);

    let teamIds = [];

    if (req.query?.createdById) {
      teamIds.push(req.query.createdById);
    } else {
      const team = await prisma.user.findMany({
        where: { supervisorId: req.user.id },
        select: { id: true },
      });
      teamIds = team.map((team) => team.id);
    }

    let whereClause = {
      ...queryObj.where,
      OR: [
        { createdBy: { id: req.user.id } },
        { createdBy: { id: { in: teamIds } } },
      ],
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
    next(new ApiError("Failed to fetch requests", 500));
  }
};

const updateOnePlan = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  const plan = await prisma.plan.findUnique({ where: { id } });
  if (!plan) return next(new ApiError("Plan not found", 404));

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

  const updatedPlan = await prisma.plan.update({
    where: { id },
    data: { status },
  });

  if (visitData?.length > 0 && updatedPlan.status === "APPROVED") {
    await prisma.visit.createMany({
      data: visitData,
    });
  }

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
