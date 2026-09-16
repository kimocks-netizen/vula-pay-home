export const zar = (cents: number) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
  }).format(cents / 100);

export const zarShort = (cents: number) => {
  const rands = cents / 100;
  if (rands >= 1_000_000) return `R{(rands / 1_000_000).toFixed(1)}m`;
  if (rands >= 10_000) return `R{(rands / 1000).toFixed(1)}k`;
  return `R{rands.toFixed(0)}`;
};

export const dateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-ZA", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export const dateOnly = (iso: string) =>
  new Date(iso).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });

export const methodLabel = (m: string) =>
  ({ card: "Card", apple_pay: "Apple Pay", google_pay: "Google Pay" })[m] ?? m;
