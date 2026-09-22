export interface CartItem {
  id: string;
  name: string;
  variant: string;
  image: string;
  unitPrice: number;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  items: string;
  total: number;
  status: "In Production" | "Shipped" | "Delivered" | "Awaiting Approval";
}

export interface QuoteRequest {
  id: string;
  date: string;
  product: string;
  quantity: number;
  status: "Pending" | "Quoted" | "Expired";
  estimate?: number;
}

export const MOCK_CART: CartItem[] = [
  {
    id: "1",
    name: "DTF Transfers",
    variant: "Gang Sheet — 22\" x 24\"",
    image: "/images/products/dtf-300x300.webp",
    unitPrice: 24.99,
    quantity: 2,
  },
  {
    id: "2",
    name: "UV DTF Stickers",
    variant: "3\" Round — Pack of 50",
    image: "/images/products/uv-dtf-300x300.webp",
    unitPrice: 34.5,
    quantity: 1,
  },
  {
    id: "3",
    name: "Business Cards",
    variant: "16pt Matte — Qty 500",
    image: "/images/bussinessCard.webp",
    unitPrice: 42.0,
    quantity: 1,
  },
];

export const MOCK_ORDERS: Order[] = [
  { id: "PPR-10482", date: "Aug 28, 2026", items: "200x DTF Transfers", total: 189.0, status: "Shipped" },
  { id: "PPR-10471", date: "Aug 19, 2026", items: "Business Cards, Banners", total: 312.4, status: "Delivered" },
  { id: "PPR-10465", date: "Aug 10, 2026", items: "500x UV DTF Stickers", total: 245.0, status: "In Production" },
  { id: "PPR-10450", date: "Jul 29, 2026", items: "Team Jerseys x24", total: 960.0, status: "Delivered" },
];

export const MOCK_QUOTES: QuoteRequest[] = [
  { id: "Q-2291", date: "Sep 2, 2026", product: "Event Tents", quantity: 3, status: "Quoted", estimate: 890 },
  { id: "Q-2287", date: "Aug 30, 2026", product: "Glitter DTF Transfers", quantity: 150, status: "Pending" },
  { id: "Q-2260", date: "Aug 12, 2026", product: "Custom Hoodies", quantity: 40, status: "Expired" },
];

export const MOCK_USER = {
  name: "Jordan Blake",
  email: "jordan@example.com",
  business: "Blake Print Co.",
  phone: "(555) 012-4488",
};
