import { Order } from "@/lib/types";
import { formatCurrency, formatTime } from "@/lib/format";
import { StatusPill } from "./StatusPill";
import { Badge } from "../ui/badge";

type Props = {
  order: Order;
  compact?: boolean;
};

export function OrderCard({ order, compact }: Props) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white/80 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <p className="text-base font-semibold text-[#2c2218]">
              {order.id}
            </p>
            <StatusPill status={order.status} />
          </div>
          <p className="text-sm text-[var(--muted)]">
            {order.mode === "table"
              ? `Table ${order.tableId ?? ""}`
              : order.contact.address ?? "Delivery"}
          </p>
        </div>
        <div className="text-right text-sm font-semibold text-[#3f5d45]">
          {formatCurrency(order.payment.amount)}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {order.items.map((item) => (
          <Badge key={item.itemId + item.variantName} tone="neutral">
            {item.quantity}× {item.name}
          </Badge>
        ))}
      </div>

      {!compact && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--muted)]">
          <span>
            Placed {formatTime(order.createdAt)} · Updated{" "}
            {formatTime(order.updatedAt)}
          </span>
          {order.etaMinutes && (
            <span className="font-semibold text-[#3f5d45]">
              ETA {order.etaMinutes} mins
            </span>
          )}
        </div>
      )}
    </div>
  );
}

