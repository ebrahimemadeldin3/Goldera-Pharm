"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getLastRefreshTimeAction } from "@/lib/utils/get-last-refresh-time";

const Footer = () => {
  const [lastRefresh, setLastRefresh] = useState<string>("");
  const pathname = usePathname();

  // Hide footer completely on CRM feature pages & Medical Rep routes per design system
  const hideFooterRoutes = ["/doctors", "/pharmacies", "/plan", "/visits"];
  const isHidden =
    pathname?.startsWith("/rep") ||
    hideFooterRoutes.some((route) => pathname?.includes(route));

  useEffect(() => {
    if (isHidden) return;
    const fetchLastRefreshTime = async () => {
      try {
        const data = await getLastRefreshTimeAction();
        if (data?.timestamp) {
          const date = new Date(data.timestamp);
          const formatted = date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });
          setLastRefresh(formatted);
        } else {
          setLastRefresh("No recent activity");
        }
      } catch (error) {
        console.error("Failed to fetch last refresh time:", error);
        setLastRefresh("Unavailable");
      }
    };

    fetchLastRefreshTime();
    const interval = setInterval(fetchLastRefreshTime, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [isHidden]);

  if (isHidden) {
    return null;
  }

  return (
    <footer className="border-secondary-light mx-4 flex min-h-[53px] flex-col justify-center gap-1 rounded-md border bg-white px-4 py-3 text-[13px]/5 text-[#717182] sm:mx-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:text-[15px]/5">
      <p>Last data refresh: {lastRefresh || "Loading..."}</p>
      <p>© 2026 GolderaPharm CRM. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
