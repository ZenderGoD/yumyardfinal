import { create } from "zustand";
import { persist } from "zustand/middleware";
import { isAdminEmail, isOwnerEmail } from "@/lib/admin";

export type CustomerProfile = {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  community?: string;
  tower?: string;
  unit?: string;
  role?: "admin";
  owner?: boolean;
};

type AuthState = {
  customer?: CustomerProfile;
  pendingEmail?: string;
  isAdmin: boolean;
  isOwner: boolean;
  setPendingEmail: (email?: string) => void;
  setCustomer: (customer?: CustomerProfile) => void;
  signOut: () => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      customer: undefined,
      pendingEmail: undefined,
      isAdmin: false,
      isOwner: false,
      setPendingEmail: (email) => set({ pendingEmail: email }),
      setCustomer: (customer) =>
        set(() => {
          if (!customer)
            return { customer: undefined, isAdmin: false, isOwner: false, pendingEmail: undefined };
          const admin = customer.role === "admin" || isAdminEmail(customer.email);
          const owner = customer.owner === true || isOwnerEmail(customer.email);
          return {
            customer: { ...customer, role: admin ? "admin" : customer.role, owner },
            isAdmin: admin,
            isOwner: owner,
            pendingEmail: undefined,
          };
        }),
      signOut: () => set({ customer: undefined, isAdmin: false, isOwner: false }),
    }),
    { name: "yy-auth" },
  ),
);
