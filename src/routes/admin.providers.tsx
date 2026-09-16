import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AdminCard, AdminShell, tableWrap, td, th } from "@/components/AdminShell";
import { ChartPanel, axisTick, byDay, chartPalette, tooltipStyle } from "@/components/AdminCharts";
import { api } from "@/lib/api/client";
import { dateTime, zar, zarShort } from "@/lib/format";


export const Route = createFileRoute("/admin/providers")({
  head: () => ({
    meta: [
      { title: "Payment provider — Scan2Pay admin" },
      {
        name: "description",
        content: "Monitor the Paystack integration: method mix, failures, provider fees and webhook health.",
      },
      { property: "og:title", content: "Payment provider — Scan2Pay admin" },
      { property: "og:description", content: "Paystack health, method mix and provider fee totals." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminProviders,
});

function AdminProviders() {
  const { data: txns } = useQuery({
    queryKey: ["admin", "transactions"],
    queryFn: api.adminListTransactions,
  });
  const { data: pricing } = useQuery({ queryKey: ["pricing"], queryFn: api.getPricing });

  const all = txns ?? [];
  const success = all.filter((t) => t.status === "success");
  const failed = all.filter((t) => t.status === "failed");
  const rate = all.length ? Math.round((success.length / all.length) * 1000) / 10 : 0;

  const methods = (["card", "apple_pay", "google_pay"] as const).map((m) => {
    const mine = success.filter((t) => t.method === m);
    return {
      method: m === "card" ? "Card" : m === "apple_pay" ? "Apple Pay" : "Google Pay",
      count: mine.length,
      volume: mine.reduce((s, t) => s + t.amountCents, 0),
      fees: mine.reduce((s, t) => s + t.providerFeeCents, 0),
    };
  });

  const daily = byDay(all, 14).map((d) => {
    const ok = d.items.filter((t) => t.status === "success").length;
    const bad = d.items.filter((t) => t.status === "failed").length;
    return {
      label: d.label,
      rate: ok + bad ? Math.round((ok / (ok + bad)) * 1000) / 10 : 100,
      fees: d.items.reduce((s, t) => (t.status === "success" ? s + t.providerFeeCents : s), 0) / 100,
    };
  });

  return (
    <AdminShell title="Payment provider" subtitle="Paystack — the only route money takes">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminCard label="Success rate" value={`${rate}%`} hint={`${all.length} attempts`} />
        <AdminCard label="Failed payments" value={String(failed.length)} hint="Last 30 days" />
        <AdminCard
          label="Provider fees"
          value={zar(success.reduce((s, t) => s + t.providerFeeCents, 0))}
        />
        <AdminCard
          label="Current assumption"
          value={pricing ? `${pricing.providerPercent}% + ${zar(pricing.providerFixedCents)}` : "—"}
          hint="Used in fee estimates"
        />
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-2">
        <ChartPanel title="Success rate" hint="Percent of attempts that went through, last 14 days">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={daily} margin={{ left: 0, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis
                width={48}
                domain={[0, 100]}
                tick={axisTick}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, "Success rate"]} />
              <Line type="monotone" dataKey="rate" stroke="var(--color-chart-1)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Volume by method" hint="Successful payments">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={methods} margin={{ left: 0, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="method" tick={axisTick} tickLine={false} axisLine={false} />
              <YAxis
                width={60}
                tick={axisTick}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => zarShort(v)}
              />
              <Tooltip
                cursor={{ fill: "var(--color-secondary)" }}
                contentStyle={tooltipStyle}
                formatter={(v) => [zar(Number(v)), "Volume"]}
              />
              <Bar dataKey="volume" radius={[8, 8, 0, 0]}>
                {methods.map((_, i) => (
                  <Cell key={i} fill={chartPalette[i % chartPalette.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>



      <h2 className="mt-6 font-display text-base font-bold">Method mix</h2>
      <div className={`mt-3 ${tableWrap}`}>
        <table className="w-full">
          <thead className="border-b border-border">
            <tr>
              <th className={th}>Method</th>
              <th className={th}>Payments</th>
              <th className={th}>Volume</th>
              <th className={th}>Provider fees</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {methods.map((m) => (
              <tr key={m.method}>
                <td className={`${td} font-medium`}>{m.method}</td>
                <td className={td}>{m.count}</td>
                <td className={`${td} font-semibold`}>{zar(m.volume)}</td>
                <td className={td}>{zar(m.fees)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-6 font-display text-base font-bold">Recent failures</h2>
      <div className={`mt-3 ${tableWrap}`}>
        <table className="w-full">
          <thead className="border-b border-border">
            <tr>
              <th className={th}>Reference</th>
              <th className={th}>Amount</th>
              <th className={th}>Method</th>
              <th className={th}>When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {failed.slice(0, 10).map((t) => (
              <tr key={t.id}>
                <td className={`${td} font-medium`}>{t.reference}</td>
                <td className={td}>{zar(t.amountCents)}</td>
                <td className={td}>{t.method}</td>
                <td className={`${td} text-muted-foreground`}>{dateTime(t.createdAt)}</td>
              </tr>
            ))}
            {failed.length === 0 ? (
              <tr>
                <td className={`${td} text-muted-foreground`} colSpan={4}>
                  No failed payments.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-secondary/40 p-5 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">Integration</p>
        <p className="mt-1">
          Provider keys and the webhook endpoint live in server configuration, never in this console.
          Changing the fee assumption above is done by publishing a new pricing version.
        </p>
      </div>
    </AdminShell>
  );
}
