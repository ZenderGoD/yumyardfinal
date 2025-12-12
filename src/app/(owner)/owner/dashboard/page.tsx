'use client';

import { useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { StatCard } from "@/components/owner/StatCard";
import { OrderCard } from "@/components/order/OrderCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import Counter from "@/components/ui/counter";
import { Order } from "@/lib/types";

export type OrderTab =
  | "all"
  | "submitted"
  | "accepted"
  | "preparing"
  | "packed"
  | "on_the_way"
  | "served"
  | "delivered"
  | "cancelled";

export function normalizeTab(tab?: string | null): OrderTab {
  const allowed: OrderTab[] = [
    "all",
    "submitted",
    "accepted",
    "preparing",
    "packed",
    "on_the_way",
    "served",
    "delivered",
    "cancelled",
  ];
  if (!tab) return "all";
  const hit = allowed.find((t) => t === tab);
  return hit ?? "all";
}

export default function OwnerDashboard({
  tab = "all",
  onTabChange,
}: {
  tab?: OrderTab;
  onTabChange?: (tab: OrderTab) => void;
}) {
  const live = useQuery(api.orders.listLive) ?? [];
  const recent = useQuery(api.orders.listRecent, { limit: 100 }) ?? [];
  const customers = useQuery(api.customers.list) ?? [];
  const startOfToday = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.getTime();
  }, []);
  const customersToday = useMemo(() => customers.filter((c) => c.lastSeenAt >= startOfToday).length, [customers, startOfToday]);
  const customerPlaces = useMemo(() => {
    const digits = Math.max(3, String(Math.max(customersToday, 0)).length);
    return Array.from({ length: digits }, (_, idx) => 10 ** (digits - idx - 1));
  }, [customersToday]);
  const completed = useMemo(() => recent.filter((o) => ["served", "delivered"].includes(o.status)), [recent]);

  const ordersForTab = useMemo(() => {
    const source = tab === "all" ? recent : recent.filter((o) => o.status === tab);
    return source.sort((a, b) => b.createdAt - a.createdAt);
  }, [recent, tab]);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: recent.length };
    for (const o of recent) {
      counts[o.status] = (counts[o.status] ?? 0) + 1;
    }
    return counts;
  }, [recent]);

  const handleTabChange = (next: OrderTab) => {
    onTabChange?.(next);
  };

  const updateStatus = useMutation(api.orders.updateStatus);
  const markPayment = useMutation(api.orders.markPayment);
  const setEta = useMutation(api.orders.setEta);

  const changeStatus = async (orderId: Id<"orders">, status: Order["status"]) => {
    try {
      await updateStatus({ orderId, status });
      toast.success(`Marked ${status}`);
    } catch (err) {
      console.error(err);
      toast.error("Could not update status");
    }
  };

  const handleEta = async (orderId: Id<"orders">) => {
    if (typeof window === "undefined" || typeof window.prompt !== "function") {
      toast.error("ETA prompt not supported in this environment.");
      return;
    }
    const val = window.prompt("ETA in minutes?");
    if (val === null) return;
    const eta = Number(val);
    if (Number.isNaN(eta)) {
      toast.error("Enter a valid number");
      return;
    }
    try {
      await setEta({ orderId, etaMinutes: eta });
      toast.success(`ETA set to ${eta} mins`);
    } catch (err) {
      console.error(err);
      toast.error("Could not set ETA");
    }
  };

  const handlePaid = async (orderId: Id<"orders">) => {
    try {
      await markPayment({ orderId, status: "paid" });
      toast.success("Marked paid");
    } catch (err) {
      console.error(err);
      toast.error("Could not mark paid");
    }
  };

  const renderActions = (order: Order) => (
    <div className="mt-2 flex flex-wrap gap-2 text-xs">
      <Button
        size="xs"
        variant={order.status === "accepted" ? "secondary" : "outline"}
        disabled={order.status === "accepted"}
        onClick={() => changeStatus(order.id as unknown as Id<"orders">, "accepted")}
      >
        Accept
      </Button>
      <Button
        size="xs"
        variant={order.status === "preparing" ? "secondary" : "outline"}
        disabled={order.status === "preparing"}
        onClick={() => changeStatus(order.id as unknown as Id<"orders">, "preparing")}
      >
        Preparing
      </Button>
      <Button
        size="xs"
        variant={order.status === "packed" ? "secondary" : "outline"}
        disabled={order.status === "packed"}
        onClick={() => changeStatus(order.id as unknown as Id<"orders">, "packed")}
      >
        Packed
      </Button>
      <Button
        size="xs"
        variant={order.status === (order.mode === "delivery" ? "on_the_way" : "served") ? "secondary" : "outline"}
        disabled={order.status === (order.mode === "delivery" ? "on_the_way" : "served")}
        onClick={() =>
          changeStatus(order.id as unknown as Id<"orders">, order.mode === "delivery" ? "on_the_way" : "served")
        }
      >
        {order.mode === "delivery" ? "On the way" : "Served"}
      </Button>
      <Button size="xs" variant="secondary" onClick={() => handleEta(order.id as unknown as Id<"orders">)}>
        Set ETA
      </Button>
      <Button
        size="xs"
        variant={order.payment.status === "paid" ? "secondary" : "outline"}
        disabled={order.payment.status === "paid"}
        onClick={() => handlePaid(order.id as unknown as Id<"orders">)}
      >
        Mark paid
      </Button>
    </div>
  );

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted">Owner view</p>
            <h1 className="text-2xl font-bold text-[#2c2218]">Live orders</h1>
          </div>
          <div className="flex flex-wrap items-stretch gap-2">
            <StatCard title="Live tickets" value={live.length} />
            <StatCard title="Completed recently" value={completed.length} />
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-[#2f4d34] px-4 py-3 text-white shadow-lg shadow-[--accent-soft]/70">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">Customers today</p>
                <div className="mt-1 flex items-end gap-2">
                  <Counter
                    value={customersToday}
                    places={customerPlaces}
                    fontSize={24}
                    padding={3}
                    gap={4}
                    textColor="white"
                    fontWeight={800}
                    gradientFrom="rgba(0,0,0,0.25)"
                    gradientTo="transparent"
                  />
                  <span className="text-xs font-semibold text-white/80">guests</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          {[
            { key: "all", label: "All" },
            { key: "submitted", label: "Submitted" },
            { key: "accepted", label: "Accepted" },
            { key: "preparing", label: "Preparing" },
            { key: "packed", label: "Packed" },
            { key: "on_the_way", label: "On the way" },
            { key: "served", label: "Served" },
            { key: "delivered", label: "Delivered" },
            { key: "cancelled", label: "Cancelled" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => handleTabChange(t.key as OrderTab)}
              className={`rounded-full border px-3 py-1 font-semibold ${
                tab === t.key ? "border-accent bg-accent-soft text-accent" : "border-border text-[#3f3225]"
              }`}
            >
              {t.label}
              {tabCounts[t.key] ? ` · ${tabCounts[t.key]}` : ""}
            </button>
          ))}
        </div>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-[#3f3225]">
              {tab === "all" ? "All orders" : `${tab.charAt(0).toUpperCase() + tab.slice(1)} orders`}
            </p>
            {ordersForTab.map((order) => {
              const cardOrder = { ...order, id: order.code ?? order.id } as Order;
              return (
                <div key={order.id} className="rounded-2xl border border-border bg-white/80 p-4 shadow-sm">
                  <OrderCard order={cardOrder} />
                  {renderActions(cardOrder)}
                </div>
              );
            })}
            {!ordersForTab.length && (
              <div className="rounded-2xl border border-border bg-white/70 p-4 text-sm text-muted">
                No orders in this tab yet.
              </div>
            )}
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-[#3f3225]">History</p>
            {completed.map((order) => {
              const cardOrder: Order = { ...order, id: order.code ?? order.id };
              return <OrderCard key={order.id} order={cardOrder} compact />;
            })}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-border bg-white/80 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#3f5d45]">Customers</p>
              <p className="text-sm text-[#2c2218]">Emails and spend</p>
            </div>
            <span className="rounded-full bg-accent-soft px-3 py-1 text-[11px] font-semibold text-accent">
              {customers.length} total
            </span>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-muted">
                <tr className="border-b border-border">
                  <th className="px-2 py-2">Email</th>
                  <th className="px-2 py-2">Name</th>
                  <th className="px-2 py-2">Phone</th>
                  <th className="px-2 py-2">Orders</th>
                  <th className="px-2 py-2">Spend</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-none">
                    <td className="px-2 py-2 font-semibold text-[#2c2218]">{c.email}</td>
                    <td className="px-2 py-2 text-muted">{c.name ?? "—"}</td>
                    <td className="px-2 py-2 text-muted">{c.phone ?? "—"}</td>
                    <td className="px-2 py-2">{c.totalOrders}</td>
                    <td className="px-2 py-2">₹{c.totalSpend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
