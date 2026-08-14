import ProfileClient from "@/features/profile/components/ProfileClient";
import { fetchProfile } from "@/features/profile/api";
import { PageContainer } from "@/components/layout/page-container";

export default async function Page() {
  const profile = await fetchProfile();

  return (
    <PageContainer className="flex min-h-[calc(100vh-80px)] flex-col">
      <ProfileClient profile={profile} />
    </PageContainer>
  );
}
