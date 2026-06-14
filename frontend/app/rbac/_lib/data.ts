// Dummy data for the RBAC showcase. Cents are used for money so we can reuse
// the site's formatPrice(). Images point at existing /public assets.

export type OrderStatus = "offen" | "versendet" | "geliefert" | "storniert";

export const PRODUCTS = [
  { id: "p1", name: "Nike Tech Fleece — Grey", category: "Streetwear", priceCents: 12900, image: "/products/nike-tech-fleece-grey-1.png", rating: 4.8 },
  { id: "p2", name: "Baggy Jeans — Blue", category: "Hosen & Jeans", priceCents: 8900, image: "/products/baggy-jeans-blue-1.png", rating: 4.6 },
  { id: "p3", name: "Adidas Sneaker", category: "Sneaker", priceCents: 11900, image: "/products/adidas-sneaker-1.png", rating: 4.7 },
  { id: "p4", name: "Iced Green Watch", category: "Uhren", priceCents: 19900, image: "/products/iced-green-watch.png", rating: 4.9 },
  { id: "p5", name: "Polo Ralph Lauren Sneaker", category: "Sneaker", priceCents: 13900, image: "/products/polo-ralph-lauren-sneaker-1.png", rating: 4.5 },
  { id: "p6", name: "Nike Street Sneaker", category: "Sneaker", priceCents: 10900, image: "/products/nike-street-sneaker-1.png", rating: 4.4 },
];

export const CATEGORIES = [
  { name: "Sneaker", image: "/categories/sneaker.png" },
  { name: "Streetwear", image: "/categories/streetwear.png" },
  { name: "Hosen & Jeans", image: "/categories/hosen-jeans.png" },
  { name: "Schmuck", image: "/categories/schmuck.png" },
  { name: "Accessoires", image: "/categories/accessoires.png" },
  { name: "Herrenmode", image: "/categories/herrenmode.png" },
];

export const MY_ORDERS = [
  { id: "NOR-1042", date: "02.06.2026", status: "geliefert" as OrderStatus, totalCents: 22800, items: 2 },
  { id: "NOR-1031", date: "21.05.2026", status: "versendet" as OrderStatus, totalCents: 11900, items: 1 },
  { id: "NOR-1009", date: "04.05.2026", status: "geliefert" as OrderStatus, totalCents: 19900, items: 1 },
];

export const ALL_ORDERS = [
  { id: "NOR-1051", customer: "Lena Vogt", date: "07.06.2026", status: "offen" as OrderStatus, totalCents: 24800, items: 2 },
  { id: "NOR-1050", customer: "Marc Becker", date: "07.06.2026", status: "offen" as OrderStatus, totalCents: 10900, items: 1 },
  { id: "NOR-1049", customer: "Aisha Demir", date: "06.06.2026", status: "versendet" as OrderStatus, totalCents: 33800, items: 3 },
  { id: "NOR-1048", customer: "Tom König", date: "06.06.2026", status: "versendet" as OrderStatus, totalCents: 12900, items: 1 },
  { id: "NOR-1047", customer: "Sara Wolf", date: "05.06.2026", status: "geliefert" as OrderStatus, totalCents: 19900, items: 1 },
  { id: "NOR-1046", customer: "Jan Peters", date: "05.06.2026", status: "storniert" as OrderStatus, totalCents: 8900, items: 1 },
];

export const TICKETS = [
  { id: "T-204", customer: "Lena Vogt", subject: "Wo ist mein Paket?", status: "offen", last: "vor 12 Min" },
  { id: "T-203", customer: "Marc Becker", subject: "Größe umtauschen (M → L)", status: "offen", last: "vor 1 Std" },
  { id: "T-201", customer: "Sara Wolf", subject: "Rechnung als PDF?", status: "beantwortet", last: "vor 3 Std" },
  { id: "T-198", customer: "Tom König", subject: "Rabattcode funktioniert nicht", status: "geschlossen", last: "gestern" },
];

export const INVENTORY = [
  { sku: "TF-GRY-M", name: "Nike Tech Fleece — Grey (M)", stock: 3 },
  { sku: "BJ-BLU-32", name: "Baggy Jeans — Blue (32)", stock: 0 },
  { sku: "AD-SNK-43", name: "Adidas Sneaker (43)", stock: 11 },
  { sku: "WTCH-GRN", name: "Iced Green Watch", stock: 6 },
  { sku: "PRL-SNK-42", name: "Polo Ralph Lauren Sneaker (42)", stock: 2 },
];

// Owner-only financials
export const KPIS = {
  totalRevenueCents: 184_320_00,
  profitMarginPct: 38.4,
  conversionRatePct: 3.2,
  aovCents: 9_840,
};

export const REVENUE_BY_MONTH = [
  { label: "Jan", valueCents: 9_800_00 },
  { label: "Feb", valueCents: 11_200_00 },
  { label: "Mär", valueCents: 10_400_00 },
  { label: "Apr", valueCents: 14_600_00 },
  { label: "Mai", valueCents: 17_900_00 },
  { label: "Jun", valueCents: 21_300_00 },
];

export const REVENUE_BY_REGION = [
  { region: "Deutschland", valueCents: 98_400_00 },
  { region: "Österreich", valueCents: 31_200_00 },
  { region: "Schweiz", valueCents: 27_600_00 },
  { region: "Niederlande", valueCents: 14_800_00 },
  { region: "Frankreich", valueCents: 12_320_00 },
];

export const EMPLOYEES = [
  { name: "Mara K.", role: "owner", email: "owner@norevan.shop" },
  { name: "Nina S.", role: "admin", email: "nina@norevan.shop" },
  { name: "Kjell B.", role: "admin", email: "kjell@norevan.shop" },
  { name: "Pia M.", role: "staff", email: "pia@norevan.shop" },
];
