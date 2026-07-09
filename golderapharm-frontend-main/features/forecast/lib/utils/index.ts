import { Forecast, Product } from "../types";
import { MOCK_PRODUCTS } from "../constants";

export type ForecastStats = {
  totalProducts: number;
  totalAllocation: number;
  myDoctors: number;
  pendingApproval: number;
};

export type ProductAllocationStats = Product & {
  allocated: number;
  remaining: number;
  percentage: number;
};

export type AllocationTotals = {
  totalUnitsPlanned: number;
  doctorsCovered: number;
  productsUsed: number;
};

/**
 * Calculate forecast statistics from forecast data
 * @param forecasts - Array of forecasts
 * @returns Stats object with totalProducts, totalAllocation, myDoctors, pendingApproval
 */
export function calculateForecastStats(forecasts: Forecast[]): ForecastStats {
  const totalProducts = MOCK_PRODUCTS.length;

  const totalAllocation = forecasts.reduce(
    (sum, f) => sum + (f.totalUnitsPlanned || 0),
    0,
  );

  const myDoctors = new Set(
    forecasts.flatMap((f) => f.distributions?.map((d) => d.doctorId) || []),
  ).size;

  const pendingApproval = forecasts.filter(
    (f) => f.status === "PENDING",
  ).length;

  return {
    totalProducts,
    totalAllocation,
    myDoctors,
    pendingApproval,
  };
}

/**
 * Calculate product allocation statistics
 * @param products - Array of products
 * @param allocations - Doctor-product allocations
 * @returns Array of products with allocation stats
 */
export function calculateProductStats(
  products: Product[],
  allocations: Record<string, Record<string, number>>,
): ProductAllocationStats[] {
  return products.map((product) => {
    const allocated = Object.values(allocations).reduce(
      (sum, doctorAlloc) => sum + (doctorAlloc[product.id] || 0),
      0,
    );
    return {
      ...product,
      allocated,
      remaining: product.totalUnits - allocated,
      percentage: (allocated / product.totalUnits) * 100,
    };
  });
}

/**
 * Calculate allocation totals
 * @param allocations - Doctor-product allocations
 * @returns Totals object with totalUnitsPlanned, doctorsCovered, productsUsed
 */
export function calculateAllocationTotals(
  allocations: Record<string, Record<string, number>>,
): AllocationTotals {
  const totalUnitsPlanned = Object.values(allocations).reduce(
    (sum, doctorAlloc) =>
      sum + Object.values(doctorAlloc).reduce((s, units) => s + units, 0),
    0,
  );

  const doctorsCovered = Object.keys(allocations).filter((doctorId) => {
    const doctorTotal = Object.values(allocations[doctorId]).reduce(
      (s, units) => s + units,
      0,
    );
    return doctorTotal > 0;
  }).length;

  const productsUsed = new Set(
    Object.values(allocations).flatMap((doctorAlloc) =>
      Object.keys(doctorAlloc).filter((prodId) => doctorAlloc[prodId] > 0),
    ),
  ).size;

  return {
    totalUnitsPlanned,
    doctorsCovered,
    productsUsed,
  };
}
