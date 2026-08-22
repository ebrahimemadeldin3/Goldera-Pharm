"use client";

import { useState, useEffect } from "react";
import { Calendar, CheckCircle, Clock, Plus } from "lucide-react";
import Link from "next/link";
import { UserRole } from "@/lib/types";
import { Button } from "@/components/ui/button";
import AddVisitDialog from "./AddVisitDialog";
import { getDoctorsAction } from "@/features/doctors/api";
import { getManagerTeamAction } from "@/features/team/api";
import type { DoctorApiResponse } from "@/features/doctors/lib/types/api";
import type { User } from "@/features/team/lib/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetadataBadge } from "@/components/ui/MetadataBadge";

type VisitsHeaderProps = {
  role: UserRole;
  stats: {
    total: number;
    completed: number;
    today: number;
  };
};

export default function VisitsHeader({ role, stats }: VisitsHeaderProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [doctors, setDoctors] = useState<DoctorApiResponse[]>([]);
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const [medicalReps, setMedicalReps] = useState<User[]>([]);

  const addVisitPath =
    role === "MANAGER"
      ? "/manager/visits/add"
      : role === "SUPERVISOR"
        ? "/supervisor/visits/add"
        : "/rep/visits/add";

  useEffect(() => {
    if (dialogOpen && doctors.length === 0) {
      const fetchData = async () => {
        const doctorsRes = await getDoctorsAction(undefined, undefined, undefined, false);
        if (doctorsRes.success && doctorsRes.data) {
          setDoctors(doctorsRes.data);
        }

        if (role === "MANAGER" || role === "SUPERVISOR") {
          const teamRes = await getManagerTeamAction();
          if (teamRes.success) {
            setSupervisors(teamRes.supervisors || []);
            setMedicalReps(teamRes.medicalReps || []);
          }
        }
      };
      fetchData();
    }
  }, [dialogOpen, doctors.length, role]);

  return (
    <>
      <PageHeader
        title="Visit Calendar"
        subtitle="Track and manage medical rep visits, schedules, and completion reports"
        metadata={
          <>
            <MetadataBadge variant="primary" icon={<Calendar size={14} className="text-blue-600" />}>
              {stats.total} Total {stats.total === 1 ? "Visit" : "Visits"}
            </MetadataBadge>

            <MetadataBadge variant="success" icon={<CheckCircle size={14} className="text-emerald-600" />}>
              {stats.completed} Completed
            </MetadataBadge>

            <MetadataBadge variant="info" icon={<Clock size={14} className="text-blue-600" />}>
              {stats.today} Today
            </MetadataBadge>
          </>
        }
        action={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={() => setDialogOpen(true)}
              className="bg-slate-900 hover:bg-slate-800 h-9 px-4 rounded-md text-xs sm:text-sm font-medium text-white transition-colors cursor-pointer inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 disabled:opacity-50 disabled:pointer-events-none"
            >
              <Plus className="h-4 w-4" />
              Add Visit
            </Button>

            <Link
              href={addVisitPath}
              className="sr-only"
              tabIndex={-1}
            >
              Add Visit Page
            </Link>
          </div>
        }
      />

      {/* Add Visit Modal Overlay */}
      {dialogOpen && (
        <AddVisitDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          role={role as "MANAGER" | "SUPERVISOR" | "MEDICAL_REP"}
          doctors={doctors}
          supervisors={supervisors}
          medicalReps={medicalReps}
        />
      )}
    </>
  );
}
