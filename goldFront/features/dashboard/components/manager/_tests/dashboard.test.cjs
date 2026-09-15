/* eslint-disable @typescript-eslint/no-require-imports */
// Isolated test fixtures only. These records never enter the application data flow.
const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const root = path.resolve(__dirname, "../../../../..");
const manager = path.dirname(__dirname);

// Compile the local TS modules with the installed TypeScript, without another test dependency.
function createLoader(overrides = {}) {
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file);
    const compiledModule = { exports: {} };
    cache.set(file, compiledModule.exports);
    const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    }).outputText;
    const scopedRequire = (name) => {
      if (Object.hasOwn(overrides, name)) return overrides[name];
      if (name.endsWith(".module.css"))
        return new Proxy(
          {},
          { get: (_, key) => (key === "__esModule" ? false : String(key)) },
        );
      if (name.startsWith("@/") || name.startsWith(".")) {
        const base = name.startsWith("@/")
          ? path.join(root, name.slice(2))
          : path.resolve(path.dirname(file), name);
        const resolved = [
          base,
          `${base}.ts`,
          `${base}.tsx`,
          path.join(base, "index.ts"),
        ].find(
          (candidate) =>
            fs.existsSync(candidate) && fs.statSync(candidate).isFile(),
        );
        if (!resolved) throw new Error(`Cannot resolve ${name}`);
        return load(resolved);
      }
      return require(name);
    };
    new Function("require", "module", "exports", code)(
      scopedRequire,
      compiledModule,
      compiledModule.exports,
    );
    cache.set(file, compiledModule.exports);
    return compiledModule.exports;
  }
  return load;
}

const load = createLoader({
  "next/navigation": { useRouter: () => ({ refresh() {} }) },
});
const {
  summarizeDashboard,
  dateKey,
  periodBounds,
  finiteNumber,
  saleDate,
  money,
} = load(path.join(manager, "dashboard-utils.ts"));
const Dashboard = load(path.join(manager, "ManagerDashboard.tsx")).default;
const { DashboardSkeleton } = load(
  path.join(manager, "DashboardPrimitives.tsx"),
);
const empty = () => ({
  sales: { data: [], error: false },
  visits: { data: [], error: false },
  team: { data: [], error: false },
  coaching: { data: [], error: false },
  appraisals: { data: [], error: false },
  asOf: "2026-09-15T09:00:00Z",
});
const visit = (id, status, rest = {}) => ({
  id,
  status,
  date: "2026-09-15",
  time: "10:00",
  userId: "rep-a",
  doctor: { nameEN: "Doctor A" },
  ...rest,
});

test("Saudi day boundaries, Sunday weeks and leap months are independent of machine timezone", () => {
  assert.equal(dateKey("2026-08-31T21:30:00Z"), "2026-09-01");
  assert.equal(dateKey("2026-09-15"), "2026-09-15");
  assert.equal(dateKey("2026-02-30"), null);
  assert.equal(dateKey("not a date"), null);
  assert.deepEqual(periodBounds("today", "2026-08-31T21:30:00Z"), [
    "2026-09-01",
    "2026-09-01",
  ]);
  assert.deepEqual(periodBounds("week", "2026-09-15T09:00:00Z"), [
    "2026-09-13",
    "2026-09-19",
  ]);
  assert.deepEqual(periodBounds("month", "2024-02-15"), [
    "2024-02-01",
    "2024-02-29",
  ]);
  assert.deepEqual(periodBounds("year", "2026-09-15"), [
    "2026-01-01",
    "2026-12-31",
  ]);
  assert.equal(periodBounds("all", "2026-09-15"), null);
});

test("empty datasets never produce invalid percentages or quality scores", () => {
  const summary = summarizeDashboard(empty(), "month");
  assert.equal(summary.salesTotal, 0);
  assert.equal(summary.completionRate, null);
  assert.equal(summary.quality, null);
  assert.deepEqual(summary.trend, []);
  assert.deepEqual(summary.ranking, []);
});

test("sales use transaction dates, preserve negative amounts and disclose missing data", () => {
  const data = empty();
  data.sales.data = [
    { id: "a", orderDate: "2026-08-31T21:30:00Z", untaxedTotal: 200 },
    { id: "b", orderDate: "2026-09-15", untaxedTotal: -20 },
    { id: "c", createdAt: "2026-09-15", untaxedTotal: 50 },
    { id: "d", orderDate: "2026-09-15", untaxedTotal: null },
    { id: "e", orderDate: "2026-08-01", untaxedTotal: 30 },
  ];
  const summary = summarizeDashboard(data, "month");
  assert.equal(summary.salesTotal, 180);
  assert.equal(summary.missingAmounts, 1);
  assert.equal(summary.undatedSales, 1);
  assert.equal(
    summary.trend.reduce((sum, point) => sum + point.amount, 0),
    180,
  );
  assert.equal(summary.trend.length, 30);
  assert.equal(summarizeDashboard(data, "all").salesTotal, 260);
  assert.equal(saleDate(data.sales.data[2]), undefined);
});

test("all-time buckets include the first observed month and chronological recent records", () => {
  const data = empty();
  data.sales.data = [
    { id: "z", orderDate: "2026-09-15T09:00:00Z", untaxedTotal: 10 },
    { id: "a", orderDate: "2026-09-15T08:00:00Z", untaxedTotal: 5 },
    { id: "old", orderDate: "2026-01-25", untaxedTotal: 1 },
    { id: "unknown", untaxedTotal: 2 },
  ];
  const summary = summarizeDashboard(data, "all");
  assert.equal(summary.trend[0].key, "2026-01");
  assert.deepEqual(
    summary.recentSales.map((item) => item.id),
    ["z", "a", "old", "unknown"],
  );
});

test("rep ranking uses assignments, never the creator or inferred customer location", () => {
  const data = empty();
  data.team.data = [
    { id: "rep-a", name: "Rep A", role: "MEDICAL_REP", isActive: true },
    { id: "rep-b", name: "Rep B", role: "MEDICAL_REP", isActive: false },
    {
      id: "supervisor",
      name: "Supervisor",
      role: "SUPERVISOR",
      isActive: true,
    },
  ];
  data.visits.data = [
    visit("a", "COMPLETED", {
      userId: "supervisor",
      medicalRepId: "rep-b",
      createdBy: { id: "rep-a" },
    }),
    visit("b", "COMPLETED"),
    visit("c", "COMPLETED", { userId: "supervisor" }),
    visit("d", "CANCELLED"),
  ];
  const summary = summarizeDashboard(data, "month");
  assert.equal(summary.completed, 3);
  assert.equal(summary.completionRate, 75);
  assert.equal(summary.activeTeam, 2);
  assert.equal(summary.unassignedCompleted, 1);
  assert.deepEqual(
    summary.ranking.map((rep) => [rep.id, rep.count]),
    [
      ["rep-a", 1],
      ["rep-b", 1],
    ],
  );
});

test("coaching ratings are real, dated, validated and take precedence over appraisal", () => {
  const data = empty();
  data.coaching.data = [1, 2, 5, 0, 6, NaN, 2.5].map((rating, index) => ({
    id: String(index),
    visitDate: "2026-09-15",
    performanceRating: rating,
  }));
  data.coaching.data.push({
    id: "previous",
    visitDate: "2026-08-01",
    performanceRating: 5,
  });
  const summary = summarizeDashboard(data, "month");
  assert.equal(summary.quality.kind, "coaching");
  assert.equal(summary.quality.count, 3);
  assert.equal(summary.quality.average, 8 / 3);
  assert.equal(summary.lowRatings, 2);
  assert.equal(summary.invalidRatings, 4);
});

test("appraisal fallback requires every criterion and filters by appraisal period", () => {
  const data = empty();
  const scoreKeys = [
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
  const complete = {
    id: "a",
    period: "2026-09-01",
    ...Object.fromEntries(scoreKeys.map((key) => [key, 85])),
  };
  data.appraisals.data = [
    complete,
    { ...complete, id: "b", timing: null },
    { ...complete, id: "c", period: "2026-08-01" },
  ];
  const summary = summarizeDashboard(data, "month");
  assert.equal(summary.quality.kind, "appraisals");
  assert.equal(summary.quality.average, 85);
  assert.equal(summary.quality.count, 1);
  assert.equal(summary.invalidScores, 1);
});

test("upcoming activity is current, excludes cancelled visits and caps rows at six", () => {
  const data = empty();
  data.visits.data = [
    visit("old", "SCHEDULED", { date: "2026-09-14" }),
    visit("cancelled", "CANCELLED"),
    ...Array.from({ length: 8 }, (_, index) =>
      visit(`next-${index}`, "SCHEDULED", { date: `2026-09-${16 + index}` }),
    ),
  ];
  const summary = summarizeDashboard(data, "today");
  assert.equal(summary.upcoming.length, 6);
  assert.equal(summary.upcoming[0].id, "next-0");
  assert.equal(summary.pastScheduled, 1);
});

test("non-numeric business values are unavailable, not silently converted to zero", () => {
  for (const value of [
    undefined,
    null,
    "",
    " ",
    NaN,
    Infinity,
    -Infinity,
    false,
    {},
    "invalid",
  ])
    assert.equal(finiteNumber(value), null);
  assert.equal(finiteNumber("1,250.50"), 1250.5);
  assert.equal(finiteNumber(0), 0);
  assert.equal(money(Infinity), "Not available");
});

test("server render handles empty, partial error, populated and loading states", () => {
  const data = empty();
  let html = renderToStaticMarkup(React.createElement(Dashboard, { data }));
  assert.match(html, /No sales in this period/);
  assert.doesNotMatch(
    html,
    /Coaching Rating Distribution|NaN|Infinity|undefined/,
  );
  for (const route of [
    "visits",
    "coaching",
    "sales",
    "pharmacies",
    "team",
    "reports",
  ])
    assert.match(html, new RegExp(`href="/manager/${route}"`));
  data.sales.error = true;
  data.visits.data = [visit("today", "SCHEDULED")];
  html = renderToStaticMarkup(React.createElement(Dashboard, { data }));
  assert.match(html, /Unable to load sales data/);
  assert.match(html, /Doctor A/);
  assert.match(html, /Retry/);
  data.coaching.data = [
    { id: "review", visitDate: "2026-09-15", performanceRating: 5 },
  ];
  html = renderToStaticMarkup(React.createElement(Dashboard, { data }));
  assert.match(html, /Coaching Rating Distribution/);
  assert.match(html, /Quality review distribution/);
  assert.doesNotMatch(html, /NaN|Infinity|undefined/);
  assert.match(
    renderToStaticMarkup(React.createElement(DashboardSkeleton)),
    /Loading dashboard/,
  );
});

const apiLoader = createLoader({
  "server-only": {},
  "@/features/sales/api": {
    fetchSales: async () => {
      throw new Error("Test sales outage");
    },
  },
  "@/features/visits/api": {
    fetchAllVisits: async () => ({
      results: 1,
      data: [visit("real-visit", "SCHEDULED")],
    }),
  },
  "@/features/team/api": {
    getManagerTeam: async () => ({ results: 0, data: [] }),
  },
  "@/features/coaching/api": {
    getAllCoachingReports: async () => ({ results: 0, data: [] }),
  },
  "@/features/appraisal/api": {
    getAppraisals: async () => ({ results: 0, data: [] }),
  },
});
const { collectPages, loadDashboardData } = apiLoader(
  path.join(manager, "dashboard-data.ts"),
);

test("pagination honors server page caps and rejects repeated or incomplete pages", async () => {
  const calls = [];
  const rows = Array.from({ length: 5 }, (_, id) => ({ id: String(id) }));
  const actual = await collectPages(async (page, limit) => {
    calls.push([page, limit]);
    return {
      results: 5,
      data: rows.slice(
        (page - 1) * Math.min(limit, 2),
        page * Math.min(limit, 2),
      ),
    };
  });
  assert.equal(actual.length, 5);
  assert.deepEqual(calls, [
    [1, 200],
    [2, 2],
    [3, 2],
  ]);
  await assert.rejects(
    collectPages(async () => ({ results: 2, data: [{ id: "same" }] })),
    /Repeated page/,
  );
  await assert.rejects(
    collectPages(async (page) => ({
      results: 2,
      data: page === 1 ? [{ id: "first" }] : [],
    })),
    /Dataset changed/,
  );
});

test("a failed sales request does not discard successful visit data", async () => {
  const data = await loadDashboardData();
  assert.deepEqual(data.sales, { data: [], error: true });
  assert.equal(data.visits.error, false);
  assert.equal(data.visits.data[0].id, "real-visit");
  assert.equal(data.coaching.error, false);
});
