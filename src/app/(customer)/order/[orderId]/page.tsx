'use client';

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { StatusTimeline } from "@/components/order/StatusTimeline";
import { StatusPill } from "@/components/order/StatusPill";
import { formatCurrency, formatTime } from "@/lib/format";

export default function OrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const code = params?.orderId;
  const order = useQuery(api.orders.orderDetail, code ? { code } : "skip");

  const totals = useMemo(() => {
    if (!order) return null;
    const itemsTotal = order.items.reduce(
      (sum, item) => sum + (item.price + (item.addOns?.reduce((a, b) => a + b.price, 0) ?? 0)) * item.quantity,
      0,
    );
    return { itemsTotal };
  }, [order]);

  if (order === undefined) {
    return <div className="p-6 text-sm text-muted">Loading order…</div>;
  }

  if (order === null) {
    return <div className="p-6 text-sm text-red-600">Order not found.</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-col gap-2 rounded-3xl border border-border bg-white/80 p-6 shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#2c2218]">{order.code ?? order.id}</h1>
            <p className="text-sm text-muted">
              {order.mode === "table" ? `Table ${order.tableId ?? ""}` : order.contact.address ?? "Delivery"}
            </p>
          </div>
          <StatusPill status={order.status} />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
          <span>{formatCurrency(order.payment.amount)}</span>
          <span>·</span>
          <span>Placed {formatTime(order.createdAt)}</span>
          <span>·</span>
          <span>Contact {order.contact.phone}</span>
        </div>
      </div>

      <div className="mt-4 space-y-3 rounded-3xl border border-border bg-white/80 p-6 shadow-md">
        <p className="text-sm font-semibold text-[#2c2218]">Items</p>
        {order.items.map((item) => (
          <div
            key={item.name + item.notes}
            className="flex justify-between rounded-xl border border-border bg-accent-soft/60 p-3"
          >
            <div>
              <p className="text-sm font-semibold text-[#2c2218]">
                {item.quantity}× {item.name}
              </p>
              {item.notes && (
                <p className="text-xs text-[#3f5d45]">Note: {item.notes}</p>
              )}
            </div>
            <p className="text-sm font-semibold text-[#3f5d45]">
              {formatCurrency(item.price * item.quantity)}
            </p>
          </div>
        ))}
        {totals && (
          <div className="flex justify-between border-t border-border pt-2 text-sm font-semibold text-[#2c2218]">
            <span>Total paid/owing</span>
            <span>{formatCurrency(order.payment.amount)}</span>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-3xl border border-border bg-white/80 p-6 shadow-md">
        <p className="text-sm font-semibold text-[#2c2218]">Status</p>
        <StatusTimeline current={order.status} history={order.statusHistory} />
      </div>
    </div>
  );
}