import { VisitPlan } from "@/features/plan/api/get";

// Medical Rep Plans (for rep view)
export const mockPlans: VisitPlan[] = [
  {
    id: "1",
    title: "Week 45 - Hospital Coverage",
    description: "Focus on cardiology and internal medicine departments",
    planType: "WEEKLY",
    status: "APPROVED",
    startDate: "2025-11-04",
    endDate: "2025-11-10",
    objectives: [
      "Present new cardiovascular product line",
      "Gather feedback on current medications",
      "Schedule follow-up presentations",
    ],
    selectedDoctors: [
      {
        id: "d1",
        nameEN: "Dr. Ahmed Hassan",
        specialty: "Cardiology",
        accountName: "King Fahad Hospital",
      },
      {
        id: "d2",
        nameEN: "Dr. Fatima Ali",
        specialty: "Internal Medicine",
        accountName: "King Fahad Hospital",
      },
      {
        id: "d3",
        nameEN: "Dr. Mohammed Al-Rashid",
        specialty: "Cardiology",
        accountName: "Prince Sultan Hospital",
      },
    ],
    submittedDate: "2025-11-01",
    supervisorFeedback: {
      message:
        "Good coverage plan. Make sure to follow up with Dr. Hassan on the new product samples.",
      createdAt: "2025-11-02",
    },
  },
  {
    id: "2",
    title: "Week 46 - New Doctor Onboarding",
    description: "Focus on establishing relationships with new doctors",
    planType: "WEEKLY",
    status: "PENDING",
    startDate: "2025-11-11",
    endDate: "2025-11-17",
    objectives: [
      "Introduce company and product portfolio",
      "Understand doctor prescribing patterns",
      "Set up regular visit schedule",
    ],
    selectedDoctors: [
      {
        id: "d4",
        nameEN: "Dr. Layla Ahmed",
        specialty: "Pediatrics",
        accountName: "King Fahad Hospital",
      },
      {
        id: "d5",
        nameEN: "Dr. Khalid Mansour",
        specialty: "Surgery",
        accountName: "Prince Sultan Hospital",
      },
      {
        id: "d6",
        nameEN: "Dr. Abdullah Hassan",
        specialty: "Oncology",
        accountName: "Al-Noor Specialist Hospital",
      },
    ],
    submittedDate: "2025-11-03",
  },
  {
    id: "3",
    title: "November 2025 - Territory Expansion",
    description: "Increase coverage across all hospitals in territory",
    planType: "MONTHLY",
    status: "APPROVED",
    startDate: "2025-11-01",
    endDate: "2025-11-30",
    objectives: [
      "Complete 80 doctor visits",
      "Achieve 110% of sales target",
      "Add 5 new doctor accounts",
      "Conduct 2 hospital presentations",
    ],
    selectedDoctors: [
      {
        id: "d1",
        nameEN: "Dr. Ahmed Hassan",
        specialty: "Cardiology",
        accountName: "King Fahad Hospital",
      },
      {
        id: "d2",
        nameEN: "Dr. Fatima Ali",
        specialty: "Internal Medicine",
        accountName: "King Fahad Hospital",
      },
      {
        id: "d7",
        nameEN: "Dr. Sara Ibrahim",
        specialty: "Neurology",
        accountName: "Prince Sultan Hospital",
      },
      {
        id: "d8",
        nameEN: "Dr. Noura Al-Salem",
        specialty: "Dermatology",
        accountName: "Al-Noor Specialist Hospital",
      },
      {
        id: "d9",
        nameEN: "Dr. Huda Al-Shammari",
        specialty: "Ophthalmology",
        accountName: "National Guard Hospital",
      },
      {
        id: "d10",
        nameEN: "Dr. Rana Al-Harbi",
        specialty: "ENT",
        accountName: "National Guard Hospital",
      },
      {
        id: "d11",
        nameEN: "Dr. Aisha Mohammed",
        specialty: "Rheumatology",
        accountName: "Riyadh Medical Center",
      },
      {
        id: "d12",
        nameEN: "Dr. Maha Al-Otaibi",
        specialty: "Endocrinology",
        accountName: "Prince Sultan Hospital",
      },
    ],
    submittedDate: "2025-10-28",
    supervisorFeedback: {
      message:
        "Excellent plan. Your hospital coverage is comprehensive. Focus on quality interactions.",
      createdAt: "2025-10-29",
    },
  },
];
