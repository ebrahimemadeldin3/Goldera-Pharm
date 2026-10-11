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

const { createVisitPlanSchema, createSupervisorPlanSchema } = load(path.resolve(__dirname, "../lib/schemas/index.ts"));
test("plan schemas accept 10 visits and reject excess visits or fractional targets", () => {
  const payload = { planType: "WEEKLY", title: "Plan", startDate: new Date("2026-09-15"), endDate: new Date("2026-09-21"), description: "Plan", objectives: "Visit", targetVisits: 10, repId: "rep-a" };
  for (const schema of [createVisitPlanSchema, createSupervisorPlanSchema]) {
    for (const count of [10, 11, 12]) {
      const result = schema.safeParse({ ...payload, doctorsWithDates: Array.from({ length: count }, (_, i) => ({ doctorId: `doctor-${i}`, visitDate: new Date("2026-09-16") })) });
      assert.equal(result.success, count === 10);
    }
    assert.equal(schema.safeParse({ ...payload, targetVisits: 10.5, doctorsWithDates: [{ doctorId: "doctor", visitDate: new Date("2026-09-16") }] }).success, false);
  }
});

const { groupSelectedDoctorsByDay, calculatePlanCoverage, formatPlanCoverage } = load(path.resolve(__dirname, "../lib/utils/index.ts"));
test("plan display handles Arabic-only doctors and older snapshots missing names", () => {
  const groups = groupSelectedDoctorsByDay([
    { id: "arabic", nameEN: null, nameAR: "طبيب", visitDate: "2026-09-16" },
    { id: "older", visitDate: "2026-09-16" },
  ]);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].doctors.length, 2);
  assert.ok(groups[0].doctors.every(doctor => typeof doctor.nameEN === "string" && doctor.nameEN.length));
});

test("plan coverage boundary tests: zero doctors, zero target, partial, exact 100%, and capped over-allocation", () => {
  // Zero selected doctors must never be 100%
  assert.equal(calculatePlanCoverage(0, 10), 0);
  assert.equal(formatPlanCoverage(calculatePlanCoverage(0, 10)), "0%");

  // Zero target visits (safe zero denominator)
  assert.equal(calculatePlanCoverage(5, 0), 0);
  assert.equal(formatPlanCoverage(calculatePlanCoverage(5, 0)), "0%");

  // Both zero
  assert.equal(calculatePlanCoverage(0, 0), 0);
  assert.equal(formatPlanCoverage(calculatePlanCoverage(0, 0)), "0%");

  // Partial coverage (e.g. 5 of 10 = 50%, 3 of 7 = 43%)
  assert.equal(calculatePlanCoverage(5, 10), 50);
  assert.equal(formatPlanCoverage(calculatePlanCoverage(5, 10)), "50%");
  assert.equal(calculatePlanCoverage(3, 7), 43);
  assert.equal(formatPlanCoverage(calculatePlanCoverage(3, 7)), "43%");

  // Exact 100% coverage
  assert.equal(calculatePlanCoverage(10, 10), 100);
  assert.equal(formatPlanCoverage(calculatePlanCoverage(10, 10)), "100%");

  // Values that could exceed 100% are capped at 100%
  assert.equal(calculatePlanCoverage(15, 10), 100);
  assert.equal(formatPlanCoverage(calculatePlanCoverage(15, 10)), "100%");

  // Negative / null / undefined inputs
  assert.equal(calculatePlanCoverage(-1, 10), 0);
  assert.equal(calculatePlanCoverage(5, null), 0);
  assert.equal(calculatePlanCoverage(5, undefined), 0);
});

