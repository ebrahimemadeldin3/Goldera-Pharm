import { prisma } from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import xlsx from "xlsx";
import fs from "fs/promises";
import { ApiFeatures, paginationResults } from "../utils/apiFeatures.js";
import {
  text,
  number,
  date,
  userScope,
  canManageUser,
} from "../utils/validation.js";

const addSale = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ApiError("Please upload a file", 400));
    }
    const importName = text(req.body.sheetName, "Import name");

    const existingSales = await prisma.sales.findFirst({
      where: {
        sheetName: importName,
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

    const dataWithProductIds = data
      .filter((sale) => {
        const label = String(sale.customer || sale.order || "").trim();
        return (
          !/^(grand\s+)?total$/i.test(label) &&
          Boolean(sale.customer || sale.productVariant)
        );
      })
      .map((sale, index) => {
        const product = products.find(
          (p) =>
            `[${p.internalRef}] ${p.name}`.trim() ===
            sale.productVariant?.trim(),
        );
        if (!product)
          throw new ApiError(
            `Row ${index + 2}: product is not in the catalog`,
            400,
          );
        return {
          sheetName: importName,
          customer: text(sale.customer, `Row ${index + 2} customer`),
          order: text(String(sale.order || ""), `Row ${index + 2} order`),
          orderDate: date(sale.orderDate, `Row ${index + 2} order date`),
          qtyOrdered: number(sale.qtyOrdered, `Row ${index + 2} quantity`, {
            min: 1,
            integer: true,
          }),
          untaxedTotal: number(sale.untaxedTotal, `Row ${index + 2} amount`),
          productId: product.id,
        };
      });

    if (!dataWithProductIds.length)
      throw new ApiError("The spreadsheet has no valid sales rows", 400);

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
    next(error);
  } finally {
    if (req.file?.path) await fs.unlink(req.file.path).catch(() => {});
  }
};

const getAllSales = async (req, res, next) => {
  try {
    const { date, sheetName } = req.query;

    const apiFeatures = new ApiFeatures(req.query, "Sales");
    const { queryObj, pagination } = apiFeatures.applyFeatures(req.query);

    let whereClause = { ...queryObj.where };
    if (req.user.role === "SUPERVISOR") {
      const team = await prisma.user.findMany({
        where: userScope(req.user),
        include: { subRegion: true },
      });
      const territories = team
        .map((member) => member.subRegion?.name)
        .filter(Boolean);
      const pharmacies = await prisma.pharmacy.findMany({
        where: { subRegion: { in: territories } },
        select: { name: true },
      });
      whereClause.customer = {
        in: pharmacies.map((pharmacy) => pharmacy.name),
      };
    }

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
    next(error);
  }
};

const getRepsSales = async (req, res, next) => {
  try {
    const { date, sheetName } = req.query;

    const apiFeatures = new ApiFeatures(req.query, "Sales");
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

    const userSubRegion = rep.subRegion?.name || "__NO_ASSIGNED_TERRITORY__";

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
    next(error);
  }
};

const getRepsSalesByRepId = async (req, res, next) => {
  try {
    const { repId } = req.params;
    const { date, sheetName } = req.query;

    const apiFeatures = new ApiFeatures(req.query, "Sales");
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
    if (!canManageUser(req.user, rep))
      return next(new ApiError("Select a representative from your team", 403));

    const userSubRegion = rep.subRegion?.name || "__NO_ASSIGNED_TERRITORY__";

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
    next(error);
  }
};

export { addSale, getAllSales, getRepsSales, getRepsSalesByRepId };
