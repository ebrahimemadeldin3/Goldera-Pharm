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

const { mapAppraisalToReview, formatAcknowledgedAt } = load(
  path.resolve(__dirname, "../lib/utils.ts"),
);

const baseAppraisal = {
  id: "appraisal-1",
  repId: "rep-1",
  managerId: "mgr-1",
  period: "2026-10-01T00:00:00.000Z",
  presentationSkills: 80,
  sellingSkills: 85,
  reporting: 75,
  productInformation: 90,
  competitorsInformation: 80,
  organizationalValueAwareness: 85,
  properUtilizationOfResources: 80,
  reliabilityAndCredibility: 85,
  independenceAndJudgment: 80,
  teamSpirit: 90,
  personalDrive: 85,
  creativityAndInitiative: 80,
  broadProspective: 75,
  communicationSkills: 85,
  planningAndOrganizing: 80,
  appearance: 90,
  attitude: 90,
  timing: 85,
  feedbackComments: "Strong quarter performance",
  createdAt: "2026-10-02T10:00:00.000Z",
  updatedAt: "2026-10-02T10:00:00.000Z",
  rep: {
    id: "rep-1",
    name: "Ahmed Rep",
    email: "ahmed@example.com",
    role: "MEDICAL_REP",
    phone: null,
    department: "Sales",
    location: "Riyadh",
    subRegionId: "sub-1",
    iqamaNumber: null,
  },
  manager: {
    id: "mgr-1",
    name: "Sara Manager",
    email: "sara@example.com",
  },
};

test("Appraisal acknowledgement with comment persists repComment in mapped review", () => {
  const acknowledgedAppraisal = {
    ...baseAppraisal,
    acknowledged: true,
    acknowledgedAt: "2026-10-11T12:30:00.000Z",
    acknowledgementComment: "Thank you for the constructive feedback, will focus on timing.",
  };

  const review = mapAppraisalToReview(acknowledgedAppraisal);

  assert.equal(review.id, "appraisal-1");
  assert.equal(review.acknowledged, true);
  assert.equal(review.acknowledgedAt, "2026-10-11T12:30:00.000Z");
  assert.equal(
    review.repComment,
    "Thank you for the constructive feedback, will focus on timing.",
  );
  assert.equal(review.managerName, "Sara Manager");
  assert.equal(review.name, "Ahmed Rep");
});

test("Appraisal acknowledgement without comment handles null repComment cleanly", () => {
  const acknowledgedAppraisal = {
    ...baseAppraisal,
    acknowledged: true,
    acknowledgedAt: "2026-10-11T12:30:00.000Z",
    acknowledgementComment: null,
  };

  const review = mapAppraisalToReview(acknowledgedAppraisal);

  assert.equal(review.acknowledged, true);
  assert.equal(review.acknowledgedAt, "2026-10-11T12:30:00.000Z");
  assert.equal(review.repComment, null);
});

test("Appraisal acknowledgement preserves comment across refresh", () => {
  const refreshedAppraisal = {
    ...baseAppraisal,
    acknowledged: true,
    acknowledgedAt: "2026-10-11T12:30:00.000Z",
    acknowledgementComment: "Persisted across refresh",
    repComment: null,
    employeeComment: null,
  };

  const review = mapAppraisalToReview(refreshedAppraisal);
  assert.equal(review.repComment, "Persisted across refresh");
});

test("Manager visibility mapping exposes acknowledgement status, timestamp, rep name and response", () => {
  const appraisalForManager = {
    ...baseAppraisal,
    acknowledged: true,
    acknowledgedAt: "2026-10-11T14:00:00.000Z",
    acknowledgementComment: "I agree with the Q4 goals.",
  };

  const review = mapAppraisalToReview(appraisalForManager);
  assert.equal(review.name, "Ahmed Rep");
  assert.equal(review.managerName, "Sara Manager");
  assert.equal(review.acknowledged, true);
  assert.equal(review.repComment, "I agree with the Q4 goals.");

  const formattedTime = formatAcknowledgedAt(review.acknowledgedAt);
  assert.ok(typeof formattedTime === "string" && formattedTime.length > 0);
});
