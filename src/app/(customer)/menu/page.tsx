'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { sampleMenu, sampleTables } from "@/lib/sampleData";
import { MenuGrid } from "@/components/menu/MenuGrid";
import { CartDrawer } from "@/components/menu/CartDrawer";
import { AssistantChat } from "@/components/menu/AssistantChat";
import { useCart } from "@/stores/cart";
import { AuthBanner } from "@/components/auth/AuthBanner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerClose,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { toast } from "sonner";

const communityOptions = [
  { key: "Prestige Finsbury Park Hyde", towers: Array.from({ length: 12 }, (_, i) => `Tower ${i + 1}`) },
  { key: "Prestige Finsbury Park Regent", towers: Array.from({ length: 6 }, (_, i) => `Tower ${i + 13}`) },
  { key: "Brigade El Dorado", towers: Array.from({ length: 20 }, (_, i) => `Tower ${i + 1}`) },
];

type ScanTableButtonProps = {
  onDetect: (tableId: string) => void;
};

type BarcodeDetectorAPI = {
  new (opts: { formats: string[] }): {
    detect(img: ImageBitmap): Promise<Array<{ rawValue: string }>>;
  };
};

function ScanTableButton({ onDetect }: ScanTableButtonProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const parseTableId = (raw: string) => {
    try {
      const url = new URL(raw, window.location.origin);
      const id = url.searchParams.get("tableId");
      if (id) return id;
    } catch {
      /* ignore */
    }
    const match = raw.match(/tableId=([A-Za-z0-9_-]+)/i);
    return match?.[1];
  };

  const scanFile = async (file: File) => {
    const bitmap = await createImageBitmap(file);
    const BarcodeDetectorCtor = (window as Window & { BarcodeDetector?: BarcodeDetectorAPI }).BarcodeDetector;

    if (!BarcodeDetectorCtor) {
      toast.error("Camera scanning not supported in this browser. Use the QR page.");
      return;
    }

    const detector = new BarcodeDetectorCtor({ formats: ["qr_code"] });
    const results = await detector.detect(bitmap);
    const value = results[0]?.rawValue;
    if (!value) {
      toast.error("Couldn't read the QR. Try again.");
      return;
    }
    const tableId = parseTableId(value);
    if (!tableId) {
      toast.error("QR found, but tableId missing.");
      return;
    }
    onDetect(tableId);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 font-semibold text-[#2f4d34] hover:bg-accent-soft focus:outline-none focus:ring-2 focus:ring-accent-soft"
      >
        Scan table QR (opens camera)
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) {
            try {
              await scanFile(file);
            } catch (err) {
              console.error(err);
              toast.error("Couldn’t scan. Try again or open the QR page.");
            } finally {
              e.target.value = "";
            }
          }
        }}
      />
    </>
  );
}

type ModePanelProps = {
  className?: string;
  mode: "table" | "delivery";
  setMode: (mode: "table" | "delivery") => void;
  serviceType: "table" | "takeaway";
  setServiceType: (service: "table" | "takeaway") => void;
  tables: typeof sampleTables;
  tableId?: string;
  setTableId: (id?: string) => void;
  contact: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    landmark?: string;
    community?: string;
    tower?: string;
    unit?: string;
  };
  setContact: (contact: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    landmark?: string;
    community?: string;
    tower?: string;
    unit?: string;
  }) => void;
  onDetect: (tableId: string) => void;
};

function ModePanel({
  className,
  mode,
  setMode,
  serviceType,
  setServiceType,
  tables,
  tableId,
  setTableId,
  contact,
  setContact,
  onDetect,
}: ModePanelProps) {
  return (
    <div
      className={clsx(
        "flex flex-col gap-4 rounded-3xl border border-border bg-linear-to-r from-[#e6ddcf] to-[#d6e4d8] p-6 shadow-lg"
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Image
            src="/images/yum-yard-logo.svg"
            alt="Yum Yard Cafe logo"
            width={56}
            height={56}
            className="rounded-2xl border border-white/70 shadow-md"
            priority
          />
          <div className="leading-tight">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#3f5d45]">Yum Yard Cafe</p>
            <p className="text-[11px] text-[#52473a]">Craft coffee & comfort bites</p>
          </div>
        </div>
        <div className="text-left md:text-right">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#3f5d45]">Mode</p>
          <h1 className="text-2xl font-bold text-[#2c2218]">Choose dine-in or delivery</h1>
          <p className="text-sm text-[#52473a]">Switch anytime—like Zomato, but table-aware.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:auto-rows-fr">
        {[
          { key: "table", title: "Dine-in", desc: "Scan or pick a table; address not needed", eta: "10–15 min" },
          { key: "delivery", title: "Delivery", desc: "Send to your address; rider-ready", eta: "25–35 min" },
        ].map((card) => (
          <button
            key={card.key}
            type="button"
            aria-pressed={mode === card.key}
            aria-label={`Choose ${card.title}`}
            onClick={() => setMode(card.key as "table" | "delivery")}
            className={clsx(
              "flex flex-col items-start gap-1 rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-accent-soft md:h-full",
              mode === card.key
                ? "border-accent bg-white/80 shadow-md"
                : "border-border bg-white/60 hover:bg-white/80",
            )}
          >
            <div className="flex w-full items-center justify-between">
              <span className="text-sm font-semibold text-[#2c2218]">{card.title}</span>
              <span className="rounded-full bg-accent-soft px-2 py-1 text-[11px] font-semibold text-[#2f4d34]">
                {card.eta}
              </span>
            </div>
            <span className="text-xs text-[#52473a]">{card.desc}</span>
          </button>
        ))}
        <Drawer>
          <div className="flex h-full flex-col gap-2 rounded-2xl border border-dashed border-border bg-white/70 p-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3f5d45]">AI waiter</p>
              <p className="text-sm font-semibold text-[#2c2218]">Chat & QR, tucked into this menu</p>
              <p className="text-xs text-[#52473a]">
                Open the assistant without a floating card—use it right next to dine-in or delivery.
              </p>
            </div>
            <DrawerTrigger asChild>
              <Button
                variant="primary"
                size="sm"
                className="w-full md:w-auto shadow-md shadow-[--accent-soft]/70 hover:shadow-lg hover:-translate-y-px active:translate-y-px"
              >
                Open AI waiter
              </Button>
            </DrawerTrigger>
          </div>
          <DrawerContent className="border-border bg-white/95 pb-6">
            <div className="mx-auto max-w-4xl px-4 pt-4">
              <div className="flex flex-wrap items-start gap-3">
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#3f5d45]">Yum Yard AI</p>
                  <h2 className="text-xl font-bold text-[#2c2218]">Full chat</h2>
                  <p className="text-sm text-[#52473a]">
                    Chat in this drawer, scan QR for tables, and auto-add items to cart.
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[#2f4d34]">
                    AI WAITER · Chat, get recommendations, and let me add to cart. I know your mode (
                    {mode === "table" ? "dine-in" : "delivery"}).
                  </p>
                </div>
                <div className="flex items-start justify-end flex-1 gap-2">
                  <DrawerHeader className="text-right p-0">
                    <DrawerTitle className="text-base font-semibold text-[#2c2218]">Stay in menu</DrawerTitle>
                    <DrawerDescription className="text-xs text-[#52473a]">
                      Keep browsing while chatting.
                    </DrawerDescription>
                  </DrawerHeader>
                  <DrawerClose
                    className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-[#2c2218] shadow-sm hover:bg-accent-soft focus:outline-none"
                    aria-label="Close AI drawer"
                  >
                    ×
                  </DrawerClose>
                </div>
              </div>
              <div className="mt-4 rounded-3xl border border-border bg-white/90 p-4 shadow-lg">
                <AssistantChat />
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
      <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
        {mode === "table" ? (
          <div id="delivery-details" className="rounded-2xl border border-border bg-white/80 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#2c2218]">Dine-in details</p>
              <span className="text-xs font-semibold text-[#3f5d45]">Table or takeaway</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[
                { key: "table", label: "Serve at table" },
                { key: "takeaway", label: "Takeaway from counter" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setServiceType(opt.key as "table" | "takeaway")}
                  className={clsx(
                    "rounded-xl border px-3 py-2 text-left text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-accent-soft",
                    serviceType === opt.key
                      ? "border-accent bg-accent-soft/60 text-[#2f4d34]"
                      : "border-border bg-white text-[#3f3225] hover:bg-accent-soft/50",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
              <ScanTableButton
                onDetect={onDetect}
              />
              <Link
                href="/qr"
                className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 font-semibold text-[#2f4d34] hover:bg-accent-soft"
                prefetch={false}
              >
                View QRs
              </Link>
              <span>or pick a table below</span>
            </div>
            <label className="mt-3 block text-xs font-semibold text-[#3f3225]">Table</label>
            <select
              value={tableId ?? ""}
              onChange={(e) => setTableId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-white p-3 text-sm shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-soft"
            >
              <option value="" disabled>
                Select a table
              </option>
              {tables?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            <p className="mt-3 text-xs text-muted">Scanning a QR keeps the table locked; no address needed.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-white/80 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#2c2218]">Delivery details</p>
              <span className="text-xs font-semibold text-[#3f5d45]">UPI / COD ready</span>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <Input
                label="Name"
                placeholder="Your name"
                value={contact.name ?? ""}
                onChange={(e) => setContact({ ...contact, name: e.target.value })}
                className="bg-white"
              />
              <Input
                label="Phone"
                placeholder="10-digit mobile"
                value={contact.phone ?? ""}
                onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                className="bg-white"
              />
              <Input
                label="Email"
                placeholder="you@example.com"
                type="email"
                value={contact.email ?? ""}
                onChange={(e) => setContact({ ...contact, email: e.target.value })}
                className="bg-white"
              />
            </div>
            <label className="mt-3 block text-xs font-semibold text-[#3f3225]">Community</label>
            <select
              value={contact.community ?? ""}
              onChange={(e) =>
                setContact({
                  ...contact,
                  community: e.target.value || undefined,
                  tower: undefined,
                })
              }
              className="mt-1 w-full rounded-xl border border-border bg-white p-3 text-sm shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-soft"
            >
              <option value="">Select community</option>
              {communityOptions.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.key}
                </option>
              ))}
            </select>
            <label className="mt-3 block text-xs font-semibold text-[#3f3225]">Tower</label>
            <select
              value={contact.tower ?? ""}
              disabled={!contact.community}
              onChange={(e) => setContact({ ...contact, tower: e.target.value || undefined })}
              className="mt-1 w-full rounded-xl border border-border bg-white p-3 text-sm shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-soft disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              <option value="">Select tower</option>
              {communityOptions
                .find((c) => c.key === contact.community)
                ?.towers.map((tower) => (
                  <option key={tower} value={tower}>
                    {tower}
                  </option>
                ))}
            </select>
            <Input
              label="Flat / unit number"
              placeholder="e.g., 1204"
              value={contact.unit ?? ""}
              onChange={(e) => setContact({ ...contact, unit: e.target.value })}
              className="mt-3 bg-white"
            />
            <p className="mt-3 text-xs text-muted">
              We&apos;ll auto-fill this at checkout; choose your community, tower, and flat.
            </p>
          </div>
        )}
        <div className="rounded-2xl border border-border bg-white/80 p-4 shadow-sm">
          <p className="text-sm font-semibold text-[#2c2218]">
            {mode === "table" ? "Browsing for dine-in" : "Browsing for delivery"}
          </p>
          <p className="mt-2 text-sm text-[#3f3225]">
            Switch modes like Zomato: keep your cart, just change where it&apos;s served.
          </p>
          <ul className="mt-3 space-y-1 text-xs text-muted">
            <li>• Live kitchen updates stay on.</li>
            <li>• Table mode skips address fields.</li>
            <li>• Delivery keeps your address + phone.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function MenuPageContent() {
  const params = useSearchParams();
  const tableParam = params.get("tableId");
  const {
    setMode,
    setTableId,
    setQrDetected,
    setServiceType,
    mode,
    tableId,
    qrDetected,
    serviceType,
    tables,
    contact,
    setContact,
    items,
    total,
  } = useCart();
  const [category, setCategory] = useState<string>("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (tableParam) {
      setMode("table");
      setTableId(tableParam);
      setQrDetected(true);
    } else {
      setQrDetected(false);
    }
  }, [tableParam, setMode, setTableId, setQrDetected]);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(sampleMenu.map((m) => m.category)));
    return ["All", ...unique];
  }, []);

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );
  const subtotal = useMemo(() => total(), [total]);
  const taxes = Math.round(subtotal * 0.05);
  const fees = mode === "delivery" ? 30 : 0;
  const drawerTotal = subtotal + taxes + fees;

  const filtered = useMemo(
    () =>
      category === "All"
        ? sampleMenu
        : sampleMenu.filter((m) => m.category === category),
    [category],
  );

  const searched = useMemo(
    () =>
      filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.description.toLowerCase().includes(search.toLowerCase()),
      ),
    [filtered, search],
  );
  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-10">
        {qrDetected && tableId && mode === "table" && (
          <div className="mb-4 flex items-center gap-3 rounded-2xl border border-border bg-accent-soft/70 p-3 text-sm font-semibold text-[#2f4d34]">
            QR detected · Ordering for table {tableId}. Address is skipped.
          </div>
        )}
        <AuthBanner />
        <ModePanel
          mode={mode}
          setMode={setMode}
          serviceType={serviceType}
          setServiceType={setServiceType}
          tables={tables}
          tableId={tableId}
          setTableId={setTableId}
          contact={contact}
          setContact={setContact}
          onDetect={(id) => {
            setMode("table");
            setTableId(id);
            setQrDetected(true);
            toast.success(`Table ${id} detected`);
          }}
        />

        <section className="mt-8 rounded-3xl border border-border bg-white/80 p-5 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3f5d45]">Menu</p>
              <p className="text-sm text-[#52473a]">Pick your coffee, brunch, or dessert.</p>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wide text-[#2f4d34]">Yum Yard Cafe</span>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[0.4fr_1.6fr_1fr]">
            <div className="hidden lg:block">
              <div className="sticky top-24 rounded-2xl border border-border bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#3f5d45]">Browse</p>
                <p className="mt-1 text-xs text-[#52473a]">Jump between categories.</p>
                <div className="mt-3 flex flex-col gap-2">
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCategory(c)}
                      className={`rounded-xl border px-3 py-2 text-sm font-semibold text-left transition ${
                        category === c
                          ? "border-accent bg-accent-soft text-accent shadow-sm"
                          : "border-border text-[#3f3225] hover:bg-accent-soft/60"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-[1.5fr_1fr]">
                <Input
                  placeholder="Search coffee, brunch, desserts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white"
                />
              </div>

              <div className="flex flex-wrap gap-2 lg:hidden">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`rounded-full border px-3 py-2 text-sm font-semibold ${
                      category === c
                        ? "border-accent bg-accent-soft text-accent"
                        : "border-border text-[#3f3225]"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <MenuGrid
                items={searched}
                onAdd={(item, addOnIds, note) => {
                  const addOns = item.addOns?.filter((a) => addOnIds?.includes(a.id));
                  useCart.getState().addItem(item, { addOns, notes: note });
                }}
              />
            </div>

            <div className="hidden space-y-4 lg:sticky lg:top-6 lg:block">
              <CartDrawer />
            </div>
          </div>
        </section>
      </div>

      {items.length ? (
        <Drawer>
          <DrawerTrigger asChild>
            <button
              className="fixed bottom-4 left-1/2 z-40 flex w-[min(520px,90vw)] -translate-x-1/2 items-center justify-between rounded-full border border-border bg-[#2f4d34] px-4 py-3 text-white shadow-xl shadow-[--accent-soft]/60 transition active:scale-[0.99] lg:hidden"
              aria-label="Open cart"
            >
              <div className="text-left">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">Cart</p>
                <p className="text-sm font-semibold text-white">
                  {itemCount} item{itemCount === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span className="rounded-full bg-white/15 px-3 py-1 text-white">
                  ₹{drawerTotal}
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-[#2f4d34] shadow-sm">
                  View order
                </span>
              </div>
            </button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[90vh] overflow-y-auto rounded-t-3xl bg-white">
            <DrawerHeader className="text-left">
              <DrawerTitle>Your order</DrawerTitle>
              <DrawerDescription>Review items, adjust quantities, and checkout.</DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-6">
              <CartDrawer />
            </div>
          </DrawerContent>
        </Drawer>
      ) : null}
    </>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MenuPageContent />
    </Suspense>
  );
}

