import { NextResponse } from "next/server";
import { sampleMenu } from "@/lib/sampleData";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const MODEL = "openai/gpt-4o-mini";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = (body?.messages ?? []) as ChatMessage[];
    const context = body?.context ?? {};

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY missing on server" },
        { status: 500 },
      );
    }

    const compactMenu = sampleMenu.map(({ id, name, description, price, category, addOns }) => ({
      id,
      name,
      description,
      price,
      category,
      addOns: addOns?.map((a) => ({ id: a.id, name: a.name, price: a.price })),
    }));

    const couponCatalog = [
      { code: "WELCOME10", kind: "percent", value: 10, note: "10% off cart" },
      { code: "COFFEE50", kind: "flat", value: 50, note: "₹50 off coffee combos" },
      { code: "FREESHIP", kind: "fees", value: 30, note: "Waive delivery fee" },
    ];

    const systemPrompt = [
      "You are Yum Yard AI, a friendly order concierge.",
      "Goals: suggest menu items, remember delivery/table context, and propose cart actions.",
      "Always respond as JSON: { reply: string, actions?: [{ type: 'add_to_cart'|'place_order'|'apply_coupon'|'check_payment', itemId?: string, quantity?: number, addOnIds?: string[], notes?: string, couponCode?: string }], suggestions?: [{ itemId: string, reason: string }] }",
      "Use lastOrder context to recall what the guest had previously and offer thoughtful repeats/combos.",
      "Supported actions:",
      "- add_to_cart: include itemId from menu, optional quantity/addOnIds/notes.",
      "- place_order: call this only when cart is valid; use current cart/mode/contact; do not invent items.",
      "- apply_coupon: propose couponCode only from the provided coupon catalog.",
      "- check_payment: use lastOrder context; if none, say so.",
      "Never invent item ids or coupon codes.",
      "Respect mode: 'table' can skip address; 'delivery' needs phone + address.",
      "Keep the reply concise and acknowledge any cart/checkout changes you propose.",
    ].join(" ");

    const payloadMessages = [
      { role: "system", content: systemPrompt },
      {
        role: "system",
        content: `Menu catalog (id/name/price/addOns): ${JSON.stringify(compactMenu)}`,
      },
      {
        role: "system",
        content: `Coupon catalog: ${JSON.stringify(couponCatalog)}`,
      },
      {
        role: "system",
        content: `Context: ${JSON.stringify(context)}`,
      },
      ...messages,
    ];

    const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
        "X-Title": "Yum Yard Cafe",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: payloadMessages,
        temperature: 0.6,
        max_tokens: 400,
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const errorText = await aiRes.text();
      return NextResponse.json(
        { error: "OpenRouter request failed", details: errorText },
        { status: 500 },
      );
    }

    const data = await aiRes.json();
    const rawContent: string | undefined = data?.choices?.[0]?.message?.content;

    let parsed: { reply?: string; actions?: unknown; suggestions?: unknown } | null = null;
    if (rawContent) {
      try {
        parsed = JSON.parse(rawContent);
      } catch {
        parsed = null;
      }
    }

    const reply = parsed?.reply ?? rawContent ?? "Sorry, I could not respond just now.";
    const actions = parsed && Array.isArray(parsed.actions) ? parsed.actions : [];
    const suggestions = parsed && Array.isArray(parsed.suggestions) ? parsed.suggestions : [];

    return NextResponse.json({ reply, actions, suggestions });
  } catch (error) {
    console.error("[AI_ROUTE_ERROR]", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}

