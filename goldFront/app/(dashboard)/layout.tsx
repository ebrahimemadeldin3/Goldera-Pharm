import { AppSidebar } from "@/components/layout/sidebar/app-sidebar";
import Header from "@/components/layout/Header";
import { Toaster } from "@/components/ui/sonner";
import { RoleUIProvider } from "@/core/ui/role-ui-context";
import { getCurrentUser } from "@/features/auth/api";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }

  return (
    <main className="relative mx-auto w-fit">
      <RoleUIProvider
        role={user.data.role}
        user={{
          name: user.data.name,
          email: user.data.email,
          profileImage: user.data.profileImage,
        }}
      >
        <Header />
        <main className="flex">
          <AppSidebar />
          {children}
        </main>
      </RoleUIProvider>
      <Toaster />
    </main>
  );
}
