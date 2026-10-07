import { prisma } from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import { text } from "../utils/validation.js";

const addSubRegion = async (req, res) => {
  const { name, regionId } = req.body;

  const subRegion = await prisma.subRegion.create({
    data: { name: text(name, "Name"), regionId: text(regionId, "Region") },
  });
  res.status(201).json({
    status: "success",
    message: "Data created successfully",
    data: subRegion,
  });
};

const getAllSubRegions = async (req, res) => {
  const subRegions = await prisma.subRegion.findMany({
    select: {
      id: true,
      name: true,
      region: {
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
        },
      },
      reps: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },

      createdAt: true,
    },
  });
  res.status(200).json({
    status: "success",
    message: "Data fetched successfully",
    results: subRegions.length,
    data: subRegions,
  });
};

export { addSubRegion, getAllSubRegions };

export async function updateReference(req, res, next) {
  const data = {};
  const allowed = ["name", "regionId"];
  if (Object.keys(req.body).some((key) => !allowed.includes(key)))
    return next(new ApiError("Unsupported field", 400));
  for (const key of allowed)
    if (req.body[key] !== undefined)
      data[key] =
        key === "subRegionId" && !req.body[key]
          ? null
          : text(req.body[key], key);
  const record = await prisma.subRegion.update({
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
  if (
    (await prisma.user.count({ where: { subRegionId: req.params.id } })) ||
    (await prisma.accounts.count({ where: { subRegionId: req.params.id } }))
  )
    return next(
      new ApiError(
        "This territory is assigned to staff or facilities. Reassign them first.",
        409,
      ),
    );
  await prisma.subRegion.delete({ where: { id: req.params.id } });
  res.json({ status: "success", message: "Record deleted successfully" });
}
