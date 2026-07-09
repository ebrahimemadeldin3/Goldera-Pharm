import ImageCard from "@/features/profile/components/ImageCard";
// import PerformanceStats from "@/features/profile/components/PerformanceStats";
import PersonalInformation from "@/features/profile/components/PersonalInformation";
import { fetchProfile } from "@/features/profile/api";

export default async function Page() {
  const profile = await fetchProfile();

  return (
    <main className="bg-secondary-very-light flex min-h-[calc(100vh-80px)] gap-6 p-5">
      <section className="flex flex-col gap-6">
        <ImageCard profile={profile} />
        {/* <PerformanceStats profile={profile} /> */}
      </section>
      <PersonalInformation profile={profile} />
    </main>
  );
}
