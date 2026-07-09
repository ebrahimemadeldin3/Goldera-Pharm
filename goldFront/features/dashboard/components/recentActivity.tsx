import Image from "next/image";
import {
  CircleCheckBig,
  CircleX,
  MessageCircle,
  Triangle,
  ChevronRight,
} from "lucide-react";
import recentActivityIcon from "@/features/dashboard/assets/icons/recentActivity.svg";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

type Activity = {
  id: string;
  text: string;
  time: string;
  variant: "success" | "error" | "info" | "warning";
};

const items: Activity[] = [
  {
    id: "a1",
    text: "Mohamed A. approved Expense Request #1122",
    time: "2 minutes ago",
    variant: "success",
  },
  {
    id: "a2",
    text: "Ahmed M. rejected Sample Request #1120",
    time: "15 minutes ago",
    variant: "error",
  },
  {
    id: "a3",
    text: "Sara L. commented on Marketing Request #1118",
    time: "1 hour ago",
    variant: "info",
  },
  {
    id: "a4",
    text: "Fatima K. approved Leave Request #1115",
    time: "2 hours ago",
    variant: "success",
  },
  {
    id: "a5",
    text: "Coverage in Dammam region below 70%",
    time: "3 hours ago",
    variant: "warning",
  },
];

export default function RecentActivity() {
  const renderIcon = (variant: Activity["variant"]) => {
    if (variant === "success")
      return <CircleCheckBig size={14} style={{ color: "#10B981" }} />;
    if (variant === "error")
      return <CircleX size={14} style={{ color: "#DC2626" }} />;
    if (variant === "info")
      return <MessageCircle size={14} style={{ color: "#2563EB" }} />;
    return <Triangle size={14} style={{ color: "#F59E0B" }} />;
  };

  return (
    <Card className="border-secondary-light rounded-[25px] border bg-white py-6 shadow-none min-[1440px]:w-[530]">
      <CardHeader className="flex items-center gap-4">
        <div className="bg-system-primary flex size-11 items-center justify-center rounded-[15px]">
          <Image
            src={recentActivityIcon}
            alt="Recent activity"
            width={24}
            height={24}
          />
        </div>
        <CardTitle className="text-[20px] font-semibold">
          Recent Activity
        </CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>

      <CardContent className="rounded-lg bg-white">
        <ul className="divide-secondary-light divide-y">
          {items.map((it) => (
            <li key={it.id} className="flex items-start justify-between py-4">
              <div className="flex items-start gap-4">
                <div
                  className="flex size-[26px] items-center justify-center rounded-full border-[0.5px] border-[#9cb8f5]"
                  aria-hidden
                >
                  {renderIcon(it.variant)}
                </div>

                <div className="truncate text-sm text-black">{it.text}</div>
              </div>

              <div className="ml-4 shrink-0">
                <span className="text-secondary-dark text-xs">{it.time}</span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="mt-auto">
        <Link
          href="#"
          className="text-system-primary ml-auto inline-flex items-center gap-1 text-sm font-medium hover:underline"
        >
          View All Activity
          <ChevronRight className="size-4" />
        </Link>
      </CardFooter>
    </Card>
  );
}
