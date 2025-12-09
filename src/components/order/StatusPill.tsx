import { orderStatusMeta } from "@/lib/status";
import { OrderStatus } from "@/lib/types";
import { Badge } from "../ui/badge";

type Props = {
  status: OrderStatus;
};

export function StatusPill({ status }: Props) {
  const meta = orderStatusMeta[status];
  return <Badge tone={meta?.tone ?? "neutral"}>{meta?.label ?? status}</Badge>;
}

