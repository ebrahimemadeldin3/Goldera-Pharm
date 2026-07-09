import { Doctor, VisitPlan } from "@/features/plan/api/get";

export type AggregatedSelectedDoctor = {
  id: string;
  nameEN: string;
  nameAR?: string;
  accountName?: string;
  subRegion?: string;
  area?: string | null;
  specialty?: string;
  visitDates: string[];
};

export type SelectedDoctorsHospitalGroup = {
  hospitalName: string;
  doctors: AggregatedSelectedDoctor[];
};

export type SelectedDoctorsDayGroup = {
  day: string;
  doctors: AggregatedSelectedDoctor[];
};

/**
 * Group selected doctors by hospital and merge duplicate doctor entries by id.
 * This supports plans where the same doctor appears on multiple visit dates.
 */
export function groupSelectedDoctorsByHospital(
  selectedDoctors: Doctor[],
): SelectedDoctorsHospitalGroup[] {
  const hospitalGroups = new Map<
    string,
    Map<string, AggregatedSelectedDoctor>
  >();

  selectedDoctors.forEach((doctor) => {
    const hospitalName = doctor.accountName || "Unassigned";
    const hospitalMap = hospitalGroups.get(hospitalName) ?? new Map();

    const existing = hospitalMap.get(doctor.id);
    if (!existing) {
      hospitalMap.set(doctor.id, {
        id: doctor.id,
        nameEN: doctor.nameEN,
        nameAR: doctor.nameAR,
        accountName: doctor.accountName,
        subRegion: doctor.subRegion,
        area: doctor.area,
        specialty: doctor.specialty,
        visitDates: doctor.visitDate ? [doctor.visitDate] : [],
      });
    } else if (
      doctor.visitDate &&
      !existing.visitDates.includes(doctor.visitDate)
    ) {
      existing.visitDates.push(doctor.visitDate);
    }

    hospitalGroups.set(hospitalName, hospitalMap);
  });

  return Array.from(hospitalGroups.entries())
    .map(([hospitalName, doctorsMap]) => ({
      hospitalName,
      doctors: Array.from(doctorsMap.values()),
    }))
    .sort((a, b) => a.hospitalName.localeCompare(b.hospitalName));
}

/**
 * Group selected doctors by visit day and merge duplicate doctor entries by id per day.
 */
export function groupSelectedDoctorsByDay(
  selectedDoctors: Doctor[],
): SelectedDoctorsDayGroup[] {
  const dayGroups = new Map<string, Map<string, AggregatedSelectedDoctor>>();

  selectedDoctors.forEach((doctor) => {
    const day = doctor.visitDate || "No Date";
    const dayMap = dayGroups.get(day) ?? new Map();
    const existing = dayMap.get(doctor.id);

    if (!existing) {
      dayMap.set(doctor.id, {
        id: doctor.id,
        nameEN: doctor.nameEN,
        nameAR: doctor.nameAR,
        accountName: doctor.accountName,
        subRegion: doctor.subRegion,
        area: doctor.area,
        specialty: doctor.specialty,
        visitDates: doctor.visitDate ? [doctor.visitDate] : [],
      });
    }

    dayGroups.set(day, dayMap);
  });

  return Array.from(dayGroups.entries())
    .map(([day, doctorsMap]) => ({
      day,
      doctors: Array.from(doctorsMap.values()).sort((a, b) =>
        a.nameEN.localeCompare(b.nameEN),
      ),
    }))
    .sort((a, b) => {
      if (a.day === "No Date") return 1;
      if (b.day === "No Date") return -1;
      return new Date(a.day).getTime() - new Date(b.day).getTime();
    });
}

/**
 * Calculate stats for medical rep plans
 */
export function calculateRepPlanStats(plans: VisitPlan[]) {
  return {
    pendingApproval: plans.filter((p) => p.status === "PENDING").length,
    approvedPlans: plans.filter((p) => p.status === "APPROVED").length,
    weeklyPlans: plans.filter((p) => p.planType === "WEEKLY").length,
    monthlyPlans: plans.filter((p) => p.planType === "MONTHLY").length,
  };
}

/**
 * Calculate stats for supervisor plans
 */
export function calculateSupervisorPlanStats(plans: VisitPlan[]) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return {
    pendingApprovals: plans.filter((p) => p.status === "PENDING").length,
    activePlans: plans.filter((p) => p.status === "APPROVED").length,
    approvedThisWeek: plans.filter(
      (p) => p.status === "APPROVED" && new Date(p.submittedDate) > weekAgo,
    ).length,
    teamMembers: new Set(plans.map((p) => p.rep?.id)).size,
  };
}
