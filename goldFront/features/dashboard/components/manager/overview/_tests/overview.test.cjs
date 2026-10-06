/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const frontend = path.resolve(__dirname, "../../../../../..");
const source = path.dirname(__dirname);
const fixture = JSON.parse(
  fs.readFileSync(
    path.join(
      frontend,
      "../audit/2026-10-06/manager-redesign/overview-fixture.json",
    ),
    "utf8",
  ),
);
const cache = new Map();
function load(file) {
  if (cache.has(file)) return cache.get(file);
  const module = { exports: {} };
  cache.set(file, module.exports);
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;
  const resolve = (name) => {
    if (name === "next/link")
      return {
        __esModule: true,
        default: ({ children, ...props }) =>
          React.createElement("a", props, children),
      };
    if (name.endsWith(".module.css"))
      return {
        __esModule: true,
        default: new Proxy({}, { get: (_target, key) => String(key) }),
      };
    if (name === "./api" && file.endsWith("ManagerOverviewDashboard.tsx"))
      return {
        getManagerOverview: async () => {
          throw new Error("SSR should never refetch");
        },
      };
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
    module,
    module.exports,
  );
  cache.set(file, module.exports);
  return module.exports;
}
const Dashboard = load(
  path.join(source, "ManagerOverviewDashboard.tsx"),
).default;
const { periodDates, percentage, money } = load(path.join(source, "format.ts"));
const render = (initial) =>
  renderToStaticMarkup(
    React.createElement(Dashboard, { initial, now: "2026-10-06T00:00:00Z" }),
  );
const sectionError = (source) => ({
  status: "error",
  data: null,
  error: {
    source,
    code: "QA_FAILURE",
    requestId: "qa-reference",
    message: `Unable to load ${source} data.`,
  },
});

test("overview renders API-backed values, meaningful navigation and real filter options", () => {
  const html = render({ success: true, data: fixture });
  assert.match(html, /Performance overview/);
  assert.match(html, /Current team approval queue/);
  assert.match(html, /Riyadh 1/);
  assert.match(html, /Jeddah 1/);
  assert.match(html, /href="\/manager\/visits\/add"/);
  assert.match(html, /Team snapshot/);
  assert.doesNotMatch(html, /NaN|Infinity|undefined/);
});
test("an unavailable source stays unavailable while successful appraisal data still renders", () => {
  const data = structuredClone(fixture);
  data.sections.coaching = sectionError("coaching");
  data.sections.visits = sectionError("visits");
  const html = render({ success: true, data });
  assert.match(html, /Retry unavailable data/);
  assert.match(html, /Completed visits: data unavailable/);
  assert.doesNotMatch(html, /Completed visits: 0/);
  assert.match(html, /Average appraisal score/);
  assert.match(html, /80/);
  assert.match(html, /SAR/);
});
test("global fetch failure gives recovery without fabricated zero metrics", () => {
  const html = render({
    success: false,
    error: { message: "Connection unavailable", code: "FETCH_ERROR" },
  });
  assert.match(html, /The dashboard could not be loaded/);
  assert.match(html, /Retry/);
  assert.doesNotMatch(html, /Sales revenue:|Doctor directory: 0|NaN|Infinity/);
});
test("expired sessions have a sign-in recovery action", () => {
  const html = render({
    success: false,
    error: { message: "Expired", code: "AUTH_ERROR", statusCode: 401 },
  });
  assert.match(html, /Your session expired/);
  assert.match(html, /Sign in again/);
});
test("calendar presets follow Saudi dates and Sunday-start weeks", () => {
  assert.deepEqual(periodDates("today", "2026-10-05T21:30:00Z"), {
    from: "2026-10-06",
    to: "2026-10-06",
  });
  assert.deepEqual(periodDates("week", "2026-10-06T00:00:00Z"), {
    from: "2026-10-04",
    to: "2026-10-10",
  });
  assert.deepEqual(periodDates("month", "2024-02-15T00:00:00Z"), {
    from: "2024-02-01",
    to: "2024-02-29",
  });
  assert.deepEqual(periodDates("quarter", "2026-10-06T00:00:00Z"), {
    from: "2026-10-01",
    to: "2026-12-31",
  });
  assert.equal(percentage(null), "—");
  assert.match(money(150.25, true), /150\.25/);
  assert.match(money(-150.25), /150\.25/);
});
