import { prisma } from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import { ApiFeatures, paginationResults } from "../utils/apiFeatures.js";
import { text } from "../utils/validation.js";

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
        name: text(name, "Name"),
        city: text(city, "City"),
        country: text(country, "Country"),
        region: text(region, "Region"),
        subRegion: text(subRegion, "Sub-region"),
      },
    });

    res.status(201).json({
      status: "success",
      message: "Data created successfully",
      data: pharmacy,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const getAllPharmacies = async (req, res, next) => {
  try {
    const apiFeatures = new ApiFeatures(req.query, "Pharmacy");
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
    next(error);
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
    next(error);
  }
};

const updatePharmacy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.pharmacy.findUnique({ where: { id } });

    if (!existing) {
      return next(new ApiError("Pharmacy not found", 404));
    }

    const permitted = ["name", "city", "country", "region", "subRegion"];
    if (
      !req.body ||
      Object.keys(req.body).some((key) => !permitted.includes(key))
    )
      return next(new ApiError("Unsupported pharmacy field", 400));
    const pharmacy = await prisma.$transaction(
      async (tx) => {
        const current = await tx.pharmacy.findUnique({ where: { id } });
        if (!current) throw new ApiError("Pharmacy not found", 404);
        const newName =
          req.body.name !== undefined
            ? text(req.body.name, "name")
            : current.name;
        if (newName !== current.name) {
          const salesCount = await tx.sales.count({
            where: { customer: current.name },
          });
          if (
            salesCount &&
            (await tx.pharmacy.count({ where: { name: current.name } })) > 1
          )
            throw new ApiError(
              "Multiple pharmacies share this name. Resolve the sales assignment before renaming this pharmacy.",
              409,
            );
          if (salesCount) {
            if (
              await tx.pharmacy.count({
                where: { name: newName, id: { not: id } },
              })
            )
              throw new ApiError(
                "Another pharmacy already uses this name. Choose a unique name to preserve sales assignments.",
                409,
              );
            await tx.sales.updateMany({
              where: { customer: current.name },
              data: { customer: newName },
            });
          }
        }
        return tx.pharmacy.update({
          where: { id },
          data: {
            ...(req.body.name !== undefined
              ? { name: text(req.body.name, "name") }
              : {}),
            ...(req.body.city !== undefined
              ? { city: text(req.body.city, "city") }
              : {}),
            ...(req.body.country !== undefined
              ? { country: text(req.body.country, "country") }
              : {}),
            ...(req.body.region !== undefined
              ? { region: text(req.body.region, "region") }
              : {}),
            ...(req.body.subRegion !== undefined
              ? { subRegion: text(req.body.subRegion, "subRegion") }
              : {}),
          },
        });
      },
      { isolationLevel: "Serializable" },
    );

    res.status(200).json({
      status: "success",
      message: "Pharmacy updated successfully",
      data: pharmacy,
    });
  } catch (error) {
    next(error);
  }
};

const deletePharmacy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.pharmacy.findUnique({ where: { id } });

    if (!existing) {
      return next(new ApiError("Pharmacy not found", 404));
    }

    if (await prisma.sales.count({ where: { customer: existing.name } }))
      return next(
        new ApiError(
          "This pharmacy is used in sales records and cannot be deleted",
          409,
        ),
      );
    await prisma.pharmacy.delete({ where: { id } });

    res.status(200).json({
      status: "success",
      message: "Pharmacy deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const bulkImportPharmacies = async (req, res, next) => {
  try {
    const records = req.body?.records ?? req.body;
    const data = Array.isArray(records) ? records : [];
    if (data.length > 1000)
      return next(new ApiError("Import up to 1000 pharmacies per batch", 400));

    if (!data.length) {
      return next(new ApiError("No pharmacy records provided", 400));
    }

    const created = await prisma.pharmacy.createMany({
      data: data.map((record) => ({
        name: text(record.name, "Name"),
        city: text(record.city, "City"),
        country: text(record.country, "Country"),
        region: text(record.region, "Region"),
        subRegion: text(record.subRegion, "Sub-region"),
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
    next(error);
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
