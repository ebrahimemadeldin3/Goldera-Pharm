function getTargetAccountKey(item) {
  return (
    item.pharmacyId ||
    item.doctorId ||
    item.targetId ||
    item.pharmacyName ||
    item.doctorName ||
    item.targetName ||
    ""
  )
    .toString()
    .trim();
}

function getProductKey(item) {
  return (item.productId || item.productName || "").toString().trim();
}

export function computeForecastCardSummary(
  forecast,
  { priceByProductId = new Map(), priceByProductName = new Map(), previousForecast = null } = {},
) {
  const rows = Array.isArray(forecast.productForecasts)
    ? forecast.productForecasts
    : [];

  const productTotals = new Map();
  const accountSet = new Set();
  let totalUnits = 0;
  let zeroAllocationRows = 0;
  let unassignedAccountRows = 0;
  let allPricesAvailable = rows.length > 0;
  let estimatedValueSAR = 0;

  for (const row of rows) {
    const units = Number(row.productUnits ?? row.quantity ?? 0);
    const productName = (row.productName || "Unknown Product").toString().trim();
    const productKey = getProductKey(row) || productName;
    const accountKey = getTargetAccountKey(row);

    if (
      !accountKey ||
      /^unassigned (doctor|pharmacy)$/i.test(accountKey) ||
      /^unknown (doctor|pharmacy)$/i.test(accountKey)
    ) {
      unassignedAccountRows += 1;
    } else {
      accountSet.add(accountKey);
    }

    if (!Number.isFinite(units) || units <= 0) {
      zeroAllocationRows += 1;
    } else {
      totalUnits += units;
    }

    const existing = productTotals.get(productKey) || {
      productId: row.productId || null,
      productName,
      units: 0,
    };
    existing.units += Number.isFinite(units) && units > 0 ? units : 0;
    productTotals.set(productKey, existing);

    const price =
      (row.productId ? priceByProductId.get(row.productId) : undefined) ??
      priceByProductName.get(productName.toLowerCase());
    if (typeof price === "number" && Number.isFinite(price) && price > 0) {
      estimatedValueSAR += (Number.isFinite(units) && units > 0 ? units : 0) * price;
    } else {
      allPricesAvailable = false;
    }
  }

  const sortedProducts = Array.from(productTotals.values()).sort(
    (a, b) => b.units - a.units || a.productName.localeCompare(b.productName),
  );
  const topProducts = sortedProducts.slice(0, 3);
  const extraProductsCount = Math.max(0, sortedProducts.length - 3);

  const warnings = [];
  if (sortedProducts.length === 0) {
    warnings.push({
      code: "NO_PRODUCTS",
      message: "No product allocations are included in this forecast.",
      count: 0,
    });
  }
  if (accountSet.size === 0) {
    warnings.push({
      code: "NO_TARGET_ACCOUNTS",
      message:
        forecast.targetType === "PHARMACY"
          ? "No pharmacy accounts are assigned to this forecast."
          : "No doctors are assigned to this forecast.",
      count: 0,
    });
  }
  if (zeroAllocationRows > 0) {
    warnings.push({
      code: "ZERO_ALLOCATION_ROWS",
      message: `${zeroAllocationRows} ${zeroAllocationRows === 1 ? "allocation row has" : "allocation rows have"} zero units.`,
      count: zeroAllocationRows,
    });
  }
  if (unassignedAccountRows > 0) {
    warnings.push({
      code: "UNASSIGNED_ACCOUNTS",
      message: `${unassignedAccountRows} ${unassignedAccountRows === 1 ? "row is" : "rows are"} missing a target account.`,
      count: unassignedAccountRows,
    });
  }

  let comparison = null;
  if (previousForecast) {
    const prevRows = Array.isArray(previousForecast.productForecasts)
      ? previousForecast.productForecasts
      : [];
    const prevUnits = prevRows.reduce(
      (sum, r) => sum + Math.max(0, Number(r.productUnits ?? r.quantity ?? 0)),
      0,
    );
    const prevAccounts = new Set(
      prevRows.map(getTargetAccountKey).filter(Boolean),
    ).size;

    const quantityChangePct =
      prevUnits > 0
        ? Math.round(((totalUnits - prevUnits) / prevUnits) * 100)
        : null;
    const accountCountDiff = accountSet.size - prevAccounts;

    comparison = {
      previousForecastId: previousForecast.id,
      previousPeriodDate: previousForecast.periodDate,
      previousUnits: prevUnits,
      quantityChangePct,
      accountCountDiff,
    };
  }

  return {
    repTerritory:
      forecast.rep?.subRegion?.name ||
      forecast.rep?.location ||
      null,
    repRegion: forecast.rep?.subRegion?.region?.name || null,
    managerName: forecast.rep?.manager?.name || null,
    productCount: sortedProducts.length,
    accountCount: accountSet.size,
    totalUnits,
    estimatedValueSAR: allPricesAvailable
      ? Math.round(estimatedValueSAR * 100) / 100
      : null,
    topProducts,
    extraProductsCount,
    comparison,
    warnings,
  };
}
