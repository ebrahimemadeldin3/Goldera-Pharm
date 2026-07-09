import Footer from "@/components/layout/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Supervisor Dashboard",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex w-[1083px] flex-col pb-2">
      {children} <Footer />
    </main>
  );
}
