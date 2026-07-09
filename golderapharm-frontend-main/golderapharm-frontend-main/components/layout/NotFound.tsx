import { CircleAlert } from "lucide-react";
import Link from "next/link";

interface NotFoundProps {
  role?: "manager" | "supervisor" | "rep";
}

const NotFound = ({ role = "manager" }: NotFoundProps) => {
  const colorConfig = {
    manager: {
      iconBg: "border-[#C9A96133]",
      iconText: "text-gold  ",
      title: "from-[#C9A961] to-[#B89951]",
      button: "from-[#C9A961] to-[#B89951]",
      links: "text-gold",
    },
    supervisor: {
      iconBg: "border-[#3B82F633]",
      iconText: "text-dashboard-blue ",
      title: "from-[#2563EB] to-[#1E3A8A]",
      button: "from-[#2563EB] to-[#1E3A8A]",
      links: "text-dashboard-blue",
    },
    rep: {
      iconBg: "border-[#10B98133]",
      iconText: "text-dashboard-green",
      title: " from-[#10B981] to-[#1E8A35]",
      button: " from-[#10B981] to-[#1E8A35]",
      links: "text-dashboard-green",
    },
  };

  const colors = colorConfig[role];

  return (
    <main className="bg-secondary-very-light flex h-[calc(100vh-82px)] w-full items-center justify-center">
      <div className="flex h-[601px] flex-col items-center justify-center gap-10">
        <CircleAlert
          size={64}
          className={`${colors.iconText} size-32 shrink-0 rounded-full border-15 ${colors.iconBg} p-4`}
        />

        <h1
          className={`${colors.title} bg-linear-to-b bg-clip-text text-[120px]/[120px] font-normal text-transparent`}
        >
          404
        </h1>
        <div className="text-center">
          <h2 className="text-base/6 font-normal text-[#1E293B]">
            Page Not Found
          </h2>
          <p className="text-secondary-text mt-4 text-base/6 font-normal">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
        </div>
        <div className="flex items-center gap-6 px-8">
          <button
            // onClick={() => window.history.back()}
            className="text-secondary-dark border-secondary-dark flex w-[130px] cursor-pointer items-center justify-center gap-4 rounded-lg border-[0.8px] py-2 text-sm/5 font-medium"
          >
            Go Back
          </button>

          <Link href="/">
            <button
              className={`flex w-[256px] cursor-pointer items-center justify-center gap-2 rounded-lg bg-linear-to-b ${colors.button} py-2 text-white shadow-md`}
            >
              Back to Dashboard
            </button>
          </Link>
        </div>

        {/* Footer Links */}
        <footer className="border-t-[0.8px] border-[#E2E8F0] pt-8 text-center">
          <p className="text-sm/5 font-normal text-[#94A3B8]">
            Need help? Contact support or check our documentation.
          </p>
          <p
            className={`${colors.links} mt-4 flex items-center justify-center gap-4 text-base/6 font-medium`}
          >
            <span className="cursor-pointer hover:opacity-80">
              Contact Support
            </span>
            <span className="cursor-pointer hover:opacity-80">
              Documentation
            </span>
            <span className="cursor-pointer hover:opacity-80">
              System Status
            </span>
          </p>
        </footer>
      </div>
    </main>
  );
};

export default NotFound;
