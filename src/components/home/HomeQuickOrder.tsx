'use client';

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { sampleMenu } from "@/lib/sampleData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/stores/cart";
import { formatCurrency } from "@/lib/format";

type Mode = "dine-in" | "delivery" | "takeaway";

export function HomeQuickOrder() {
  const router = useRouter();
  const { addItem, setMode, setTableId, setContact, clear } = useCart();
  const [mode, setModeState] = useState<Mode>("dine-in");
  const [category, setCategory] = useState("All");
  const [quantity, setQuantity] = useState(1);
  const [tableId, setTableIdInput] = useState("T1");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [note, setNote] = useState("");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(sampleMenu.map((m) => m.category)))],
    [],
  );

  const filtered = useMemo(
    () => (category === "All" ? sampleMenu : sampleMenu.filter((m) => m.category === category)),
    [category],
  );

  const [itemId, setItemId] = useState(sampleMenu[0]?.id);
  const selectedItem = filtered.find((i) => i.id === itemId) ?? filtered[0] ?? sampleMenu[0];

  const handleSubmit = () => {
    if (!selectedItem) return;
    clear();
    setMode(mode === "dine-in" ? "table" : "delivery");
    if (mode === "dine-in") {
      setTableId(tableId || "T1");
    } else {
      setContact({ name, phone, address });
    }
    for (let i = 0; i < Math.max(1, quantity); i += 1) {
      addItem(selectedItem, { notes: note });
    }
    router.push(mode === "dine-in" ? `/menu?tableId=${tableId || "T1"}` : "/menu");
  };

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-white/85 p-6 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-[#3f5d45]">Quick order</p>
          <h2 className="text-xl font-bold text-[#2c2218]">Choose item, mode, and go</h2>
        </div>
        <div className="flex gap-2 rounded-full bg-[var(--accent-soft)] p-1 text-xs font-semibold text-[var(--accent)]">
          {["dine-in", "takeaway", "delivery"].map((m) => (
            <button
              key={m}
              onClick={() => setModeState(m as Mode)}
              className={`rounded-full px-3 py-1 ${mode === m ? "bg-white shadow" : ""}`}
            >
              {m === "dine-in" ? "Dine-in" : m === "takeaway" ? "Takeaway" : "Delivery"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-semibold text-[#3f3225]">
          Category
          <select
            className="h-11 rounded-xl border border-[var(--border)] bg-white px-3 text-sm shadow-sm outline-none"
            value={category}
            onChange={(e) => {
              const nextCategory = e.target.value;
              setCategory(nextCategory);
              const nextList =
                nextCategory === "All"
                  ? sampleMenu
                  : sampleMenu.filter((m) => m.category === nextCategory);
              setItemId(nextList[0]?.id ?? sampleMenu[0]?.id);
            }}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-semibold text-[#3f3225]">
          Item
          <select
            className="h-11 rounded-xl border border-[var(--border)] bg-white px-3 text-sm shadow-sm outline-none"
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
          >
            {filtered.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} · {formatCurrency(item.price)}
              </option>
            ))}
          </select>
        </label>
        <Input
          label="Quantity"
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
        />
        {mode === "dine-in" && (
          <Input
            label="Table"
            value={tableId}
            onChange={(e) => setTableIdInput(e.target.value)}
            hint="Prefills the table on menu"
          />
        )}
        {mode !== "dine-in" && (
          <>
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Textarea
              label="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Flat, street, area"
            />
          </>
        )}
        <Textarea
          label="Note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="E.g., less sugar, extra crispy"
        />
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-[#3f3225]">
        <div>
          <p className="font-semibold">
            {quantity}× {selectedItem?.name}
          </p>
          <p className="text-[var(--muted)]">Mode: {mode === "dine-in" ? "Dine-in (table)" : mode === "takeaway" ? "Takeaway" : "Delivery"}</p>
        </div>
        <p className="text-lg font-bold text-[#2f4d34]">
          {selectedItem ? formatCurrency(selectedItem.price * Math.max(1, quantity)) : ""}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button onClick={handleSubmit}>Add & go to menu</Button>
        <Button variant="soft" asChild>
          <Link href="/menu">Browse full menu</Link>
        </Button>
      </div>
    </div>
  );
}

