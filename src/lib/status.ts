import { OrderStatus } from "./types";

export const orderStatusMeta: Record<
  OrderStatus,
  { label: string; description: string; tone: "neutral" | "info" | "success" | "warning" | "danger" }
> = {
  submitted: {
    label: "Submitted",
    description: "Sent to the cafe",
    tone: "neutral",
  },
  accepted: {
    label: "Accepted",
    description: "Kitchen acknowledged",
    tone: "info",
  },
  preparing: {
    label: "Preparing",
    description: "Chefs are working on it",
    tone: "info",
  },
  packed: {
    label: "Packed",
    description: "Bagged and sealed",
    tone: "info",
  },
  on_the_way: {
    label: "On the way",
    description: "Rider is en route",
    tone: "info",
  },
  served: {
    label: "Served",
    description: "Brought to your table",
    tone: "success",
  },
  delivered: {
    label: "Delivered",
    description: "Dropped off",
    tone: "success",
  },
  cancelled: {
    label: "Cancelled",
    description: "Stopped per request",
    tone: "danger",
  },
};

export const statusFlow: OrderStatus[] = [
  "submitted",
  "accepted",
  "preparing",
  "packed",
  "on_the_way",
  "delivered",
  "served",
];

export const isFinalStatus = (status: OrderStatus) =>
  status === "cancelled" || status === "delivered" || status === "served";

export const statusProgressIndex = (status: OrderStatus) => {
  const idx = statusFlow.indexOf(status);
  return idx === -1 ? statusFlow.length - 1 : idx;
};

