import { sampleOrders } from "@/lib/sampleData";
import { StatCard } from "@/components/owner/StatCard";
import { OrderCard } from "@/components/order/OrderCard";

export default function OwnerDashboard() {
  const live = sampleOrders.filter(
    (o) => !["served", "delivered", "cancelled"].includes(o.status),
  );
  const completed = sampleOrders.filter((o) => ["served", "delivered"].includes(o.status));

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-[var(--muted)]">Owner view</p>
          <h1 className="text-2xl font-bold text-[#2c2218]">Live orders</h1>
        </div>
        <div className="flex gap-2">
          <StatCard title="Live tickets" value={live.length} />
          <StatCard title="Completed today" value={completed.length} />
        </div>
      </div>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-[#3f3225]">In progress</p>
          {live.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
        <div className="space-y-3">
          <p className="text-sm font-semibold text-[#3f3225]">History</p>
          {completed.map((order) => (
            <OrderCard key={order.id} order={order} compact />
          ))}
        </div>
      </section>
    </div>
  );
}

