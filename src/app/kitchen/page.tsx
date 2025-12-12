'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import OwnerDashboard, { OrderTab, normalizeTab } from "@/app/(owner)/owner/dashboard/page";
import { AuthBanner } from "@/components/auth/AuthBanner";
import { Button } from "@/components/ui/button";
import { adminEmailsList, ownerEmailsList } from "@/lib/admin";
import { useAuth } from "@/stores/auth";

export default function KitchenPage() {
  const pathname = usePathname();
  const currentTab = useMemo(() => {
    const last = pathname?.split("/").filter(Boolean).pop();
    if (!last || last === "kitchen") return "all" as OrderTab;
    return normalizeTab(last);
  }, [pathname]);
  return <KitchenContent initialTab={currentTab} />;
}

export function KitchenContent({ initialTab }: { initialTab: OrderTab }) {
  const { customer, isAdmin, isOwner } = useAuth();
  const router = useRouter();
  const admins = adminEmailsList();
  const owners = ownerEmailsList();
  const [activeTab, setActiveTab] = useState<OrderTab>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (customer && !isAdmin) {
      router.replace("/menu");
    }
  }, [customer, isAdmin, router]);

  if (!customer) {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-10 space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            Kitchen console
          </p>
          <h1 className="text-2xl font-bold text-[#2c2218]">Admin sign-in required</h1>
          <p className="text-sm text-muted">
            Only admin emails can open the kitchen dashboard. Set comma-separated emails in
            NEXT_PUBLIC_ADMIN_EMAILS and sign in with one of them.
          </p>
          {admins.length ? (
            <p className="text-xs text-muted">
              Current admin emails: <span className="font-semibold text-[#2c2218]">{admins.join(", ")}</span>
            </p>
          ) : null}
          {owners.length ? (
            <p className="text-xs text-muted">
              Owner insights: <span className="font-semibold text-[#2c2218]">{owners.join(", ")}</span>
            </p>
          ) : null}
        </div>
        <AuthBanner />
        <div className="text-sm text-muted">
          <Link href="/menu" className="font-semibold text-accent underline">
            Back to menu
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-10 space-y-3">
        <h1 className="text-2xl font-bold text-[#2c2218]">No kitchen access</h1>
        <p className="text-sm text-muted">
          Your account is not marked as admin. Use an email from NEXT_PUBLIC_ADMIN_EMAILS or contact an admin.
        </p>
        <div className="flex gap-2">
          <Button onClick={() => router.push("/menu")}>Go to menu</Button>
          <Button variant="outline" onClick={() => router.refresh()}>
            Refresh access
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 pt-6">
        <div className="flex items-center gap-2">
          <Button asChild variant="secondary" size="sm">
            <Link href="/">Back to app</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/kitchen/menu">Manage menu</Link>
          </Button>
        </div>
        {isOwner ? (
          <Link
            href="/kitchen/owner/insights"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1 text-sm font-semibold text-[#2f4d34] shadow-sm hover:bg-accent-soft"
          >
            View insights
          </Link>
        ) : null}
      </div>
      <OwnerDashboard
        tab={activeTab}
        onTabChange={(next) => {
          setActiveTab(next);
          const path = next === "all" ? "/kitchen" : `/kitchen/${next}`;
          router.replace(path);
        }}
      />
    </>
  );
}
