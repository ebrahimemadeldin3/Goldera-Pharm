// Hospital related types
export type HospitalDoctor = {
  id: string;
  name: string;
  phone: string;
};

export type Hospital = {
  id: string;
  name: string;
  location: string;
  createdAt: string;
  updatedAt: string;
  doctors: HospitalDoctor[];
};

export type HospitalsApiResponse = {
  status: string;
  message: string;
  results: number;
  data: Hospital[];
};
