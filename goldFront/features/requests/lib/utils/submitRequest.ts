const getStatusBadgeStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case "approved":
      return "bg-dashboard-green text-white";
    case "pending":
      return "bg-dashboard-orange text-white";
    case "rejected":
      return "bg-dashboard-red text-white";
    default:
      return "bg-gray-500 text-white";
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
