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
    <RoleUIProvider
      role={user.data.role}
      user={{
        name: user.data.name,
        email: user.data.email,
        profileImage: user.data.profileImage,
      }}
    >
      <main className="bg-secondary-very-light flex h-dvh min-h-dvh w-full items-stretch overflow-hidden">
        <AppSidebar />
        <section className="flex h-dvh min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <Header />
          <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
            {children}
          </main>
        </section>
        <Toaster />
      </main>
    </RoleUIProvider>
  );
}
