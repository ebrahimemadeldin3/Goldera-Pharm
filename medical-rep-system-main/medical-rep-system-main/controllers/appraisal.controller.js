import { prisma } from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import { ApiFeatures, paginationResults } from "../utils/apiFeatures.js";

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
      success: true,
      message: "Appraisal added successfully",
      data: appraisal,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Failed to add appraisal", 500));
  }
};
const getAppraisals = async (req, res, next) => {
  try {
    const apiFeatures = new ApiFeatures(req.query);
    const { queryObj, pagination } = apiFeatures.applyFeatures(req.query);
    const whereClause = { ...queryObj.where };

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
      success: true,
      results: totalDocuments,
      pagination: paginationData,
      data: appraisals,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Failed to fetch appraisals", 500));
  }
};

export { addAppraisal, getAppraisals };
