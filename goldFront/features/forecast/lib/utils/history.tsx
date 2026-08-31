export const getStatusBadge = (status: string) => {
  switch (status) {
    case "APPROVED":
      return (
        <span className="inline-flex items-center rounded-full bg-[#E9F8F1] border border-[#CBEFDD] px-2.5 py-0.5 text-xs font-semibold text-[#168557]">
          Approved
        </span>
      );
    case "PENDING":
      return (
        <span className="inline-flex items-center rounded-full bg-[#FFF8E5] border border-[#E9DDB8] px-2.5 py-0.5 text-xs font-semibold text-[#B18732]">
          Pending
        </span>
      );
    case "REJECTED":
      return (
        <span className="inline-flex items-center rounded-full bg-[#FEF3F2] border border-[#FECDCA] px-2.5 py-0.5 text-xs font-semibold text-[#D92D20]">
          Rejected
        </span>
      );
    default:
      return null;
  }
};

export const getPeriodBadge = (periodType: string) => {
  return (
    <span className="inline-flex items-center rounded-full bg-[#F6F8FB] border border-[#E5E8EF] px-2.5 py-0.5 text-xs font-semibold text-[#344054]">
      {periodType === "MONTHLY" ? "monthly" : "quarterly"}
    </span>
  );
};
