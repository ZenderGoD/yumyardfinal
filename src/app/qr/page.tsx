'use client';

import { QRCodeSVG } from "qrcode.react";
import { sampleTables } from "@/lib/sampleData";

export default function QrPage() {
  const base = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold text-[#2c2218]">QRs for tables</h1>
      <p className="text-sm text-[var(--muted)]">
        Scan to prefill the table on the customer menu page.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {sampleTables.map((table) => {
          const url = `${base}/menu?tableId=${table.id}`;
          return (
            <div
              key={table.id}
              className="rounded-2xl border border-[var(--border)] bg-white/80 p-4 shadow-sm"
            >
              <p className="text-base font-semibold text-[#2c2218]">{table.label}</p>
              <p className="text-xs text-[var(--muted)]">{url}</p>
              <div className="mt-3 flex justify-center">
                <QRCodeSVG value={url} size={180} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

