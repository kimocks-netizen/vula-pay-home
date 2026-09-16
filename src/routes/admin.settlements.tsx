import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { AdminCard, AdminShell, tableWrap, td, th } from "@/components/AdminShell";
import { ChartPanel, axisTick, tooltipStyle } from "@/components/AdminCharts";
import { api } from "@/lib/api/client";
import { dateTime, zar, zarShort } from "@/lib/format";


export const Route = createFileRoute("/admin/settlements")({
  head: () => ({
    meta: [
      { title: "Settlement monitoring — Scan2Pay admin" },
      {
        name: "description",
        content: "Track what Scan2Pay owes each business, what has already been paid out and on which cycle.",
      },
      { property: "og:title", content: "Settlement monitoring — Scan2Pay admin" },
      { property: "og:description", content: "Pending and settled payouts per business." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminSettlements,
});

function AdminSettlements() {
  const { data: rows } = useQuery({
    queryKey: ["admin", "settlements"],
    queryFn: api.adminSettlements,
  });

  const list = rows ?? [];
  const pending = list.reduce((s, r) => s + r.pendingCents, 0);
  const settled = list.reduce((s, r) => s + r.settledCents, 0);

  return (
    <AdminShell title="Settlements" subtitle="Money owed to businesses and what has already gone out">
      <div className="grid gap-3 sm:grid-cols-3">
        <AdminCard label="Awaiting payout" value={zar(pending)} hint="Next batch run" />
        <AdminCard label="Settled to date" value={zar(settled)} />
        <AdminCard label="Businesses" value={String(list.length)} />
      </div>

      <div className="mt-4">
        <ChartPanel title="Pending vs settled per business" hint="Rand value owed and already paid out" height={300}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={list.map((r) => ({
                name: r.merchantName,
                pending: r.pendingCents / 100,
                settled: r.settledCents / 100,
              }))}
              margin={{ left: 0, right: 8, top: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ ...axisTick, fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval={0}
                tickFormatter={(v: string) => (v.length > 14 ? `${v.slice(0, 13)}…` : v)}
              />
              <YAxis
                width={62}
                tick={axisTick}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => zarShort(v * 100)}
              />
              <Tooltip
                cursor={{ fill: "var(--color-secondary)" }}
                contentStyle={tooltipStyle}
                formatter={(v, n) => [zar(Number(v) * 100), n === "pending" ? "Pending" : "Settled"]}
              />
              <Legend
                iconType="circle"
                formatter={(v) => (
                  <span className="text-xs text-muted-foreground capitalize">{v}</span>
                )}
              />
              <Bar dataKey="pending" fill="var(--color-chart-4)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="settled" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>



      <div className={`mt-4 ${tableWrap}`}>
        <table className="w-full">
          <thead className="border-b border-border">
            <tr>
              <th className={th}>Business</th>
              <th className={th}>Cycle</th>
              <th className={th}>Payments</th>
              <th className={th}>Pending</th>
              <th className={th}>Settled</th>
              <th className={th}>Last payment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {list.map((r) => (
              <tr key={r.merchantId}>
                <td className={`${td} font-medium`}>{r.merchantName}</td>
                <td className={td}>{r.cycle}</td>
                <td className={td}>{r.payments}</td>
                <td className={`${td} font-semibold`}>{zar(r.pendingCents)}</td>
                <td className={td}>{zar(r.settledCents)}</td>
                <td className={`${td} text-muted-foreground`}>
                  {r.lastPaymentAt ? dateTime(r.lastPaymentAt) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        Payouts run automatically on each business's cycle. A payment becomes settled once the bank
        confirms the batch — nothing here can be paid out twice.
      </p>
    </AdminShell>
  );
}
