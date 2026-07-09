import { StatCard } from "../types";
import { Specialty } from "@/lib/types";

export const CARD_ITEMS: StatCard[] = [
  { id: "s1", title: "Total Doctors", value: 7, variant: "primary" },
  { id: "s2", title: "Riyadh", value: 2, variant: "default" },
  { id: "s3", title: "Jeddah", value: 2, variant: "default" },
  { id: "s4", title: "Other Regions", value: 3, variant: "accent" },
];

export const SPECIALTIES: Specialty[] = [
  "Cardiology",
  "Pediatrics",
  "Internal Medicine",
  "Neurology",
  "Orthopedics",
  "Dermatology",
  "Oncology",
  "Gastroenterology",
  "Endocrinology",
];
