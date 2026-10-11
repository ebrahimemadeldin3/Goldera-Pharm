/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");

test("Medical Rep Settings route does not redirect to /rep and renders settings sections", () => {
  const repSettingsPath = path.resolve(
    __dirname,
    "../../../app/(dashboard)/rep/settings/page.tsx",
  );
  const code = fs.readFileSync(repSettingsPath, "utf8");

  // Must NOT redirect away from settings
  assert.doesNotMatch(code, /redirect\(\s*["']\/rep["']\s*\)/);

  // Must render settings sections
  assert.match(code, /<Notifications\s*\/>/);
  assert.match(code, /<Preferences\s*\/>/);
  assert.match(code, /<SecurityPrivacy\s*\/>/);
  assert.match(code, /<DataManagement\s*\/>/);
  assert.match(code, /Settings & Preferences/);
});
