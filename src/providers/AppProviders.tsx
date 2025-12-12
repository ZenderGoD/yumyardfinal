'use client';

import { ReactNode } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Toaster } from "sonner";

const getConvexClient = () => {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL ?? "http://localhost:3210";
  return new ConvexReactClient(url, { verbose: false });
};

const client = getConvexClient();

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ConvexProvider client={client}>
      {children}
      <Toaster richColors />
    </ConvexProvider>
  );
}



