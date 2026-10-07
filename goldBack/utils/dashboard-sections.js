import { Prisma } from "@prisma/client";
import { geographyKey } from "./dashboard-scope.js";

const count = (row) => row._count._all;
const dateWhere = (range) => ({ gte: range.start, lt: range.end });
const pct = (part, total) => (total > 0 ? (part / total) * 100 : null);
export function fillDashboardTrend(rows, range, keys) {
  const values = new Map(rows.map((row) => [row.date, row]));
  const result = [];
  const start = new Date(`${range.from}T00:00:00Z`);
  if (range.bucket === "month") start.setUTCDate(1);
  const end = new Date(`${range.to}T00:00:00Z`);
  for (
    let cursor = start;
    cursor <= end;
    range.bucket === "month"
      ? cursor.setUTCMonth(cursor.getUTCMonth() + 1)
      : cursor.setUTCDate(cursor.getUTCDate() + 1)
  ) {
    const date = cursor.toISOString().slice(0, 10);
    result.push({
      date,
      ...Object.fromEntries(
        keys.map((key) => [key, Number(values.get(date)?.[key] ?? 0)]),
      ),
    });
  }
  return result;
}
const customerSql = (customers) =>
  customers.length
    ? Prisma.sql`"customer" IN (${Prisma.join(customers)})`
    : Prisma.sql`FALSE`;
const actorSql = (ids) =>
  ids.length
    ? Prisma.sql`v."userId" IN (${Prisma.join(ids)})`
    : Prisma.sql`FALSE`;
const territorySql = (scope) =>
  !scope.geographicFilter
    ? Prisma.sql`TRUE`
    : scope.visitDoctorNames.length
      ? Prisma.sql`d."subRegion" IN (${Prisma.join(scope.visitDoctorNames)})`
      : Prisma.sql`FALSE`;
const name = (doctor) => doctor.nameAR || doctor.nameEN || "Unnamed doctor";
const visitRow = (row) => ({
  id: row.id,
  date: row.date,
  time: row.time,
  status: row.status,
  doctorId: row.doctor.id,
  doctor: name(row.doctor),
  territory: row.doctor.subRegion,
  repId: row.userId,
  rep: row.createdBy.name,
});
const visitSelect = {
  id: true,
  date: true,
  time: true,
  status: true,
  userId: true,
  doctor: { select: { id: true, nameAR: true, nameEN: true, subRegion: true } },
  createdBy: { select: { name: true } },
};

export async function dashboardVisits(db, scope) {
  const { range } = scope;
  const where = { ...scope.visitBaseWhere, date: dateWhere(range) };
  const upcomingWhere = {
    ...scope.visitBaseWhere,
    status: "SCHEDULED",
    date: { gte: range.todayStart },
  };
  const [
    statuses,
    byRep,
    trend,
    covered,
    overdue,
    upcomingCount,
    upcoming,
    recent,
    territoryActivity,
  ] = await Promise.all([
    db.visit.groupBy({ by: ["status"], where, _count: { _all: true } }),
    db.visit.groupBy({
      by: ["userId", "status"],
      where,
      _count: { _all: true },
    }),
    db.$queryRaw(
      Prisma.sql`SELECT to_char(date_trunc(${range.bucket}, (v."date" AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Riyadh'), 'YYYY-MM-DD') AS date, count(*)::integer AS total, (count(*) FILTER (WHERE v.status = 'COMPLETED'))::integer AS completed FROM "Visit" v JOIN "Doctor" d ON d.id = v."doctorId" WHERE v."date" >= ${range.start} AND v."date" < ${range.end} AND ${actorSql(scope.actorIds)} AND ${territorySql(scope)} GROUP BY 1 ORDER BY 1`,
    ),
    db.visit.findMany({
      where: {
        ...where,
        status: "COMPLETED",
        doctor: { ...(where.doctor ?? {}), ...scope.directoryWhere },
      },
      select: { doctorId: true },
      distinct: ["doctorId"],
    }),
    db.visit.count({
      where: {
        ...scope.visitBaseWhere,
        status: "SCHEDULED",
        date: { lt: range.todayStart },
      },
    }),
    db.visit.count({ where: upcomingWhere }),
    db.visit.findMany({
      where: upcomingWhere,
      select: visitSelect,
      orderBy: [{ date: "asc" }, { time: "asc" }, { id: "asc" }],
      take: 6,
    }),
    db.visit.findMany({
      where,
      select: visitSelect,
      orderBy: [{ date: "desc" }, { id: "desc" }],
      take: 6,
    }),
    db.$queryRaw(
      Prisma.sql`SELECT d."subRegion" AS name, count(*)::integer AS total, (count(*) FILTER (WHERE v.status = 'COMPLETED'))::integer AS completed FROM "Visit" v JOIN "Doctor" d ON d.id = v."doctorId" WHERE v."date" >= ${range.start} AND v."date" < ${range.end} AND ${actorSql(scope.actorIds)} AND ${territorySql(scope)} GROUP BY d."subRegion"`,
    ),
  ]);
  const counts = Object.fromEntries(
    statuses.map((row) => [row.status, count(row)]),
  );
  const total = statuses.reduce((sum, row) => sum + count(row), 0);
  return {
    total,
    completed: counts.COMPLETED ?? 0,
    scheduled: counts.SCHEDULED ?? 0,
    cancelled: counts.CANCELLED ?? 0,
    completionRate: pct(counts.COMPLETED ?? 0, total),
    statuses: statuses.map((row) => ({
      status: row.status,
      count: count(row),
    })),
    byRep: byRep.map((row) => ({
      id: row.userId,
      status: row.status,
      count: count(row),
    })),
    trend: fillDashboardTrend(trend, range, ["total", "completed"]),
    coveredDoctors: covered.length,
    overdue,
    upcomingCount,
    upcoming: upcoming.map(visitRow),
    recent: recent.map(visitRow),
    byTerritory: territoryActivity.map((row) => {
      const matches = scope.allTerritories.filter(
        (territory) => geographyKey(territory.name) === geographyKey(row.name),
      );
      return { id: matches.length === 1 ? matches[0].id : null, name: row.name, total: row.total, completed: row.completed };
    }),
  };
}

export async function dashboardSales(db, scope) {
  const { range, salesWhere: where } = scope;
  const geographicCondition = scope.geographicFilter
    ? customerSql(scope.salesCustomers)
    : Prisma.sql`TRUE`;
  const [totals, trend, products, recent, unmapped] = await Promise.all([
    db.sales.aggregate({
      where,
      _count: { _all: true },
      _sum: { untaxedTotal: true, qtyOrdered: true },
    }),
    db.$queryRaw(
      Prisma.sql`SELECT to_char(date_trunc(${range.bucket}, ("orderDate" AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Riyadh'), 'YYYY-MM-DD') AS date, sum("untaxedTotal")::double precision AS amount FROM "Sales" WHERE "orderDate" >= ${range.start} AND "orderDate" < ${range.end} AND ${geographicCondition} GROUP BY 1 ORDER BY 1`,
    ),
    db.sales.groupBy({
      by: ["productId"],
      where,
      _sum: { untaxedTotal: true, qtyOrdered: true },
      _count: { _all: true },
      orderBy: { _sum: { untaxedTotal: "desc" } },
      take: 5,
    }),
    db.sales.findMany({
      where,
      select: {
        id: true,
        customer: true,
        orderDate: true,
        qtyOrdered: true,
        untaxedTotal: true,
        product: { select: { id: true, name: true } },
      },
      orderBy: [{ orderDate: "desc" }, { id: "desc" }],
      take: 6,
    }),
    db.sales.count({
      where: {
        orderDate: dateWhere(range),
        customer: { notIn: [...new Set(scope.allUniqueSalesCustomers)] },
      },
    }),
  ]);
  const productNames = await db.products.findMany({
    where: { id: { in: products.map((row) => row.productId) } },
    select: { id: true, name: true },
  });
  return {
    total: totals._sum.untaxedTotal ?? 0,
    quantity: totals._sum.qtyOrdered ?? 0,
    records: totals._count._all,
    currency: "SAR",
    trend: fillDashboardTrend(trend, range, ["amount"]),
    products: products.map((row) => ({
      id: row.productId,
      name:
        productNames.find((product) => product.id === row.productId)?.name ??
        "Product unavailable",
      amount: row._sum.untaxedTotal ?? 0,
      quantity: row._sum.qtyOrdered ?? 0,
    })),
    recent: recent.map((row) => ({
      id: row.id,
      customer: row.customer,
      date: row.orderDate,
      product: row.product.name,
      amount: row.untaxedTotal,
      quantity: row.qtyOrdered,
    })),
    scope: scope.geographicFilter
      ? "Sales for uniquely matched pharmacy territories"
      : "All company sales",
    representativeFilterApplied: false,
    unmatchedRecords: unmapped,
    ambiguousAccounts:
      scope.salesPharmacies.length - scope.salesCustomers.length,
  };
}

export async function dashboardDirectory(db, scope) {
  const where = scope.directoryWhere;
  const [total, active, missingEmail, missingPhone, specialties, facilities] =
    await Promise.all([
      db.doctor.count({ where }),
      db.doctor.count({ where: { ...where, isActive: true } }),
      db.doctor.count({
        where: { ...where, OR: [{ email: null }, { email: "" }] },
      }),
      db.doctor.count({
        where: { ...where, OR: [{ phone: null }, { phone: "" }] },
      }),
      db.doctor.groupBy({
        by: ["specialty"],
        where,
        _count: { _all: true },
        orderBy: { _count: { id: "desc" } },
        take: 5,
      }),
      db.doctor.groupBy({
        by: ["accountName"],
        where: { ...where, accountName: { not: null, notIn: [""] } },
        _count: { _all: true },
      }),
    ]);
  const territories = scope.selectedTerritories.filter(
    (territory) =>
      !scope.repId ||
      scope.members.some((member) => member.subRegionId === territory.id),
  );
  const coverage = territories.map((territory) => ({
    id: territory.id,
    name: territory.name,
    region: territory.regionName,
    district: territory.district,
    reps: scope.members
      .filter(
        (member) =>
          member.role === "MEDICAL_REP" && member.subRegionId === territory.id,
      )
      .map((member) => ({ id: member.id, name: member.name })),
  }));
  return {
    doctors: total,
    activeDoctors: active,
    pharmacies: scope.directoryPharmacies.length,
    facilities: facilities.length,
    missingEmail,
    missingPhone,
    missingCity: scope.directoryPharmacies.filter((row) => !row.city?.trim())
      .length,
    specialties: specialties.map((row) => ({
      name: row.specialty || "Unspecified",
      count: count(row),
    })),
    coverage,
    unassignedTerritories: coverage.filter((row) => !row.reps.length).length,
    scope: scope.directoryFiltered
      ? "Current directory in the selected assignment"
      : "Current company directory",
  };
}

export async function dashboardTeam(_db, scope) {
  const recentCutoff = new Date(
    scope.range.todayStart.getTime() - 7 * 86400000,
  );
  const mapMember = (member) => ({
    id: member.id,
    name: member.name,
    role: member.role,
    active: member.isActive,
    supervisor:
      scope.allMembers.find(
        (supervisor) => supervisor.id === member.supervisorId,
      )?.name ?? null,
    territories: scope
      .memberTerritories(member)
      .map((territory) => territory.name),
    territoryIds: scope
      .memberTerritories(member)
      .map((territory) => territory.id),
    lastLogin: member.lastLogin,
    leaveDays: member.leaveDaysCountTotal,
    inCurrentScope: scope.members.some((current) => current.id === member.id),
  });
  const members = scope.members.map(mapMember);
  const performanceMembers = scope.allMembers
    .filter((member) => member.role === "MEDICAL_REP" && (!scope.repId || member.id === scope.repId))
    .map(mapMember);
  const reps = members.filter((member) => member.role === "MEDICAL_REP");
  return {
    members,
    performanceMembers,
    total: members.length,
    active: members.filter((member) => member.active).length,
    reps: reps.length,
    supervisors: members.filter((member) => member.role === "SUPERVISOR")
      .length,
    missingTerritory: reps.filter((member) => !member.territories.length)
      .length,
    recentLogins: reps.filter(
      (member) =>
        member.active &&
        member.lastLogin &&
        new Date(member.lastLogin) >= recentCutoff &&
        new Date(member.lastLogin) < new Date(scope.range.todayStart.getTime() + 86400000),
    ).length,
    leaveDays: members.some((member) => member.leaveDays === null)
      ? null
      : members.reduce((sum, member) => sum + member.leaveDays, 0),
  };
}

export const APPRAISAL_FIELDS = [
  "presentationSkills",
  "sellingSkills",
  "reporting",
  "productInformation",
  "competitorsInformation",
  "organizationalValueAwareness",
  "properUtilizationOfResources",
  "reliabilityAndCredibility",
  "independenceAndJudgment",
  "teamSpirit",
  "personalDrive",
  "creativityAndInitiative",
  "broadProspective",
  "communicationSkills",
  "planningAndOrganizing",
  "appearance",
  "attitude",
  "timing",
];
export async function dashboardCoaching(db, scope) {
  const where = {
    repId: { in: scope.scopedIds },
    visitDate: dateWhere(scope.range),
  };
  const validWhere = { ...where, performanceRating: { gte: 1, lte: 5 } };
  const [scores, distribution, byRep, accepted, lowRatings, total, recent] =
    await Promise.all([
      db.coachingReport.aggregate({
        where: validWhere,
        _avg: { performanceRating: true },
        _count: { _all: true },
      }),
      db.coachingReport.groupBy({
        by: ["performanceRating"],
        where: validWhere,
        _count: { _all: true },
        orderBy: { performanceRating: "asc" },
      }),
      db.coachingReport.groupBy({
        by: ["repId"],
        where: validWhere,
        _avg: { performanceRating: true },
        _count: { _all: true },
      }),
      db.coachingReport.count({ where: { ...where, repAccepted: true } }),
      db.coachingReport.count({
        where: { ...validWhere, performanceRating: { gte: 1, lte: 2 } },
      }),
      db.coachingReport.count({ where }),
      db.coachingReport.findMany({
        where,
        select: {
          id: true,
          visitDate: true,
          performanceRating: true,
          rep: { select: { name: true } },
        },
        orderBy: [{ visitDate: "desc" }, { id: "desc" }],
        take: 6,
      }),
    ]);
  return {
    total,
    scored: scores._count._all,
    average: scores._avg.performanceRating,
    accepted,
    followUps: total - accepted,
    lowRatings,
    excluded: total - scores._count._all,
    distribution: distribution.map((row) => ({
      rating: row.performanceRating,
      count: count(row),
    })),
    byRep: byRep.map((row) => ({
      id: row.repId,
      average: row._avg.performanceRating,
      count: count(row),
    })),
    recent: recent.map((row) => ({
      id: row.id,
      date: row.visitDate,
      employee: row.rep.name,
      rating: row.performanceRating,
    })),
  };
}
export async function dashboardAppraisals(db, scope) {
  const where = {
    repId: { in: scope.scopedIds },
    period: dateWhere(scope.range),
  };
  const validWhere = {
    ...where,
    AND: APPRAISAL_FIELDS.map((field) => ({ [field]: { gte: 0, lte: 100 } })),
  };
  const criteriaSql = Prisma.join(
    APPRAISAL_FIELDS.map(
      (field) => Prisma.sql`${Prisma.raw('"' + field + '"')} BETWEEN 0 AND 100`,
    ),
    " AND ",
  );
  const scoreSql = Prisma.join(
    APPRAISAL_FIELDS.map((field) => Prisma.raw('"' + field + '"')),
    " + ",
  );
  const repsSql = scope.scopedIds.length
    ? Prisma.sql`"repId" IN (${Prisma.join(scope.scopedIds)})`
    : Prisma.sql`FALSE`;
  const [scores, total, bands, recent] = await Promise.all([
    db.appraisal.aggregate({
      where: validWhere,
      _avg: Object.fromEntries(APPRAISAL_FIELDS.map((field) => [field, true])),
      _count: { _all: true },
    }),
    db.appraisal.count({ where }),
    db.$queryRaw(
      Prisma.sql`SELECT CASE WHEN score < 70 THEN 'Below 70' WHEN score < 80 THEN '70–79' WHEN score < 90 THEN '80–89' ELSE '90–100' END AS label, count(*)::integer AS count FROM (SELECT (${scoreSql}) / 18.0 AS score FROM "Appraisal" WHERE "period" >= ${scope.range.start} AND "period" < ${scope.range.end} AND ${repsSql} AND ${criteriaSql}) scored GROUP BY 1 ORDER BY 1`,
    ),
    db.appraisal.findMany({
      where,
      select: {
        id: true,
        period: true,
        acknowledged: true,
        rep: { select: { name: true } },
      },
      orderBy: [{ period: "desc" }, { id: "desc" }],
      take: 6,
    }),
  ]);
  return {
    total,
    scored: scores._count._all,
    average: scores._count._all
      ? APPRAISAL_FIELDS.reduce((sum, field) => sum + scores._avg[field], 0) /
        APPRAISAL_FIELDS.length
      : null,
    excluded: total - scores._count._all,
    distribution: bands,
    recent: recent.map((row) => ({
      id: row.id,
      date: row.period,
      employee: row.rep.name,
      acknowledged: row.acknowledged,
    })),
  };
}

export async function dashboardWorkflow(db, scope) {
  const requestWhere = {
    userId: { in: scope.workflowIds },
    createdAt: dateWhere(scope.range),
  };
  const planWhere = {
    createdById: { in: scope.scopedIds },
    startDate: dateWhere(scope.range),
  };
  const [
    requests,
    pendingRequests,
    pendingPlans,
    plans,
    approvedPlans,
    recentRequests,
    recentPlans,
  ] = await Promise.all([
    db.request.groupBy({
      by: ["status"],
      where: requestWhere,
      _count: { _all: true },
    }),
    db.request.count({
      where: { userId: { in: scope.scopedIds }, status: "PENDING" },
    }),
    db.plan.count({
      where: { createdById: { in: scope.scopedIds }, status: "PENDING" },
    }),
    db.plan.groupBy({
      by: ["status"],
      where: planWhere,
      _count: { _all: true },
    }),
    db.plan.findMany({
      where: { ...planWhere, status: "APPROVED" },
      select: { id: true, createdById: true, targetVisits: true },
    }),
    db.request.findMany({
      where: requestWhere,
      select: {
        id: true,
        title: true,
        status: true,
        type: true,
        createdAt: true,
        user: { select: { name: true } },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 6,
    }),
    db.plan.findMany({
      where: planWhere,
      select: {
        id: true,
        title: true,
        status: true,
        startDate: true,
        createdBy: { select: { name: true } },
      },
      orderBy: [{ startDate: "desc" }, { id: "desc" }],
      take: 6,
    }),
  ]);
  const completed = await db.visit.groupBy({
    by: ["userId"],
    where: {
      planId: { in: approvedPlans.map((plan) => plan.id) },
      status: "COMPLETED",
    },
    _count: { _all: true },
  });
  const repIds = [...new Set(approvedPlans.map((plan) => plan.createdById))];
  const byRep = repIds.map((id) => ({
    id,
    target: approvedPlans
      .filter((plan) => plan.createdById === id)
      .reduce((sum, plan) => sum + plan.targetVisits, 0),
    completed: completed.find((row) => row.userId === id)?._count._all ?? 0,
  }));
  const target = byRep.reduce((sum, rep) => sum + rep.target, 0);
  const done = byRep.reduce((sum, rep) => sum + rep.completed, 0);
  return {
    requests: requests.map((row) => ({
      status: row.status,
      count: count(row),
    })),
    plans: plans.map((row) => ({ status: row.status, count: count(row) })),
    pendingRequests,
    pendingPlans,
    target,
    completed: done,
    achievement: pct(done, target),
    byRep,
    recentRequests: recentRequests.map((row) => ({
      id: row.id,
      title: row.title,
      status: row.status,
      type: row.type,
      date: row.createdAt,
      employee: row.user.name,
    })),
    recentPlans: recentPlans.map((row) => ({
      id: row.id,
      title: row.title,
      status: row.status,
      date: row.startDate,
      employee: row.createdBy.name,
    })),
  };
}
