import DataManagement from "@/features/settings/components/DataManagement";
import Notifications from "@/features/settings/components/Notifications";
import Preferences from "@/features/settings/components/Preferences";
import SecurityPrivacy from "@/features/settings/components/SecurityPrivacy";
import { PageContainer } from "@/components/layout/page-container";
import { getReferenceDataAction } from "@/features/settings/api/reference-data";
import { ReferenceData } from "@/features/settings/components/ReferenceData";

export default async function Page() {
  const references = await getReferenceDataAction();

  return (
    <PageContainer className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      {references.success ? (
        <ReferenceData data={references.data} />
      ) : (
        <p role="alert" className="text-gp-danger">
          {references.error.message}
        </p>
      )}
      <Notifications />
      <Preferences />
      <SecurityPrivacy />
      <DataManagement />
    </PageContainer>
  );
}
