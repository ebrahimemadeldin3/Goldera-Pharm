import { prisma } from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import xlsx from "xlsx";
import fs from "fs/promises";
import { ApiFeatures, paginationResults } from "../utils/apiFeatures.js";
import { text, number } from "../utils/validation.js";

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

  if (!req.body.nameAR?.trim() && !req.body.nameEN?.trim())
    return next(new ApiError("A doctor name is required", 400));
  const permitted = [
    "nameAR",
    "nameEN",
    "email",
    "accountName",
    "phone",
    "grade",
    "avgPatientsPerDay",
    "specialty",
    "LicenseNumber",
    "subRegion",
    "area",
    "latitude",
    "longitude",
    "accountsId",
    "isActive",
  ];
  if (Object.keys(req.body).some((key) => !permitted.includes(key)))
    return next(new ApiError("Unsupported doctor field", 400));
  for (const key of ["nameAR", "nameEN"])
    if (req.body[key]) req.body[key] = text(req.body[key], key);
  if (req.body.avgPatientsPerDay !== undefined)
    req.body.avgPatientsPerDay = number(
      req.body.avgPatientsPerDay,
      "Patients per day",
      { integer: true },
    );

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

    const apiFeatures = new ApiFeatures(req.query, "Doctor");
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
    next(error);
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

  if (req.body.nameAR !== undefined || req.body.nameEN !== undefined) {
    const nameAR = req.body.nameAR ?? exists.nameAR;
    const nameEN = req.body.nameEN ?? exists.nameEN;
    if (!nameAR?.trim() && !nameEN?.trim())
      return next(new ApiError("A doctor name is required", 400));
  }
  const permitted = [
    "nameAR",
    "nameEN",
    "email",
    "accountName",
    "phone",
    "grade",
    "avgPatientsPerDay",
    "specialty",
    "LicenseNumber",
    "subRegion",
    "area",
    "latitude",
    "longitude",
    "accountsId",
    "isActive",
  ];
  if (Object.keys(req.body).some((key) => !permitted.includes(key)))
    return next(new ApiError("Unsupported doctor field", 400));
  if (req.body.avgPatientsPerDay !== undefined)
    req.body.avgPatientsPerDay = number(
      req.body.avgPatientsPerDay,
      "Patients per day",
      { integer: true },
    );
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
    const records = req.body?.records ?? req.body;
    const normalizedRecords = Array.isArray(records) ? records : [];
    if (normalizedRecords.length > 1000)
      return next(new ApiError("Import up to 1000 doctors per batch", 400));

    if (req.file) {
      const workbook = xlsx.readFile(req.file.path, { cellDates: true });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rawData = xlsx.utils.sheet_to_json(sheet);

      rawData.forEach((row) => {
        normalizedRecords.push({
          nameAR: row["Name (Arabic)"],
          nameEN: row["Name (English)"],
          email: row["Email"],
          phone: row["Phone"],
          grade: row["Grade"],
          avgPatientsPerDay: row["Avg Patients per Day"],
          specialty: row["Specialty"],
          LicenseNumber: row["License Number"],
          subRegion: row["Sub Region"],
          accountName: row["Account Name"],
          area: row["Area"],
        });
      });

      await fs.unlink(req.file.path).catch((err) => {
        console.error("Failed to delete file:", err);
      });
    }

    if (!normalizedRecords.length) {
      return next(new ApiError("No doctor records provided", 400));
    }
    if (normalizedRecords.length > 1000)
      return next(new ApiError("Import up to 1000 doctors per batch", 400));

    for (const [index, record] of normalizedRecords.entries()) {
      if (
        !record ||
        (!String(record.nameAR ?? "").trim() &&
          !String(record.nameEN ?? "").trim())
      ) {
        return next(
          new ApiError(`Row ${index + 1}: a doctor name is required`, 400),
        );
      }
      if (
        record.avgPatientsPerDay !== undefined &&
        record.avgPatientsPerDay !== null &&
        record.avgPatientsPerDay !== ""
      ) {
        number(record.avgPatientsPerDay, `Row ${index + 1}: patients per day`, {
          integer: true,
        });
      }
    }

    const created = await prisma.doctor.createMany({
      data: normalizedRecords.map((record) => ({
        nameAR: record.nameAR ?? null,
        nameEN: record.nameEN ?? null,
        email: record.email ?? null,
        phone: record.phone ?? null,
        grade: record.grade ?? null,
        avgPatientsPerDay: Number(record.avgPatientsPerDay ?? 0) || null,
        specialty: record.specialty ?? null,
        LicenseNumber: record.LicenseNumber ?? record.licenseNumber ?? null,
        subRegion: record.subRegion ?? null,
        accountName: record.accountName ?? null,
        area: record.area ?? null,
        latitude: record.latitude ?? null,
        longitude: record.longitude ?? null,
      })),
    });

    res.status(201).json({
      status: "success",
      total: normalizedRecords.length,
      imported: created.count,
      skipped: Math.max(normalizedRecords.length - created.count, 0),
      failed: 0,
      errors: [],
    });
  } catch (error) {
    console.error(error);
    next(error);
  } finally {
    if (req.file?.path) await fs.unlink(req.file.path).catch(() => {});
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
