"use server";

import { apiFetch } from "@/services/http";
import { ApiError } from "@/services/api-error";
import { ForecastStatus, Specialty } from "@/lib/types";
import {
  formatDateOnly,
  formatSaudiMonthYear,
  getSaudiDateParts,
  parseDateValue,
  buildPaginationQuery,
} from "@/lib/utils";
import {
  Forecast,
  CreateForecastDto,
  Product,
  Doctor,
  GetForecastsResponse,
  CreateForecastApiDto,
  CreateForecastApiResponse,
  ForecastApiResponse,
  GetProductsResponse,
  ProductApiResponse,
  GetDoctorsResponse,
  DoctorApiResponse,
} from "../lib/types";
import { fetchProducts as fetchProductsFromStore } from "@/features/products/api";
import { MOCK_DOCTORS, MOCK_FORECASTS } from "../lib/constants";
import { CreateForecastFormValues } from "../lib/schemas";

// NOTE: These functions currently use dummy data
// When backend is ready, replace implementations with actual API calls using apiFetch

/**
 * Map backend doctor to UI Doctor type
 */
function mapDoctorApiToDoctor(apiDoctor: DoctorApiResponse): Doctor {
  return {
    id: apiDoctor.id,
    name: apiDoctor.nameEN || apiDoctor.nameAR,
    specialty: (apiDoctor.specialty as Specialty) || "Internal Medicine",
    hospital: apiDoctor.accountName || "Unknown Hospital",
  };
}

/**
 * Map backend product to UI Product type
 * Derives category from internalRef and sets default totalUnits
 */
function mapProductApiToProduct(apiProduct: ProductApiResponse): Product {
  // Extract category from internalRef (e.g., P01xx -> Category 1, P02xx -> Category 2)
  let category = "General";
  if (apiProduct.internalRef) {
    const categoryCode = apiProduct.internalRef.substring(1, 3);
    const categoryMap: Record<string, string> = {
      "01": "Topical Care",
      "02": "Nutritional Supplements",
      "03": "Healthcare",
    };
    category = categoryMap[categoryCode] || "General";
  }

  return {
    id: apiProduct.id,
    name: apiProduct.name,
    category,
    totalUnits: 10000, // Default high inventory limit
    internalRef: apiProduct.internalRef,
    salesPrice: apiProduct.salesPrice,
  };
}

/**
 * Prepare form data for API submission
 * Converts allocations object to backend API format
 */
function prepareSubmissionData(
  formData: CreateForecastFormValues & {
    allocations: Record<string, Record<string, number>>;
  },
  doctors: Doctor[],
  products: Product[],
): CreateForecastApiDto {
  // Calculate period date (last day of month or quarter)
  let periodDate: string;
  if (formData.periodType === "MONTHLY" && formData.month) {
    const monthIndex = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ].indexOf(formData.month.toLowerCase());
    const date = new Date(formData.year, monthIndex + 1, 0); // Last day of month
    periodDate = formatDateOnly(date);
  } else if (formData.periodType === "QUARTERLY" && formData.quarter) {
    const quarterMonth = parseInt(formData.quarter.replace("Q", "")) * 3 - 1;
    const date = new Date(formData.year, quarterMonth + 1, 0); // Last day of quarter's last month
    periodDate = formatDateOnly(date);
  } else {
    periodDate = formatDateOnly(new Date(formData.year, 0, 31));
  }

  // Transform allocations to productForecasts array
  const productForecasts: CreateForecastApiDto["productForecasts"] = [];

  Object.entries(formData.allocations).forEach(([doctorId, doctorAlloc]) => {
    const doctor = doctors.find((d) => d.id === doctorId);
    const doctorName = doctor?.name || "Unknown Doctor";

    Object.entries(doctorAlloc).forEach(([productId, units]) => {
      if (units > 0) {
        const product = products.find((p) => p.id === productId);
        const productName = product?.name || "Unknown Product";

        productForecasts.push({
          productName,
          productUnits: units,
          doctorName,
        });
      }
    });
  });

  return {
    periodType: formData.periodType === "MONTHLY" ? "Monthly" : "Quarterly",
    periodDate,
    productForecasts,
    notes: formData.notes || undefined,
  };
}

/**
 * Map backend API response to UI Forecast type
 */
function mapApiForecastToForecast(apiForecast: ForecastApiResponse): Forecast {
  // Ensure productForecasts is an array (default to empty array if undefined)
  const productForecasts = apiForecast.productForecasts || [];

  // Group product forecasts by doctor
  const doctorMap = new Map<string, { products: typeof productForecasts }>();
  productForecasts.forEach((pf) => {
    if (!doctorMap.has(pf.doctorName)) {
      doctorMap.set(pf.doctorName, { products: [] });
    }
    doctorMap.get(pf.doctorName)!.products.push(pf);
  });

  // Calculate stats
  const totalUnitsPlanned = productForecasts.reduce(
    (sum, pf) => sum + pf.productUnits,
    0,
  );
  const doctorsCovered = doctorMap.size;
  const productsUsed = new Set(productForecasts.map((pf) => pf.productName))
    .size;

  // Parse period for display
  const date = parseDateValue(apiForecast.periodDate);
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const { year: saudiYear, month: saudiMonth } = getSaudiDateParts(date);
  const monthIndex = Number(saudiMonth) - 1;
  const month = monthNames[monthIndex].toLowerCase();
  const year = Number(saudiYear);

  // Safely determine period type (default to Monthly if not specified)
  const isMonthly =
    !apiForecast.periodType || apiForecast.periodType === "Monthly";
  const period = isMonthly
    ? formatSaudiMonthYear(date)
    : `Q${Math.ceil(Number(saudiMonth) / 3)} ${year}`;

  // Map status to ForecastStatus type
  const statusMap: Record<string, ForecastStatus> = {
    PENDING: "PENDING",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
  };
  const status = apiForecast.status
    ? statusMap[apiForecast.status.toUpperCase()] || "PENDING"
    : "PENDING";

  return {
    id: apiForecast.id,
    periodType: isMonthly ? "MONTHLY" : "QUARTERLY",
    period,
    month: isMonthly ? month : undefined,
    quarter: !isMonthly ? `Q${Math.ceil(Number(saudiMonth) / 3)}` : undefined,
    year,
    status,
    totalUnitsPlanned,
    doctorsCovered,
    productsUsed,
    totalDistribution: totalUnitsPlanned,
    products: [],
    distributions: Array.from(doctorMap.entries()).map(
      ([doctorName, data]) => ({
        doctorId: "",
        doctorName,
        specialty: "Internal Medicine" as Specialty,
        hospital: "",
        allocations: data.products.map((pf) => ({
          productId: "",
          units: pf.productUnits,
        })),
      }),
    ),
    notes: apiForecast.notes || undefined,
    createdAt: apiForecast.createdAt,
  };
}

/**
 * Fetch all forecasts for current user from backend API
 */
export async function fetchMyForecasts(
  page?: number,
  limit?: number,
): Promise<{
  data: { results: number; data: Forecast[] };
}> {
  const response = await apiFetch<GetForecastsResponse>(
    `/api/forecasts${buildPaginationQuery({ page, limit })}`,
    {
      method: "GET",
    },
  );

  const forecasts = response.data.map(mapApiForecastToForecast);

  return {
    data: {
      results: response.results,
      data: forecasts,
    },
  };
}

/**
 * Fetch a single forecast by ID (using dummy data)
 */
export async function fetchForecastById(
  id: string,
): Promise<{ data: Forecast }> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const forecast = MOCK_FORECASTS.find((f) => f.id === id);
  if (!forecast) {
    throw {
      statusCode: 404,
      code: "NOT_FOUND",
      message: "Forecast not found",
    } as ApiError;
  }

  return { data: forecast as Forecast };
}

/**
 * Create a new forecast (draft) - using dummy data
 */
export async function createForecast(
  data: CreateForecastDto,
): Promise<{ data: Forecast }> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Simulate creating a forecast
  const newForecast: Forecast = {
    id: Math.random().toString(36).substr(2, 9),
    periodType: data.periodType,
    period: data.month
      ? `${data.month.charAt(0).toUpperCase() + data.month.slice(1)} ${data.year}`
      : `Q${data.quarter} ${data.year}`,
    month: data.month,
    quarter: data.quarter,
    year: data.year,
    status: "PENDING",
    totalUnitsPlanned: data.distributions.reduce(
      (sum, d) => sum + d.allocations.reduce((s, a) => s + a.units, 0),
      0,
    ),
    doctorsCovered: data.distributions.length,
    productsUsed: new Set(
      data.distributions.flatMap((d) => d.allocations.map((a) => a.productId)),
    ).size,
    totalDistribution: data.distributions.reduce(
      (sum, d) => sum + d.allocations.reduce((s, a) => s + a.units, 0),
      0,
    ),
    products: [],
    distributions: data.distributions.map((d) => {
      const doctor = MOCK_DOCTORS.find((doc) => doc.id === d.doctorId);
      return {
        doctorId: d.doctorId,
        doctorName: doctor?.name || "Unknown Doctor",
        specialty: doctor?.specialty || "Internal Medicine",
        hospital: doctor?.hospital || "Unknown Hospital",
        allocations: d.allocations,
      };
    }),
    notes: data.notes,
    createdAt: new Date().toISOString(),
  };

  return { data: newForecast };
}

/**
 * Submit forecast for approval to backend API
 */
export async function submitForecast(
  data: CreateForecastApiDto,
): Promise<{ data: Forecast }> {
  console.log("Submitting forecast to API:", data);

  const response = await apiFetch<CreateForecastApiResponse>("/api/forecasts", {
    method: "POST",
    body: JSON.stringify(data),
  });

  console.log("API response:", response);

  if (!response.data) {
    throw {
      statusCode: 500,
      code: "INVALID_RESPONSE",
      message: "API response missing data field",
    } as ApiError;
  }

  console.log("Forecast data from API:", response.data);

  const forecast = mapApiForecastToForecast(response.data);
  console.log("Mapped forecast:", forecast);

  return { data: forecast };
}

/**
 * Fetch available products for forecasting.
 * Delegates to the products feature API so that /api/products is managed centrally.
 */
export async function fetchProducts(): Promise<{
  data: Product[];
}> {
  const response = (await fetchProductsFromStore(
    undefined,
    undefined,
    false,
  )) as GetProductsResponse;
  const products = (response.data as ProductApiResponse[]).map(
    mapProductApiToProduct,
  );
  return {
    data: products,
  };
}

/**
 * Fetch doctors assigned to the medical rep from backend API
 */
export async function fetchMyDoctors(): Promise<{
  data: Doctor[];
}> {
  const response = await apiFetch<GetDoctorsResponse>("/api/doctors", {
    method: "GET",
  });

  const doctors = response.data
    .filter((doctor) => doctor.isActive)
    .map(mapDoctorApiToDoctor);

  return {
    data: doctors,
  };
}

/**
 * Server action to get forecasts with error handling
 */
export async function getMyForecastsAction(
  page?: number,
  limit?: number,
): Promise<{
  success: boolean;
  data?: Forecast[];
  totalCount?: number;
  error?: ApiError;
}> {
  try {
    const response = await fetchMyForecasts(page, limit);
    return {
      success: true,
      data: response.data.data,
      totalCount: response.data.results,
    };
  } catch (error) {
    const err = error as ApiError;
    return {
      success: false,
      error: err,
    };
  }
}

/**
 * Server action to create a draft forecast
 */
export async function createForecastAction(data: CreateForecastDto): Promise<{
  success: boolean;
  data?: Forecast;
  error?: ApiError;
}> {
  try {
    const response = await createForecast(data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    const err = error as ApiError;
    return {
      success: false,
      error: err,
    };
  }
}

/**
 * Server action to submit a forecast for approval
 */
export async function submitForecastAction(
  formData: CreateForecastFormValues & {
    allocations: Record<string, Record<string, number>>;
  },
): Promise<{
  success: boolean;
  data?: Forecast;
  error?: ApiError;
}> {
  try {
    // First fetch doctors and products to get names
    const [doctorsResult, productsResult] = await Promise.all([
      getMyDoctorsAction(),
      getProductsAction(),
    ]);

    if (!doctorsResult.success || !productsResult.success) {
      return {
        success: false,
        error: {
          statusCode: 500,
          code: "FETCH_ERROR",
          message: "Failed to fetch required data",
        },
      };
    }

    const doctors = doctorsResult.data || [];
    const products = productsResult.data || [];

    // Prepare and validate data in server action
    const data = prepareSubmissionData(formData, doctors, products);

    // Validate that at least one product forecast exists
    if (data.productForecasts.length === 0) {
      return {
        success: false,
        error: {
          statusCode: 400,
          code: "VALIDATION_ERROR",
          message: "Please allocate products to at least one doctor",
        },
      };
    }

    const response = await submitForecast(data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    const err = error as ApiError;
    return {
      success: false,
      error: err,
    };
  }
}

/**
 * Server action to get products
 * NOTE: This action is also used in the visits feature to populate product dropdown
 */
export async function getProductsAction(): Promise<{
  success: boolean;
  data?: Product[];
  error?: ApiError;
}> {
  try {
    const response = await fetchProducts();
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    const err = error as ApiError;
    return {
      success: false,
      error: err,
    };
  }
}

/**
 * Server action to get my doctors
 */
export async function getMyDoctorsAction(): Promise<{
  success: boolean;
  data?: Doctor[];
  error?: ApiError;
}> {
  try {
    const response = await fetchMyDoctors();
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    const err = error as ApiError;
    return {
      success: false,
      error: err,
    };
  }
}
