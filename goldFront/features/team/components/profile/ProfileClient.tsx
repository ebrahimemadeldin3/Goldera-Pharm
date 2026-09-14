"use client";

import { User } from "../../lib/types";
import { useEditMember } from "../../hooks/useEditMember";
import ProfileHeader from "./ProfileHeader";
import Details from "./Details";
import Accounts from "./Accounts";
import TeamMembers from "./TeamMembers";
import Performance from "./Performance";
import { useRoleUI } from "@/core/ui/role-ui-context";
import { Region } from "@/lib/types/regions";
import { useState, useEffect } from "react";
import { getRegionsAction } from "@/lib/requests/regions";
import { PageContainer } from "@/components/layout/page-container";
import { Files, Gauge, LayoutDashboard, UsersRound } from "lucide-react";
import {
  DocumentsEmploymentCard,
  MemberInformationCard,
  ProfileNavigation,
  type ProfileTabId,
  type ProfileTabItem,
} from "./ProfileInfoCards";

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
  const { role: currentUserRole, user: currentUser } = useRoleUI();
  const isManager = currentUserRole === "MANAGER";
  const isSupervisor = memberDetails.role === "SUPERVISOR";
  const [regions, setRegions] = useState<Region[]>([]);
  const [activeTab, setActiveTab] = useState<ProfileTabId>("overview");

  const {
    isEditMode,
    editedData,
    isPending,
    updateField,
    toggleEditMode,
    saveChanges,
    cancelEdit,
  } = useEditMember(memberDetails, currentUserRole as "MANAGER" | "SUPERVISOR");
  const contextualMemberDetails =
    currentUserRole === "SUPERVISOR" && !memberDetails.reportsTo
      ? { ...memberDetails, reportsTo: currentUser.name }
      : memberDetails;
  const displayMemberDetails = isEditMode
    ? {
        ...contextualMemberDetails,
        name: editedData.name,
        email: editedData.email,
        phone: editedData.phone,
        region: editedData.region,
        isActive: editedData.isActive,
        role: editedData.role,
      }
    : contextualMemberDetails;
  const hasPerformanceData =
    isManager &&
    ((typeof memberDetails.overall === "number" &&
      Number.isFinite(memberDetails.overall)) ||
      Boolean(
        memberDetails.categories && memberDetails.categories.length > 0,
      ) ||
      Boolean(memberDetails.reviewedBy));
  const hasTeamData =
    isManager && isSupervisor && supervisorTeamMembers.length > 0;
  const navigationItems: ProfileTabItem[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    ...(isManager
      ? [{ id: "documents", label: "Documents", icon: Files } as const]
      : []),
    ...(hasTeamData
      ? [{ id: "team", label: "Team", icon: UsersRound } as const]
      : []),
    ...(hasPerformanceData
      ? [{ id: "performance", label: "Performance", icon: Gauge } as const]
      : []),
  ];

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
    <PageContainer className="member-profile-page bg-gp-surface-page flex min-h-[calc(100vh-80px)] flex-col gap-5 overflow-x-hidden">
      <ProfileHeader
        memberDetails={memberDetails}
        backUrl={backUrl}
        isEditMode={isEditMode}
        isPending={isPending}
        onToggleEdit={() => {
          setActiveTab("overview");
          toggleEditMode();
        }}
        onSave={saveChanges}
        onCancel={cancelEdit}
      />

      <Details
        data={contextualMemberDetails}
        isEditMode={isEditMode}
        editedData={{
          name: editedData.name,
          email: editedData.email,
          phone: editedData.phone,
          region: editedData.region,
          isActive: editedData.isActive,
          role: editedData.role,
        }}
        regions={regions}
        onFieldChange={(field, value) => {
          updateField(field as keyof typeof editedData, value as never);
        }}
      />

      {navigationItems.length > 1 && (
        <ProfileNavigation
          items={navigationItems}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      )}

      <section
        id="member-profile-panel-overview"
        role="tabpanel"
        aria-labelledby={
          navigationItems.length > 1 ? "member-profile-tab-overview" : undefined
        }
        aria-label={navigationItems.length > 1 ? undefined : "Overview"}
        hidden={activeTab !== "overview"}
      >
        {activeTab === "overview" && (
          <div
            className={`member-profile-tab-panel grid grid-cols-1 gap-5 ${isManager ? "xl:grid-cols-2" : ""}`}
          >
            <MemberInformationCard data={displayMemberDetails} />

            {isManager && (
              <Accounts
                data={contextualMemberDetails}
                isEditMode={isEditMode}
                editedData={{
                  email: editedData.email,
                  role: editedData.role,
                }}
                onFieldChange={(field, value) =>
                  updateField(field as keyof typeof editedData, value as never)
                }
              />
            )}
          </div>
        )}
      </section>

      {isManager && (
        <div
          id="member-profile-panel-documents"
          role="tabpanel"
          aria-labelledby="member-profile-tab-documents"
          hidden={activeTab !== "documents"}
        >
          {activeTab === "documents" && (
            <div className="member-profile-tab-panel">
              <DocumentsEmploymentCard data={displayMemberDetails} />
            </div>
          )}
        </div>
      )}

      {hasTeamData && (
        <div
          id="member-profile-panel-team"
          role="tabpanel"
          aria-labelledby="member-profile-tab-team"
          hidden={activeTab !== "team"}
        >
          {activeTab === "team" && (
            <div className="member-profile-tab-panel">
              <TeamMembers
                members={supervisorTeamMembers}
                baseUrl="/manager/team"
              />
            </div>
          )}
        </div>
      )}

      {hasPerformanceData && (
        <div
          id="member-profile-panel-performance"
          role="tabpanel"
          aria-labelledby="member-profile-tab-performance"
          hidden={activeTab !== "performance"}
        >
          {activeTab === "performance" && (
            <div className="member-profile-tab-panel">
              <Performance performanceData={memberDetails} />
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
}
