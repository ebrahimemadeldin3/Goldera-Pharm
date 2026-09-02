import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Medical Rep Dashboard",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex w-full min-w-0 flex-1 flex-col pb-2">
      {children}
    </main>
  );
}

