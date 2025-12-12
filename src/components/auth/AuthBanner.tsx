'use client';

import { FormEvent, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useAuth } from "@/stores/auth";
import { useCart } from "@/stores/cart";
import { toast } from "sonner";

export function AuthBanner() {
  const requestCode = useMutation(api.auth.requestCode);
  const verifyCode = useMutation(api.auth.verifyCode);
  const { customer, setCustomer, setPendingEmail, pendingEmail, signOut } = useAuth();
  const { contact, setContact } = useCart();
  const [email, setEmail] = useState(pendingEmail ?? customer?.email ?? contact.email ?? "");
  const [name, setName] = useState(contact.name ?? "");
  const [phone, setPhone] = useState(contact.phone ?? "");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentAt, setSentAt] = useState<number | undefined>();

  const handleSend = async (e?: FormEvent) => {
    e?.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast.error("Enter an email to sign in.");
      return;
    }
    try {
      setLoading(true);
      const res = await requestCode({ email: trimmedEmail });
      setPendingEmail(trimmedEmail);
      setSentAt(res?.expiresAt ?? Date.now());
      toast.success(`Code sent. For demo: ${res.code}`);
    } catch (err) {
      console.error(err);
      toast.error("Could not send code. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e?: FormEvent) => {
    e?.preventDefault();
    const emailToUse = pendingEmail ?? email.trim();
    if (!emailToUse || !code.trim()) {
      toast.error("Enter both email and code.");
      return;
    }
    try {
      setLoading(true);
      const profile = await verifyCode({
        email: emailToUse,
        code: code.trim(),
        name: name || undefined,
        phone: phone || undefined,
        community: contact.community,
        tower: contact.tower,
        unit: contact.unit,
      });
      if (profile) {
        setCustomer(profile);
        setContact({
          ...contact,
          name: profile.name ?? contact.name,
          phone: profile.phone ?? contact.phone,
          email: profile.email,
          community: profile.community ?? contact.community,
          tower: profile.tower ?? contact.tower,
          unit: profile.unit ?? contact.unit,
        });
        setCode("");
        toast.success(`Signed in as ${profile.email}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Verification failed. Check your code.");
    } finally {
      setLoading(false);
    }
  };

  if (customer) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-white/80 p-3 text-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#3f5d45]">Signed in</p>
          <p className="text-sm font-semibold text-[#2c2218]">{customer.email}</p>
          <p className="text-xs text-muted">
            {customer.name || "Guest"} · {customer.phone ?? "Add phone"}{" "}
            {contact.community ? `· ${contact.community}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Drawer direction="top">
      <DrawerTrigger asChild>
        <button
          type="button"
          className="group flex w-full items-center justify-between gap-2 rounded-2xl border border-border bg-white/80 p-3 text-left shadow-sm transition hover:-translate-y-px hover:shadow-md focus:outline-none focus:ring-2 focus:ring-accent-soft"
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3f5d45]">Account</p>
            <p className="text-sm text-[#2c2218]">Sign in to save orders and track payments.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-accent-soft px-3 py-1 text-[11px] font-semibold text-accent">
              Email login
            </span>
            <span className="hidden text-xs font-semibold text-accent sm:inline">Open</span>
          </div>
        </button>
      </DrawerTrigger>

      <DrawerContent side="top" className="bg-white/98">
        <div className="mx-auto w-full max-w-3xl px-4 pb-6 pt-3">
          <DrawerHeader className="flex flex-row items-start justify-between gap-3 px-0 pt-0">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#3f5d45]">Account</p>
              <DrawerTitle className="text-lg font-semibold text-[#2c2218]">
                Sign in to save orders and track payments
              </DrawerTitle>
              <DrawerDescription className="text-xs text-[#52473a]">
                Use a magic code to sign in; we’ll auto-fill your details.
              </DrawerDescription>
            </div>
            <DrawerClose
              className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-[#2c2218] shadow-sm transition hover:bg-accent-soft focus:outline-none"
              aria-label="Close account drawer"
            >
              ×
            </DrawerClose>
          </DrawerHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (pendingEmail) {
                void handleVerify(e);
              } else {
                void handleSend(e);
              }
            }}
            className="mt-3 rounded-2xl border border-border bg-white/90 p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#3f5d45]">Email login</p>
                <p className="text-sm text-[#2c2218]">We’ll send a 6-digit code to your email.</p>
              </div>
              <span className="rounded-full bg-accent-soft px-3 py-1 text-[11px] font-semibold text-accent">
                Secure & quick
              </span>
            </div>

            <div className="mt-3 grid gap-2 md:grid-cols-3">
              <Input
                label="Email"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
              <Input
                label="Name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
              <Input
                label="Phone (optional)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit phone"
              />
            </div>

            {pendingEmail ? (
              <div className="mt-2 grid gap-2 md:grid-cols-[1fr_auto]">
                <Input
                  label="Enter code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="6-digit code"
                />
                <div className="flex items-end gap-2">
                  <Button type="submit" loading={loading}>
                    Verify & Sign in
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setPendingEmail(undefined)}>
                    Edit email
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-2">
                <Button type="submit" loading={loading}>
                  Send code
                </Button>
              </div>
            )}
            {sentAt && (
              <p className="mt-1 text-xs text-muted">
                Code expires in 10 minutes. For demo, we show the code above.
              </p>
            )}
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
