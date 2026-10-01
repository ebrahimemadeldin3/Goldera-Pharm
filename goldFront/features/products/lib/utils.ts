import type { ProductApiResponse } from "./types";

export type ProductImageInfo = {
  src: string;
  alt: string;
  source: string;
  verified: "exact" | "fallback";
};

const PRODUCT_IMAGE_BY_REF: Record<string, ProductImageInfo> = {
  P0101: {
    src: "/images/products/catalog/rizona-plus-cream-30g.jpeg",
    alt: "Rizona Plus Cream 30g product packaging",
    source: "GolderaPharm official product image",
    verified: "exact",
  },
  P0102: {
    src: "/images/products/catalog/femi-comfort-250ml.jpeg",
    alt: "Femi Comfort 250ml product packaging",
    source: "GolderaPharm official product image",
    verified: "exact",
  },
  P0202: {
    src: "/images/products/catalog/proflor-forte-30-gummies.jpeg",
    alt: "PROFLOR Forte 30 Gummies product packaging",
    source: "GolderaPharm official product image",
    verified: "exact",
  },
  P0203: {
    src: "/images/products/catalog/hemaglow-20-vials.jpeg",
    alt: "HemaGlow 20 Vials product packaging",
    source: "GolderaPharm official product image",
    verified: "exact",
  },
};

export function getProductCategory(internalRef: string | null): string {
  if (!internalRef) return "General";

  const code = internalRef.substring(1, 3);
  const map: Record<string, string> = {
    "01": "Topical Care",
    "02": "Nutritional Supplements",
    "03": "Healthcare",
  };

  return map[code] || "General";
}

export function getProductDisplayName(name: string): {
  primary: string;
  secondary: string | null;
} {
  const firstArabicIndex = name.search(/[\u0600-\u06ff]/);

  if (firstArabicIndex <= 0) {
    return { primary: name, secondary: null };
  }

  return {
    primary: name.slice(0, firstArabicIndex).trim(),
    secondary: name.slice(firstArabicIndex).trim() || null,
  };
}

function getExistingProductImage(product: ProductApiResponse): string | null {
  const record = product as ProductApiResponse & Record<string, unknown>;
  const directImageKeys = [
    "image",
    "imageUrl",
    "imageURL",
    "photo",
    "photoUrl",
    "thumbnail",
    "thumbnailUrl",
  ];

  for (const key of directImageKeys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  for (const key of ["image", "media", "attachment", "productImage"]) {
    const value = record[key];
    if (value && typeof value === "object") {
      const nested = value as Record<string, unknown>;
      if (typeof nested.url === "string" && nested.url.trim()) {
        return nested.url;
      }
      if (typeof nested.secure_url === "string" && nested.secure_url.trim()) {
        return nested.secure_url;
      }
    }
  }

  return null;
}

export function getProductImageInfo(
  product: ProductApiResponse,
): ProductImageInfo | null {
  const existingImage = getExistingProductImage(product);
  if (existingImage) {
    return {
      src: existingImage,
      alt: `${product.name} product image`,
      source: "Product API image field",
      verified: "exact",
    };
  }

  const ref = product.internalRef?.trim().toUpperCase();
  if (ref && PRODUCT_IMAGE_BY_REF[ref]) {
    return PRODUCT_IMAGE_BY_REF[ref];
  }

  const normalizedName = product.name.toLowerCase();

  if (normalizedName.includes("hemaglow")) {
    return PRODUCT_IMAGE_BY_REF.P0203;
  }

  if (normalizedName.includes("femi comfort")) {
    return PRODUCT_IMAGE_BY_REF.P0102;
  }

  if (normalizedName.includes("rizona plus")) {
    return PRODUCT_IMAGE_BY_REF.P0101;
  }

  if (
    normalizedName.includes("proflor") &&
    normalizedName.includes("30") &&
    !normalizedName.includes("15")
  ) {
    return PRODUCT_IMAGE_BY_REF.P0202;
  }

  return null;
}

export function extractProducts(raw: unknown): ProductApiResponse[] {
  if (!raw || typeof raw !== "object") {
    return [];
  }

  const record = raw as Record<string, unknown>;

  if (Array.isArray(record.data)) {
    return record.data as ProductApiResponse[];
  }

  if (Array.isArray(record.products)) {
    return record.products as ProductApiResponse[];
  }

  if (Array.isArray(raw)) {
    return raw as ProductApiResponse[];
  }

  return [];
}
