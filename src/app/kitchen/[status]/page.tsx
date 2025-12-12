'use client';

import { KitchenContent } from "../page";
import { normalizeTab } from "@/app/(owner)/owner/dashboard/page";

export default function KitchenStatusPage({ params }: { params: { status: string } }) {
  const tab = normalizeTab(params.status);
  return <KitchenContent initialTab={tab} />;
}



