export function matchesMonthlyMarketingTerritory(doctor, territory) {
  const assignedTerritory = territory?.trim().toLowerCase();
  const doctorTerritory = (doctor.subRegion || doctor.area || "")
    .trim()
    .toLowerCase();
  return Boolean(assignedTerritory && doctorTerritory === assignedTerritory);
}
