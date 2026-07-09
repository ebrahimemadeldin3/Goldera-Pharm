import { Button } from "@/components/ui/button";

export default function SegmentedButton({
  label,
  count,
  active,
  onClick,
  countColor = "#6B7280",
}: {
  label: string;
  count?: number;
  active?: boolean;
  onClick?: () => void;
  countColor?: string;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      className={`h-9 gap-2 rounded-full px-3 text-sm/5 font-medium shadow-none ${
        active
          ? "bg-white text-black hover:bg-white"
          : "text-secondary-dark hover:bg-secondary-very-light cursor-pointer"
      }`}
    >
      <span className="text-sm">{label}</span>
      {typeof count === "number" && (
        <span
          className="rounded-full bg-white px-2 text-[11px] font-medium"
          style={{
            border: "1px solid #E6EEF8",
            color: active ? "#000000" : countColor,
          }}
        >
          {count}
        </span>
      )}
    </Button>
  );
}
