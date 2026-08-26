import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton({
  columns = 6,
  rows = 8,
}: {
  columns?: number;
  rows?: number;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-[#F9FAFB] border-b border-[#E5E8EF]">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="py-3 px-4 text-left">
                <Skeleton className="h-4 w-20 bg-slate-200" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#EEF1F6] bg-white">
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <tr key={rowIdx}>
              {Array.from({ length: columns }).map((_, colIdx) => (
                <td key={colIdx} className="py-3.5 px-4">
                  <Skeleton
                    className={`h-4 bg-slate-100 ${
                      colIdx === 0 ? "w-6" : colIdx === 1 ? "w-40" : "w-24"
                    }`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
