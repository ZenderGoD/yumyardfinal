'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { sampleMenu } from "@/lib/sampleData";
import { useCart } from "@/stores/cart";
import { useAuth } from "@/stores/auth";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { AIInput } from "@/components/ui/ai-input";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type AiAction = {
  type: "add_to_cart" | "place_order" | "apply_coupon" | "check_payment";
  itemId?: string;
  quantity?: number;
  addOnIds?: string[];
  notes?: string;
  couponCode?: string;
};

type LastOrder = {
  id: string;
  mode: "table" | "delivery";
  tableId?: string;
  contact?: {
    name?: string;
    phone?: string;
    community?: string;
    tower?: string;
    unit?: string;
  };
  items: {
    name: string;
    quantity: number;
    addOns?: string[];
    notes?: string;
  }[];
  total: number;
  status: "pending" | "paid";
  couponCode?: string;
  placedAt: number;
};

const couponCatalog: Record<
  string,
  { label: string; type: "percent" | "flat" | "fees"; value: number; description: string }
> = {
  WELCOME10: { label: "WELCOME10", type: "percent", value: 10, description: "10% off cart" },
  COFFEE50: { label: "COFFEE50", type: "flat", value: 50, description: "₹50 off coffee combos" },
  FREESHIP: { label: "FREESHIP", type: "fees", value: 30, description: "Waive delivery fee" },
};

const quickPrompts = [
  "What’s a light brunch under ₹400?",
  "Pair a dessert with my coffee",
  "I’m vegan. Suggest snacks.",
  "Table mode—what’s fast?",
];

type SpeechResultEvent = {
  resultIndex: number;
  results: Array<{ [0]: { transcript: string } }>;
};

type BrowserSpeechRecognition = {
  stop: () => void;
  start: () => void;
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechResultEvent) => void;
  onend: () => void;
  onerror: () => void;
};

type SpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

type BarcodeDetectorConstructor = new (opts: { formats: string[] }) => {
  detect(img: ImageBitmap): Promise<Array<{ rawValue: string }>>;
};

export function AssistantChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hey! I’m your Yum Yard AI. Tell me what you’re craving, and I’ll add it to the cart.",
    },
  ]);
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | undefined>();
  const [lastOrder, setLastOrder] = useState<LastOrder | undefined>();
  const [input, setInput] = useState("");

  const { addItem, items, mode, serviceType, tableId, contact, total, setMode, setTableId, setQrDetected, clear } =
    useCart();
  const { customer } = useAuth();
  const createOrder = useMutation(api.orders.create);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem("yy-last-order") : null;
      if (raw) {
        setLastOrder(JSON.parse(raw));
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        if (lastOrder) {
          window.localStorage.setItem("yy-last-order", JSON.stringify(lastOrder));
        } else {
          window.localStorage.removeItem("yy-last-order");
        }
      }
    } catch {
      /* ignore */
    }
  }, [lastOrder]);

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
    const detectorGlobal = window as unknown as { BarcodeDetector?: BarcodeDetectorConstructor };
    const BarcodeDetectorCtor = detectorGlobal.BarcodeDetector;

    if (!BarcodeDetectorCtor) {
      toast.error("Camera scanning not supported in this browser. Use the QR page.");
      return;
    }

    const detector = new BarcodeDetectorCtor({ formats: ["qr_code"] });
    const results = await detector.detect(bitmap);
    const value = results[0]?.rawValue;
    if (!value) {
      toast.error("Couldn’t read the QR. Try again.");
      return;
    }
    const detectedTable = parseTableId(value);
    if (!detectedTable) {
      toast.error("QR found, but tableId missing.");
      return;
    }
    setMode("table");
    setTableId(detectedTable);
    setQrDetected(true);
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: `Got table ${detectedTable}. I’ll route orders there.` },
    ]);
    toast.success(`Table ${detectedTable} detected`);
  };

  const cartPreview = useMemo(
    () =>
      items.map((i) => ({
        itemId: i.itemId,
        name: i.name,
        quantity: i.quantity,
        addOns: i.addOns?.map((a) => a.name),
        notes: i.notes,
      })),
    [items],
  );

  const computeTotals = (overrideCoupon?: string) => {
    const subtotal = total();
    const taxes = Math.round(subtotal * 0.05);
    const fees = mode === "delivery" ? 30 : 0;
    let discount = 0;
    const couponCode = overrideCoupon ?? appliedCoupon;
    if (couponCode) {
      const coupon = couponCatalog[couponCode];
      if (coupon) {
        if (coupon.type === "percent") discount = Math.round((subtotal * coupon.value) / 100);
        if (coupon.type === "flat") discount = coupon.value;
        if (coupon.type === "fees") discount = fees;
      }
    }
    const grandTotal = Math.max(0, subtotal + taxes + fees - discount);
    return { subtotal, taxes, fees, discount, grandTotal };
  };

  const sendMessage = async (prompt?: string) => {
    const content = prompt?.trim();
    if (!content || sending) return;

    const userMessage: Message = { role: "user", content: content.trim() };
    const nextHistory = [...messages, userMessage].slice(-8);
    setMessages([...messages, userMessage]);
    setSending(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextHistory,
          context: {
            mode,
            serviceType,
            tableId,
            contact,
            cart: cartPreview,
            total: total(),
            appliedCoupon,
            lastOrder,
            coupons: couponCatalog,
          },
        }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error?.error ?? "Assistant failed");
      }

      const data = await res.json();
      const assistantReply: Message = {
        role: "assistant",
        content: data.reply ?? "Got it!",
      };

      setMessages((prev) => [...prev, assistantReply]);

      const actions: AiAction[] = Array.isArray(data.actions) ? data.actions : [];
      const addedNames: string[] = [];

      for (const action of actions) {
        if (action.type !== "add_to_cart") continue;
        const item = sampleMenu.find((m) => m.id === action.itemId);
        if (!item) continue;

        const addOns = item.addOns?.filter((a) => action.addOnIds?.includes(a.id));
        const qty = action.quantity && action.quantity > 0 ? action.quantity : 1;

        for (let i = 0; i < qty; i += 1) {
          addItem(item, { addOns, notes: action.notes });
        }
        addedNames.push(`${item.name}${qty > 1 ? ` ×${qty}` : ""}`);
      }

      if (addedNames.length) {
        toast.success(`Added via AI: ${addedNames.join(", ")}`);
      }

      // Apply coupon actions first so totals use the latest code
      let effectiveCoupon = appliedCoupon;
      for (const action of actions) {
        if (action.type !== "apply_coupon") continue;
        const code = action.couponCode?.toUpperCase();
        if (code && couponCatalog[code]) {
          effectiveCoupon = code;
          setAppliedCoupon(code);
          toast.success(`Coupon applied: ${code}`);
        } else {
          toast.error("Invalid coupon code");
        }
      }

      for (const action of actions) {
        if (action.type === "place_order") {
          const state = useCart.getState();
          const currentCart = state.items;
          if (!currentCart.length) {
            toast.error("Cart is empty. I couldn’t place the order.");
            continue;
          }
          const customerEmail = customer?.email ?? state.contact.email;
          if (!customerEmail) {
            toast.error("Sign in or add an email before placing the order.");
            continue;
          }
          if (!state.contact.phone) {
            toast.error("Add a phone number before placing the order.");
            continue;
          }
          const paymentMethod: "upi" | "cod" = state.mode === "table" ? "cod" : "upi";
          const payload = {
            mode: state.mode,
            serviceType: state.serviceType,
            tableId: state.tableId,
            contact: { ...state.contact, phone: state.contact.phone!, email: state.contact.email ?? customerEmail },
            customerId: customer?.id as Id<"customers"> | undefined,
            customerEmail,
            items: currentCart.map((i) => ({
              itemId: i.itemId,
              name: i.name,
              price: i.price,
              quantity: i.quantity,
              addOns: i.addOns?.map((a) => ({ name: a.name, price: a.price })),
              notes: i.notes,
            })),
            paymentMethod,
          };

          try {
            const res = await createOrder(payload);
            setLastOrder({
              id: res?.code ?? "YY",
              mode: state.mode,
              tableId: state.tableId,
              contact: state.contact,
              items: currentCart.map((i) => ({
                name: i.name,
                quantity: i.quantity,
                addOns: i.addOns?.map((a) => a.name),
                notes: i.notes,
              })),
              total: computeTotals(effectiveCoupon).grandTotal,
              status: "pending",
              couponCode: effectiveCoupon,
              placedAt: Date.now(),
            });
            clear();
            setAppliedCoupon(undefined);
            if (paymentMethod === "upi" && res?.upiLink) {
              toast.success(`Order ${res.code} placed. Opening UPI.`);
              window.open(res.upiLink, "_blank");
            } else {
              toast.success(`Order ${res?.code ?? "order"} placed. Pay cash on serve/delivery.`);
            }
          } catch (err) {
            console.error(err);
            toast.error("Couldn’t place the order via AI. Try again.");
          }
        }
        if (action.type === "check_payment") {
          if (!lastOrder) {
            toast.info("No recent order to check payment for.");
          } else {
            toast.info(`Order ${lastOrder.id} payment status: ${lastOrder.status}.`);
          }
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Couldn’t reach the assistant. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const toggleMic = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const speechGlobal = window as unknown as {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const SpeechRecognitionCtor = speechGlobal.SpeechRecognition ?? speechGlobal.webkitSpeechRecognition ?? null;

    if (!SpeechRecognitionCtor) {
      toast.error("Voice input not supported in this browser.");
      return;
    }

    const recog = new SpeechRecognitionCtor();
    recognitionRef.current = recog;
    recog.continuous = false;
    recog.interimResults = true;
    recog.lang = "en-IN";

    let transcript = "";
    recog.onresult = (event: SpeechResultEvent) => {
      transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        transcript += event.results[i][0].transcript;
      }
      setInput(transcript.trim());
    };
    recog.onend = () => setListening(false);
    recog.onerror = () => {
      setListening(false);
      toast.error("Couldn’t capture audio. Try again.");
    };

    setListening(true);
    recog.start();
  };

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-white/80 p-4 shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#3f5d45]">AI waiter</p>
          <p className="text-sm text-[#2c2218]">Chat, get recommendations, and let me add to cart.</p>
          <p className="text-xs text-[var(--muted)]">
            I know your mode ({mode}){mode === "table" && tableId ? ` and table ${tableId}` : ""}.
          </p>
        </div>
        <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[11px] font-semibold text-[var(--accent)]">
          Beta
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-3 py-1 font-semibold text-[#2f4d34] hover:bg-[var(--accent-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
          onClick={() => fileInputRef.current?.click()}
          disabled={sending}
        >
          Open camera (QR)
        </button>
        <span>Scan table QR to auto-set dine-in.</span>
        <input
          ref={fileInputRef}
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
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-2">
        {quickPrompts.map((q) => (
          <button
            key={q}
            type="button"
            className="rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-left text-xs font-semibold text-[#3f3225] transition hover:bg-[var(--accent-soft)]/60"
            onClick={() => void sendMessage(q)}
            disabled={sending}
          >
            {q}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2 rounded-2xl border border-[var(--border)] bg-[var(--accent-soft)]/40 p-3 text-sm">
        <div className="max-h-56 space-y-3 overflow-y-auto pr-1">
          {messages.map((m, idx) => (
            <div
              key={`${m.role}-${idx}`}
              className={m.role === "assistant" ? "text-[#2c2218]" : "text-[#3f5d45] font-semibold"}
            >
              <span className="mr-2 rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-[var(--accent)]">
                {m.role === "assistant" ? "AI" : "You"}
              </span>
              <span>{m.content}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <AIInput
            placeholder="Ask for a rec or say “Add 2 flat whites with oat milk”"
            value={input}
            onChange={setInput}
            onSubmit={(value) => void sendMessage(value)}
            className="py-0"
          />
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              variant={listening ? "primary" : "outline"}
              className="h-10 px-3"
              onClick={toggleMic}
              aria-label={listening ? "Stop voice input" : "Start voice input"}
            >
              {listening ? "Listening…" : "Voice"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

