import bcrypt from "bcrypt";
import { prisma } from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import { validateAndDetectFiles } from "../utils/fileValidator.js";
import { uploadDocumentToCloudinary } from "../utils/cloudinary.js";
import { ApiFeatures, paginationResults } from "../utils/apiFeatures.js";

// Create user
const createUser = async (req, res, next) => {
  let {
    name,
    email,
    password,
    phone,
    dateOfBirth,
    dateOfRecruitment,
    educationBackground,
    role,
    regionIds,
    subRegionId,
    supervisorId,
    iqamaNumber,
    passportNumber,
  } = req.body;

  // find the user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (user) {
    return next(new ApiError(`User with email: ${email} already exists`, 400));
  }

  // validate role
  const isRoleValid = ["MEDICAL_REP", "SUPERVISOR", "MANAGER"].includes(role);
  if (!isRoleValid) {
    return next(new ApiError("Invalid role", 400));
  }

  // validate supervisorId
  // if (role === "MEDICAL_REP" && !supervisorId) {
  //   return next(new ApiError("Supervisor ID is required", 400));
  // }

  // validate that supervisorId is not provided for supervisors
  if (["MANAGER", "SUPERVISOR"].includes(role) && supervisorId) {
    return next(
      new ApiError(
        "Supervisor ID is not allowed for supervisors and managers",
        400,
      ),
    );
  }

  if (role === "SUPERVISOR") {
    regionIds = Array.isArray(regionIds) ? regionIds : [regionIds];
  } else {
    regionIds = undefined;
  }

  if (role === "MEDICAL_REP") {
    subRegionId = Array.isArray(subRegionId) ? subRegionId[0] : subRegionId;
  } else {
    subRegionId = undefined;
  }

  let resumeFiles = [];
  let certificatesFiles = [];

  if (req.files.length > 0) {
    resumeFiles = await validateAndDetectFiles(req.files?.resume);
    certificatesFiles = await validateAndDetectFiles(req.files?.certificates);
  }

  let resume = {};
  let certificates = [];

  try {
    if (resumeFiles.length > 0) {
      const resumeFile = resumeFiles[0];

      // upload resume
      const result = await uploadDocumentToCloudinary(resumeFile.buffer, {
        public_id: `file_${resumeFile.originalname}_${Date.now()}`,
        folder: `folder-files/resumes`,
      });

      resume = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    if (certificatesFiles.length > 0) {
      // upload certificates
      for (const file of certificatesFiles) {
        const result2 = await uploadDocumentToCloudinary(file.buffer, {
          public_id: `file_${file.originalname}_${Date.now()}`,
          folder: `folder-files/certificates`,
        });

        certificates.push({
          public_id: result2.public_id,
          url: result2.secure_url,
        });
      }
    }
  } catch (error) {
    console.error("Error uploading files to Cloudinary:", error);
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // create new user
  const newUser = await prisma.user.createMany({
    data: {
      name,
      email,
      password: hashedPassword,
      phone,
      role,

      managerId: req.user?.id,
      supervisorId: supervisorId || null,

      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      dateOfRecruitment: dateOfRecruitment ? new Date(dateOfRecruitment) : null,

      educationBackground,
      iqamaNumber,
      passportNumber,

      regions: regionIds?.length
        ? {
            connect: regionIds.map((id) => ({ id })),
          }
        : undefined,

      subRegion: {
        connect: subRegionId,
      },

      resume,
      certificates: certificates?.length ? { set: certificates } : [],
    },
  });

  res.status(201).json({
    status: "success",
    message: "User created successfully",
    data: newUser,
  });
};

// Get all users
const getAllUsers = async (req, res, next) => {
  try {
    const apiFeatures = new ApiFeatures(req.query);
    const { queryObj, pagination } = apiFeatures.applyFeatures(req.query);
    const whereClause = { ...queryObj.where };

    const totalDocuments = await prisma.user.count({ where: whereClause });

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        dateOfBirth: true,
        dateOfRecruitment: true,
        department: true,
        location: true,
        bio: true,
        educationBackground: true,
        iqamaNumber: true,
        passportNumber: true,
        resume: true,
        certificates: true,
        lastLogin: true,
        isActive: true,
        profileImage: true,

        leaveStartDate: true,
        leaveEndDate: true,
        leaveDaysCountTotal: true,

        regions: { select: { id: true, name: true } },
        subRegion: {
          select: {
            id: true,
            name: true,
            region: { select: { id: true, name: true } },
          },
        },

        supervisor: { select: { id: true, name: true } },
        manager: { select: { id: true, name: true } },

        createdAt: true,
        updatedAt: true,
      },
      orderBy: queryObj.orderBy || { createdAt: "desc" },
      take: queryObj.take,
      skip: queryObj.skip,
    });

    const paginationData = paginationResults(pagination, totalDocuments);

    res.status(200).json({
      status: "success",
      message: "Users fetched successfully",
      results: totalDocuments,
      pagination: paginationData,
      data: users,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Failed to fetch users", 500));
  }
};

// Get user details
const getUserDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Fetch User with all necessary relations in one go
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        supervisor: { select: { id: true, name: true } },
        manager: { select: { id: true, name: true } },
        subRegion: {
          select: {
            id: true,
            name: true,
            region: { select: { id: true, name: true } },
          },
        },
        appraisalsForRep: { select: { id: true } }, // Fetching these directly via relation
      },
    });

    if (!user) {
      return next(new ApiError("User not found", 404));
    }

    // 2. Parallelize independent queries for speed
    const [totalVisits, subRegionSales] = await Promise.all([
      // Count completed visits
      prisma.visit.count({
        where: { userId: id, status: "COMPLETED" },
      }),

      // Aggregate sales for the subregion directly in the DB
      // Note: This assumes 'customer' in Sales matches 'name' in Pharmacy
      prisma.sales.aggregate({
        _sum: {
          untaxedTotal: true,
        },
        where: {
          customer: {
            in: await prisma.pharmacy
              .findMany({
                where: { subRegion: user.subRegion?.name },
                select: { name: true },
              })
              .then((pharms) => pharms.map((p) => p.name)),
          },
        },
      }),
    ]);

    // 3. Calculate Years of Experience
    const yearsOfExperience = user.createdAt
      ? new Date().getFullYear() - new Date(user.createdAt).getFullYear()
      : 0;

    const totalSales = subRegionSales._sum.untaxedTotal || 0;

    res.status(200).json({
      status: "success",
      message: "User fetched successfully",
      data: {
        yearsOfExperience,
        lastLogin: user.lastLogin,
        joinDate: user.createdAt,
        reportsTo: user.supervisor,
        totalVisits,
        appraisalsForRep: user.appraisalsForRep,
        totalSales,
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update one user by id
const updateOneUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const exists = await prisma.user.findUnique({
      where: { id },
    });
    if (!exists) {
      return next(new ApiError("User not found", 404));
    }

    if (req.body?.newPassword) {
      if (await bcrypt.compare(req?.body?.newPassword, exists?.password)) {
        return next(
          new ApiError(
            "New password cannot be the same as the current password",
            400,
          ),
        );
      }

      const hashedPassword = await bcrypt.hash(req.body?.newPassword, 10);
      req.body.password = hashedPassword;
      delete req.body.newPassword;
    }

    const user = await prisma.user.update({
      where: { id },
      data: req.body,
    });

    let userData = { ...user };
    delete userData.password;

    res.status(200).json({
      status: "success",
      message: "User updated successfully",
      data: userData,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError(`Update User Error`, 500));
  }
};

// Delete one user by id
const deleteOneUserById = async (req, res) => {
  const { id } = req.params;

  await prisma.user.delete({
    where: { id },
  });

  res
    .status(200)
    .json({ status: "success", message: "User deleted successfully" });
};

const getManagerTeam = async (req, res, next) => {
  let filter = { isActive: true };
  try {
    const apiFeatures = new ApiFeatures(req.query);
    const { queryObj, pagination } = apiFeatures.applyFeatures(req.query);

    if (
      req.query?.role &&
      ["MEDICAL_REP", "SUPERVISOR"].includes(req.query?.role)
    ) {
      filter.role = req.query?.role;
    }

    const whereClause = {
      ...queryObj.where,
      ...filter,
      managerId: req.user.id,
    };

    const totalDocuments = await prisma.user.count({ where: whereClause });

    const team = await prisma.user.findMany({
      where: whereClause,
      orderBy: queryObj.orderBy || { createdAt: "desc" },
      take: queryObj.take,
      skip: queryObj.skip,
    });

    let supervisorsCount = 0;
    let repsCount = 0;
    team.forEach((user) => {
      if (user.role === "SUPERVISOR") {
        supervisorsCount += 1;
      } else if (user.role === "MEDICAL_REP") {
        repsCount += 1;
      }
    });

    const paginationData = paginationResults(pagination, totalDocuments);

    res.status(200).json({
      status: "success",
      message: "Data fetched successfully",
      results: totalDocuments,
      pagination: paginationData,
      supervisorsCount,
      repsCount,
      data: team,
    });
  } catch (err) {
    console.error(err);
    return next(new ApiError(`Get Manager Team Error: ${err}`));
  }
};

const getTeamRequests = async (req, res, next) => {
  try {
    let role = "MEDICAL_REP";

    if (
      req?.query?.role &&
      ["MEDICAL_REP", "SUPERVISOR"].includes(req?.query?.role)
    ) {
      role = req?.query?.role;
    }

    const apiFeatures = new ApiFeatures(req?.query);
    const { queryObj, pagination } = apiFeatures.applyFeatures(req?.query);

    const users = await prisma.user.findMany({
      where: { managerId: req?.user?.id, role },
      select: { id: true },
    });

    if (users.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "No requests found",
        results: 0,
        pagination: paginationResults(pagination, 0),
        data: [],
      });
    }

    const whereClause = {
      ...queryObj?.where,
      userId: { in: users.map((rep) => rep.id) },
    };

    const totalDocuments = await prisma.request.count({ where: whereClause });

    const data = await prisma.request.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: queryObj?.orderBy || { createdAt: "desc" },
      take: queryObj?.take,
      skip: queryObj?.skip,
    });

    const paginationData = paginationResults(pagination, totalDocuments);

    res.status(200).json({
      status: "success",
      message: "Data fetched successfully",
      results: totalDocuments,
      pagination: paginationData,
      data,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Failed to fetch requests", 500));
  }
};

export {
  createUser,
  getAllUsers,
  getUserDetails,
  updateOneUserById,
  deleteOneUserById,
  getManagerTeam,
  getTeamRequests,
};
