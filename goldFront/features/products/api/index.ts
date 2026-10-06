"use server";

import { apiFetch } from "@/services/http";
import { ApiError } from "@/services/api-error";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import type {
  GetProductsResponse,
  ProductApiResponse,
  CreateProductDto,
  ProductStatusFilter,
} from "../lib/types";

type ProductEnvelope = { data: ProductApiResponse };
type ProductSubmission = CreateProductDto | FormData;

function revalidateProductPages() {
  for (const role of ["manager", "supervisor", "rep"])
    revalidatePath(`/${role}/products`);
}

function unwrapProductResponse(response: ProductApiResponse | ProductEnvelope) {
  return "data" in response ? response.data : response;
}

async function apiFetchProductFormData(
  endpoint: string,
  method: "POST" | "PATCH",
  formData: FormData,
): Promise<ProductApiResponse> {
  const token = (await cookies()).get("token")?.value;
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`,
    {
      method,
      credentials: "include",
      cache: "no-store",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    },
  );

  if (!res.ok) {
    let error: ApiError;
    try {
      const data = await res.json();
      error = {
        statusCode: data.statusCode || data.err?.statusCode || res.status,
        code: data.code || data.status || "API_ERROR",
        message: data.message || "Something went wrong",
      };
    } catch {
      error = {
        statusCode: res.status,
        code: "UNKNOWN_ERROR",
        message: "Something went wrong",
      };
    }
    throw error;
  }

  const response = (await res.json()) as ProductEnvelope;
  return response.data;
}

/**
 * Fetch all products
 */
export async function fetchProducts(
  page?: number,
  limit?: number,
  paginate?: boolean,
  status: ProductStatusFilter = "active",
): Promise<GetProductsResponse> {
  const params = new URLSearchParams();

  if (paginate === false) {
    params.append("paginate", "false");
  } else {
    if (page !== undefined) {
      params.append("page", String(page));
    }

    if (limit !== undefined) {
      params.append("limit", String(limit));
    }
  }
  params.append("status", status);

  const endpoint = `/api/products${params.toString() ? `?${params.toString()}` : ""}`;

  return apiFetch<GetProductsResponse>(endpoint, {
    method: "GET",
  });
}

/**
 * Create a new product
 */
export async function createProduct(
  data: ProductSubmission,
): Promise<ProductApiResponse> {
  if (data instanceof FormData) {
    return apiFetchProductFormData("/api/products", "POST", data);
  }

  const response = await apiFetch<ProductApiResponse | ProductEnvelope>(
    "/api/products",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );

  return unwrapProductResponse(response);
}

export async function updateProduct(
  id: string,
  data: ProductSubmission,
): Promise<ProductApiResponse> {
  if (data instanceof FormData) {
    return apiFetchProductFormData(`/api/products/${id}`, "PATCH", data);
  }

  const response = await apiFetch<ProductApiResponse | ProductEnvelope>(
    `/api/products/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  );

  return unwrapProductResponse(response);
}

/**
 * Server action to get all products
 * NOTE: Also imported by features/forecast for product selection in forecasts and visits
 */
export async function getProductsAction(
  page?: number,
  limit?: number,
  paginate?: boolean,
  status: ProductStatusFilter = "active",
) {
  try {
    const response = await fetchProducts(page, limit, paginate, status);
    return {
      success: true,
      data: response.data,
      results: response.results,
      pagination: response.pagination,
    };
  } catch (error) {
    const err = error as ApiError;
    console.error("Products fetch error:", err);
    return {
      success: false,
      error: {
        code: err.code || "FETCH_ERROR",
        message: err.message || "Failed to fetch products",
        statusCode: err.statusCode || 500,
      },
    };
  }
}

/**
 * Server action to create a product
 */
export async function createProductAction(data: ProductSubmission) {
  try {
    const response = await createProduct(data);

    revalidateProductPages();

    return {
      success: true,
      data: response,
    };
  } catch (error) {
    const err = error as ApiError;
    console.error("Product create error:", err);
    return {
      success: false,
      error: {
        code: err.code || "CREATE_ERROR",
        message: err.message || "Failed to create product",
        statusCode: err.statusCode || 500,
      },
    };
  }
}

export async function updateProductAction(id: string, data: ProductSubmission) {
  try {
    const response = await updateProduct(id, data);
    revalidateProductPages();
    return { success: true, data: response };
  } catch (error) {
    const err = error as ApiError;
    return {
      success: false,
      error: {
        code: err.code || "UPDATE_ERROR",
        message: err.message || "Could not update product",
        statusCode: err.statusCode || 500,
      },
    };
  }
}

export async function deleteProductAction(id: string) {
  try {
    await apiFetch(`/api/products/${id}`, { method: "DELETE" });
    revalidateProductPages();
    return { success: true };
  } catch (error) {
    const err = error as ApiError & {
      canArchive?: boolean;
      dependencies?: string[];
    };
    return {
      success: false,
      error: {
        code: err.code || "DELETE_ERROR",
        message: err.message || "Could not delete product",
        statusCode: err.statusCode || 500,
        canArchive: err.canArchive,
        dependencies: err.dependencies,
      },
    };
  }
}

export async function archiveProductAction(id: string) {
  try {
    const response = await apiFetch<{ data: ProductApiResponse }>(
      `/api/products/${id}/archive`,
      { method: "PATCH" },
    );
    revalidateProductPages();
    return { success: true, data: response.data };
  } catch (error) {
    const err = error as ApiError;
    return {
      success: false,
      error: {
        code: err.code || "ARCHIVE_ERROR",
        message: err.message || "Could not archive product",
        statusCode: err.statusCode || 500,
      },
    };
  }
}

export async function restoreProductAction(id: string) {
  try {
    const response = await apiFetch<{ data: ProductApiResponse }>(
      `/api/products/${id}/restore`,
      { method: "PATCH" },
    );
    revalidateProductPages();
    return { success: true, data: response.data };
  } catch (error) {
    const err = error as ApiError;
    return {
      success: false,
      error: {
        code: err.code || "RESTORE_ERROR",
        message: err.message || "Could not restore product",
        statusCode: err.statusCode || 500,
      },
    };
  }
}
