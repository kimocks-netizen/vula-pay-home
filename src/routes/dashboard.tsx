import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Clock, Plus, Receipt, TrendingUp, Wallet } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AppShell } from "@/components/AppShell";
import { api } from "@/lib/api/client";
import { useAuth } from "@/lib/auth";
import { dateTime, methodLabel, zar, zarShort } from "@/lib/format";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Overview — ScanPay dashboard" },
      { name: "description", content: "Today's sales, settlements and payment code activity on ScanPay." },
      { property: "og:title", content: "Overview — ScanPay dashboard" },
      { property: "og:description", content: "Track sales, fees and settlements across your ScanPay codes." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();
  const merchantId = user?.merchantId ?? "";

  const { data: txns } = useQuery({
    queryKey: ["transactions", merchantId],
    queryFn: () => api.listTransactions(merchantId),
    enabled: !!merchantId,
  });
  const { data: codes } = useQuery({
    queryKey: ["codes", merchantId],
    queryFn: () => api.listPaymentCodes(merchantId),
    enabled: !!merchantId,
  });

  const all = txns ?? [];
  const success = all.filter((t) => t.status === "success");
  const today = new Date().toDateString();
  const todayTotal = success
    .filter((t) => new Date(t.createdAt).toDateString() === today)
    .reduce((s, t) => s + t.amountCents, 0);
  const monthTotal = success
    .filter((t) => new Date(t.createdAt).getMonth() === new Date().getMonth())
    .reduce((s, t) => s + t.amountCents, 0);
  const pending = all.filter((t) => t.status === "pending").length;
  const feesTotal = success.reduce((s, t) => s + t.platformFeeCents + t.providerFeeCents, 0);

  const byDay = new Map<string, number>();
  success.forEach((t) => {
    const key = t.createdAt.slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + t.amountCents);
  });
  const chart = [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30)
    .map(([day, cents]) => ({
      day: new Date(day).toLocaleDateString("en-ZA", { day: "2-digit", month: "short" }),
      value: cents / 100,
    }));

  const stats = [
    { label: "Sales today", value: zar(todayTotal), icon: Wallet, hint: "Successful payments" },
    { label: "This month", value: zar(monthTotal), icon: TrendingUp, hint: `${success.length} payments` },
    { label: "Pending", value: String(pending), icon: Clock, hint: "Awaiting confirmation" },
    { label: "Fees (all time)", value: zar(feesTotal), icon: Receipt, hint: "Platform + Paystack" },
  ];

  return (
    <AppShell
      title={`Sanibonani, ${user?.fullName?.split(" ")[0] ?? ""}`}
      subtitle="Here's how your payment codes are performing."
      action={
        <Link
          to="/codes"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="size-4" /> New payment code
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <s.icon className="size-4 text-primary" />
            </div>
            <p className="mt-3 font-display text-2xl font-bold">{s.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-lg font-bold">Sales, last 30 days</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart} margin={{ left: -18, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => zarShort(v * 100)}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(v) => [zar(Number(v) * 100), "Sales"]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  fill="url(#fill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Top payment codes</h2>
            <Link to="/codes" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {(codes ?? [])
              .slice()
              .sort((a, b) => b.payments - a.payments)
              .slice(0, 5)
              .map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{c.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.reference} · {c.placement}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold">
                    {c.payments}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-lg font-bold">Recent payments</h2>
          <Link
            to="/transactions"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            All transactions <ArrowUpRight className="size-3" />
          </Link>
        </div>
        <ul className="divide-y divide-border">
          {all.slice(0, 8).map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{t.item}</p>
                <p className="text-xs text-muted-foreground">
                  {dateTime(t.createdAt)} · {methodLabel(t.method)} · {t.reference}
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-sm font-bold">{zar(t.amountCents)}</p>
                <StatusPill status={t.status} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}

export function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    success: "bg-success/12 text-success",
    pending: "bg-warning/15 text-warning-foreground",
    failed: "bg-destructive/12 text-destructive",
  };
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${styles[status] ?? "bg-secondary"}`}
    >
      {status}
    </span>
  );
}
