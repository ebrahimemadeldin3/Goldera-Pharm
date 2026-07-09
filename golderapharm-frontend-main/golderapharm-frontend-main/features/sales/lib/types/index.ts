export type SaleProduct = {
  id: string;
  name: string;
  internalRef?: string;
  salesPrice?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type SaleApiResponse = {
  id: string;
  sheetName?: string | null;
  customer?: string | null;
  order?: string | null;
  orderDate?: string | null;
  date?: string | null;
  saleDate?: string | null;
  soldAt?: string | null;
  productId?: string | null;
  qtyOrdered?: number | null;
  untaxedTotal?: number | null;
  createdAt?: string;
  updatedAt?: string;
  product?: SaleProduct | null;
  [key: string]: unknown;
};

export type SalesQueryParams = {
  date?: string;
  sheetName?: string;
  page?: number;
  limit?: number;
};

export type SalesApiEnvelope = {
  status?: string;
  message?: string;
  length?: number;
  data?: {
    sales?: SaleApiResponse[];
    data?: SaleApiResponse[];
    results?: number;
  };
  sales?: SaleApiResponse[];
};

export type SalesRepOption = {
  id: string;
  name: string;
};

export type DateFilter = "all" | "day" | "week" | "month" | "year";
