import { prisma } from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import { ApiFeatures, paginationResults } from "../utils/apiFeatures.js";
import { date, number, canManageUser, userScope } from "../utils/validation.js";

const addAppraisal = async (req, res, next) => {
  const {
    repId,
    period,
    salesPerformance = 0,
    customerRelationships = 0,
    productKnowledge = 0,
    complianceAndRegulations = 0,
    teamworkAndCollaboration = 0,
    feedbackComments = "",
    presentationSkills = 0,
    sellingSkills = 0,
    reporting = 0,
    productInformation = 0,
    competitorsInformation = 0,
    organizationalValueAwareness = 0,
    properUtilizationOfResources = 0,
    reliabilityAndCredibility = 0,
    independenceAndJudgment = 0,
    teamSpirit = 0,
    personalDrive = 0,
    creativityAndInitiative = 0,
    broadProspective = 0,
    communicationSkills = 0,
    planningAndOrganizing = 0,
    appearance = 0,
    attitude = 0,
    timing = 0,
  } = req.body;

  try {
    const rep = await prisma.user.findUnique({ where: { id: repId } });
    if (!rep || !canManageUser(req.user, rep) || rep.id === req.user.id)
      return next(new ApiError("Select an employee from your team", 403));
    date(period, "Appraisal period");
    const scoreFields = [
      "salesPerformance",
      "customerRelationships",
      "productKnowledge",
      "complianceAndRegulations",
      "teamworkAndCollaboration",
      "presentationSkills",
      "sellingSkills",
      "reporting",
      "productInformation",
      "competitorsInformation",
      "organizationalValueAwareness",
      "properUtilizationOfResources",
      "reliabilityAndCredibility",
      "independenceAndJudgment",
      "teamSpirit",
      "personalDrive",
      "creativityAndInitiative",
      "broadProspective",
      "communicationSkills",
      "planningAndOrganizing",
      "appearance",
      "attitude",
      "timing",
    ];
    for (const key of scoreFields)
      if (req.body[key] !== undefined) {
        const score = number(req.body[key], key);
        if (score > 100)
          return next(
            new ApiError("Appraisal scores must be between 0 and 100", 400),
          );
      }
    const appraisal = await prisma.appraisal.create({
      data: {
        repId,
        managerId: req.user.id,

        period: new Date(period),
        salesPerformance,
        customerRelationships,
        productKnowledge,
        complianceAndRegulations,
        teamworkAndCollaboration,
        feedbackComments,

        presentationSkills,
        sellingSkills,
        reporting,
        productInformation,
        competitorsInformation,
        organizationalValueAwareness,
        properUtilizationOfResources,
        reliabilityAndCredibility,
        independenceAndJudgment,
        teamSpirit,
        personalDrive,
        creativityAndInitiative,
        broadProspective,
        communicationSkills,
        planningAndOrganizing,
        appearance,
        attitude,
        timing,
      },
    });

    res.status(201).json({
      status: "success",
      message: "Appraisal added successfully",
      data: appraisal,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const getAppraisals = async (req, res, next) => {
  try {
    const apiFeatures = new ApiFeatures(req.query, "Appraisal");
    const { queryObj, pagination } = apiFeatures.applyFeatures(req.query);
    const whereClause = { ...queryObj.where, rep: userScope(req.user) };

    const totalDocuments = await prisma.appraisal.count({ where: whereClause });

    const appraisals = await prisma.appraisal.findMany({
      where: whereClause,
      include: {
        rep: {
          select: {
            id: true,
            name: true,
            email: true,
            subRegion: {
              select: {
                id: true,
                name: true,
                region: { select: { id: true, name: true } },
              },
            },
          },
        },
        manager: { select: { id: true, name: true, email: true } },
      },
      orderBy: queryObj.orderBy || { createdAt: "desc" },
      take: queryObj.take,
      skip: queryObj.skip,
    });

    const paginationData = paginationResults(pagination, totalDocuments);

    res.status(200).json({
      status: "success",
      results: totalDocuments,
      pagination: paginationData,
      data: appraisals,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const getRepAppraisals = async (req, res, next) => {
  try {
    const appraisals = await prisma.appraisal.findMany({
      where: { repId: req.user.id },
      include: {
        rep: {
          select: { id: true, name: true, email: true },
        },
        manager: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      status: "success",
      results: appraisals.length,
      data: appraisals,
    });
  } catch (error) {
    next(error);
  }
};

const acknowledgeAppraisal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { accept, comment } = req.body || {};
    if (typeof accept !== "boolean")
      return next(new ApiError("Acknowledgement must be true or false", 400));

    const appraisal = await prisma.appraisal.findUnique({ where: { id } });
    if (!appraisal) {
      return next(new ApiError("Appraisal not found", 404));
    }

    if (appraisal.repId !== req.user.id) {
      return next(
        new ApiError("You are not allowed to update this appraisal", 403),
      );
    }

    const updatedAppraisal = await prisma.appraisal.update({
      where: { id },
      data: {
        acknowledged: Boolean(accept),
        acknowledgedAt: accept ? new Date() : null,
        acknowledgementComment: comment ?? null,
      },
      include: {
        rep: { select: { id: true, name: true, email: true } },
        manager: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(200).json({
      status: "success",
      message: "Appraisal acknowledgement updated successfully",
      data: updatedAppraisal,
    });
  } catch (error) {
    next(error);
  }
};

export { addAppraisal, getAppraisals, getRepAppraisals, acknowledgeAppraisal };
