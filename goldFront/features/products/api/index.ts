"use server";

import { apiFetch } from "@/services/http";
import { ApiError } from "@/services/api-error";
import type {
  GetProductsResponse,
  ProductApiResponse,
  CreateProductDto,
} from "../lib/types";

/**
 * Fetch all products
 */
export async function fetchProducts(
  page?: number,
  limit?: number,
  paginate?: boolean,
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

  const endpoint = `/api/products${params.toString() ? `?${params.toString()}` : ""}`;

  return apiFetch<GetProductsResponse>(endpoint, {
    method: "GET",
  });
}

/**
 * Create a new product
 */
export async function createProduct(
  data: CreateProductDto,
): Promise<ProductApiResponse> {
  return apiFetch<ProductApiResponse>("/api/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Server action to get all products
 * NOTE: Also imported by features/forecast for product selection in forecasts and visits
 */
export async function getProductsAction(page?: number, limit?: number) {
  try {
    const response = await fetchProducts(page, limit);
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
export async function createProductAction(data: CreateProductDto) {
  try {
    const response = await createProduct(data);
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
