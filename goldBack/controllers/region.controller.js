import { prisma } from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import { text } from "../utils/validation.js";

const addRegion = async (req, res) => {
  const { name, country } = req.body;

  const region = await prisma.region.create({
    data: { name: text(name, "Name"), country: text(country, "Country") },
  });
  res.status(201).json({
    status: "success",
    message: "Data created successfully",
    data: region,
  });
};

const getAllRegions = async (req, res) => {
  const regions = await prisma.region.findMany({
    select: {
      id: true,
      name: true,
      country: true,
      supervisor: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      subRegions: {
        select: {
          id: true,
          name: true,
          reps: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      },

      createdAt: true,
    },
  });
  res.status(200).json({
    status: "success",
    message: "Data fetched successfully",
    results: regions.length,
    data: regions,
  });
};

export { addRegion, getAllRegions };

export async function updateReference(req, res, next) {
  const data = {};
  const allowed = ["name", "country"];
  if (Object.keys(req.body).some((key) => !allowed.includes(key)))
    return next(new ApiError("Unsupported field", 400));
  for (const key of allowed)
    if (req.body[key] !== undefined)
      data[key] =
        key === "subRegionId" && !req.body[key]
          ? null
          : text(req.body[key], key);
  const record = await prisma.region.update({
    where: { id: req.params.id },
    data,
  });
  res.json({
    status: "success",
    data: record,
    message: "Record updated successfully",
  });
}

export async function deleteReference(req, res, next) {
  if (await prisma.subRegion.count({ where: { regionId: req.params.id } }))
    return next(
      new ApiError(
        "This region contains territories. Remove or reassign them first.",
        409,
      ),
    );
  await prisma.region.delete({ where: { id: req.params.id } });
  res.json({ status: "success", message: "Record deleted successfully" });
}
