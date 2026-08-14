import { cn } from "@/lib/utils";

type PageContainerProps = {
  className?: string;
  children: React.ReactNode;
};

export function PageContainer({ className, children }: PageContainerProps) {
  return (
    <main
      className={cn(
        "bg-secondary-very-light w-full min-w-0 px-4 py-5 sm:px-5 min-[1440px]:p-6",
        className,
      )}
    >
      {children}
    </main>
  );
}
