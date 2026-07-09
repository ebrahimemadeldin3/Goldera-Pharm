import {
  CircleAlert,
  CornerRightDown,
  CircleCheckBig,
  FileText,
} from "lucide-react";
import { NotificationItem } from "../types";

export default function IconByType(type: NotificationItem["type"]) {
  const base = "text-gray-700 size-[20px] mb-auto";
  switch (type) {
    case "alert":
      return <CircleAlert className={`text-amber-600 ${base}`} size={18} />;
    case "drop":
      return <CornerRightDown className={base} size={18} />;
    case "success":
      return (
        <CircleCheckBig className={`text-emerald-600 ${base}`} size={18} />
      );
    case "file":
      return <FileText className={base} size={18} />;
    default:
      return <CircleAlert className={base} size={18} />;
  }
}
