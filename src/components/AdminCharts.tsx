import type { ReactNode } from "react";

export const chartPalette = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

export const tooltipStyle = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 12,
  fontSize: 12,
  color: "var(--color-foreground)",
} as const;

export const axisTick = { fontSize: 11, fill: "var(--color-muted-foreground)" } as const;

export function ChartPanel({
  title,
  hint,
  height = 260,
  children,
  className = "",
}: {
  title: string;
  hint?: string;
  height?: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-5 ${className}`}>
      <h2 className="font-display text-base font-bold">{title}</h2>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      <div className="mt-4" style={{ height }}>
        {children}
      </div>
    </div>
  );
}

/** Groups ISO-dated rows into the last `days` calendar days. */
export function byDay<T extends { createdAt: string }>(rows: T[], days = 14) {
  const buckets = new Map<string, T[]>();
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    buckets.set(d.toISOString().slice(0, 10), []);
  }
  for (const r of rows) {
    const key = r.createdAt.slice(0, 10);
    const bucket = buckets.get(key);
    if (bucket) bucket.push(r);
  }
  return [...buckets.entries()].map(([date, items]) => ({
    date,
    label: new Date(`${date}T00:00:00Z`).toLocaleDateString("en-ZA", {
      day: "2-digit",
      month: "short",
    }),
    items,
  }));
}
