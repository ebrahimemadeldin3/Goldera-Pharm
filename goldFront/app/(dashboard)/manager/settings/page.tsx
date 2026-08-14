import { redirect } from "next/navigation";
import DataManagement from "@/features/settings/components/DataManagement";
import Notifications from "@/features/settings/components/Notifications";
import Preferences from "@/features/settings/components/Preferences";
import SecurityPrivacy from "@/features/settings/components/SecurityPrivacy";
import { PageContainer } from "@/components/layout/page-container";

export default function Page() {
  // Settings page is disabled - remove this line to re-enable
  redirect("/manager");

  return (
    <PageContainer className="flex flex-col gap-6">
      <Notifications />
      <Preferences />
      <SecurityPrivacy />
      <DataManagement />
    </PageContainer>
  );
}
