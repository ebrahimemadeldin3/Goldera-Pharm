import { Star } from "lucide-react";

export function StarRating({
  value = 0,
  size = 20,
  isRep = true,
}: {
  value?: number;
  size?: number;
  isRep?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < Math.round(value);
        return (
          <Star
            key={i}
            style={{ width: size, height: size }}
            className={
              filled
                ? isRep
                  ? "fill-[#168557] stroke-[#168557]"
                  : "fill-[#F59E0B] stroke-[#F59E0B]"
                : "fill-none stroke-[#D0D5DD]"
            }
          />
        );
      })}
    </div>
  );
}
