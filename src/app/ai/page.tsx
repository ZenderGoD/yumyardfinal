'use client';

import Link from "next/link";
import { AssistantChat } from "@/components/menu/AssistantChat";
import { Button } from "@/components/ui/button";

export default function AiPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#3f5d45]">Yum Yard AI</p>
          <h1 className="text-2xl font-bold text-[#2c2218]">Full chat</h1>
          <p className="text-sm text-[#52473a]">
            Chat in full screen, scan QR for tables, and auto-add items to cart.
          </p>
        </div>
        <Button asChild variant="soft">
          <Link href="/menu">Back to menu</Link>
        </Button>
      </div>

      <div className="mt-6 rounded-3xl border border-border bg-white/80 p-4 shadow-lg">
        <AssistantChat />
      </div>
    </div>
  );
}

