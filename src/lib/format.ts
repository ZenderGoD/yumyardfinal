import { format } from "date-fns";

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export const formatTime = (timestamp: number) => format(new Date(timestamp), "HH:mm");

