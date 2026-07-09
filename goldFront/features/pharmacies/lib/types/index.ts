import type { PaginatedApiResponse } from "@/lib/types";

export interface PharmacyApiResponse {
  id: string;
  name: string;
  city: string;
  subRegion: string;
  region: string;
  country: string;
  createdAt: string;
  updatedAt: string;
}

export type GetPharmaciesResponse = PaginatedApiResponse<PharmacyApiResponse[]>;

export interface CreatePharmacyDto {
  name: string;
  city: string;
  subRegion: string;
  region: string;
  country: string;
}
