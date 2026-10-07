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

const DAY_MS = 86400000;

const dateOnlyKey = (value) => {
  const parsed = date(value, "Sales date");
  return parsed.toISOString().slice(0, 10);
};

const utcDayRange = (value) => {
  const key = dateOnlyKey(value);
  const start = new Date(`${key}T00:00:00.000Z`);
  const end = new Date(`${key}T23:59:59.999Z`);
  return { start, end };
};

const salesTimeFilterRange = (filter) => {
  if (!filter || filter === "all") return null;
  if (!["day", "week", "month", "year"].includes(filter)) {
    throw new ApiError("Invalid sales time filter", 400);
  }

  const now = new Date();
  const todayStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );

  if (filter === "day") {
    return {
      gte: todayStart,
      lte: new Date(todayStart.getTime() + DAY_MS - 1),
    };
  }

  if (filter === "week") {
    const start = new Date(todayStart);
    start.setUTCDate(todayStart.getUTCDate() - todayStart.getUTCDay());
    return { gte: start, lte: new Date(start.getTime() + 7 * DAY_MS - 1) };
  }

  if (filter === "month") {
    const start = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );
    const end = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
    );
    return { gte: start, lte: new Date(end.getTime() - 1) };
  }

  const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  const end = new Date(Date.UTC(now.getUTCFullYear() + 1, 0, 1));
  return { gte: start, lte: new Date(end.getTime() - 1) };
};

const applySalesQueryFilters = (whereClause, query) => {
  const {
    date: selectedDate,
    dateFrom,
    dateTo,
    sheetName,
    q,
    timeFilter,
  } = query;

  if (sheetName) {
    whereClause.sheetName = sheetName;
  }

  if (dateFrom || dateTo) {
    const from = utcDayRange(dateFrom || dateTo);
    const to = utcDayRange(dateTo || dateFrom);
    whereClause.orderDate = {
      gte: from.start <= to.start ? from.start : to.start,
      lte: from.end >= to.end ? from.end : to.end,
    };
  } else if (selectedDate) {
    const { start, end } = utcDayRange(selectedDate);
    whereClause.orderDate = { gte: start, lte: end };
  } else {
    const timeRange = salesTimeFilterRange(timeFilter);
    if (timeRange) whereClause.orderDate = timeRange;
  }

  if (q && String(q).trim()) {
    const term = String(q).trim();
    const searchConditions = [
      { customer: { contains: term, mode: "insensitive" } },
      { order: { contains: term, mode: "insensitive" } },
      { sheetName: { contains: term, mode: "insensitive" } },
      { productId: { contains: term, mode: "insensitive" } },
      {
        product: {
          is: {
            OR: [
              { name: { contains: term, mode: "insensitive" } },
              { internalRef: { contains: term, mode: "insensitive" } },
            ],
          },
        },
      },
    ];

    if (whereClause.OR) {
      whereClause.AND = [
        ...(whereClause.AND || []),
        { OR: whereClause.OR },
        { OR: searchConditions },
      ];
      delete whereClause.OR;
    } else {
      whereClause.OR = searchConditions;
    }
  }
};

const getSalesQuery = (query) => {
  const salesQuery = { ...query };
  delete salesQuery.date;
  delete salesQuery.dateFrom;
  delete salesQuery.dateTo;
  delete salesQuery.timeFilter;
  delete salesQuery.sheetName;
  delete salesQuery.q;
  return salesQuery;
};

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
      where: { isArchived: false },
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
    const salesQuery = getSalesQuery(req.query);
    const apiFeatures = new ApiFeatures(salesQuery, "Sales");
    const { queryObj, pagination } = apiFeatures.applyFeatures(salesQuery);

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

    applySalesQueryFilters(whereClause, req.query);

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
    const salesQuery = getSalesQuery(req.query);
    const apiFeatures = new ApiFeatures(salesQuery, "Sales");
    const { queryObj, pagination } = apiFeatures.applyFeatures(salesQuery);

    let whereClause = { ...queryObj.where };
    applySalesQueryFilters(whereClause, req.query);

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
    const salesQuery = getSalesQuery(req.query);
    const apiFeatures = new ApiFeatures(salesQuery, "Sales");
    const { queryObj, pagination } = apiFeatures.applyFeatures(salesQuery);

    let whereClause = { ...queryObj.where };
    applySalesQueryFilters(whereClause, req.query);

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
