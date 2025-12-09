'use client';

import { useState, useMemo } from "react";
import { useCart } from "@/stores/cart";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { formatCurrency } from "@/lib/format";
import { buildUpiDeepLink } from "@/lib/payments";
import { toast } from "sonner";

export function CartDrawer() {
  const {
    items,
    removeItem,
    total,
    mode,
    setMode,
    tableId,
    setTableId,
    contact,
    setContact,
    tables,
    clear,
  } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "cod">("upi");
  const subtotal = total();
  const taxes = Math.round(subtotal * 0.05);
  const fees = mode === "delivery" ? 30 : 0;
  const grandTotal = subtotal + taxes + fees;

  const phoneValid = contact.phone && contact.phone.length >= 10;
  const addressValid = mode === "table" || (contact.address && phoneValid);
  const canPlace = items.length > 0 && addressValid;

  const handlePlace = () => {
    if (!items.length) {
      toast.error("Add items to cart");
      return;
    }
    if (mode === "delivery" && !addressValid) {
      toast.error("Add address and valid phone (10+ digits)");
      return;
    }
    const orderId = `YY-${Math.floor(Math.random() * 9000 + 1000)}`;
    if (paymentMethod === "upi") {
      const link = buildUpiDeepLink({
        payeeVpa: process.env.NEXT_PUBLIC_UPI_ID ?? "test@upi",
        amount: grandTotal,
        note: orderId,
        payeeName: "YumYard",
      });
      toast.success("UPI link ready. Opening your BHIM app...");
      window.open(link, "_blank");
    } else {
      toast.success("COD reserved. Pay on delivery/serve.");
    }
    clear();
  };

  const itemList = useMemo(
    () =>
      items.map((item) => (
        <div
          key={item.itemId + item.notes}
          className="flex items-start justify-between rounded-xl border border-[var(--border)] bg-white/80 p-3"
        >
          <div>
            <p className="text-sm font-semibold text-[#2c2218]">
              {item.quantity}× {item.name}
            </p>
            {item.addOns?.length ? (
              <p className="text-xs text-[var(--muted)]">
                Add-ons: {item.addOns.map((a) => a.name).join(", ")}
              </p>
            ) : null}
            {item.notes && (
              <p className="text-xs text-[#3f5d45]">Note: {item.notes}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-[#3f5d45]">
              {formatCurrency(item.price * item.quantity)}
            </p>
            <button
              className="text-xs text-red-500 underline"
              onClick={() => removeItem(item.itemId)}
            >
              Remove
            </button>
          </div>
        </div>
      )),
    [items, removeItem],
  );

  return (
    <div className="sticky top-6 flex h-fit flex-col gap-4 rounded-2xl border border-[var(--border)] bg-white/80 p-4 shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-base font-semibold text-[#2c2218]">Your order</p>
        <div className="flex gap-2 rounded-full bg-[var(--accent-soft)] p-1 text-xs font-semibold text-[var(--accent)]">
          <button
            className={`rounded-full px-3 py-1 ${mode === "table" ? "bg-white shadow" : ""}`}
            onClick={() => setMode("table")}
          >
            Dine-in
          </button>
          <button
            className={`rounded-full px-3 py-1 ${mode === "delivery" ? "bg-white shadow" : ""}`}
            onClick={() => setMode("delivery")}
          >
            Delivery
          </button>
        </div>
      </div>

      {mode === "table" && (
        <label className="flex flex-col gap-1 text-sm font-semibold text-[#3f3225]">
          Table
          <select
            className="h-11 rounded-xl border border-[var(--border)] bg-white px-3 text-sm shadow-sm outline-none"
            value={tableId}
            onChange={(e) => setTableId(e.target.value)}
          >
            {tables.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
      )}

      {mode === "delivery" && (
        <div className="grid gap-3">
          <Input
            label="Name"
            value={contact.name ?? ""}
            onChange={(e) => setContact({ ...contact, name: e.target.value })}
          />
          <Input
            label="Phone"
            value={contact.phone ?? ""}
            onChange={(e) => setContact({ ...contact, phone: e.target.value })}
          />
          <Textarea
            label="Address"
            value={contact.address ?? ""}
            onChange={(e) => setContact({ ...contact, address: e.target.value })}
          />
          <Input
            label="Landmark"
            value={contact.landmark ?? ""}
            onChange={(e) => setContact({ ...contact, landmark: e.target.value })}
          />
        </div>
      )}

      <div className="flex flex-col gap-3">{itemList}</div>

      <div className="space-y-2 rounded-xl bg-[var(--accent-soft)]/60 p-3 text-sm">
        <div className="flex justify-between text-[var(--muted)]">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-[var(--muted)]">
          <span>Taxes (5%)</span>
          <span>{formatCurrency(taxes)}</span>
        </div>
        {fees > 0 && (
          <div className="flex justify-between text-[var(--muted)]">
            <span>Delivery</span>
            <span>{formatCurrency(fees)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-[var(--border)] pt-2 text-base font-semibold text-[#2c2218]">
          <span>Total</span>
          <span>{formatCurrency(grandTotal)}</span>
        </div>
      </div>

      <div className="flex gap-2 rounded-full bg-[var(--accent-soft)] p-1 text-xs font-semibold text-[var(--accent)]">
        <button
          className={`rounded-full px-3 py-2 ${paymentMethod === "upi" ? "bg-white shadow" : ""}`}
          onClick={() => setPaymentMethod("upi")}
        >
          BHIM UPI
        </button>
        <button
          className={`rounded-full px-3 py-2 ${paymentMethod === "cod" ? "bg-white shadow" : ""}`}
          onClick={() => setPaymentMethod("cod")}
        >
          Cash on delivery
        </button>
      </div>

      <Button onClick={handlePlace} disabled={!canPlace}>
        {paymentMethod === "upi" ? "Pay via UPI" : "Place COD order"}
      </Button>
    </div>
  );
}

