import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { AppShell } from "@/components/AppShell";
import { api } from "@/lib/api/client";
import { useAuth } from "@/lib/auth";
import { methodLabel, zar, zarShort } from "@/lib/format";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — ScanPay" },
      {
        name: "description",
        content: "Sales by payment code, payment method mix and fee breakdown for your ScanPay account.",
      },
      { property: "og:title", content: "Reports — ScanPay" },
      { property: "og:description", content: "Sales by code, method mix and fees." },
    ],
  }),
  component: ReportsPage,
});

const palette = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"];

function ReportsPage() {
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
  const { data: pricing } = useQuery({ queryKey: ["pricing"], queryFn: () => api.getPricing() });

  const success = (txns ?? []).filter((t) => t.status === "success");

  const byCode = (codes ?? []).map((c) => ({
    name: c.label.length > 18 ? `${c.label.slice(0, 18)}…` : c.label,
    value: success.filter((t) => t.paymentCodeId === c.id).reduce((s, t) => s + t.amountCents, 0) / 100,
  }));

  const methodMap = new Map<string, number>();
  success.forEach((t) => methodMap.set(t.method, (methodMap.get(t.method) ?? 0) + t.amountCents));
  const byMethod = [...methodMap.entries()].map(([k, v]) => ({ name: methodLabel(k), value: v / 100 }));

  const topValue = byCode.reduce((m, d) => Math.max(m, d.value), 0);

  const gross = success.reduce((s, t) => s + t.amountCents, 0);
  const platformFees = success.reduce((s, t) => s + t.platformFeeCents, 0);
  const providerFees = success.reduce((s, t) => s + t.providerFeeCents, 0);

  return (
    <AppShell title="Reports" subtitle="Where your money comes from, and what it costs to collect it.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { l: "Gross sales", v: zar(gross), cost: false },
          { l: "Platform fees", v: `- ${zar(platformFees)}`, cost: true },
          { l: `${pricing?.provider ?? "Provider"} fees`, v: `- ${zar(providerFees)}`, cost: true },
          { l: "Net to you", v: zar(gross - platformFees - providerFees), cost: false },
        ].map((s) => (
          <div
            key={s.l}
            className={`relative overflow-hidden rounded-2xl border border-border bg-card p-5 ${
              s.cost ? "before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-flare" : ""
            }`}
          >
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              {s.cost ? <span className="size-1.5 rounded-full bg-flare" /> : null}
              {s.l}
            </p>
            <p className={`mt-2 font-display text-2xl font-bold ${s.cost ? "text-flare" : ""}`}>{s.v}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-lg font-bold">Sales by payment code</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            <span className="mr-1.5 inline-block size-1.5 -translate-y-px rounded-full bg-flare align-middle" />
            Best performing code
          </p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCode} margin={{ left: 0, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  tickFormatter={(v: string) => (v.length > 10 ? `${v.slice(0, 9)}…` : v)}
                />
                <YAxis
                  width={64}
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => zarShort(v * 100)}
                />
                <Tooltip
                  cursor={{ fill: "var(--color-secondary)" }}
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(v) => [zar(Number(v) * 100), "Sales"]}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="var(--color-chart-1)">
                  {byCode.map((d, i) => (
                    <Cell key={i} fill={d.value === topValue && topValue > 0 ? "var(--color-flare)" : "var(--color-chart-1)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-display text-lg font-bold">Payment method mix</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byMethod} dataKey="value" nameKey="name" innerRadius={62} outerRadius={100} paddingAngle={3}>
                  {byMethod.map((_, i) => (
                    <Cell key={i} fill={palette[i % palette.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(v, n) => [zar(Number(v) * 100), String(n)]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-1.5 text-sm">
            {byMethod.map((m, i) => (
              <li key={m.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="size-2.5 rounded-full" style={{ background: palette[i % palette.length] }} />
                  {m.name}
                </span>
                <span className="font-medium">{zar(m.value * 100)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
