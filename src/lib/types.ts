export type MenuAddOn = {
  id: string;
  name: string;
  price: number;
};

export type MenuVariant = {
  id: string;
  name: string;
  priceDelta: number;
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  tags?: string[];
  available?: boolean;
  addOns?: MenuAddOn[];
  variants?: MenuVariant[];
};

export type Table = {
  id: string;
  label: string;
  zone?: string;
  active: boolean;
};

export type PaymentMethod = "upi" | "cod";
export type PaymentStatus = "pending" | "pending_cash" | "paid" | "failed" | "refunded";

export type OrderAddOn = {
  name: string;
  price: number;
};

export type OrderItem = {
  itemId?: string;
  name: string;
  price: number;
  quantity: number;
  addOns?: OrderAddOn[];
  notes?: string;
  variantName?: string;
};

export type OrderStatus =
  | "submitted"
  | "accepted"
  | "preparing"
  | "packed"
  | "on_the_way"
  | "served"
  | "delivered"
  | "cancelled";

export type Order = {
  code?: string;
  id: string;
  mode: "table" | "delivery";
  tableId?: string;
  serviceType?: "table" | "takeaway";
  customerId?: string;
  customerEmail?: string;
  contact: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    landmark?: string;
    community?: string;
    tower?: string;
    unit?: string;
  };
  payment: {
    method: PaymentMethod;
    status: PaymentStatus | "pending_cash";
    reference?: string;
    upiLink?: string;
    amount: number;
  };
  status: OrderStatus;
  statusHistory: { status: OrderStatus; at: number; note?: string }[];
  items: OrderItem[];
  totals: { subtotal: number; tax: number; fees: number; grandTotal: number };
  etaMinutes?: number;
  rider?: { name: string; phone: string };
  createdAt: number;
  updatedAt: number;
};

