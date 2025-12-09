import Link from "next/link";
import { sampleOrders } from "@/lib/sampleData";
import { StatusPill } from "@/components/order/StatusPill";
import { StatusTimeline } from "@/components/order/StatusTimeline";
import { Button } from "@/components/ui/button";

const heroOrder = sampleOrders[0];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-12">
      <section className="grid gap-8 rounded-3xl border border-[var(--border)] bg-gradient-to-br from-[#e6ddcf] via-[#f3ede3] to-[#d6e4d8] p-8 shadow-lg md:grid-cols-[1.3fr_1fr]">
        <div className="space-y-5">
          <p className="inline-flex rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[#3f5d45] shadow">
            QR to table · Home delivery · Live kitchen updates
          </p>
          <h1 className="text-4xl font-bold leading-tight text-[#2c2218]">
            Order from your table or home. Track every step from the kitchen.
          </h1>
          <p className="text-lg text-[#4f4437]">
            YumYard makes ordering effortless—scan a QR at your table or browse from home, pay via BHIM UPI or COD, and watch status updates in real time.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/menu">Start ordering</Link>
            </Button>
            <Button variant="soft" asChild>
              <Link href="/order/YY-2041">Track an order</Link>
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 text-sm text-[#3f5d45]">
            <span className="rounded-full bg-white/70 px-3 py-1 font-semibold shadow-sm">
              Fresh coffee & brunch
            </span>
            <span className="rounded-full bg-white/70 px-3 py-1 font-semibold shadow-sm">
              Table-aware QR flow
            </span>
            <span className="rounded-full bg-white/70 px-3 py-1 font-semibold shadow-sm">
              Live status + ETA
            </span>
          </div>
        </div>
        <div className="rounded-2xl bg-white/80 p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--muted)]">Now serving</p>
              <p className="text-lg font-semibold text-[#2c2218]">
                {heroOrder.mode === "table" ? `Table ${heroOrder.tableId}` : heroOrder.contact.address}
              </p>
            </div>
            <StatusPill status={heroOrder.status} />
          </div>
          <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--accent-soft)]/60 p-3 text-sm">
            <p className="font-semibold text-[#2c2218]">
              {heroOrder.items[0].quantity}× {heroOrder.items[0].name}
            </p>
            <p className="text-xs text-[var(--muted)]">Live timeline preview</p>
          </div>
          <div className="mt-3">
            <StatusTimeline current={heroOrder.status} history={heroOrder.statusHistory} />
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {[
          { title: "QR-aware ordering", desc: "Scan at any table; we auto-tag your seat and skip address entry." },
          { title: "Delivery-ready", desc: "Collect address, phone, and UPI or COD to reach guests at home." },
          { title: "Kitchen-first ops", desc: "Owner dashboard tracks accepted → preparing → packed → on the way." },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-[var(--border)] bg-white/80 p-4 shadow-sm"
          >
            <p className="text-base font-semibold text-[#2c2218]">{card.title}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">{card.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
