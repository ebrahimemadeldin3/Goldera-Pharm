"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AddMemberDialog from "./AddMemberDialog";
import TeamList from "./TeamList";
import { User } from "../lib/types";
import { Region } from "@/lib/types/regions";
import { PageContainer } from "@/components/layout/page-container";

type TeamPageClientProps = {
  supervisors: User[];
  medicalReps: User[];
  regions: Region[];
  stats: {
    totalMembers: number;
    supervisorsCount: number;
    repsCount: number;
  };
  success: boolean;
  openDialog: boolean;
  page?: number;
  limit?: number;
  medicalRepsTotalCount?: number;
  supervisorsTotalCount?: number;
};

export default function TeamPageClient({
  supervisors,
  medicalReps,
  regions,
  stats,
  success,
  openDialog,
  page = 1,
  limit = 10,
  medicalRepsTotalCount = 0,
  supervisorsTotalCount = 0,
}: TeamPageClientProps) {
  const router = useRouter();

  useEffect(() => {
    if (openDialog) {
      // Trigger dialog opening by clicking the button
      const dialogTrigger = document.querySelector(
        '[data-dialog-trigger="add-member"]',
      ) as HTMLButtonElement;
      if (dialogTrigger) {
        dialogTrigger.click();
      }
      // Clean up URL
      router.replace("/manager/team");
    }
  }, [openDialog, router]);

  return (
    <PageContainer className="min-h-[calc(100vh-80px)]">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl/9 font-normal text-black md:text-[34px]/10">
            Meet the team
          </h1>
          <p className="text-secondary-dark text-base/6">
            Manage and monitor your team
          </p>
        </div>

        <AddMemberDialog supervisors={supervisors} regions={regions} />
      </header>

      {success ? (
        <TeamList
          members={[]}
          medicalReps={medicalReps}
          supervisors={supervisors}
          stats={stats}
          page={page}
          limit={limit}
          medicalRepsTotalCount={medicalRepsTotalCount}
          supervisorsTotalCount={supervisorsTotalCount}
        />
      ) : (
        <div className="text-secondary-dark mt-8 text-center">
          Failed to load team members
        </div>
      )}
    </PageContainer>
  );
}
