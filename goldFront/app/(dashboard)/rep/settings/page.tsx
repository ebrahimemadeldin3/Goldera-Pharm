import { redirect } from "next/navigation";
import DataManagement from "@/features/settings/components/DataManagement";
import Notifications from "@/features/settings/components/Notifications";
import Preferences from "@/features/settings/components/Preferences";
import SecurityPrivacy from "@/features/settings/components/SecurityPrivacy";
import { PageContainer } from "@/components/layout/page-container";

export default function Page() {
  // Settings page is disabled for medical rep - redirect to dashboard
  redirect("/rep");

  return (
    <PageContainer className="flex flex-col gap-6">
      <header className="flex flex-col items-start justify-center">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-[#E9F8F1] border border-[#CBEFDD] px-2.5 py-0.5 text-[11px] font-semibold text-[#168557] uppercase tracking-wider">
            Account & System
          </span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#182033] sm:text-3xl">
          Settings & Preferences
        </h1>
        <p className="mt-0.5 text-sm text-[#667085]">
          Manage your notification settings, display preferences, and security
        </p>
      </header>

      <div className="space-y-6">
        <Notifications />
        <Preferences />
        <SecurityPrivacy />
        <DataManagement />
      </div>
    </PageContainer>
  );
}
