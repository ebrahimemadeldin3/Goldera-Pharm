import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { prisma } from "../config/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const reportPath = path.resolve(
  __dirname,
  "../audit/doctor-facility-reconciliation-report.md",
);

function normalizeFacilityName(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

async function main() {
  const applyMode = process.argv.includes("--apply");

  const [doctors, accounts] = await Promise.all([
    prisma.doctor.findMany({
      where: { isActive: true },
      select: {
        id: true,
        nameEN: true,
        nameAR: true,
        accountName: true,
        accountsId: true,
      },
      orderBy: { id: "asc" },
    }),
    prisma.accounts.findMany({
      select: { id: true, name: true, subRegionId: true },
      orderBy: { id: "asc" },
    }),
  ]);

  const accountsByExactName = new Map();
  const accountsByNormalizedName = new Map();
  for (const acc of accounts) {
    const exact = String(acc.name || "").trim();
    if (!exact) continue;
    if (!accountsByExactName.has(exact)) accountsByExactName.set(exact, []);
    accountsByExactName.get(exact).push(acc);

    const norm = normalizeFacilityName(exact);
    if (!accountsByNormalizedName.has(norm))
      accountsByNormalizedName.set(norm, []);
    accountsByNormalizedName.get(norm).push(acc);
  }

  const duplicateAccountGroups = Array.from(
    accountsByNormalizedName.entries(),
  ).filter(([, list]) => list.length > 1);

  const stats = {
    totalActiveDoctors: doctors.length,
    totalAccounts: accounts.length,
    alreadyLinked: 0,
    legacyOnly: 0,
    missingFacilityData: 0,
    exactMatches: 0,
    uniqueNormalizedMatches: 0,
    ambiguousMatches: 0,
    unmatchedNames: 0,
    appliedLinks: 0,
    skipped: 0,
    failed: 0,
  };

  const unmatchedSamples = new Map();
  const ambiguousSamples = new Map();
  const toLink = [];

  for (const doc of doctors) {
    if (doc.accountsId) {
      stats.alreadyLinked += 1;
      stats.skipped += 1;
      continue;
    }

    const rawName = String(doc.accountName || "").trim();
    if (!rawName) {
      stats.missingFacilityData += 1;
      stats.skipped += 1;
      continue;
    }

    stats.legacyOnly += 1;

    const exactCandidates = accountsByExactName.get(rawName) || [];
    if (exactCandidates.length === 1) {
      stats.exactMatches += 1;
      toLink.push({ doctorId: doc.id, accountsId: exactCandidates[0].id });
      continue;
    }
    if (exactCandidates.length > 1) {
      stats.ambiguousMatches += 1;
      ambiguousSamples.set(
        rawName,
        (ambiguousSamples.get(rawName) || 0) + 1,
      );
      stats.skipped += 1;
      continue;
    }

    const normCandidates =
      accountsByNormalizedName.get(normalizeFacilityName(rawName)) || [];
    if (normCandidates.length === 1) {
      stats.uniqueNormalizedMatches += 1;
      toLink.push({ doctorId: doc.id, accountsId: normCandidates[0].id });
    } else if (normCandidates.length > 1) {
      stats.ambiguousMatches += 1;
      ambiguousSamples.set(
        rawName,
        (ambiguousSamples.get(rawName) || 0) + 1,
      );
      stats.skipped += 1;
    } else {
      stats.unmatchedNames += 1;
      unmatchedSamples.set(rawName, (unmatchedSamples.get(rawName) || 0) + 1);
      stats.skipped += 1;
    }
  }

  if (applyMode && toLink.length > 0) {
    for (const item of toLink) {
      try {
        await prisma.doctor.update({
          where: { id: item.doctorId },
          data: { accountsId: item.accountsId },
        });
        stats.appliedLinks += 1;
      } catch {
        stats.failed += 1;
      }
    }
  }

  const lines = [
    `# Doctor–Facility Reconciliation Report`,
    ``,
    `- Mode: **${applyMode ? "APPLY (write)" : "DRY-RUN (read-only)"}**`,
    `- Generated at: \`${new Date().toISOString()}\``,
    ``,
    `## Summary Counts`,
    ``,
    `| Metric | Count |`,
    `| --- | ---: |`,
    `| Active Doctors | ${stats.totalActiveDoctors} |`,
    `| Accounts (Facilities) in DB | ${stats.totalAccounts} |`,
    `| Already Linked (\`accountsId != null\`) | ${stats.alreadyLinked} |`,
    `| Legacy-Only (\`accountsId = null\`, \`accountName != null\`) | ${stats.legacyOnly} |`,
    `| Missing Facility Data (\`accountsId = null\`, empty \`accountName\`) | ${stats.missingFacilityData} |`,
    `| Exact Matches (safe to link) | ${stats.exactMatches} |`,
    `| Unique Normalized Matches (safe to link) | ${stats.uniqueNormalizedMatches} |`,
    `| Duplicate Account Name Groups in \`Accounts\` | ${duplicateAccountGroups.length} |`,
    `| Ambiguous Doctor Matches (manual review) | ${stats.ambiguousMatches} |`,
    `| Unmatched Legacy Facility Names (manual review) | ${stats.unmatchedNames} |`,
    `| Applied Links | ${stats.appliedLinks} |`,
    `| Skipped | ${stats.skipped} |`,
    `| Failed | ${stats.failed} |`,
    ``,
  ];

  if (unmatchedSamples.size > 0) {
    lines.push(`## Top Unmatched Legacy Facility Names (Sample)`, ``);
    for (const [name, count] of Array.from(unmatchedSamples.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)) {
      lines.push(`- \`${name}\` (${count} doctors)`);
    }
    lines.push(``);
  }

  if (ambiguousSamples.size > 0) {
    lines.push(`## Ambiguous Matches Requiring Manual Review`, ``);
    for (const [name, count] of Array.from(ambiguousSamples.entries())) {
      lines.push(`- \`${name}\` (${count} doctors)`);
    }
    lines.push(``);
  }

  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, lines.join("\n"), "utf8");
  console.log(JSON.stringify(stats, null, 2));
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
