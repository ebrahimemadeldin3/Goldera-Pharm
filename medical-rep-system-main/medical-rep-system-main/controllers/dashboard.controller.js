import { prisma } from "../config/db.js";
import { ApiError } from "../utils/apiError.js";

// Get Reps Dashboard
const getRepsDashboard = async (req, res, next) => {
  try {
    const clientDate = req.query.date ? new Date(req.query.date) : new Date();
    const userId = req.user.id;
    const now = new Date();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const startOfToday = new Date(clientDate);
    const endOfToday = new Date(clientDate);

    startOfToday.setUTCHours(0, 0, 0, 0);
    endOfToday.setUTCHours(23, 59, 59, 999);

    // 1. Get Rep and SubRegion
    const rep = await prisma.user.findUnique({
      where: { id: userId },
      include: { subRegion: true },
    });

    if (!rep) return res.status(404).json({ message: "Rep not found" });

    const userSubRegion = rep.subRegion?.name;

    // 2. Run EVERYTHING in parallel, including the optimized Sales query
    const [
      docCount,
      pharmCount,
      plans,
      completedVisits,
      pendingRequests,
      todayVisits,
      pharmacyNames, // We need names to filter sales
    ] = await Promise.all([
      prisma.doctor.count({ where: { subRegion: userSubRegion } }),
      prisma.pharmacy.count({ where: { subRegion: userSubRegion } }),
      prisma.plan.findMany({
        where: {
          createdById: userId,
          status: "APPROVED",
          startDate: { gte: startOfMonth, lte: endOfMonth },
        },
      }),
      prisma.visit.count({
        where: {
          userId: userId,
          date: { gte: startOfMonth, lte: endOfMonth },
          status: "COMPLETED",
        },
      }),
      prisma.request.findMany({ where: { userId, status: "PENDING" } }),
      prisma.visit.findMany({
        where: { userId: userId, date: { gte: startOfToday, lte: endOfToday } },
        include: {
          doctor: {
            select: { id: true, nameAR: true, nameEN: true, accountName: true },
          },
          createdBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      // Get only the names of pharmacies in this subregion
      prisma.pharmacy.findMany({
        where: { subRegion: userSubRegion },
        select: { name: true },
      }),
    ]);

    // 3. Optimized Sales Aggregation (Database-level)
    const namesArray = pharmacyNames.map((p) => p.name);

    const salesAggregate = await prisma.sales.aggregate({
      _sum: { untaxedTotal: true },
      where: {
        customer: { in: namesArray },
      },
    });

    const totalSales = salesAggregate._sum.untaxedTotal || 0;

    // 4. Metric Calculations
    const totalAccounts = docCount + pharmCount;
    const targetDoctorsPlanned = plans.reduce(
      (sum, p) => sum + (p.targetDoctors || 0),
      0,
    );
    const targetVisitsPlanned = plans.reduce(
      (sum, p) => sum + (p.targetVisits || 0),
      0,
    );

    const coverage =
      totalAccounts > 0
        ? ((targetDoctorsPlanned / totalAccounts) * 100).toFixed(2)
        : 0;
    const targetAchievement =
      targetVisitsPlanned > 0
        ? ((completedVisits / targetVisitsPlanned) * 100).toFixed(2)
        : 0;

    res.status(200).json({
      status: "success",
      data: {
        rep,
        metrics: {
          coverage: `${coverage}%`,
          targetAchievement: `${targetAchievement}%`,
          pendingRequestsCount: pendingRequests.length,
          pendingRequests,
          todayVisitsCount: todayVisits.length,
          todayVisits,
          totalSales,
        },
      },
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Error fetching dashboard data", 500));
  }
};

// Manager Dashboard
const getManagersDashboard = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Run independent queries in parallel
    const [
      salesAggregate,
      productSales,
      productNames,
      pharmacies,
      salesByCustomer,
      requests,
      pendingRequests,
      plans,
    ] = await Promise.all([
      // Total untaxed sales (Directly from DB)
      prisma.sales.aggregate({ _sum: { untaxedTotal: true } }),

      // Product performance (Total qty sold per product)
      prisma.sales.groupBy({
        by: ["productId"],
        _sum: { qtyOrdered: true, untaxedTotal: true },
      }),

      // Product names for mapping (Could be optimized with a join if needed)
      prisma.products.findMany({
        select: { id: true, name: true },
      }),

      // Regional Mapping
      prisma.pharmacy.findMany({ select: { name: true, region: true } }),

      // Customer Mapping
      prisma.sales.groupBy({
        by: ["customer"],
        _sum: { untaxedTotal: true },
      }),

      // Requests (Limit this if you don't need literally every single one)
      prisma.request.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
      prisma.request.count({ where: { status: "PENDING" } }),

      // Monthly Plans
      prisma.plan.findMany({
        where: { startDate: { gte: startOfMonth, lte: endOfMonth } },
      }),
    ]);

    // 1. Map Sales by Region (Logic remains in JS as it's a cross-table string link)
    const regionMap = Object.fromEntries(
      pharmacies.map((p) => [p.name, p.region]),
    );
    const salesByRegion = salesByCustomer.reduce((acc, sale) => {
      const region = regionMap[sale.customer] || "Unknown";
      acc[region] = (acc[region] || 0) + (sale._sum.untaxedTotal || 0);
      return acc;
    }, {});

    // 2. Format Product Performance
    const productPerformance = Object.fromEntries(
      productSales.map((p) => [
        productNames.find((n) => n.id === p.productId).name,
        p._sum.untaxedTotal,
      ]),
    );

    res.status(200).json({
      status: "success",
      data: {
        totalSales: salesAggregate._sum.untaxedTotal || 0,
        salesByRegion,
        productPerformance,
        requestsCount: requests.length,
        requests,
        pendingRequestsCount: pendingRequests,
        plansCount: plans.length,
        plans,
      },
    });
  } catch (error) {
    console.error(error);
    next(new ApiError("Error fetching manager dashboard data", 500));
  }
};

export { getRepsDashboard, getManagersDashboard };
