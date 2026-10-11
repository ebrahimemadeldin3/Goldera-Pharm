/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const frontend = path.resolve(__dirname, "../../..");
const cache = new Map();

function load(file) {
  if (cache.has(file)) return cache.get(file);
  const loadedModule = { exports: {} };
  cache.set(file, loadedModule.exports);
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;
  const resolve = (name) => {
    if (name.startsWith(".") || name.startsWith("@/")) {
      const base = name.startsWith("@/")
        ? path.join(frontend, name.slice(2))
        : path.resolve(path.dirname(file), name);
      const candidate = [
        base,
        `${base}.ts`,
        `${base}.tsx`,
        path.join(base, "index.ts"),
        path.join(base, "index.tsx"),
      ].find(
        (candidate) =>
          fs.existsSync(candidate) && fs.statSync(candidate).isFile(),
      );
      if (!candidate) throw new Error(`Cannot resolve ${name}`);
      return load(candidate);
    }
    return require(name);
  };
  new Function("require", "module", "exports", code)(
    resolve,
    loadedModule,
    loadedModule.exports,
  );
  cache.set(file, loadedModule.exports);
  return loadedModule.exports;
}

const { calculateForecastStats } = load(
  path.resolve(__dirname, "../lib/utils/index.ts"),
);
const { forecastStatsConfig } = load(
  path.resolve(__dirname, "../lib/constants/stats-config.ts"),
);

test("forecast stats calculates unique forecasted doctors across distributions", () => {
  const sampleForecasts = [
    {
      id: "fc-1",
      periodType: "MONTHLY",
      period: "October 2026",
      status: "APPROVED",
      totalUnitsPlanned: 120,
      doctorsCovered: 2,
      productsUsed: 3,
      totalDistribution: 120,
      products: [],
      distributions: [
        { doctorId: "doc-1", doctorName: "Dr. A", specialty: "Internal Medicine", hospital: "", allocations: [] },
        { doctorId: "doc-2", doctorName: "Dr. B", specialty: "Internal Medicine", hospital: "", allocations: [] },
      ],
      createdAt: "2026-10-01",
    },
    {
      id: "fc-2",
      periodType: "MONTHLY",
      period: "November 2026",
      status: "PENDING",
      totalUnitsPlanned: 60,
      doctorsCovered: 2,
      productsUsed: 2,
      totalDistribution: 60,
      products: [],
      distributions: [
        { doctorId: "doc-2", doctorName: "Dr. B", specialty: "Internal Medicine", hospital: "", allocations: [] },
        { doctorId: "doc-3", doctorName: "Dr. C", specialty: "Internal Medicine", hospital: "", allocations: [] },
      ],
      createdAt: "2026-10-05",
    },
  ];

  const stats = calculateForecastStats(sampleForecasts);

  // doc-1, doc-2, doc-3 -> 3 unique doctors forecasted
  assert.equal(stats.myDoctors, 3);
  assert.equal(stats.pendingApproval, 1);
  assert.equal(stats.totalAllocation, 180);
});

test("forecastStatsConfig labels the metric as Doctors Forecasted to avoid count confusion", () => {
  const doctorStatCard = forecastStatsConfig.find((card) => card.dataKey === "myDoctors");
  assert.ok(doctorStatCard);
  assert.equal(doctorStatCard.label, "Doctors Forecasted");
});

test("CreateForecastForm source code defaults selected product IDs to empty array", () => {
  const formCode = fs.readFileSync(
    path.resolve(__dirname, "../components/CreateForecastForm.tsx"),
    "utf8",
  );
  // Must NOT pre-select first 3 products
  assert.doesNotMatch(formCode, /productsResult\.data\.slice\(0,\s*3\)/);
  assert.match(formCode, /setSelectedProductIds\(\[\]\)/);
});
