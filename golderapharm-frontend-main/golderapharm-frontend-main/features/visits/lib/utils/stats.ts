import { Visit } from "../types/ui";

export type VisitStats = {
  total: number;
  completed: number;
  today: number;
};

/**
 * Calculate visit statistics from visits array
 */
export function calculateVisitStats(visits: Visit[] = []): VisitStats {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (visits.length === 0) {
    return {
      total: 0,
      completed: 0,
      today: 0,
    };
  }

  return {
    total: visits.length,
    completed: visits.filter((v) => v.status === "COMPLETED").length,
    today: visits.filter((v) => {
      const visitDate = new Date(v.date);
      visitDate.setHours(0, 0, 0, 0);
      return visitDate.getTime() === today.getTime();
    }).length,
  };
}
