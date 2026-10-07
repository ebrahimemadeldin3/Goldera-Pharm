import { prisma } from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import {
  uploadDocumentToCloudinary,
  removeDocumentFromCloudinary,
} from "../utils/cloudinary.js";
import { ApiFeatures, paginationResults } from "../utils/apiFeatures.js";
import { text, number, date } from "../utils/validation.js";
import { validateAndDetectFiles } from "../utils/fileValidator.js";

// Requests Controllers
const getMyRequests = async (req, res, next) => {
  try {
    const apiFeatures = new ApiFeatures(req.query, "Request");
    const { queryObj, pagination } = apiFeatures.applyFeatures(req.query);

    const whereClause = {
      ...queryObj.where,
      userId: req.user.id,
    };

    const totalDocuments = await prisma.request.count({ where: whereClause });

    const data = await prisma.request.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true } },
        doctors: { select: { id: true, nameAR: true, nameEN: true } },
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
    next(error);
  }
};

const createRequest = async (req, res, next) => {
  let pdfs = [];
  try {
    for (const key of ["doctorIds", "sampleData", "totalExpenseData"]) {
      if (typeof req.body[key] === "string") {
        try {
          req.body[key] = JSON.parse(req.body[key]);
        } catch {
          throw new ApiError(`Invalid ${key} format`, 400);
        }
      }
    }
    const {
      title,
      subject,
      description,
      type,
      urgency,
      leaveStartDate,
      leaveEndDate,
      leaveType,
      sampleData,
      doctorIds,
      budget,
      visitedCity,
      visitDaysCount,
      totalExpenseAmount,
      totalExpenseData,
    } = req.body;

    // Validate common required fields
    if (!title || !subject || !type) {
      return next(new ApiError("Title, subject, and type are required", 400));
    }

    let leaveDaysCount = null;
    let resolvedDoctorIds = [];
    let resolvedExpenseData = [];

    text(title, "Title");
    text(subject, "Subject");
    text(description, "Description");
    text(urgency, "Urgency");
    if (req.files?.pdfs) await validateAndDetectFiles(req.files.pdfs);
    if (
      doctorIds &&
      (!Array.isArray(doctorIds) ||
        doctorIds.some((id) => typeof id !== "string"))
    )
      throw new ApiError("Invalid doctor selection", 400);
    if (Array.isArray(doctorIds) && doctorIds.length) {
      const count = await prisma.doctor.count({
        where: { id: { in: [...new Set(doctorIds)] } },
      });
      if (count !== new Set(doctorIds).size)
        throw new ApiError("One or more selected doctors no longer exist", 400);
    }

    if (type === "LEAVE") {
      if (
        !req.files ||
        !Array.isArray(req.files.pdfs) ||
        req.files.pdfs.length === 0
      ) {
        return next(new ApiError("Please upload a file", 400));
      }

      if (!leaveStartDate || !leaveEndDate || !leaveType) {
        return next(
          new ApiError(
            "Leave start date, end date, and type are required",
            400,
          ),
        );
      }

      const start = date(leaveStartDate, "Leave start date");
      const end = date(leaveEndDate, "Leave end date");

      if (start > end) {
        return next(
          new ApiError("Leave start date cannot be after end date", 400),
        );
      }

      leaveDaysCount = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    } else if (type === "EXPENSE" || type === "MARKETING") {
      if (
        !req.files ||
        !Array.isArray(req.files.pdfs) ||
        req.files.pdfs.length === 0
      ) {
        return next(new ApiError("Please upload a file", 400));
      }

      if (
        !budget ||
        !doctorIds ||
        !Array.isArray(doctorIds) ||
        doctorIds.length === 0
      ) {
        return next(
          new ApiError("Budget and at least one doctor are required", 400),
        );
      }
      resolvedDoctorIds = [...new Set(doctorIds)];
      number(budget, "Budget", { min: 0.01 });
    } else if (type === "SAMPLE") {
      if (
        !sampleData ||
        !Array.isArray(sampleData) ||
        sampleData.length === 0
      ) {
        return next(new ApiError("At least one product is required", 400));
      }
      if (Array.isArray(doctorIds) && doctorIds.length > 0) {
        resolvedDoctorIds = [...new Set(doctorIds)];
      }
      for (const item of sampleData) {
        text(item.productId, "Product");
        number(item.amount, "Sample quantity", { min: 1, integer: true });
      }
      const productsCount = await prisma.products.count({
        where: {
          id: { in: [...new Set(sampleData.map((item) => item.productId))] },
          isArchived: false,
        },
      });
      if (
        productsCount !== new Set(sampleData.map((item) => item.productId)).size
      )
        throw new ApiError(
          "One or more selected products are unavailable",
          400,
        );
    } else if (type === "PERSONAL_EXPENSE") {
      if (
        !req.files ||
        !Array.isArray(req.files.pdfs) ||
        req.files.pdfs.length === 0
      ) {
        return next(new ApiError("Please upload a file", 400));
      }

      let parsedExpenseData = totalExpenseData;
      if (typeof totalExpenseData === "string") {
        try {
          parsedExpenseData = JSON.parse(totalExpenseData);
        } catch {
          return next(new ApiError("Invalid totalExpenseData format", 400));
        }
      }

      if (
        !visitedCity ||
        !visitDaysCount ||
        !totalExpenseAmount ||
        !parsedExpenseData ||
        !Array.isArray(parsedExpenseData) ||
        parsedExpenseData.length === 0
      ) {
        return next(new ApiError("Total expense data is required", 400));
      }

      resolvedExpenseData = parsedExpenseData.map((item) => ({
        name: text(item.name, "Expense name"),
        amount: number(item.amount, "Expense amount", { min: 0.01 }),
      }));
      number(visitDaysCount, "Visit days", { min: 1, integer: true });
    } else {
      return next(new ApiError(`Invalid request type: ${type}`, 400));
    }

    // Validate every field first, then track each upload for reliable failure cleanup.
    for (const [index, file] of (req.files?.pdfs || []).entries()) {
      const result = await uploadDocumentToCloudinary(file.buffer, {
        public_id: `${type}_pdf_${req.user.id}_${Date.now()}_${index}`,
        folder: "folder-files/pdfs",
      });
      pdfs.push({
        name: file.originalname,
        public_id: result.public_id,
        url: result.secure_url,
      });
    }
    const data = await prisma.request.create({
      data: {
        title,
        description,
        subject,
        type,
        urgency,
        user: { connect: { id: req.user.id } },
        leaveStartDate: type === "LEAVE" ? new Date(leaveStartDate) : null,
        leaveEndDate: type === "LEAVE" ? new Date(leaveEndDate) : null,
        leaveDaysCount: type === "LEAVE" ? Number(leaveDaysCount) : null,
        leaveType: type === "LEAVE" ? leaveType : null,
        budget:
          type === "EXPENSE" || type === "MARKETING" ? Number(budget) : null,
        sampleData: type === "SAMPLE" ? sampleData : [],
        doctors: { connect: resolvedDoctorIds.map((id) => ({ id })) },
        visitDaysCount:
          type === "PERSONAL_EXPENSE" ? Number(visitDaysCount) : null,
        visitedCity: type === "PERSONAL_EXPENSE" ? visitedCity : null,
        totalExpenseAmount:
          type === "PERSONAL_EXPENSE"
            ? resolvedExpenseData.reduce(
                (total, item) => total + item.amount,
                0,
              )
            : null,
        pdfs: pdfs?.length ? { set: pdfs } : [],
        totalExpenseData:
          type === "PERSONAL_EXPENSE" ? resolvedExpenseData : [],
      },
    });

    res.status(201).json({
      status: "success",
      message: "Data created successfully",
      data,
    });
  } catch (error) {
    if (pdfs && pdfs.length > 0) {
      await Promise.allSettled(
        pdfs.map(
          (p) => p.public_id && removeDocumentFromCloudinary(p.public_id),
        ),
      );
    }
    console.error(error);
    next(error);
  }
};

const updateRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, response } = req.body;

    const validStatuses = ["APPROVED", "REJECTED"];
    if (!validStatuses.includes(status)) {
      return next(new ApiError("Invalid status value", 400));
    }

    const existingRequest = await prisma.request.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            supervisorId: true,
            managerId: true,
          },
        },
      },
    });

    if (!existingRequest) {
      return next(new ApiError("Request not found", 404));
    }

    // Prevent self-approval
    if (existingRequest.userId === req.user.id) {
      return next(new ApiError("Cannot review your own request", 403));
    }

    // Enforce hierarchy scoping
    if (req.user.role === "SUPERVISOR") {
      if (existingRequest.user?.supervisorId !== req.user.id) {
        return next(
          new ApiError(
            "Unauthorized to review requests outside your team",
            403,
          ),
        );
      }
    } else if (req.user.role === "MANAGER") {
      if (existingRequest.user?.managerId !== req.user.id) {
        return next(
          new ApiError(
            "Unauthorized to review requests outside your team",
            403,
          ),
        );
      }
    }

    // Prevent duplicate approval / counter corruption
    if (existingRequest.status !== "PENDING") {
      return next(
        new ApiError(
          `Request has already been ${existingRequest.status.toLowerCase()}`,
          400,
        ),
      );
    }

    const responseDate = new Date();

    const [updatedRequest] = await prisma.$transaction(async (tx) => {
      const claimed = await tx.request.updateMany({
        where: { id, status: "PENDING" },
        data: { status },
      });
      if (claimed.count !== 1)
        throw new ApiError("This request has already been reviewed", 409);
      const updated = await tx.request.update({
        where: { id },
        data: {
          status,
          response: response || null,
          responseDate,
          handledAt: new Date(),
        },
      });

      if (status === "APPROVED" && existingRequest.type === "LEAVE") {
        const daysToIncrement = Number(existingRequest.leaveDaysCount) || 0;
        if (daysToIncrement > 0) {
          await tx.user.update({
            where: { id: existingRequest.userId },
            data: {
              leaveDaysCountTotal: {
                increment: daysToIncrement,
              },
            },
          });
        }
      }

      return [updated];
    });

    res.status(200).json({
      status: "success",
      message: "Data updated successfully",
      data: updatedRequest,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export { getMyRequests, createRequest, updateRequest };
