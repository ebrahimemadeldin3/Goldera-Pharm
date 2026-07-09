export const getStatusBadge = (status: string) => {
  switch (status) {
    case "APPROVED":
      return (
        <span className="bg-dashboard-green rounded-full px-2 py-0.5 text-xs/4 font-medium text-white">
          Approved
        </span>
      );
    case "PENDING":
      return (
        <span className="bg-dashboard-orange rounded-full px-2 py-0.5 text-xs/4 font-medium text-white">
          Pending
        </span>
      );
    case "REJECTED":
      return (
        <span className="bg-dashboard-red rounded-full px-2 py-0.5 text-xs/4 font-medium text-white">
          Rejected
        </span>
      );
    default:
      return null;
  }
};

export const getPeriodBadge = (periodType: string) => {
  return (
    <span className="border-dashboard-green text-dashboard-green rounded-full border bg-white px-2 py-0.5 text-xs/4 font-medium">
      {periodType === "MONTHLY" ? "monthly" : "quarterly"}
    </span>
  );
};
