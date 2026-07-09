export default function Loading() {
  return (
    <main className="bg-secondary-very-light flex h-[calc(100vh-82px)] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-8">
        <h1 className="text-[40px]/[20px] font-normal text-[#1E293B]">
          Loading
        </h1>
        <p className="text-secondary-text text-[22px]/[32px] font-normal">
          Please wait while we prepare your data
        </p>
        <div className="flex items-center gap-2 *:size-2">
          <div className="bg-gold animate-pulse rounded-full [animation-delay:0ms]"></div>
          <div className="bg-gold animate-pulse rounded-full [animation-delay:150ms]"></div>
          <div className="bg-gold animate-pulse rounded-full [animation-delay:300ms]"></div>
        </div>
        <div className="relative h-1 w-[290px] rounded-full bg-gray-200">
          <div className="bg-gold animate-loading-line absolute top-0 h-full rounded-full"></div>
        </div>
      </div>
    </main>
  );
}
