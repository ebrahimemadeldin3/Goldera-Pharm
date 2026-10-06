/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

function load(file) {
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const compiled = { exports: {} };
  new Function("require", "module", "exports", code)(require, compiled, compiled.exports);
  return compiled.exports;
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

const { groupSelectedDoctorsByDay } = load(path.resolve(__dirname, "../lib/utils/index.ts"));
test("plan display handles Arabic-only doctors and older snapshots missing names", () => {
  const groups = groupSelectedDoctorsByDay([
    { id: "arabic", nameEN: null, nameAR: "طبيب", visitDate: "2026-09-16" },
    { id: "older", visitDate: "2026-09-16" },
  ]);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].doctors.length, 2);
  assert.ok(groups[0].doctors.every(doctor => typeof doctor.nameEN === "string" && doctor.nameEN.length));
});
