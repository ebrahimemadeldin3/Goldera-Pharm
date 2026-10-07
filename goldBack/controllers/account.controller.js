import { prisma } from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import { text } from "../utils/validation.js";

const addAccount = async (req, res, next) => {
  try {
    const { name, subRegionId } = req.body;

    if (!name) {
      return next(new ApiError("Account name is required", 400));
    }

    const account = await prisma.accounts.create({
      data: {
        name: text(name, "Name"),
        subRegionId: subRegionId || null,
      },
      include: {
        subRegion: {
          select: {
            id: true,
            name: true,
            region: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      status: "success",
      message: "Data created successfully",
      data: account,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const getAllAccounts = async (req, res, next) => {
  try {
    const accounts = await prisma.accounts.findMany({
      include: {
        subRegion: {
          select: {
            id: true,
            name: true,
            region: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        doctors: {
          select: {
            id: true,
            nameEN: true,
            nameAR: true,
            phone: true,
            specialty: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      status: "success",
      message: "Data fetched successfully",
      results: accounts.length,
      data: accounts,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export { addAccount, getAllAccounts };

export async function updateReference(req, res, next) {
  const data = {};
  const allowed = ["name", "subRegionId"];
  if (Object.keys(req.body).some((key) => !allowed.includes(key)))
    return next(new ApiError("Unsupported field", 400));
  for (const key of allowed)
    if (req.body[key] !== undefined)
      data[key] =
        key === "subRegionId" && !req.body[key]
          ? null
          : text(req.body[key], key);
  const record = await prisma.accounts.update({
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
  if (await prisma.doctor.count({ where: { accountsId: req.params.id } }))
    return next(
      new ApiError(
        "This facility has assigned doctors. Reassign them first.",
        409,
      ),
    );
  await prisma.accounts.delete({ where: { id: req.params.id } });
  res.json({ status: "success", message: "Record deleted successfully" });
}
