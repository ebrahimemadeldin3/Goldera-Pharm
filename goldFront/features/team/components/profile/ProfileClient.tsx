"use client";

import { User } from "../../lib/types";
import { useEditMember } from "../../hooks/useEditMember";
import ProfileHeader from "./ProfileHeader";
import Details from "./Details";
import Accounts from "./Accounts";
import TeamMembers from "./TeamMembers";
import Performance from "./Performance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRoleUI } from "@/core/ui/role-ui-context";
import { Region } from "@/lib/types/regions";
import { useState, useEffect } from "react";
import { getRegionsAction } from "@/lib/requests/regions";
import { PageContainer } from "@/components/layout/page-container";

type ProfileClientProps = {
  memberDetails: User;
  supervisorTeamMembers?: User[];
  backUrl: string;
};

export default function ProfileClient({
  memberDetails,
  supervisorTeamMembers = [],
  backUrl,
}: ProfileClientProps) {
  const { role: currentUserRole } = useRoleUI();
  const isManager = currentUserRole === "MANAGER";
  const isSupervisor = memberDetails.role === "SUPERVISOR";
  const [regions, setRegions] = useState<Region[]>([]);

  const {
    isEditMode,
    editedData,
    isPending,
    updateField,
    toggleEditMode,
    saveChanges,
    cancelEdit,
  } = useEditMember(memberDetails, currentUserRole as "MANAGER" | "SUPERVISOR");

  // Fetch regions lazily when edit mode is activated
  useEffect(() => {
    if (isEditMode && regions.length === 0) {
      let isMounted = true;

      const fetchRegions = async () => {
        try {
          const res = await getRegionsAction();
          if (res.regions && isMounted) {
            setRegions(res.regions);
          }
        } catch (error) {
          console.error("Failed to fetch regions:", error);
        }
      };

      fetchRegions();

      return () => {
        isMounted = false;
      };
    }
  }, [isEditMode, regions.length]);

  return (
    <PageContainer className="flex flex-col gap-6">
      <ProfileHeader
        memberDetails={memberDetails}
        backUrl={backUrl}
        isEditMode={isEditMode}
        isPending={isPending}
        onToggleEdit={toggleEditMode}
        onSave={saveChanges}
        onCancel={cancelEdit}
      />

      <Details
        data={memberDetails}
        isEditMode={isEditMode}
        editedData={{
          name: editedData.name,
          phone: editedData.phone,
          region: editedData.region,
          isActive: editedData.isActive,
        }}
        regions={regions}
        onFieldChange={(field, value) => {
          updateField(field as keyof typeof editedData, value as never);
        }}
      />

      {isManager && isSupervisor && supervisorTeamMembers.length > 0 && (
        <TeamMembers members={supervisorTeamMembers} baseUrl="/manager/team" />
      )}

      {isManager && (
        <Accounts
          data={memberDetails}
          isEditMode={isEditMode}
          editedData={{
            email: editedData.email,
            employeeId: editedData.employeeId,
            password: editedData.password,
            role: editedData.role,
          }}
          onFieldChange={(field, value) =>
            updateField(field as keyof typeof editedData, value as never)
          }
        />
      )}

      {isManager &&
        (memberDetails.overall ||
          (memberDetails.categories && memberDetails.categories.length > 0) ||
          memberDetails.reviewedBy) && (
          <Performance performanceData={memberDetails} />
        )}

      {!isManager && (
        <Card className="border-secondary-light flex w-full flex-col gap-2 rounded-[14px] border-[0.8px] bg-white shadow-none">
          <CardHeader>
            <CardTitle className="text-dashboard-green text-[17px] font-semibold">
              Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col items-start gap-1">
                <span className="text-secondary-dark text-sm font-normal">
                  Department
                </span>
                <span className="text-base font-normal text-black">
                  {memberDetails.department || "Sales - Jeddah Region"}
                </span>
              </div>

              <div className="flex flex-col items-start gap-1">
                <span className="text-secondary-dark text-sm font-normal">
                  Employment Type
                </span>
                <span className="text-base font-normal text-black">
                  Full-time
                </span>
              </div>

              <div className="flex flex-col items-start gap-1">
                <span className="text-secondary-dark text-sm font-normal">
                  Reports to
                </span>
                <span className="text-base font-normal text-black">
                  {memberDetails.supervisor?.name || "Regional Supervisor"}
                </span>
              </div>

              <div className="flex flex-col items-start gap-1">
                <span className="text-secondary-dark text-sm font-normal">
                  Location
                </span>
                <span className="text-base font-normal text-black">
                  {memberDetails.region?.name &&
                  memberDetails.region?.subRegion?.name
                    ? `${memberDetails.region.name} - ${memberDetails.region.subRegion.name}`
                    : "N/A"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
