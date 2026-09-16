import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AdminCard, AdminShell, tableWrap, td, th } from "@/components/AdminShell";
import { ChartPanel, axisTick, byDay, chartPalette, tooltipStyle } from "@/components/AdminCharts";
import { StatusPill } from "@/routes/dashboard";
import { api } from "@/lib/api/client";
import { dateTime, methodLabel, zar, zarShort } from "@/lib/format";


export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin overview — Scan2Pay" },
      {
        name: "description",
        content: "Platform-wide volume, platform fees, settlements and merchant health for Scan2Pay staff.",
      },
      { property: "og:title", content: "Admin overview — Scan2Pay" },
      { property: "og:description", content: "Volume, fees and settlement health across every Scan2Pay account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminOverview,
});

function AdminOverview() {
  const { data: stats } = useQuery({ queryKey: ["admin", "stats"], queryFn: api.adminStats });
  const { data: txns } = useQuery({
    queryKey: ["admin", "transactions"],
    queryFn: api.adminListTransactions,
  });
  const { data: merchants } = useQuery({
    queryKey: ["admin", "merchants"],
    queryFn: api.adminListMerchants,
  });

  const recent = (txns ?? []).slice(0, 8);
  const byMerchant = new Map((merchants ?? []).map((m) => [m.id, m.businessName]));

  const all = useMemo(() => txns ?? [], [txns]);

  const daily = useMemo(
    () =>
      byDay(all, 14).map((d) => {
        const ok = d.items.filter((t) => t.status === "success");
        return {
          label: d.label,
          volume: ok.reduce((s, t) => s + t.amountCents, 0) / 100,
          platform: ok.reduce((s, t) => s + t.platformFeeCents, 0) / 100,
          provider: ok.reduce((s, t) => s + t.providerFeeCents, 0) / 100,
          payments: ok.length,
          failed: d.items.filter((t) => t.status === "failed").length,
        };
      }),
    [all],
  );

  const methodMix = useMemo(() => {
    const ok = all.filter((t) => t.status === "success");
    return (["card", "apple_pay", "google_pay"] as const)
      .map((m) => ({
        name: methodLabel(m),
        value: ok.filter((t) => t.method === m).reduce((s, t) => s + t.amountCents, 0) / 100,
      }))
      .filter((m) => m.value > 0);
  }, [all]);

  const topMerchants = useMemo(() => {
    const totals = new Map<string, number>();
    for (const t of all) {
      if (t.status !== "success") continue;
      totals.set(t.merchantId, (totals.get(t.merchantId) ?? 0) + t.amountCents);
    }
    return [...totals.entries()]
      .map(([id, cents]) => ({
        name: byMerchant.get(id) ?? id,
        value: cents / 100,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all, merchants]);

  const maxMerchant = topMerchants[0]?.value ?? 0;


  return (
    <AdminShell title="Platform overview" subtitle="Everything happening across Scan2Pay">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminCard
          label="Processed volume"
          value={stats ? zar(stats.volumeCents) : "—"}
          hint={stats ? `${stats.payments} successful payments` : undefined}
        />
        <AdminCard
          label="Platform revenue"
          value={stats ? zar(stats.platformRevenueCents) : "—"}
          hint="Fees earned by Scan2Pay"
        />
        <AdminCard
          label="Provider fees"
          value={stats ? zar(stats.providerFeesCents) : "—"}
          hint="Paid to Paystack"
        />
        <AdminCard
          label="Awaiting settlement"
          value={stats ? zar(stats.pendingSettlementCents) : "—"}
          hint="Owed to merchants"
        />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminCard
          label="Businesses"
          value={stats ? String(stats.merchants) : "—"}
          hint={stats ? `${stats.activeMerchants} active` : undefined}
        />
        <AdminCard label="Users" value={stats ? String(stats.users) : "—"} hint="Excluding staff" />
        <AdminCard label="Payment codes" value={stats ? String(stats.codes) : "—"} hint="Printable codes" />
        <AdminCard
          label="Failed payments"
          value={stats ? String(stats.failedPayments) : "—"}
          hint="Needs monitoring"
        />
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-[1.6fr_1fr]">
        <ChartPanel title="Processed volume" hint="Last 14 days, successful payments only" height={280}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={daily} margin={{ left: 0, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="volFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis
                width={64}
                tick={axisTick}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => zarShort(v * 100)}
              />
              <Tooltip
                cursor={{ stroke: "var(--color-border)" }}
                contentStyle={tooltipStyle}
                formatter={(v) => [zar(Number(v) * 100), "Volume"]}
              />
              <Area
                type="monotone"
                dataKey="volume"
                stroke="var(--color-chart-1)"
                strokeWidth={2}
                fill="url(#volFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Payment method mix" hint="Share of volume" height={280}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={methodMix} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={3}>
                {methodMix.map((_, i) => (
                  <Cell key={i} fill={chartPalette[i % chartPalette.length]} />
                ))}
              </Pie>
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                formatter={(v) => <span className="text-xs text-muted-foreground">{v}</span>}
              />
              <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [zar(Number(v) * 100), String(n)]} />
            </PieChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <ChartPanel title="Fee revenue vs provider cost" hint="Daily, last 14 days">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={daily} margin={{ left: 0, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis
                width={56}
                tick={axisTick}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => zarShort(v * 100)}
              />
              <Tooltip
                cursor={{ fill: "var(--color-secondary)" }}
                contentStyle={tooltipStyle}
                formatter={(v, n) => [zar(Number(v) * 100), n === "platform" ? "Platform fee" : "Provider fee"]}
              />
              <Bar dataKey="platform" stackId="f" fill="var(--color-chart-1)" />
              <Bar dataKey="provider" stackId="f" fill="var(--color-chart-3)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Top businesses by volume" hint="All time">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topMerchants} layout="vertical" margin={{ left: 8, right: 16, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
              <XAxis
                type="number"
                tick={axisTick}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => zarShort(v * 100)}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={axisTick}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: string) => (v.length > 16 ? `${v.slice(0, 15)}…` : v)}
              />
              <Tooltip
                cursor={{ fill: "var(--color-secondary)" }}
                contentStyle={tooltipStyle}
                formatter={(v) => [zar(Number(v) * 100), "Volume"]}
              />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {topMerchants.map((d, i) => (
                  <Cell
                    key={i}
                    fill={d.value === maxMerchant ? "var(--color-chart-1)" : "var(--color-chart-2)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>

      <div className="mt-3">
        <ChartPanel title="Payments vs failures" hint="Count per day, last 14 days" height={220}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={daily} margin={{ left: 0, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis width={40} tick={axisTick} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v, n) => [String(v), n === "payments" ? "Successful" : "Failed"]}
              />
              <Line type="monotone" dataKey="payments" stroke="var(--color-chart-1)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="failed" stroke="var(--color-flare)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>



      <div className="mt-6 flex items-center justify-between">
        <h2 className="font-display text-base font-bold">Latest payments</h2>
        <Link to="/admin/transactions" className="text-sm font-semibold text-primary hover:underline">
          View all
        </Link>
      </div>

      <div className={`mt-3 ${tableWrap}`}>
        <table className="w-full">
          <thead className="border-b border-border">
            <tr>
              <th className={th}>Reference</th>
              <th className={th}>Business</th>
              <th className={th}>Amount</th>
              <th className={th}>Platform fee</th>
              <th className={th}>Status</th>
              <th className={th}>When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {recent.map((t) => (
              <tr key={t.id}>
                <td className={`${td} font-medium`}>{t.reference}</td>
                <td className={td}>{byMerchant.get(t.merchantId) ?? t.merchantId}</td>
                <td className={`${td} font-semibold`}>{zar(t.amountCents)}</td>
                <td className={td}>
                  {zarShort(t.platformFeeCents)}
                  {t.pricing ? (
                    <span className="ml-1 text-xs text-muted-foreground">v{t.pricing.version}</span>
                  ) : null}
                </td>
                <td className={td}>
                  <StatusPill status={t.status} />
                </td>
                <td className={`${td} text-muted-foreground`}>{dateTime(t.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
