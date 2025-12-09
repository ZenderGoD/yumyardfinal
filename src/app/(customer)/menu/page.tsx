'use client';

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { sampleMenu } from "@/lib/sampleData";
import { MenuGrid } from "@/components/menu/MenuGrid";
import { CartDrawer } from "@/components/menu/CartDrawer";
import { useCart } from "@/stores/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function MenuPage() {
  const params = useSearchParams();
  const tableId = params.get("tableId");
  const { setMode, setTableId, mode } = useCart();
  const [category, setCategory] = useState<string>("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (tableId) {
      setMode("table");
      setTableId(tableId);
    }
  }, [tableId, setMode, setTableId]);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(sampleMenu.map((m) => m.category)));
    return ["All", ...unique];
  }, []);

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
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-10">
      {tableId && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--accent-soft)]/70 p-3 text-sm font-semibold text-[#2f4d34]">
          QR detected · Ordering for table {tableId}. Address is skipped.
        </div>
      )}
      <div className="flex flex-col gap-3 rounded-3xl border border-[var(--border)] bg-gradient-to-r from-[#e6ddcf] to-[#d6e4d8] p-6 shadow-lg md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-[#3f5d45]">
            {mode === "table" ? "Scan & order to your table" : "Home delivery"}
          </p>
          <h1 className="text-2xl font-bold text-[#2c2218]">
            YumYard Menu — crafted for slow mornings & cozy evenings
          </h1>
          <p className="text-sm text-[#52473a]">
            Place directly to your table via QR or schedule for home. Live kitchen updates keep you posted.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="soft" size="sm" onClick={() => setMode("table")}>
            Dine-in / Table
          </Button>
          <Button variant="outline" size="sm" onClick={() => setMode("delivery")}>
            Delivery
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1.5fr_1fr]">
        <Input
          placeholder="Search coffee, brunch, desserts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white"
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full border px-3 py-2 text-sm font-semibold ${
              category === c
                ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                : "border-[var(--border)] text-[#3f3225]"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <MenuGrid
          items={searched}
          onAdd={(item, addOnIds, note) => {
            const addOns = item.addOns?.filter((a) => addOnIds?.includes(a.id));
            useCart.getState().addItem(item, { addOns, notes: note });
          }}
        />
        <CartDrawer />
      </div>
    </div>
  );
}

