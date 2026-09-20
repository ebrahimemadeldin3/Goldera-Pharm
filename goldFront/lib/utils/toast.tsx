import { toast as sonnerToast } from "sonner";
import { CircleCheckBig, CircleX, AlertTriangle, Info } from "lucide-react";

type ToastOptions = {
  title: string;
  description?: string;
};

const baseToastStyle = {
  background: "#FFFFFF",
  color: "#101D36",
  border: "1px solid #E5E8EF",
  borderRadius: "14px",
  boxShadow: "0 16px 36px rgba(16, 29, 54, 0.12)",
} as const;

export const toast = {
  success: ({ title, description }: ToastOptions) => {
    sonnerToast(title, {
      style: baseToastStyle,
      description,
      icon: <CircleCheckBig size={18} className="text-gp-success" />,
      position: "top-right",
    });
  },

  error: ({ title, description }: ToastOptions) => {
    sonnerToast(title, {
      style: baseToastStyle,
      description,
      icon: <CircleX size={18} className="text-gp-danger" />,
      position: "top-right",
    });
  },

  warning: ({ title, description }: ToastOptions) => {
    sonnerToast(title, {
      style: baseToastStyle,
      description,
      icon: <AlertTriangle size={18} className="text-gp-warning" />,
      position: "top-right",
    });
  },

  info: ({ title, description }: ToastOptions) => {
    sonnerToast(title, {
      style: baseToastStyle,
      description,
      icon: <Info size={18} className="text-[#527CA5]" />,
      position: "top-right",
    });
  },
};
