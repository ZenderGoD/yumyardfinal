import { Order, MenuItem, Table } from "./types";

export const sampleMenu: MenuItem[] = [
  {
    id: "flat-white",
    name: "Forest Flat White",
    description: "Velvety espresso with microfoam, honey drizzle, hint of cardamom.",
    price: 220,
    category: "Coffee",
    tags: ["best seller", "signature"],
    image: "/images/flat-white.jpg",
    addOns: [
      { id: "extra-shot", name: "Extra shot", price: 45 },
      { id: "oat-milk", name: "Oat milk", price: 35 },
      { id: "jaggery", name: "Organic jaggery", price: 20 },
    ],
  },
  {
    id: "dirty-matcha",
    name: "Dirty Matcha",
    description: "Ceremonial matcha with ristretto, vanilla, and brown sugar.",
    price: 260,
    category: "Coffee",
    tags: ["seasonal"],
    image: "/images/matcha.jpg",
    addOns: [
      { id: "cold-foam", name: "Cold foam cap", price: 30 },
      { id: "almond-milk", name: "Almond milk", price: 30 },
    ],
  },
  {
    id: "burrata-salad",
    name: "Heirloom Burrata Salad",
    description: "Burrata, slow-roasted tomatoes, basil oil, balsamic pearls.",
    price: 480,
    category: "Brunch",
    tags: ["light", "vegetarian"],
    image: "/images/burrata.jpg",
    addOns: [
      { id: "sourdough", name: "Charred sourdough", price: 40 },
      { id: "avocado", name: "Avocado fan", price: 70 },
    ],
  },
  {
    id: "sourdough-club",
    name: "Smoky Sourdough Club",
    description: "Smoked paprika chicken, fried egg, greens, aioli on sourdough.",
    price: 420,
    category: "Brunch",
    tags: ["hearty"],
    image: "/images/club.jpg",
    addOns: [{ id: "bacon", name: "Crispy bacon", price: 90 }],
  },
  {
    id: "tiramisu-cup",
    name: "Cocoa Tiramisu Cup",
    description: "Mascarpone, espresso-soaked ladyfingers, cocoa dust, cacao nibs.",
    price: 260,
    category: "Desserts",
    tags: ["classic"],
    image: "/images/tiramisu.jpg",
  },
  {
    id: "affogato",
    name: "Affogato Duo",
    description: "Double ristretto over vanilla bean gelato and cacao nib crumble.",
    price: 230,
    category: "Desserts",
    tags: ["coffee"],
    image: "/images/affogato.jpg",
  },
];

export const sampleTables: Table[] = [
  { id: "T1", label: "Table 1 · Window", zone: "Indoor", active: true },
  { id: "T2", label: "Table 2 · Patio", zone: "Outdoor", active: true },
  { id: "T3", label: "Table 3 · Booth", zone: "Indoor", active: true },
];

const now = Date.now();

export const sampleOrders: Order[] = [
  {
    id: "YY-2041",
    mode: "table",
    tableId: "T2",
    contact: { name: "Aarav", phone: "9999999999" },
    payment: {
      method: "upi",
      status: "paid",
      reference: "UTR12345",
      amount: 640,
      upiLink: "",
    },
    status: "preparing",
    statusHistory: [
      { status: "submitted", at: now - 18 * 60 * 1000 },
      { status: "accepted", at: now - 17 * 60 * 1000 },
      { status: "preparing", at: now - 10 * 60 * 1000, note: "Chef picked up" },
    ],
    items: [
      {
        itemId: "flat-white",
        name: "Forest Flat White",
        price: 220,
        quantity: 2,
        addOns: [{ id: "oat-milk", name: "Oat milk", price: 35 }],
      },
      {
        itemId: "tiramisu-cup",
        name: "Cocoa Tiramisu Cup",
        price: 260,
        quantity: 1,
      },
    ],
    totals: { subtotal: 700, tax: 35, fees: -95, grandTotal: 640 },
    etaMinutes: 12,
    createdAt: now - 20 * 60 * 1000,
    updatedAt: now - 2 * 60 * 1000,
  },
  {
    id: "YY-2042",
    mode: "delivery",
    contact: {
      name: "Nisha",
      phone: "8888888888",
      address: "12, Lakeview Residency, Block B",
      landmark: "Opp. Green Park",
    },
    payment: {
      method: "cod",
      status: "pending",
      amount: 520,
      upiLink: "",
    },
    status: "on_the_way",
    statusHistory: [
      { status: "submitted", at: now - 45 * 60 * 1000 },
      { status: "accepted", at: now - 43 * 60 * 1000 },
      { status: "preparing", at: now - 35 * 60 * 1000 },
      { status: "packed", at: now - 22 * 60 * 1000 },
      { status: "on_the_way", at: now - 10 * 60 * 1000 },
    ],
    items: [
      {
        itemId: "sourdough-club",
        name: "Smoky Sourdough Club",
        price: 420,
        quantity: 1,
        notes: "Add pickled onions",
      },
      {
        itemId: "affogato",
        name: "Affogato Duo",
        price: 230,
        quantity: 1,
      },
    ],
    totals: { subtotal: 650, tax: 32.5, fees: -162.5, grandTotal: 520 },
    etaMinutes: 18,
    rider: { name: "Dev", phone: "9876543210" },
    createdAt: now - 50 * 60 * 1000,
    updatedAt: now - 5 * 60 * 1000,
  },
];

