"use client";

import { useEffect, useState } from "react";
import { getLastRefreshTimeAction } from "@/lib/utils/get-last-refresh-time";

const Footer = () => {
  const [lastRefresh, setLastRefresh] = useState<string>("");

  useEffect(() => {
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
  }, []);

  return (
    <footer className="border-secondary-light flex min-h-[53px] items-center justify-between rounded-md border bg-white px-6 text-[15px]/5 text-[#717182] min-[1440px]:mx-6 min-[1440px]:w-270.75! lg:w-5xl">
      <p>Last data refresh: {lastRefresh || "Loading..."}</p>
      <p>© 2026 GolderaPharm CRM. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
