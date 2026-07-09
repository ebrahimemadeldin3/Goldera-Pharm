import { prisma } from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import { ApiFeatures, paginationResults } from "../utils/apiFeatures.js";

// Add new doctor
const addNewDoctor = async (req, res, next) => {
  // bulk create many doctors
  // const data = req.body.map((doctor) => ({
  //   nameAR: String(doctor.nameAR).trim(),
  //   nameEN: String(doctor.nameEN).trim(),
  //   email: String(doctor.email).trim(),
  //   accountName: String(doctor.accountName).trim(),
  //   phone: String(doctor.phone).trim(),
  //   grade: String(doctor.grade).trim(),
  //   avgPatientsPerDay: Number(doctor.avgPatientsPerDay || 0) || null,
  //   specialty: String(doctor.specialty).trim(),
  //   LicenseNumber: String(doctor.LicenseNumber).trim() || null,
  //   subRegion: String(doctor.subRegion).trim(),
  // }));

  // const newDoctors = await prisma.doctor.createMany({
  //   data,
  // });

  // console.log("New doctors added:", data.length);

  // res.status(201).json({
  //   status: "success",
  //   message: "Doctors added successfully",
  //   results: data.length,
  // });

  if (!req.body) {
    return next(new ApiError("Please provide doctor data", 400));
  }

  let {
    nameAR,
    nameEN,
    email,
    accountName,
    phone,
    grade,
    avgPatientsPerDay,
    specialty,
    LicenseNumber,
    subRegion,
  } = req.body;

  nameAR = String(nameAR).trim();
  nameEN = String(nameEN).trim();
  email = String(email).trim();
  accountName = String(accountName).trim();
  phone = String(phone);
  grade = String(grade).trim();
  avgPatientsPerDay = Number(avgPatientsPerDay);
  specialty = String(specialty).trim();
  LicenseNumber = String(LicenseNumber).trim();
  subRegion = String(subRegion).trim();

  // Add doctor
  const newDoctor = await prisma.doctor.create({
    data: req.body,
  });

  res.status(201).json({
    status: "success",
    message: "User created successfully",
    data: newDoctor,
  });
};

// Get all doctors
const getAllDoctors = async (req, res, next) => {
  try {
    const { subRegion, paginate } = req.query;

    if (paginate === "false") {
      const doctors = await prisma.doctor.findMany({
        where: subRegion ? { subRegion } : {},
        orderBy: { createdAt: "desc" },
      });

      return res.status(200).json({
        status: "success",
        message: "Doctors fetched successfully",
        results: doctors.length,
        pagination: null,
        data: doctors,
      });
    }

    const apiFeatures = new ApiFeatures(req.query);
    const { queryObj, pagination } = apiFeatures.applyFeatures(req.query);

    const whereClause = { ...queryObj.where };
    if (subRegion) whereClause.subRegion = subRegion;

    const totalDocuments = await prisma.doctor.count({ where: whereClause });

    const doctors = await prisma.doctor.findMany({
      where: whereClause,
      orderBy: queryObj.orderBy || { createdAt: "desc" },
      take: queryObj.take,
      skip: queryObj.skip,
    });

    const paginationData = paginationResults(pagination, totalDocuments);

    res.status(200).json({
      status: "success",
      message: "Doctors fetched successfully",
      results: totalDocuments,
      pagination: paginationData,
      data: doctors,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Failed to fetch doctors", 500));
  }
};

// Get One Doctor by id
const getOneDoctor = async (req, res, next) => {
  const { id } = req.params;

  const doctor = await prisma.doctor.findUnique({
    where: { id },
    include: {
      visits: {
        select: { id: true, date: true, status: true },
        orderBy: { createdAt: "desc" },
        take: 4,
      },
    },
  });

  if (!doctor) {
    return next(new ApiError("Doctor not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Doctor fetched successfully",
    data: doctor,
  });
};

// Update one doctor by id
const updateDoctor = async (req, res, next) => {
  const { id } = req.params;

  const exists = await prisma.doctor.findUnique({
    where: { id },
  });
  if (!exists) {
    return next(new ApiError("Doctor not found", 404));
  }

  const doctor = await prisma.doctor.update({
    where: { id },
    data: req.body,
  });

  res.status(200).json({
    status: "success",
    message: "Doctor updated successfully",
    data: doctor,
  });
};

// Delete one doctor by id
const deleteDoctor = async (req, res, next) => {
  const { id } = req.params;

  const exists = await prisma.doctor.findUnique({
    where: { id },
  });
  if (!exists) {
    return next(new ApiError("Doctor not found", 404));
  }
  await prisma.doctor.delete({
    where: { id },
  });
  res
    .status(200)
    .json({ status: "success", message: "Doctor deleted successfully" });
};

// add doctor by CSV file
const addDoctorByCSV = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ApiError("Please upload a file", 400));
    }

    const workbook = xlsx.readFile(req.file.path, { cellDates: true });

    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const rawData = xlsx.utils.sheet_to_json(sheet);

    // Optional: normalize keys
    const data = rawData.map((row) => ({
      nameAR: row["Name (Arabic)"],
      nameEN: row["Name (English)"],
      email: row["Email"],
      phone: row["Phone"],
      grade: row["Grade"],
      avgPatientsPerDay: row["Avg Patients per Day"],
      specialty: row["Specialty"],
      licenseNumber: row["License Number"],
      subRegion: row["Sub Region"],
      accountName: row["Account Name"],
      area: row["Area"],
    }));

    const doctor = await prisma.doctor.createMany({
      data,
    });

    // Optional: delete the uploaded file after processing
    await fs.unlink(req.file.path).catch((err) => {
      console.error("Failed to delete file:", err);
    });

    res.status(201).json({
      status: "success",
      message: "Data created successfully",
      data: doctor,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Failed to create doctor", 500));
  }
};

export {
  addNewDoctor,
  getAllDoctors,
  getOneDoctor,
  updateDoctor,
  deleteDoctor,
  addDoctorByCSV,
};
