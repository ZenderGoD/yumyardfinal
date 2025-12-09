import Link from "next/link";
import { sampleOrders } from "@/lib/sampleData";
import { StatusPill } from "@/components/order/StatusPill";
import { StatusTimeline } from "@/components/order/StatusTimeline";
import { Button } from "@/components/ui/button";
import { HomeQuickOrder } from "@/components/home/HomeQuickOrder";

const heroOrder = sampleOrders[0];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-12">
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

      <div className="mt-8">
        <HomeQuickOrder />
      </div>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {[
          { title: "Menu & modifiers", desc: "Coffee, brunch, and desserts with add-ons, notes, and variants-ready." },
          { title: "Order anywhere", desc: "QR tags tables; delivery collects address + phone; UPI or COD." },
          { title: "Kitchen-first ops", desc: "Owner dashboard tracks accepted → preparing → packed → on the way." },
          { title: "Receipts & history", desc: "Order pages show items, charges, and status history for customers." },
          { title: "Owner tools", desc: "Dashboard for live tickets and a menu manager to toggle availability." },
          { title: "Ops-friendly", desc: "ETA chips, rider info-ready, and Convex schema scaffold for realtime." },
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

      <section className="mt-10 grid gap-6 md:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-[var(--border)] bg-white/85 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#2c2218]">How it works for guests</h2>
          <ol className="mt-4 space-y-3 text-sm text-[#3f3225]">
            <li>1) Scan the QR on the table or open the link for delivery.</li>
            <li>2) Browse the menu, add-ons, and notes; pick BHIM UPI or COD.</li>
            <li>3) Track live updates with ETA until served or delivered.</li>
          </ol>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--accent-soft)]/60 p-4 text-sm">
              <p className="text-xs font-semibold text-[#3f5d45]">Dine-in</p>
              <p className="mt-1 font-semibold text-[#2c2218]">Table-aware checkout</p>
              <p className="text-[var(--muted)]">QR autofills table; skip address.</p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--accent-soft)]/60 p-4 text-sm">
              <p className="text-xs font-semibold text-[#3f5d45]">Delivery</p>
              <p className="mt-1 font-semibold text-[#2c2218]">Address + phone capture</p>
              <p className="text-[var(--muted)]">UPI intent link or COD reserved.</p>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-[var(--border)] bg-white/85 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#2c2218]">For the team</h2>
          <p className="mt-2 text-sm text-[#3f3225]">
            Owner dashboard tracks live tickets; menu manager controls availability. Convex schema is ready for realtime persistence.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link
              href="/owner/dashboard"
              className="rounded-full border border-[var(--border)] px-3 py-2 font-semibold text-[#2f4d34] hover:bg-[var(--accent-soft)]"
            >
              Open owner dashboard
            </Link>
            <Link
              href="/owner/menu"
              className="rounded-full border border-[var(--border)] px-3 py-2 font-semibold text-[#2f4d34] hover:bg-[var(--accent-soft)]"
            >
              Manage menu
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-[1.1fr_1fr]">
        <div className="rounded-3xl border border-[var(--border)] bg-white/85 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#2c2218]">Find us</h2>
          <p className="text-sm text-[#3f3225]">YumYard Cafe, 17 Park Street, Kolkata</p>
          <div className="mt-4 aspect-[4/3] overflow-hidden rounded-2xl border border-[var(--border)] shadow-sm">
            <iframe
              title="YumYard location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3683.911319681289!2d88.35008401530959!3d22.55330818519485!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a0277af16e3cccd%3A0x4b6b9f8db1c0f1a7!2sPark%20St%2C%20Kolkata%2C%20West%20Bengal!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
        <div className="rounded-3xl border border-[var(--border)] bg-white/85 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#2c2218]">Hours & contact</h2>
          <ul className="mt-3 space-y-2 text-sm text-[#3f3225]">
            <li>Mon–Thu: 8:00 AM – 10:00 PM</li>
            <li>Fri–Sun: 8:00 AM – 11:30 PM</li>
            <li>Phone: +91-98765-43210</li>
            <li>Email: hello@yumyard.cafe</li>
          </ul>
          <div className="mt-4 grid gap-2 text-sm text-[#3f3225]">
            <span className="font-semibold">Payments</span>
            <span>BHIM UPI intent · COD · Ready for cards/links</span>
          </div>
          <div className="mt-4 grid gap-2 text-sm text-[#3f3225]">
            <span className="font-semibold">Delivery radius</span>
            <span>Up to 6 km from Park Street; toggleable per shift.</span>
          </div>
        </div>
      </section>
    </div>
  );
}
