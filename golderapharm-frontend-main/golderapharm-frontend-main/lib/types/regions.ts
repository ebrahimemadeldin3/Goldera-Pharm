// Regions related types
export type SubRegion = {
  id: string;
  name: string;
  reps: unknown[];
  doctors: unknown[];
};

export type Region = {
  id: string;
  name: string;
  country: string;
  supervisor: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  subRegions: SubRegion[];
  createdAt: string;
};

export type RegionsApiResponse = {
  status: string;
  message: string;
  results: number;
  data: Region[];
};
