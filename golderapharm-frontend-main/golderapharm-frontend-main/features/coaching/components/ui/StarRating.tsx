import { Star } from "lucide-react";

export function StarRating({
  value = 0,
  size = 20,
}: {
  value?: number;
  size?: number;
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
              filled ? "fill-gold stroke-gold" : "stroke-gold"
            }
          />
        );
      })}
    </div>
  );
}
