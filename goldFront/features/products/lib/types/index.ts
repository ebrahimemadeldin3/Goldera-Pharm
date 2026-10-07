import type { PaginatedApiResponse } from "@/lib/types";

export interface ProductApiResponse {
  id: string;
  name: string;
  internalRef: string;
  salesPrice: number;
  image?: unknown;
  isArchived: boolean;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type GetProductsResponse = PaginatedApiResponse<ProductApiResponse[]>;

export interface CreateProductDto {
  name: string;
  internalRef: string;
  salesPrice: number;
}

export type ProductStatusFilter = "active" | "archived" | "all";
