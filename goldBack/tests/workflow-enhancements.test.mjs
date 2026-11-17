import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import {
  WORKING_WEEK_DAYS,
  getSaudiDateKey,
  getSaudiWeekdayIndex,
  isSaudiFriday,
  getWeeklyWorkingDayKeys,
  getSaudiDayBounds,
} from "../utils/working-week.js";
import {
  assertPastOrCurrentSaudiDateTime,
  buildVisitReportDateFilter,
  validateCompanionSelection,
  validateVisitDuration,
  validateVisitTime,
} from "../utils/visit-validation.js";
import {
  buildMarketingDoctorWhere,
  mapMarketingDoctorOption,
  validateMarketingDoctorQuery,
} from "../utils/marketing-doctors.js";
import { computeForecastCardSummary } from "../utils/forecast-summary.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

test("1. Six-day weekly plan generates Sat-Thu and excludes Friday across boundaries", () => {
  assert.equal(WORKING_WEEK_DAYS, 6);

  // Normal Sat-Thu week (2026-11-14 is Saturday, 2026-11-19 is Thursday)
  const normal = getWeeklyWorkingDayKeys("2026-11-14");
  assert.deepEqual(normal, [
    "2026-11-14",
    "2026-11-15",
    "2026-11-16",
    "2026-11-17",
    "2026-11-18",
    "2026-11-19",
  ]);
  assert.equal(normal.some((d) => isSaudiFriday(d)), false);

  // Crossing two months (Oct 31, 2026 is Saturday -> Nov 5, 2026 is Thursday)
  const crossMonth = getWeeklyWorkingDayKeys("2026-10-31");
  assert.equal(crossMonth.length, 6);
  assert.equal(crossMonth[0], "2026-10-31");
  assert.equal(crossMonth[5], "2026-11-05");
  assert.equal(crossMonth.some((d) => isSaudiFriday(d)), false);

  // Crossing two years (Dec 28, 2026 Monday -> skips Fri Jan 1, 2027 -> ends Sun Jan 3, 2027)
  const crossYear = getWeeklyWorkingDayKeys("2026-12-28");
  assert.deepEqual(crossYear, [
    "2026-12-28",
    "2026-12-29",
    "2026-12-30",
    "2026-12-31",
    "2027-01-02",
    "2027-01-03",
  ]);
  assert.equal(isSaudiFriday("2027-01-01"), true);

  // Leap year (Feb 26, 2024 Monday -> includes Feb 29, skips Fri Mar 1 -> ends Mar 3)
  const leapYear = getWeeklyWorkingDayKeys("2024-02-26");
  assert.deepEqual(leapYear, [
    "2024-02-26",
    "2024-02-27",
    "2024-02-28",
    "2024-02-29",
    "2024-03-02",
    "2024-03-03",
  ]);
  assert.equal(getSaudiWeekdayIndex("2024-03-01"), 5); // Friday
});

test("2. Historical Add Visit rejects future Saudi date/times and accepts past/current", () => {
  const fixedNow = new Date("2026-11-18T12:00:00.000+03:00");

  // Past date accepted
  const past = assertPastOrCurrentSaudiDateTime("2026-11-17", "23:45", fixedNow);
  assert.equal(past.dateKey, "2026-11-17");
  assert.equal(past.time, "23:45");

  // Current date & exact current time accepted
  const current = assertPastOrCurrentSaudiDateTime("2026-11-18", "12:00", fixedNow);
  assert.equal(current.dateKey, "2026-11-18");

  // Future time on same Saudi day rejected
  assert.throws(
    () => assertPastOrCurrentSaudiDateTime("2026-11-18", "12:15", fixedNow),
    /future date or time/i,
  );

  // Future date rejected
  assert.throws(
    () => assertPastOrCurrentSaudiDateTime("2026-11-19", "09:00", fixedNow),
    /future date or time/i,
  );
});

test("3. Visit companionType validates SINGLE vs WITH_MANAGER", () => {
  assert.deepEqual(validateCompanionSelection("SINGLE", null), {
    companionType: "SINGLE",
    accompanyingManagerId: null,
  });

  assert.deepEqual(validateCompanionSelection("WITH_MANAGER", "mgr-123"), {
    companionType: "WITH_MANAGER",
    accompanyingManagerId: "mgr-123",
  });

  assert.throws(
    () => validateCompanionSelection("WITH_MANAGER", ""),
    /Accompanying manager is required/i,
  );

  assert.throws(
    () => validateCompanionSelection("INVALID", null),
    /Invalid visit companion type/i,
  );
});

test("4. Visit time and duration support full-day 00:00-23:59 and 15-min increments", () => {
  assert.equal(validateVisitTime("00:00"), "00:00");
  assert.equal(validateVisitTime("23:45"), "23:45");
  assert.equal(validateVisitTime("23:59"), "23:59");
  assert.throws(() => validateVisitTime("24:00"), /00:00 and 23:59/);
  assert.throws(() => validateVisitTime("17:60"), /00:00 and 23:59/);

  assert.equal(validateVisitDuration("15 min"), "15 min");
  assert.equal(validateVisitDuration("45 min"), "45 min");
  assert.equal(validateVisitDuration(120), "120 min");
  assert.throws(() => validateVisitDuration("10 min"), /multiple of 15/i);
  assert.throws(() => validateVisitDuration("20"), /multiple of 15/i);
});

test("5. Marketing target doctors query builder, search, relational facility filter, and deduplication", () => {
  const q = validateMarketingDoctorQuery({
    search: "  Ahmed  ",
    facilityId: "acc-1",
    page: "2",
    limit: "15",
  });
  assert.equal(q.search, "Ahmed");
  assert.equal(q.facilityId, "acc-1");
  assert.equal(q.page, 2);
  assert.equal(q.limit, 15);
  assert.equal(q.skip, 15);

  const where = buildMarketingDoctorWhere(q);
  assert.equal(where.AND[0].isActive, true);
  assert.ok(where.AND.some((cond) => Array.isArray(cond.OR)));

  assert.throws(
    () => validateMarketingDoctorQuery({ page: "0" }),
    /positive integer/,
  );

  const mapped = mapMarketingDoctorOption({
    id: "doc-1",
    nameEN: "Dr. Ahmed",
    nameAR: "د. أحمد",
    specialty: "Cardiology",
    accountsId: "acc-1",
    accountName: "King Faisal Hospital",
    accounts: { id: "acc-1", name: "King Faisal Hospital" },
  });
  // Deduplicates matching relational account and legacy accountName
  assert.equal(mapped.facilities.length, 1);
  assert.equal(mapped.facilities[0].id, "acc-1");
  assert.equal(mapped.facilities[0].name, "King Faisal Hospital");
});

test("6. Reports date filtering handles Saudi timezone boundaries and invalid ranges", () => {
  const sameDay = buildVisitReportDateFilter({
    fromDate: "2026-11-18",
    toDate: "2026-11-18",
  });
  assert.equal(
    sameDay.gte.toISOString(),
    new Date("2026-11-18T00:00:00.000+03:00").toISOString(),
  );
  assert.equal(
    sameDay.lte.toISOString(),
    new Date("2026-11-18T23:59:59.999+03:00").toISOString(),
  );

  const bounds = getSaudiDayBounds("2026-12-31");
  assert.equal(bounds.key, "2026-12-31");

  assert.throws(
    () =>
      buildVisitReportDateFilter({
        fromDate: "2026-11-20",
        toDate: "2026-11-18",
      }),
    /fromDate cannot be after toDate/i,
  );
});

test("7. Prisma schema and migration include all required enums and backward-compatible defaults", () => {
  const schema = fs.readFileSync(
    path.join(rootDir, "prisma/schema.prisma"),
    "utf8",
  );
  assert.match(schema, /enum VisitCompanionType/);
  assert.match(schema, /enum VisitCreationSource/);
  assert.match(schema, /enum ForecastTargetType/);
  assert.match(schema, /MONTHLY_MARKETING/);

  const migrationSql = fs.readFileSync(
    path.join(
      rootDir,
      "prisma/migrations/20261118000800_rep_workflow_enhancements/migration.sql",
    ),
    "utf8",
  );
  assert.match(migrationSql, /CREATE TYPE "VisitCompanionType"/);
  assert.match(migrationSql, /CREATE TYPE "ForecastTargetType"/);
  assert.match(migrationSql, /ALTER TYPE "RequestType" ADD VALUE 'MONTHLY_MARKETING'/);
});

test("8. Forecast card summary computes top 3 products, SAR value, warnings, and comparison", () => {
  const summary = computeForecastCardSummary(
    {
      id: "f-2",
      targetType: "PHARMACY",
      periodDate: "2026-11-30",
      rep: {
        subRegion: { name: "Jeddah", region: { name: "Western" } },
        manager: { name: "Tariq Al-Manager" },
      },
      productForecasts: [
        { productId: "p1", productName: "Rizona 20 mg", productUnits: 160, pharmacyId: "ph1", pharmacyName: "Al Nahdi Pharmacy" },
        { productId: "p2", productName: "Gastrozol", productUnits: 120, pharmacyId: "ph2", pharmacyName: "Al Dawaa Pharmacy" },
        { productId: "p3", productName: "Cardiovex", productUnits: 80, pharmacyId: "ph1", pharmacyName: "Al Nahdi Pharmacy" },
        { productId: "p4", productName: "ExtraMed", productUnits: 40, pharmacyId: "ph3", pharmacyName: "United Pharmacy" },
      ],
    },
    {
      priceByProductId: new Map([
        ["p1", 100],
        ["p2", 50],
        ["p3", 25],
        ["p4", 10],
      ]),
      previousForecast: {
        id: "f-1",
        periodDate: "2026-10-31",
        productForecasts: [
          { productId: "p1", productName: "Rizona 20 mg", productUnits: 200, pharmacyId: "ph1" },
        ],
      },
    },
  );

  assert.equal(summary.repTerritory, "Jeddah");
  assert.equal(summary.managerName, "Tariq Al-Manager");
  assert.equal(summary.productCount, 4);
  assert.equal(summary.accountCount, 3);
  assert.equal(summary.totalUnits, 400);
  assert.equal(summary.estimatedValueSAR, 24400);
  assert.equal(summary.topProducts.length, 3);
  assert.equal(summary.topProducts[0].productName, "Rizona 20 mg");
  assert.equal(summary.extraProductsCount, 1);
  assert.equal(summary.comparison.quantityChangePct, 100);
  assert.equal(summary.comparison.accountCountDiff, 2);
  assert.equal(summary.warnings.length, 0);

  // Missing price returns null estimatedValueSAR; zero accounts/products emits warnings
  const emptySummary = computeForecastCardSummary(
    {
      id: "f-3",
      targetType: "DOCTOR",
      productForecasts: [
        { productName: "Unpriced Product", productUnits: 0, doctorName: "Unassigned doctor" },
      ],
    },
    {},
  );
  assert.equal(emptySummary.estimatedValueSAR, null);
  assert.equal(emptySummary.comparison, null);
  assert.ok(emptySummary.warnings.some((w) => w.code === "ZERO_ALLOCATION_ROWS"));
  assert.ok(emptySummary.warnings.some((w) => w.code === "NO_TARGET_ACCOUNTS"));
});
