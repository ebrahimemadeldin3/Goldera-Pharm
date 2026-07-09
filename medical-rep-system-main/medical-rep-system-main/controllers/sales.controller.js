import { prisma } from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import xlsx from "xlsx";
import fs from "fs/promises";
import { ApiFeatures, paginationResults } from "../utils/apiFeatures.js";

const addSale = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ApiError("Please upload a file", 400));
    }

    const existingSales = await prisma.sales.findFirst({
      where: {
        sheetName: `${req.body.sheetName}`.trim(),
      },
    });

    if (existingSales) {
      return next(
        new ApiError("Sales already exist with the same sheet name", 400),
      );
    }

    const workbook = xlsx.readFile(req.file.path, { cellDates: true });

    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const rawData = xlsx.utils.sheet_to_json(sheet);

    // Optional: normalize keys
    const data = rawData.map((row) => ({
      sheetName: `${req.body.sheetName}`.trim(),
      customer: row["Customer"],
      order: row["Order"],
      orderDate: row["Order Date"],
      productVariant: row["Product Variant"],
      qtyOrdered: row["Qty Ordered"],
      untaxedTotal: row["Untaxed Total"],
    }));

    // mapping productVariant to productId
    const products = await prisma.products.findMany({
      select: { id: true, name: true, internalRef: true },
    });

    let dataWithProductIds = data.map((sale) => {
      const product = products.find(
        (p) =>
          `[${p.internalRef}] ${p.name}`.trim() === sale.productVariant?.trim(),
      );
      return {
        sheetName: sale.sheetName,
        customer: sale.customer,
        order: sale.order,
        orderDate: sale.orderDate,
        qtyOrdered: sale.qtyOrdered,
        untaxedTotal: sale.untaxedTotal,
        productId: product ? product.id : null,
      };
    });

    dataWithProductIds.pop();

    const sale = await prisma.sales.createMany({
      data: dataWithProductIds,
    });

    // Optional: delete the uploaded file after processing
    await fs.unlink(req.file.path).catch((err) => {
      console.error("Failed to delete file:", err);
    });

    res.status(201).json({
      status: "success",
      message: "Data created successfully",
      data: sale,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Failed to create sale", 500));
  }
};

const getAllSales = async (req, res, next) => {
  try {
    const { date, sheetName } = req.query;

    const apiFeatures = new ApiFeatures(req.query);
    const { queryObj, pagination } = apiFeatures.applyFeatures(req.query);

    let whereClause = { ...queryObj.where };

    if (sheetName) {
      whereClause.sheetName = sheetName;
    }

    if (date) {
      const parsedDate = new Date(date);

      if (isNaN(parsedDate.getTime())) {
        return next(new ApiError("Invalid date format provided", 400));
      }

      const startOfDay = new Date(parsedDate);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(parsedDate);
      endOfDay.setUTCHours(23, 59, 59, 999);

      whereClause.orderDate = {
        gte: startOfDay,
        lte: endOfDay,
      };

      delete whereClause.date;
    }

    const totalDocuments = await prisma.sales.count({ where: whereClause });

    const sales = await prisma.sales.findMany({
      where: whereClause,
      include: { product: true },
      orderBy: queryObj.orderBy || { orderDate: "desc" },
      take: queryObj.take,
      skip: queryObj.skip,
    });

    const paginationData = paginationResults(pagination, totalDocuments);

    res.status(200).json({
      status: "success",
      results: totalDocuments,
      pagination: paginationData,
      data: sales,
    });
  } catch (error) {
    console.error("Sales Fetch Error:", error);
    next(new ApiError("Error fetching sales data", 500));
  }
};

const getRepsSales = async (req, res, next) => {
  try {
    const { date, sheetName } = req.query;

    const apiFeatures = new ApiFeatures(req.query);
    const { queryObj, pagination } = apiFeatures.applyFeatures(req.query);

    let whereClause = { ...queryObj.where };

    if (sheetName) {
      whereClause.sheetName = sheetName;
    }

    if (date) {
      const parsedDate = new Date(date);

      if (isNaN(parsedDate.getTime())) {
        return next(new ApiError("Invalid date format provided", 400));
      }

      const startOfDay = new Date(parsedDate);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(parsedDate);
      endOfDay.setUTCHours(23, 59, 59, 999);

      whereClause.orderDate = {
        gte: startOfDay,
        lte: endOfDay,
      };
      delete whereClause.date;
    }

    // 1. Get Rep and SubRegion
    const rep = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { subRegion: true },
    });

    if (!rep) return res.status(404).json({ message: "Rep not found" });

    const userSubRegion = rep.subRegion?.name;

    const pharmacyNames = await prisma.pharmacy.findMany({
      where: { subRegion: userSubRegion },
      select: { name: true },
    });

    const namesArray = pharmacyNames.map((p) => p.name);

    whereClause.customer = { in: namesArray };

    const totalDocuments = await prisma.sales.count({ where: whereClause });

    const sales = await prisma.sales.findMany({
      where: whereClause,
      include: {
        product: true,
      },
      orderBy: queryObj.orderBy || { orderDate: "desc" },
      take: queryObj.take,
      skip: queryObj.skip,
    });

    const paginationData = paginationResults(pagination, totalDocuments);

    res.status(200).json({
      status: "success",
      results: totalDocuments,
      pagination: paginationData,
      data: sales,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Error fetching sales dashboard data", 500));
  }
};

const getRepsSalesByRepId = async (req, res, next) => {
  try {
    const { repId } = req.params;
    const { date, sheetName } = req.query;

    const apiFeatures = new ApiFeatures(req.query);
    const { queryObj, pagination } = apiFeatures.applyFeatures(req.query);

    let whereClause = { ...queryObj.where };

    if (sheetName) {
      whereClause.sheetName = sheetName;
    }

    if (date) {
      const parsedDate = new Date(date);

      if (isNaN(parsedDate.getTime())) {
        return next(new ApiError("Invalid date format provided", 400));
      }

      const startOfDay = new Date(parsedDate);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(parsedDate);
      endOfDay.setUTCHours(23, 59, 59, 999);

      whereClause.orderDate = {
        gte: startOfDay,
        lte: endOfDay,
      };
      delete whereClause.date;
    }

    // 1. Get Rep and SubRegion
    const rep = await prisma.user.findUnique({
      where: { id: repId },
      include: { subRegion: true },
    });

    if (!rep) return res.status(404).json({ message: "Rep not found" });

    const userSubRegion = rep.subRegion?.name;

    const pharmacyNames = await prisma.pharmacy.findMany({
      where: { subRegion: userSubRegion },
      select: { name: true },
    });

    const namesArray = pharmacyNames.map((p) => p.name);

    whereClause.customer = { in: namesArray };

    const totalDocuments = await prisma.sales.count({ where: whereClause });

    const sales = await prisma.sales.findMany({
      where: whereClause,
      include: {
        product: true,
      },
      orderBy: queryObj.orderBy || { orderDate: "desc" },
      take: queryObj.take,
      skip: queryObj.skip,
    });

    const paginationData = paginationResults(pagination, totalDocuments);

    res.status(200).json({
      status: "success",
      results: totalDocuments,
      pagination: paginationData,
      data: sales,
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Error fetching sales dashboard data", 500));
  }
};

export { addSale, getAllSales, getRepsSales, getRepsSalesByRepId };
