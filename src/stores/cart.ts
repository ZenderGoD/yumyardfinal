import { create } from "zustand";
import { MenuItem, OrderItem } from "@/lib/types";
import { sampleTables } from "@/lib/sampleData";

type Mode = "table" | "delivery";

type Contact = {
  name?: string;
  phone?: string;
  address?: string;
  landmark?: string;
};

type CartState = {
  mode: Mode;
  tableId?: string;
  items: OrderItem[];
  contact: Contact;
  setMode: (mode: Mode) => void;
  setTableId: (id?: string) => void;
  setContact: (contact: Contact) => void;
  addItem: (item: MenuItem, options?: { addOns?: MenuItem["addOns"]; notes?: string }) => void;
  removeItem: (itemId: string) => void;
  clear: () => void;
  total: () => number;
  tables: typeof sampleTables;
};

export const useCart = create<CartState>((set, get) => ({
  mode: "table",
  tableId: sampleTables[0]?.id,
  items: [],
  contact: {},
  tables: sampleTables,
  setMode: (mode) =>
    set(() => ({
      mode,
      tableId: mode === "table" ? sampleTables[0]?.id : undefined,
    })),
  setTableId: (id) => set(() => ({ tableId: id })),
  setContact: (contact) => set(() => ({ contact })),
  addItem: (item, options) =>
    set((state) => {
      const existing = state.items.find((i) => i.itemId === item.id && i.notes === options?.notes);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i === existing ? { ...i, quantity: i.quantity + 1 } : i,
          ),
        };
      }
      const newItem: OrderItem = {
        itemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        addOns: options?.addOns,
        notes: options?.notes,
      };
      return { ...state, items: [...state.items, newItem] };
    }),
  removeItem: (itemId) =>
    set((state) => ({
      ...state,
      items: state.items.filter((i) => i.itemId !== itemId),
    })),
  clear: () => set({ items: [] }),
  total: () => {
    const { items } = get();
    return items.reduce((sum, i) => {
      const addOnTotal = i.addOns?.reduce((acc, a) => acc + a.price, 0) ?? 0;
      return sum + (i.price + addOnTotal) * i.quantity;
    }, 0);
  },
}));

