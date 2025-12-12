'use client';

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/stores/auth";

export default function OwnerInsightsPage() {
  const { customer, isOwner } = useAuth();
  const router = useRouter();
  const recent = useQuery(api.orders.listRecent, { limit: 200 }) ?? [];

  const totals = useMemo(() => {
    const totalRevenue = recent.reduce((sum, o) => sum + (o.payment?.amount ?? 0), 0);
    const byStatus = recent.reduce<Record<string, number>>((acc, o) => {
      acc[o.status] = (acc[o.status] ?? 0) + 1;
      return acc;
    }, {});
    const itemsSold = recent.reduce<Record<string, { name: string; qty: number; revenue: number }>>(
      (acc, o) => {
        for (const item of o.items) {
          const key = item.name;
          if (!acc[key]) acc[key] = { name: item.name, qty: 0, revenue: 0 };
          acc[key].qty += item.quantity;
          acc[key].revenue += item.quantity * item.price;
        }
        return acc;
      },
      {},
    );
    return {
      totalRevenue,
      totalOrders: recent.length,
      avgOrderValue: recent.length ? Math.round(totalRevenue / recent.length) : 0,
      byStatus,
      itemsSold: Object.values(itemsSold).sort((a, b) => b.qty - a.qty),
    };
  }, [recent]);

  if (!customer || !isOwner) {
    if (typeof window !== "undefined") {
      router.replace("/kitchen");
    }
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm text-muted">Owner insights</p>
          <h1 className="text-2xl font-bold text-[#2c2218]">Performance & items</h1>
        </div>
        <button
          onClick={() => router.push("/kitchen")}
          className="rounded-full border border-border px-3 py-2 text-sm font-semibold text-[#2f4d34] hover:bg-accent-soft"
        >
          ← Back to kitchen
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <InsightCard label="Total revenue" value={`₹${totals.totalRevenue}`} />
        <InsightCard label="Total orders" value={totals.totalOrders} />
        <InsightCard label="Avg order value" value={`₹${totals.avgOrderValue}`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white/85 p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-[#2c2218]">Orders by status</h2>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            {[
              "submitted",
              "accepted",
              "preparing",
              "packed",
              "on_the_way",
              "served",
              "delivered",
              "cancelled",
            ].map((s) => (
              <div
                key={s}
                className="flex items-center justify-between rounded-xl border border-border bg-white px-3 py-2"
              >
                <span className="capitalize text-[#3f3225]">{s.replaceAll("_", " ")}</span>
                <span className="font-semibold text-[#2f4d34]">{totals.byStatus[s] ?? 0}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white/85 p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-[#2c2218]">Top items</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-muted">
                <tr className="border-b border-border">
                  <th className="px-2 py-2">Item</th>
                  <th className="px-2 py-2">Qty</th>
                  <th className="px-2 py-2">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {totals.itemsSold.map((i) => (
                  <tr key={i.name} className="border-b border-border last:border-none">
                    <td className="px-2 py-2 font-semibold text-[#2c2218]">{i.name}</td>
                    <td className="px-2 py-2 text-muted">{i.qty}</td>
                    <td className="px-2 py-2">₹{i.revenue}</td>
                  </tr>
                ))}
                {!totals.itemsSold.length && (
                  <tr>
                    <td colSpan={3} className="px-2 py-2 text-muted">
                      No items yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function InsightCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-border bg-white/85 p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-2 text-2xl font-bold text-[#2c2218]">{value}</p>
    </div>
  );
}



