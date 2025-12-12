'use client';

import { useState, useMemo } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCart } from "@/stores/cart";
import { useAuth } from "@/stores/auth";
import { Button } from "../ui/button";
import { formatCurrency } from "@/lib/format";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

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
    tables,
    clear,
    serviceType,
  } = useCart();
  const { customer } = useAuth();
  const createOrder = useMutation(api.orders.create);
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "cod">("upi");
  const [placing, setPlacing] = useState(false);
  const subtotal = total();
  const taxes = Math.round(subtotal * 0.05);
  const fees = mode === "delivery" ? 30 : 0;
  const grandTotal = subtotal + taxes + fees;

  const phoneValid = contact.phone && contact.phone.length >= 10;
  const deliveryFieldsFilled = contact.community && contact.tower && contact.unit;
  const addressValid = mode === "table" || (deliveryFieldsFilled && phoneValid);
  const canPlace = items.length > 0 && addressValid;

  const scrollToDeliveryDetails = () => {
    document.getElementById("delivery-details")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handlePlace = () => {
    if (!items.length) {
      toast.error("Add items to cart");
      return;
    }
    if (mode === "delivery" && !addressValid) {
      toast.error("Add community, tower, flat, and valid phone (10+ digits)");
      return;
    }
    const customerEmail = customer?.email ?? contact.email;
    if (!customerEmail) {
      toast.error("Sign in or add an email to place the order.");
      return;
    }
    setPlacing(true);
    createOrder({
      mode,
      serviceType,
      tableId,
      contact: {
        ...contact,
        email: contact.email ?? customerEmail,
      },
      customerId: customer?.id ? (customer.id as Id<"customers">) : undefined,
      customerEmail,
      items: items.map((i) => ({
        itemId: i.itemId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        addOns: i.addOns?.map((a) => ({ name: a.name, price: a.price })),
        notes: i.notes,
      })),
      paymentMethod,
    })
      .then((res) => {
        if (!res) {
          toast.error("Order did not save. Try again.");
          return;
        }
        if (paymentMethod === "upi") {
          if (res.upiLink) {
            toast.success(`Order ${res.code} placed. Opening UPI.`);
            window.open(res.upiLink, "_blank");
          } else {
            toast.error("UPI link missing; please try again.");
            return;
          }
        } else {
          toast.success(`Order ${res.code} placed. Pay cash on delivery/serve.`);
        }
        clear();
      })
      .catch((err) => {
        console.error(err);
        toast.error("Couldn’t place the order. Please retry.");
      })
      .finally(() => setPlacing(false));
  };

  const itemList = useMemo(
    () =>
      items.map((item) => (
        <div
          key={`${item.itemId || 'unknown'}-${item.notes || 'no-notes'}-${item.name}`}
          className="flex items-start justify-between rounded-xl border border-border bg-white/80 p-3"
        >
          <div>
            <p className="text-sm font-semibold text-[#2c2218]">
              {item.quantity}× {item.name}
            </p>
            {item.addOns?.length ? (
              <p className="text-xs text-muted">
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
              onClick={() => item.itemId && removeItem(item.itemId)}
            >
              Remove
            </button>
          </div>
        </div>
      )),
    [items, removeItem],
  );

  return (
    <div className="flex h-fit flex-col gap-4 rounded-2xl border border-border bg-white/80 p-4 shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-base font-semibold text-[#2c2218]">Your order</p>
        <div className="flex gap-2 rounded-full bg-accent-soft p-1 text-xs font-semibold text-accent">
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
            className="h-11 rounded-xl border border-border bg-white px-3 text-sm shadow-sm outline-none"
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
        <div className="space-y-3 rounded-xl border border-border bg-white/70 p-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-[#2c2218]">Delivery details</p>
              <p className="text-xs text-muted">Auto-filled from the delivery section.</p>
            </div>
            <button
              type="button"
              className="text-xs font-semibold text-accent underline"
              onClick={scrollToDeliveryDetails}
            >
              Edit details
            </button>
          </div>
          <dl className="grid gap-2 text-sm text-[#2c2218]">
            <div className="flex justify-between">
              <dt className="text-muted">Name</dt>
              <dd className="font-semibold">{contact.name || "Add in delivery section"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Phone</dt>
              <dd className="font-semibold">{contact.phone || "Add in delivery section"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Community</dt>
              <dd className="font-semibold">{contact.community || "Add in delivery section"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Tower</dt>
              <dd className="font-semibold">{contact.tower || "Add in delivery section"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Flat / unit</dt>
              <dd className="font-semibold">{contact.unit || "Add in delivery section"}</dd>
            </div>
          </dl>
        </div>
      )}

      <div className="flex flex-col gap-3">{itemList}</div>

      <div className="space-y-2 rounded-xl bg-accent-soft/60 p-3 text-sm">
        <div className="flex justify-between text-muted">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-muted">
          <span>Taxes (5%)</span>
          <span>{formatCurrency(taxes)}</span>
        </div>
        {fees > 0 && (
          <div className="flex justify-between text-muted">
            <span>Delivery</span>
            <span>{formatCurrency(fees)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-border pt-2 text-base font-semibold text-[#2c2218]">
          <span>Total</span>
          <span>{formatCurrency(grandTotal)}</span>
        </div>
      </div>

      <div className="flex gap-2 rounded-full bg-accent-soft p-1 text-xs font-semibold text-accent">
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

      <Button onClick={handlePlace} disabled={!canPlace || placing} loading={placing}>
        {paymentMethod === "upi" ? "Pay via UPI" : "Place COD order"}
      </Button>
    </div>
  );
}

