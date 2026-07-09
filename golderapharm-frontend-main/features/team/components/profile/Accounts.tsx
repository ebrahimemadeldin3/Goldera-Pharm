"use client";

import {
  Mail,
  Shield,
  Lock,
  Clock4,
  Calendar,
  Eye,
  EyeOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { useState } from "react";

type AccountsProps = {
  data: User;
  isEditMode?: boolean;
  editedData?: {
    email: string;
    employeeId?: string;
    password?: string;
    role: "SUPERVISOR" | "MEDICAL_REP";
  };
  onFieldChange?: <K extends "email" | "employeeId" | "password" | "role">(
    field: K,
    value: string | undefined,
  ) => void;
};

export default function Accounts({
  data,
  isEditMode = false,
  editedData,
  onFieldChange,
}: AccountsProps) {
  const { role: currentUserRole } = useRoleUI();
  const isManager = currentUserRole === "MANAGER";
  const displayData = isEditMode && editedData ? editedData : data;
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Card className="border-secondary-light flex w-full flex-col gap-2 rounded-[14px] border-[0.8px] bg-white shadow-none">
      <CardHeader>
        <CardTitle className="text-dashboard-blue text-[17px] font-semibold">
          Account & Access Information
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2">
                <Mail className="text-secondary-dark h-4 w-4" />
                <div className="text-secondary-dark text-sm font-normal">
                  Email / Username
                </div>
              </div>
              {isEditMode && isManager ? (
                <Input
                  value={displayData.email || ""}
                  onChange={(e) => onFieldChange?.("email", e.target.value)}
                  className="input mt-1 h-8 text-base font-normal"
                  placeholder="Email"
                  type="email"
                />
              ) : (
                <div className="text-base font-normal text-black">
                  {displayData.email}
                </div>
              )}
            </div>

            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2">
                <Lock className="text-secondary-dark h-4 w-4" />
                <div className="text-secondary-dark text-sm font-normal">
                  Password
                </div>
              </div>
              {isEditMode && isManager ? (
                <Input
                  type="password"
                  value={editedData?.password || ""}
                  onChange={(e) => onFieldChange?.("password", e.target.value)}
                  className="input mt-1 h-8 text-base font-normal"
                  placeholder="New password (optional)"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="text-base font-normal text-black">
                    {showPassword ? data.password || "N/A" : "••••••••"}
                  </div>
                  {isManager && data.password && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-secondary-light h-px" />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2">
                <Shield className="text-secondary-dark h-4 w-4" />
                <div className="text-secondary-dark text-sm font-normal">
                  Employee ID
                </div>
              </div>
              {isEditMode && isManager ? (
                <Input
                  value={displayData.employeeId || ""}
                  onChange={(e) =>
                    onFieldChange?.("employeeId", e.target.value)
                  }
                  className="input mt-1 h-8 text-base font-normal"
                  placeholder="Employee ID"
                />
              ) : (
                <div className="text-base font-normal text-black">
                  {data.employeeId}
                </div>
              )}
            </div>

            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2">
                <Shield className="text-secondary-dark h-4 w-4" />
                <div className="text-secondary-dark text-sm font-normal">
                  Access Level
                </div>
              </div>
              {isEditMode && isManager ? (
                <Select
                  value={displayData.role}
                  onValueChange={(value: "SUPERVISOR" | "MEDICAL_REP") =>
                    onFieldChange?.("role", value)
                  }
                >
                  <SelectTrigger className="input mt-1 h-8 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEDICAL_REP">Medical Rep</SelectItem>
                    <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="mt-1">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-medium text-white ${
                      data.role === "SUPERVISOR"
                        ? "bg-dashboard-blue"
                        : "bg-dashboard-green"
                    }`}
                  >
                    {data.role === "MEDICAL_REP"
                      ? "Medical Rep"
                      : data.role === "SUPERVISOR"
                        ? "Supervisor"
                        : data.role}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2">
                <Clock4 className="text-secondary-dark h-4 w-4" />
                <div className="text-secondary-dark text-sm font-normal">
                  Last Login
                </div>
              </div>
              <div className="text-base font-normal text-black">
                {data.lastLogin || "N/A"}
              </div>
            </div>

            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2">
                <Calendar className="text-secondary-dark h-4 w-4" />
                <div className="text-secondary-dark text-sm font-normal">
                  Account Created
                </div>
              </div>
              <div className="text-base font-normal text-black">
                {data.createdAt || "N/A"}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
