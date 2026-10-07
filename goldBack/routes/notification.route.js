import express from "express";
import { prisma } from "../config/db.js";
import { guard } from "../middlewares/auth.middleware.js";
import { userScope } from "../utils/validation.js";

const router = express.Router();
router.use(guard);
router.get("/", async (req, res, next) => {
  try {
    const reviewing = req.user.role !== "MEDICAL_REP";
    const prefix =
      req.user.role === "MANAGER"
        ? "/manager"
        : req.user.role === "SUPERVISOR"
          ? "/supervisor"
          : "/rep";
    const [requests, plans, forecasts, appraisals, coachings] =
      await Promise.all([
        prisma.request.findMany({
          where: reviewing
            ? {
                status: "PENDING",
                user: {
                  AND: [userScope(req.user), { id: { not: req.user.id } }],
                },
              }
            : { userId: req.user.id, status: { not: "PENDING" } },
          include: { user: { select: { name: true } } },
          orderBy: { updatedAt: "desc" },
          take: 20,
        }),
        prisma.plan.findMany({
          where: reviewing
            ? {
                status: "PENDING",
                createdBy: {
                  AND: [userScope(req.user), { id: { not: req.user.id } }],
                },
              }
            : { createdById: req.user.id, status: { not: "PENDING" } },
          orderBy: { updatedAt: "desc" },
          take: 20,
        }),
        prisma.forecast.findMany({
          where: reviewing
            ? { status: "PENDING", rep: userScope(req.user) }
            : { repId: req.user.id, status: { in: ["APPROVED", "REJECTED"] } },
          orderBy: { updatedAt: "desc" },
          take: 20,
        }),
        reviewing
          ? []
          : prisma.appraisal.findMany({
              where: { repId: req.user.id },
              orderBy: { updatedAt: "desc" },
              take: 10,
            }),
        reviewing
          ? []
          : prisma.coachingReport.findMany({
              where: { repId: req.user.id },
              orderBy: { updatedAt: "desc" },
              take: 10,
            }),
      ]);
    const item = (kind, record, title, message, href, type = "file") => ({
      id: `${kind}:${record.id}:${record.updatedAt.toISOString()}`,
      title,
      message,
      href,
      type,
      time: record.updatedAt.toISOString(),
      unread: true,
    });
    const notifications = [
      ...requests.map((r) =>
        item(
          "request",
          r,
          reviewing
            ? "Request awaiting review"
            : `Request ${r.status.toLowerCase()}`,
          reviewing
            ? `${r.user.name}: ${r.title}`
            : `${r.title}${r.response ? ` — ${r.response}` : ""}`,
          `${prefix}/requests`,
          r.status === "APPROVED"
            ? "success"
            : r.status === "REJECTED"
              ? "alert"
              : "file",
        ),
      ),
      ...plans.map((p) =>
        item(
          "plan",
          p,
          reviewing ? "Plan awaiting review" : `Plan ${p.status.toLowerCase()}`,
          p.title,
          `${prefix}/plan`,
          p.status === "APPROVED" ? "success" : "file",
        ),
      ),
      ...forecasts.map((f) =>
        item(
          "forecast",
          f,
          reviewing
            ? "Forecast awaiting review"
            : `Forecast ${f.status.toLowerCase()}`,
          f.supervisorFeedback || "Review the product forecast details.",
          `${prefix}/forecast`,
          f.status === "APPROVED" ? "success" : "file",
        ),
      ),
      ...appraisals.map((a) =>
        item(
          "appraisal",
          a,
          "Performance appraisal",
          a.feedbackComments ||
            "Your performance appraisal is available to review.",
          `${prefix}/appraisal`,
        ),
      ),
      ...coachings.map((c) =>
        item(
          "coaching",
          c,
          "Coaching review",
          c.recommendations,
          `${prefix}/coaching`,
        ),
      ),
    ]
      .sort((a, b) => b.time.localeCompare(a.time))
      .slice(0, 50);
    res.json({ status: "success", userId: req.user.id, data: notifications });
  } catch (error) {
    next(error);
  }
});
export default router;
