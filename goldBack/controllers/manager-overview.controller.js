import { randomUUID } from "node:crypto";
import { prisma } from "../config/db.js";
import { buildDashboardScope } from "../utils/dashboard-scope.js";
import {
  dashboardVisits,
  dashboardSales,
  dashboardDirectory,
  dashboardTeam,
  dashboardCoaching,
  dashboardAppraisals,
  dashboardWorkflow,
} from "../utils/dashboard-sections.js";

export async function buildManagerOverview(
  db,
  actor,
  query = {},
  now = new Date(),
) {
  const scope = await buildDashboardScope(db, actor, query, now);
  const requestId = randomUUID();
  const loaders = {
    visits: dashboardVisits,
    sales: dashboardSales,
    directory: dashboardDirectory,
    team: dashboardTeam,
    coaching: dashboardCoaching,
    appraisals: dashboardAppraisals,
    workflow: dashboardWorkflow,
  };
  const entries = await Promise.all(
    Object.entries(loaders).map(async ([source, load]) => {
      try {
        return [
          source,
          {
            status: "ready",
            data: await db.$transaction((tx) => load(tx, scope), {
              isolationLevel: "RepeatableRead", maxWait: 15000, timeout: 20000,
            }),
            error: null,
          },
        ];
      } catch (error) {
        console.error("Manager dashboard section failed", {
          source,
          requestId,
          code: error.code ?? error.name ?? "QUERY_FAILED",
        });
        return [
          source,
          {
            status: "error",
            data: null,
            error: {
              source,
              code: error.code ?? "QUERY_FAILED",
              message: `Unable to load ${source} data. Please try again.`,
              requestId,
            },
          },
        ];
      }
    }),
  );
  return {
    generatedAt: now.toISOString(),
    requestId,
    range: {
      from: scope.range.from,
      to: scope.range.to,
      bucket: scope.range.bucket,
      timeZone: "Asia/Riyadh",
    },
    filters: {
      repId: scope.repId ?? "all",
      district: query.district ?? "all",
      regionId: query.regionId ?? "all",
      territoryId: query.territoryId ?? "all",
    },
    options: scope.options,
    sections: Object.fromEntries(entries),
  };
}
export async function getManagerOverview(req, res, next) {
  try {
    res
      .status(200)
      .json({
        status: "success",
        data: await buildManagerOverview(prisma, req.user, req.query),
      });
  } catch (error) {
    next(error);
  }
}
