import { Specialty } from "@/lib/types";

export const FORECAST_MONTHS = [
  { value: "january", label: "January" },
  { value: "february", label: "February" },
  { value: "march", label: "March" },
  { value: "april", label: "April" },
  { value: "may", label: "May" },
  { value: "june", label: "June" },
  { value: "july", label: "July" },
  { value: "august", label: "August" },
  { value: "september", label: "September" },
  { value: "october", label: "October" },
  { value: "november", label: "November" },
  { value: "december", label: "December" },
];

export const FORECAST_QUARTERS = [
  { value: "Q1", label: "Q1" },
  { value: "Q2", label: "Q2" },
  { value: "Q3", label: "Q3" },
  { value: "Q4", label: "Q4" },
];

export const FORECAST_PERIOD_TYPES = [
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
];

// Mock products - Dynamic array, can be any length
export const MOCK_PRODUCTS = [
  {
    id: "1",
    name: "CardioMax 50mg",
    category: "Cardiovascular",
    totalUnits: 500,
  },
  {
    id: "2",
    name: "DiabetControl XR",
    category: "Diabetes",
    totalUnits: 350,
  },
  {
    id: "3",
    name: "NeuroPro 25mg",
    category: "Neurology",
    totalUnits: 200,
  },
  {
    id: "4",
    name: "RespiCare Inhaler",
    category: "Respiratory",
    totalUnits: 150,
  },
  {
    id: "5",
    name: "ImmunoBoost",
    category: "Immunology",
    totalUnits: 100,
  },
];

// Mock doctors - Using Specialty type from global types
export const MOCK_DOCTORS: Array<{
  id: string;
  name: string;
  specialty: Specialty;
  hospital: string;
}> = [
  {
    id: "1",
    name: "Dr. Ahmed Hassan",
    specialty: "Cardiology",
    hospital: "King Fahad Hospital",
  },
  {
    id: "2",
    name: "Dr. Fatima Ali",
    specialty: "Pediatrics",
    hospital: "King Fahad Hospital",
  },
  {
    id: "3",
    name: "Dr. Omar Khalid",
    specialty: "Internal Medicine",
    hospital: "King Fahad Hospital",
  },
  {
    id: "4",
    name: "Dr. Layla Ahmed",
    specialty: "Neurology",
    hospital: "King Fahad Hospital",
  },
  {
    id: "5",
    name: "Dr. Mohammed Al-Rashid",
    specialty: "Orthopedics",
    hospital: "Prince Sultan Hospital",
  },
  {
    id: "6",
    name: "Dr. Sara Ibrahim",
    specialty: "Dermatology",
    hospital: "Prince Sultan Hospital",
  },
  {
    id: "7",
    name: "Dr. Khalid Mansour",
    specialty: "Cardiology",
    hospital: "Prince Sultan Hospital",
  },
  {
    id: "8",
    name: "Dr. Noura Al-Salem",
    specialty: "Oncology",
    hospital: "Al-Noor Specialist Hospital",
  },
  {
    id: "9",
    name: "Dr. Abdullah Hassan",
    specialty: "Gastroenterology",
    hospital: "Al-Noor Specialist Hospital",
  },
  {
    id: "10",
    name: "Dr. Maha Al-Otaibi",
    specialty: "Endocrinology",
    hospital: "Al-Noor Specialist Hospital",
  },
];

// Dummy forecast history data
export const MOCK_FORECASTS = [
  {
    id: "1",
    periodType: "MONTHLY" as const,
    period: "November 2025",
    month: "november",
    year: 2025,
    status: "APPROVED" as const,
    totalUnitsPlanned: 240,
    doctorsCovered: 3,
    productsUsed: 3,
    totalDistribution: 240,
    products: [
      {
        productId: "1",
        productName: "CardioMax 50mg",
        category: "Cardiovascular",
        totalUnits: 500,
        allocatedUnits: 80,
        remainingUnits: 420,
      },
      {
        productId: "2",
        productName: "DiabetControl XR",
        category: "Diabetes",
        totalUnits: 350,
        allocatedUnits: 50,
        remainingUnits: 300,
      },
      {
        productId: "3",
        productName: "NeuroPro 25mg",
        category: "Neurology",
        totalUnits: 200,
        allocatedUnits: 40,
        remainingUnits: 160,
      },
    ],
    distributions: [
      {
        doctorId: "1",
        doctorName: "Dr. Ahmed Hassan",
        specialty: "Cardiology" as Specialty,
        hospital: "King Fahad Hospital",
        allocations: [
          { productId: "1", units: 80 },
          { productId: "2", units: 0 },
          { productId: "3", units: 0 },
        ],
      },
      {
        doctorId: "7",
        doctorName: "Dr. Khalid Mansour",
        specialty: "Cardiology" as Specialty,
        hospital: "Prince Sultan Hospital",
        allocations: [
          { productId: "1", units: 70 },
          { productId: "2", units: 0 },
          { productId: "3", units: 0 },
        ],
      },
      {
        doctorId: "4",
        doctorName: "Dr. Layla Ahmed",
        specialty: "Neurology" as Specialty,
        hospital: "King Fahad Hospital",
        allocations: [
          { productId: "1", units: 0 },
          { productId: "2", units: 50 },
          { productId: "3", units: 40 },
        ],
      },
    ],
    notes: "Focus on cardiology this month with CardioMax launch",
    supervisorFeedback:
      "Good distribution plan. Focus on the cardiology segment as planned.",
    createdAt: "2025-10-26T10:00:00Z",
    submittedAt: "2025-10-26T10:30:00Z",
    approvedAt: "2025-10-27T09:00:00Z",
  },
  {
    id: "2",
    periodType: "MONTHLY" as const,
    period: "October 2025",
    month: "october",
    year: 2025,
    status: "APPROVED" as const,
    totalUnitsPlanned: 135,
    doctorsCovered: 2,
    productsUsed: 2,
    totalDistribution: 135,
    products: [
      {
        productId: "2",
        productName: "DiabetControl XR",
        category: "Diabetes",
        totalUnits: 350,
        allocatedUnits: 60,
        remainingUnits: 290,
      },
      {
        productId: "4",
        productName: "RespiCare Inhaler",
        category: "Respiratory",
        totalUnits: 150,
        allocatedUnits: 75,
        remainingUnits: 75,
      },
    ],
    distributions: [
      {
        doctorId: "3",
        doctorName: "Dr. Omar Khalid",
        specialty: "Internal Medicine" as Specialty,
        hospital: "King Fahad Hospital",
        allocations: [
          { productId: "2", units: 60 },
          { productId: "4", units: 0 },
        ],
      },
      {
        doctorId: "9",
        doctorName: "Dr. Abdullah Hassan",
        specialty: "Gastroenterology" as Specialty,
        hospital: "Al-Noor Specialist Hospital",
        allocations: [
          { productId: "2", units: 0 },
          { productId: "4", units: 75 },
        ],
      },
    ],
    notes: null,
    supervisorFeedback:
      "Good distribution plan. Focus on the cardiology segment as planned.",
    createdAt: "2025-09-27T14:00:00Z",
    submittedAt: "2025-09-27T15:00:00Z",
    approvedAt: "2025-09-28T11:00:00Z",
  },
  {
    id: "3",
    periodType: "MONTHLY" as const,
    period: "December 2025",
    month: "december",
    year: 2025,
    status: "PENDING" as const,
    totalUnitsPlanned: 200,
    doctorsCovered: 4,
    productsUsed: 4,
    totalDistribution: 200,
    products: [
      {
        productId: "1",
        productName: "CardioMax 50mg",
        category: "Cardiovascular",
        totalUnits: 500,
        allocatedUnits: 50,
        remainingUnits: 450,
      },
      {
        productId: "3",
        productName: "NeuroPro 25mg",
        category: "Neurology",
        totalUnits: 200,
        allocatedUnits: 60,
        remainingUnits: 140,
      },
      {
        productId: "4",
        productName: "RespiCare Inhaler",
        category: "Respiratory",
        totalUnits: 150,
        allocatedUnits: 40,
        remainingUnits: 110,
      },
      {
        productId: "5",
        productName: "ImmunoBoost",
        category: "Immunology",
        totalUnits: 100,
        allocatedUnits: 50,
        remainingUnits: 50,
      },
    ],
    distributions: [
      {
        doctorId: "1",
        doctorName: "Dr. Ahmed Hassan",
        specialty: "Cardiology" as Specialty,
        hospital: "King Fahad Hospital",
        allocations: [
          { productId: "1", units: 50 },
          { productId: "3", units: 0 },
          { productId: "4", units: 0 },
          { productId: "5", units: 0 },
        ],
      },
      {
        doctorId: "4",
        doctorName: "Dr. Layla Ahmed",
        specialty: "Neurology" as Specialty,
        hospital: "King Fahad Hospital",
        allocations: [
          { productId: "1", units: 0 },
          { productId: "3", units: 60 },
          { productId: "4", units: 0 },
          { productId: "5", units: 0 },
        ],
      },
      {
        doctorId: "9",
        doctorName: "Dr. Abdullah Hassan",
        specialty: "Gastroenterology" as Specialty,
        hospital: "Al-Noor Specialist Hospital",
        allocations: [
          { productId: "1", units: 0 },
          { productId: "3", units: 0 },
          { productId: "4", units: 40 },
          { productId: "5", units: 0 },
        ],
      },
      {
        doctorId: "10",
        doctorName: "Dr. Maha Al-Otaibi",
        specialty: "Endocrinology" as Specialty,
        hospital: "Al-Noor Specialist Hospital",
        allocations: [
          { productId: "1", units: 0 },
          { productId: "3", units: 0 },
          { productId: "4", units: 0 },
          { productId: "5", units: 50 },
        ],
      },
    ],
    notes: "Year-end distribution focusing on diverse specialties",
    supervisorFeedback: null,
    createdAt: "2025-11-28T09:00:00Z",
    submittedAt: "2025-11-28T10:00:00Z",
    approvedAt: null,
  },
];
