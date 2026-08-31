const getStatusBadgeStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case "approved":
      return "bg-[#E9F8F1] text-[#168557] border border-[#CBEFDD]";
    case "pending":
      return "bg-[#FFF8E5] text-[#B18732] border border-[#E9DDB8]";
    case "rejected":
      return "bg-[#FEF3F2] text-[#D92D20] border border-[#FECDCA]";
    default:
      return "bg-[#F4F6FA] text-[#667085] border border-[#E5E8EF]";
  }
};

const getResponseBgStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case "approved":
      return "bg-green-stroke"; 
    case "rejected":
      return "bg-red-stroke";
    default:
      return "bg-gray-100";
  }
};

export { getStatusBadgeStyle, getResponseBgStyle };
