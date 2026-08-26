import Image from "next/image";

export function AuthWorkspaceLoading({
  title = "Preparing your workspace",
  subtitle = "This will only take a moment.",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <main className="flex h-screen w-full flex-col items-center justify-center bg-[#F6F8FB] px-4 text-[#182033]">
      <div className="flex flex-col items-center text-center">
        {/* GolderaPharm Logo */}
        <div className="relative mb-6 flex size-16 items-center justify-center rounded-[14px] border border-[#E9DDB8] bg-white p-3 shadow-[0_10px_28px_rgba(201,164,76,0.15)]">
          <Image
            src="/logos/logo.webp"
            width={48}
            height={56}
            alt="GolderaPharm"
            priority
            className="object-contain"
          />
        </div>

        {/* Brand Name & Title */}
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8A6515]">
          GolderaPharm CRM
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-[#182033] sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 text-sm font-medium text-[#667085]">
          {subtitle}
        </p>

        {/* Subtle Gold Animated Progress Indicator */}
        <div className="relative mt-8 h-1 w-64 overflow-hidden rounded-full bg-[#E5E8EF]">
          <div className="absolute top-0 h-full w-1/2 rounded-full bg-gradient-to-r from-[#D8B85A] via-[#C9A44C] to-[#B18732] animate-loading-line" />
        </div>

        {/* Soft Pulsing Dots */}
        <div className="mt-5 flex items-center justify-center gap-2">
          <div className="size-2 rounded-full bg-[#C9A44C] animate-pulse [animation-delay:0ms]" />
          <div className="size-2 rounded-full bg-[#C9A44C] animate-pulse [animation-delay:150ms]" />
          <div className="size-2 rounded-full bg-[#C9A44C] animate-pulse [animation-delay:300ms]" />
        </div>
      </div>
    </main>
  );
}
