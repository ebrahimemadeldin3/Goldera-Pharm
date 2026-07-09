import { CircleAlert } from "lucide-react";

export default function NotFound() {
  return (
    <main className="bg-secondary-very-light flex h-screen w-full items-center justify-center">
      <div className="flex h-[601px] flex-col items-center justify-center gap-10">
        <CircleAlert
          size={64}
          className="text-gold size-32 shrink-0 rounded-full border-15 border-[#C9A96133] p-4"
        />

        <h1 className="gradient-brown bg-clip-text text-[120px]/[120px] font-normal text-transparent">
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
        <footer className="border-t-[0.8px] border-[#E2E8F0] pt-8 text-center">
          <p className="text-sm/5 font-normal text-[#94A3B8]">
            Need help? Contact support or check our documentation.
          </p>
          <p className="text-gold mt-4 flex items-center justify-center gap-4 text-base/6 font-medium">
            <span
            // href="/support"
            >
              Contact Support
            </span>
            <span
            // href="/docs"
            >
              Documentation
            </span>
            <span
            // href="/status"
            >
              System Status
            </span>
          </p>
        </footer>
      </div>
    </main>
  );
}
