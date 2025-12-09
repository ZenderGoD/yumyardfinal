import { notFound } from "next/navigation";
import { sampleOrders } from "@/lib/sampleData";
import { formatCurrency } from "@/lib/format";
import { StatusTimeline } from "@/components/order/StatusTimeline";
import { StatusPill } from "@/components/order/StatusPill";

type Props = {
  params: Promise<{ orderId: string }>;
};

export default async function OrderDetailPage({ params }: Props) {
  const { orderId } = await params;
  const order = sampleOrders.find((o) => o.id === orderId);
  if (!order) return notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-col gap-2 rounded-3xl border border-[var(--border)] bg-white/80 p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm text-[var(--muted)]">Order</p>
            <h1 className="text-2xl font-bold text-[#2c2218]">{order.id}</h1>
            <p className="text-sm text-[var(--muted)]">
              {order.mode === "table"
                ? `Table ${order.tableId}`
                : order.contact.address ?? "Delivery"}
            </p>
          </div>
          <div className="flex flex-col items-end">
            <StatusPill status={order.status} />
            <p className="text-sm font-semibold text-[#3f5d45]">
              {formatCurrency(order.payment.amount)}
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 text-sm">
          {order.items.map((item) => (
            <div
              key={item.itemId + item.notes}
              className="flex justify-between rounded-xl border border-[var(--border)] bg-[var(--accent-soft)]/60 p-3"
            >
              <div>
                <p className="font-semibold text-[#2c2218]">
                  {item.quantity}× {item.name}
                </p>
                {item.notes && <p className="text-xs text-[#3f5d45]">{item.notes}</p>}
              </div>
              <p className="font-semibold text-[#3f5d45]">
                {formatCurrency(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-[var(--border)] bg-white/80 p-6 shadow-md">
        <h2 className="text-lg font-semibold text-[#2c2218]">Live status</h2>
        <p className="text-sm text-[var(--muted)]">
          Accepted → Preparing → Packed → On the way → Delivered/Served
        </p>
        <div className="mt-4">
          <StatusTimeline current={order.status} history={order.statusHistory} />
        </div>
      </div>
    </div>
  );
}

