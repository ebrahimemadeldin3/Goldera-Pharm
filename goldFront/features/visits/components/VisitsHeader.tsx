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
      <header className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-normal text-2xl text-black md:text-[32px]">
            Visit Calendar
          </h1>
          <p className="text-secondary-dark text-sm text-slate-600 mt-0.5">
            Track and manage medical rep visits, schedules, and completion reports
          </p>

          {/* Compact Inline Metadata Summary */}
          <div className="mt-2.5 flex flex-wrap items-center gap-2.5 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-900 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-2xs">
              <Calendar size={14} className="text-dashboard-blue" />
              {stats.total} Total {stats.total === 1 ? "Visit" : "Visits"}
            </span>

            <span className="inline-flex items-center gap-1.5 font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
              <CheckCircle size={14} className="text-emerald-600" />
              {stats.completed} Completed
            </span>

            <span className="inline-flex items-center gap-1.5 font-medium text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md">
              <Clock size={14} className="text-blue-600" />
              {stats.today} Today
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="bg-system-primary hover:bg-blue-700 cursor-pointer inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Visit
          </Button>

          {/* Fallback direct link accessible via screen readers or right-click */}
          <Link
            href={addVisitPath}
            className="sr-only"
            tabIndex={-1}
          >
            Add Visit Page
          </Link>
        </div>
      </header>

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
