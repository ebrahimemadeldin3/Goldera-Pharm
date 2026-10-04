import { prisma } from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import { ApiFeatures, paginationResults } from "../utils/apiFeatures.js";

const addPharmacy = async (req, res, next) => {
  try {
    const { name, city, country, region, subRegion } = req.body;

    if (!name || !city || !country || !region || !subRegion) {
      return next(
        new ApiError(
          "Name, city, country, region, and subRegion are required",
          400,
        ),
      );
    }

    const pharmacy = await prisma.pharmacy.create({
      data: {
        name: String(name).trim(),
        city: String(city).trim(),
        country: String(country).trim(),
        region: String(region).trim(),
        subRegion: String(subRegion).trim(),
      },
    });

    res.status(201).json({
      status: "success",
      message: "Data created successfully",
      data: pharmacy,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Failed to create pharmacy", 500));
  }
};

const getAllPharmacies = async (req, res, next) => {
  try {
    const apiFeatures = new ApiFeatures(req.query);
    const { queryObj, pagination } = apiFeatures.applyFeatures(req.query);
    const whereClause = { ...queryObj.where };

    const totalDocuments = await prisma.pharmacy.count({ where: whereClause });

    const pharmacies = await prisma.pharmacy.findMany({
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
      data: pharmacies,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Failed to fetch pharmacies", 500));
  }
};

const getPharmacyById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pharmacy = await prisma.pharmacy.findUnique({ where: { id } });

    if (!pharmacy) {
      return next(new ApiError("Pharmacy not found", 404));
    }

    res.status(200).json({
      status: "success",
      data: pharmacy,
    });
  } catch (error) {
    next(new ApiError("Failed to fetch pharmacy", 500));
  }
};

const updatePharmacy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.pharmacy.findUnique({ where: { id } });

    if (!existing) {
      return next(new ApiError("Pharmacy not found", 404));
    }

    const pharmacy = await prisma.pharmacy.update({
      where: { id },
      data: {
        ...(req.body.name !== undefined
          ? { name: String(req.body.name).trim() }
          : {}),
        ...(req.body.city !== undefined
          ? { city: String(req.body.city).trim() }
          : {}),
        ...(req.body.country !== undefined
          ? { country: String(req.body.country).trim() }
          : {}),
        ...(req.body.region !== undefined
          ? { region: String(req.body.region).trim() }
          : {}),
        ...(req.body.subRegion !== undefined
          ? { subRegion: String(req.body.subRegion).trim() }
          : {}),
      },
    });

    res.status(200).json({
      status: "success",
      message: "Pharmacy updated successfully",
      data: pharmacy,
    });
  } catch (error) {
    next(new ApiError("Failed to update pharmacy", 500));
  }
};

const deletePharmacy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.pharmacy.findUnique({ where: { id } });

    if (!existing) {
      return next(new ApiError("Pharmacy not found", 404));
    }

    await prisma.pharmacy.delete({ where: { id } });

    res.status(200).json({
      status: "success",
      message: "Pharmacy deleted successfully",
    });
  } catch (error) {
    next(new ApiError("Failed to delete pharmacy", 500));
  }
};

const bulkImportPharmacies = async (req, res, next) => {
  try {
    const records = req.body?.records ?? req.body;
    const data = Array.isArray(records) ? records : [];

    if (!data.length) {
      return next(new ApiError("No pharmacy records provided", 400));
    }

    const created = await prisma.pharmacy.createMany({
      data: data.map((record) => ({
        name: String(record.name || "").trim(),
        city: String(record.city || "").trim(),
        country: String(record.country || "").trim(),
        region: String(record.region || "").trim(),
        subRegion: String(record.subRegion || "").trim(),
      })),
    });

    res.status(200).json({
      status: "success",
      total: data.length,
      imported: created.count,
      skipped: Math.max(data.length - created.count, 0),
      failed: 0,
      errors: [],
    });
  } catch (error) {
    next(new ApiError("Failed to import pharmacies", 500));
  }
};

export {
  addPharmacy,
  getAllPharmacies,
  getPharmacyById,
  updatePharmacy,
  deletePharmacy,
  bulkImportPharmacies,
};
