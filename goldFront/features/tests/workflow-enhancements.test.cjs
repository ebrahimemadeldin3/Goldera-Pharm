/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const frontRoot = path.resolve(__dirname, "../..");
const repoRoot = path.resolve(frontRoot, "..");

function loadTs(relPath) {
  const file = path.join(frontRoot, relPath);
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ModuleKind.ES2022,
      esModuleInterop: true,
    },
  }).outputText;
  const compiled = { exports: {} };
  const customRequire = (id) => {
    if (id.startsWith("@/")) {
      const target = id.slice(2);
      const tsPath = path.join(frontRoot, target + ".ts");
      const indexTsPath = path.join(frontRoot, target, "index.ts");
      if (fs.existsSync(tsPath)) return loadTs(target + ".ts");
      if (fs.existsSync(indexTsPath)) return loadTs(path.join(target, "index.ts"));
    }
    if (id.startsWith("./") || id.startsWith("../")) {
      const resolved = path.resolve(path.dirname(file), id);
      if (fs.existsSync(resolved + ".ts")) {
        return loadTs(path.relative(frontRoot, resolved + ".ts"));
      }
      if (fs.existsSync(path.join(resolved, "index.ts"))) {
        return loadTs(path.relative(frontRoot, path.join(resolved, "index.ts")));
      }
    }
    return require(id);
  };
  new Function("require", "module", "exports", code)(
    customRequire,
    compiled,
    compiled.exports,
  );
  return compiled.exports;
}

test("Six-day weekly plan configuration & Friday exclusion", () => {
  const {
    WORKING_WEEK_DAYS,
    getWeeklyPlanWorkingDays,
    isSaudiFriday,
  } = loadTs("features/plan/lib/working-week.ts");
  const { createVisitPlanSchema } = loadTs("features/plan/lib/schemas/index.ts");

  assert.equal(WORKING_WEEK_DAYS, 6);
  const days = getWeeklyPlanWorkingDays("2026-11-14");
  assert.equal(days.length, 6);
  assert.equal(days.some((d) => isSaudiFriday(d)), false);

  // Reject Friday in weekly plan schema
  const fridayRes = createVisitPlanSchema.safeParse({
    planType: "WEEKLY",
    title: "Week 1",
    startDate: new Date("2026-11-14"),
    endDate: new Date("2026-11-19"),
    doctorsWithDates: [{ doctorId: "doc-1", visitDate: new Date("2026-11-20") }], // Friday
    targetVisits: 5,
  });
  assert.equal(fridayRes.success, false);
});

test("Visit schemas, full-day 15-min time slots, and 15-min durations", () => {
  const { HOURS, VISIT_DURATION_OPTIONS, VISIT_COMPANION_LABELS } = loadTs(
    "features/visits/lib/constants/index.ts",
  );
  const { medicalRepVisitSchema, historicalVisitSchema } = loadTs(
    "features/visits/lib/schemas/index.ts",
  );

  assert.equal(HOURS[0], "00:00");
  assert.equal(HOURS[HOURS.length - 1], "23:45");
  assert.equal(HOURS.length, 96);
  assert.ok(VISIT_DURATION_OPTIONS.includes("15 min"));
  assert.ok(VISIT_DURATION_OPTIONS.includes("45 min"));
  assert.equal(VISIT_COMPANION_LABELS.SINGLE, "Single Visit");
  assert.equal(VISIT_COMPANION_LABELS.WITH_MANAGER, "Joint Visit");

  // Joint Visit requires accompanyingManagerId
  const jointMissingMgr = medicalRepVisitSchema.safeParse({
    doctorId: "doc-1",
    date: new Date("2026-11-18"),
    time: "23:59",
    duration: "45 min",
    companionType: "WITH_MANAGER",
    accompanyingManagerId: "",
  });
  assert.equal(jointMissingMgr.success, false);

  const jointValid = historicalVisitSchema.safeParse({
    doctorId: "doc-1",
    date: new Date("2026-11-17"),
    time: "23:45",
    duration: "45 min",
    companionType: "WITH_MANAGER",
    accompanyingManagerId: "mgr-1",
    rating: 5,
    visitPurpose: "Follow-up",
    discussedTopics: ["Product efficacy"],
  });
  assert.equal(jointValid.success, true);
});

test("Forecast schema supports DOCTOR and PHARMACY target types", () => {
  const { createForecastSchema } = loadTs("features/forecast/lib/schemas/index.ts");

  const validPharmacyForecast = createForecastSchema.safeParse({
    targetType: "PHARMACY",
    periodType: "MONTHLY",
    month: "november",
    year: 2026,
    distributions: [
      {
        doctorId: "pharmacy-1",
        allocations: [{ productId: "prod-1", units: 25 }],
      },
    ],
  });
  assert.equal(validPharmacyForecast.success, true);
});

test("Monthly Marketing request schema validates doctor, positive SAR amount, and description", () => {
  const { submitRequestSchema } = loadTs("features/requests/lib/schemas/index.ts");

  const valid = submitRequestSchema.safeParse({
    title: "Monthly Marketing Request",
    subject: "Monthly Marketing",
    description: "Q4 cardiology CME sponsorship",
    type: "MONTHLY_MARKETING",
    urgency: "medium",
    doctorIds: ["doc-1"],
    budget: 1500.5,
  });
  assert.equal(valid.success, true);

  const zeroAmount = submitRequestSchema.safeParse({
    title: "Monthly Marketing Request",
    subject: "Monthly Marketing",
    description: "Q4 cardiology CME sponsorship",
    type: "MONTHLY_MARKETING",
    urgency: "medium",
    doctorIds: ["doc-1"],
    budget: 0,
  });
  assert.equal(zeroAmount.success, false);
});

test("Centralized SAR currency formatter and zero remaining EGP references", () => {
  const { formatSAR, CURRENCY_CODE, CURRENCY_LABEL_AR } = loadTs(
    "lib/utils/currency.ts",
  );
  assert.equal(CURRENCY_CODE, "SAR");
  assert.equal(CURRENCY_LABEL_AR, "ر.س");
  assert.equal(formatSAR(1250.5), "SAR 1,250.5");
  assert.match(formatSAR(100, { locale: "ar" }), /ر\.س/);

  // Scan source directories for any remaining user-facing EGP / Egyptian Pound references
  const scanDirs = [
    path.join(frontRoot, "app"),
    path.join(frontRoot, "features"),
    path.join(frontRoot, "components"),
    path.join(frontRoot, "lib"),
    path.join(repoRoot, "goldBack", "controllers"),
    path.join(repoRoot, "goldBack", "routes"),
    path.join(repoRoot, "goldBack", "utils"),
  ];

  const violations = [];
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name === ".next") continue;
        walk(full);
      } else if (/\.(ts|tsx|js|mjs)$/.test(entry.name)) {
        const content = fs.readFileSync(full, "utf8");
        if (/\bEGP\b|Egyptian Pound/i.test(content)) {
          violations.push(full);
        }
      }
    }
  }
  scanDirs.forEach(walk);
  assert.deepEqual(violations, []);
});
