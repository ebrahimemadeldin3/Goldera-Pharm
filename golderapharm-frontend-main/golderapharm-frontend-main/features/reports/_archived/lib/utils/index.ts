import { format } from "date-fns";
export function formatRange(from?: Date | null, to?: Date | null) {
  if (from && to)
    return `${format(from, "MM/dd/yyyy")} - ${format(to, "MM/dd/yyyy")}`;
  if (from && !to) return `${format(from, "MM/dd/yyyy")} - (no end date)`;
  if (!from && to) return `(no start) - ${format(to, "MM/dd/yyyy")}`;
  return "No date range selected";
}
