import type { Metadata } from "next";
import { Barlow } from "next/font/google";

import "../styles/globals.css";
import { ThemeProvider } from "@/components/ui/theme/theme-provider";
import MinWidthGuard from "@/components/layout/MinWidthGuard";

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "golderapharm",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${barlow.className} bg-secondary-very-light antialiased`}
      >
        <MinWidthGuard>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </MinWidthGuard>
      </body>
    </html>
  );
}
