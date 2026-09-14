"use client";

import {
  Building2,
  CalendarDays,
  Clock3,
  Fingerprint,
  IdCard,
  Mail,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "@/features/team/lib/types";
import { useRoleUI } from "@/core/ui/role-ui-context";
import {
  CopyableValue,
  formatMaybeDate,
  InformationRow,
  MissingValue,
  ProfilePanelHeader,
  RolePill,
} from "./ProfileInfoCards";

type AccountsProps = {
  data: User;
  isEditMode?: boolean;
  editedData?: {
    email: string;
    role: "SUPERVISOR" | "MEDICAL_REP";
  };
  onFieldChange?: <K extends "email" | "role">(field: K, value: string) => void;
};

const inputClassName =
  "h-10 rounded-[10px] border-gp-border-control bg-gp-surface-control text-gp-text-primary shadow-none transition-[border-color,background-color,box-shadow] duration-[160ms] placeholder:text-gp-text-placeholder focus-visible:border-gp-gold-500 focus-visible:ring-gp-gold-500/10";

export default function Accounts({
  data,
  isEditMode = false,
  editedData,
  onFieldChange,
}: AccountsProps) {
  const { role: currentUserRole } = useRoleUI();
  const isManager = currentUserRole === "MANAGER";
  const displayData = isEditMode && editedData ? editedData : data;
  const lastLogin = formatMaybeDate(data.lastLogin, true);
  const accountCreated = formatMaybeDate(
    data.createdAt || data.accountCreated,
    true,
  );
  const reportsTo =
    data.supervisor?.name?.trim() ||
    data.reportsTo?.trim() ||
    data.manager?.name?.trim() ||
    "";

  return (
    <section className="member-profile-info-panel border-gp-border-default bg-gp-surface-card shadow-gp-card rounded-[16px] border p-5">
      <ProfilePanelHeader
        icon={Fingerprint}
        title="Account & Organization"
        description="Account access, reporting line and organization metadata."
      />

      <dl className="mt-1">
        <InformationRow icon={Mail} label="Account Email" delay={40}>
          {isEditMode && isManager ? (
            <Input
              value={displayData.email || ""}
              onChange={(event) => onFieldChange?.("email", event.target.value)}
              className={inputClassName}
              placeholder="Email"
              type="email"
            />
          ) : (
            <CopyableValue value={displayData.email} label="Email" />
          )}
        </InformationRow>

        <InformationRow icon={IdCard} label="Employee ID" delay={80}>
          <CopyableValue
            value={data.employeeId}
            label="Employee ID"
            fallback="Not assigned"
          />
        </InformationRow>

        <InformationRow
          icon={ShieldCheck}
          label="Access Level"
          tooltip="Role-based access currently assigned to this member."
          delay={120}
        >
          {isEditMode && isManager ? (
            <Select
              value={displayData.role}
              onValueChange={(value: "SUPERVISOR" | "MEDICAL_REP") =>
                onFieldChange?.("role", value)
              }
            >
              <SelectTrigger className={`${inputClassName} w-full`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MEDICAL_REP">
                  Medical Representative
                </SelectItem>
                <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <RolePill role={displayData.role} />
          )}
        </InformationRow>

        <InformationRow icon={UsersRound} label="Reports To" delay={160}>
          {reportsTo ? (
            <span title={reportsTo}>{reportsTo}</span>
          ) : (
            <MissingValue>Not assigned</MissingValue>
          )}
        </InformationRow>

        <InformationRow icon={Building2} label="Department" delay={200}>
          {data.department ? (
            <span title={data.department}>{data.department}</span>
          ) : (
            <MissingValue>Not provided</MissingValue>
          )}
        </InformationRow>

        <InformationRow
          icon={Clock3}
          label="Last Login"
          tooltip="The most recent sign-in time available for this account."
          delay={240}
        >
          {lastLogin || <MissingValue>No activity yet</MissingValue>}
        </InformationRow>

        <InformationRow icon={CalendarDays} label="Account Created" delay={280}>
          {accountCreated || <MissingValue>Not provided</MissingValue>}
        </InformationRow>
      </dl>
    </section>
  );
}
