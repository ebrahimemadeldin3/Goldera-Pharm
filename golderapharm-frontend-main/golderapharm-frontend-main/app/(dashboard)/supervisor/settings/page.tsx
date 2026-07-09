import { redirect } from "next/navigation";
import DataManagement from "@/features/settings/components/DataManagement";
import Notifications from "@/features/settings/components/Notifications";
import Preferences from "@/features/settings/components/Preferences";
import SecurityPrivacy from "@/features/settings/components/SecurityPrivacy";

export default function Page() {
  // Settings page is disabled - remove this line to re-enable
  redirect("/supervisor");

  return (
    <main className="bg-secondary-very-light flex flex-col gap-6 p-6 *:min-[1440px]:w-270.75! lg:w-5xl">
      <Notifications />
      <Preferences />
      <SecurityPrivacy />
      <DataManagement />
    </main>
  );
}
