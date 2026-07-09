"use client";

import { HRMember } from "../lib/types";
import {
  Briefcase,
  Calendar,
  Clock,
  FileText,
  Target,
  TrendingUp,
  Package,
  ClipboardList,
  MapPin,
  Mail,
  Phone,
  Users,
  GraduationCap,
  Download,
  Award,
  Cake,
  CreditCard,
} from "lucide-react";
import { format } from "date-fns";
import { getInitials } from "@/lib/utils";
import { useState } from "react";
import { VisitsDialog } from "./dialogs/VisitsDialog";
import { RequestsDialog } from "./dialogs/RequestsDialog";
import { VisitReportsDialog } from "./dialogs/VisitReportsDialog";
import { PlansDialog } from "./dialogs/PlansDialog";
import { ForecastsDialog } from "./dialogs/ForecastsDialog";
import { AppraisalsDialog } from "./dialogs/AppraisalsDialog";
import { CoachingDialog } from "./dialogs/CoachingDialog";
import { SafeCldImage } from "@/components/ui/safe-cld-image";

type HRMemberCardProps = {
  member: HRMember;
};

export function HRMemberCard({ member }: HRMemberCardProps) {
  const [visitsOpen, setVisitsOpen] = useState(false);
  const [requestsOpen, setRequestsOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [plansOpen, setPlansOpen] = useState(false);
  const [forecastsOpen, setForecastsOpen] = useState(false);
  const [appraisalsOpen, setAppraisalsOpen] = useState(false);
  const [coachingOpen, setCoachingOpen] = useState(false);
  const [showMoreInfo, setShowMoreInfo] = useState(false);

  const isSupervisor = member.role === "SUPERVISOR";
  const isManager = member.role === "MANAGER";

  // Role-based styling
  const rolePill = isSupervisor
    ? "border-dashboard-blue text-dashboard-blue bg-blue-50"
    : isManager
      ? "border-dashboard-gold text-dashboard-gold bg-yellow-50"
      : "border-dashboard-green text-dashboard-green bg-green-50";

  const avatarGradient = isSupervisor
    ? "bg-gradient-to-br from-[#2563EB] to-[#1E3A8A]"
    : isManager
      ? "bg-gradient-to-br from-[#c9a961] to-[#8B7355]"
      : "bg-gradient-to-br from-[#10B981] to-[#1E8A35]";

  const formatDateSafe = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch {
      return "N/A";
    }
  };

  // Calculate years of service
  const yearsOfService = member.dateOfRecruitment
    ? Math.floor(
        (new Date().getTime() - new Date(member.dateOfRecruitment).getTime()) /
          (1000 * 60 * 60 * 24 * 365),
      )
    : 0;

  // Get combined appraisals
  // const allAppraisals = [
  //   ...member.appraisalsByManager,
  //   ...member.appraisalsForRep,
  // ];

  // Get combined plans

  // Get combined coaching sessions
  const totalCoachingSessions =
    (member.coachings?.length || 0) + (member.repCoachings?.length || 0);
  // const allPlans = [...member.plans, ...member.repPlans];

  return (
    <>
      <div className="border-secondary-light rounded-[10px] border-[.8px] bg-white p-4">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="shrink-0">
            {member.profileImage?.url ? (
              <div className="relative size-14 overflow-hidden rounded-full">
                <SafeCldImage
                  src={member.profileImage?.url || ""}
                  alt={member.name}
                  width={140}
                  height={140}
                  className="rounded-full object-cover"
                />
              </div>
            ) : (
              <div
                className={`${avatarGradient} flex size-14 items-center justify-center rounded-full text-base/4 font-normal text-white`}
              >
                {getInitials(member.name)}
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-base/6 font-semibold text-black">
                {member.name}
              </h3>

              <span
                className={`rounded-xl border px-2 py-0.5 text-xs/4 font-medium ${rolePill}`}
              >
                {isManager
                  ? "Manager"
                  : isSupervisor
                    ? "Supervisor"
                    : "Medical Rep"}
              </span>

              {!member.isActive && (
                <span className="rounded-xl border border-red-200 bg-red-50 px-2 py-0.5 text-xs/4 font-medium text-red-600">
                  Inactive
                </span>
              )}
            </div>

            {/* Main Info Grid */}
            <div className="text-secondary-dark mt-4 grid grid-cols-3 gap-x-6 gap-y-3 text-sm/5">
              {/* Column 1 */}
              <div className="flex flex-col gap-3">
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {member.email}
                </p>
                {member.phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {member.phone}
                  </p>
                )}
                {member.iqamaNumber && (
                  <p className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Iqama: {member.iqamaNumber}
                  </p>
                )}
                {member.passportNumber && (
                  <p className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Passport: {member.passportNumber}
                  </p>
                )}
              </div>

              {/* Column 2 */}
              <div className="flex flex-col gap-3">
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Started {formatDateSafe(member.dateOfRecruitment)}
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {yearsOfService} years of service
                </p>
                {member.dateOfBirth && (
                  <p className="flex items-center gap-2">
                    <Cake className="h-4 w-4" />
                    Born {formatDateSafe(member.dateOfBirth)}
                  </p>
                )}
                {member.lastLogin && (
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Last login: {formatDateSafe(member.lastLogin)}
                  </p>
                )}
              </div>

              {/* Column 3 */}
              <div className="flex flex-col gap-3">
                {member.location && (
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {member.location}
                  </p>
                )}
                {member.department && (
                  <p className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    {member.department}
                  </p>
                )}
                {isSupervisor && member.reps && member.reps.length > 0 && (
                  <p className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Team: {member.reps.length} reps
                  </p>
                )}
                {member.supervisor && (
                  <p className="flex items-center gap-2 text-xs">
                    Supervisor: {member.supervisor.name}
                  </p>
                )}
                {member.manager && (
                  <p className="flex items-center gap-2 text-xs">
                    Manager: {member.manager.name}
                  </p>
                )}
              </div>
            </div>

            {/* Additional Info - Expandable */}
            {(member.bio ||
              member.educationBackground ||
              member.certificates.length > 0 ||
              member.resume) && (
              <div className="mt-4">
                <button
                  onClick={() => setShowMoreInfo(!showMoreInfo)}
                  className="text-dashboard-blue cursor-pointer text-sm font-medium hover:underline"
                >
                  {showMoreInfo ? "Hide" : "Show"} Additional Information
                </button>
                {showMoreInfo && (
                  <div className="mt-3 space-y-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
                    {member.bio && (
                      <div>
                        <p className="font-medium text-black">Bio:</p>
                        <p className="text-slate-600">{member.bio}</p>
                      </div>
                    )}
                    {member.educationBackground && (
                      <div>
                        <p className="flex items-center gap-2 font-medium text-black">
                          <GraduationCap className="h-4 w-4" />
                          Education:
                        </p>
                        <p className="text-slate-600">
                          {member.educationBackground}
                        </p>
                      </div>
                    )}
                    {member.certificates.length > 0 && (
                      <div>
                        <p className="flex items-center gap-2 font-medium text-black">
                          <Award className="h-4 w-4" />
                          Certificates:
                        </p>
                        <ul className="ml-4 list-disc text-slate-600">
                          {member.certificates.map((cert, idx) => (
                            <li key={idx}>{cert}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {member.resume && (
                      <div>
                        <a
                          href={member.resume}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-dashboard-blue flex cursor-pointer items-center gap-2 hover:underline"
                        >
                          <Download className="h-4 w-4" />
                          Download Resume/CV
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Leave Info */}
            {member.leaveDaysCountTotal > 0 && (
              <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm font-medium text-black">
                  Total Leave Days: {member.leaveDaysCountTotal}
                </p>
                {member.leaveStartDate && member.leaveEndDate && (
                  <p className="text-xs text-slate-600">
                    Current Leave: {formatDateSafe(member.leaveStartDate)} -{" "}
                    {formatDateSafe(member.leaveEndDate)}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setVisitsOpen(true)}
                className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-black transition-colors hover:bg-slate-50"
              >
                <Calendar className="h-3.5 w-3.5" />
                {/* Visits ({member.visits.length}) */}
              </button>

              <button
                onClick={() => setRequestsOpen(true)}
                className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-black transition-colors hover:bg-slate-50"
              >
                <ClipboardList className="h-3.5 w-3.5" />
                {/* Requests ({member.requests.length}) */}
              </button>

              <button
                onClick={() => setReportsOpen(true)}
                className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-black transition-colors hover:bg-slate-50"
              >
                <FileText className="h-3.5 w-3.5" />
                {/* Reports ({member.visitReports.length}) */}
              </button>

              <button
                onClick={() => setPlansOpen(true)}
                className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-black transition-colors hover:bg-slate-50"
              >
                <Target className="h-3.5 w-3.5" />
                {/* Plans ({allPlans.length}) */}
              </button>

              <button
                onClick={() => setForecastsOpen(true)}
                className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-black transition-colors hover:bg-slate-50"
              >
                <Package className="h-3.5 w-3.5" />
                {/* Forecasts ({member.forecasts.length}) */}
              </button>

              <button
                onClick={() => setAppraisalsOpen(true)}
                className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-black transition-colors hover:bg-slate-50"
              >
                <TrendingUp className="h-3.5 w-3.5" />
                {/* Appraisals ({allAppraisals.length}) */}
              </button>

              {totalCoachingSessions > 0 && (
                <button
                  onClick={() => setCoachingOpen(true)}
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-black transition-colors hover:bg-slate-50"
                >
                  <GraduationCap className="h-3.5 w-3.5" />
                  {/* Coaching ({totalCoachingSessions}) */}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {/* <VisitsDialog
        open={visitsOpen}
        onOpenChange={setVisitsOpen}
        visits={member.visits}
        userName={member.name}
      />
      <RequestsDialog
        open={requestsOpen}
        onOpenChange={setRequestsOpen}
        requests={member.requests}
        userName={member.name}
      />
      <VisitReportsDialog
        open={reportsOpen}
        onOpenChange={setReportsOpen}
        visitReports={member.visitReports}
        userName={member.name}
      />
      <PlansDialog
        open={plansOpen}
        onOpenChange={setPlansOpen}
        plans={allPlans}
        userName={member.name}
      />
      <ForecastsDialog
        open={forecastsOpen}
        onOpenChange={setForecastsOpen}
        forecasts={member.forecasts}
        userName={member.name}
      />
      <AppraisalsDialog
        open={appraisalsOpen}
        onOpenChange={setAppraisalsOpen}
        appraisals={allAppraisals}
        userName={member.name}
      />
      <CoachingDialog
        open={coachingOpen}
        onOpenChange={setCoachingOpen}
        coachings={member.coachings || []}
        repCoachings={member.repCoachings || []}
        userName={member.name}
      /> */}
    </>
  );
}
