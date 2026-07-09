import { toast as sonnerToast } from "sonner";
import { CircleCheckBig, CircleX, AlertTriangle, Info } from "lucide-react";

type ToastOptions = {
  title: string;
  description?: string;
};

export const toast = {
  success: ({ title, description }: ToastOptions) => {
    sonnerToast(title, {
      style: {
        background: "#bbf7d0",
        color: "black",
        border: "1px solid #22c55e",
      },
      description,
      icon: <CircleCheckBig size={20} className="text-green-900" />,
      position: "top-center",
    });
  },

  error: ({ title, description }: ToastOptions) => {
    sonnerToast(title, {
      style: {
        background: "#fecaca",
        color: "black",
        border: "1px solid #ef4444",
      },
      description,
      icon: <CircleX size={20} className="text-red-900" />,
      position: "top-center",
    });
  },

  warning: ({ title, description }: ToastOptions) => {
    sonnerToast(title, {
      style: {
        background: "#fef3c7",
        color: "black",
        border: "1px solid #f59e0b",
      },
      description,
      icon: <AlertTriangle size={20} className="text-yellow-900" />,
      position: "top-center",
    });
  },

  info: ({ title, description }: ToastOptions) => {
    sonnerToast(title, {
      style: {
        background: "#dbeafe",
        color: "black",
        border: "1px solid #3b82f6",
      },
      description,
      icon: <Info size={20} className="text-blue-900" />,
      position: "top-center",
    });
  },
};
